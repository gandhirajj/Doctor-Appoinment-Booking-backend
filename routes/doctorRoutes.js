const express = require('express');
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  addDoctorReview,
} = require('../controllers/doctorController');

const router = express.Router();

// Public routes
router.get('/', getDoctors); // Get all doctors
router.get('/:id', getDoctor); // Get single doctor

// All routes are now public (temporarily)
router.post('/', createDoctor);
router.put('/:id', updateDoctor);
router.post('/:id/reviews', addDoctorReview);

module.exports = router;
