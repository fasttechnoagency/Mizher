import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/screens/Profile";

export const Route = createFileRoute("/_site/_auth/profile")({
  head: () => ({
    meta: [
      { title: "My profile | Mizher Medical Hub" },
      { name: "description", content: "Your bookings, orders and account settings." },
      { property: "og:title", content: "My profile | Mizher Medical Hub" },
      { property: "og:description", content: "Your bookings, orders and account settings." },
    ],
  }),
  component: Profile,
});
