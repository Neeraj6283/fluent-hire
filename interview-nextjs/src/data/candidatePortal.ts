export type AssignedInterview = {
  id: string;
  title: string;
  company: string;
  duration: string;
  questions: number;
  status: "pending" | "in_progress" | "completed";
  dueDate: string;
  category: string;
};

export const assignedInterviews: AssignedInterview[] = [
  { id: "senior-backend", title: "Senior Backend Engineer", company: "Acme Corp", duration: "30 min", questions: 5, status: "pending", dueDate: "May 12, 2026", category: "Backend" },
  { id: "frontend-mid", title: "Frontend Engineer (Mid)", company: "Northwind", duration: "25 min", questions: 5, status: "pending", dueDate: "May 14, 2026", category: "Frontend" },
  { id: "qa-automation", title: "QA Automation", company: "Lumen.io", duration: "20 min", questions: 4, status: "completed", dueDate: "May 4, 2026", category: "QA" },
];

export const interviewQuestions: Record<string, string[]> = {
  "senior-backend": [
    "Tell me about your background and what you're working on now.",
    "How would you design a rate limiter for an API serving 100k requests per minute?",
    "Describe an indexing strategy for a 50M-row PostgreSQL table queried by composite filters.",
    "A microservice you own is leaking memory in production. How do you debug it?",
    "Tell me about a time you disagreed with a senior engineer. How did it end?",
  ],
  "frontend-mid": [
    "Walk me through your frontend experience.",
    "How do you approach component reusability in a large React codebase?",
    "Explain the difference between useMemo and useCallback.",
    "How would you optimize a slow rendering list of 10,000 items?",
    "Describe a tricky CSS bug you solved recently.",
  ],
  "qa-automation": [
    "Tell me about your QA automation experience.",
    "How do you decide what to automate vs test manually?",
    "Walk me through a flaky test you fixed.",
    "How do you structure a Playwright/Cypress test suite for a large app?",
  ],
};

export type CompletedResult = {
  id: string;
  interviewId: string;
  title: string;
  date: string;
  score: number;
  duration: string;
  answers: { question: string; answer: string; rating: number }[];
};

export const completedResults: CompletedResult[] = [
  {
    id: "res-1", interviewId: "qa-automation", title: "QA Automation", date: "May 4, 2026",
    score: 84, duration: "18 min",
    answers: [
      { question: "Tell me about your QA automation experience.", answer: "Five years building Playwright + Cypress suites at fintech and e-commerce shops.", rating: 9 },
      { question: "How do you decide what to automate?", answer: "Risk vs frequency matrix, prioritize critical user paths.", rating: 8 },
      { question: "Walk me through a flaky test you fixed.", answer: "Race condition in a modal; switched from waitFor timeout to event-based wait.", rating: 8 },
      { question: "How do you structure a Playwright suite?", answer: "Page object model, fixtures for auth, parallelized by feature.", rating: 9 },
    ],
  },
];
