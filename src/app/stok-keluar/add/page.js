import StokKeluarForm from "@/components/stok-keluar/StokKeluarForm";

export const metadata = {
  title: "Tambah Stok Keluar | Inventory System",
  description: "Tambahkan transaksi stok keluar baru.",
};

export default function AddStokKeluarPage() {
  return <StokKeluarForm mode="add" />;
}
