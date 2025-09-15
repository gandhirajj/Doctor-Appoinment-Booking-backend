const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User'); // Added User model import
const mongoose = require('mongoose');
const voiceService = require('../services/voiceService');
const emailService = require('../services/emailService');

// @desc    Get appointments for current user or all appointments for admin
// @route   GET /api/appointments
// @access  Public (temporarily)
exports.getAppointments = async (req, res) => {
  try {
    console.log('Getting appointments...');
    console.log('Query parameters:', req.query);
    
    // Get user ID from query parameter (sent by frontend)
    const userId = req.query.userId;
    const isAdmin = req.query.isAdmin === 'true' || req.query.isAdmin === true;
    
    console.log('userId:', userId);
    console.log('isAdmin:', isAdmin);
    console.log('req.query.isAdmin:', req.query.isAdmin);
    console.log('typeof req.query.isAdmin:', typeof req.query.isAdmin);
    
    if (!userId && !isAdmin) {
      console.log('Returning 400 - no userId and not admin');
      return res.status(400).json({
        success: false,
        message: 'User ID is required. Please make sure you are logged in.',
      });
    }

    let appointments;

    if (isAdmin) {
      // Admin can see all appointments
      console.log('Admin request - getting all appointments');
      appointments = await Appointment.find({})
        .populate({
          path: 'doctor',
          select: 'name specialization fees',
          populate: {
            path: 'user',
            select: 'name email phone',
          },
        })
        .populate({
          path: 'patient',
          select: 'name email phone address',
        });
    } else {
      // Verify user exists
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format.',
        });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID. Please login again.',
        });
      }

      // Get appointments for this specific user
      appointments = await Appointment.find({ patient: userId })
        .populate({
          path: 'doctor',
          select: 'name specialization fees',
          populate: {
            path: 'user',
            select: 'name email phone',
          },
        })
        .populate({
          path: 'patient',
          select: 'name email phone address',
        });
    }

    console.log(`Found ${appointments.length} appointments`);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Public (temporarily)
exports.getAppointment = async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required. Please make sure you are logged in.',
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        select: 'name specialization fees',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      })
      .populate({
        path: 'patient',
        select: 'name email phone address',
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment not found with id of ${req.params.id}`,
      });
    }

    // Check if the appointment belongs to the current user
    if (appointment.patient._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own appointments.',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Public (temporarily)
exports.createAppointment = async (req, res) => {
  try {
    console.log('Create appointment request:', req.body);
    
    // For now, we need to provide patient ID in the request
    // In a real app, this would come from the authenticated user
    if (!req.body.patient) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required. Please make sure you are logged in.',
      });
    }

    // Validate that the patient exists
    const patient = await User.findById(req.body.patient);
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID. Please login again.',
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(req.body.doctor);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor not found with id of ${req.body.doctor}`,
      });
    }

    // Check if appointment slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: req.body.doctor,
      date: req.body.date,
      time: req.body.time,
      status: { $ne: 'cancelled' }, // Exclude cancelled appointments
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This appointment slot is already booked',
      });
    }

    console.log('Creating appointment with data:', {
      doctor: req.body.doctor,
      patient: req.body.patient,
      date: req.body.date,
      time: req.body.time
    });

    const appointment = await Appointment.create(req.body);

    console.log('Appointment created successfully:', appointment._id);

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Public (temporarily)
exports.updateAppointment = async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required. Please make sure you are logged in.',
      });
    }

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment not found with id of ${req.params.id}`,
      });
    }

    // Check if the appointment belongs to the current user
    if (appointment.patient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own appointments.',
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Public (temporarily)
exports.deleteAppointment = async (req, res) => {
  try {
    const userId = req.query.userId;
    const isAdmin = req.query.isAdmin === 'true' || req.query.isAdmin === true;
    
    console.log('Delete appointment request:', {
      appointmentId: req.params.id,
      userId: userId,
      isAdmin: isAdmin,
      isAdminType: typeof req.query.isAdmin,
      isAdminValue: req.query.isAdmin,
      query: req.query
    });

    // For admin users, we don't need to validate userId as much
    if (!isAdmin && !userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required. Please make sure you are logged in.',
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment not found with id of ${req.params.id}`,
      });
    }

    console.log('Appointment found:', {
      appointmentId: appointment._id,
      patientId: appointment.patient,
      patientIdString: appointment.patient.toString(),
      userId: userId,
      isAdmin: isAdmin
    });

    // Check if the appointment belongs to the current user or if user is admin
    if (!isAdmin && appointment.patient.toString() !== userId) {
      console.log('Access denied - not admin and appointment does not belong to user');
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own appointments.',
      });
    }

    // Additional check: if user is admin, allow deletion regardless of patient ID
    if (isAdmin) {
      console.log('Admin user deleting appointment - bypassing patient ownership check');
    }

    await appointment.deleteOne();

    console.log('Appointment deleted successfully:', req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Send voice notification for appointment
// @route   POST /api/appointments/:id/send-voice
// @access  Public (temporarily)
exports.sendVoiceNotification = async (req, res) => {
  try {
    console.log('Send voice notification request received for appointment:', req.params.id);
    
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        select: 'name specialization fees',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      })
      .populate({
        path: 'patient',
        select: 'name email phone address',
      });

    console.log('Appointment found:', appointment ? 'Yes' : 'No');
    console.log('Appointment data:', appointment);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Generate voice notification
    console.log('Generating voice notification...');
    const voiceResult = await voiceService.createBookingNotification({
      _id: appointment._id,
      patientName: appointment.patient?.name || 'Patient',
      doctorName: appointment.doctor?.name || 'Doctor',
      date: new Date(appointment.date).toLocaleDateString(),
      time: appointment.time,
      reason: appointment.reason
    });

    console.log('Voice generation result:', voiceResult);

    if (!voiceResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate voice notification',
        error: voiceResult.error
      });
    }

    // Send email with voice attachment
    console.log('Sending email with voice attachment...');
    const emailResult = await emailService.sendEmailWithVoice(
      appointment.patient?.email || 'patient@example.com',
      appointment.patient?.name || 'Patient',
      'Appointment Confirmation with Voice Notification',
      appointment,
      voiceResult.audioUrl
    );

    console.log('Email result:', emailResult);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email notification',
        error: emailResult.error
      });
    }

    // Update appointment with voice notification info
    appointment.voiceNotification = {
      sent: true,
      audioUrl: voiceResult.audioUrl,
      sentAt: new Date()
    };
    await appointment.save();

    console.log('Voice notification sent successfully');

    res.status(200).json({
      success: true,
      message: 'Voice notification sent successfully',
      data: {
        appointmentId: appointment._id,
        audioUrl: voiceResult.audioUrl,
        emailSent: emailResult.success
      }
    });
  } catch (error) {
    console.error('Send voice notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending voice notification',
      error: error.message,
    });
  }
};

// @desc    Test voice service
// @route   GET /api/appointments/test-voice
// @access  Public (temporarily)
exports.testVoiceService = async (req, res) => {
  try {
    console.log('Testing voice service...');
    
    const apiTest = await voiceService.testAPI();
    
    if (!apiTest) {
      return res.status(500).json({
        success: false,
        message: 'Voice service test failed',
        error: 'Eleven Labs API connection failed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Voice service test successful',
      data: {
        apiConnected: true
      }
    });
  } catch (error) {
    console.error('Voice service test error:', error);
    res.status(500).json({
      success: false,
      message: 'Voice service test failed',
      error: error.message,
    });
  }
};
