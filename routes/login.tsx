import { createFileRoute } from "@tanstack/react-router";
import Login from "@/screens/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in | Mizher Medical Hub" },
      { name: "description", content: "Log in to your Mizher Medical Hub account to book doctors, hospitals and labs." },
      { property: "og:title", content: "Log in | Mizher Medical Hub" },
      { property: "og:description", content: "Log in to your Mizher Medical Hub account to book doctors, hospitals and labs." },
    ],
  }),
  component: Login,
});
