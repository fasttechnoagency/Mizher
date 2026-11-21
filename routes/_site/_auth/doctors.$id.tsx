import { createFileRoute } from "@tanstack/react-router";
import DoctorProfile from "@/screens/DoctorProfile";

export const Route = createFileRoute("/_site/_auth/doctors/$id")({
  head: () => ({
    meta: [
      { title: "Doctor profile | Mizher Medical Hub" },
      { name: "description", content: "Doctor details, services, reviews and booking." },
      { property: "og:title", content: "Doctor profile | Mizher Medical Hub" },
      { property: "og:description", content: "Doctor details, services, reviews and booking." },
    ],
  }),
  component: DoctorProfile,
});
