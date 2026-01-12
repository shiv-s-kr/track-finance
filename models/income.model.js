const {db} = require("../utils/db");

const validateIncome = (data) => {
  try {
    const { user_id, date, frequency, amount, source, description } = data;
    
    if (!user_id || isNaN(user_id) || user_id <= 0) {
      throw new Error('Valid user_id is required');
    }
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Valid date (YYYY-MM-DD) required');
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be positive');
    }
    
    if (!source || source.trim().length === 0) {
      throw new Error('Source required');
    }
    return {
      user_id: parseInt(user_id),
      date,
      frequency: frequency?.trim() || 'one-time',
      amount: parseFloat(amount),
      source: source.trim(),
      description: description || ""
    };
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }
};

// ✅ FIXED: Get income for SPECIFIC user only
const findAll = (options, callback) => {
  try {
    const { user_id, page = 1, limit = 10 } = options;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // VALIDATE user_id
    if (!user_id || isNaN(parseInt(user_id))) {
      return callback(new Error('user_id required'), null);
    }

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM income i 
      WHERE i.user_id = ?
    `;
    
    const dataQuery = `
      SELECT 
        i.id,
        DATE_FORMAT(i.date, '%d-%m-%Y') as date,
        i.frequency,
        i.amount,
        i.source,
        i.description,
        i.user_id,
        DATE_FORMAT(i.created_date, '%Y-%m-%d %H:%i:%s') as created_date,
        DATE_FORMAT(i.updated_date, '%Y-%m-%d %H:%i:%s') as updated_date
      FROM income i 
      WHERE i.user_id = ?
      ORDER BY i.created_date DESC 
      LIMIT ? OFFSET ?
    `;
    
    db.query(countQuery, [user_id], (err, countResults) => {
      if (err) {
        return callback(new Error(`Count query failed: ${err.message}`), null);
      }
      
      db.query(dataQuery, [user_id, parseInt(limit), offset], (err, results) => {
        try {
          if (err) throw new Error(`Data query failed: ${err.message}`);
          
          callback(null, {
            data: results,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: parseInt(countResults[0].total),
              total_pages: Math.ceil(parseInt(countResults[0].total) / parseInt(limit)),
              has_next: parseInt(page) < Math.ceil(parseInt(countResults[0].total) / parseInt(limit)),
              has_prev: parseInt(page) > 1
            }
          });
        } catch (queryError) {
          callback(queryError, null);
        }
      });
    });
  } catch (error) {
    callback(new Error(`Pagination error: ${error.message}`), null);
  }
};

// ✅ FIXED: Get income by ID for SPECIFIC user's ownership check
const findById = (id, user_id, callback) => {
  try {
    if (!id || isNaN(id)) throw new Error('Invalid ID');
    if (!user_id || isNaN(user_id)) throw new Error('user_id required');
    
    db.query(`
      SELECT i.*, u.name as user_name 
      FROM income i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.id = ? AND i.user_id = ?
    `, [id, user_id], (err, results) => {
      try {
        if (err) throw new Error(`Query failed: ${err.message}`);
        callback(null, results[0] || null);
      } catch (queryError) {
        callback(queryError, null);
      }
    });
  } catch (error) {
    callback(new Error(`findById error: ${error.message}`), null);
  }
};

// ✅ FIXED: Create - Already user-safe
const create = (data, callback) => {
  try {
    const validated = validateIncome(data);
    console.log("Description : ", data.description);
    db.query(
      'INSERT INTO income (date, frequency, amount, source, description, user_id) VALUES (?,?, ?, ?, ?, ?)',
      [validated.date, validated.frequency, validated.amount, validated.source, validated.description, validated.user_id],
      (err, result) => {
        try {
          if (err) {
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
              throw new Error('User does not exist');
            }
            throw new Error(`Insert failed: ${err.message}`);
          }
          
          findById(result.insertId, validated.user_id, (err, income) => {
            if (err) callback(err, null);
            else callback(null, income);
          });
        } catch (insertError) {
          callback(insertError, null);
        }
      }
    );
  } catch (error) {
    callback(new Error(`Create error: ${error.message}`), null);
  }
};

// ✅ FIXED: Update - Add user ownership check
const update = (id, data, user_id, callback) => {
  try {
    if (!id || isNaN(id)) throw new Error('Invalid ID');
    if (!user_id || isNaN(user_id)) throw new Error('user_id required');
    const validated = validateIncome(data);
    
    db.query(
      'UPDATE income SET date = ?, frequency = ?, amount = ?, source = ?, description = ?, user_id = ? WHERE id = ? AND user_id = ?',
      [validated.date, validated.frequency, validated.amount, validated.source, validated.description, validated.user_id, id, user_id],
      (err, result) => {
        try {
          if (err) throw new Error(`Update failed: ${err.message}`);
          if (result.affectedRows === 0) {
            throw new Error('Record not found or access denied');
          }
          
          findById(id, user_id, (err, income) => {
            if (err) callback(err, null);
            else callback(null, income);
          });
        } catch (updateError) {
          callback(updateError, null);
        }
      }
    );
  } catch (error) {
    callback(new Error(`Update error: ${error.message}`), null);
  }
};

// ✅ FIXED: Delete - Add user ownership check
const remove = (id, user_id, callback) => {
  try {
    if (!id || isNaN(id)) throw new Error('Invalid ID');
    if (!user_id || isNaN(user_id)) throw new Error('user_id required');
    
    db.query('DELETE FROM income WHERE id = ? AND user_id = ?', [id, user_id], (err, result) => {
      try {
        if (err) throw new Error(`Delete failed: ${err.message}`);
        if (result.affectedRows === 0) {
          throw new Error('Record not found or access denied');
        }
        callback(null, { message: 'Deleted successfully' });
      } catch (deleteError) {
        callback(deleteError, null);
      }
    });
  } catch (error) {
    callback(new Error(`Delete error: ${error.message}`), null);
  }
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  validateIncome
};
