import { createFileRoute } from "@tanstack/react-router";
import RetailerConsole from "@/screens/RetailerConsole";

export const Route = createFileRoute("/_site/retailer-console")({
  head: () => ({
    meta: [
      { title: "Store console | Mizher Medical Hub" },
      { name: "description", content: "Manage your store, products, orders and promo codes." },
      { property: "og:title", content: "Store console | Mizher Medical Hub" },
      { property: "og:description", content: "Manage your store, products, orders and promo codes." },
    ],
  }),
  component: RetailerConsole,
});
