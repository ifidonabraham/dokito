"use client";

import { useAuthStore } from "@/stores/auth-store";
import { LandingPage } from "@/components/home/landing-page";
import { Dashboard } from "@/components/home/dashboard";

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  return <Dashboard user={user} />;
}
