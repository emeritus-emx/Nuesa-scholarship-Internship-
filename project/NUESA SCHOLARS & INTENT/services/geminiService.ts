
import { GoogleGenAI } from "@google/genai";
import { AISearchResult, GroundingChunk } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const searchOpportunities = async (query: string, category: 'scholarship' | 'internship'): Promise<AISearchResult> => {
  if (!apiKey) {
    return {
      text: "API Key is missing.",
      sources: []
    };
  }

  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    Find current and active ${category}s related to: "${query}".
    
    Please find the top 3-5 opportunities.
    For EACH opportunity, you MUST use this exact format:
    
    ### [Title of Opportunity]
    - **Provider**: [Provider Name]
    - **Amount**: [Value or Stipend amount e.g. $10,000, Full Tuition, Unpaid]
    - **Deadline**: [Date or "Open"]
    - **Link**: [The direct official application URL]
    - **Summary**: [A short description, 1-2 sentences]
    
    If exact details like Amount, Deadline, or Link are not found, state "Not specified".
    Do not invent opportunities; use the Google Search tool to find real ones.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No details found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    
    return {
      text,
      sources: chunks.filter(c => c.web?.uri)
    };

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return { text: "Error searching opportunities.", sources: [] };
  }
};

// Updated: Real-time Discovery Service for Notifications with Link support
export const discoverTrendingOpportunities = async (): Promise<{title: string, provider: string, type: 'scholarship' | 'internship', link: string}[]> => {
  if (!apiKey) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Find 2-3 of the absolute latest scholarships or internships announced in Nigeria or globally for African students in the last 48 hours. Return a simple list with Title, Provider, Type, and Link (direct official URL) as a JSON array of objects. Use only 'scholarship' or 'internship' as the type string.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    try {
      const data = JSON.parse(response.text);
      if (Array.isArray(data)) {
        return data.map(item => ({
          title: item.title || item.Title || 'New Opportunity',
          provider: item.provider || item.Provider || 'Verified Source',
          type: (item.type || item.Type || 'scholarship').toLowerCase() as 'scholarship' | 'internship',
          link: item.link || item.Link || '#'
        }));
      }
    } catch (parseError) {
      console.error("JSON Parse Error in Discovery:", parseError, response.text);
    }
    return [];
  } catch (e) {
    console.error("Discovery error:", e);
    return [];
  }
};

export const getAdvice = async (topic: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Give brief, actionable advice for a student asking about: ${topic}. Keep it under 100 words.`
        });
        return response.text || "No advice generated.";
    } catch (e) {
        return "Could not generate advice.";
    }
}
