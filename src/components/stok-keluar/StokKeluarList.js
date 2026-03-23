"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { deleteStokKeluar, getStokKeluar } from "@/lib/stokKeluarApi";

async function getSwal() {
  const sweetAlertModule = await import("sweetalert2");
  return sweetAlertModule.default;
}

const PAGE_SIZE = 15;

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDateDDMMYYYY(dateString) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export default function StokKeluarList() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const hasFetchedInitialData = useRef(false);

  async function loadData() {
    setIsLoading(true);
    setError("");

    try {
      const stokKeluarData = await getStokKeluar();
      setTransactions(stokKeluarData);
    } catch (err) {
      setError(err.message || "Gagal memuat data stok keluar.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hasFetchedInitialData.current) return;
    hasFetchedInitialData.current = true;
    loadData();
  }, []);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = transactions;
    if (term) {
      result = result.filter((item) =>
        [item.tanggal, item.kode_barang, item.nama_barang, item.penerima, item.keterangan]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      );
    }

    return [...result].sort((left, right) => {
      const leftTime = new Date(left.created_at || left.tanggal || 0).getTime();
      const rightTime = new Date(right.created_at || right.tanggal || 0).getTime();
      return rightTime - leftTime;
    });
  }, [transactions, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  }, [filteredTransactions.length]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function onDelete(id) {
    const Swal = await getSwal();
    const result = await Swal.fire({
      title: "Hapus transaksi?",
      text: "Stok master akan dikembalikan otomatis sesuai jumlah transaksi ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    setError("");

    try {
      await deleteStokKeluar(id);
      await Swal.fire({
        title: "Berhasil",
        text: "Transaksi stok keluar berhasil dihapus.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
      });
      await loadData();
    } catch (err) {
      setError(err.message || "Gagal menghapus transaksi stok keluar.");
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Stok Keluar</h3>
            <p className="mt-1 text-sm text-gray-600">Kelola transaksi stok keluar.</p>
          </div>

          <Link
            href="/stok-keluar/add"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Tambah Stok Keluar
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="mt-2 mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 sm:flex-1 sm:max-w-xs">
            <input
              type="text"
              placeholder="Cari tanggal, kode, nama, penerima..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>

          <button
            onClick={loadData}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <TableHead>No</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kode Barang</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Penerima</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Aksi</TableHead>
              </tr>
            </thead>
            <tbody>
              {isLoading && transactions.length === 0 &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`loading-${index}`} className="border-t border-gray-200">
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <td key={`loading-cell-${index}-${cellIndex}`} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="border-t border-gray-200 py-12 text-center text-gray-500">
                    {searchTerm ? "Tidak ada data yang cocok." : "Belum ada data stok keluar."}
                  </td>
                </tr>
              )}

              {paginatedTransactions.map((item, index) => (
                <tr key={item.id} className={`border-t border-gray-200 text-gray-900 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="font-semibold">{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
                  <TableCell>{formatDateDDMMYYYY(item.tanggal)}</TableCell>
                  <TableCell className="font-medium">{item.kode_barang || "-"}</TableCell>
                  <TableCell>{item.nama_barang || "-"}</TableCell>
                  <TableCell>{normalizeNumber(item.jumlah)}</TableCell>
                  <TableCell>{item.penerima || "-"}</TableCell>
                  <TableCell>{item.keterangan || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link
                        href={`/stok-keluar/${item.id}/edit`}
                        className="inline-flex items-center justify-center rounded-lg border border-blue-300 p-2 text-blue-700 transition hover:bg-blue-50"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-300 p-2 text-red-700 transition hover:bg-red-50"
                        aria-label="Hapus"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredTransactions.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Menampilkan {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredTransactions.length)} dari {filteredTransactions.length} data
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

function TableHead({ children }) {
  return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}

function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
