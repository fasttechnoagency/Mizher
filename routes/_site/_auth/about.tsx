import { createFileRoute } from "@tanstack/react-router";
import About from "@/screens/About";

export const Route = createFileRoute("/_site/_auth/about")({
  head: () => ({
    meta: [
      { title: "About us | Mizher Medical Hub" },
      { name: "description", content: "About Mizher Medical Hub, Jordan's healthcare platform." },
      { property: "og:title", content: "About us | Mizher Medical Hub" },
      { property: "og:description", content: "About Mizher Medical Hub, Jordan's healthcare platform." },
    ],
  }),
  component: About,
});
