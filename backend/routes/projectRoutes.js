const express = require('express');
const { check } = require('express-validator');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByCompanyId,
  updateProjectRaisedAmount
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/projects
// @desc    Create a new project
// @access  Public
router.post(
  '/',
  [
    check('project_title', 'Project title is required').not().isEmpty(),
    check('project_category', 'Project category is required').not().isEmpty(),
    check('goal_amount', 'Goal amount must be a positive number').isFloat({ min: 0.01 }),
    check('company_id', 'Company ID is required').not().isEmpty()
  ],
  protect, // Keep protect to get user info if token exists
  createProject
);

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', protect, getProjects);

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', protect, getProjectById);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Public
router.put(
  '/:id',
  [
    check('project_title', 'Project title is required').optional().not().isEmpty(),
    check('project_category', 'Project category is required').optional().not().isEmpty(),
    check('goal_amount', 'Goal amount must be a positive number').optional().isFloat({ min: 0.01 }),
    check('project_status', 'Invalid project status').optional().isIn(['pending', 'active', 'completed', 'cancelled'])
  ],
  protect, // Keep protect to get user info if token exists
  updateProject
);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Public
router.delete('/:id', protect, deleteProject);

// @route   GET /api/projects/company/:company_id
// @desc    Get projects by company ID
// @access  Public
router.get('/company/:company_id', protect, getProjectsByCompanyId);

// @route   PATCH /api/projects/:id/raise
// @desc    Update project raised amount
// @access  Public
router.patch(
  '/:id/raise',
  [
    check('amount', 'Amount is required and must be a positive number').isFloat({ min: 0.01 })
  ],
  protect,
  updateProjectRaisedAmount
);

module.exports = router;