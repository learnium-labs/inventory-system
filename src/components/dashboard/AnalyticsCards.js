const summaryItems = [
  {
    title: "Total Produk",
    value: "Live",
    description: "Data berasal dari menu Master Barang",
  },
  {
    title: "Monitoring Stok",
    value: "Aktif",
    description: "Pantau stok minimum melalui panel ringkasan",
  },
  {
    title: "Integrasi API",
    value: "Apps Script",
    description: "Endpoint bersih dengan action master-*",
  },
  {
    title: "Mode Pengembangan",
    value: "MVP",
    description: "Fokus tahap awal: pengelolaan Master Barang",
  },
];

export default function AnalyticsCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryItems.map((item) => (
        <article key={item.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{item.value}</p>
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">○</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
