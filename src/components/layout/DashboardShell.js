"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { getAuthSession } from "@/lib/authClient";

export default function DashboardShell({
  children,
  menuItems,
  activeKey,
  title,
  subtitle,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const desktopSidebarWidth = isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72";

  useEffect(() => {
    const session = getAuthSession();

    if (!session?.isLoggedIn) {
      setIsAuthorized(false);
      setIsAuthChecked(true);
      if (pathname !== "/login") {
        router.replace("/login");
      }
      return;
    }

    setIsAuthorized(true);
    setIsAuthChecked(true);
  }, [pathname, router]);

  if (!isAuthChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
          <p className="mt-3 text-sm text-gray-500">Memeriksa sesi login...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        items={menuItems}
        activeKey={activeKey}
        collapsed={isSidebarCollapsed}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className={`flex min-h-screen flex-col transition-all duration-300 ${desktopSidebarWidth}`}>
        <Navbar
          title={title}
          subtitle={subtitle}
          onToggleDesktopSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {children}

        <Footer />
      </div>
    </div>
  );
}
