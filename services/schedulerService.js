const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const emailService = require('./emailService');

class SchedulerService {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize the scheduler
  init() {
    if (this.isInitialized) return;
    
    console.log('Initializing appointment scheduler (voice reminders disabled)...');
    
    // Schedule daily reminder check at 9 AM
    cron.schedule('0 9 * * *', () => {
      this.sendDailyReminders();
    }, {
      timezone: 'Asia/Kolkata'
    });

    // Schedule hourly check for upcoming appointments (within 24 hours)
    cron.schedule('0 * * * *', () => {
      this.checkUpcomingAppointments();
    }, {
      timezone: 'Asia/Kolkata'
    });

    this.isInitialized = true;
    console.log('Appointment scheduler initialized (voice reminders disabled)');
  }

  // Send daily reminders for appointments happening tomorrow
  async sendDailyReminders() {
    try {
      console.log('Checking for appointments tomorrow...');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const appointments = await Appointment.find({
        date: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        },
        status: { $in: ['pending', 'confirmed'] }
      }).populate([
        {
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'name email phone'
          }
        },
        {
          path: 'patient',
          select: 'name email phone'
        }
      ]);

      console.log(`Found ${appointments.length} appointments for tomorrow`);

      console.log(`Found ${appointments.length} appointments for tomorrow - voice reminders disabled`);
    } catch (error) {
      console.error('Error sending daily reminders:', error);
    }
  }

  // Check for appointments happening within 24 hours
  async checkUpcomingAppointments() {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments = await Appointment.find({
        date: {
          $gte: now,
          $lte: tomorrow
        },
        status: { $in: ['pending', 'confirmed'] }
      }).populate([
        {
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'name email phone'
          }
        },
        {
          path: 'patient',
          select: 'name email phone'
        }
      ]);

      console.log(`Found ${appointments.length} upcoming appointments - voice reminders disabled`);
    } catch (error) {
      console.error('Error checking upcoming appointments:', error);
    }
  }








}

module.exports = new SchedulerService(); 