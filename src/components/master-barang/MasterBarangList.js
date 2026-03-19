"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMasterBarang, deleteMasterBarang } from "@/lib/masterBarangApi";
import { Plus, Edit2, Trash2, Search, Eye } from "lucide-react";

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MasterBarangList() {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  async function loadMasterBarang() {
    setIsLoading(true);
    setError("");

    try {
      const data = await getMasterBarang();
      setItems(data);
    } catch (err) {
      setError(err.message || "Gagal memuat data master barang.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMasterBarang();
  }, []);

  const categories = useMemo(() => {
    const values = items
      .map((item) => item.kategori)
      .filter((value) => typeof value === "string" && value.trim() !== "");

    return [...new Set(values)].sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== "all") {
      result = result.filter((item) => item.kategori === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.nama?.toLowerCase().includes(term) ||
          item.kategori?.toLowerCase().includes(term) ||
          item.satuan?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [items, selectedCategory, searchTerm]);

  const stockSummary = useMemo(() => {
    const totalProduk = filteredItems.length;
    const totalStok = filteredItems.reduce((sum, item) => sum + normalizeNumber(item.stok), 0);
    const hampirHabis = filteredItems.filter((item) => normalizeNumber(item.stok) <= normalizeNumber(item.stok_min)).length;

    return { totalProduk, totalStok, hampirHabis };
  }, [filteredItems]);

  async function onDelete(kodeBarang) {
    const confirmed = window.confirm("Hapus data barang ini?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteMasterBarang(kodeBarang);
      setMessage("Data barang berhasil dihapus.");
      await loadMasterBarang();
    } catch (err) {
      setError(err.message || "Gagal menghapus data barang.");
    }
  }

  function openDetail(item) {
    setSelectedItem(item);
  }

  function closeDetail() {
    setSelectedItem(null);
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Master Barang</h3>
            <p className="mt-1 text-sm text-gray-600">Kelola data produk inventory dengan mudah.</p>
          </div>

          <Link
            href="/master-barang/add"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Tambah Barang
          </Link>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Produk</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stockSummary.totalProduk}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stok</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stockSummary.totalStok}</p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
            <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">Hampir Habis</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{stockSummary.hampirHabis}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 sm:flex-1 sm:max-w-xs">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, kategori, satuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 me-auto"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            onClick={loadMasterBarang}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {message && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Harga Beli</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Min</TableHead>
                <TableHead>Aksi</TableHead>
              </tr>
            </thead>
            <tbody>
              {!isLoading && filteredItems.length === 0 && (
                <tr key="empty-state">
                  <td colSpan={9} className="border-t border-gray-200 py-12 text-center text-gray-500">
                    {searchTerm || selectedCategory !== "all" ? "Tidak ada data yang cocok." : "Belum ada data barang."}
                  </td>
                </tr>
              )}

              {filteredItems.map((item, idx) => {
                const stok = normalizeNumber(item.stok);
                const stokMin = normalizeNumber(item.stok_min);

                return (
                  <tr key={item.kode_barang} className={`border-t border-gray-200 text-gray-900 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <TableCell className="font-semibold">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.kategori}</TableCell>
                    <TableCell>{item.satuan}</TableCell>
                    <TableCell>{normalizeNumber(item.harga_beli).toLocaleString("id-ID")}</TableCell>
                    <TableCell>{normalizeNumber(item.harga_jual).toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          stok <= stokMin ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {stok}
                      </span>
                    </TableCell>
                    <TableCell>{stokMin}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openDetail(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          <Eye size={14} />
                          Detail
                        </button>
                        <Link
                          href={`/master-barang/${item.kode_barang}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-300 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"
                        >
                          <Edit2 size={14} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(item.kode_barang)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                          Hapus
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl border border-gray-200 bg-white text-gray-900 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Detail Barang</h3>
            <p className="mt-1 text-sm text-gray-500">Informasi lengkap master barang</p>

            <div className="mt-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-3 border-b border-gray-200 px-4 py-3 text-sm">
                <span className="font-medium text-gray-500">Kode Barang</span>
                <span className="font-semibold text-gray-900">{selectedItem.kode_barang || "-"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b border-gray-200 px-4 py-3 text-sm">
                <span className="font-medium text-gray-500">Nama</span>
                <span className="font-semibold text-gray-900">{selectedItem.nama || "-"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b border-gray-200 px-4 py-3 text-sm">
                <span className="font-medium text-gray-500">Kategori</span>
                <span className="font-semibold text-gray-900">{selectedItem.kategori || "-"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b border-gray-200 px-4 py-3 text-sm">
                <span className="font-medium text-gray-500">Satuan</span>
                <span className="font-semibold text-gray-900">{selectedItem.satuan || "-"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b border-gray-200 px-4 py-3 text-sm">
                <span className="font-medium text-gray-500">Harga Beli</span>
                <span className="font-semibold text-gray-900">{normalizeNumber(selectedItem.harga_beli).toLocaleString("id-ID")}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b border-gray-200 px-4 py-3 text-sm">
                <span className="font-medium text-gray-500">Harga Jual</span>
                <span className="font-semibold text-gray-900">{normalizeNumber(selectedItem.harga_jual).toLocaleString("id-ID")}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b border-gray-200 px-4 py-3 text-sm">
                <span className="font-medium text-gray-500">Stok</span>
                <span className="font-semibold text-gray-900">{normalizeNumber(selectedItem.stok)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 px-4 py-3 text-sm">
                <span className="font-medium text-gray-500">Stok Minimum</span>
                <span className="font-semibold text-gray-900">{normalizeNumber(selectedItem.stok_min)}</span>
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
          <button type="button" className="modal-backdrop bg-black/40" onClick={closeDetail} aria-label="Close modal" />
        </div>
      )}
    </section>
  );
}

function TableHead({ children }) {
  return <th className="font-semibold text-left px-4 py-3">{children}</th>;
}

function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
