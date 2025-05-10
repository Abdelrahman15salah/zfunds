const jwt = require('jsonwebtoken');

/**
 * Generate JWT for authenticated users
 * @param {number} id - User ID to encode in the token
 * @returns {string} JWT token
 */
const generateToken = (id, user_name, user_email, user_role) => {
  return jwt.sign({ id, user_name, user_email, user_role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

module.exports = generateToken;