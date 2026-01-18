
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, SchemaType } from "@google/genai";

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  async suggestSealContent(topic: string, language: string): Promise<{ topText: string; bottomText: string; centerText: string }> {
    if (!process.env['API_KEY']) {
      console.warn('No API Key found');
      return { topText: 'Example Company', bottomText: 'Since 2024', centerText: '★' };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate short, punchy text for a corporate or creative seal/stamp based on the topic: "${topic}". 
                   Language of output should be: ${language}.
                   "topText" should be the company/entity name (max 20 chars).
                   "bottomText" should be a motto or year/location (max 15 chars).
                   "centerText" should be a very short symbol, kanji, or 1-2 letters representing the entity (max 2 chars).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topText: { type: Type.STRING },
              bottomText: { type: Type.STRING },
              centerText: { type: Type.STRING }
            },
            required: ['topText', 'bottomText', 'centerText']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('No response from AI');
      
      return JSON.parse(text);
    } catch (e) {
      console.error('AI Generation failed', e);
      return { topText: 'Error', bottomText: 'Try Again', centerText: '?' };
    }
  }
}
