import { createFileRoute } from "@tanstack/react-router";
import Contact from "@/screens/Contact";

export const Route = createFileRoute("/_site/_auth/contact")({
  head: () => ({
    meta: [
      { title: "Contact us | Mizher Medical Hub" },
      { name: "description", content: "Get in touch with the Mizher Medical Hub team." },
      { property: "og:title", content: "Contact us | Mizher Medical Hub" },
      { property: "og:description", content: "Get in touch with the Mizher Medical Hub team." },
    ],
  }),
  component: Contact,
});
