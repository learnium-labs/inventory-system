import RekapStokList from "@/components/rekap-stok/RekapStokList";

export const metadata = {
  title: "Rekap Stok | Inventory System",
  description: "Ringkasan stok barang berdasarkan transaksi masuk dan keluar.",
};

export default function RekapStokPage() {
  return <RekapStokList />;
}
