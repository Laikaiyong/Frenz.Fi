import Groq from "groq-sdk";
import axios from "axios";

export async function performWebSearch(query) {
  try {
    const searchResponse = await axios.post(
      "https://google.serper.dev/search",
      {
        q: query,
      },
      {
        headers: {
          "X-API-KEY": process.env.NEXT_PUBLIC_SERPER_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const results = searchResponse.data;
    const topResults = results.organic.slice(0, 3);

    // Get knowledge graph if available
    const knowledge = results.knowledgeGraph
      ? {
          title: results.knowledgeGraph.title,
          description: results.knowledgeGraph.description,
          attributes: results.knowledgeGraph.attributes,
        }
      : null;

    // Scrape content from top results
    const scrapedContents = await Promise.all(
      topResults.map(async (result) => {
        try {
          const scrapeResponse = await axios.post(
            "https://scrape.serper.dev",
            {
              url: result.link,
            },
            {
              headers: {
                "X-API-KEY": process.env.NEXT_PUBLIC_SERPER_API_KEY,
                "Content-Type": "application/json",
              },
            }
          );

          return {
            title: result.title,
            link: result.link,
            snippet: result.snippet,
            content: scrapeResponse.data.text.slice(0, 1000), // First 1000 chars
          };
        } catch (error) {
          console.error(`Scraping error for ${result.link}:`, error);
          return {
            title: result.title,
            link: result.link,
            snippet: result.snippet,
            content: null,
          };
        }
      })
    );

    return {
      knowledge,
      results: scrapedContents,
    };
  } catch (error) {
    console.error("Search error:", error);
    return { knowledge: null, results: [] };
  }
}

export default async function main(message, previousMessages) {
  const needsSearch =
    message.toLowerCase().includes("search") ||
    message.toLowerCase().includes("find") ||
    message.toLowerCase().includes("what is") ||
    message.toLowerCase().includes("how to");

  let searchContext = "";
  let searchResults;
  if (needsSearch) {
    searchResults = await performWebSearch(message);

    if (searchResults.knowledge) {
      searchContext += `Knowledge Graph:\n${searchResults.knowledge.title}\n${searchResults.knowledge.description}\n\n`;
    }

    searchContext += "Search Results:\n";
    searchResults.results.forEach((result, index) => {
      searchContext += `[${index + 1}] ${result.title}\n`;
      searchContext += `URL: ${result.link}\n`;
      searchContext += `Summary: ${result.snippet}\n`;
      if (result.content) {
        searchContext += `Content: ${result.content}\n`;
      }
      searchContext += "\n";
    });
  }
  let messages = [
    {
      role: "system",
      content: `You are a helpful AI assistant with web search capabilities. 
                When providing information from search results, cite your sources using [1], [2], etc.
                Format responses using markdown for better readability.
                ${
                  searchContext
                    ? `\nHere is the context from web search:\n${searchContext}`
                    : ""
                }`,
    },
  ];

  // Add previous messages if they exist
  if (
    previousMessages &&
    Array.isArray(previousMessages) &&
    previousMessages.length > 0
  ) {
    messages = [...messages, ...previousMessages];
  }

  // Add the current user message
  messages.push({
    role: "user",
    content: message,
  });

  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const chatCompletion = await groq.chat.completions.create({
    messages: messages,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 0.9,
  });

  return {
    message: chatCompletion.choices[0]?.message?.content || "",
    searchResults: searchResults,
  };
}
