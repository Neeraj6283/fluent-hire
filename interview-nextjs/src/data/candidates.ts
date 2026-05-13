export type CandidateRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  status: string;
  interview: string;
  date: string;
  score: number | null;
  resume: string;
  notes: string;
  answers: { question: string; answer: string; rating: number | null }[];
};

export const candidateRows: CandidateRow[] = [
  {
    id: "mira-khan", name: "Mira Khan", email: "mira@acme.com", phone: "+1 415 555 0142",
    role: "Senior Backend Engineer", location: "San Francisco, CA",
    status: "Completed", interview: "Senior Backend", date: "May 6", score: 88,
    resume: "mira-khan-resume.pdf",
    notes: "Strong system design answers, recommend on-site loop.",
    answers: [
      { question: "Explain the Node.js event loop.", answer: "Walked through phases (timers, pending, poll, check, close) and microtask queue ordering.", rating: 9 },
      { question: "Design a rate limiter for 100k req/s.", answer: "Token bucket sharded by user with Redis, fallback to in-memory counter.", rating: 8 },
    ],
  },
  {
    id: "tariq-ahmed", name: "Tariq Ahmed", email: "tariq@lumen.io", phone: "+44 20 7946 0958",
    role: "QA Automation", location: "London, UK",
    status: "In Progress", interview: "QA Automation", date: "May 7", score: null,
    resume: "tariq-ahmed-resume.pdf",
    notes: "In progress — interview started 12 min ago.",
    answers: [],
  },
  {
    id: "lin-yang", name: "Lin Yang", email: "lin.y@northwind.co", phone: "+1 206 555 0117",
    role: "Frontend Engineer", location: "Seattle, WA",
    status: "Invited", interview: "Frontend Mid", date: "May 9", score: null,
    resume: "lin-yang-resume.pdf",
    notes: "Invitation sent, awaiting response.",
    answers: [],
  },
  {
    id: "nora-park", name: "Nora Park", email: "nora@acme.com", phone: "+1 212 555 0188",
    role: "Junior Python Engineer", location: "New York, NY",
    status: "Completed", interview: "Junior Python", date: "May 4", score: 76,
    resume: "nora-park-resume.pdf",
    notes: "Solid fundamentals, room to grow on system thinking.",
    answers: [
      { question: "List vs tuple in Python?", answer: "Mentioned mutability and use cases; missed performance nuance.", rating: 7 },
      { question: "Detect duplicates efficiently.", answer: "Used a set in O(n).", rating: 8 },
    ],
  },
  {
    id: "daniel-voss", name: "Daniel Voss", email: "dan.v@acme.com", phone: "+49 30 901820",
    role: "DevOps SRE", location: "Berlin, DE",
    status: "Expired", interview: "DevOps SRE", date: "Apr 28", score: null,
    resume: "daniel-voss-resume.pdf",
    notes: "Did not start interview before invite expired.",
    answers: [],
  },
  {
    id: "aiko-sato", name: "Aiko Sato", email: "aiko@lumen.io", phone: "+81 3 1234 5678",
    role: "Senior Backend Engineer", location: "Tokyo, JP",
    status: "Completed", interview: "Senior Backend", date: "May 5", score: 92,
    resume: "aiko-sato-resume.pdf",
    notes: "Excellent across the board, fast-track.",
    answers: [
      { question: "Optimize a slow Postgres query.", answer: "Used EXPLAIN ANALYZE, added covering index, rewrote subquery as CTE.", rating: 10 },
      { question: "Design a worker pool for CPU heavy tasks.", answer: "Node worker_threads with bounded queue and backpressure.", rating: 9 },
    ],
  },
];
