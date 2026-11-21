import { createFileRoute } from "@tanstack/react-router";
import ProductDetail from "@/screens/ProductDetail";

export const Route = createFileRoute("/_site/_auth/products/$id")({
  head: () => ({
    meta: [
      { title: "Product details | Mizher Medical Hub" },
      { name: "description", content: "Product details from trusted pharmacies and stores." },
      { property: "og:title", content: "Product details | Mizher Medical Hub" },
      { property: "og:description", content: "Product details from trusted pharmacies and stores." },
    ],
  }),
  component: ProductDetail,
});
