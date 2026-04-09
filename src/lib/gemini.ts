import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function processPortrait(base64Image: string, mimeType: string, costumeType: string = 'vest') {
  let costumePrompt = '';
  
  if (costumeType === 'shirt') {
    costumePrompt = 'Change the person\'s outfit to a professional white dress shirt with a neat necktie (cavat).';
  } else {
    // Default to vest/suit with gile
    costumePrompt = 'Change the person\'s outfit to a professional V-neck business suit including a suit jacket, a matching waistcoat (gile) underneath, and a crisp white shirt with a neat necktie (cavat).';
  }

  const prompt = `
    Retouch the skin to be smooth and clear. 
    Keep the person's face 100% identical to the original image. 
    ${costumePrompt}
    Set the background to a solid professional light gray color (studio gray). 
    The composition must be a waist-up portrait, centered in the frame.
    The person should be in a natural, professional portrait pose.
    High definition quality, professional studio lighting, sharp details.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned from AI");
  } catch (error) {
    console.error("Error processing portrait:", error);
    throw error;
  }
}
