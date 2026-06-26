import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runQuery, getQuery, allQuery } from '../database/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// All routes here require Admin authorization
router.use(authenticateToken, requireAdmin);

// 1. Dashboard Analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalProjects = await getQuery('SELECT COUNT(*) as count FROM projects');
    const totalClients = await getQuery('SELECT COUNT(*) as count FROM users');
    const totalInquiries = await getQuery('SELECT COUNT(*) as count FROM contact_requests');
    const totalQuotations = await getQuery('SELECT COUNT(*) as count FROM quotation_requests');
    const pendingReviews = await getQuery('SELECT COUNT(*) as count FROM reviews WHERE is_approved = 0');
    
    // Recent activity log
    const recentActivity = await allQuery(`
      SELECT al.*, a.username 
      FROM activity_logs al 
      LEFT JOIN admins a ON al.admin_id = a.id 
      ORDER BY al.created_at DESC LIMIT 5
    `);

    res.json({
      projectsCount: totalProjects.count,
      clientsCount: totalClients.count,
      inquiriesCount: totalInquiries.count,
      quotationsCount: totalQuotations.count,
      pendingReviewsCount: pendingReviews.count,
      recentActivity
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error retrieving analytics' });
  }
});

// Write log entry helper
async function logActivity(adminId, action, details) {
  try {
    await runQuery(
      'INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)',
      [adminId, action, details]
    );
  } catch (e) {
    console.error('Log activity error:', e);
  }
}

// 2. Client Management
// Get all clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await allQuery(`
      SELECT u.id, u.name, u.email, u.phone, u.company, u.project_id, u.created_at, p.name as project_name 
      FROM users u
      LEFT JOIN projects p ON u.project_id = p.id
      ORDER BY u.created_at DESC
    `);
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Server error fetching clients list' });
  }
});

// Add new client (via admin panel)
router.post('/clients', async (req, res) => {
  const { name, email, password, phone, company, projectId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const checkEmail = await getQuery('SELECT id FROM users WHERE email = ? UNION SELECT id FROM admins WHERE email = ?', [email, email]);
    if (checkEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await runQuery(
      'INSERT INTO users (name, email, password_hash, phone, company, project_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, phone || '', company || '', projectId || null]
    );

    await logActivity(req.user.id, 'ADD_CLIENT', `Created client ${name} (${email})`);
    res.status(201).json({ message: 'Client added successfully', clientId: result.lastID });
  } catch (error) {
    console.error('Admin add client error:', error);
    res.status(500).json({ error: 'Server error adding client' });
  }
});

// Edit client
router.put('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, projectId } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    await runQuery(
      'UPDATE users SET name = ?, email = ?, phone = ?, company = ?, project_id = ? WHERE id = ?',
      [name, email, phone || '', company || '', projectId || null, id]
    );

    await logActivity(req.user.id, 'EDIT_CLIENT', `Updated client ID ${id} (${name})`);
    res.json({ message: 'Client details updated successfully' });
  } catch (error) {
    console.error('Admin update client error:', error);
    res.status(500).json({ error: 'Server error updating client details' });
  }
});

// Delete client
router.delete('/clients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await getQuery('SELECT name, email FROM users WHERE id = ?', [id]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await runQuery('DELETE FROM users WHERE id = ?', [id]);
    await logActivity(req.user.id, 'DELETE_CLIENT', `Deleted client ${client.name} (${client.email})`);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Admin delete client error:', error);
    res.status(500).json({ error: 'Server error deleting client' });
  }
});

// 3. Project Management
// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await allQuery('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(projects);
  } catch (error) {
    console.error('Admin get projects error:', error);
    res.status(500).json({ error: 'Server error retrieving projects' });
  }
});

// Create new project
router.post('/projects', async (req, res) => {
  const { name, clientName, type, description, completionDate, isFeatured, imageUrl } = req.body;

  if (!name || !clientName || !type) {
    return res.status(400).json({ error: 'Project name, client name, and project type are required' });
  }

  try {
    const result = await runQuery(
      `INSERT INTO projects (name, client_name, type, description, completion_date, is_featured, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        clientName,
        type,
        description || '',
        completionDate || '',
        isFeatured ? 1 : 0,
        imageUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'
      ]
    );

    const newProjectId = result.lastID;
    
    // Seed initial progress step at 0%
    await runQuery(
      'INSERT INTO project_progress (project_id, stage, percentage, description) VALUES (?, ?, ?, ?)',
      [newProjectId, 'Project Initiated', 0, 'Project details and scope finalised. Initial setups in planning.']
    );

    await logActivity(req.user.id, 'CREATE_PROJECT', `Created project: ${name}`);
    res.status(201).json({ message: 'Project created successfully', projectId: newProjectId });
  } catch (error) {
    console.error('Admin create project error:', error);
    res.status(500).json({ error: 'Server error creating project' });
  }
});

