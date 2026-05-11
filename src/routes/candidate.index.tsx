import { createFileRoute } from "@tanstack/react-router";
import { CandidatePortal } from "@/pages/CandidatePortal";

export const Route = createFileRoute("/candidate/")({
  head: () => ({ meta: [{ title: "Candidate Portal — Voxa AI" }] }),
  component: CandidatePortal,
});
