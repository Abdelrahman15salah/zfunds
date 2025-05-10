const { validationResult } = require('express-validator');
const db = require('../config/db');

/**
 * @desc    Create a new plan
 * @route   POST /api/plans
 * @access  Private/Admin
 */
const createPlan = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { plan_description, plan_price } = req.body;

  try {
    // Only admins can create plans
    if (req.user.is_admin !== 'yes') {
      return res.status(403).json({ message: 'Not authorized to create plans' });
    }

    // Create plan
    const [result] = await db.query(
      'INSERT INTO Plans (plan_description, plan_price) VALUES (?, ?)',
      [plan_description, plan_price]
    );

    if (result.affectedRows === 1) {
      // Get the created plan
      const [rows] = await db.query(
        'SELECT * FROM Plans WHERE plan_id = ?',
        [result.insertId]
      );

      res.status(201).json(rows[0]);
    } else {
      res.status(400).json({ message: 'Invalid plan data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all plans
 * @route   GET /api/plans
 * @access  Public
 */
const getPlans = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Plans');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get plan by ID
 * @route   GET /api/plans/:id
 * @access  Public
 */
const getPlanById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Plans WHERE plan_id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update plan
 * @route   PUT /api/plans/:id
 * @access  Private/Admin
 */
const updatePlan = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { plan_description, plan_price } = req.body;

  try {
    // Only admins can update plans
    if (req.user.is_admin !== 'yes') {
      return res.status(403).json({ message: 'Not authorized to update plans' });
    }

    // Update plan
    const [result] = await db.query(
      'UPDATE Plans SET plan_description = ?, plan_price = ? WHERE plan_id = ?',
      [plan_description, plan_price, req.params.id]
    );

    if (result.affectedRows === 1) {
      // Get the updated plan
      const [rows] = await db.query(
        'SELECT * FROM Plans WHERE plan_id = ?',
        [req.params.id]
      );

      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete plan
 * @route   DELETE /api/plans/:id
 * @access  Private/Admin
 */
const deletePlan = async (req, res) => {
  try {
    // Only admins can delete plans
    if (req.user.is_admin !== 'yes') {
      return res.status(403).json({ message: 'Not authorized to delete plans' });
    }

    // Delete plan
    const [result] = await db.query(
      'DELETE FROM Plans WHERE plan_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'Plan removed' });
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan
};