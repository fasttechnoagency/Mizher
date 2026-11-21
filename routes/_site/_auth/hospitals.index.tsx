import { createFileRoute } from "@tanstack/react-router";
import Hospitals from "@/screens/Hospitals";

export const Route = createFileRoute("/_site/_auth/hospitals/")({
  head: () => ({
    meta: [
      { title: "Hospitals | Mizher Medical Hub" },
      { name: "description", content: "Find hospitals and clinics across Jordan." },
      { property: "og:title", content: "Hospitals | Mizher Medical Hub" },
      { property: "og:description", content: "Find hospitals and clinics across Jordan." },
    ],
  }),
  component: Hospitals,
});
