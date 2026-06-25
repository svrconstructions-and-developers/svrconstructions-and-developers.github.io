import express from 'express';
import { runQuery } from '../database/db.js';
import { sendAdminAlert } from '../services/emailService.js';

const router = express.Router();

// 1. Submit Contact Form
router.post('/', async (req, res) => {
  const { name, email, phone, company, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields' });
  }

  try {
    await runQuery(
      `INSERT INTO contact_requests (name, email, phone, company, service, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone || '', company || '', service || '', message]
    );

    // Send admin notification
    await sendAdminAlert({
      fullName: name,
      email,
      phone: phone || 'N/A',
      company: company || 'N/A',
      message: `Selected Service: ${service || 'None'}\n\nMessage:\n${message}`,
      requestType: 'Contact Submission'
    });

    res.status(201).json({ message: 'Thank you! Your contact request has been received.' });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Server error processing contact request' });
  }
});

// 2. Submit Quotation Request
router.post('/quotation', async (req, res) => {
  const { name, email, phone, company, details } = req.body;

  if (!name || !email || !details) {
    return res.status(400).json({ error: 'Name, email, and description of works are required fields' });
  }

  try {
    await runQuery(
      `INSERT INTO quotation_requests (name, email, phone, company, details)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || '', company || '', details]
    );

    // Send admin notification
    await sendAdminAlert({
      fullName: name,
      email,
      phone: phone || 'N/A',
      company: company || 'N/A',
      message: `Quotation details:\n${details}`,
      requestType: 'Quotation Request'
    });

    res.status(201).json({ message: 'Thank you! Your quotation request has been received.' });
  } catch (error) {
    console.error('Quotation request error:', error);
    res.status(500).json({ error: 'Server error processing quotation request' });
  }
});

export default router;
