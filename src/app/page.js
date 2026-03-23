import AnalyticsCards from "@/components/dashboard/AnalyticsCards";
import DashboardShell from "@/components/layout/DashboardShell";

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "master-barang", label: "Master Barang" },
  { key: "stok-masuk", label: "Stok Masuk" },
  { key: "stok-keluar", label: "Stok Keluar" },
  { key: "rekap-stok", label: "Rekap Stok" },
  { key: "stock-opname", label: "Stock Opname" },
  { key: "laporan", label: "Laporan" },
];

export default function Home() {
  return (
    <DashboardShell
      menuItems={menuItems}
      activeKey="dashboard"
      title="Inventory Management"
      subtitle="Dashboard dan monitoring operasional inventory."
    >
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <AnalyticsCards />
          </div>
        </main>
    </DashboardShell>
  );
}
