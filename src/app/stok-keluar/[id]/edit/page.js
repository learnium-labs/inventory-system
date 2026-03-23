"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import StokKeluarForm from "@/components/stok-keluar/StokKeluarForm";
import { getStokKeluar } from "@/lib/stokKeluarApi";

export default function EditStokKeluarPage() {
  const params = useParams();
  const transaksiId = params.id;
  const lastFetchedIdRef = useRef(null);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!transaksiId) return;
    if (lastFetchedIdRef.current === String(transaksiId)) return;

    lastFetchedIdRef.current = String(transaksiId);

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const items = await getStokKeluar();
        const item = items.find((entry) => String(entry.id) === String(transaksiId));

        if (!item) {
          throw new Error("Data transaksi tidak ditemukan.");
        }

        setData(item);
      } catch (err) {
        setError(err.message || "Gagal memuat data transaksi stok keluar.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [transaksiId]);

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
        <p className="mt-1">Transaksi dengan ID tersebut tidak dapat ditemukan.</p>
      </div>
    );
  }

  return <StokKeluarForm mode="edit" initialData={data} />;
}
