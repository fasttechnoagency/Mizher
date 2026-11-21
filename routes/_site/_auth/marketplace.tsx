import { createFileRoute } from "@tanstack/react-router";
import Marketplace from "@/screens/Marketplace";

export const Route = createFileRoute("/_site/_auth/marketplace")({
  head: () => ({
    meta: [
      { title: "Health marketplace | Mizher Medical Hub" },
      { name: "description", content: "Shop supplements, devices and care products from trusted pharmacies." },
      { property: "og:title", content: "Health marketplace | Mizher Medical Hub" },
      { property: "og:description", content: "Shop supplements, devices and care products from trusted pharmacies." },
    ],
  }),
  component: Marketplace,
});
