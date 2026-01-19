
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHydrationAdvice = async (weight: number, currentIntake: number, goal: number) => {
  try {
    const response = await ai.models.generateContent({
      // Use gemini-3-flash-preview for basic encouragement and summarization tasks
      model: "gemini-3-flash-preview",
      contents: `User weighs ${weight}kg, has drunk ${currentIntake}ml today out of a ${goal}ml goal. Give a short, encouraging hydration tip or fact (max 2 sentences).`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    // Accessing the .text property directly as per Gemini API best practices
    return response.text?.trim() || "Water is essential for your body to function correctly. Keep sipping!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Stay hydrated for better focus and energy throughout your day.";
  }
};

export const getSmartGoal = async (weight: number, activityLevel: string) => {
  try {
    const response = await ai.models.generateContent({
      // Upgraded to gemini-3-pro-preview for reasoning-heavy calculation tasks
      model: "gemini-3-pro-preview",
      contents: `Calculate the ideal daily water intake in ml for a person weighing ${weight}kg with ${activityLevel} activity level. Return only a JSON object with a 'ml' property.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ml: { type: Type.NUMBER }
          },
          required: ["ml"]
        }
      }
    });
    // Safely extract text from the response property
    const jsonStr = response.text?.trim() || "{}";
    const data = JSON.parse(jsonStr);
    return data.ml as number;
  } catch (error) {
    console.error("Smart Goal Error:", error);
    return weight * 35; // Rough fallback: 35ml per kg
  }
};
