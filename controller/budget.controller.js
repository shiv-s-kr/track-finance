const Budget = require('../models/budget.model');

const getAllBudgets = (req, res) => {
  try {
    const user_id = parseInt(req.query.user_id);
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id query parameter required'
      });
    }
    
    Budget.findAll(user_id, (err, budgets) => {
      if (err) {
        console.error('Get budgets error:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch budgets',
          ...(process.env.NODE_ENV === 'development' && { details: err.message })
        });
      }
      
      res.json({
        success: true,
        data: budgets,
        count: budgets.length,
        message: 'Budgets fetched successfully'
      });
    });
    
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const createOrUpdateBudget = (req, res) => {
  try {
    // Validate request
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Budget data required in request body'
      });
    }
    
    Budget.upsert(req.body, (err, budget) => {
      if (err) {
        console.error('Budget upsert error:', err.message);
        const statusCode = err.message.includes('Database') || 
                          err.message.includes('required') ||
                          err.message.includes('validation') ? 400 : 500;
        
        return res.status(statusCode).json({
          success: false,
          error: err.message
        });
      }
      
      res.status(201).json({
        success: true,
        data: budget,
        message: `Budget ${budget.action} successfully for ${budget.budget_month}`
      });
    });
    
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const deleteBudget = (req, res) => {
  try {
    const budget_id = req.params.id;
    const user_id = parseInt(req.query.user_id);
    
    if (!budget_id) {
      return res.status(400).json({
        success: false,
        error: 'Budget ID required in URL params'
      });
    }
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id query parameter required'
      });
    }
    
    Budget.remove(budget_id, user_id, (err, deleted) => {
      if (err) {
        console.error('Delete budget error:', err.message);
        const statusCode = err.message.includes('not found') ? 404 : 500;
        
        return res.status(statusCode).json({
          success: false,
          error: err.message
        });
      }
      
      res.json({
        success: true,
        message: 'Budget deleted successfully'
      });
    });
    
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const getBudgetById = (req, res) => {
  try {
    const budget_id = req.params.id;
    const user_id = parseInt(req.query.user_id);
    
    if (!budget_id) {
      return res.status(400).json({
        success: false,
        error: 'Budget ID required'
      });
    }
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id required'
      });
    }
    
    Budget.findById(budget_id, user_id, (err, budget) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }
      
      if (!budget) {
        return res.status(404).json({
          success: false,
          error: 'Budget not found'
        });
      }
      
      res.json({
        success: true,
        data: budget
      });
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get current month budgets only
const getCurrentMonthBudgets = (req, res) => {
  try {
    const user_id = parseInt(req.query.user_id);
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id required'
      });
    }
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    Budget.findAll(user_id, (err, allBudgets) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }
      
      const currentBudgets = allBudgets.filter(b => b.budget_month === currentMonth);
      
      res.json({
        success: true,
        data: currentBudgets,
        current_month: currentMonth,
        count: currentBudgets.length
      });
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getAllBudgets,
  createOrUpdateBudget,
  deleteBudget,
  getBudgetById,
  getCurrentMonthBudgets
};