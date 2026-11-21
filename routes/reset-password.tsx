import { createFileRoute } from "@tanstack/react-router";
import ResetPassword from "@/screens/ResetPassword";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | Mizher Medical Hub" },
      { name: "description", content: "Choose a new password for your Mizher Medical Hub account." },
      { property: "og:title", content: "Set a new password | Mizher Medical Hub" },
      { property: "og:description", content: "Choose a new password for your Mizher Medical Hub account." },
    ],
  }),
  component: ResetPassword,
});
