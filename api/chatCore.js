import { buildSystemInstructions } from './chatContext.js';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

const MAX_BODY_CHARS = 32000;
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

const DEFAULT_BUDGETS = {
  free: {
    maxMessages: 8,
    maxContentLength: 700,
    maxOutputTokens: 180,
    responseWordLimit: 120,
  },
  pro: {
    maxMessages: 12,
    maxContentLength: 1000,
    maxOutputTokens: 280,
    responseWordLimit: 180,
  },
  premium: {
    maxMessages: 16,
    maxContentLength: 1400,
    maxOutputTokens: 420,
    responseWordLimit: 260,
  },
};

const DEFAULT_PROVIDER_ORDER = ['openrouter', 'gemini', 'groq', 'openai', 'xai'];
const DEFAULT_MODELS = {
  openrouter: { primary: 'meta-llama/llama-3.1-8b-instruct:free', fallback: [] },
  gemini: { primary: 'gemini-2.0-flash', fallback: ['gemini-1.5-flash'] },
  groq: { primary: 'llama-3.1-8b-instant', fallback: [] },
  openai: { primary: 'gpt-3.5-turbo', fallback: [] },
  xai: { primary: 'grok-3-mini', fallback: ['grok-4-1-fast'] },
};

function extractTextFromPart(part) {
  if (!part) return '';
  if (typeof part === 'string') return part;
  if (typeof part.text === 'string') return part.text;
  if (typeof part.content === 'string') return part.content;
  return '';
}

function extractMessageText(message) {
  if (!message) return '';
  if (typeof message.content === 'string') return message.content;
  if (Array.isArray(message.content)) return message.content.map(extractTextFromPart).join('');
  if (Array.isArray(message.parts)) return message.parts.map(extractTextFromPart).join('');
  return '';
}

function normalizeIncomingMessages(messages) {
  return messages
    .map((m) => ({
      role: m?.role,
      content: extractMessageText(m).trim(),
    }))
    .filter((m) => m.role && m.content);
}

function parseCsv(value, fallback = []) {
  if (typeof value !== 'string') return [...fallback];
  const list = value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return list.length ? list : [...fallback];
}

function parsePositiveInt(value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed < min) return fallback;
  return Math.min(parsed, max);
}

