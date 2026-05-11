import { createFileRoute } from "@tanstack/react-router";
import { CandidateResult } from "@/pages/CandidateResult";

export const Route = createFileRoute("/candidate/result/$id")({
  head: () => ({ meta: [{ title: "Interview Result — Voxa AI" }] }),
  component: CandidateResult,
});
