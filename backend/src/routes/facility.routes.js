import express from 'express';
import { createFacility, getFacilities } from '../controllers/facility.controller.js';
import { verifyAdmin } from '../middlewares/auth.middlware.js';

const router = express.Router();

// Route to create a facility (only admin can create)
router.post('/', verifyAdmin, createFacility);

// Route to list all facilities
router.get('/', getFacilities);

export default router;
