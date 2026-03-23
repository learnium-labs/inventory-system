"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Edit2 } from "lucide-react";
import { getMasterBarangById } from "@/lib/masterBarangApi";
import { getStokMasuk } from "@/lib/stokMasukApi";
import { getStokKeluar } from "@/lib/stokKeluarApi";

const PAGE_SIZE = 15;

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("id-ID");
}

export default function DetailMasterBarangPage() {
  const params = useParams();
  const kodeBarang = params.id;
  const lastFetchedKodeBarangRef = useRef(null);

  const [item, setItem] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!kodeBarang) return;
    if (lastFetchedKodeBarangRef.current === String(kodeBarang)) return;

    lastFetchedKodeBarangRef.current = String(kodeBarang);

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const [barang, stokMasuk, stokKeluar] = await Promise.all([
          getMasterBarangById(kodeBarang),
          getStokMasuk(),
          getStokKeluar(),
        ]);

        const masukRows = stokMasuk
          .filter((entry) => String(entry.kode_barang) === String(kodeBarang))
          .map((entry) => ({
            id: entry.id,
            tanggal: entry.tanggal,
            created_at: entry.created_at,
            tipe: "Stok Masuk",
            jumlah: normalizeNumber(entry.jumlah),
            pihak: entry.supplier || "-",
            keterangan: entry.keterangan || "-",
          }));

        const keluarRows = stokKeluar
          .filter((entry) => String(entry.kode_barang) === String(kodeBarang))
          .map((entry) => ({
            id: entry.id,
            tanggal: entry.tanggal,
            created_at: entry.created_at,
            tipe: "Stok Keluar",
            jumlah: -normalizeNumber(entry.jumlah),
            pihak: entry.penerima || "-",
            keterangan: entry.keterangan || "-",
          }));

        const mergedRows = [...masukRows, ...keluarRows].sort((left, right) => {
          const leftTime = new Date(left.created_at || left.tanggal || 0).getTime();
          const rightTime = new Date(right.created_at || right.tanggal || 0).getTime();
          return rightTime - leftTime;
        });

        setItem(barang);
        setHistoryRows(mergedRows);
      } catch (err) {
        setError(err.message || "Gagal memuat detail barang.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [kodeBarang]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(historyRows.length / PAGE_SIZE));
  }, [historyRows.length]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return historyRows.slice(start, start + PAGE_SIZE);
  }, [historyRows, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  if (!item) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-6 py-4 text-yellow-700">
        <p className="font-semibold">Data Tidak Ditemukan</p>
        <p className="mt-1">Barang dengan ID tersebut tidak dapat ditemukan.</p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/master-barang"
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
              title="Kembali"
            >
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Detail Barang</h3>
              <p className="mt-1 text-sm text-gray-600">Informasi barang dan histori transaksi stok.</p>
            </div>
          </div>

          <Link
            href={`/master-barang/${item.kode_barang}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            <Edit2 size={16} />
            Edit Barang
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
            <InfoRow label="Kode Barang" value={item.kode_barang || "-"} />
            <InfoRow label="Nama Barang" value={item.nama || "-"} />
            <InfoRow label="Kategori" value={item.kategori || "-"} />
            <InfoRow label="Satuan" value={item.satuan || "-"} capitalize />
            <InfoRow label="Harga Beli" value={normalizeNumber(item.harga_beli).toLocaleString("id-ID")} />
            <InfoRow label="Harga Jual" value={normalizeNumber(item.harga_jual).toLocaleString("id-ID")} />
            <InfoRow label="Stok Saat Ini" value={normalizeNumber(item.stok)} />
            <InfoRow label="Stok Minimum" value={normalizeNumber(item.stok_min)} />
            <InfoRow label="Dibuat Pada" value={formatDateTime(item.created_at)} fullWidth />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <TableHead>No</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Supplier/Penerima</TableHead>
                <TableHead>Keterangan</TableHead>
              </tr>
            </thead>
            <tbody>
              {historyRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="border-t border-gray-200 py-12 text-center text-gray-500">
                    Belum ada histori stok untuk barang ini.
                  </td>
                </tr>
              )}

              {paginatedRows.map((row, index) => {
                const isMasuk = row.jumlah > 0;
                const formattedJumlah = `${isMasuk ? "+" : "-"}${Math.abs(row.jumlah)}`;

                return (
                  <tr key={`${row.tipe}-${row.id}-${index}`} className={`border-t border-gray-200 text-gray-900 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <TableCell className="font-semibold">{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
                    <TableCell>{formatDate(row.tanggal)}</TableCell>
                    <TableCell>{row.tipe}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isMasuk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {formattedJumlah}
                      </span>
                    </TableCell>
                    <TableCell>{row.pihak}</TableCell>
                    <TableCell>{row.keterangan}</TableCell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {historyRows.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Menampilkan {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, historyRows.length)} dari {historyRows.length} data
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function InfoRow({ label, value, capitalize = false, fullWidth = false }) {
  return (
    <div className={`grid grid-cols-2 gap-3 border-b border-gray-200 px-4 py-3 text-sm ${fullWidth ? "sm:col-span-2" : ""}`}>
      <span className="font-medium text-gray-500">{label}</span>
      <span className={`font-semibold text-gray-900 ${capitalize ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}

function TableHead({ children }) {
  return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}

function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
