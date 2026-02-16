
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ReadingType } from "../types";

export const analyzeImage = async (base64Image: string, type: ReadingType): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const palmPrompt = `
    당신은 30년 경력의 신비롭고 예리한 전문 손금 관상가입니다. 
    사용자가 업로드한 손바닥 사진을 분석하여 다음 항목들에 대한 상세한 해석을 제공해주세요.
    1. 생명선 (건강, 장수)
    2. 두뇌선 (지능, 사고방식)
    3. 감정선 (애정운, 인간관계)
    4. 운명선 (성공, 전환점)
    반드시 한국어로 응답하며 JSON 형식을 따르세요.
  `;

  const facePrompt = `
    당신은 30년 경력의 전설적인 동양 관상가입니다. 
    사용자가 업로드한 얼굴 사진을 분석하여 다음 항목들에 대한 상세한 관상을 봐주세요.
    1. 이마 (초년운, 부모복)
    2. 눈 (성격, 기질)
    3. 코 (재물운, 성공운)
    4. 입 (말년운, 사회성)
    반드시 한국어로 응답하며 JSON 형식을 따르세요.
  `;

  const systemInstruction = type === 'PALM' ? palmPrompt : facePrompt;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1]
          }
        }
      ]
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          sections: {
            type: Type.OBJECT,
            properties: {
              part1: { 
                type: Type.OBJECT, 
                properties: { 
                  title: { type: Type.STRING, description: type === 'PALM' ? '생명선' : '이마' },
                  description: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                } 
              },
              part2: { 
                type: Type.OBJECT, 
                properties: { 
                  title: { type: Type.STRING, description: type === 'PALM' ? '두뇌선' : '눈' },
                  description: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                } 
              },
              part3: { 
                type: Type.OBJECT, 
                properties: { 
                  title: { type: Type.STRING, description: type === 'PALM' ? '감정선' : '코' },
                  description: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                } 
              },
              part4: { 
                type: Type.OBJECT, 
                properties: { 
                  title: { type: Type.STRING, description: type === 'PALM' ? '운명선' : '입' },
                  description: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                } 
              }
            },
            required: ['part1', 'part2', 'part3', 'part4']
          },
          traits: { type: Type.ARRAY, items: { type: Type.STRING } },
          advice: { type: Type.STRING }
        },
        required: ['summary', 'sections', 'traits', 'advice']
      }
    }
  });

  try {
    const resultText = response.text || '{}';
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("분석 중 오류가 발생했습니다.");
  }
};
