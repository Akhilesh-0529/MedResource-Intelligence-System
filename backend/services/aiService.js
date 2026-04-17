import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';

export const predictUrgency = async (patientSymptoms, age) => {
  try {
    const prompt = `You are a medical triage AI assistant. Analyze the following patient symptoms and age, and determine their priority level.
    Choose ONLY from the following levels: "Critical", "Emergency", "Urgent", "Normal".
    Also provide a short 1-sentence reasoning. 
    
    Format the output as JSON: { "priority": "level", "reasoning": "your reasoning" }
    
    Patient Age: ${age}
    Symptoms: ${patientSymptoms}
    `;

    const response = await axios.post(OLLAMA_URL, {
      model: process.env.OLLAMA_MODEL || 'gemma4:e4b',
      prompt: prompt,
      stream: false,
      format: 'json'
    });

    const result = JSON.parse(response.data.response);
    return {
      suggestedPriority: result.priority || 'Normal',
      reasoning: result.reasoning || 'No reasoning provided.'
    };
  } catch (error) {
    console.error('Error connecting to local Gemma model:', error.message);
    // Fallback logic
    return {
      suggestedPriority: 'Urgent',
      reasoning: 'Fallback classification due to AI service unavailability.'
    };
  }
};
