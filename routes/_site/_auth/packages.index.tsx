import { createFileRoute } from "@tanstack/react-router";
import Packages from "@/screens/Packages";

export const Route = createFileRoute("/_site/_auth/packages/")({
  head: () => ({
    meta: [
      { title: "Treatment packages | Mizher Medical Hub" },
      { name: "description", content: "Medical tourism and treatment packages in Jordan." },
      { property: "og:title", content: "Treatment packages | Mizher Medical Hub" },
      { property: "og:description", content: "Medical tourism and treatment packages in Jordan." },
    ],
  }),
  component: Packages,
});
