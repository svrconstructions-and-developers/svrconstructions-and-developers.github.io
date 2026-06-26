import express from 'express';
import { getQuery, allQuery, runQuery } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. Get Client Project Dashboard
router.get('/dashboard', authenticateToken, async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ error: 'Access denied. Client account required.' });
  }

  try {
    // Get client user and project details
    const client = await getQuery('SELECT name, company, project_id FROM users WHERE id = ?', [req.user.id]);
    if (!client) {
      return res.status(404).json({ error: 'Client account not found' });
    }

    if (!client.project_id) {
      return res.json({
        message: 'No project assigned yet',
        hasProject: false,
        clientName: client.name,
        companyName: client.company
      });
    }

    // Fetch project
    const project = await getQuery('SELECT * FROM projects WHERE id = ?', [client.project_id]);
    if (!project) {
      return res.status(404).json({ error: 'Assigned project not found' });
    }

    // Fetch progress steps
    const progressSteps = await allQuery(
      'SELECT id, stage, percentage, description, updated_at FROM project_progress WHERE project_id = ? ORDER BY percentage ASC',
      [client.project_id]
    );

    // Get current completion percentage (max percentage of completed stages, or compute average / last updated)
    // Let's get the highest stage percentage that is complete or active
    const latestProgress = await getQuery(
      'SELECT percentage FROM project_progress WHERE project_id = ? ORDER BY percentage DESC LIMIT 1',
      [client.project_id]
    );
    const overallPercentage = latestProgress ? latestProgress.percentage : 0;

    // Fetch progress images
    const images = await allQuery(
      'SELECT id, image_url, image_type, created_at FROM project_images WHERE project_id = ? ORDER BY created_at DESC',
      [client.project_id]
    );

    // Fetch messages/chat history
    const messages = await allQuery(
      'SELECT id, sender_role, message, created_at FROM project_messages WHERE project_id = ? ORDER BY created_at ASC',
      [client.project_id]
    );

    res.json({
      hasProject: true,
      clientName: client.name,
      companyName: client.company,
      project: {
        ...project,
        overallPercentage,
        progressSteps,
        images,
        messages
      }
    });
  } catch (error) {
    console.error('Client dashboard error:', error);
    res.status(500).json({ error: 'Server error retrieving client dashboard' });
  }
});

// 2. Send Message to Admin
router.post('/messages', authenticateToken, async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ error: 'Access denied. Client account required.' });
  }

  const { message } = req.body;
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    // Get client project ID
    const client = await getQuery('SELECT project_id FROM users WHERE id = ?', [req.user.id]);
    if (!client || !client.project_id) {
      return res.status(400).json({ error: 'No project assigned. Cannot send message.' });
    }

    await runQuery(
      'INSERT INTO project_messages (project_id, sender_role, message) VALUES (?, ?, ?)',
      [client.project_id, 'client', message.trim()]
    );

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send client message error:', error);
    res.status(500).json({ error: 'Server error sending message' });
  }
});

export default router;
