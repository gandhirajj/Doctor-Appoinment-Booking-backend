const axios = require('axios');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.baseURL = 'https://api.brevo.com/v3';
  }

  // Generate HTML email content with voice notification
  generateEmailHTML(recipientName, appointment, voiceUrl = null) {
    const doctorName = appointment.doctor?.user?.name || appointment.doctor?.name || 'your doctor';
    const date = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const time = appointment.time;

    const voiceSection = voiceUrl ? `
      <div style="margin: 20px 0; padding: 15px; background-color: #e3f2fd; border-radius: 5px;">
        <h3>🎵 Voice Notification</h3>
        <p>Listen to your appointment details:</p>
        <audio controls style="width: 100%;">
          <source src="${voiceUrl}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        <p><small>If the audio doesn't play, you can download the voice message from your dashboard.</small></p>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Appointment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }
          .voice-section { margin: 20px 0; padding: 15px; background-color: #e3f2fd; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Confirmation</h1>
          </div>
          <div class="content">
            <h2>Hello ${recipientName},</h2>
            <p>Your appointment has been confirmed successfully!</p>
            <ul>
              <li><strong>Doctor:</strong> ${doctorName}</li>
              <li><strong>Date:</strong> ${date}</li>
              <li><strong>Time:</strong> ${time}</li>
              <li><strong>Reason:</strong> ${appointment.reason}</li>
            </ul>
            <p>Please arrive 10 minutes early for your appointment.</p>
            ${voiceSection}
            <p>If you need to reschedule or cancel your appointment, please contact us as soon as possible.</p>
            <p>Thank you for choosing our service!</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send email with voice attachment
  async sendEmailWithVoice(recipientEmail, recipientName, subject, appointment, voiceFilePath = null) {
    try {
      if (!this.apiKey) {
        throw new Error('Brevo API key not configured');
      }

      const emailData = {
        sender: {
          name: 'Doctor Appointment System',
          email: 'noreply@doctorappointment.com'
        },
        to: [
          {
            email: recipientEmail,
            name: recipientName
          }
        ],
        subject: subject,
        htmlContent: this.generateEmailHTML(recipientName, appointment, voiceFilePath)
      };

      // Add attachment if voice file exists
      if (voiceFilePath && fs.existsSync(path.join(__dirname, '..', voiceFilePath))) {
        const audioBuffer = fs.readFileSync(path.join(__dirname, '..', voiceFilePath));
        const base64Audio = audioBuffer.toString('base64');
        
        emailData.attachment = [
          {
            name: 'appointment_voice.mp3',
            content: base64Audio
          }
        ];
      }

      const response = await axios.post(
        `${this.baseURL}/smtp/email`,
        emailData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          }
        }
      );

      console.log('Email with voice sent successfully:', response.data);
      return {
        success: true,
        messageId: response.data.messageId
      };
    } catch (error) {
      console.error('Error sending email with voice:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Send simple text email (fallback)
  async sendSimpleEmail(recipientEmail, recipientName, subject, message) {
    try {
      if (!this.apiKey) {
        throw new Error('Brevo API key not configured');
      }

      const emailData = {
        sender: {
          name: 'Doctor Appointment System',
          email: 'noreply@doctorappointment.com'
        },
        to: [
          {
            email: recipientEmail,
            name: recipientName
          }
        ],
        subject: subject,
        textContent: message
      };

      const response = await axios.post(
        `${this.baseURL}/smtp/email`,
        emailData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          }
        }
      );

      console.log('Email sent successfully:', response.data);
      return {
        success: true,
        messageId: response.data.messageId
      };
    } catch (error) {
      console.error('Error sending email:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

module.exports = new EmailService(); 