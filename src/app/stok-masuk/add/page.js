import StokMasukForm from "@/components/stok-masuk/StokMasukForm";

export const metadata = {
  title: "Tambah Stok Masuk | Inventory System",
  description: "Tambahkan transaksi stok masuk baru.",
};

export default function AddStokMasukPage() {
  return <StokMasukForm mode="add" />;
}
