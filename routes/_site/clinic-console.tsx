import { createFileRoute } from "@tanstack/react-router";
import ClinicConsole from "@/screens/ClinicConsole";

export const Route = createFileRoute("/_site/clinic-console")({
  head: () => ({
    meta: [
      { title: "Clinic console | Mizher Medical Hub" },
      { name: "description", content: "Manage your clinic profile and bookings." },
      { property: "og:title", content: "Clinic console | Mizher Medical Hub" },
      { property: "og:description", content: "Manage your clinic profile and bookings." },
    ],
  }),
  component: ClinicConsole,
});
