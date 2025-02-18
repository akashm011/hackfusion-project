import mongoose from 'mongoose';

const FacilitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    status: { 
        type: String, 
        enum: ['available', 'booked', 'under_maintenance'], 
        default: 'available' 
    }
}, { timestamps: true });

const Facility = mongoose.model('Facility', FacilitySchema);
export default Facility;
