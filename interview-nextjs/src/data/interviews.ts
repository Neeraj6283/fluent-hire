export type InterviewQuestion = { skill: string; question: string; difficulty: string };
export type InterviewTaker = { name: string; email: string; status: string; score: number | null; date: string };
export type InterviewRow = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  status: string;
  count: number;
  date: string;
  duration: string;
  description: string;
  skills: string[];
  questions: InterviewQuestion[];
  takers: InterviewTaker[];
};

export const interviewRows: InterviewRow[] = [
  {
    id: "senior-node-backend",
    title: "Senior Node.js Backend",
    category: "Backend",
    difficulty: "Hard",
    status: "Published",
    count: 12,
    date: "May 6, 2026",
    duration: "45 min",
    description: "Deep technical interview for senior backend engineers focused on Node.js, system design and scalability.",
    skills: ["Node.js", "PostgreSQL", "System Design", "Testing"],
    questions: [
      { skill: "Node.js", question: "Explain the event loop and how microtasks differ from macrotasks.", difficulty: "Hard" },
      { skill: "Node.js", question: "How would you design a worker pool for CPU intensive tasks?", difficulty: "Hard" },
      { skill: "PostgreSQL", question: "Describe how to optimize a slow query with EXPLAIN ANALYZE.", difficulty: "Medium" },
      { skill: "PostgreSQL", question: "When would you choose a partial index over a full one?", difficulty: "Medium" },
      { skill: "System Design", question: "Design a rate limiter for an API gateway handling 100k req/s.", difficulty: "Hard" },
      { skill: "Testing", question: "How do you structure integration tests for a microservice?", difficulty: "Medium" },
    ],
    takers: [
      { name: "Mira Khan", email: "mira@acme.com", status: "Completed", score: 88, date: "May 6" },
      { name: "Aiko Sato", email: "aiko@lumen.io", status: "Completed", score: 92, date: "May 5" },
    ],
  },
  {
    id: "react-frontend-mid",
    title: "React Frontend Mid-level",
    category: "Frontend",
    difficulty: "Medium",
    status: "Published",
    count: 10,
    date: "May 5, 2026",
    duration: "30 min",
    description: "Frontend interview covering React, TypeScript and modern web fundamentals.",
    skills: ["React", "TypeScript", "CSS"],
    questions: [
      { skill: "React", question: "Explain the difference between useMemo and useCallback.", difficulty: "Medium" },
      { skill: "React", question: "How does React reconciliation work for keyed lists?", difficulty: "Medium" },
      { skill: "TypeScript", question: "What are discriminated unions and when are they useful?", difficulty: "Medium" },
      { skill: "CSS", question: "Explain stacking contexts and z-index pitfalls.", difficulty: "Easy" },
    ],
    takers: [
      { name: "Lin Yang", email: "lin.y@northwind.co", status: "Invited", score: null, date: "May 9" },
    ],
  },
  {
    id: "qa-automation",
    title: "QA Automation Specialist",
    category: "Tester",
    difficulty: "Medium",
    status: "Draft",
    count: 8,
    date: "May 4, 2026",
    duration: "35 min",
    description: "Hands-on interview for QA engineers building automated test suites.",
    skills: ["Playwright", "API Testing", "CI/CD"],
    questions: [
      { skill: "Playwright", question: "How do you handle flaky end-to-end tests?", difficulty: "Medium" },
      { skill: "API Testing", question: "Walk through writing a contract test for a REST endpoint.", difficulty: "Medium" },
      { skill: "CI/CD", question: "How would you parallelize a 30 minute test suite?", difficulty: "Medium" },
    ],
    takers: [
      { name: "Tariq Ahmed", email: "tariq@lumen.io", status: "In Progress", score: null, date: "May 7" },
    ],
  },
  {
    id: "junior-python",
    title: "Junior Python Engineer",
    category: "Backend",
    difficulty: "Easy",
    status: "Published",
    count: 6,
    date: "May 3, 2026",
    duration: "25 min",
    description: "Entry-level Python interview focused on fundamentals and problem solving.",
    skills: ["Python", "Data Structures"],
    questions: [
      { skill: "Python", question: "Explain list vs tuple and when to use each.", difficulty: "Easy" },
      { skill: "Python", question: "What does a generator do? Give an example.", difficulty: "Easy" },
      { skill: "Data Structures", question: "How would you detect a duplicate in an array efficiently?", difficulty: "Easy" },
    ],
    takers: [
      { name: "Nora Park", email: "nora@acme.com", status: "Completed", score: 76, date: "May 4" },
    ],
  },
  {
    id: "devops-sre",
    title: "DevOps SRE",
    category: "Infra",
    difficulty: "Hard",
    status: "Draft",
    count: 14,
    date: "May 2, 2026",
    duration: "50 min",
    description: "Infrastructure and reliability interview for senior SRE candidates.",
    skills: ["Kubernetes", "Observability", "Incident Response"],
    questions: [
      { skill: "Kubernetes", question: "How does a rolling update work and how do you rollback safely?", difficulty: "Hard" },
      { skill: "Observability", question: "Design a logging and metrics stack for a multi-region service.", difficulty: "Hard" },
      { skill: "Incident Response", question: "Walk through a recent production incident you handled.", difficulty: "Medium" },
    ],
    takers: [
      { name: "Daniel Voss", email: "dan.v@acme.com", status: "Expired", score: null, date: "Apr 28" },
    ],
  },
];
