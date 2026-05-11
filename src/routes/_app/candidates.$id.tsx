import { createFileRoute } from "@tanstack/react-router";
import { CandidateDetail } from "@/pages/CandidateDetail";

export const Route = createFileRoute("/_app/candidates/$id")({
  component: CandidateDetail,
});
