import { createFileRoute } from "@tanstack/react-router";
import ThankYou from "@/screens/ThankYou";

export const Route = createFileRoute("/_site/thank-you")({
  head: () => ({
    meta: [
      { title: "Thank you | Mizher Medical Hub" },
      { name: "description", content: "Your request was received." },
      { property: "og:title", content: "Thank you | Mizher Medical Hub" },
      { property: "og:description", content: "Your request was received." },
    ],
  }),
  component: ThankYou,
});
