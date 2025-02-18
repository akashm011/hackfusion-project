import cron from 'node-cron';
import Booking from './models/booking.model.js';
import Facility from './models/facility.model.js';

// This cron job runs every minute.
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    
    // Find approved bookings that have passed their end_time
    const expiredBookings = await Booking.find({
      end_time: { $lte: now },
      approval_status: 'approved'
    });

    for (const booking of expiredBookings) {
      // Update the facility's status to 'available'
      await Facility.findByIdAndUpdate(booking.facility, { status: 'available' });
      
      // Optionally, update the booking to mark it as processed
      // e.g., set approval_status to 'completed' or archive it.
    }
  } catch (error) {
    console.error('Error updating facility status:', error);
  }
});

console.log('Scheduler started: checking for expired bookings every minute.');
