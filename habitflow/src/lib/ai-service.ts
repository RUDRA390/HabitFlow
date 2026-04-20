import { GoogleGenAI } from "@google/genai";
import { Habit, Task, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getAIInsights = async (habits: Habit[], tasks: Task[], profile: UserProfile | null) => {
  try {
    const prompt = `
      You are a world-class Behavioral Psychologist and Productivity Coach. 
      Analyze the following data for user ${profile?.displayName || 'User'}:
      
      Level: ${profile?.level} (${profile?.title})
      XP: ${profile?.xp}
      Coins: ${profile?.coins}
      Total Focus Time: ${profile?.totalFocusTime}m
      Goals: ${profile?.goals || 'Not set'}
      
      Habits:
      ${habits.map(h => `- ${h.name} (${h.category}): Streak ${h.streak}, Longest ${h.longestStreak}, Completed Dates: ${h.completedDates.join(', ')}`).join('\n')}
      
      Tasks:
      ${tasks.map(t => `- ${t.title} (${t.priority}): ${t.completed ? 'Completed' : 'Pending'}`).join('\n')}
      
      Your task is to provide a "Personal Coach Report":
      1. **Behavioral Analysis**: Identify patterns. When is the user most productive? Which habits are they struggling with?
      2. **Predictive Warning**: Predict potential failures. (e.g., "You tend to miss your workout on Wednesdays").
      3. **Dynamic Schedule Suggestions**: Suggest moving tasks or habits to better times based on patterns.
      4. **Emotional Reinforcement**: Provide a powerful, personalized motivational message that visualizes their "Future Self."
      5. **Recovery Plan**: If they've missed habits recently, give a "No-Guilt" recovery strategy.
      
      Format the response in a professional, premium Markdown style with clear headings and bullet points.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Your coach is currently reflecting on your progress. Check back soon!";
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Failed to connect with your AI coach. Please ensure your API key is configured.";
  }
};

