const Income = require("../models/income.model");

// ✅ GET /api/income?user_id=1&page=1&limit=10
const getAllIncome = (req, res) => {
  try {
    const user_id = parseInt(req.query.user_id);

    console.log(req.query)
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        success: false,
        error: 'user_id parameter required'
      });
    }

    Income.findAll(
      { 
        user_id, 
        page: parseInt(req.query.page) || 1, 
        limit: parseInt(req.query.limit) || 10 
      }, 
      (err, result) => {
        if (err) {
          console.error('Income findAll error:', err.message);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch income records'
          });
        }
        
        res.json({
          success: true,
          ...result,
          user_id: user_id
        });
      }
    );
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get Income by Id
const getIncomeById = (req, res) => {
  try {
    const income_id = parseInt(req.params.id);
    const user_id = parseInt(req.query.user_id);
    console.log(req.query);
    if (!income_id || !user_id || isNaN(income_id) || isNaN(user_id)) {
      return res.status(400).json({
        success: false,
        error: 'income_id and user_id required'
      });
    }

    Income.findById(income_id, user_id, (err, income) => {
      if (err) {
        console.error('Income findById error:', err.message);
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }
      
      if (!income) {
        return res.status(404).json({
          success: false,
          error: 'Income record not found or access denied'
        });
      }
      
      res.json({
        success: true,
        data: income
      });
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ✅ POST /api/income?user_id=1
const createIncome = (req, res) => {
  try {
    const user_id = parseInt(req.query.user_id);
    
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        success: false,
        error: 'user_id parameter required'
      });
    }

    const incomeData = {
      ...req.body,
      user_id: user_id
    };

    Income.create(incomeData, (err, newIncome) => {
      if (err) {
        console.error('Income create error:', err.message);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      res.status(201).json({
        success: true,
        data: newIncome,
        message: 'Income created successfully'
      });
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ✅ PUT /api/income/:id?user_id=1
const updateIncome = (req, res) => {
  try {
    const income_id = parseInt(req.params.id);
    const user_id = parseInt(req.query.user_id);
    
    if (!income_id || !user_id || isNaN(income_id) || isNaN(user_id)) {
      return res.status(400).json({
        success: false,
        error: 'income_id and user_id required'
      });
    }

    const incomeData = {
      ...req.body,
      user_id: user_id  // Keep original owner
    };

    Income.update(income_id, incomeData, user_id, (err, updatedIncome) => {
      if (err) {
        console.error('Income update error:', err.message);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: updatedIncome,
        message: 'Income updated successfully'
      });
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ✅ DELETE /api/income/:id?user_id=1
const deleteIncome = (req, res) => {
  try {
    const income_id = parseInt(req.params.id);
    const user_id = parseInt(req.query.user_id);
    
    if (!income_id || !user_id || isNaN(income_id) || isNaN(user_id)) {
      return res.status(400).json({
        success: false,
        error: 'income_id and user_id required'
      });
    }

    Income.remove(income_id, user_id, (err, result) => {
      if (err) {
        console.error('Income delete error:', err.message);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      res.json({
        success: true,
        ...result
      });
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getAllIncome,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome
};
