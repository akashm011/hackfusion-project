import mongoose from "mongoose";

// Candidate sub-schema
const candidateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    unique: true, // Ensure a student cannot be added twice for a position
  },
  manifesto: {
    type: String,
    default: "",
  },
  votes: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Track who has voted
});

// Position sub-schema
const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  candidates: [candidateSchema],
});

// Main Election schema
const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true, // Ensure duplicate elections are not created
    },
    startDate: Date,
    endDate: Date,
    positions: [positionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Election = mongoose.model("Election", electionSchema);
export default Election;
