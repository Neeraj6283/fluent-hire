import { createFileRoute } from "@tanstack/react-router";
import { Profile } from "@/pages/Profile";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Voxa AI" },
      { name: "description", content: "Manage your Voxa AI profile, preferences, and security." },
    ],
  }),
  component: Profile,
});
