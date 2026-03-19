"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardShell({
  children,
  menuItems,
  activeKey,
  title,
  subtitle,
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const desktopSidebarWidth = isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72";

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
