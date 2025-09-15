const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Test endpoint to check database connection
exports.testConnection = async (req, res) => {
  try {
    const users = await User.find({}).select('name email role');
    console.log('Existing users:', users);
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      userCount: users.length,
      users: users
    });
  } catch (error) {
    console.error('Database connection test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    
    console.log('Register request received:', { name, email, role, phone, address });
    console.log('Password length:', password ? password.length : 0);

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    console.log('User exists check:', userExists ? 'Yes' : 'No');

    if (userExists) {
      console.log('User already exists with email:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    // Force role to be patient
    const userRole = 'patient';
    console.log('Creating user with role:', userRole);

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone,
      address,
    });

    console.log('User created successfully:', user._id);
    sendResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password matches
    try {
      const isMatch = await user.matchPassword(password);
      console.log('Password match:', isMatch ? 'Yes' : 'No');

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      sendResponse(user, 200, res);
    } catch (passwordError) {
      console.error('Password comparison error:', passwordError);
      return res.status(500).json({
        success: false,
        message: 'Error verifying password',
        error: process.env.NODE_ENV === 'development' ? passwordError.message : undefined
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Public (for now, since we removed token auth)
exports.getMe = async (req, res) => {
  try {
    console.log('GetMe request received');
    
    // Since we removed token authentication, this endpoint is not functional
    // You can implement session-based auth or other methods here
    res.status(200).json({
      success: true,
      message: 'Authentication system updated - no token required',
      data: null
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Public (for now, since we removed token auth)
exports.logout = async (req, res) => {
  console.log('Logout request received');
  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

// Send response without token
const sendResponse = (user, statusCode, res) => {
  try {
    console.log('User authenticated successfully:', user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error sending response:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing authentication response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
