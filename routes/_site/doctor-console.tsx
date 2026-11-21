import { createFileRoute } from "@tanstack/react-router";
import DoctorConsole from "@/screens/DoctorConsole";

export const Route = createFileRoute("/_site/doctor-console")({
  head: () => ({
    meta: [
      { title: "Doctor console | Mizher Medical Hub" },
      { name: "description", content: "Manage your appointments, services and profile." },
      { property: "og:title", content: "Doctor console | Mizher Medical Hub" },
      { property: "og:description", content: "Manage your appointments, services and profile." },
    ],
  }),
  component: DoctorConsole,
});
