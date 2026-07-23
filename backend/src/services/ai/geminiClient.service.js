const { getGeminiModel } = require('../../config/gemini');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const status = error?.status || error?.response?.status;
  return status === 429 || status === 500 || status === 503 || !status;
};

const generateContent = async (prompt, options = {}) => {
  const model = getGeminiModel(options);

  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;

      if (!response || typeof response.text !== 'function') {
        throw new Error('Malformed response from Gemini API.');
      }

      const text = response.text();

      if (!text || !text.trim()) {
        throw new Error('Empty response from Gemini API.');
      }

      return text;
    } catch (error) {
      lastError = error;

      const retryable = isRetryableError(error);

      logger.warn(
        `Gemini API call failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`
      );

      if (!retryable || attempt === MAX_RETRIES) {
        break;
      }

      const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
      await sleep(delay);
    }
  }

  logger.error(`Gemini API call failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
  throw ApiError.serviceUnavailable(
    'The AI service is temporarily unavailable. Please try again in a moment.'
  );
};

const generateJSON = async (prompt, options = {}) => {
  const rawText = await generateContent(prompt, {
    ...options,
    responseMimeType: 'application/json',
  });

  const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error(`Failed to parse Gemini JSON response: ${error.message}. Raw: ${cleaned}`);
    throw ApiError.internal('The AI returned an unexpected response format. Please try again.');
  }
};

module.exports = {
  generateContent,
  generateJSON,
};
