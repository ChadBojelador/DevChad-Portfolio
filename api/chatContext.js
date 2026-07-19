import { readFileSync } from 'node:fs';
import { embed, embedMany, cosineSimilarity } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const MAX_RELEVANT_FACTS = 8;
let embeddedChunksCache = null;

function loadPortfolioFacts() {
  try {
    const raw = readFileSync(new URL('./portfolio-facts.md', import.meta.url), 'utf8');
    return raw.split('\n\n').map(chunk => chunk.trim()).filter(Boolean);
  } catch (e) {
    console.error('Failed to load portfolio-facts.md', e);
    return [];
  }
}

async function ensureEmbeddings(env) {
  if (embeddedChunksCache) return embeddedChunksCache;

  const facts = loadPortfolioFacts();
  if (!facts.length) {
    embeddedChunksCache = [];
    return embeddedChunksCache;
  }

  const geminiKey = (env.GEMINI_API_KEY || env.GOOGLE_API_KEY || '').trim();
  if (!geminiKey) {
     console.warn('No Gemini API key for embeddings, falling back to all chunks');
     return facts.map(text => ({ text, embedding: [] }));
  }

  const googleProvider = createGoogleGenerativeAI({ apiKey: geminiKey });
  const embeddingModel = googleProvider.textEmbeddingModel('text-embedding-004');

  try {
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: facts,
    });

    embeddedChunksCache = facts.map((text, i) => ({
      text,
      embedding: embeddings[i],
    }));
  } catch (e) {
    console.error('Failed to embed facts', e);
    embeddedChunksCache = facts.map(text => ({ text, embedding: [] }));
  }

  return embeddedChunksCache;
}

function getConversationFocus(messages = []) {
  return (messages || [])
    .filter((message) => message?.role === 'user' && typeof message.content === 'string')
    .slice(-3)
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join(' ');
}

async function selectRelevantChunks(env, messages = []) {
  const chunks = await ensureEmbeddings(env);
  if (!chunks.length) return [];
  
  if (!chunks[0].embedding.length) {
      return chunks.map(c => c.text);
  }

  const queryText = getConversationFocus(messages);
  if (!queryText) {
      return chunks.slice(0, MAX_RELEVANT_FACTS).map(c => c.text);
  }

  const geminiKey = (env.GEMINI_API_KEY || env.GOOGLE_API_KEY || '').trim();
  const googleProvider = createGoogleGenerativeAI({ apiKey: geminiKey });
  const embeddingModel = googleProvider.textEmbeddingModel('text-embedding-004');
  
  let queryEmbedding;
  try {
     const res = await embed({
         model: embeddingModel,
         value: queryText,
     });
     queryEmbedding = res.embedding;
  } catch(e) {
     console.error('Failed to embed query', e);
     return chunks.slice(0, MAX_RELEVANT_FACTS).map(c => c.text);
  }

  // Always pull in the identity / basic info block (assumed to be chunk 0 and 1)
  const mandatoryChunks = chunks.slice(0, 2);
  const optionalChunks = chunks.slice(2);

  const scored = optionalChunks.map(chunk => ({
      text: chunk.text,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  const selectedOptional = scored.slice(0, MAX_RELEVANT_FACTS - mandatoryChunks.length).map(s => s.text);
  
  return [...mandatoryChunks.map(c => c.text), ...selectedOptional];
}

export async function buildPortfolioKnowledgeBase(env, messages = []) {
  const selected = await selectRelevantChunks(env, messages);
  return selected.join('\n\n').trim();
}

export async function buildSystemInstructions(env, { messages = [] } = {}) {
  const facts = await buildPortfolioKnowledgeBase(env, messages);
  return `Portfolio assistant for Chad Bojelador.

Rules:
- Use only FACTS for claims about Chad (no invented dates, employers, links, or projects).
- Answer only Chad/portfolio topics; decline off-topic briefly and redirect.
- If unknown, say so briefly and suggest a relevant Chad topic.
- Keep replies concise unless user asks for detail.
- Never output secrets or private data. Do not claim to be human.
- For scheduling/email requests, point to the About/Contact page.

FACTS:
${facts}`.trim();
}
