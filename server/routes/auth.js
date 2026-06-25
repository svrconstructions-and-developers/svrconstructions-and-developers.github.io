import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runQuery, getQuery } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendAdminAlert } from '../services/emailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'svr_construction_super_secret_jwt_key_2026';

// 1. Client Registration
router.post('/register', async (req, res) => {
  const { name, email, password, phone, company } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    // Check if client email already exists
    const existingUser = await getQuery('SELECT id FROM users WHERE email = ?', [email]);
    const existingAdmin = await getQuery('SELECT id FROM admins WHERE email = ?', [email]);
    if (existingUser || existingAdmin) {
      return res.status(400).json({ error: 'Email address already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await runQuery(
      'INSERT INTO users (name, email, password_hash, phone, company) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, phone, company]
    );

    const newUserId = result.lastID;

    // Send admin notification
    await sendAdminAlert({
      fullName: name,
      email,
      phone: phone || 'N/A',
      company: company || 'N/A',
      message: `A new client has registered. Account details:\n- Name: ${name}\n- Email: ${email}\n- Phone: ${phone || 'N/A'}\n- Company: ${company || 'N/A'}`,
      requestType: 'Registration'
    });

    // Create Token
    const token = jwt.sign({ id: newUserId, role: 'client', email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Client registered successfully',
      token,
      user: { id: newUserId, name, email, phone, company, role: 'client' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// 2. Client Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: 'client', email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        project_id: user.project_id,
        role: 'client'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 3. Admin Login
router.post('/admin/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  try {
    const admin = await getQuery(
      'SELECT * FROM admins WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    );

    if (!admin) {
      return res.status(400).json({ error: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role, username: admin.username, email: admin.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during admin login' });
  }
});

// 4. Get Current User Info (Validates token and returns current user data)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'client') {
      const user = await getQuery('SELECT id, name, email, phone, company, project_id FROM users WHERE id = ?', [req.user.id]);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ ...user, role: 'client' });
    } else {
      const admin = await getQuery('SELECT id, username, email, role FROM admins WHERE id = ?', [req.user.id]);
      if (!admin) return res.status(404).json({ error: 'Admin not found' });
      return res.json({ ...admin, role: admin.role });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error retrieving user data' });
  }
});

export default router;
