import Facility from '../models/facility.model.js';

// Create a new facility (Admin only)
export const createFacility = async (req, res) => {
  try {
    const { name, location, description, status } = req.body;
    
    // Optionally: Check if a facility with the same name already exists
    const existing = await Facility.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Facility with this name already exists' });
    }

    const facility = new Facility({
      name,
      location,
      description,
      status: status || 'available',
    });

    const savedFacility = await facility.save();
    // console.log("in the facility controller" + savedFacility);
    res.status(201).json(savedFacility);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all facilities (Accessible to all authenticated users)
export const getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.status(200).json(facilities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
