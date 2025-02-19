import jwt from "jsonwebtoken";
import Student from "../models/students.model.js";
import Faculty from "../models/faculty.model.js";
import Admin from "../models/admin.model.js";
import Doctor from "../models/doctor.model.js";

// Generic Auth Middleware
export const verifyToken = async (req, res, next, allowedRoles) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

   
    if (!token)
      return res
        .status(401)
        .json({ message: "Access Denied. No token provided." });



    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = null;
    


    if (allowedRoles.includes("student"))
      user = await Student.findById(decoded.studentId);

    if (allowedRoles.includes("faculty") && !user)
      user = await Faculty.findById(decoded.id);
    if (allowedRoles.includes("admin") && !user)
      user = await Admin.findById(decoded.id);
    if (allowedRoles.includes("doctor") && !user)
      user = await Doctor.findById(decoded.id);

    if (!user || !allowedRoles.includes(user.role)) {
      return res
        .status(403)
        .json({ message: "Access Denied. Insufficient permissions." });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token." });
  }
};


// Middleware for each role
export const verifyStudent = (req, res, next) =>
  verifyToken(req, res, next, ["student"]);

export const verifyDoctor = (req, res, next) =>
  verifyToken(req, res, next, ["doctor"]);

export const verifyFaculty = (req, res, next) =>
  verifyToken(req, res, next, ["faculty"]);

export const verifyAdmin = (req, res, next) =>
  verifyToken(req, res, next, ["admin"]);

// Middleware to allow only Faculty & Admin
export const verifyFacultyOrAdmin = (req, res, next) =>
  verifyToken(req, res, next, ["faculty", "admin"]);


// Middleware for booking creation (only Students and Faculty can book)
export const verifyStudentOrFaculty = (req, res, next) =>
  verifyToken(req, res, next, ["student", "faculty"]);