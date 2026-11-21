import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages under this layout require a signed-in account.
export const Route = createFileRoute("/_site/_auth")({
  component: ProtectedRoute,
});
