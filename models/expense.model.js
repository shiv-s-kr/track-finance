const {db} = require("../utils/db");

const validateExpense = (data) => {
  const { user_id, amount, category, date } = data;
  if (!user_id || isNaN(user_id)) throw new Error('Valid user_id required');
  if (!amount || isNaN(amount) || amount <= 0) throw new Error('Valid amount required');
  if (!category) throw new Error('Category required');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Valid date required');
  return {
    user_id: parseInt(user_id),
    amount: parseFloat(amount),
    category: category.trim(),
    date,
    description: data.description?.trim() || null
  };
};

const findAll = (options, callback) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) as total FROM expenses WHERE user_id = ?`;
    const dataQuery = `
      SELECT 
        id,
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        amount,
        category,
        description,
        DATE_FORMAT(created_date, '%Y-%m-%d %H:%i:%s') as created_date,
        DATE_FORMAT(updated_date, '%Y-%m-%d %H:%i:%s') as updated_date,
        user_id
      FROM expenses 
      WHERE user_id = ?
      ORDER BY created_date DESC 
      LIMIT ? OFFSET ?
    `;
    
    db.query(countQuery, [options.user_id], (err, countResults) => {
      if (err) return callback(new Error(err.message), null);
      
      db.query(dataQuery, [options.user_id, limit, offset], (err, results) => {
        if (err) return callback(new Error(err.message), null);
        callback(null, {
          data: results,
          pagination: {
            page, limit, total: countResults[0].total,
            total_pages: Math.ceil(countResults[0].total / limit)
          }
        });
      });
    });
  } catch (error) {
    callback(new Error(error.message), null);
  }
};

const findById = (id, user_id, callback) => {
  db.query(`
    SELECT 
      id, DATE_FORMAT(date, '%Y-%m-%d') as date, amount, category, 
      description, user_id, DATE_FORMAT(created_date, '%Y-%m-%d %H:%i:%s') as created_date
    FROM expenses WHERE id = ? AND user_id = ?
  `, [id, user_id], (err, results) => {
    callback(err, results[0] || null);
  });
};

const create = (data, callback) => {
  try {
    const validated = validateExpense(data);
    db.query(
      'INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
      [validated.user_id, validated.amount, validated.category, validated.date, validated.description],
      (err, result) => {
        if (err) return callback(err, null);
        findById(result.insertId, validated.user_id, (err, expense) => {
          callback(err, expense);
        });
      }
    );
  } catch (error) {
    callback(error, null);
  }
};

const update = (id, data, callback) => {
  try {
    const validated = validateExpense(data);
    db.query(
      'UPDATE expenses SET amount = ?, category = ?, date = ?, description = ?, user_id = ? WHERE id = ?',
      [validated.amount, validated.category, validated.date, validated.description, validated.user_id, id],
      (err, result) => {
        if (err) return callback(err, null);
        if (result.affectedRows === 0) return callback(new Error('Not found'), null);
        findById(id, validated.user_id, (err, expense) => {
          callback(err, expense);
        });
      }
    );
  } catch (error) {
    callback(error, null);
  }
};

const remove = (id, user_id, callback) => {
  db.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, user_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

module.exports = { findAll, findById, create, update, remove };
