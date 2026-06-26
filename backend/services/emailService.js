import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const { ADMIN_EMAIL, GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

// Create email transporter
let transporter = null;
if (GMAIL_USER && GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Send an email alert to the admin
 * @param {object} details Information about the request
 * @param {string} details.fullName Full Name of requester
 * @param {string} details.email Email
 * @param {string} details.phone Phone
 * @param {string} details.company Company (optional)
 * @param {string} details.message Message / Details
 * @param {string} details.requestType 'Registration' | 'Contact Submission' | 'Quotation Request'
 */
export async function sendAdminAlert(details) {
  const { fullName, email, phone, company = 'N/A', message, requestType } = details;
  const dateStr = new Date().toLocaleString();

  const mailOptions = {
    from: GMAIL_USER || 'noreply@svrconstruction.co.in',
    to: ADMIN_EMAIL || 'admin@svrconstruction.co.in',
    subject: `SVR Construction Alert: New ${requestType}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; color: #333;">
        <h2 style="color: #d97706; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; margin-top: 0;">New SVR Notification</h2>
        <p><strong>Notification Type:</strong> ${requestType}</p>
        <p><strong>Timestamp:</strong> ${dateStr}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 140px;">Full Name:</td>
            <td style="padding: 6px 0;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Email Address:</td>
            <td style="padding: 6px 0;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Phone Number:</td>
            <td style="padding: 6px 0;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Company:</td>
            <td style="padding: 6px 0;">${company}</td>
          </tr>
        </table>
        
        <div style="margin-top: 15px; padding: 12px; background-color: #f9f9f9; border-radius: 4px; border-left: 4px solid #d97706;">
          <h4 style="margin: 0 0 8px 0; color: #555;">Message details:</h4>
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.5;">${message}</p>
        </div>
        
        <p style="font-size: 11px; color: #888; margin-top: 20px; text-align: center;">
          Sent automatically by SVR Construction Web Portal.
        </p>
      </div>
    `
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email notification sent to Admin (${ADMIN_EMAIL}) for: ${requestType}`);
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  } else {
    console.log('\n--- EMAIL NOTIFICATION SIMULATOR (No Gmail Credentials Configured) ---');
    console.log(`To: ${ADMIN_EMAIL || 'admin@svrconstruction.co.in'}`);
    console.log(`Subject: SVR Construction Alert: New ${requestType}`);
    console.log(`Body Details:
      Request Type: ${requestType}
      Full Name: ${fullName}
      Email: ${email}
      Phone: ${phone}
      Company: ${company}
      Message: ${message}
      Timestamp: ${dateStr}
    `);
    console.log('--------------------------------------------------------------------\n');
  }
}
