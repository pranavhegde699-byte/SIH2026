const KnowledgeChunk = require('../models/KnowledgeChunk');

/**
 * Cosine similarity between two vectors.
 */
const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

/**
 * Find the top N most relevant chunks by cosine similarity.
 * Uses in-memory comparison — fine for a small corpus (< 100 chunks).
 * For production scale, swap to a vector database like Pinecone or Weaviate.
 */
const findRelevantChunks = async (queryEmbedding, topN = 5) => {
  const chunks = await KnowledgeChunk.find({});
  
  if (chunks.length === 0) {
    return [];
  }

  const scored = chunks.map(chunk => ({
    ...chunk.toObject(),
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
};

module.exports = { findRelevantChunks, cosineSimilarity };
