import nodemailer from 'nodemailer';
import User from '../models/user.js';
import Student from '../models/student.js';
import Teacher from '../models/teacher.js';

// Get transporter for sending emails
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send email notification if user has email notifications enabled
 * @param {string} userId - User ID
 * @param {string} userEmail - User email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email HTML content
 * @returns {Promise<boolean>} - Returns true if email was sent, false if user has notifications disabled
 */
export const sendEmailNotification = async (userId, userEmail, subject, htmlContent) => {
  try {
    // Fetch user to check notification settings
    let user = await User.findById(userId);
    if (!user) user = await Student.findById(userId);
    if (!user) user = await Teacher.findById(userId);

    if (!user) {
      console.warn('⚠️ User not found for email notification:', userId);
      return false;
    }

    // Check if email notifications are enabled
    const emailNotificationsEnabled = user.notificationSettings?.emailNotifications ?? 
                                     user.settings?.emailNotifications ?? 
                                     true; // Default to true if not specified

    if (!emailNotificationsEnabled) {
      console.log('🔕 Email notifications disabled for user:', userId);
      return false;
    }

    // Send email
    const transporter = getTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email notification sent to:', userEmail);
    return true;

  } catch (error) {
    console.error('❌ Error sending email notification:', error);
    return false;
  }
};

/**
 * Send quiz assignment notification email
 */
export const sendQuizAssignmentEmail = async (userEmail, userName, quizTitle, quizSubject, teacherName) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .quiz-info { background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📋 New Quiz Assigned</h2>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>A new quiz has been assigned to you by <strong>${teacherName}</strong>.</p>
          
          <div class="quiz-info">
            <p><strong>Quiz Title:</strong> ${quizTitle}</p>
            <p><strong>Subject:</strong> ${quizSubject}</p>
            <p><strong>Instructor:</strong> ${teacherName}</p>
          </div>
          
          <p>Please log in to EMEXA to view the quiz details and complete it before the deadline.</p>
          
          <p>Best regards,<br><strong>EMEXA Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} EMEXA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

/**
 * Send quiz submission notification email
 */
export const sendQuizSubmissionEmail = async (userEmail, userName, quizTitle, score) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .score-box { background-color: #c8e6c9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; text-align: center; }
        .score-number { font-size: 32px; font-weight: bold; color: #2e7d32; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Quiz Submitted Successfully</h2>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your quiz submission has been recorded.</p>
          
          <div class="score-box">
            <p><strong>Quiz Title:</strong> ${quizTitle}</p>
            <p class="score-number">${score}</p>
            <p><strong>Your Score</strong></p>
          </div>
          
          <p>You can view your results and detailed feedback by logging into EMEXA.</p>
          
          <p>Best regards,<br><strong>EMEXA Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} EMEXA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

/**
 * Send profile update confirmation email
 */
export const sendProfileUpdateEmail = async (userEmail, userName) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✏️ Profile Updated</h2>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your profile has been successfully updated.</p>
          
          <div class="alert">
            <strong>📝 Changes Made:</strong>
            <p>Your profile information was modified on ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}</p>
          </div>
          
          <p>If you did not make this change, please contact our support team immediately.</p>
          
          <p>Best regards,<br><strong>EMEXA Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} EMEXA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

/**
 * Send settings change confirmation email
 */
export const sendSettingsChangeEmail = async (userEmail, userName, changedSettings) => {
  const settingsList = Object.entries(changedSettings)
    .map(([key, value]) => `<li>${key}: ${value ? '✓ Enabled' : '✗ Disabled'}</li>`)
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .settings-list { background-color: #f3e5f5; border-left: 4px solid #9C27B0; padding: 15px; margin: 20px 0; }
        .settings-list ul { margin: 10px 0; padding-left: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>⚙️ Settings Updated</h2>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your settings have been successfully updated.</p>
          
          <div class="settings-list">
            <p><strong>Changed Settings:</strong></p>
            <ul>
              ${settingsList}
            </ul>
          </div>
          
          <p>If you did not make these changes, please contact our support team immediately at emexaed@gmail.com</p>
          
          <p>Best regards,<br><strong>EMEXA Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} EMEXA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};
