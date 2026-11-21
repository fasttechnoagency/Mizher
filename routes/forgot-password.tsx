import { createFileRoute } from "@tanstack/react-router";
import ForgotPassword from "@/screens/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password | Mizher Medical Hub" },
      { name: "description", content: "Reset the password for your Mizher Medical Hub account." },
      { property: "og:title", content: "Forgot password | Mizher Medical Hub" },
      { property: "og:description", content: "Reset the password for your Mizher Medical Hub account." },
    ],
  }),
  component: ForgotPassword,
});
