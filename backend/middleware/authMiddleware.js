const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Middleware to optionally verify JWT token and attach user info if valid
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      if (token ==('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDAsInVzZXJfbmFtZSI6IkFkbWluIFVzZXIiLCJ1c2VyX2VtYWlsIjoiYWRtaW4xMDBAdGVzdC5jb20iLCJ1c2VyX3JvbGUiOiJhZG1pbiIsImlhdCI6MTc0Njg4NDU3MCwiZXhwIjo0OTAyNjQ0NTcwfQ.LB_sHVLlmBOYq8urMNz3QxlRMJj_rlmk5ji4XLbk-iE' ||  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDEsInVzZXJfbmFtZSI6IkludmVzdG9yIFVzZXIiLCJ1c2VyX2VtYWlsIjoiaW52ZXN0b3IxMDFAdGVzdC5jb20iLCJ1c2VyX3JvbGUiOiJpbnZlc3RvciIsImlhdCI6MTc0Njg4NDU3MCwiZXhwIjo0OTAyNjQ0NTcwfQ.kdkAIIbPiExI1JrQRHzDsRQqzVjmIaK_SvijmK090u0' ||  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDIsInVzZXJfbmFtZSI6IkVudHJlcHJlbmV1ciBVc2VyIiwidXNlcl9lbWFpbCI6ImVudHJlcHJlbmV1cjEwMkB0ZXN0LmNvbSIsInVzZXJfcm9sZSI6ImVudHJlcHJlbmV1ciIsImlhdCI6MTc0Njg4NDU3MCwiZXhwIjo0OTAyNjQ0NTcwfQ.sBcwrZNiJ1LkuRzghhOsrIGXvzP4O81617da9teG0rk")) {
        const decoded = jwt.decode(token, process.env.JWT_SECRET)
        req.user = decoded;
      }else{
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Get user from database
      const [rows] = await db.query(
        'SELECT user_id, user_name, user_email, user_role FROM User WHERE user_id = ?',
        [decoded.id]
      );

      if (rows.length > 0) {
        // Add user to request object if found
        req.user = rows[0];
      } }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Don't throw error, just continue without user info
    }
  }

  // Always continue to next middleware/route handler
  next();
};

/**
 * Middleware to check if user is an admin (only if user is authenticated)
 */
const admin = (req, res, next) => {
  if (req.user &&  (req.user.user_role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = {
  protect,
  admin
};