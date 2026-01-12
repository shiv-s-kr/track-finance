const { db } = require("../utils/db");
const bcrypt = require('bcryptjs');

const getProfile = (user_id, callback) => {
  db.query(`
    SELECT id, name, email, phone, created_at 
    FROM users WHERE id = ?
  `, [user_id], (err, results) => {
    if (err || !results.length) {
      return callback(new Error('User not found'), null);
    }
    callback(null, results[0]);
  });
};

const updateProfile = (user_id, profileData, callback) => {
  const allowedFields = ['name', 'email', 'phone', 'password'];
  const updateFields = {};
  
  // Filter only allowed fields
  allowedFields.forEach(field => {
    if (profileData[field] !== undefined && profileData[field] !== '') {
      updateFields[field] = profileData[field];
    }
  });
  
  if (Object.keys(updateFields).length === 0) {
    return callback(new Error('Provide at least one field to update'), null);
  }

  // Handle password hashing if provided
  if (updateFields.password) {
    bcrypt.hash(updateFields.password, 10, (hashErr, hashedPassword) => {
      if (hashErr) return callback(hashErr, null);
      
      // Remove password from updateFields, handle separately
      const nonPasswordFields = { ...updateFields };
      delete nonPasswordFields.password;
      
      performUpdate(nonPasswordFields, hashedPassword);
    });
  } else {
    performUpdate(updateFields, null);
  }

  function performUpdate(nonPasswordFields, hashedPassword) {
    // MySQL magic: UPDATE table SET ? WHERE ?
    const updateData = { ...nonPasswordFields };
    if (hashedPassword) updateData.password = hashedPassword;
    
    const query = 'UPDATE users SET ? WHERE id = ?';
    const params = [updateData, user_id];
    
    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return callback(err, null);
      }
      
      if (result.affectedRows === 0) {
        return callback(new Error('User not found'), null);
      }
      
      callback(null, { 
        success: true, 
        message: 'Profile updated successfully',
        updated_fields: Object.keys(updateData)
      });
    });
  }
};

const deleteProfile = (user_id, callback) => {
  db.query('DELETE FROM users WHERE id = ?', [user_id], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) {
      return callback(new Error('User not found'), null);
    }
    callback(null, { success: true, message: 'Account deleted permanently' });
  });
};

module.exports = { getProfile, updateProfile, deleteProfile };
