import axios from 'axios';

export class MailSender {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
  }

  async send(to: string, subject: string, htmlContent: string) {
    if (!this.apiKey) {
      console.warn("BREVO_API_KEY not set, simulating send.");
      return { messageId: "simulated-" + Date.now() };
    }

    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: "LeadFlow AI", email: "outreach@leadflow.ai" },
          to: [{ email: to }],
          subject: subject,
          htmlContent: htmlContent,
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error sending email via Brevo:", error.response?.data || error.message);
      throw error;
    }
  }
}
