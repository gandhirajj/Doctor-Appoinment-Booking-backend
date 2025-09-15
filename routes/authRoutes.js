const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  testConnection,
} = require('../controllers/authController');

const router = express.Router();

router.get('/test', testConnection);
router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.get('/logout', logout);

module.exports = router;
