import { createFileRoute } from "@tanstack/react-router";

// Sabina's natural voice (streamed speech). Input is validated and length-bounded.
export const Route = createFileRoute("/api/public/sabina-tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleSabinaSpeech } = await import("@/server/ai/sabina.server");
        return handleSabinaSpeech(request);
      },
    },
  },
});
