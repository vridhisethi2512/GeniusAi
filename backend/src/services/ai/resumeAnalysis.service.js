const { generateJSON } = require('./geminiClient.service');

const buildResumeAnalysisPrompt = (resumeText, targetRole) => {
  const roleContext = targetRole
    ? `The candidate is targeting the role: "${targetRole}". Evaluate the resume specifically against the expectations, keywords, and skills relevant to this role.`
    : 'No specific target role was provided. Evaluate the resume generally for professional quality and ATS-friendliness.';

  return `
You are an expert technical recruiter and resume/ATS (Applicant Tracking System) specialist.
Analyze the following resume text and return ONLY a valid JSON object — no markdown, no commentary, no code fences.

${roleContext}

Resume text:
"""
${resumeText}
"""

Return a JSON object with EXACTLY this structure:
{
  "overallScore": <integer 0-100, overall quality of the resume>,
  "atsScore": <integer 0-100, how well it would parse/rank in an ATS system>,
  "strengths": [<3-6 short strings describing what the resume does well>],
  "weaknesses": [<3-6 short strings describing concrete weaknesses>],
  "missingKeywords": [<up to 10 relevant keywords/skills missing for the target role, empty array if none>],
  "suggestions": [<4-8 short, specific, actionable improvement suggestions>],
  "sectionFeedback": {
    "summary": "<one or two sentence feedback on the summary/objective section, or empty string if absent>",
    "experience": "<one or two sentence feedback on the experience section>",
    "skills": "<one or two sentence feedback on the skills section>",
    "education": "<one or two sentence feedback on the education section>"
  },
  "targetRole": "${targetRole || ''}"
}

Rules:
- Scores must be realistic and differentiated, not always high.
- Be specific and actionable — avoid generic advice like "add more details".
- Do not invent information that is not implied by the resume text.
- Return ONLY the JSON object, nothing else.
`.trim();
};

const analyzeResume = async (resumeText, targetRole = '') => {
  const prompt = buildResumeAnalysisPrompt(resumeText, targetRole);

  const result = await generateJSON(prompt, {
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
  });

  return {
    overallScore: clampScore(result.overallScore),
    atsScore: clampScore(result.atsScore),
    strengths: toStringArray(result.strengths),
    weaknesses: toStringArray(result.weaknesses),
    missingKeywords: toStringArray(result.missingKeywords),
    suggestions: toStringArray(result.suggestions),
    sectionFeedback: result.sectionFeedback && typeof result.sectionFeedback === 'object'
      ? result.sectionFeedback
      : {},
    targetRole: targetRole || '',
  };
};

const clampScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
};

module.exports = {
  analyzeResume,
};
