import AgentRun from '../models/AgentRun.js';
import { getRouteConfig, callGemini, callEmbedding } from '../config/otari.js';

export async function otariCall({ route, prompt, input, userId, options = {} }) {
  const routeConfig = getRouteConfig(route);
  const startTime = Date.now();

  const agentRun = await AgentRun.create({
    agentName: route.split('.')[0],
    otariRouteTag: route,
    triggeredBy: userId,
    input: { prompt: prompt?.substring(0, 500), inputSummary: typeof input === 'string' ? input.substring(0, 200) : 'structured input' },
    status: 'running',
    modelUsed: routeConfig.model,
  });

  try {
    let result;

    if (route.startsWith('embedding.')) {
      const embedding = await callEmbedding(prompt || input);
      result = {
        text: '',
        embedding,
        model: routeConfig.model,
        tokensUsed: { prompt: 0, completion: 0, total: 0 },
      };
    } else {
      result = await callGemini(prompt, {
        model: routeConfig.model,
        ...options,
      });
    }

    const durationMs = Date.now() - startTime;

    await AgentRun.findByIdAndUpdate(agentRun._id, {
      status: 'success',
      output: { textLength: result.text?.length || 0, hasEmbedding: !!result.embedding },
      modelUsed: result.model || routeConfig.model,
      tokensUsed: result.tokensUsed,
      durationMs,
    });

    return { ...result, agentRunId: agentRun._id };
  } catch (error) {
    const durationMs = Date.now() - startTime;

    await AgentRun.findByIdAndUpdate(agentRun._id, {
      status: 'failed',
      error: error.message,
      durationMs,
    });

    throw error;
  }
}

export async function otariCallWithRetry({ route, prompt, input, userId, options = {}, maxRetries = 2 }) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await otariCall({ route, prompt, input, userId, options });
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError;
}

export default otariCall;
