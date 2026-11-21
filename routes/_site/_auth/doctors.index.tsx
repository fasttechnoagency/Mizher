import { createFileRoute } from "@tanstack/react-router";
import DoctorDirectory from "@/screens/DoctorDirectory";

export const Route = createFileRoute("/_site/_auth/doctors/")({
  head: () => ({
    meta: [
      { title: "Find a doctor | Mizher Medical Hub" },
      { name: "description", content: "Browse verified doctors across Jordan and book a consultation." },
      { property: "og:title", content: "Find a doctor | Mizher Medical Hub" },
      { property: "og:description", content: "Browse verified doctors across Jordan and book a consultation." },
    ],
  }),
  component: DoctorDirectory,
});
