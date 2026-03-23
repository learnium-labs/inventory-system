"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addMasterBarang, updateMasterBarang } from "@/lib/masterBarangApi";
import { ChevronLeft, Check } from "lucide-react";
import Select from "react-select";

async function getSwal() {
  const sweetAlertModule = await import("sweetalert2");
  return sweetAlertModule.default;
}

const CATEGORIES = [
  "Elektronik",
  "Furniture",
  "Pakaian",
  "Makanan",
  "Minuman",
  "Kebutuhan Bayi",
  "Kesehatan & Obat",
  "Perawatan Tubuh",
  "Kebersihan Rumah",
  "Rumah Tangga",
  "Alat Tulis",
  "Aksesoris",
  "Lainnya",
];
const SATUAN = ["unit", "pcs", "box", "kg", "liter", "meter"];
const FORMATTED_NUMBER_FIELDS = ["harga_beli", "harga_jual", "stok_min"];

function formatThousands(value) {
  const digitsOnly = String(value ?? "").replace(/\D/g, "");
  if (!digitsOnly) return "";

  return Number(digitsOnly).toLocaleString("id-ID");
}

function parseFormattedNumber(value) {
  const digitsOnly = String(value ?? "").replace(/\D/g, "");
  return Number(digitsOnly || 0);
}

function buildInitialForm(data) {
  const base = {
    kode_barang: "",
    nama: "",
    kategori: "",
    satuan: "",
    harga_beli: "",
    harga_jual: "",
    stok_min: "",
  };

  const merged = { ...base, ...(data || {}) };

  FORMATTED_NUMBER_FIELDS.forEach((field) => {
    merged[field] = formatThousands(merged[field]);
  });

  return merged;
}

export default function MasterBarangForm({ mode = "add", initialData = null }) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  const [form, setForm] = useState(buildInitialForm(initialData));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const kategoriOptions = useMemo(() => {
    return CATEGORIES.map((kategori) => ({ value: kategori, label: kategori }));
  }, []);

  const selectedKategoriOption = useMemo(() => {
    return kategoriOptions.find((option) => option.value === form.kategori) || null;
  }, [kategoriOptions, form.kategori]);

  function onChangeForm(e) {
    const { name, value } = e.target;

    if (FORMATTED_NUMBER_FIELDS.includes(name)) {
      setForm((prev) => ({ ...prev, [name]: formatThousands(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onChangeKategori(selectedOption) {
    setForm((prev) => ({
      ...prev,
      kategori: selectedOption?.value || "",
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.nama.trim()) {
      setError("Nama barang harus diisi.");
      return;
    }
    if (!form.kategori) {
      setError("Kategori harus dipilih.");
      return;
    }
    if (!form.satuan) {
      setError("Satuan harus dipilih.");
      return;
    }

    const Swal = await getSwal();

    const confirmResult = await Swal.fire({
      title: isEditMode ? "Simpan perubahan?" : "Tambah data barang?",
      text: isEditMode
        ? "Perubahan data akan disimpan."
        : "Data barang baru akan ditambahkan.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isEditMode ? "Ya, simpan" : "Ya, tambah",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nama: form.nama.trim(),
        kategori: form.kategori,
        satuan: form.satuan,
        harga_beli: parseFormattedNumber(form.harga_beli),
        harga_jual: parseFormattedNumber(form.harga_jual),
        stok_min: parseFormattedNumber(form.stok_min),
      };

      if (isEditMode) {
        await updateMasterBarang(initialData.kode_barang, payload);
        await Swal.fire({
          title: "Berhasil",
          text: "Data barang berhasil diperbarui.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        });
        router.push("/master-barang");
      } else {
        await addMasterBarang(payload);
        await Swal.fire({
          title: "Berhasil",
          text: "Data barang berhasil ditambahkan.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        });
        router.push("/master-barang");
      }
    } catch (err) {
      setError(err.message || `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} data barang.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition"
          title="Kembali"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Barang" : "Tambah Barang Baru"}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {isEditMode ? "Perbarui informasi produk." : "Tambahkan produk baru ke inventory."}
          </p>
          <p className="mt-1 text-xs font-medium text-blue-700">
            Stok dikelola melalui menu Stok Masuk/Stok Keluar.
          </p>
        </div>
      </div>

      <div className="p-6">
        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Nama Barang" required>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={onChangeForm}
                placeholder="Contoh: Laptop ASUS ..."
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>

            <FormField label="Kategori" required>
              <Select
                inputId="kategori"
                options={kategoriOptions}
                value={selectedKategoriOption}
                onChange={onChangeKategori}
                placeholder="Cari / pilih kategori..."
                isClearable
                noOptionsMessage={() => "Kategori tidak ditemukan"}
                disabled={isSubmitting}
                className="text-sm"
                classNamePrefix="master-kategori-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: 42,
                    borderRadius: 8,
                    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                    backgroundColor: state.isDisabled ? "#f9fafb" : "#ffffff",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#eff6ff" : "#ffffff",
                    color: "#111827",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 60,
                  }),
                }}
              >
              </Select>
            </FormField>

            <FormField label="Satuan" required>
              <select
                name="satuan"
                value={form.satuan}
                onChange={onChangeForm}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">-- Pilih Satuan --</option>
                {SATUAN.map((sat) => (
                  <option key={sat} value={sat}>
                    {sat}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Harga Beli (Rp)">
              <input
                type="text"
                inputMode="numeric"
                name="harga_beli"
                value={form.harga_beli}
                onChange={onChangeForm}
                placeholder="0"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>

            <FormField label="Harga Jual (Rp)">
              <input
                type="text"
                inputMode="numeric"
                name="harga_jual"
                value={form.harga_jual}
                onChange={onChangeForm}
                placeholder="0"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>

            <FormField label="Stok Minimum">
              <input
                type="text"
                inputMode="numeric"
                name="stok_min"
                value={form.stok_min}
                onChange={onChangeForm}
                placeholder="0"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={20} />
              {isSubmitting ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambahkan Barang"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
