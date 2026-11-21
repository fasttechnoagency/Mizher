import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/components/layout/AppLayout";

// Shared layout (top navigation) for every page except the sign-in pages.
export const Route = createFileRoute("/_site")({
  component: AppLayout,
});
