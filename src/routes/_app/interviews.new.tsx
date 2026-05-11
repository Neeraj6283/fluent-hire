import { createFileRoute } from "@tanstack/react-router";
import { CreateInterview } from "@/pages/CreateInterview";

export const Route = createFileRoute("/_app/interviews/new")({
  component: CreateInterview,
});
