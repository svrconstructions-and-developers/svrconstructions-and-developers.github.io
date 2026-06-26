import express from 'express';
import { allQuery } from '../database/db.js';

const router = express.Router();

// 1. Get all services
router.get('/services', async (req, res) => {
  try {
    const services = await allQuery('SELECT * FROM services ORDER BY id ASC');
    res.json(services);
  } catch (error) {
    console.error('Fetch services error:', error);
    res.status(500).json({ error: 'Server error fetching services' });
  }
});

// 2. Get all FAQs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await allQuery('SELECT * FROM faq ORDER BY id ASC');
    res.json(faqs);
  } catch (error) {
    console.error('Fetch FAQs error:', error);
    res.status(500).json({ error: 'Server error fetching FAQs' });
  }
});

// 3. Get all approved testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await allQuery('SELECT * FROM testimonials WHERE is_approved = 1 ORDER BY created_at DESC');
    res.json(testimonials);
  } catch (error) {
    console.error('Fetch testimonials error:', error);
    res.status(500).json({ error: 'Server error fetching testimonials' });
  }
});

export default router;
