"use client";

import DashboardShell from "@/components/layout/DashboardShell";

const menuItems = [
  { key: "dashboard", label: "Dashboard Analisis" },
  { key: "master-barang", label: "Master Barang" },
  { key: "stok-masuk", label: "Stok Masuk" },
  { key: "stock-keluar", label: "Stock Keluar" },
  { key: "recap-stock", label: "Recap Stock" },
  { key: "stock-opname", label: "Stock Opname" },
  { key: "laporan", label: "Laporan" },
];

export default function StokMasukLayout({ children }) {
  return (
    <DashboardShell
      menuItems={menuItems}
      activeKey="stok-masuk"
      title="Stok Masuk"
      subtitle="Kelola transaksi barang masuk dan update stok otomatis."
    >
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {children}
        </div>
      </main>
    </DashboardShell>
  );
}
