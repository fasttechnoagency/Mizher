import { createFileRoute } from "@tanstack/react-router";

// Sabina's live chat. Public so signed-out visitors can talk to her too; the
// handler validates and bounds every request and never returns private data.
export const Route = createFileRoute("/api/public/sabina-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleSabinaChat } = await import("@/server/ai/sabina.server");
        return handleSabinaChat(request);
      },
    },
  },
});
