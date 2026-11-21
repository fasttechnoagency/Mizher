import { createFileRoute } from "@tanstack/react-router";
import Register from "@/screens/Register";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create an account | Mizher Medical Hub" },
      { name: "description", content: "Join Mizher Medical Hub to book consultations, order health products and more." },
      { property: "og:title", content: "Create an account | Mizher Medical Hub" },
      { property: "og:description", content: "Join Mizher Medical Hub to book consultations, order health products and more." },
    ],
  }),
  component: Register,
});
