const { validationResult } = require('express-validator');
const db = require('../config/db');

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private/Admin
 */
const createProject = async (req, res) => {
  console.log('Create Project - Request:', {
    user: req.user ? {
      userId: req.user.user_id,
      role: req.user.user_role
    } : 'anonymous'
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    project_title,
    project_category,
    project_description,
    goal_amount,
    start_date,
    end_date,
    company_id
  } = req.body;

  try {
    // Check if user is admin
    // if (!req.user || req.user.user_role !== 'admin') {
    //   console.log('Unauthorized create attempt - User is not admin');
    //   return res.status(403).json({ message: 'Not authorized to create projects' });
    // }

    // Check if company exists
    const [companies] = await db.query(
      'SELECT * FROM Company WHERE company_id = ?',
      [company_id]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Create project
    const [result] = await db.query(
      `INSERT INTO Project 
       (project_title, project_category, project_description, goal_amount, start_date, end_date, project_status, company_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_title,
        project_category,
        project_description,
        goal_amount,
        start_date,
        end_date,
        'pending', // Default status
        company_id
      ]
    );

    if (result.affectedRows === 1) {
      // Get the created project
      const [rows] = await db.query(
        'SELECT * FROM Project WHERE project_id = ?',
        [result.insertId]
      );

      console.log('Project created successfully:', {
        projectId: result.insertId,
        title: project_title
      });

      res.status(201).json(rows[0]);
    } else {
      console.log('Project creation failed - no rows affected');
      res.status(400).json({ message: 'Invalid project data' });
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Public
 */
const getProjects = async (req, res) => {
  try {
    // Get all projects with company information
    const [rows] = await db.query(`
      SELECT p.*, c.company_name 
      FROM Project p
      JOIN Company c ON p.company_id = c.company_id
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get project by ID
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProjectById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.company_name, c.industry 
      FROM Project p
      JOIN Company c ON p.company_id = c.company_id
      WHERE p.project_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = rows[0];

    // If user is authenticated, check permissions
    if (req.user) {
      if (project.project_status !== 'active' && 
          req.user.is_admin !== 'yes' && 
          project.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
      }
    }

    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Public
 */
const updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Get project and company
    const [projects] = await db.query(`
      SELECT p.*, c.user_id 
      FROM Project p
      JOIN Company c ON p.company_id = c.company_id
      WHERE p.project_id = ?
    `, [req.params.id]);

    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projects[0];

    // If user is authenticated, check permissions
    if (req.user) {
    if (req.user.is_admin !== 'yes' && project.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
      }
    }

    const {
      project_title,
      project_category,
      project_description,
      goal_amount,
      start_date,
      end_date,
      project_status
    } = req.body;

    // Update project
    const [result] = await db.query(`
      UPDATE Project SET 
        project_title = ?, 
        project_category = ?, 
        project_description = ?, 
        goal_amount = ?, 
        start_date = ?, 
        end_date = ?, 
        project_status = ?
      WHERE project_id = ?
    `, [
      project_title || project.project_title,
      project_category || project.project_category,
      project_description || project.project_description,
      goal_amount || project.goal_amount,
      start_date || project.start_date,
      end_date || project.end_date,
      project_status || project.project_status,
      req.params.id
    ]);

    if (result.affectedRows === 1) {
      // Get the updated project
      const [rows] = await db.query(
        'SELECT * FROM Project WHERE project_id = ?',
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
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private/Admin
 */
const deleteProject = async (req, res) => {
  console.log('Delete Project - Request:', {
    projectId: req.params.id,
    user: req.user ? {
      userId: req.user.user_id,
      role: req.user.user_role
    } : 'anonymous'
  });

  try {
    // Check if user is admin
    if (!req.user || req.user.user_role !== 'admin') {
      console.log('Unauthorized delete attempt - User is not admin');
      return res.status(403).json({ message: 'Not authorized to delete projects' });
    }

    // Get project and company
    const [projects] = await db.query(`
      SELECT p.*, c.user_id 
      FROM Project p
      JOIN Company c ON p.company_id = c.company_id
      WHERE p.project_id = ?
    `, [req.params.id]);

    if (projects.length === 0) {
      console.log('Project not found:', req.params.id);
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete project
    const [result] = await db.query(
      'DELETE FROM Project WHERE project_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 1) {
      console.log('Project deleted successfully:', req.params.id);
      res.status(200).json({ message: 'Project removed' });
    } else {
      console.log('Delete failed - no rows affected');
      res.status(400).json({ message: 'Delete failed' });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * @desc    Get projects by company ID
 * @route   GET /api/projects/company/:company_id
 * @access  Public
 */
const getProjectsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;
console.log("Company ID:", company_id);
    
    const [rows] = await db.query(`
      SELECT p.*, c.company_name 
      FROM Project p
      JOIN Company c ON p.company_id = c.company_id
      WHERE p.company_id = ?
    `, [company_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No projects found for this company' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update project raised amount
 * @route   PATCH /api/projects/:id/raise
 * @access  Public
 */
const updateProjectRaisedAmount = async (req, res) => {
  console.log('Update Project Raised Amount - Request:', {
    projectId: req.params.id,
    amount: req.body.amount,
    user: req.user ? req.user.user_id : 'anonymous'
  });

  try {
    const { amount } = req.body;
    const projectId = req.params.id;

    if (!amount || amount <= 0) {
      console.log('Invalid amount provided:', amount);
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Get current project
    const [projects] = await db.query(
      'SELECT * FROM Project WHERE project_id = ?',
      [projectId]
    );

    if (projects.length === 0) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projects[0];
    console.log('Current project state:', {
      projectId: project.project_id,
      currentRaisedAmount: project.raised_amount,
      newInvestment: amount
    });

    const newRaisedAmount = Number(project.raised_amount || 0) + Number(amount);
    console.log('Calculated new raised amount:', newRaisedAmount);

    // Update project's raised amount
    const [result] = await db.query(
      'UPDATE Project SET raised_amount = ? WHERE project_id = ?',
      [newRaisedAmount, projectId]
    );

    if (result.affectedRows === 1) {
      // Get the updated project
      const [updatedProject] = await db.query(
        'SELECT * FROM Project WHERE project_id = ?',
        [projectId]
      );

      console.log('Project updated successfully:', {
        projectId: projectId,
        oldAmount: project.raised_amount,
        newAmount: updatedProject[0].raised_amount
      });

      res.status(200).json(updatedProject[0]);
    } else {
      console.log('Update failed - no rows affected');
      res.status(400).json({ message: 'Update failed' });
    }
  } catch (error) {
    console.error('Error updating project raised amount:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByCompanyId,
  updateProjectRaisedAmount
};