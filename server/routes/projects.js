import express from 'express';
import { runQuery, getQuery, allQuery } from '../database/db.js';

const router = express.Router();

// 1. Get all projects (supports searching and filtering by type)
router.get('/', async (req, res) => {
  const { search, type, featured } = req.query;
  let query = 'SELECT * FROM projects WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR client_name LIKE ? OR description LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (featured) {
    query += ' AND is_featured = ?';
    params.push(parseInt(featured));
  }

  query += ' ORDER BY completion_date DESC';

  try {
    const projects = await allQuery(query, params);
    
    // For each project, fetch total approved reviews count and calculate dynamic average rating
    for (let proj of projects) {
      const stats = await getQuery(
        `SELECT COUNT(*) as count, AVG(rating) as avgRating FROM reviews WHERE project_id = ? AND is_approved = 1`,
        [proj.id]
      );
      proj.review_count = stats.count || 0;
      proj.average_rating = stats.avgRating ? parseFloat(stats.avgRating.toFixed(1)) : 0.0;
    }
    
    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Server error retrieving projects list' });
  }
});

// 2. Get project details (including public reviews and milestones)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const project = await getQuery('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Fetch approved reviews
    const reviews = await allQuery(
      'SELECT id, client_name, rating, comment, created_at FROM reviews WHERE project_id = ? AND is_approved = 1 ORDER BY created_at DESC',
      [id]
    );

    // Fetch project progress/milestones
    const milestones = await allQuery(
      'SELECT id, stage, percentage, description, updated_at FROM project_progress WHERE project_id = ? ORDER BY percentage ASC',
      [id]
    );

    // Calculate rating stats
    const stats = await getQuery(
      'SELECT COUNT(*) as count, AVG(rating) as avgRating FROM reviews WHERE project_id = ? AND is_approved = 1',
      [id]
    );

    project.reviews = reviews;
    project.milestones = milestones;
    project.review_count = stats.count || 0;
    project.average_rating = stats.avgRating ? parseFloat(stats.avgRating.toFixed(1)) : 0.0;

    res.json(project);
  } catch (error) {
    console.error('Fetch project details error:', error);
    res.status(500).json({ error: 'Server error retrieving project details' });
  }
});

// 3. Submit a review for a project (Needs Admin approval)
router.post('/:id/reviews', async (req, res) => {
  const { id } = req.params;
  const { clientName, rating, comment } = req.body;

  if (!clientName || !rating) {
    return res.status(400).json({ error: 'Client name and rating are required' });
  }

  const ratingVal = parseInt(rating);
  if (ratingVal < 1 || ratingVal > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
  }

  try {
    const project = await getQuery('SELECT id FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await runQuery(
      'INSERT INTO reviews (project_id, client_name, rating, comment, is_approved) VALUES (?, ?, ?, ?, 0)',
      [id, clientName, ratingVal, comment || '']
    );

    res.status(201).json({
      message: 'Review submitted successfully. It will be visible once approved by an administrator.'
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Server error submitting review' });
  }
});

export default router;
