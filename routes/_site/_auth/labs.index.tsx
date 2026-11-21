import { createFileRoute } from "@tanstack/react-router";
import Labs from "@/screens/Labs";

export const Route = createFileRoute("/_site/_auth/labs/")({
  head: () => ({
    meta: [
      { title: "Medical labs | Mizher Medical Hub" },
      { name: "description", content: "Find medical labs and home-visit testing across Jordan." },
      { property: "og:title", content: "Medical labs | Mizher Medical Hub" },
      { property: "og:description", content: "Find medical labs and home-visit testing across Jordan." },
    ],
  }),
  component: Labs,
});
