import CheatingRecord from "../models/cheatingrecord.model.js";
import Student from "../models/students.model.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js'; // Ensure correct path


export const addCheatingRecord = async (req, res) => {
  try {
    const { registrationNumber, reason, examName } = req.body;

    // Ensure only faculty can report cheating cases
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Only faculty can report cheating cases" });
    }

    // Construct the student's email using the registration number
    const studentEmail = `${registrationNumber}@sggs.ac.in`;

    // Find the student using the email
    const student = await Student.findOne({ email: studentEmail });

    if (!student) {
      return res.status(404).json({ error: "Student not found with this registration number" });
    }

    let proofUrl = "";

    // Check if a file was uploaded
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

      if (!cloudinaryResponse) {
        return res.status(500).json({ error: "File upload failed. Please try again." });
      }

      // If Cloudinary flagged the content as inappropriate, return an error
      if (cloudinaryResponse.error) {
        return res.status(400).json({ error: "Inappropriate image or video detected. Please upload a valid proof." });
      }

      proofUrl = cloudinaryResponse.secure_url;
    }

    // Create a new cheating record
    const newRecord = new CheatingRecord({
      student: student._id,
      reason,
      reportedBy: req.user._id, // Faculty ID
      examName,
      registrationNumber,
      proofUrl, // Store Cloudinary image URL
    });

    await newRecord.save();

    res.status(201).json({ message: "Cheating record added successfully", record: newRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all cheating records (Public for all students & faculty)
export const getCheatingRecords = async (req, res) => {
  try {
    const records = await CheatingRecord.find()
      .populate("student", "name email")
      .populate("reportedBy", "name email");

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a cheating record (Admin only)
export const deleteCheatingRecord = async (req, res) => {
  try {
    // Check if user is neither admin nor faculty
    if (req.user.role !== "admin" && req.user.role !== "faculty") {
      return res.status(403).json({ 
        error: "Only admins and faculty can delete cheating records" 
      });
    }

    const { id } = req.params;
    await CheatingRecord.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: "Cheating record deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({ 
      error: "Internal Server Error" 
    });
  }
};
