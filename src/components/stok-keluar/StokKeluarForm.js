"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import Select from "react-select";
import { useMasterBarang } from "@/hooks/useMasterBarang";
import { addStokKeluar, updateStokKeluar } from "@/lib/stokKeluarApi";

async function getSwal() {
  const sweetAlertModule = await import("sweetalert2");
  return sweetAlertModule.default;
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function extractDateFromISO(isoString) {
  if (!isoString) return getTodayDate();
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
      return isoString;
    }
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return getTodayDate();
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return getTodayDate();
  }
}

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildInitialForm(data) {
  return {
    tanggal: extractDateFromISO(data?.tanggal),
    kode_barang: data?.kode_barang || "",
    jumlah: data?.jumlah !== undefined ? String(data.jumlah) : "",
    penerima: data?.penerima || "",
    keterangan: data?.keterangan || "",
  };
}

export default function StokKeluarForm({ mode = "add", initialData = null }) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(buildInitialForm(initialData));

  const { masterItems, isLoading: isLoadingMaster, error: masterError } = useMasterBarang();

  useEffect(() => {
    if (masterError && !error) {
      setError(masterError);
    }
  }, [masterError, error]);

  const selectedMaster = useMemo(() => {
    return masterItems.find((item) => item.kode_barang === form.kode_barang) || null;
  }, [masterItems, form.kode_barang]);

  const kodeBarangOptions = useMemo(() => {
    return masterItems.map((item) => ({
      value: item.kode_barang,
      label: `${item.kode_barang} - ${item.nama || "Tanpa Nama"}`,
    }));
  }, [masterItems]);

  const selectedKodeBarangOption = useMemo(() => {
    return kodeBarangOptions.find((option) => option.value === form.kode_barang) || null;
  }, [kodeBarangOptions, form.kode_barang]);

  function onChangeForm(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onChangeKodeBarang(selectedOption) {
    setForm((prev) => ({
      ...prev,
      kode_barang: selectedOption?.value || "",
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.tanggal || !form.kode_barang || !form.jumlah) {
      setError("Tanggal, kode barang, dan jumlah wajib diisi.");
      return;
    }

    const jumlah = normalizeNumber(form.jumlah);
    if (jumlah <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return;
    }

    const Swal = await getSwal();
    const confirmResult = await Swal.fire({
      title: isEditMode ? "Simpan perubahan transaksi?" : "Tambah stok keluar?",
      text: isEditMode
        ? "Perubahan akan menyesuaikan stok pada master barang."
        : "Stok barang pada master akan berkurang otomatis.",
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
        tanggal: form.tanggal,
        kode_barang: form.kode_barang,
        jumlah,
        penerima: form.penerima,
        keterangan: form.keterangan,
      };

      if (isEditMode) {
        await updateStokKeluar(initialData.id, payload);
        await Swal.fire({
          title: "Berhasil",
          text: "Transaksi stok keluar berhasil diperbarui.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        });
      } else {
        await addStokKeluar(payload);
        await Swal.fire({
          title: "Berhasil",
          text: "Transaksi stok keluar berhasil ditambahkan.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        });
      }

      router.push("/stok-keluar");
    } catch (err) {
      setError(err.message || `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} transaksi stok keluar.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
          title="Kembali"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Stok Keluar" : "Tambah Stok Keluar"}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {isEditMode
              ? "Perbarui transaksi dan sesuaikan stok secara otomatis."
              : "Tambahkan transaksi stok keluar baru."}
          </p>
        </div>
      </div>

      <div className="p-6">
        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Tanggal" required>
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={onChangeForm}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>

            <FormField label="Kode Barang" required>
              <Select
                inputId="kode_barang"
                options={kodeBarangOptions}
                value={selectedKodeBarangOption}
                onChange={onChangeKodeBarang}
                placeholder="Cari kode / nama barang..."
                isClearable
                noOptionsMessage={() => "Data barang tidak ditemukan"}
                disabled={isSubmitting || isLoadingMaster}
                className="text-sm"
                classNamePrefix="stok-keluar-select"
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
              />
            </FormField>

            <FormField label="Nama Barang">
              <input
                type="text"
                value={selectedMaster?.nama || ""}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-700"
                placeholder="Terisi otomatis"
              />
            </FormField>

            <FormField label="Jumlah" required>
              <input
                type="number"
                min="1"
                name="jumlah"
                value={form.jumlah}
                onChange={onChangeForm}
                disabled={isSubmitting}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>

            <FormField label="Penerima">
              <input
                type="text"
                name="penerima"
                value={form.penerima}
                onChange={onChangeForm}
                disabled={isSubmitting}
                placeholder="Nama penerima"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>

            <FormField label="Keterangan">
              <input
                type="text"
                name="keterangan"
                value={form.keterangan}
                onChange={onChangeForm}
                disabled={isSubmitting}
                placeholder="Opsional"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={20} />
              {isSubmitting ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Transaksi"}
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
      <label className="mb-2 block text-sm font-semibold text-gray-900">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}
