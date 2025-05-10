const express = require('express');
const { check } = require('express-validator');
const {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan
} = require('../controllers/planController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/plans
// @desc    Create a new plan
// @access  Private/Admin
router.post(
  '/',
  [
    protect,
    admin,
    check('plan_description', 'Plan description is required').not().isEmpty(),
    check('plan_price', 'Plan price must be a positive number').isFloat({ min: 0 })
  ],
  createPlan
);

// @route   GET /api/plans
// @desc    Get all plans
// @access  Public
router.get('/', getPlans);

// @route   GET /api/plans/:id
// @desc    Get plan by ID
// @access  Public
router.get('/:id', getPlanById);

// @route   PUT /api/plans/:id
// @desc    Update plan
// @access  Private/Admin
router.put(
  '/:id',
  [
    protect,
    admin,
    check('plan_description', 'Plan description is required').not().isEmpty(),
    check('plan_price', 'Plan price must be a positive number').isFloat({ min: 0 })
  ],
  updatePlan
);

// @route   DELETE /api/plans/:id
// @desc    Delete plan
// @access  Private/Admin
router.delete('/:id', protect, admin, deletePlan);

module.exports = router;