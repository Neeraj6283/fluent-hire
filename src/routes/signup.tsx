import { createFileRoute } from "@tanstack/react-router";
import { Signup } from "@/pages/Signup";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Voxa AI" },
      { name: "description", content: "Create your Voxa AI workspace and start running AI interviews." },
    ],
  }),
  component: Signup,
});
