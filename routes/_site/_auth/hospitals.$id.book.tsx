import { createFileRoute } from "@tanstack/react-router";
import HospitalBooking from "@/screens/HospitalBooking";

export const Route = createFileRoute("/_site/_auth/hospitals/$id/book")({
  head: () => ({
    meta: [
      { title: "Book a hospital visit | Mizher Medical Hub" },
      { name: "description", content: "Book a consultation, checkup or test at a hospital." },
      { property: "og:title", content: "Book a hospital visit | Mizher Medical Hub" },
      { property: "og:description", content: "Book a consultation, checkup or test at a hospital." },
    ],
  }),
  component: HospitalBooking,
});
