const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Email Service
 * Handles sending emails via SMTP
 */

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    logger.error(`Email transporter verification failed: ${error.message}`);
  } else {
    logger.info('Email transporter verified successfully');
  }
});

/**
 * Send admin approval request email to admin
 */
const sendAdminApprovalEmail = async (adminRequest, approvalLink, rejectLink) => {
  try {
    if (!process.env.ADMIN_EMAIL) {
      logger.warn('ADMIN_EMAIL not configured, skipping email send');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New Admin Access Request from ${adminRequest.firstName} ${adminRequest.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>New Admin Access Request</h2>
          
          <p>A new user has requested admin access rights. Please review their request:</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${adminRequest.firstName} ${adminRequest.lastName}</p>
            <p><strong>Email:</strong> ${adminRequest.email}</p>
            <p><strong>Requested At:</strong> ${new Date(adminRequest.requestedAt).toLocaleString()}</p>
            <p><strong>Reason for Admin Access:</strong></p>
            <p style="margin-top: 10px;">${adminRequest.reason}</p>
          </div>

          <div style="margin: 30px 0;">
            <p style="margin-bottom: 10px;"><strong>Actions:</strong></p>
            <a href="${approvalLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">
              ✓ Approve Request
            </a>
            <a href="${rejectLink}" style="display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              ✗ Reject Request
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This is an automated email from Pharmacy Inventory System. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Admin approval email sent to ${process.env.ADMIN_EMAIL}`);
  } catch (error) {
    logger.error(`Error sending admin approval email: ${error.message}`);
    throw error;
  }
};

/**
 * Send admin approval confirmation email to user
 */
const sendAdminApprovedEmail = async (email, firstName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Admin Access Approved - Pharmacy Inventory System',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Welcome, Admin! 🎉</h2>
          
          <p>Hi ${firstName},</p>
          
          <p>Your request for admin access has been <strong>approved</strong>!</p>
          
          <p>You can now log in to the Pharmacy Inventory System with admin privileges.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Login URL:</strong> <a href="${process.env.APP_URL || 'http://localhost:3000'}/login">${process.env.APP_URL || 'http://localhost:3000'}/login</a></p>
            <p><strong>Email:</strong> ${email}</p>
          </div>

          <p>As an admin, you have full access to:</p>
          <ul>
            <li>User management</li>
            <li>Medicine inventory</li>
            <li>Sales and purchases</li>
            <li>Reports and analytics</li>
            <li>System configuration</li>
          </ul>

          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This is an automated email from Pharmacy Inventory System. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Admin approval confirmation email sent to ${email}`);
  } catch (error) {
    logger.error(`Error sending admin approval email: ${error.message}`);
    throw error;
  }
};

/**
 * Send admin rejection email to user
 */
const sendAdminRejectedEmail = async (email, firstName, rejectionReason) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Admin Access Request - Not Approved',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Admin Access Request Status</h2>
          
          <p>Hi ${firstName},</p>
          
          <p>Thank you for requesting admin access to the Pharmacy Inventory System. Unfortunately, your request has been <strong>not approved</strong> at this time.</p>
          
          ${rejectionReason ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p><strong>Feedback:</strong></p>
            <p>${rejectionReason}</p>
          </div>` : ''}

          <p>You can still use the system as a regular user. If you have questions about this decision, please contact the system administrator.</p>

          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This is an automated email from Pharmacy Inventory System. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Admin rejection email sent to ${email}`);
  } catch (error) {
    logger.error(`Error sending admin rejection email: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendAdminApprovalEmail,
  sendAdminApprovedEmail,
  sendAdminRejectedEmail,
  transporter,
  verifyTransporter: () => {
    return new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          reject(error);
        } else {
          resolve(success);
        }
      });
    });
  },
};
