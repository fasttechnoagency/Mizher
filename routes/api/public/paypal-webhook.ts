import { createFileRoute } from "@tanstack/react-router";

// PayPal webhook receiver. The handler verifies PayPal's signature itself
// before acting on any event.
export const Route = createFileRoute("/api/public/paypal-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { runRawHandler } = await import("@/server/runtime.server");
        return runRawHandler("paypalWebhook", request);
      },
    },
  },
});
