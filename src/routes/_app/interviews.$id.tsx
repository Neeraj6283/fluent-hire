import { createFileRoute } from "@tanstack/react-router";
import { InterviewDetail } from "@/pages/InterviewDetail";

export const Route = createFileRoute("/_app/interviews/$id")({
  component: InterviewDetail,
});
