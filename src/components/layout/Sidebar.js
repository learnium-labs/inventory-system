export default function Sidebar({
  items,
  activeKey,
  collapsed,
  mobileOpen,
  onCloseMobile,
}) {
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
        <SidebarContent items={items} activeKey={activeKey} collapsed={collapsed} isMobile={false} />
      </aside>
    </>
  );
}

function SidebarContent({ items, activeKey, collapsed, isMobile, onCloseMobile }) {
  return (
    <>
      <div className="flex h-20 items-center justify-between border-b border-gray-700 px-4 py-6">
        <div className={`flex items-center gap-3 ${collapsed ? "mx-auto" : ""}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
            <GridIcon />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-bold text-white">Inventory</h1>
              <p className="text-[10px] text-gray-400">Management</p>
            </div>
          )}
        </div>

        {isMobile && (
          <button type="button" onClick={onCloseMobile} className="text-gray-400 hover:text-white" aria-label="Tutup sidebar">
            <CloseIcon />
          </button>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"} py-4`}>
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.key === activeKey;
            const isReady = item.key === "master-barang";

            return (
              <li key={item.key}>
                <button
                  type="button"
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {collapsed ? (
                    <DotIcon />
                  ) : (
                    <>
                      <DotIcon />
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

function DotIcon() {
  return <span className="h-2 w-2 rounded-full bg-current opacity-60" />;
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
    </svg>
  );
}
