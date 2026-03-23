"use client";

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

export default function StokKeluarLayout({ children }) {
  return (
    <DashboardShell
      menuItems={menuItems}
      activeKey="stok-keluar"
      title="Stok Keluar"
      subtitle="Kelola transaksi barang keluar dan update stok otomatis."
    >
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {children}
        </div>
      </main>
    </DashboardShell>
  );
}
