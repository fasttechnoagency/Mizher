import { createFileRoute } from "@tanstack/react-router";
import LabProfile from "@/screens/LabProfile";

export const Route = createFileRoute("/_site/_auth/labs/$id")({
  head: () => ({
    meta: [
      { title: "Lab profile | Mizher Medical Hub" },
      { name: "description", content: "Lab details, services and booking." },
      { property: "og:title", content: "Lab profile | Mizher Medical Hub" },
      { property: "og:description", content: "Lab details, services and booking." },
    ],
  }),
  component: LabProfile,
});
