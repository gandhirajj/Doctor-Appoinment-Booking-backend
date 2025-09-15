const User = require('../models/User');

// Simple authentication middleware - no token required
exports.protect = async (req, res, next) => {
  // For now, just pass through without authentication
  // You can implement session-based auth or other methods here
  console.log('Auth middleware: No authentication required');
  next();
};

// Grant access to specific roles (simplified)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // For now, allow all roles since we're not using tokens
    console.log('Authorization: Allowing access for all roles');
    next();
  };
};
