import { createFileRoute } from "@tanstack/react-router";
import AdminDashboard from "@/screens/AdminDashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard | Mizher Medical Hub" },
      { name: "description", content: "Manage doctors, hospitals, labs, stores, bookings and orders." },
      { property: "og:title", content: "Admin dashboard | Mizher Medical Hub" },
      { property: "og:description", content: "Manage doctors, hospitals, labs, stores, bookings and orders." },
    ],
  }),
  component: AdminDashboard,
});
