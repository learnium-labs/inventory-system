"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getMasterBarang } from "@/lib/masterBarangApi";
import { getStokMasuk } from "@/lib/stokMasukApi";
import { getStokKeluar } from "@/lib/stokKeluarApi";

const PAGE_SIZE = 15;

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildJumlahMap(items) {
  const map = new Map();
  items.forEach((item) => {
    const kodeBarang = String(item.kode_barang || "").trim();
    if (!kodeBarang) return;
    const current = map.get(kodeBarang) || 0;
    map.set(kodeBarang, current + normalizeNumber(item.jumlah));
  });
  return map;
}

export default function RekapStokList() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const hasFetchedInitialData = useRef(false);

  async function loadData() {
    setIsLoading(true);
    setError("");

    try {
      const [masterData, stokMasukData, stokKeluarData] = await Promise.all([
        getMasterBarang(),
        getStokMasuk(),
        getStokKeluar(),
      ]);

      const stokMasukMap = buildJumlahMap(stokMasukData);
      const stokKeluarMap = buildJumlahMap(stokKeluarData);

      const recapRows = masterData.map((item) => {
        const kodeBarang = String(item.kode_barang || "").trim();
        const stokAkhir = normalizeNumber(item.stok);
        const stokMasuk = stokMasukMap.get(kodeBarang) || 0;
        const stokKeluar = stokKeluarMap.get(kodeBarang) || 0;
        const stokAwal = stokAkhir - stokMasuk + stokKeluar;

        return {
          kode_barang: kodeBarang,
          nama_barang: item.nama || "",
          kategori: item.kategori || "",
          stok_awal: stokAwal,
          stok_masuk: stokMasuk,
          stok_keluar: stokKeluar,
          stok_akhir: stokAkhir,
        };
      });

      setRows(recapRows);
    } catch (err) {
      setError(err.message || "Gagal memuat data rekap stok.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hasFetchedInitialData.current) return;
    hasFetchedInitialData.current = true;
    loadData();
  }, []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = rows;
    if (term) {
      result = result.filter((item) =>
        [item.kode_barang, item.nama_barang, item.kategori]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      );
    }

    return [...result].sort((left, right) => String(left.kode_barang).localeCompare(String(right.kode_barang)));
  }, [rows, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  }, [filteredRows.length]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Rekap Stok</h3>
            <p className="mt-1 text-sm text-gray-600">Ringkasan stok awal, stok masuk, stok keluar, dan stok akhir per barang.</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mt-2 mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 sm:flex-1 sm:max-w-xs">
            <input
              type="text"
              placeholder="Cari kode, nama, kategori..."
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
                <TableHead>Kode Barang</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Stok Awal</TableHead>
                <TableHead>Stok Masuk</TableHead>
                <TableHead>Stok Keluar</TableHead>
                <TableHead>Stok Akhir</TableHead>
              </tr>
            </thead>
            <tbody>
              {isLoading && rows.length === 0 &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`loading-${index}`} className="border-t border-gray-200">
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <td key={`loading-cell-${index}-${cellIndex}`} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="border-t border-gray-200 py-12 text-center text-gray-500">
                    {searchTerm ? "Tidak ada data yang cocok." : "Belum ada data rekap stok."}
                  </td>
                </tr>
              )}

              {paginatedRows.map((item, index) => (
                <tr key={`${item.kode_barang}-${index}`} className={`border-t border-gray-200 text-gray-900 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="font-semibold">{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
                  <TableCell className="font-medium">{item.kode_barang || "-"}</TableCell>
                  <TableCell>{item.nama_barang || "-"}</TableCell>
                  <TableCell>{item.kategori || "-"}</TableCell>
                  <TableCell>{normalizeNumber(item.stok_awal)}</TableCell>
                  <TableCell>{normalizeNumber(item.stok_masuk)}</TableCell>
                  <TableCell>{normalizeNumber(item.stok_keluar)}</TableCell>
                  <TableCell className="font-semibold">{normalizeNumber(item.stok_akhir)}</TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredRows.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Menampilkan {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredRows.length)} dari {filteredRows.length} data
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
