const { validationResult } = require('express-validator');
const db = require('../config/db');

/**
 * @desc    Create a new investment
 * @route   POST /api/investments
 * @access  Private
 */
const createInvestment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { investment_amount, company_id } = req.body;

  try {
    // Check if company exists
    const [companies] = await db.query(
      'SELECT * FROM Company WHERE company_id = ?',
      [company_id]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Create investment
    const [result] = await db.query(
      'INSERT INTO Investment (investment_amount, company_id) VALUES (?, ?)',
      [investment_amount, company_id]
    );

    if (result.affectedRows === 1) {
      // Get the created investment
      const [rows] = await db.query(
        'SELECT * FROM Investment WHERE investment_id = ?',
        [result.insertId]
      );

      res.status(201).json(rows[0]);
    } else {
      res.status(400).json({ message: 'Invalid investment data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all investments
 * @route   GET /api/investments
 * @access  Private/Admin
 */
const getInvestments = async (req, res) => {
  try {
    // If admin, get all investments
    if (req.user.is_admin === 'yes') {
      const [rows] = await db.query(`
        SELECT i.*, c.company_name
        FROM Investment i
        JOIN Company c ON i.company_id = c.company_id
      `);
      return res.status(200).json(rows);
    }

    // If not admin, get only investments for user's companies
    const [rows] = await db.query(`
      SELECT i.*, c.company_name
      FROM Investment i
      JOIN Company c ON i.company_id = c.company_id
      WHERE c.user_id = ?
    `, [req.user.user_id]);

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get investment by ID
 * @route   GET /api/investments/:id
 * @access  Private
 */
const getInvestmentById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.*, c.company_name, c.user_id
      FROM Investment i
      JOIN Company c ON i.company_id = c.company_id
      WHERE i.investment_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const investment = rows[0];

    // Check if user has permission to view this investment
    if (req.user.is_admin !== 'yes' && investment.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to access this investment' });
    }

    res.status(200).json(investment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get investments by user ID
 * @route   GET /api/investments/user/:userId
 * @access  Private
 */
const getInvestmentsByUserId = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.*, c.company_name
      FROM Investment i
      JOIN Company c ON i.company_id = c.company_id
      WHERE i.user_id = ?
    `, [req.params.userId]);

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get investments by company ID
 * @route   GET /api/investments/company/:companyId
 * @access  Private
 */
const getInvestmentsByCompanyId = async (req, res) => {
  try {
    const [company] = await db.query(
      'SELECT * FROM Company WHERE company_id = ?',
      [req.params.companyId]
    );

    if (company.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const [rows] = await db.query(`
      SELECT i.*, c.company_name
      FROM Investment i
      JOIN Company c ON i.company_id = c.company_id
      WHERE i.company_id = ?
    `, [req.params.companyId]);

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createInvestment,
  getInvestments,
  getInvestmentById,
  getInvestmentsByUserId,
  getInvestmentsByCompanyId
};