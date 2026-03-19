# Inventory Management Dashboard

Dashboard inventory modern dan responsif dengan design profesional.

**Stack:**

- Frontend: Next.js 16 + Tailwind CSS v4 + DaisyUI
- Backend: Google Apps Script (`.gs`)
- Database: Google Sheets

## Fitur UI/UX

- **Sidebar Navigation**: Dark navy sidebar dengan collapse mode (desktop) dan mobile drawer
- **Top Navbar**: Clean white header dengan search bar, notification icon, dan user profile
- **Responsive Layout**: Fully responsive untuk mobile, tablet, dan desktop
- **Theme**: Business theme (light-first) dengan dark mode option
- **Spacious Design**: Layout yang luas dan breathable untuk kenyamanan mata
- **Card-based Interface**: Component modern dengan hover effects

## Fitur Utama (MVP)

- **Master Barang**: CRUD lengkap, filter kategori, stock monitoring
- **Analytics Dashboard**: Ringkasan total produk, stok, dan item hampir habis
- **Real-time Updates**: Integrasi langsung dengan Apps Script API

## Struktur Penting

- Frontend main page: [src/app/page.js](src/app/page.js)
- Dashboard shell (layout & state): [src/components/layout/DashboardShell.js](src/components/layout/DashboardShell.js)
- Sidebar navigation: [src/components/layout/Sidebar.js](src/components/layout/Sidebar.js)
- Top navbar: [src/components/layout/Navbar.js](src/components/layout/Navbar.js)
- Master barang CRUD: [src/components/master-barang/MasterBarangPanel.js](src/components/master-barang/MasterBarangPanel.js)
- API client: [src/lib/masterBarangApi.js](src/lib/masterBarangApi.js)
- Theme config: [src/app/globals.css](src/app/globals.css)
- Backend template: [apps-script/master_barang.gs](apps-script/master_barang.gs)

## Setup Frontend

1. Install dependency:

```bash
npm install
```

2. Buat file `.env.local`:

```bash
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/idDevelopment/exec
```

3. Jalankan project:

```bash
npm run dev
```

## Setup Google Sheets

Buat sheet bernama: `master_barang`

Header baris pertama yang disarankan:

```text
kode_barang | nama_barang | kategori | harga | ukuran | deskripsi | stok
```

## API Action (Apps Script)

Semua endpoint menggunakan base URL:

```text
https://script.google.com/macros/s/idDevelopment/exec
```

- Get list master data:
  - `GET ?action=master-get`
- Get detail by id:
  - `GET ?action=master-get-by-id&kode_barang=BRG-001`
- Add data:
  - `POST ?action=master-add`
- Update data:
  - `POST ?action=master-update`
- Delete data:
  - `POST ?action=master-delete`

Payload `POST` menggunakan JSON.
