// backend/src/models/Budget.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const budgetSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["event", "department", "mess"],
      required: true,
    },
    title:{
      type:String,
      default:"For work perpose"
    },
    amount: {
      type: Number,
      required: true,
    },
    allocated_by: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "allocatedByModel",
    },
    allocatedByModel: {
      type: String,
      required: true,
      enum: ["Faculty", "Student"],
    },
    status: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
    // allocated_at: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  { timestamps: true }
);

export default model("Budget", budgetSchema);
