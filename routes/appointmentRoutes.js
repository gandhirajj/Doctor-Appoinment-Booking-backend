const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  sendVoiceNotification,
  testVoiceService,
} = require('../controllers/appointmentController');

const router = express.Router();

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/test-voice')
  .get(testVoiceService);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointment)
  .delete(deleteAppointment);

router.route('/:id/send-voice')
  .post(sendVoiceNotification);

module.exports = router;
