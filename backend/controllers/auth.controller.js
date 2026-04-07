const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');
require('dotenv').config();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res) {
  try {
    const { name, email, phone, password, role = 'resident', address = '', ward = '', city = '', pincode = '' } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and password are required.' });
    }

    if (!['resident', 'driver'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      `INSERT INTO users (name, email, phone, password_hash, role, address, ward, city, pincode, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [name.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash, role, address, ward, city, pincode]
    );

    return res.status(201).json({
      success: true,
      message: 'Account created. Pending admin approval.',
      userId: result.insertId,
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [rows] = await db.query(
      `SELECT id, name, email, phone, password_hash, role, status,
              address, ward, city, pincode, plan, fcm_token
       FROM users WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user    = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval.',
        status: 'pending',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact admin.',
        status: 'inactive',
      });
    }

    const token = generateToken(user);
    delete user.password_hash;

    return res.status(200).json({ success: true, message: 'Login successful.', token, user });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

async function getMe(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, role, status,
              address, ward, city, pincode, plan, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, user: rows[0] });

  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function updateFcmToken(req, res) {
  try {
    const { fcm_token } = req.body;
    if (!fcm_token) {
      return res.status(400).json({ success: false, message: 'FCM token required.' });
    }
    await db.query('UPDATE users SET fcm_token = ? WHERE id = ?', [fcm_token, req.user.id]);
    return res.status(200).json({ success: true, message: 'FCM token updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { register, login, getMe, updateFcmToken };