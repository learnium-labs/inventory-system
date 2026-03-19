"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMasterBarang,
  deleteMasterBarang,
  getMasterBarang,
  updateMasterBarang,
} from "@/lib/masterBarangApi";

const initialForm = {
  kode_barang: "",
  nama_barang: "",
  kategori: "",
  harga: "",
  ukuran: "",
  deskripsi: "",
  stok: "",
};

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MasterBarangPanel() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingCode, setEditingCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.kategori === selectedCategory);
  }, [items, selectedCategory]);

  const stockSummary = useMemo(() => {
    const totalProduk = filteredItems.length;
    const totalStok = filteredItems.reduce((sum, item) => sum + normalizeNumber(item.stok), 0);
    const hampirHabis = filteredItems.filter((item) => normalizeNumber(item.stok) <= 5).length;

    return { totalProduk, totalStok, hampirHabis };
  }, [filteredItems]);

  function resetForm() {
    setForm(initialForm);
    setEditingCode("");
  }

  function onChangeForm(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    const payload = {
      ...form,
      harga: normalizeNumber(form.harga),
      stok: normalizeNumber(form.stok),
    };

    try {
      if (editingCode) {
        await updateMasterBarang(payload);
        setMessage("Data barang berhasil diperbarui.");
      } else {
        await addMasterBarang(payload);
        setMessage("Data barang berhasil ditambahkan.");
      }

      resetForm();
      await loadMasterBarang();
    } catch (err) {
      setError(err.message || "Gagal menyimpan data barang.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onEdit(item) {
    setEditingCode(item.kode_barang);
    setForm({
      kode_barang: item.kode_barang || "",
      nama_barang: item.nama_barang || "",
      kategori: item.kategori || "",
      harga: String(item.harga ?? ""),
      ukuran: item.ukuran || "",
      deskripsi: item.deskripsi || "",
      stok: String(item.stok ?? ""),
    });
  }

  async function onDelete(kodeBarang) {
    const confirmed = window.confirm("Hapus data barang ini?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteMasterBarang(kodeBarang);
      if (editingCode === kodeBarang) {
        resetForm();
      }

      setMessage("Data barang berhasil dihapus.");
      await loadMasterBarang();
    } catch (err) {
      setError(err.message || "Gagal menghapus data barang.");
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Master Barang</h3>
            <p className="mt-1 text-sm text-gray-600">Kelola data produk dengan mudah. Tambah, ubah, atau hapus informasi barang.</p>
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
      </div>

      <div className="p-6">
        <form onSubmit={onSubmit} className="mb-6 grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Formulir Input</h4>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InputField
                label="Kode Barang"
                name="kode_barang"
                value={form.kode_barang}
                onChange={onChangeForm}
                required
                disabled={Boolean(editingCode)}
              />
              <InputField
                label="Nama Barang"
                name="nama_barang"
                value={form.nama_barang}
                onChange={onChangeForm}
                required
              />
              <InputField
                label="Kategori"
                name="kategori"
                value={form.kategori}
                onChange={onChangeForm}
                required
              />
              <InputField label="Ukuran" name="ukuran" value={form.ukuran} onChange={onChangeForm} />
              <InputField
                label="Harga"
                name="harga"
                type="number"
                min="0"
                value={form.harga}
                onChange={onChangeForm}
                required
              />
              <InputField
                label="Stok"
                name="stok"
                type="number"
                min="0"
                value={form.stok}
                onChange={onChangeForm}
                required
              />
            </div>

            <div className="mt-4 grid gap-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider" htmlFor="deskripsi">
                Deskripsi
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows={3}
                value={form.deskripsi}
                onChange={onChangeForm}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ketik deskripsi barang di sini..."
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? "Menyimpan..." : editingCode ? "Update Barang" : "Tambah Barang"}
            </button>

            {editingCode && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Batal Edit
              </button>
            )}

            <button
              type="button"
              onClick={loadMasterBarang}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </form>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            {isLoading ? "Memuat data..." : `Menampilkan ${filteredItems.length} data barang`}
          </p>

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {message && <p className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Ukuran</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Aksi</TableHead>
              </tr>
            </thead>
            <tbody>
              {!isLoading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="border-t border-gray-200 py-12 text-center text-gray-500">
                    Belum ada data barang.
                  </td>
                </tr>
              )}

              {filteredItems.map((item, idx) => {
                const stok = normalizeNumber(item.stok);

                return (
                  <tr key={item.kode_barang} className={`border-t border-gray-200 text-gray-900 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <TableCell>{item.kode_barang}</TableCell>
                    <TableCell>{item.nama_barang}</TableCell>
                    <TableCell>{item.kategori}</TableCell>
                    <TableCell>{item.ukuran || "-"}</TableCell>
                    <TableCell>{normalizeNumber(item.harga).toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        stok <= 5 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {stok}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500">{item.deskripsi || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => onEdit(item)} className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition">
                          Edit
                        </button>
                        <button type="button" onClick={() => onDelete(item.kode_barang)} className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 transition">
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
    </section>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider" htmlFor={props.name}>
        {label}
      </label>
      <input id={props.name} {...props} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100" />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TableHead({ children }) {
  return <th className="font-semibold text-left px-4 py-3">{children}</th>;
}

function TableCell({ children }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}
