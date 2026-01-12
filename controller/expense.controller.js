const Expense = require('../models/expense.model');


const getAll = (req, res) => {
  try {
    // Extract pagination and filter params
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 10, 100), // Max 100 records
      user_id: parseInt(req.query.user_id) || 1
    };

    Expense.findAll(options, (err, result) => {
      if (err) {
        console.error('Get all expenses error:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch expenses',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      res.json({
        success: true,
        data: result.data || [],
        pagination: result.pagination || {},
        count: (result.data || []).length
      });
    });
  } catch (error) {
    console.error('Controller error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getById = (req, res) => {
  try {
    if (!req.params.id || isNaN(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Valid expense ID required'
      });
    }

    const user_id = parseInt(req.query.user_id) || 1;
    
    Expense.findById(req.params.id, user_id, (err, expense) => {
      if (err) {
        console.error('Get expense error:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch expense',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      res.json({
        success: true,
        data: expense
      });
    });
  } catch (error) {
    console.error('Controller error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createExpense = (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Expense data required'
      });
    }

    if (!req.body.user_id || isNaN(req.body.user_id)) {
      return res.status(400).json({
        success: false,
        error: 'Valid user_id required'
      });
    }

    Expense.create(req.body, (err, expense) => {
      if (err) {
        console.error('Create expense error:', err.message);
        // Handle specific validation errors
        const statusCode = err.message.includes('not found') || 
                          err.message.includes('required') ? 400 : 500;
        
        return res.status(statusCode).json({
          success: false,
          error: err.message
        });
      }

      res.status(201).json({
        success: true,
        data: expense,
        message: 'Expense created successfully'
      });
    });
  } catch (error) {
    console.error('Controller error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateExpense = (req, res) => {
  try {
    if (!req.params.id || isNaN(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Valid expense ID required'
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Update data required'
      });
    }

    if (!req.body.user_id || isNaN(req.body.user_id)) {
      return res.status(400).json({
        success: false,
        error: 'Valid user_id required'
      });
    }

    Expense.update(req.params.id, req.body, (err, expense) => {
      if (err) {
        console.error('Update expense error:', err.message);
        const statusCode = err.message.includes('not found') ? 404 : 400;
        return res.status(statusCode).json({
          success: false,
          error: err.message
        });
      }

      res.json({
        success: true,
        data: expense,
        message: 'Expense updated successfully'
      });
    });
  } catch (error) {
    console.error('Controller error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteExpense = (req, res) => {
  try {
    if (!req.params.id || isNaN(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Valid expense ID required'
      });
    }

    const user_id = parseInt(req.query.user_id) || 1;
    
    Expense.remove(req.params.id, user_id, (err, deleted) => {
      if (err) {
        console.error('Delete expense error:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete expense',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    });
  } catch (error) {
    console.error('Controller error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



module.exports = {
  getAll,
  getById,
  createExpense,
  updateExpense,
  deleteExpense,
};


