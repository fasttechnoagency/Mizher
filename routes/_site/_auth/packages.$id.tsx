import { createFileRoute } from "@tanstack/react-router";
import PackageCheckout from "@/screens/PackageCheckout";

export const Route = createFileRoute("/_site/_auth/packages/$id")({
  head: () => ({
    meta: [
      { title: "Package checkout | Mizher Medical Hub" },
      { name: "description", content: "Review and book your treatment package." },
      { property: "og:title", content: "Package checkout | Mizher Medical Hub" },
      { property: "og:description", content: "Review and book your treatment package." },
    ],
  }),
  component: PackageCheckout,
});
