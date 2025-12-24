
import { GoogleGenAI } from "@google/genai";
import { MODELS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTherapyResponse = async (history: { role: string; parts: { text: string }[] }[], prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODELS.chat,
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a compassionate, professional, and non-judgmental AI Therapist. Use active listening, validate emotions, and offer gentle coping strategies. Keep responses concise but warm.",
        temperature: 0.7,
        topP: 0.9,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm here for you, but I'm having a small technical issue connecting. Let's try again in a moment.";
  }
};

export const analyzeMoodFromJournal = async (journalContent: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODELS.chat,
      contents: `Analyze the mood of this journal entry and return a single word (e.g., Happy, Sad, Anxious, Peaceful, Determined): "${journalContent}"`,
    });
    return response.text.trim();
  } catch (error) {
    return "Reflective";
  }
};
