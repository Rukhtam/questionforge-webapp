"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <Navbar />
      <Sidebar />

      {/* Main Content - Centered with max-width, avoiding sidebar overlap */}
      {/* Using inline style to ensure padding is applied below fixed navbar */}
      <main style={{ paddingTop: '7rem', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '72rem', marginLeft: 'auto', marginRight: 'auto', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading state while checking auth - with skeleton UI
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
        {/* Skeleton Navbar */}
        <div className="h-16 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gray-800 animate-pulse" />
              <div className="h-8 w-8 rounded-xl bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <div className="h-6 w-32 bg-gray-800 rounded animate-pulse hidden sm:block" />
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-800 animate-pulse" />
          </div>
        </div>

        {/* Skeleton Content */}
        <main style={{ paddingTop: '7rem', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: '72rem', marginLeft: 'auto', marginRight: 'auto', paddingTop: '1.5rem', paddingBottom: '1.5rem' }} className="space-y-8">
            {/* Skeleton Title */}
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
            </div>

            {/* Skeleton Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gray-800 animate-pulse">
                      <div className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
                      <div className="h-8 w-8 bg-gray-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skeleton Quick Actions */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-800 rounded animate-pulse" />
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
                    <div className="h-12 w-12 rounded-xl bg-gray-800 animate-pulse mb-4" />
                    <div className="h-5 w-32 bg-gray-800 rounded animate-pulse mb-2" />
                    <div className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Don't render if unauthenticated (redirect happening)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
