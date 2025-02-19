import Election from "../models/election.model.js";
import Student from "../models/students.model.js";
import base64url from "base64url"; // Import Base64 URL-safe encoding
import { verifyOTP, sendOTPEmail } from "../utils/emailServiceOTP.js";

export const createElection = async (req, res) => {
  try {
    const { title, startDate, endDate, positions } = req.body;

    // Check if election already exists
    const existingElection = await Election.findOne({ title });
    if (existingElection) {
      return res.status(400).json({ message: "Election already exists" });
    }

    const newElection = new Election({
      title,
      startDate,
      endDate,
      positions,
    });

    await newElection.save();

    // Encode the electionId using Base64 URL encoding
    const encodedElectionId = base64url(newElection._id.toString());

    return res.status(201).json({
      message: "Election created successfully",
      election: newElection,
      electionId: encodedElectionId, // Obfuscated ID
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Add a candidate to a specific position.
 */
export const addCandidate = async (req, res) => {
  try {
    const { electionId, positionName, email, manifesto } = req.body;

    // Decode the electionId before using it
    const decodedElectionId = base64url.decode(electionId);
    const election = await Election.findById(decodedElectionId);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const position = election.positions.find(
      (pos) => pos.name === positionName
    );
    if (!position) {
      return res
        .status(404)
        .json({ message: "Position not found in this election" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Ensure candidate is not already added to this position
    const existingCandidate = position.candidates.find((cand) =>
      cand.student.equals(student._id)
    );
    if (existingCandidate) {
      return res
        .status(400)
        .json({ message: "Candidate already exists for this position" });
    }

    position.candidates.push({
      student: student._id,
      manifesto,
    });

    await election.save();
    return res
      .status(201)
      .json({ message: "Candidate added successfully", election });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Cast a vote for a candidate.
 * Expects: { electionId, positionName, candidateName }
 */

export const requestVoteOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email.endsWith("@sggs.ac.in")) {
      return res
        .status(403)
        .json({ message: "Only college-authenticated users can request OTP" });
    }

    await sendOTPEmail(email);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const castVote = async (req, res) => {
  try {
    const { electionId, positionName, candidateName, otp } = req.body;

    // Get the authenticated voter's email from req.user
    const voterEmail = req.user.email;
    if (!voterEmail.endsWith("@sggs.ac.in")) {
      return res
        .status(403)
        .json({ message: "Only college-authenticated users can vote" });
    }

    // Verify the OTP using the voter's email
    if (!verifyOTP(voterEmail, otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Find the voter (we assume the voter exists since they're authenticated)
    const voter = await Student.findOne({ email: voterEmail });
    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }
    const voterId = voter._id;

    // Decode the electionId before querying the database
    const decodedElectionId = base64url.decode(electionId);
    const election = await Election.findById(decodedElectionId).populate(
      "positions.candidates.student"
    );
    if (!election || !election.isActive) {
      return res
        .status(400)
        .json({ message: "Election not found or not active" });
    }

    // Find the specified position in the election
    const position = election.positions.find(
      (pos) => pos.name === positionName
    );
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Safely search for the candidate by candidate name (case-insensitive)
    const normalizedCandidateName = candidateName.trim().toLowerCase();
    // console.log(normalizedCandidateName + "normalized student name");

    const candidate = position.candidates.find((cand) => {
      const storedName = cand.student.name || "";
      console.log(storedName);
      return storedName.trim().toLowerCase() === normalizedCandidateName;
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Ensure the voter hasn't already voted in this position
    const alreadyVoted = position.candidates.some((cand) =>
      cand.voters.includes(voterId)
    );
    if (alreadyVoted) {
      return res
        .status(400)
        .json({ message: "You have already voted for this position" });
    }

    // Record the vote: increment the candidate's vote count and record the voter's ID
    candidate.votes += 1;
    candidate.voters.push(voterId);

    await election.save();
    return res.status(200).json({ message: "Vote cast successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get live results for an election.
 */
export const getResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const decodedElectionId = base64url.decode(electionId);
    const election = await Election.findById(decodedElectionId).populate(
      "positions.candidates.student"
    );

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const results = election.positions.map((position) => ({
      position: position.name,
      candidates: position.candidates.sort((a, b) => b.votes - a.votes),
    }));

    return res.status(200).json({ election: election.title, results });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get the number of votes for a specific position.
 */
export const getPositionVotes = async (req, res) => {
  try {
    const { electionId, positionName } = req.params;
    const decodedElectionId = base64url.decode(electionId);
    const election = await Election.findById(decodedElectionId).populate(
      "positions.candidates.student"
    );

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const position = election.positions.find(
      (pos) => pos.name === positionName
    );
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    const results = position.candidates.map((cand) => ({
      candidate: cand.student.name,
      votes: cand.votes,
    }));

    return res.status(200).json({ position: positionName, results });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get the vote count for a specific candidate in a given position.
 *
 * Expects in req.params:
 *  - electionId (Base64 encoded)
 *  - positionName
 *  - candidateName
 *
 * Returns: { candidate, votes }
 */
export const getCandidateVotes = async (req, res) => {
  try {
    const { electionId, positionName, candidateName } = req.params;
    const decodedElectionId = base64url.decode(electionId);
    const election = await Election.findById(decodedElectionId).populate(
      "positions.candidates.student"
    );

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const position = election.positions.find(
      (pos) => pos.name === positionName
    );
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Safely search for the candidate by name (case-insensitive, trimming whitespace)
    const normalizedCandidateName = candidateName.trim().toLowerCase();
    const candidate = position.candidates.find((cand) => {
      const storedName = cand.student.name || "";
      return storedName.trim().toLowerCase() === normalizedCandidateName;
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    return res.status(200).json({
      candidate: candidate.student.name,
      votes: candidate.votes,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
