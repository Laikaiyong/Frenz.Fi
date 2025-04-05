import dotenv from 'dotenv';
import Groq from "groq-sdk";


dotenv.config();


export default async function main(message) {
  const chatCompletion = await getGroqChatCompletion(message);
  // Print the completion returned by the LLM.

  return chatCompletion.choices[0]?.message?.content || "";
}

export async function getGroqChatCompletion(message) {
  const groq = new Groq({ 
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, 
    dangerouslyAllowBrowser: true 
  });

  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}