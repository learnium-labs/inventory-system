"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from "lucide-react";
import { getMasterBarang } from "@/lib/masterBarangApi";
import { getStokMasuk } from "@/lib/stokMasukApi";
import { getStokKeluar } from "@/lib/stokKeluarApi";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLabel(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function buildTrendData(stokMasukData, stokKeluarData, days) {
  const today = new Date();
  const dates = Array.from({ length: days }).map((_, index) => {
    const current = new Date(today);
    current.setDate(today.getDate() - (days - 1 - index));
    current.setHours(0, 0, 0, 0);
    return current;
  });

  const labels = dates.map((date) => toLabel(date));
  const dateKeys = dates.map((date) => toDateKey(date));

  const masukMap = new Map();
  stokMasukData.forEach((item) => {
    const key = toDateKey(item.tanggal || item.created_at);
    if (!key) return;
    masukMap.set(key, (masukMap.get(key) || 0) + normalizeNumber(item.jumlah));
  });

  const keluarMap = new Map();
  stokKeluarData.forEach((item) => {
    const key = toDateKey(item.tanggal || item.created_at);
    if (!key) return;
    keluarMap.set(key, (keluarMap.get(key) || 0) + normalizeNumber(item.jumlah));
  });

  return {
    labels,
    masuk: dateKeys.map((key) => masukMap.get(key) || 0),
    keluar: dateKeys.map((key) => keluarMap.get(key) || 0),
  };
}

export default function AnalyticsCards() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalBarang: 0,
    totalStok: 0,
    transaksiMasuk: 0,
    hampirHabis: 0,
  });
  const [stokMasukRows, setStokMasukRows] = useState([]);
  const [stokKeluarRows, setStokKeluarRows] = useState([]);
  const [chartRangeDays, setChartRangeDays] = useState(7);
  const [chartType, setChartType] = useState("line");
  const hasFetchedInitialData = useRef(false);

  useEffect(() => {
    if (hasFetchedInitialData.current) return;
    hasFetchedInitialData.current = true;

    async function loadDashboardData() {
      setIsLoading(true);
      setError("");

      try {
        const [masterData, stokMasukData, stokKeluarData] = await Promise.all([
          getMasterBarang(),
          getStokMasuk(),
          getStokKeluar(),
        ]);

        const totalBarang = masterData.length;
        const totalStok = masterData.reduce((sum, item) => sum + normalizeNumber(item.stok), 0);
        const transaksiMasuk = stokMasukData.length;
        const hampirHabis = masterData.filter((item) => normalizeNumber(item.stok) <= normalizeNumber(item.stok_min)).length;

        setStats({ totalBarang, totalStok, transaksiMasuk, hampirHabis });
        setStokMasukRows(stokMasukData);
        setStokKeluarRows(stokKeluarData);
      } catch (err) {
        setError(err.message || "Gagal memuat data dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const chartData = useMemo(() => {
    return buildTrendData(stokMasukRows, stokKeluarRows, chartRangeDays);
  }, [stokMasukRows, stokKeluarRows, chartRangeDays]);

  const summaryItems = useMemo(() => {
    return [
      {
        title: "Total Barang",
        value: stats.totalBarang,
        description: "Jumlah item aktif",
        icon: <Archive size={18} className="text-blue-600" />,
      },
      {
        title: "Total Stok",
        value: stats.totalStok,
        description: "Akumulasi stok saat ini",
        icon: <ArrowDownCircle size={18} className="text-indigo-600" />,
      },
      {
        title: "Transaksi Masuk",
        value: stats.transaksiMasuk,
        description: "Total histori stok masuk",
        icon: <ArrowUpCircle size={18} className="text-emerald-600" />,
      },
      {
        title: "Hampir Habis",
        value: stats.hampirHabis,
        description: "Stok ≤ stok minimum",
        icon: <AlertTriangle size={18} className="text-orange-600" />,
      },
    ];
  }, [stats]);

  const chartSeries = useMemo(() => {
    return [
      { name: "Stok Masuk", data: chartData.masuk },
      { name: "Stok Keluar", data: chartData.keluar },
    ];
  }, [chartData]);

  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: chartType,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      stroke: {
        width: chartType === "line" ? 3 : 0,
        curve: "smooth",
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "45%",
        },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 4,
      },
      xaxis: {
        categories: chartData.labels,
      },
      yaxis: {
        min: 0,
      },
      colors: ["#22c55e", "#ef4444"],
      legend: {
        position: "top",
        horizontalAlign: "right",
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: "light",
        style: {
          fontSize: "13px",
          fontFamily: "inherit",
        },
        y: {
          formatter: (value) => normalizeNumber(value).toLocaleString("id-ID"),
        },
      },
    };
  }, [chartData.labels, chartType]);

  return (
    <section className="space-y-5">
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <article key={item.title} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{item.title}</p>
                <p className="mt-1 text-2xl font-bold leading-tight text-gray-900">
                  {isLoading ? "..." : Number(item.value).toLocaleString("id-ID")}
                </p>
                <p className="mt-1 text-xs text-gray-600">{item.description}</p>
              </div>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">{item.icon}</div>
            </div>
          </article>
        ))}
      </div>

      <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Pergerakan Stok {chartRangeDays} Hari Terakhir</h4>
            <p className="text-xs text-gray-500">Perbandingan total stok masuk dan stok keluar harian.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setChartRangeDays(7)}
                className={`px-3 py-1.5 text-xs font-semibold transition ${chartRangeDays === 7 ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => setChartRangeDays(30)}
                className={`px-3 py-1.5 text-xs font-semibold transition ${chartRangeDays === 30 ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
              >
                30 Hari
              </button>
            </div>

            <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setChartType("line")}
                className={`px-3 py-1.5 text-xs font-semibold transition ${chartType === "line" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
              >
                Line
              </button>
              <button
                type="button"
                onClick={() => setChartType("bar")}
                className={`px-3 py-1.5 text-xs font-semibold transition ${chartType === "bar" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
              >
                Bar
              </button>
            </div>
          </div>
        </div>

        <div className="h-75">
          {!isLoading && chartData.labels.length > 0 ? (
            <ReactApexChart options={chartOptions} series={chartSeries} type={chartType} height="100%" />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
              Memuat grafik...
            </div>
          )}
        </div>
      </article>

      <style jsx global>{`
        .apexcharts-tooltip,
        .apexcharts-tooltip * {
          color: #111827 !important;
        }

        .apexcharts-tooltip-series-group {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
}
