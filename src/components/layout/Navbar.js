export default function Navbar({
  title,
  subtitle,
  onToggleDesktopSidebar,
  onOpenMobileSidebar,
  isSidebarCollapsed,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onOpenMobileSidebar} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden" aria-label="Buka sidebar">
            <MenuIcon />
          </button>
          <button
            type="button"
            onClick={onToggleDesktopSidebar}
            className="hidden h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:inline-flex"
            aria-label="Toggle sidebar"
          >
            <ChevronIcon collapsed={isSidebarCollapsed} />
          </button>

          <div>
            <div className="border-l border-gray-200 pl-4">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 sm:flex">
            <SearchIcon />
            <input type="text" placeholder="Cari barang..." className="bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none" />
          </div>

          <button type="button" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Notifikasi">
            <BellIcon />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
          </button>

          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className="hidden flex-col items-end text-sm sm:flex">
              <p className="font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-semibold text-sm">JD</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ collapsed }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d={collapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17m11 0a2 2 0 11-4 0m0 0H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
