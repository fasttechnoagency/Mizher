import { createFileRoute } from "@tanstack/react-router";
import HospitalProfile from "@/screens/HospitalProfile";

export const Route = createFileRoute("/_site/_auth/hospitals/$id/")({
  head: () => ({
    meta: [
      { title: "Hospital profile | Mizher Medical Hub" },
      { name: "description", content: "Hospital details, departments and booking." },
      { property: "og:title", content: "Hospital profile | Mizher Medical Hub" },
      { property: "og:description", content: "Hospital details, departments and booking." },
    ],
  }),
  component: HospitalProfile,
});
