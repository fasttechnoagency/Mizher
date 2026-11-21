import { createFileRoute } from "@tanstack/react-router";
import PaymentReturn from "@/screens/PaymentReturn";

export const Route = createFileRoute("/_site/payment/return")({
  head: () => ({
    meta: [
      { title: "Confirming payment | Mizher Medical Hub" },
      { name: "description", content: "Confirming your payment with PayPal." },
      { property: "og:title", content: "Confirming payment | Mizher Medical Hub" },
      { property: "og:description", content: "Confirming your payment with PayPal." },
    ],
  }),
  component: PaymentReturn,
});
