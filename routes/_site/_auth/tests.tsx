import { createFileRoute } from "@tanstack/react-router";
import Tests from "@/screens/Tests";

export const Route = createFileRoute("/_site/_auth/tests")({
  head: () => ({
    meta: [
      { title: "Medical tests | Mizher Medical Hub" },
      { name: "description", content: "Browse and book medical tests." },
      { property: "og:title", content: "Medical tests | Mizher Medical Hub" },
      { property: "og:description", content: "Browse and book medical tests." },
    ],
  }),
  component: Tests,
});