// Update project
router.put('/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, clientName, type, description, completionDate, isFeatured, imageUrl } = req.body;

  if (!name || !clientName || !type) {
    return res.status(400).json({ error: 'Project name, client name, and project type are required' });
  }

  try {
    await runQuery(
      `UPDATE projects 
       SET name = ?, client_name = ?, type = ?, description = ?, completion_date = ?, is_featured = ?, image_url = ?
       WHERE id = ?`,
      [name, clientName, type, description || '', completionDate || '', isFeatured ? 1 : 0, imageUrl, id]
    );

    await logActivity(req.user.id, 'UPDATE_PROJECT', `Updated project ID ${id}: ${name}`);
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Admin update project error:', error);
    res.status(500).json({ error: 'Server error updating project' });
  }
});

// Delete project
router.delete('/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const project = await getQuery('SELECT name FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await runQuery('DELETE FROM projects WHERE id = ?', [id]);
    await logActivity(req.user.id, 'DELETE_PROJECT', `Deleted project: ${project.name}`);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Admin delete project error:', error);
    res.status(500).json({ error: 'Server error deleting project' });
  }
});

// 4. Project Progress Management
// Get progress details (messages and images) for progress editor
router.get('/projects-progress/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const messages = await allQuery(
      'SELECT id, sender_role, message, created_at FROM project_messages WHERE project_id = ? ORDER BY created_at ASC',
      [id]
    );
    const images = await allQuery(
      'SELECT id, image_url, image_type, created_at FROM project_images WHERE project_id = ? ORDER BY created_at DESC',
      [id]
    );
    res.json({ messages, images });
  } catch (error) {
    console.error('Error fetching project progress details:', error);
    res.status(500).json({ error: 'Server error retrieving progress details' });
  }
});

// Add/update milestone stage progress
router.post('/projects/:id/progress', async (req, res) => {
  const { id } = req.params;
  const { stage, percentage, description } = req.body;

  if (!stage || percentage === undefined) {
    return res.status(400).json({ error: 'Stage title and percentage value are required' });
  }

  try {
    const project = await getQuery('SELECT name FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Insert progress milestone
    await runQuery(
      `INSERT INTO project_progress (project_id, stage, percentage, description)
       VALUES (?, ?, ?, ?)`,
      [id, stage, parseInt(percentage), description || '']
    );

    // Add activity log
    await logActivity(req.user.id, 'UPDATE_PROGRESS', `Updated progress of ${project.name} to ${percentage}%`);

    // Notify client of progress update if they have an email address
    const client = await getQuery('SELECT email, name FROM users WHERE project_id = ?', [id]);
    if (client) {
      console.log(`Simulating automatic notification to client (${client.email}) about progress: ${stage} - ${percentage}%`);
    }

    res.json({ message: 'Progress update recorded successfully' });
  } catch (error) {
    console.error('Admin progress update error:', error);
    res.status(500).json({ error: 'Server error recording progress update' });
  }
});

// Delete a progress milestone
router.delete('/progress/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM project_progress WHERE id = ?', [id]);
    res.json({ message: 'Progress milestone deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting progress milestone' });
  }
});

// Upload progress image
router.post('/projects/:id/images', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { imageType, imageUrl } = req.body; // Can accept direct uploaded file, or external image URL

  if (!imageType) {
    return res.status(400).json({ error: 'Image category type is required' });
  }

  let finalUrl = '';
  if (req.file) {
    // Served relative to the server base
    finalUrl = `/uploads/${req.file.filename}`;
  } else if (imageUrl) {
    finalUrl = imageUrl;
  } else {
    return res.status(400).json({ error: 'No image file uploaded or URL provided' });
  }

  try {
    const project = await getQuery('SELECT name FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await runQuery(
      'INSERT INTO project_images (project_id, image_url, image_type) VALUES (?, ?, ?)',
      [id, finalUrl, imageType]
    );

    await logActivity(req.user.id, 'UPLOAD_IMAGE', `Uploaded progress image (${imageType}) for ${project.name}`);
    res.status(201).json({ message: 'Project image added successfully', imageUrl: finalUrl });
  } catch (error) {
    console.error('Admin upload image error:', error);
    res.status(500).json({ error: 'Server error saving project progress image' });
  }
});

// Delete project image
router.delete('/images/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const img = await getQuery('SELECT image_url FROM project_images WHERE id = ?', [id]);
    if (img && img.image_url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', img.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await runQuery('DELETE FROM project_images WHERE id = ?', [id]);
    res.json({ message: 'Project image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting project image' });
  }
});

// Admin sends message to Client project chat
router.post('/projects/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be blank' });
  }

  try {
    const project = await getQuery('SELECT name FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await runQuery(
      'INSERT INTO project_messages (project_id, sender_role, message) VALUES (?, ?, ?)',
      [id, 'admin', message.trim()]
    );

    res.status(201).json({ message: 'Admin message posted to client chat' });
  } catch (error) {
    console.error('Admin post message error:', error);
    res.status(500).json({ error: 'Server error sending message to client chat' });
  }
});

// 5. Reviews/Ratings Management
// Get all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await allQuery(`
      SELECT r.*, p.name as project_name 
      FROM reviews r
      JOIN projects p ON r.project_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.json(reviews);
  } catch (error) {
    console.error('Admin get reviews error:', error);
    res.status(500).json({ error: 'Server error fetching reviews' });
  }
});

