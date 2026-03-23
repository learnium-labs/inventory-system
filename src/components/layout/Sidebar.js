"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid, Package, ArrowDown, ArrowUp, BoxIcon, CheckSquare, FileText, X } from "lucide-react";

export default function Sidebar({
  items,
  activeKey,
  collapsed,
  mobileOpen,
  onCloseMobile,
}) {
  const router = useRouter();
  const desktopWidth = collapsed ? "w-20" : "w-72";

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-gray-700 bg-gray-900 transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          items={items}
          activeKey={activeKey}
          collapsed={false}
          isMobile
          onCloseMobile={onCloseMobile}
          router={router}
        />
      </aside>

      {mobileOpen && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Tutup sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-gray-700 bg-gray-900 transition-all duration-300 lg:flex lg:flex-col ${desktopWidth}`}
      >
        <SidebarContent items={items} activeKey={activeKey} collapsed={collapsed} isMobile={false} router={router} />
      </aside>
    </>
  );
}

function SidebarContent({ items, activeKey, collapsed, isMobile, onCloseMobile, router }) {
  const getRouteFromKey = (key) => {
    const routes = {
      dashboard: "/",
      "master-barang": "/master-barang",
      "stok-masuk": "/stok-masuk",
      "stok-keluar": "/stok-keluar",
      "rekap-stok": "/rekap-stok",
      "stock-opname": "/stock-opname",
      laporan: "/laporan",
    };
    return routes[key] || "/";
  };

  const handleMenuClick = (key) => {
    const route = getRouteFromKey(key);
    router.push(route);
    if (isMobile) {
      onCloseMobile();
    }
  };
  return (
    <>
      <div className="flex h-20 items-center justify-between border-b border-gray-700 px-4 py-6">
        <div className={`flex items-center gap-3 ${collapsed ? "mx-auto" : ""}`}>
          <div className="h-11 w-11 overflow-hidden rounded-full border border-blue-500/30 bg-blue-600/10">
            <img
              src="/logo.jpeg"
              alt="Logo"
              className="h-full w-full object-cover"
            />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">Inventory</h1>
              <p className="text-xs text-gray-400">Management</p>
            </div>
          )}
        </div>

        {isMobile && (
          <button type="button" onClick={onCloseMobile} className="text-gray-400 hover:text-white" aria-label="Tutup sidebar">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"} py-4`}>
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.key === activeKey;
            const isReady =
              item.key === "master-barang" ||
              item.key === "dashboard" ||
              item.key === "stok-masuk" ||
              item.key === "stok-keluar" ||
              item.key === "rekap-stok";
            const icon = getMenuIcon(item.key);

            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => handleMenuClick(item.key)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex-shrink-0">
                    {icon}
                  </div>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${
                          isReady
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-700/50 text-gray-400"
                        }`}
                      >
                        {isReady ? "Aktif" : "Soon"}
                      </span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

function getMenuIcon(key) {
  const iconProps = { size: 18 };

  switch (key) {
    case "dashboard":
      return <LayoutGrid {...iconProps} />;
    case "master-barang":
      return <Package {...iconProps} />;
    case "stok-masuk":
      return <ArrowDown {...iconProps} />;
    case "stok-keluar":
      return <ArrowUp {...iconProps} />;
    case "rekap-stok":
      return <BoxIcon {...iconProps} />;
    case "stock-opname":
      return <CheckSquare {...iconProps} />;
    case "laporan":
      return <FileText {...iconProps} />;
    default:
      return <Package {...iconProps} />;
  }
}
