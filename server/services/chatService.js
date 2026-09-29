const { embedText, getGenAI } = require('./embeddingService');
const { findRelevantChunks } = require('./retrievalService');
const BusinessProfile = require('../models/BusinessProfile');

/**
 * Chat Service — RAG-based Q&A using Google Gemini.
 * 
 * Uses gemini-1.5-flash for generation and text-embedding-004 for embeddings.
 * Grounded strictly in retrieved context from our Approval/Scheme knowledge base.
 */

const answerQuery = async (userQuestion, businessProfileId = null) => {
  try {
    // Step 1: Embed the user's question
    const queryEmbedding = await embedText(userQuestion);

    // Step 2: Retrieve top 5 relevant chunks
    const relevantChunks = await findRelevantChunks(queryEmbedding, 5);

    // Step 3: Optionally fetch profile context for personalization
    let profileContext = '';
    if (businessProfileId) {
      try {
        const profile = await BusinessProfile.findById(businessProfileId);
        if (profile) {
          profileContext = `\nThe user's business is: ${profile.businessName}, Industry: ${profile.industryType}, Sector: ${profile.sector || 'Not specified'}, State: ${profile.location?.state || 'Not specified'}.`;
        }
      } catch (err) {
        // Non-critical — continue without personalization
      }
    }

    // Step 4: Build the prompt
    let contextText = '';
    const sources = [];

    if (relevantChunks.length > 0) {
      contextText = relevantChunks.map((chunk, i) => {
        sources.push({
          sourceType: chunk.sourceType,
          sourceName: chunk.sourceName,
          sourceId: chunk.sourceId
        });
        return `[Source ${i + 1}: ${chunk.sourceType} — ${chunk.sourceName}]\n${chunk.text}`;
      }).join('\n\n');
    }

    const systemPrompt = `You are UdyogSetu AI, a helpful regulatory compliance assistant for Indian MSMEs and businesses.

STRICT RULES:
1. Answer ONLY using the provided context below. Do NOT make up information.
2. If the answer isn't in the context, say: "I don't have specific information on that topic in my knowledge base. I recommend checking the official MAITRI portal (https://maitri.mahaonline.gov.in) or NSWS portal (https://www.nsws.gov.in) for the latest details."
3. Always mention which approval or scheme your answer is based on (cite the source name).
4. Be concise, clear, and helpful. Use bullet points for lists.
5. If asked about documents needed, list them clearly.
${profileContext}

CONTEXT FROM KNOWLEDGE BASE:
${contextText || 'No relevant context found in the knowledge base.'}`;

    const userPrompt = userQuestion;

    // Step 5: Call Gemini chat model (with fallback)
    const genAI = getGenAI();
    let result;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      result = await model.generateContent(systemPrompt + '\n\nUser Question: ' + userPrompt);
    } catch (modelErr) {
      console.warn('[ChatService] gemini-1.5-flash busy or failed, falling back to gemini-2.0-flash:', modelErr.message);
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      result = await fallbackModel.generateContent(systemPrompt + '\n\nUser Question: ' + userPrompt);
    }

    const answer = result.response.text();

    return {
      answer,
      sources: sources.filter((s, i, arr) => 
        arr.findIndex(x => x.sourceId.toString() === s.sourceId.toString()) === i
      ) // dedupe sources
    };

  } catch (error) {
    console.error('[ChatService] Error:', error.message);

    // Friendly fallback messages based on error type
    if (error.message.includes('GEMINI_API_KEY')) {
      return {
        answer: 'The AI chatbot is not configured yet. Please add your GEMINI_API_KEY to the server .env file.',
        sources: []
      };
    }

    if (error.status === 429 || error.message.includes('429 Too Many Requests') || error.message.includes('quota')) {
      return {
        answer: "I'm receiving too many requests right now. Please wait a moment and try again.",
        sources: []
      };
    }

    return {
      answer: "I'm having trouble connecting right now. Please try again in a moment.",
      sources: []
    };
  }
};

module.exports = { answerQuery };
