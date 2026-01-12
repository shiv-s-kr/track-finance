const Dashboard = require('../models/dashboard.model');

const getDashboard = (req, res) => {
  try {
    const user_id = parseInt(req.query.user_id) || 1;
    
    Dashboard.getLiveDashboard(user_id, (err, data) => {
      if (err) {
        console.error('Dashboard query failed:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to load dashboard data'
        });
      }
      
      res.json({
        success: true,
        data: data || { summary: { total_income: 0, total_expense: 0, balance: 0 }, alerts: [], categories: [] },
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('Dashboard controller error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { getDashboard };
