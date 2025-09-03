// index.js

const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors());         // Allows your frontend to make requests

// Nodemailer transporter setup for Gmail with SSL
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com', // Explicitly add host for better reliability
  port: 465,              // Use port 465 for SSL, which can resolve timeout issues
  secure: true,           // Use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Handles sending emails to both the user and the recipient.
 * @param {object} recipientMail - Options for the email to the recipient.
 * @param {string} userEmail - The email of the sender.
 * @param {string} userSubject - The subject for the user's confirmation email.
 * @param {string} userText - The body for the user's confirmation email.
 */
const sendEmails = async (recipientMail, userEmail, userSubject, userText) => {
  try {
    // Send email to the recipient (e.g., the hospital)
    await transporter.sendMail(recipientMail);

    // Send confirmation email to the sender
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: userSubject,
      text: userText,
    });
    console.log('Emails sent successfully.');
    return true; // Success
  } catch (error) {
    console.error('Email sending failed:', error);
    return false; // Failure
  }
};

// --- API Routes for Form Submissions ---

// Route for Appointment Form
app.post('/api/appointments', async (req, res) => {
  // Handles 'email' or 'e-mail' to prevent conflicts
  const { name, number, message } = req.body;
  const email = req.body.email || req.body['e-mail'];

  if (!name || !number || !email) {
    return res.status(400).json({ message: 'Missing required fields: name, number, or email.' });
  }

  // Define email for the hospital (the receiver)
  const recipientMail = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL, // This is the receiver's email
    subject: 'New Appointment Booking',
    text: `New appointment booked:\nName: ${name}\nPhone: ${number}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Define email for the user (the sender)
  const userSubject = 'Appointment Confirmation - Good Shepherd Hospital';
  const userText = `Hello ${name},\n\nThank you for booking an appointment with Good Shepherd Hospital & Maternity. We have received your request and will contact you shortly to confirm the details.\n\nBest regards,\nThe Good Shepherd Team`;

  const success = await sendEmails(recipientMail, email, userSubject, userText);
  if (success) {
    res.status(200).json({ message: 'Appointment booked successfully! A confirmation has been sent to your email.' });
  } else {
    res.status(500).json({ message: 'Failed to book appointment. Please try again later.' });
  }
});

// Route for Contact Us Form
app.post('/api/contact', async (req, res) => {
  const { name, number, email, message } = req.body;

  // Define email for the hospital (the receiver)
  const recipientMail = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL, // This is the receiver's email
    subject: 'New Message from Contact Form',
    text: `New contact message from:\nName: ${name}\nPhone: ${number}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Define email for the user (the sender)
  const userSubject = 'Contact Form Submission Confirmation';
  const userText = `Hello ${name},\n\nThank you for reaching out to us. We have received your message and will get back to you as soon as possible.\n\nBest regards,\nThe Good Shepherd Team`;

  const success = await sendEmails(recipientMail, email, userSubject, userText);
  if (success) {
    res.status(200).json({ message: 'Message sent successfully! A confirmation has been sent to your email.' });
  } else {
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
});

// Route for FAQ "Ask a Question" Form
app.post('/api/questions', async (req, res) => {
  const { name, email, question } = req.body;

  // Define email for the hospital (the receiver)
  const recipientMail = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL, // This is the receiver's email
    subject: 'New Question from FAQ Page',
    text: `New question from the FAQ section:\nName: ${name}\nEmail: ${email}\nQuestion: ${question}`,
  };

  // Define email for the user (the sender)
  const userSubject = 'Question Submission Confirmation';
  const userText = `Hello ${name},\n\nThank you for your question. We have received it and will get back to you with an answer shortly.\n\nBest regards,\nThe Good Shepherd Team`;

  const success = await sendEmails(recipientMail, email, userSubject, userText);
  if (success) {
    res.status(200).json({ message: 'Question submitted successfully! A confirmation has been sent to your email.' });
  } else {
    res.status(500).json({ message: 'Failed to submit question. Please try again later.' });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => { // Bind to '0.0.0.0' for Railway
  console.log(`Server is running on port ${PORT}`);
});
