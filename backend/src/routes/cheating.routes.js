import express from "express";
import {
  addCheatingRecord,
  getCheatingRecords,
  deleteCheatingRecord,
} from "../controllers/cheating.controller.js";
import { verifyFaculty, verifyFacultyOrAdmin } from "../middlewares/auth.middlware.js";
import { upload } from "../middlewares/multer.middlware.js";

const router = express.Router();

// Route to add a cheating record (Only faculty can add)
router.post("/add", verifyFaculty,upload.single("proof"), addCheatingRecord);

// Route to get all cheating records (Public)
router.get("/all", getCheatingRecords);

// Route to delete a cheating record (Only admin can delete)
router.delete("/delete/:id", verifyFacultyOrAdmin, deleteCheatingRecord);

export default router;
