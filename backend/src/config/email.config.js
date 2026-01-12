import nodemailer from 'nodemailer';

// Don't create transporter immediately - create it when needed
const getTransporter = () => {
  console.log('🔧 Creating email transporter...');
  console.log('📧 Using EMAIL_USER:', process.env.EMAIL_USER);
  console.log('🔑 Using EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Present' : '❌ Missing');
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send reset code email
export const sendResetCodeEmail = async (userEmail, userName, resetCode) => {
  const transporter = getTransporter();
  
  // Create the reset link with email and code
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?email=${encodeURIComponent(userEmail)}&code=${resetCode}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Password Reset Code - EMEXA',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .reset-code { background-color: #fff; border: 2px dashed #2196F3; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #2196F3; }
          .reset-button { 
            display: inline-block; 
            background-color: #0f6848; 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            margin: 20px 0;
            text-align: center;
          }
          .reset-button:hover { background-color: #0d5a3c; }
          .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .divider { text-align: center; margin: 20px 0; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 Password Reset Request</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>You requested to reset your password. Click the button below to reset your password automatically:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="reset-button">
                🔓 Reset Password Now
              </a>
            </div>
            
            <div class="divider">
              <p>── OR ──</p>
            </div>
            
            <p>Manually enter this code on the password reset page:</p>
            
            <div class="reset-code">
              ${resetCode}
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>⏰ This code will expire in <strong>15 minutes</strong></li>
              <li>🔒 Do not share this code with anyone</li>
              <li>💡 You can either click the button above or enter the code manually</li>
            </ul>
            
            <div class="alert">
              <strong>⚠️ Security Notice:</strong> If you did not request this password reset, please ignore this email or contact support immediately at emexaed@gmail.com
            </div>
            
            <p>Best regards,<br><strong>EMEXA Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>If the button doesn't work, copy and paste this link: <br><a href="${resetLink}">${resetLink}</a></p>
            <p>&copy; ${new Date().getFullYear()} EMEXA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Reset code email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending reset code email:', error);
    throw error;
  }
};

export const sendPasswordChangeEmail = async (userEmail, userName) => {
  const transporter = getTransporter(); // Create transporter here
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Password Changed Successfully - EMEXA',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 Password Changed Successfully</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your password has been successfully changed.</p>
            <p><strong>Change Details:</strong></p>
            <ul>
              <li>📅 Date & Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}</li>
              <li>📧 Email: ${userEmail}</li>
            </ul>
            <div class="alert">
              <strong>⚠️ Important:</strong> If you did not make this change, please contact our support team immediately at emexaed@gmail.com
            </div>
            <p>For your security, we recommend:</p>
            <ul>
              <li>✅ Using a strong, unique password</li>
              <li>✅ Not sharing your password with anyone</li>
              <li>✅ Logging out from devices you don't recognize</li>
            </ul>
            <p>Best regards,<br><strong>EMEXA Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} EMEXA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password change email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending password change email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (userEmail, userName) => {
  const transporter = getTransporter(); // Create transporter here
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Password Reset Successfully - EMEXA',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔓 Password Reset Successfully</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your password has been successfully reset.</p>
            <p><strong>Reset Details:</strong></p>
            <ul>
              <li>📅 Date & Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}</li>
              <li>📧 Email: ${userEmail}</li>
            </ul>
            <div class="alert">
              <strong>⚠️ Important:</strong> If you did not request this password reset, please contact our support team immediately at emexaed@gmail.com
            </div>
            <p>You can now log in with your new password.</p>
            <p>Best regards,<br><strong>EMEXA Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} EMEXA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset confirmation email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};