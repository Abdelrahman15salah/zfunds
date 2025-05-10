const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user_name, user_email, user_role, password } = req.body;

  try {
    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM User WHERE user_email = ?',
      [user_email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await db.query(
      'INSERT INTO User (user_name, user_email, user_role, password) VALUES (?, ?, ?, ?)',
      [user_name, user_email, user_role, hashedPassword]
    );

    if (result.affectedRows === 1) {
      // Get the created user
      const [rows] = await db.query(
        'SELECT user_id, user_name, user_email, user_role FROM User WHERE user_id = ?',
        [result.insertId]
      );

      // Generate token
      const token = generateToken(rows[0].user_id,
        rows[0].user_name,
        rows[0].user_email,
        rows[0].user_role
      );

      res.status(201).json({
        user_id: rows[0].user_id,
        user_name: rows[0].user_name,
        user_email: rows[0].user_email,
        user_role: rows[0].user_role,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user_email, password } = req.body;

  try {
    // Find user by email
    const [rows] = await db.query(
      'SELECT * FROM User WHERE user_email = ?',
      [user_email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.user_id, user.user_name, user.user_email, user.user_role);

    res.status(200).json({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      user_role: user.user_role,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    // User is already available in req.user from the auth middleware
    res.status(200).json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user_name, user_email, user_role, password } = req.body;

  try {
    // Start building the query
    let query = 'UPDATE User SET ';
    const queryParams = [];

    // Add fields to update if they exist
    if (user_name) {
      query += 'user_name = ?, ';
      queryParams.push(user_name);
    }

    if (user_email) {
      query += 'user_email = ?, ';
      queryParams.push(user_email);
    }

    if (user_role) {
      query += 'user_role = ?, ';
      queryParams.push(user_role);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += 'password = ?, ';
      queryParams.push(hashedPassword);
    }

    // Remove the trailing comma and space
    query = query.slice(0, -2);

    // Add the WHERE clause
    query += ' WHERE user_id = ?';
    queryParams.push(req.user.user_id);

    // Execute the query
    const [result] = await db.query(query, queryParams);

    if (result.affectedRows === 1) {
      // Get the updated user
      const [rows] = await db.query(
        'SELECT user_id, user_name, user_email, user_role FROM User WHERE user_id = ?',
        [req.user.user_id]
      );

      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, user_name, user_email, user_role, created_at, updated_at FROM User'
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM User WHERE user_id = ?',
      [req.params.id]
    );
    

    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {

    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser
};