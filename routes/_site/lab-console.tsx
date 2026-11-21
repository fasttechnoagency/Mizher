import { createFileRoute } from "@tanstack/react-router";
import LabConsole from "@/screens/LabConsole";

export const Route = createFileRoute("/_site/lab-console")({
  head: () => ({
    meta: [
      { title: "Lab console | Mizher Medical Hub" },
      { name: "description", content: "Manage your lab profile and services." },
      { property: "og:title", content: "Lab console | Mizher Medical Hub" },
      { property: "og:description", content: "Manage your lab profile and services." },
    ],
  }),
  component: LabConsole,
});
