import axios from 'axios';

// --- Provider Configuration ---
// Set AI_PROVIDER env to 'openai' to use OpenAI, or 'ollama' for local Ollama (default).
const AI_PROVIDER = process.env.AI_PROVIDER || 'ollama';

// Ollama config
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e4b';

// OpenAI config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are a medical triage AI assistant. Analyze patient symptoms, age, and any attached images to determine priority level.
Choose ONLY from: "Critical", "Emergency", "Urgent", "Normal".
Provide a short 1-sentence reasoning.
Always respond in JSON format: { "priority": "level", "reasoning": "your reasoning" }`;

// ---------- OpenAI Provider ----------
const predictWithOpenAI = async (patientSymptoms, age, imageData = null) => {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  // Build user message content (text + optional image)
  const userContent = [];
  userContent.push({ type: 'text', text: `Patient Age: ${age}\nSymptoms: ${patientSymptoms}` });

  if (imageData) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`,
        detail: 'low'
      }
    });
  }

  messages.push({ role: 'user', content: userContent });

  const response = await axios.post(OPENAI_URL, {
    model: OPENAI_MODEL,
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 200,
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    }
  });

  const result = JSON.parse(response.data.choices[0].message.content);
  return {
    suggestedPriority: result.priority || 'Normal',
    reasoning: result.reasoning || 'No reasoning provided.'
  };
};

// ---------- Ollama Provider ----------
const predictWithOllama = async (patientSymptoms, age, imageData = null) => {
  const prompt = `${SYSTEM_PROMPT}

Patient Age: ${age}
Symptoms: ${patientSymptoms}`;

  const payload = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    format: 'json'
  };

  if (imageData) {
    payload.images = [imageData.replace(/^data:image\/\w+;base64,/, "")];
  }

  const response = await axios.post(OLLAMA_URL, payload);
  const result = JSON.parse(response.data.response);
  return {
    suggestedPriority: result.priority || 'Normal',
    reasoning: result.reasoning || 'No reasoning provided.'
  };
};

// ---------- Main Export ----------
export const predictUrgency = async (patientSymptoms, age, imageData = null) => {
  // If OpenAI is requested, try it first (Online)
  if (AI_PROVIDER === 'openai') {
    try {
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing');
      console.log('Using OpenAI for triage...');
      return await predictWithOpenAI(patientSymptoms, age, imageData);
    } catch (error) {
      console.error(`OpenAI failed (${error.message}). Falling back to offline Ollama...`);
      // Fall through to Ollama below
    }
  }

  // Fallback / Default: Try Ollama (Offline)
  try {
    console.log('Using local Ollama for triage...');
    return await predictWithOllama(patientSymptoms, age, imageData);
  } catch (error) {
    console.error(`Ollama also failed:`, error.message);
    return {
      suggestedPriority: 'Urgent',
      reasoning: 'Fallback classification — both online (OpenAI) and offline (Ollama) AI services are unavailable.'
    };
  }
};
