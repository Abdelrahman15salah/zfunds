const { validationResult } = require('express-validator');
const db = require('../config/db');

/**
 * @desc    Create a new company
 * @route   POST /api/companies
 * @access  Public
 */
const createCompany = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { company_name, tax_number, commercial_register, industry, plan_id } = req.body;

  try {
    // Create company
    const [result] = await db.query(
      'INSERT INTO Company (company_name, tax_number, commercial_register, industry, user_id, plan_id) VALUES (?, ?, ?, ?, ?, ?)',
      [company_name, tax_number, commercial_register, industry, req.user?.user_id || null, plan_id || null]
    );

    if (result.affectedRows === 1) {
      // Get the created company
      const [rows] = await db.query(
        'SELECT * FROM Company WHERE company_id = ?',
        [result.insertId]
      );

      res.status(201).json(rows[0]);
    } else {
      res.status(400).json({ message: 'Invalid company data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all companies
 * @route   GET /api/companies
 * @access  Public
 */
const getCompanies = async (req, res) => {
  try {
    // If user is authenticated and is admin, get all companies
    if (req.user?.is_admin === 'yes') {
      const [rows] = await db.query('SELECT * FROM Company');
      return res.status(200).json(rows);
    }

    // If user is authenticated but not admin, get only user's companies
    if (req.user?.user_id) {
      const [rows] = await db.query(
        'SELECT * FROM Company WHERE user_id = ?',
        [req.user.user_id]
      );
      return res.status(200).json(rows);
    }

    // If no user is authenticated, get all companies
    const [rows] = await db.query('SELECT * FROM Company');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get company by ID
 * @route   GET /api/companies/:id
 * @access  Public
 */
const getCompanyById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Company WHERE company_id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const company = rows[0];

    // If user is authenticated, check permissions
    if (req.user) {
      if (req.user.is_admin !== 'yes' && company.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Not authorized to access this company' });
      }
    }

    res.status(200).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update company
 * @route   PUT /api/companies/:id
 * @access  Public
 */
const updateCompany = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if company exists
    const [companies] = await db.query(
      'SELECT * FROM Company WHERE company_id = ?',
      [req.params.id]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const company = companies[0];

    // If user is authenticated, check permissions
    if (req.user) {
      if (req.user.is_admin !== 'yes' && company.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Not authorized to update this company' });
      }
    }

    const { company_name, tax_number, commercial_register, industry, plan_id } = req.body;

    // Update company
    const [result] = await db.query(
      'UPDATE Company SET company_name = ?, tax_number = ?, commercial_register = ?, industry = ?, plan_id = ? WHERE company_id = ?',
      [
        company_name || company.company_name,
        tax_number || company.tax_number,
        commercial_register || company.commercial_register,
        industry || company.industry,
        plan_id !== undefined ? plan_id : company.plan_id,
        req.params.id
      ]
    );

    if (result.affectedRows === 1) {
      // Get the updated company
      const [rows] = await db.query(
        'SELECT * FROM Company WHERE company_id = ?',
        [req.params.id]
      );

      res.status(200).json(rows[0]);
    } else {
      res.status(400).json({ message: 'Update failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete company
 * @route   DELETE /api/companies/:id
 * @access  Public
 */
const deleteCompany = async (req, res) => {
  try {
    // Check if company exists
    const [companies] = await db.query(
      'SELECT * FROM Company WHERE company_id = ?',
      [req.params.id]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const company = companies[0];

    // If user is authenticated, check permissions
    if (req.user) {
      if (req.user.is_admin !== 'yes' && company.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Not authorized to delete this company' });
      }
    }

    // Delete company
    const [result] = await db.query(
      'DELETE FROM Company WHERE company_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'Company removed' });
    } else {
      res.status(400).json({ message: 'Delete failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get companies by user ID
 * @route   GET /api/companies/user/:userId
 * @access  Public
 */
const getCompaniesByUserId = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Company WHERE user_id = ?',
      [req.params.userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get companies by plan ID
 * @route   GET /api/companies/plan/:planId
 * @access  Public
 */
const getCompaniesByPlanId = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Company WHERE plan_id = ?',
      [req.params.planId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompaniesByUserId,
  getCompaniesByPlanId
};