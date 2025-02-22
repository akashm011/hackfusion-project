import express from "express";
import {
  createBudget,
  getBudgets,
  getBudgetById,
  createExpenseLog,
  getExpenseLogs,
  getAllExpenseLogs,
  updateBudgetStatus,
} from "../controllers/budget.controller.js";
import {
  verifyToken,
  verifyFacultyOrAdmin,
  verifyStudentOrFaculty,
  verifyAdmin,
} from "../middlewares/auth.middlware.js";

import { upload } from "../middlewares/multer.middlware.js";

const router = express.Router();

// Inline middleware to allow student, faculty, and admin to view budgets
const verifyStudentFacultyAdmin = (req, res, next) =>
  verifyToken(req, res, next, ["student", "faculty", "admin"]);

// GET /budgets
// Accessible to students, faculty, and admin
router.get("/all", verifyStudentFacultyAdmin, getBudgets);

// GET /budgets/:id
// Accessible to students, faculty, and admin
router.get("/:id", verifyStudentFacultyAdmin, getBudgetById);

// POST /budgets
// Only faculty and admin can create a budget allocation
router.post("/add", verifyStudentOrFaculty, createBudget);

// POST /budgets/:id/expenses
// Only faculty and admin can add expense logs
// router.post("/:id", verifyFacultyOrAdmin,upload.single("proof"), createExpenseLog);
router.post("/:id", verifyFacultyOrAdmin, createExpenseLog);


// GET /budgets/:id/expenses
// Accessible to students, faculty, and admin
router.get("/:id/expenses", verifyStudentFacultyAdmin, getExpenseLogs);

router.get("/expenses/all", verifyStudentFacultyAdmin, getAllExpenseLogs);

router.put("/update-status", verifyStudentFacultyAdmin, updateBudgetStatus);

export default router;
