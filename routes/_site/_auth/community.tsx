import { createFileRoute } from "@tanstack/react-router";
import Community from "@/screens/Community";

export const Route = createFileRoute("/_site/_auth/community")({
  head: () => ({
    meta: [
      { title: "Community | Mizher Medical Hub" },
      { name: "description", content: "Health tips from doctors and answers to patient questions." },
      { property: "og:title", content: "Community | Mizher Medical Hub" },
      { property: "og:description", content: "Health tips from doctors and answers to patient questions." },
    ],
  }),
  component: Community,
});
