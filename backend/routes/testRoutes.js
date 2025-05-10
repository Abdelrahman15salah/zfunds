const express = require('express');
const { adminToken, investorToken, entrepreneurToken } = require('../utils/generateTestToken');

const router = express.Router();

// @route   GET /api/test/tokens
// @desc    Get permanent test tokens
// @access  Public
router.get('/tokens', (req, res) => {
  res.json({
    admin: {
      token: adminToken,
      role: 'admin',
      email: 'admin100@test.com'
    },
    investor: {
      token: investorToken,
      role: 'investor',
      email: 'investor101@test.com'
    },
    entrepreneur: {
      token: entrepreneurToken,
      role: 'entrepreneur',
      email: 'entrepreneur102@test.com'
    }
  });
});

module.exports = router; 