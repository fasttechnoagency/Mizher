import { createFileRoute } from "@tanstack/react-router";
import Booking from "@/screens/Booking";

export const Route = createFileRoute("/_site/_auth/booking")({
  head: () => ({
    meta: [
      { title: "Book a consultation | Mizher Medical Hub" },
      { name: "description", content: "Book a message, voice or video consultation with a doctor." },
      { property: "og:title", content: "Book a consultation | Mizher Medical Hub" },
      { property: "og:description", content: "Book a message, voice or video consultation with a doctor." },
    ],
  }),
  component: Booking,
});
