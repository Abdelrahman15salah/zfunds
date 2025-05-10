const express = require('express');
const { check } = require('express-validator');
const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompaniesByUserId,
  getCompaniesByPlanId
} = require('../controllers/companyController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/companies
// @desc    Create a new company
// @access  Public
router.post(
  '/',
  [
    check('company_name', 'Company name is required').not().isEmpty(),
    check('tax_number', 'Tax number is required').not().isEmpty(),
    check('commercial_register', 'Commercial register number is required').not().isEmpty()
  ],
  protect, // Keep protect to get user info if token exists
  createCompany
);

// @route   GET /api/companies
// @desc    Get all companies
// @access  Public
router.get('/', protect, getCompanies);

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Public
router.get('/:id', protect, getCompanyById);

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Public
router.put(
  '/:id',
  [
    check('company_name', 'Company name is required').optional().not().isEmpty(),
    check('tax_number', 'Tax number is required').optional().not().isEmpty(),
    check('commercial_register', 'Commercial register number is required').optional().not().isEmpty()
  ],
  protect, // Keep protect to get user info if token exists
  updateCompany
);

// @route   DELETE /api/companies/:id
// @desc    Delete company
// @access  Public
router.delete('/:id', protect, deleteCompany);

// @route   GET /api/companies/user/:userId
// @desc    Get companies by user ID
// @access  Public
router.get('/user/:userId', protect, getCompaniesByUserId);

// @route   GET /api/companies/plan/:planId
// @desc    Get companies by plan ID
// @access  Public
router.get('/plan/:planId', protect, getCompaniesByPlanId);

module.exports = router;