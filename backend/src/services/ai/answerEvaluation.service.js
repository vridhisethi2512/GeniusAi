const { generateJSON } = require('./geminiClient.service');

const buildAnswerEvaluationPrompt = ({ questionText, category, idealAnswerPoints, answerText, role }) => {
  const idealPointsText = idealAnswerPoints && idealAnswerPoints.length > 0
    ? idealAnswerPoints.map((p) => `- ${p}`).join('\n')
    : '- (No specific ideal points provided; evaluate based on general best practices for this question type.)';

  return `
You are an expert interview coach evaluating a candidate's answer during a mock interview for the role: "${role}".

Question category: ${category}
Question: "${questionText}"

Key points a strong answer should ideally cover:
${idealPointsText}

Candidate's answer:
"""
${answerText}
"""

Return ONLY a valid JSON object — no markdown, no commentary, no code fences — with EXACTLY this structure:
{
  "score": <integer 0-10, overall quality of the answer>,
  "correctness": <integer 0-10, factual/technical accuracy or relevance>,
  "clarity": <integer 0-10, how clearly and coherently the answer was communicated>,
  "confidence": <integer 0-10, inferred confidence/conviction based on the wording and structure of the answer text>,
  "feedback": "<2-4 sentences of specific, constructive feedback addressed directly to the candidate>",
  "idealAnswerSummary": "<2-3 sentence summary of what a strong answer would have included>",
  "missedPoints": [<short strings listing key points from the ideal answer that the candidate did not cover, empty array if none missed>]
}

Rules:
- Be honest and discriminating in scoring — do not default to high scores for vague or generic answers.
- If the answer is empty, off-topic, or nonsensical, score it very low (0-2) and explain why in feedback.
- Base "confidence" only on textual cues (hedging language, assertiveness, structure) — never invent claims about tone of voice.
- Return ONLY the JSON object, nothing else.
`.trim();
};

const evaluateAnswer = async ({ questionText, category, idealAnswerPoints, answerText, role }) => {
  const prompt = buildAnswerEvaluationPrompt({
    questionText,
    category,
    idealAnswerPoints,
    answerText,
    role,
  });

  const result = await generateJSON(prompt, {
    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
  });

  return {
    score: clamp10(result.score),
    correctness: clamp10(result.correctness),
    clarity: clamp10(result.clarity),
    confidence: clamp10(result.confidence),
    feedback: typeof result.feedback === 'string' && result.feedback.trim()
      ? result.feedback.trim()
      : 'No feedback could be generated for this answer.',
    idealAnswerSummary: typeof result.idealAnswerSummary === 'string'
      ? result.idealAnswerSummary.trim()
      : '',
    missedPoints: Array.isArray(result.missedPoints)
      ? result.missedPoints.filter((p) => typeof p === 'string' && p.trim().length > 0)
      : [],
  };
};

const clamp10 = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(10, Math.round(num)));
};

module.exports = {
  evaluateAnswer,
};
