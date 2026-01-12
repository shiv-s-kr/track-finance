const Profile = require('../models/profile.model');

const getProfile = (req, res) => {
  const user_id = parseInt(req.query.user_id) || 1;
  Profile.getProfile(user_id, (err, profile) => {
    if (err) {
      return res.status(404).json({ success: false, error: err.message });
    }
    const { password, ...safeProfile } = profile;
    res.json({ success: true, data: safeProfile });
  });
};

const updateProfile = (req, res) => {
  const user_id = parseInt(req.query.user_id) || 1;
  const profileData = req.body;
  
  Profile.updateProfile(user_id, profileData, (err, result) => {
    if (err) {
      const statusCode = err.message.includes('User not found') ? 404 : 400;
      return res.status(statusCode).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.json(result);
  });
};

const deleteProfile = (req, res) => {
  const user_id = parseInt(req.query.user_id) || 1;
  Profile.deleteProfile(user_id, (err, result) => {
    if (err) {
      const statusCode = err.message.includes('User not found') ? 404 : 500;
      return res.status(statusCode).json({ success: false, error: err.message });
    }
    res.json(result);
  });
};

module.exports = { getProfile, updateProfile, deleteProfile };
