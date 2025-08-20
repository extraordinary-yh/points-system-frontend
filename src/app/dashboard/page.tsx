'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { Sidebar } from "@/components/Sidebar/Sidebar";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not logged in
    if (status === "loading") return; // Still loading
    if (status === "unauthenticated" || !session?.user) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">Loading...</div>
      </div>
    );
  }

  // Check if session exists
  if (status === "unauthenticated" || !session?.user) {
    return null; // Will redirect
  }

  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <Sidebar />
      <Dashboard />
    </main>
  );
}
