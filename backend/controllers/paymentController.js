const { validationResult } = require('express-validator');
const db = require('../config/db');

/**
 * @desc    Create a new payment
 * @route   POST /api/payments
 * @access  Private
 */
const createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { payment_status, payment_amount, project_id } = req.body;

  try {
    // Create payment
    const [result] = await db.query(
      'INSERT INTO Payment (payment_status, transaction_date, payment_amount, user_id) VALUES (?, CURDATE(), ?, ?)',
      [payment_status, payment_amount, req.user.user_id]
    );

    if (result.affectedRows === 1) {
      // If this payment is for a project, update the project's raised amount
      if (project_id) {
        await db.query(
          'UPDATE Project SET raised_amount = raised_amount + ? WHERE project_id = ?',
          [payment_amount, project_id]
        );
      }

      // Get the created payment
      const [rows] = await db.query(
        'SELECT * FROM Payment WHERE payment_id = ?',
        [result.insertId]
      );

      res.status(201).json(rows[0]);
    } else {
      res.status(400).json({ message: 'Invalid payment data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all payments
 * @route   GET /api/payments
 * @access  Private/Admin
 */
const getPayments = async (req, res) => {
  try {
    // If admin, get all payments
    if (req.user.is_admin === 'yes') {
      const [rows] = await db.query(`
        SELECT p.*, u.user_name, u.user_email
        FROM Payment p
        JOIN User u ON p.user_id = u.user_id
      `);
      return res.status(200).json(rows);
    }

    // If not admin, get only user's payments
    const [rows] = await db.query(
      'SELECT * FROM Payment WHERE user_id = ?',
      [req.user.user_id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPaymentById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Payment WHERE payment_id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = rows[0];

    // Check if user has permission to view this payment
    if (req.user.is_admin !== 'yes' && payment.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to access this payment' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update payment status
 * @route   PUT /api/payments/:id
 * @access  Private/Admin
 */
const updatePaymentStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { payment_status } = req.body;

  try {
    // Only admins can update payment status
    if (req.user.is_admin !== 'yes') {
      return res.status(403).json({ message: 'Not authorized to update payment status' });
    }

    // Update payment status
    const [result] = await db.query(
      'UPDATE Payment SET payment_status = ? WHERE payment_id = ?',
      [payment_status, req.params.id]
    );

    if (result.affectedRows === 1) {
      // Get the updated payment
      const [rows] = await db.query(
        'SELECT * FROM Payment WHERE payment_id = ?',
        [req.params.id]
      );

      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get payments by user ID
 * @route   GET /api/payments/user/:userId
 * @access  Private
 */
const getPaymentsByUserId = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.user_name, u.user_email
      FROM Payment p
      JOIN User u ON p.user_id = u.user_id
      WHERE p.user_id = ?
    `, [req.params.userId]);

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
  getPaymentsByUserId
};