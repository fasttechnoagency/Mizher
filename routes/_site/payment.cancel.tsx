import { createFileRoute } from "@tanstack/react-router";
import PaymentCancel from "@/screens/PaymentCancel";

export const Route = createFileRoute("/_site/payment/cancel")({
  head: () => ({
    meta: [
      { title: "Payment cancelled | Mizher Medical Hub" },
      { name: "description", content: "Your payment was cancelled." },
      { property: "og:title", content: "Payment cancelled | Mizher Medical Hub" },
      { property: "og:description", content: "Your payment was cancelled." },
    ],
  }),
  component: PaymentCancel,
});
