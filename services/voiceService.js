const axios = require('axios');
const fs = require('fs');
const path = require('path');

class VoiceService {
  constructor() {
    this.apiKey = process.env.ELEVEN_LABS_API_KEY;
    this.baseURL = 'https://api.elevenlabs.io/v1';
  }

  // Test Eleven Labs API connection
  async testAPI() {
    try {
      console.log('Testing Eleven Labs API connection...');
      console.log('API Key:', this.apiKey ? 'Configured' : 'Not configured');
      
      if (!this.apiKey) {
        throw new Error('Eleven Labs API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/voices`, {
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey
        }
      });

      console.log('API test successful, available voices:', response.data.voices?.length || 0);
      return true;
    } catch (error) {
      console.error('API test failed:', error.response?.data || error.message);
      return false;
    }
  }

  // Generate voice from text using Eleven Labs API
  async generateVoice(text, voiceId = '21m00Tcm4TlvDq8ikWAM') {
    try {
      if (!this.apiKey) {
        throw new Error('Eleven Labs API key not configured');
      }

      const response = await axios.post(
        `${this.baseURL}/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      return response.data;
    } catch (error) {
      console.error('Voice generation error:', error);
      throw new Error('Failed to generate voice');
    }
  }

  // Generate booking notification voice
  async generateBookingVoice(bookingData) {
    const { patientName, doctorName, date, time, reason } = bookingData;
    
    const text = `Hello ${patientName}, your appointment with ${doctorName} has been confirmed. 
    Your appointment is scheduled for ${date} at ${time}. 
    Reason for visit: ${reason}. 
    Please arrive 10 minutes before your scheduled time. Thank you.`;

    return await this.generateVoice(text);
  }

  // Generate appointment reminder voice
  async generateReminderVoice(bookingData) {
    const { patientName, doctorName, date, time } = bookingData;
    
    const text = `Hello ${patientName}, this is a reminder for your appointment with ${doctorName} 
    tomorrow on ${date} at ${time}. Please don't forget to bring any relevant medical documents. 
    Thank you.`;

    return await this.generateVoice(text);
  }

  // Save voice file to uploads directory
  async saveVoiceFile(audioBuffer, filename) {
    const uploadsDir = path.join(__dirname, '../uploads/audio');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, audioBuffer);
    
    return `/uploads/audio/${filename}`;
  }

  // Generate and save booking notification voice
  async createBookingNotification(bookingData) {
    try {
      console.log('Creating booking notification with data:', bookingData);
      console.log('Eleven Labs API Key configured:', !!this.apiKey);
      
      const audioBuffer = await this.generateBookingVoice(bookingData);
      console.log('Audio buffer generated, size:', audioBuffer.length);
      
      const filename = `booking_${bookingData._id}_${Date.now()}.mp3`;
      console.log('Saving file with filename:', filename);
      
      const filePath = await this.saveVoiceFile(audioBuffer, filename);
      console.log('File saved at path:', filePath);
      
      return {
        success: true,
        audioUrl: filePath,
        filename: filename
      };
    } catch (error) {
      console.error('Error creating booking notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new VoiceService(); 