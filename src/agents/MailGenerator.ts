import { getGemini } from "../lib/gemini.ts";

export class MailGenerator {
  async generate(lead: any, campaign: any) {
    const ai = getGemini();
    const prompt = `Generate a personalized cold email for the following lead:
    Lead Name: ${lead.firstName} ${lead.lastName}
    Company: ${lead.company}
    Role: ${lead.role}
    Industry: ${lead.industry}
    
    Campaign Context: ${campaign.description}
    Tone: Professional yet friendly.
    Length: Short (under 150 words).
    
    Return only the subject line and body.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text || "";
    const [subject, ...bodyLines] = text.split('\n');
    return {
      subject: subject.replace('Subject: ', '').trim(),
      body: bodyLines.join('\n').trim()
    };
  }
}
