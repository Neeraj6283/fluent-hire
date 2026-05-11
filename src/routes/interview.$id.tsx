import { createFileRoute } from "@tanstack/react-router";
import { CandidateInterview } from "@/pages/CandidateInterview";

export const Route = createFileRoute("/interview/$id")({
  head: () => ({ meta: [{ title: "Interview — Voxa AI" }] }),
  component: CandidateInterview,
});
