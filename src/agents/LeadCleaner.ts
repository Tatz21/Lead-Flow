import { getGemini } from "../lib/gemini.ts";
import { Type } from "@google/genai";

export class LeadCleaner {
  async clean(rawData: string) {
    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Clean and structure the following lead data into a JSON array of objects. 
      Fields: firstName, lastName, company, website, industry, role.
      Data: ${rawData}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              firstName: { type: Type.STRING },
              lastName: { type: Type.STRING },
              company: { type: Type.STRING },
              website: { type: Type.STRING },
              industry: { type: Type.STRING },
              role: { type: Type.STRING },
            },
            required: ["firstName", "company"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  }
}
