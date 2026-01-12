const { db } = require("../utils/db");

const validateBudget = (data) => {
  const { user_id, category, amount, budget_month } = data;
  
  // Validate user_id
  if (!user_id || isNaN(user_id) || parseInt(user_id) <= 0) {
    throw new Error('Valid user_id required');
  }
  
  // Validate category
  const validCategories = ['Rent', 'Food', 'Transport', 'Entertainment', 'Utilities', 'Others'];
  if (!category || !validCategories.includes(category.trim())) {
    throw new Error('Valid category required (Rent, Food, Transport, Entertainment, Utilities, Others)');
  }
  
  // Validate amount
  if (!amount || isNaN(amount) || parseFloat(amount) < 0) {
    throw new Error('Budget amount must be 0 or positive');
  }
  
  // Validate budget_month format (YYYY-MM)
  if (!budget_month || !/^\d{4}-\d{2}$/.test(budget_month)) {
    throw new Error('Valid month format required (YYYY-MM)');
  }
  
  return {
    user_id: parseInt(user_id),
    category: category.trim(),
    amount: parseFloat(amount),
    budget_month: budget_month.trim()
  };
};

// 1. GET ALL budgets for user
const findAll = (user_id, callback) => {
  const query = `
    SELECT 
      id,
      category,
      amount,
      budget_month,
      DATE_FORMAT(created_date, '%Y-%m-%d %H:%i:%s') as created_date,
      DATE_FORMAT(updated_date, '%Y-%m-%d %H:%i:%s') as updated_date
    FROM budgets 
    WHERE user_id = ?
    ORDER BY budget_month DESC, category ASC
  `;
  
  db.query(query, [user_id], (err, results) => {
    if (err) {
      return callback(new Error(`Database error: ${err.message}`), null);
    }
    callback(null, results);
  });
};

// 2. UPSERT (Create or Update) budget
const upsert = (data, callback) => {
  try {
    const validated = validateBudget(data);
    
    const upsertQuery = `
      INSERT INTO budgets (user_id, category, amount, budget_month) 
      VALUES (?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        amount = VALUES(amount),
        updated_date = CURRENT_TIMESTAMP
    `;
    
    db.query(upsertQuery, [
      validated.user_id,
      validated.category,
      validated.amount,
      validated.budget_month
    ], (err, result) => {
      if (err) {
        console.error('Upsert query failed:', err);
        return callback(new Error(`Database upsert failed: ${err.message}`), null);
      }
      
      // Fetch the updated/created record
      const selectQuery = `
        SELECT 
          id, user_id, category, amount, budget_month,
          DATE_FORMAT(created_date, '%Y-%m-%d %H:%i:%s') as created_date,
          DATE_FORMAT(updated_date, '%Y-%m-%d %H:%i:%s') as updated_date
        FROM budgets 
        WHERE user_id = ? AND category = ? AND budget_month = ?
      `;
      
      db.query(selectQuery, [
        validated.user_id,
        validated.category,
        validated.budget_month
      ], (err, results) => {
        if (err) {
          return callback(new Error(`Fetch after upsert failed: ${err.message}`), null);
        }
        
        if (!results.length) {
          return callback(new Error('Budget not found after upsert'), null);
        }
        
        // Determine action type
        const isNew = !data.id;
        callback(null, {
          ...results[0],
          action: isNew ? 'created' : 'updated'
        });
      });
    });
    
  } catch (error) {
    callback(error, null);
  }
};

// 3. DELETE budget by ID
const remove = (id, user_id, callback) => {
  if (!id || isNaN(id)) {
    return callback(new Error('Valid budget ID required'), null);
  }
  
  const query = 'DELETE FROM budgets WHERE id = ? AND user_id = ?';
  db.query(query, [parseInt(id), parseInt(user_id)], (err, result) => {
    if (err) {
      return callback(new Error(`Delete failed: ${err.message}`), null);
    }
    
    if (result.affectedRows === 0) {
      return callback(new Error('Budget not found'), null);
    }
    
    callback(null, true);
  });
};

// 4. Find by ID
const findById = (id, user_id, callback) => {
  if (!id || isNaN(id)) {
    return callback(new Error('Valid budget ID required'), null);
  }
  
  const query = `
    SELECT 
      id, user_id, category, amount, budget_month,
      DATE_FORMAT(created_date, '%Y-%m-%d %H:%i:%s') as created_date,
      DATE_FORMAT(updated_date, '%Y-%m-%d %H:%i:%s') as updated_date
    FROM budgets 
    WHERE id = ? AND user_id = ?
  `;
  
  db.query(query, [parseInt(id), parseInt(user_id)], (err, results) => {
    if (err) {
      return callback(new Error(`Fetch failed: ${err.message}`), null);
    }
    
    callback(null, results[0] || null);
  });
};

module.exports = {
  findAll,
  upsert,
  remove,
  findById,
  validateBudget
};