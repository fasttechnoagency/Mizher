import { createFileRoute } from "@tanstack/react-router";
import HospitalConsole from "@/screens/HospitalConsole";

export const Route = createFileRoute("/_site/hospital-console")({
  head: () => ({
    meta: [
      { title: "Hospital console | Mizher Medical Hub" },
      { name: "description", content: "Manage your hospital profile and bookings." },
      { property: "og:title", content: "Hospital console | Mizher Medical Hub" },
      { property: "og:description", content: "Manage your hospital profile and bookings." },
    ],
  }),
  component: HospitalConsole,
});
