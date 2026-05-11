import { createFileRoute, redirect } from "@tanstack/react-router";
import { Dashboard } from "@/pages/Dashboard";

export const Route = createFileRoute("/_app/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("voxa_auth")) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Dashboard — Voxa AI" },
      { name: "description", content: "AI Interview platform overview" },
    ],
  }),
  component: Dashboard,
});
