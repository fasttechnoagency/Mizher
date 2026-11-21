import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/screens/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mizher Medical Hub | مزهر الطبي" },
      { name: "description", content: "Jordan's trusted healthcare platform — connect with top doctors, hospitals, labs and medical tourism packages." },
      { property: "og:title", content: "Mizher Medical Hub | مزهر الطبي" },
      { property: "og:description", content: "Jordan's trusted healthcare platform — connect with top doctors, hospitals, labs and medical tourism packages." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <AppLayout>
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    </AppLayout>
  );
}
