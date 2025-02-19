import express from "express";
import {
  createElection,
  addCandidate,
  castVote,
  requestVoteOTP,
  getResults,
  getPositionVotes,
  getCandidateVotes,
} from "../controllers/election.controller.js";
import {
  verifyToken,
  verifyAdmin,
  verifyStudent,
} from "../middlewares/auth.middlware.js";

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, createElection);
router.post("/candidate", verifyToken, verifyAdmin, addCandidate);
router.post("/vote/request-otp", requestVoteOTP);
router.post("/vote", verifyStudent, castVote);
router.get("/:electionId/results", getResults);
// Route to get real-time votes for all candidates in a specific position
router.get("/:electionId/positions/:positionName/votes", getPositionVotes);

// Route to get the number of votes for a specific candidate in a specific position
router.get(
  "/:electionId/positions/:positionName/candidate/:candidateName/votes",
  getCandidateVotes
);

export default router;