// Approve review
router.put('/reviews/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const review = await getQuery('SELECT project_id, client_name, rating, comment FROM reviews WHERE id = ?', [id]);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await runQuery('UPDATE reviews SET is_approved = 1 WHERE id = ?', [id]);
    
    // Recalculate average rating of project
    const stats = await getQuery(
      'SELECT AVG(rating) as avgRating FROM reviews WHERE project_id = ? AND is_approved = 1',
      [review.project_id]
    );
    const avg = stats.avgRating ? parseFloat(stats.avgRating.toFixed(1)) : 0.0;
    
    await runQuery('UPDATE projects SET rating = ? WHERE id = ?', [avg, review.project_id]);

    // Automatically seed testimonial if rating is 4 or 5 stars
    if (review.rating >= 4) {
      await runQuery(
        'INSERT INTO testimonials (name, designation, message, rating, is_approved) VALUES (?, ?, ?, ?, 1)',
        [review.client_name, 'SVR Verified Client', review.comment || 'Completed project rating submission.', review.rating, 1]
      );
    }

    await logActivity(req.user.id, 'APPROVE_REVIEW', `Approved review from ${review.client_name} (Rating: ${review.rating})`);
    res.json({ message: 'Review approved and project rating recalculated' });
  } catch (error) {
    console.error('Admin approve review error:', error);
    res.status(500).json({ error: 'Server error approving review' });
  }
});

// Reject/delete review
router.delete('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const review = await getQuery('SELECT project_id, client_name FROM reviews WHERE id = ?', [id]);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await runQuery('DELETE FROM reviews WHERE id = ?', [id]);
    
    // Recalculate average rating of project
    const stats = await getQuery(
      'SELECT AVG(rating) as avgRating FROM reviews WHERE project_id = ? AND is_approved = 1',
      [review.project_id]
    );
    const avg = stats.avgRating ? parseFloat(stats.avgRating.toFixed(1)) : 0.0;
    
    await runQuery('UPDATE projects SET rating = ? WHERE id = ?', [avg, review.project_id]);

    await logActivity(req.user.id, 'REJECT_REVIEW', `Deleted review from ${review.client_name}`);
    res.json({ message: 'Review deleted and project rating updated' });
  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({ error: 'Server error deleting review' });
  }
});

// 6. Contact Form Submissions Management
router.get('/contacts', async (req, res) => {
  try {
    const inquiries = await allQuery('SELECT * FROM contact_requests ORDER BY created_at DESC');
    res.json(inquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching contact forms' });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM contact_requests WHERE id = ?', [id]);
    res.json({ message: 'Contact request entry deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting contact record' });
  }
});

// 7. Quotation Requests Management
router.get('/quotations', async (req, res) => {
  try {
    const quotations = await allQuery('SELECT * FROM quotation_requests ORDER BY created_at DESC');
    res.json(quotations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching quotation requests' });
  }
});

router.delete('/quotations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM quotation_requests WHERE id = ?', [id]);
    res.json({ message: 'Quotation request entry deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting quotation record' });
  }
});

// 8. Email Notifications - Send updates manually to clients
router.post('/email-client', async (req, res) => {
  const { clientEmail, subject, message } = req.body;

  if (!clientEmail || !subject || !message) {
    return res.status(400).json({ error: 'Client email, subject, and message are required' });
  }

  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

  const mailOptions = {
    from: GMAIL_USER || 'updates@svrconstruction.co.in',
    to: clientEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; line-height: 1.6;">
        <h2 style="color: #0f172a; margin-top: 0;">SVR Construction & Developers</h2>
        <h4 style="color: #d97706; margin-top: 0; font-weight: 500;">Project Update & Notification</h4>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
        <p>${message.replace(/\n/g, '<br />')}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">
          If you have questions, please log into the <a href="http://localhost:5173/login">Client Portal</a> to post a message in your chat, or contact your project supervisor.
        </p>
      </div>
    `
  };

  if (GMAIL_USER && GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
      });
      await transporter.sendMail(mailOptions);
      await logActivity(req.user.id, 'SEND_EMAIL', `Sent custom email notification to ${clientEmail}`);
      res.json({ message: `Notification email successfully sent to ${clientEmail}` });
    } catch (error) {
      console.error('Nodemailer error sending to client:', error);
      res.status(500).json({ error: 'Failed to send email. Check credentials config.' });
    }
  } else {
    // Simulator Mode
    console.log('\n--- EMAIL CLIENT SIMULATOR (No Credentials Configured) ---');
    console.log(`To Client: ${clientEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${message}`);
    console.log('----------------------------------------------------------\n');
    await logActivity(req.user.id, 'SEND_EMAIL_SIMULATOR', `Simulated email notification to ${clientEmail}`);
    res.json({ message: `Simulated: Notification printed to console. (Set GMAIL_USER & GMAIL_APP_PASSWORD to send actual mail)` });
  }
});

export default router;
