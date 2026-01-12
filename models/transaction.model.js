const {db} = require("../utils/db");


const findAllTransactions = (options, callback) => {
  try {
    const { user_id, page = 1, limit = 20 } = options;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // ✅ VALIDATE user_id (CRITICAL SECURITY)
    if (!user_id || isNaN(parseInt(user_id))) {
      return callback(new Error('user_id is required'), null);
    }

    // ✅ FIXED: Add user_id filter to BOTH tables
    const dataQuery = `
      SELECT 
        i.id, 
        'income' as type, 
        COALESCE(i.source, 'Income') as category, 
        i.amount, 
        DATE_FORMAT(i.date, '%Y-%m-%d') as date,
        COALESCE(i.description, '') as description,
        i.created_date as created_date
      FROM income i 
      WHERE i.user_id = ?
      
      UNION ALL
      
      SELECT 
        e.id,
        'expense' as type, 
        COALESCE(e.category, 'Expense') as category, 
        e.amount * -1 as amount, 
        DATE_FORMAT(e.date, '%Y-%m-%d') as date,
        COALESCE(e.description, '') as description,
        e.created_date as created_date
      FROM expenses e 
      WHERE e.user_id = ?
      
      ORDER BY created_date DESC
      LIMIT ? OFFSET ?
    `;
    
    // ✅ FIXED: User-specific count
    const countQuery = `
      SELECT 
        (SELECT COUNT(*) FROM income WHERE user_id = ?) + 
        (SELECT COUNT(*) FROM expenses WHERE user_id = ?) as total
    `;

    // Execute count first
    db.query(countQuery, [user_id, user_id], (err, countResults) => {
      if (err) {
        console.error('Count error:', err.message);
        return callback(err, null);
      }

      // Execute data query with user_id
      db.query(dataQuery, [user_id, user_id, parseInt(limit), offset], (err, results) => {
        if (err) {
          console.error('Data query error:', err.message);
          console.error('SQL:', dataQuery);
          console.error('Params:', [user_id, user_id, parseInt(limit), offset]);
          return callback(err, null);
        }

        callback(null, {
          data: results,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResults[0]?.total) || 0,
            total_pages: Math.ceil((parseInt(countResults[0]?.total) || 0) / parseInt(limit))
          }
        });
      });
    });

  } catch (error) {
    console.error('Model error:', error);
    callback(error, null);
  }
};

module.exports = { findAllTransactions };