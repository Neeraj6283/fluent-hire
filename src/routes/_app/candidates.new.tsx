import { createFileRoute } from "@tanstack/react-router";
import { CreateCandidate } from "@/pages/CreateCandidate";

export const Route = createFileRoute("/_app/candidates/new")({
  component: CreateCandidate,
});
