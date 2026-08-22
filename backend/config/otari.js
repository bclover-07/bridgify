import axios from 'axios';

const routingTable = {
  'assessment.generate': { model: 'gemini-1.5-flash', priority: 'normal' },
  'assessment.grade': { model: 'gemini-1.5-flash', priority: 'normal' },
  'interview.evaluate': { model: 'gemini-1.5-pro', priority: 'high' },
  'interview.question': { model: 'gemini-1.5-pro', priority: 'high' },
  'debate.coach': { model: 'gemini-1.5-pro', priority: 'high' },
  'dropout.analyze': { model: 'gemini-1.5-flash', priority: 'low' },
  'naac.report': { model: 'gemini-1.5-pro', priority: 'normal' },
  'notes.generate': { model: 'gemini-1.5-flash', priority: 'normal' },
  'search.match': { model: 'gemini-1.5-flash', priority: 'normal' },
  'gap.analyze': { model: 'gemini-1.5-flash', priority: 'normal' },
  'ps.generate': { model: 'gemini-1.5-flash', priority: 'normal' },
  'feedback.analyze': { model: 'gemini-1.5-flash', priority: 'low' },
  'placement.strategy': { model: 'gemini-1.5-pro', priority: 'normal' },
  'study.plan': { model: 'gemini-1.5-flash', priority: 'normal' },
  'seg.audit': { model: 'gemini-1.5-flash', priority: 'low' },
  'embedding.generate': { model: 'hf/sentence-transformers/all-MiniLM-L6-v2' },
};

const budgetCounters = {
  'gemini-1.5-flash': { daily: 0, dailyLimit: 1500, rpm: 0, rpmLimit: 15, lastRpmReset: Date.now() },
  'gemini-1.5-pro': { daily: 0, dailyLimit: 50, rpm: 0, rpmLimit: 2, lastRpmReset: Date.now() },
};

function resetRPMIfNeeded(model) {
  const counter = budgetCounters[model];
  if (!counter) return;
  const now = Date.now();
  if (now - counter.lastRpmReset > 60000) {
    counter.rpm = 0;
    counter.lastRpmReset = now;
  }
}

function checkBudget(model) {
  const counter = budgetCounters[model];
  if (!counter) return true;
  resetRPMIfNeeded(model);
  return counter.daily < counter.dailyLimit && counter.rpm < counter.rpmLimit;
}

function incrementBudget(model) {
  const counter = budgetCounters[model];
  if (!counter) return;
  counter.daily++;
  counter.rpm++;
}

export function getRouteConfig(routeTag) {
  return routingTable[routeTag] || { model: 'gemini-1.5-flash', priority: 'normal' };
}

export function getBudgetStatus() {
  const status = {};
  for (const [model, counter] of Object.entries(budgetCounters)) {
    status[model] = {
      dailyUsed: counter.daily,
      dailyLimit: counter.dailyLimit,
      dailyRemaining: counter.dailyLimit - counter.daily,
      rpmCurrent: counter.rpm,
      rpmLimit: counter.rpmLimit,
    };
  }
  return status;
}

export async function callGemini(prompt, options = {}) {
  const model = options.model || 'gemini-1.5-flash';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  if (!checkBudget(model)) {
    if (process.env.OPENROUTER_API_KEY) {
      return callOpenRouter(prompt, options);
    }
    throw new Error(`Budget exceeded for ${model}. Rate limit or daily cap reached.`);
  }

  const candidateModels = [
    model === 'gemini-1.5-pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
  ];

  let lastError = null;
  for (const modelId of candidateModels) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 4096,
            topP: options.topP || 0.95,
          },
        },
        { timeout: 60000 }
      );

      incrementBudget(model);

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const usage = response.data?.usageMetadata || {};

      return {
        text,
        model: modelId,
        tokensUsed: {
          prompt: usage.promptTokenCount || 0,
          completion: usage.candidatesTokenCount || 0,
          total: (usage.promptTokenCount || 0) + (usage.candidatesTokenCount || 0),
        },
      };
    } catch (err) {
      lastError = err;
      if (err.response?.status === 404) {
        console.warn(`Gemini model ${modelId} 404, trying next candidate model...`);
        continue;
      }
      break;
    }
  }

  if (lastError?.response?.status === 429 || lastError?.response?.status === 500 || lastError?.response?.status === 404) {
    if (process.env.OPENROUTER_API_KEY) {
      console.warn(`Gemini ${model} failed (${lastError.response?.status}), falling back to OpenRouter`);
      return callOpenRouter(prompt, options);
    }
  }
  throw lastError;
}

async function callOpenRouter(prompt, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No fallback provider available');

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'google/gemini-flash-1.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  const text = response.data?.choices?.[0]?.message?.content || '';
  const usage = response.data?.usage || {};

  return {
    text,
    model: 'openrouter/gemini-flash-1.5',
    tokensUsed: {
      prompt: usage.prompt_tokens || 0,
      completion: usage.completion_tokens || 0,
      total: usage.total_tokens || 0,
    },
  };
}

export async function callEmbedding(text) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    console.warn('HUGGINGFACE_API_KEY not configured, returning zero embedding');
    return new Array(384).fill(0);
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      { inputs: text },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Embedding call failed:', error.message);
    return new Array(384).fill(0);
  }
}

export default {
  getRouteConfig,
  getBudgetStatus,
  callGemini,
  callEmbedding,
};
