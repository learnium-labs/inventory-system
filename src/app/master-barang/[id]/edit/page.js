"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MasterBarangForm from "@/components/master-barang/MasterBarangForm";
import { getMasterBarangById } from "@/lib/masterBarangApi";

export default function EditMasterBarangPage() {
  const params = useParams();
  const kodeBarang = params.id;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!kodeBarang) return;

    async function loadData() {
      setIsLoading(true);
      setError("");
      try {
        const item = await getMasterBarangById(kodeBarang);
        setData(item);
      } catch (err) {
        setError(err.message || "Gagal memuat data barang.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [kodeBarang]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-red-700">
        <p className="font-semibold">Error</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-6 py-4 text-yellow-700">
        <p className="font-semibold">Data Tidak Ditemukan</p>
        <p className="mt-1">Barang dengan ID tersebut tidak dapat ditemukan.</p>
      </div>
    );
  }

  return <MasterBarangForm mode="edit" initialData={data} />;
}
