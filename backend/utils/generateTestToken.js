const jwt = require('jsonwebtoken');

/**
 * Generate permanent JWT for testing purposes
 * @param {number} user_id - User ID to encode in the token
 * @param {string} user_name - User name
 * @param {string} user_email - User email
 * @param {string} user_role - User role
 * @returns {string} Permanent JWT token
 */
const generateTestToken = (user_id, user_name, user_email, user_role) => {
  return jwt.sign(
    { user_id, user_name, user_email, user_role },
    process.env.JWT_SECRET,
    { expiresIn: '100y' } // Token valid for 100 years
  );
};

// Generate permanent test tokens
const adminToken = generateTestToken(
  100,
  'Admin User',
  'admin100@test.com',
  'admin'
);

const investorToken = generateTestToken(
  101,
  'Investor User',
  'investor101@test.com',
  'investor'
);

const entrepreneurToken = generateTestToken(
  102,
  'Entrepreneur User',
  'entrepreneur102@test.com',
  'entrepreneur'
);

module.exports = {
  adminToken,
  investorToken,
  entrepreneurToken
}; 