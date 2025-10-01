export const CV_MATCH_RUBRIC = {
  'Technical Skills Match': {
    weight: 0.4,
    description:
      'Alignment with job requirements (backend, databases, APIs, cloud, AI/LLM).',
    scoring_guide:
      '1 = Irrelevant skills, 2 = Few overlaps, 3 = Partial match, 4 = Strong match, 5 = Excellent match + AI/LLM exposure',
  },
  'Experience Level': {
    weight: 0.25,
    description: 'Years of experience and project complexity.',
    scoring_guide:
      '1 = <1 yr / trivial projects, 2 = 1-2 yrs, 3 = 2-3 yrs with mid-scale projects, 4 = 3-4 yrs solid track record, 5 = 5+ yrs / high-impact projects',
  },
  'Relevant Achievements': {
    weight: 0.2,
    description: 'Impact of past work (scaling, performance, adoption).',
    scoring_guide:
      '1 = No clear achievements, 2 = Minimal improvements, 3 = Some measurable outcomes, 4 = Significant contributions, 5 = Major measurable impact',
  },
  'Cultural / Collaboration Fit': {
    weight: 0.15,
    description: 'Communication, learning mindset, teamwork/leadership.',
    scoring_guide:
      '1 = Not demonstrated, 2 = Minimal, 3 = Average, 4 = Good, 5 = Excellent and well-demonstrated',
  },
};

export const PROJECT_DELIVERABLE_RUBRIC = {
  'Correctness (Prompt & Chaining)': {
    weight: 0.3,
    description:
      'Implements prompt design, LLM chaining, RAG context injection.',
    scoring_guide:
      '1 = Not implemented, 2 = Minimal attempt, 3 = Works partially, 4 = Works correctly, 5 = Fully correct + thoughtful',
  },
  'Code Quality & Structure': {
    weight: 0.25,
    description: 'Clean, modular, reusable, tested.',
    scoring_guide:
      '1 = Poor, 2 = Some structure, 3 = Decent modularity, 4 = Good structure + some tests, 5 = Excellent quality + strong tests',
  },
  'Resilience & Error Handling': {
    weight: 0.2,
    description: 'Handles long jobs, retries, randomness, API failures.',
    scoring_guide:
      '1 = Missing, 2 = Minimal, 3 = Partial handling, 4 = Solid handling, 5 = Robust, production-ready',
  },
  'Documentation & Explanation': {
    weight: 0.15,
    description: 'README clarity, setup instructions, trade-off explanations.',
    scoring_guide:
      '1 = Missing, 2 = Minimal, 3 = Adequate, 4 = Clear, 5 = Excellent + insightful',
  },
  'Creativity / Bonus': {
    weight: 0.1,
    description: 'Extra features beyond requirements.',
    scoring_guide:
      '1 = None, 2 = Very basic, 3 = Useful extras, 4 = Strong enhancements, 5 = Outstanding creativity',
  },
};
