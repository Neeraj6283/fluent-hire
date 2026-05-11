import { createFileRoute } from "@tanstack/react-router";
import { Candidates } from "@/pages/Candidates";

export const Route = createFileRoute("/_app/candidates/")({
  component: Candidates,
});
