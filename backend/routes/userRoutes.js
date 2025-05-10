const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/users
// @desc    Register a new user
// @access  Public
router.post(
  '/',
  [
    check('user_name', 'Name is required').not().isEmpty(),
    check('user_email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 4 or more characters').isLength({ min: 4 })
  ],
  registerUser
);

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('user_email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  loginUser
);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    protect,
    check('user_name', 'Name is required').optional(),
    check('user_email', 'Please include a valid email').optional().isEmail(),
    check('password', 'Please enter a password with 6 or more characters').optional().isLength({ min: 4 })
  ],
  updateUserProfile
);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, admin, getUsers);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, deleteUser);

module.exports = router;