function parseFloatBounded(value, fallback, { min = 0, max = 2 } = {}) {
  const parsed = Number.parseFloat(String(value ?? ''));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function parseBoolean(value, fallback = false) {
  if (typeof value !== 'string') return fallback;
  const v = value.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true;
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false;
  return fallback;
}

function normalizeTier(rawTier) {
  const tier = String(rawTier || '').trim().toLowerCase();
  if (tier === 'premium' || tier === 'enterprise') return 'premium';
  if (tier === 'pro' || tier === 'plus') return 'pro';
  return 'free';
}

function buildTierBudget(env, rawTier) {
  const tier = normalizeTier(rawTier);
  const base = DEFAULT_BUDGETS[tier];
  const upper = tier.toUpperCase();
  return {
    tier,
    maxMessages: parsePositiveInt(env[`CHAT_MAX_MESSAGES_${upper}`], base.maxMessages, {
      min: 1,
      max: MAX_MESSAGES,
    }),
    maxContentLength: parsePositiveInt(env[`CHAT_MAX_CONTENT_LENGTH_${upper}`], base.maxContentLength, {
      min: 100,
      max: MAX_CONTENT_LENGTH,
    }),
    maxOutputTokens: parsePositiveInt(env[`CHAT_MAX_OUTPUT_TOKENS_${upper}`], base.maxOutputTokens, {
      min: 32,
      max: 1024,
    }),
    responseWordLimit: parsePositiveInt(env[`CHAT_RESPONSE_WORD_LIMIT_${upper}`], base.responseWordLimit, {
      min: 40,
      max: 600,
    }),
  };
}

function buildProviderOrder(env) {
  const raw = parseCsv(env.AI_PROVIDER_ORDER, DEFAULT_PROVIDER_ORDER).map((p) => p.toLowerCase());
  const allowed = new Set(DEFAULT_PROVIDER_ORDER);
  const seen = new Set();
  const order = [];
  for (const provider of raw) {
    if (!allowed.has(provider) || seen.has(provider)) continue;
    seen.add(provider);
    order.push(provider);
  }
  for (const provider of DEFAULT_PROVIDER_ORDER) {
    if (!seen.has(provider)) order.push(provider);
  }
  return order;
}

function uniqList(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const v = String(item || '').trim();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function buildProviderConfigs(env) {
  const geminiKey = (env.GEMINI_API_KEY || env.GOOGLE_API_KEY || '').trim();
  const groqKey = (env.GROQ_API_KEY || '').trim();
  const openaiKey = (env.OPENAI_API_KEY || '').trim();
  const xaiKey = (env.XAI_API_KEY || '').trim();
  const openrouterKey = (env.OPENROUTER_API_KEY || '').trim();
  const groqEnabled = parseBoolean(env.GROQ_ENABLED, true);

  const googleProvider = geminiKey ? createGoogleGenerativeAI({ apiKey: geminiKey }) : null;
  const openaiProvider = openaiKey ? createOpenAI({ apiKey: openaiKey }) : null;
  const groqProvider = groqKey
    ? createOpenAI({
        name: 'groq',
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: groqKey,
      })
    : null;
  const xaiProvider = xaiKey
    ? createOpenAI({
        name: 'xai',
        baseURL: 'https://api.x.ai/v1',
        apiKey: xaiKey,
      })
    : null;
  const openrouterProvider = openrouterKey
    ? createOpenAI({
        name: 'openrouter',
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: openrouterKey,
      })
    : null;

  return {
    openrouter: {
      configured: Boolean(openrouterProvider),
      model: (modelId) => openrouterProvider(modelId),
      models: uniqList([
        env.OPENROUTER_MODEL || DEFAULT_MODELS.openrouter.primary,
        ...parseCsv(env.OPENROUTER_FALLBACK_MODELS, DEFAULT_MODELS.openrouter.fallback),
      ]),
    },
    gemini: {
      configured: Boolean(googleProvider),
      model: (modelId) => googleProvider(modelId),
      models: uniqList([
        env.GEMINI_MODEL || DEFAULT_MODELS.gemini.primary,
        ...parseCsv(env.GEMINI_FALLBACK_MODELS, DEFAULT_MODELS.gemini.fallback),
      ]),
    },
    groq: {
      configured: Boolean(groqProvider) && groqEnabled,
      model: (modelId) => groqProvider(modelId),
      models: uniqList([
        env.GROQ_MODEL || DEFAULT_MODELS.groq.primary,
        ...parseCsv(env.GROQ_FALLBACK_MODELS, DEFAULT_MODELS.groq.fallback),
      ]),
    },
    openai: {
      configured: Boolean(openaiProvider),
      model: (modelId) => openaiProvider(modelId),
      models: uniqList([
        env.OPENAI_MODEL || DEFAULT_MODELS.openai.primary,
        ...parseCsv(env.OPENAI_FALLBACK_MODELS, DEFAULT_MODELS.openai.fallback),
      ]),
    },
    xai: {
      configured: Boolean(xaiProvider),
      model: (modelId) => xaiProvider(modelId),
      models: uniqList([
        env.XAI_MODEL || DEFAULT_MODELS.xai.primary,
        ...parseCsv(env.XAI_FALLBACK_MODELS, DEFAULT_MODELS.xai.fallback),
      ]),
    },
  };
}

export async function handleChatCore(body, env, clientIp = 'unknown', userTier = 'free') {
  const rawMessages = body?.messages;
  const messages = Array.isArray(rawMessages) ? normalizeIncomingMessages(rawMessages) : null;

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: 'Invalid body: non-empty messages array required', status: 400 };
  }

  const budget = buildTierBudget(env, userTier);
  const trimWindow = parsePositiveInt(env.CHAT_HISTORY_WINDOW, budget.maxMessages, {
    min: 1,
    max: MAX_MESSAGES,
  });
  const activeMessages = messages.slice(-trimWindow);

  for (const m of activeMessages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant' && m.role !== 'system')) {
      return { error: 'Each message must have role user, assistant, or system', status: 400 };
    }
    if (typeof m.content !== 'string' || !m.content.trim()) {
      return { error: 'Each message must have non-empty string content', status: 400 };
    }
    if (m.content.length > budget.maxContentLength) {
      return { error: `Each message must be at most ${budget.maxContentLength} characters`, status: 400 };
    }
  }

  const conciseMode = parseBoolean(env.CHAT_FORCE_CONCISE_MODE, true);
  const systemBase = await buildSystemInstructions(env, { messages: activeMessages });
  const system = conciseMode
    ? `${systemBase}\n\nResponse policy:\n- Keep answers concise and practical.\n- Prefer bullet points.\n- Default to at most ${budget.responseWordLimit} words unless user explicitly asks for more detail.`
    : systemBase;

  const providerOrder = buildProviderOrder(env);
  const providers = buildProviderConfigs(env);
  const configuredProviders = providerOrder.filter((provider) => providers[provider]?.configured);
  const temperature = parseFloatBounded(env.CHAT_TEMPERATURE, 0.45, { min: 0, max: 1 });

  if (configuredProviders.length === 0) {
    return {
      error:
        'Server is missing provider API keys (set GEMINI_API_KEY, GROQ_API_KEY, OPENAI_API_KEY, or XAI_API_KEY).',
      status: 500,
    };
  }

  const attempts = [];
  for (const provider of configuredProviders) {
    const cfg = providers[provider];
    for (const modelId of cfg.models) {
      attempts.push({ provider, modelId, modelFactory: cfg.model });
    }
  }

  for (const attempt of attempts) {
    try {
      const result = streamText({
        model: attempt.modelFactory(attempt.modelId),
        system,
        messages: activeMessages,
        temperature,
        maxTokens: budget.maxOutputTokens,
      });

      console.info(
        `[chat] client=${clientIp} tier=${budget.tier} provider=${attempt.provider} model=${attempt.modelId} status=selected history=${activeMessages.length} maxTokens=${budget.maxOutputTokens}`
      );

      return { stream: result, provider: attempt.provider, model: attempt.modelId };
    } catch (e) {
      console.error(`[chat] client=${clientIp} provider=${attempt.provider} model=${attempt.modelId} status=failed`, e);
    }
  }

  return { error: 'Chat temporarily unavailable across all configured models.', status: 503 };
}

export function validateBodySize(rawString) {
  if (rawString.length > MAX_BODY_CHARS) {
    return { ok: false, error: 'Request body too large' };
  }
  return { ok: true };
}

