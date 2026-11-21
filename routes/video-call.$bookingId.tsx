import { createFileRoute } from "@tanstack/react-router";
import VideoCall from "@/screens/VideoCall";

export const Route = createFileRoute("/video-call/$bookingId")({
  head: () => ({
    meta: [
      { title: "Video consultation | Mizher Medical Hub" },
      { name: "description", content: "Join your video consultation on Mizher Medical Hub." },
      { property: "og:title", content: "Video consultation | Mizher Medical Hub" },
      { property: "og:description", content: "Join your video consultation on Mizher Medical Hub." },
    ],
  }),
  component: VideoCall,
});
