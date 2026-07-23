const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const logger = require('../utils/logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  logger.error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const DEFAULT_MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const defaultGenerationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 2048,
};

const defaultSafetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const getGeminiModel = (overrides = {}) => {
  const {
    modelName = DEFAULT_MODEL_NAME,
    generationConfig = {},
    responseMimeType,
  } = overrides;

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      ...defaultGenerationConfig,
      ...generationConfig,
      ...(responseMimeType ? { responseMimeType } : {}),
    },
    safetySettings: defaultSafetySettings,
  });
};

module.exports = {
  genAI,
  getGeminiModel,
  DEFAULT_MODEL_NAME,
};
