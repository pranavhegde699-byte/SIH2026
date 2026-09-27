const mongoose = require('mongoose');

const knowledgeChunkSchema = new mongoose.Schema({
  sourceType: { type: String, enum: ['Approval', 'Scheme'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  sourceName: { type: String, required: true },
  text: { type: String, required: true },
  embedding: [{ type: Number }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
