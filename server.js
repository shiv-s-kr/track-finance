const express = require('express');
const cors = require('cors');
const authController = require('./controller/authController');
const authMiddleware = require('./middleware/authMiddleware');
const routes = require("./routes/routes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/v1/", routes)

// Public routes
app.post('/api/v1/auth/register', authController.register);
app.post('/api/v1/auth/login', authController.login);

// Protected routes
app.post('/api/v1/auth/logout', authMiddleware, authController.logout);
app.get('/api/v1/profile', authMiddleware, (req, res) => {
    res.json({ message: 'Protected profile data', user: req.user });
});
app.get("/",(req,res)=>{
    res.json({message : "Welcome"});
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
