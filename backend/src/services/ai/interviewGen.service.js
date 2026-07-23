const { generateJSON } = require('./geminiClient.service');

const VALID_CATEGORIES = ['technical', 'hr', 'behavioral', 'situational', 'coding'];

const buildInterviewGenPrompt = ({ role, interviewType, difficulty, totalQuestions }) => {
  const typeGuidance = {
    technical: 'Focus exclusively on technical/domain knowledge questions relevant to the role.',
    hr: 'Focus exclusively on HR-style questions (motivation, career goals, salary expectations, culture fit).',
    behavioral: 'Focus exclusively on behavioral questions (past experiences, teamwork, conflict, leadership) — use the STAR-friendly style.',
    mixed: 'Include a balanced mix of technical, behavioral, and situational questions appropriate for a real interview panel.',
  };

  return `
You are an experienced interview panelist and hiring manager conducting a mock interview.
Generate exactly ${totalQuestions} interview questions for a candidate applying for the role: "${role}".

Interview type: ${interviewType}. ${typeGuidance[interviewType] || typeGuidance.mixed}
Difficulty level: ${difficulty}.

Return ONLY a valid JSON array — no markdown, no commentary, no code fences — with EXACTLY this structure:
[
  {
    "questionText": "<the interview question, clear and complete>",
    "category": "<one of: technical, hr, behavioral, situational, coding>",
    "topic": "<short topic label, e.g. 'System Design', 'Team Conflict', 'REST APIs'>",
    "difficulty": "<one of: beginner, intermediate, advanced>",
    "order": <integer, 1-based position in the sequence>,
    "idealAnswerPoints": [<3-6 short strings describing key points a strong answer should cover>]
  }
]

Rules:
- Return exactly ${totalQuestions} question objects.
- "order" must be sequential starting from 1.
- Questions must be realistic, specific to the role, and non-repetitive.
- "category" must be one of the allowed enum values exactly as written.
- Return ONLY the JSON array, nothing else.
`.trim();
};

const generateInterviewQuestions = async ({ role, interviewType, difficulty, totalQuestions }) => {
  const prompt = buildInterviewGenPrompt({ role, interviewType, difficulty, totalQuestions });

  const result = await generateJSON(prompt, {
    generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
  });

  const rawQuestions = Array.isArray(result) ? result : [];

  const normalized = rawQuestions
    .filter((q) => q && typeof q.questionText === 'string' && q.questionText.trim().length > 0)
    .map((q, index) => ({
      questionText: q.questionText.trim(),
      category: VALID_CATEGORIES.includes(q.category) ? q.category : 'technical',
      topic: typeof q.topic === 'string' ? q.topic.trim() : '',
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(q.difficulty)
        ? q.difficulty
        : difficulty,
      order: Number.isInteger(q.order) && q.order > 0 ? q.order : index + 1,
      idealAnswerPoints: Array.isArray(q.idealAnswerPoints)
        ? q.idealAnswerPoints.filter((p) => typeof p === 'string' && p.trim().length > 0)
        : [],
    }));

  if (normalized.length === 0) {
    throw new Error('AI failed to generate valid interview questions.');
  }

  return normalized;
};

module.exports = {
  generateInterviewQuestions,
};
