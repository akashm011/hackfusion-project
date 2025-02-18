import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  approveBooking,
  rejectBooking,
  listFacilities,
} from '../controllers/booking.controller.js';
import { verifyFacultyOrAdmin, verifyStudentOrFaculty } from '../middlewares/auth.middlware.js'; 

const router = express.Router();

// Route to list all available facilities
router.get('/facilities', verifyStudentOrFaculty, listFacilities);

// Route to create a booking (accessible by Faculty and Students)
router.post('/bookings', verifyStudentOrFaculty, createBooking);

// Route to retrieve bookings; non-admins see their own, admin sees all
router.get('/bookings', verifyStudentOrFaculty, getBookings);

// Route to get details of a specific booking
router.get('/bookings/:id', verifyStudentOrFaculty, getBooking);

// Admin-only route to approve a booking
router.put('/:id/approve', verifyFacultyOrAdmin, approveBooking);

// Admin-only route to reject a booking
router.put('/bookings/:id/reject', verifyStudentOrFaculty, rejectBooking);

export default router;
