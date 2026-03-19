import MasterBarangForm from "@/components/master-barang/MasterBarangForm";

export const metadata = {
  title: "Tambah Barang | Inventory System",
  description: "Tambahkan produk baru ke master barang inventory.",
};

export default function AddMasterBarangPage() {
  return <MasterBarangForm mode="add" />;
}
