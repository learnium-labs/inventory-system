import AnalyticsCards from "@/components/dashboard/AnalyticsCards";
import DashboardShell from "@/components/layout/DashboardShell";
import MasterBarangPanel from "@/components/master-barang/MasterBarangPanel";

const menuItems = [
  { key: "dashboard", label: "Dashboard Analisis" },
  { key: "master-barang", label: "Master Barang" },
  { key: "stock-masuk", label: "Stock Masuk" },
  { key: "stock-keluar", label: "Stock Keluar" },
  { key: "recap-stock", label: "Recap Stock" },
  { key: "stock-opname", label: "Stock Opname" },
  { key: "laporan", label: "Laporan" },
];

export default function Home() {
  return (
    <DashboardShell
      menuItems={menuItems}
      activeKey="master-barang"
      title="Inventory Management"
      subtitle="Fokus tahap awal: menu Master Barang"
    >
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <AnalyticsCards />
            <MasterBarangPanel />
          </div>
        </main>
    </DashboardShell>
  );
}
