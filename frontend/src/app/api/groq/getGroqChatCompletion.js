import dotenv from 'dotenv';
import Groq from "groq-sdk";


dotenv.config();


export default async function main(message) {
  const chatCompletion = await getGroqChatCompletion(message);
  // Print the completion returned by the LLM.

  console.log(chatCompletion.choices[0]?.message?.content)

  return chatCompletion.choices[0]?.message?.content || "";
}

export async function getGroqChatCompletion(messages) {
  const groq = new Groq({ 
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, 
    dangerouslyAllowBrowser: true 
  });

  return groq.chat.completions.create({
    messages: messages,
    model: "llama-3.3-70b-versatile",
  });
}