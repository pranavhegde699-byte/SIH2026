const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Embedding Service
 * Uses Google Gemini's gemini-embedding-001 model.
 */

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables. Please add it to your .env file.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Embed a text string into a vector array using Gemini's embedding model.
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - The embedding vector.
 */
const embedText = async (text) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    if (error.message.includes('GEMINI_API_KEY')) {
      throw error; // Re-throw our custom key-missing error
    }
    throw new Error(`Embedding API call failed: ${error.message}`);
  }
};

module.exports = { embedText, getGenAI };
