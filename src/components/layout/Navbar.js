import { Menu, ChevronLeft, ChevronRight, Search, Bell } from "lucide-react";

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
            <Menu size={20} />
          </button>
          <button
            type="button"
            onClick={onToggleDesktopSidebar}
            className="hidden h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:inline-flex"
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
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
            <Search size={16} className="text-gray-500" />
            <input type="text" placeholder="Cari barang..." className="bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none" />
          </div>

          <button type="button" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Notifikasi">
            <Bell size={20} />
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
