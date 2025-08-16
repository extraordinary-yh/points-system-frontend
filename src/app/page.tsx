'use client';
import { useSession } from "next-auth/react";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { AuthPage } from "@/components/Auth/AuthPage";
import { apiService } from "@/services/api";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">Loading...</div>
      </div>
    );
  }

  // Check if session exists
  if (status === "unauthenticated" || !session?.user) {
    return <AuthPage />;
  }

  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <Sidebar />
      <Dashboard />
    </main>
  );
}
