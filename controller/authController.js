const {db} = require('../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registration - accepts email, phone, or both
exports.register = async (req, res) => {
    try {console.log(req.body);
        const { name, email, phone, password } = req.body;

        // Validate required fields
        if (!name || !password) {
            return res.status(400).json({ error: 'Name and password required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if user already exists (email or phone)
        const checkQuery = email && phone 
            ? 'SELECT * FROM users WHERE email = ? OR phone = ?'
            : email ? 'SELECT * FROM users WHERE email = ?'
            : 'SELECT * FROM users WHERE phone = ?';

        const checkValues = email && phone ? [email, phone] : [email || phone];

        db.query(checkQuery, checkValues, async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Insert new user
            const insertQuery = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
            db.query(insertQuery, [name, email || null, phone || null, hashedPassword], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login - accepts either email or phone
exports.login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        if ((!email && !phone) || !password) {
            return res.status(400).json({ error: 'Email/phone and password required' });
        }

        let query, values;
        if (email && phone) {
            query = 'SELECT * FROM users WHERE email = ? OR phone = ?';
            values = [email, phone];
        } else if (email) {
            query = 'SELECT * FROM users WHERE email = ?';
            values = [email];
        } else {
            query = 'SELECT * FROM users WHERE phone = ?';
            values = [phone];
        }

        db.query(query, values, async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, phone: user.phone },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Logout (client-side: just remove token from client storage)
exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully. Clear token from client storage.' });
};
