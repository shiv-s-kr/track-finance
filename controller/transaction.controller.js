const Transaction = require('../models/transaction.model');

const getTransactions = (req, res) => {
  try {
    const options = {
      user_id : req.query.user_id,
      page: req.query.page || 1,
      limit: Math.min(parseInt(req.query.limit) || 20, 100)
    };

    console.log('Transaction request OK:', options);

    Transaction.findAllTransactions(options, (err, result) => {
      if (err) {
        console.error('Transaction error:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch transactions'
        });
      }

      res.json({
        success: true,
        data: result.data || [],
        pagination: result.pagination || {}
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

module.exports = { getTransactions };
