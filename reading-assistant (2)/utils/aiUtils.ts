
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const scanPassage = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: "Extract all text from this reading passage accurately. Return only the plain text of the passage." }
        ]
      }
    ]
  });
  return response.text || "";
};

export const analyzePassage = async (passage: string, language: 'English' | 'Japanese') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: passage,
    config: {
      systemInstruction: `You are a professional language tutor. Analyze the provided reading passage. Identify key grammar structures and important vocabulary. IMPORTANT: Provide all explanations, meanings, and summaries in ${language.toUpperCase()}. Use English only for the target words and examples. Format as JSON.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grammarPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                structure: { type: Type.STRING },
                explanation: { type: Type.STRING, description: `Explanation in ${language}` },
                examples: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          vocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                partOfSpeech: { type: Type.STRING },
                contextualMeaning: { type: Type.STRING, description: `Meaning in ${language}` },
                pronunciationTip: { type: Type.STRING }
              }
            }
          },
          summary: { type: Type.STRING, description: `Summary in ${language}` }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getWordInsight = async (word: string, fullPassage: string, language: 'English' | 'Japanese') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Word: "${word}"\nFull Context: "${fullPassage}"`,
    config: {
      systemInstruction: `Explain the meaning of the word based specifically on its context in the provided passage. Use ${language.toUpperCase()} for the meaning and grammar notes. Include an American English pronunciation guide (IPA or phonetic spelling).`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meaning: { type: Type.STRING, description: `${language} explanation` },
          pronunciation: { type: Type.STRING },
          grammarNote: { type: Type.STRING, description: `Optional ${language} note about grammar` }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const speakWord = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say clearly in a natural American accent: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return;

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
};
