const SHEET_NAME = "master_barang";
const STOK_MASUK_SHEET_NAME = "stok_masuk";
const STOK_KELUAR_SHEET_NAME = "stok_keluar";
const VALID_CATEGORIES = [
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
const VALID_SATUAN = ["unit", "pcs", "box", "kg", "liter", "meter"];

const ACTIONS = {
  get: "master-get",
  getById: "master-get-by-id",
  add: "master-add",
  update: "master-update",
  remove: "master-delete",
  stokMasukGet: "stok-masuk-get",
  stokMasukAdd: "stok-masuk-add",
  stokMasukUpdate: "stok-masuk-update",
  stokMasukRemove: "stok-masuk-delete",
  stokKeluarGet: "stok-keluar-get",
  stokKeluarAdd: "stok-keluar-add",
  stokKeluarUpdate: "stok-keluar-update",
  stokKeluarRemove: "stok-keluar-delete",
};

function getCurrentTimestamp() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss",
  );
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "";

  try {
    if (action === ACTIONS.get) {
      return okResponse(getAllMasterBarang());
    }

    if (action === ACTIONS.getById) {
      return okResponse(getMasterBarangById(e.parameter.kode_barang));
    }

    if (action === ACTIONS.stokMasukGet) {
      return okResponse(getAllStokMasuk());
    }

    if (action === ACTIONS.stokKeluarGet) {
      return okResponse(getAllStokKeluar());
    }

    return errorResponse("Invalid GET action");
  } catch (error) {
    return errorResponse(error.message);
  }
}

function doPost(e) {
  const action = (e && e.parameter && e.parameter.action) || "";

  try {
    const payload = parsePayload(e);

    if (action === ACTIONS.add) {
      addMasterBarang(payload);
      return okResponse(null, "Data berhasil ditambahkan");
    }

    if (action === ACTIONS.update) {
      updateMasterBarang(payload);
      return okResponse(null, "Data berhasil diperbarui");
    }

    if (action === ACTIONS.remove) {
      deleteMasterBarang(payload.kode_barang);
      return okResponse(null, "Data berhasil dihapus");
    }

    if (action === ACTIONS.stokMasukAdd) {
      addStokMasuk(payload);
      return okResponse(null, "Transaksi stok masuk berhasil ditambahkan");
    }

    if (action === ACTIONS.stokMasukUpdate) {
      updateStokMasuk(payload);
      return okResponse(null, "Transaksi stok masuk berhasil diperbarui");
    }

    if (action === ACTIONS.stokMasukRemove) {
      deleteStokMasuk(payload.id);
      return okResponse(null, "Transaksi stok masuk berhasil dihapus");
    }

    if (action === ACTIONS.stokKeluarAdd) {
      addStokKeluar(payload);
      return okResponse(null, "Transaksi stok keluar berhasil ditambahkan");
    }

    if (action === ACTIONS.stokKeluarUpdate) {
      updateStokKeluar(payload);
      return okResponse(null, "Transaksi stok keluar berhasil diperbarui");
    }

    if (action === ACTIONS.stokKeluarRemove) {
      deleteStokKeluar(payload.id);
      return okResponse(null, "Transaksi stok keluar berhasil dihapus");
    }

    return errorResponse("Invalid POST action");
  } catch (error) {
    return errorResponse(error.message);
  }
}

function getSheet() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error("Sheet master_barang tidak ditemukan");
  }
  return sheet;
}

function getStokMasukSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    STOK_MASUK_SHEET_NAME,
  );
  if (!sheet) {
    throw new Error("Sheet stok_masuk tidak ditemukan");
  }
  return sheet;
}

function getStokKeluarSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    STOK_KELUAR_SHEET_NAME,
  );
  if (!sheet) {
    throw new Error("Sheet stok_keluar tidak ditemukan");
  }
  return sheet;
}

function getAllMasterBarang() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  const headers = data.shift();
  return data.map(function (row) {
    return mapRowToObject(headers, row);
  });
}

function getMasterBarangById(kodeBarang) {
  if (!kodeBarang) {
    throw new Error("kode_barang wajib diisi");
  }

  const allData = getAllMasterBarang();
  const record = allData.find(function (item) {
    return String(item.kode_barang) === String(kodeBarang);
  });

  if (!record) {
    throw new Error("Data tidak ditemukan");
  }

  return record;
}

function getAllStokMasuk() {
  const sheet = getStokMasukSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  const headers = data.shift();
  return data.map(function (row) {
    return mapRowToObject(headers, row);
  });
}

function getAllStokKeluar() {
  const sheet = getStokKeluarSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  const headers = data.shift();
  return data.map(function (row) {
    return mapRowToObject(headers, row);
  });
}

function generateKodeBarang() {
  const sheet = getSheet();
  const allData = getAllMasterBarang();
  const maxNum = Math.max(
    0,
    ...allData.map(function (item) {
      const code = String(item.kode_barang || "");
      const match = code.match(/BRG(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }),
  );
  return "BRG" + String(maxNum + 1).padStart(5, "0");
}

function generateStokMasukId() {
  return "SM-" + Utilities.getUuid();
}

function generateStokKeluarId() {
  return "SK-" + Utilities.getUuid();
}

function addMasterBarang(data) {
  const sheet = getSheet();
  validatePayload(data, true);

  const headers = getHeaders(sheet);
  const newData = Object.assign({}, data);

  // Generate auto kode_barang jika belum ada
  if (!newData.kode_barang) {
    newData.kode_barang = generateKodeBarang();
  }

  if (!newData.created_at) {
    newData.created_at = getCurrentTimestamp();
  }

  const row = headers.map(function (header) {
    return newData[header] !== undefined ? newData[header] : "";
  });

  sheet.appendRow(row);
}

function updateMasterBarang(data) {
  const sheet = getSheet();
  validatePayload(data, false);

  if (!data.kode_barang) {
    throw new Error("kode_barang wajib diisi untuk update");
  }

  const headers = getHeaders(sheet);
  const values = sheet.getDataRange().getValues();
  const headerRow = values[0];
  const kodeIndex = headerRow.indexOf("kode_barang");

  if (kodeIndex === -1) {
    throw new Error("Kolom kode_barang tidak ditemukan");
  }

  var targetRowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][kodeIndex]) === String(data.kode_barang)) {
      targetRowIndex = i + 1;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error("Data tidak ditemukan untuk update");
  }

  const existingRow = values[targetRowIndex - 1];
  const updateData = mapRowToObject(headerRow, existingRow);
  Object.keys(data).forEach(function (key) {
    if (key !== "kode_barang" && key !== "created_at") {
      updateData[key] = data[key];
    }
  });

  const nextRow = headers.map(function (header) {
    return updateData[header] !== undefined ? updateData[header] : "";
  });

  sheet.getRange(targetRowIndex, 1, 1, nextRow.length).setValues([nextRow]);
}

function deleteMasterBarang(kodeBarang) {
  if (!kodeBarang) {
    throw new Error("kode_barang wajib diisi");
  }

  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const headerRow = values[0];
  const kodeIndex = headerRow.indexOf("kode_barang");

  if (kodeIndex === -1) {
    throw new Error("Kolom kode_barang tidak ditemukan");
  }

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][kodeIndex]) === String(kodeBarang)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }

  throw new Error("Data tidak ditemukan untuk dihapus");
}

function addStokMasuk(data) {
  validateStokMasukPayload(data);

  const stokMasukSheet = getStokMasukSheet();
  const stokMasukHeaders = getHeaders(stokMasukSheet);

  const jumlah = Number(data.jumlah);
  if (jumlah <= 0) {
    throw new Error("jumlah harus lebih dari 0");
  }

  const barang = getMasterBarangById(data.kode_barang);
  incrementMasterStockByKode(data.kode_barang, jumlah);

  const payload = Object.assign({}, data, {
    id: data.id || generateStokMasukId(),
    tanggal:
      data.tanggal ||
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "yyyy-MM-dd",
      ),
    nama_barang: barang.nama || "",
    jumlah: jumlah,
    created_at: data.created_at || getCurrentTimestamp(),
  });

  const row = stokMasukHeaders.map(function (header) {
    return payload[header] !== undefined ? payload[header] : "";
  });

  stokMasukSheet.appendRow(row);
}

function updateStokMasuk(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Payload update stok masuk tidak valid");
  }

  if (!data.id) {
    throw new Error("id transaksi wajib diisi untuk update");
  }

  validateStokMasukPayload(data);

  const stokMasukSheet = getStokMasukSheet();
  const values = stokMasukSheet.getDataRange().getValues();

  if (values.length <= 1) {
    throw new Error("Data stok masuk kosong");
  }

  const headers = values[0];
  const idIndex = headers.indexOf("id");

  if (idIndex === -1) {
    throw new Error("Kolom id pada stok_masuk tidak ditemukan");
  }

  let targetRowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(data.id)) {
      targetRowIndex = i + 1;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error("Data transaksi stok masuk tidak ditemukan untuk update");
  }

  const existingRow = values[targetRowIndex - 1];
  const existingData = mapRowToObject(headers, existingRow);
  const oldKodeBarang = existingData.kode_barang;
  const oldJumlah = Number(existingData.jumlah) || 0;

  const newJumlah = Number(data.jumlah);
  if (newJumlah <= 0) {
    throw new Error("jumlah harus lebih dari 0");
  }

  const barang = getMasterBarangById(data.kode_barang);

  incrementMasterStockByKode(oldKodeBarang, -oldJumlah);
  incrementMasterStockByKode(data.kode_barang, newJumlah);

  const updatedData = Object.assign({}, existingData, {
    tanggal: data.tanggal || existingData.tanggal,
    kode_barang: data.kode_barang,
    nama_barang: barang.nama || "",
    jumlah: newJumlah,
    supplier: data.supplier || "",
    keterangan: data.keterangan || "",
  });

  const nextRow = headers.map(function (header) {
    return updatedData[header] !== undefined ? updatedData[header] : "";
  });

  stokMasukSheet
    .getRange(targetRowIndex, 1, 1, nextRow.length)
    .setValues([nextRow]);
}

function deleteStokMasuk(id) {
  if (!id) {
    throw new Error("id transaksi wajib diisi");
  }

  const stokMasukSheet = getStokMasukSheet();
  const values = stokMasukSheet.getDataRange().getValues();

  if (values.length <= 1) {
    throw new Error("Data stok masuk kosong");
  }

  const headers = values[0];
  const idIndex = headers.indexOf("id");
  const kodeIndex = headers.indexOf("kode_barang");
  const jumlahIndex = headers.indexOf("jumlah");

  if (idIndex === -1) {
    throw new Error("Kolom id pada stok_masuk tidak ditemukan");
  }

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      const kodeBarang = values[i][kodeIndex];
      const jumlah = Number(values[i][jumlahIndex]) || 0;
      incrementMasterStockByKode(kodeBarang, -jumlah);
      stokMasukSheet.deleteRow(i + 1);
      return;
    }
  }

  throw new Error("Data transaksi stok masuk tidak ditemukan");
}

function addStokKeluar(data) {
  validateStokKeluarPayload(data);

  const stokKeluarSheet = getStokKeluarSheet();
  const stokKeluarHeaders = getHeaders(stokKeluarSheet);

  const jumlah = Number(data.jumlah);
  if (jumlah <= 0) {
    throw new Error("jumlah harus lebih dari 0");
  }

  const barang = getMasterBarangById(data.kode_barang);
  incrementMasterStockByKode(data.kode_barang, -jumlah);

  const payload = Object.assign({}, data, {
    id: data.id || generateStokKeluarId(),
    tanggal:
      data.tanggal ||
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "yyyy-MM-dd",
      ),
    nama_barang: barang.nama || "",
    jumlah: jumlah,
    created_at: data.created_at || getCurrentTimestamp(),
  });

  const row = stokKeluarHeaders.map(function (header) {
    return payload[header] !== undefined ? payload[header] : "";
  });

  stokKeluarSheet.appendRow(row);
}

function updateStokKeluar(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Payload update stok keluar tidak valid");
  }

  if (!data.id) {
    throw new Error("id transaksi wajib diisi untuk update");
  }

  validateStokKeluarPayload(data);

  const stokKeluarSheet = getStokKeluarSheet();
  const values = stokKeluarSheet.getDataRange().getValues();

  if (values.length <= 1) {
    throw new Error("Data stok keluar kosong");
  }

  const headers = values[0];
  const idIndex = headers.indexOf("id");

  if (idIndex === -1) {
    throw new Error("Kolom id pada stok_keluar tidak ditemukan");
  }

  let targetRowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(data.id)) {
      targetRowIndex = i + 1;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error("Data transaksi stok keluar tidak ditemukan untuk update");
  }

  const existingRow = values[targetRowIndex - 1];
  const existingData = mapRowToObject(headers, existingRow);
  const oldKodeBarang = existingData.kode_barang;
  const oldJumlah = Number(existingData.jumlah) || 0;

  const newJumlah = Number(data.jumlah);
  if (newJumlah <= 0) {
    throw new Error("jumlah harus lebih dari 0");
  }

  const barang = getMasterBarangById(data.kode_barang);

  incrementMasterStockByKode(oldKodeBarang, oldJumlah);
  incrementMasterStockByKode(data.kode_barang, -newJumlah);

  const updatedData = Object.assign({}, existingData, {
    tanggal: data.tanggal || existingData.tanggal,
    kode_barang: data.kode_barang,
    nama_barang: barang.nama || "",
    jumlah: newJumlah,
    penerima: data.penerima || "",
    keterangan: data.keterangan || "",
  });

  const nextRow = headers.map(function (header) {
    return updatedData[header] !== undefined ? updatedData[header] : "";
  });

  stokKeluarSheet
    .getRange(targetRowIndex, 1, 1, nextRow.length)
    .setValues([nextRow]);
}

function deleteStokKeluar(id) {
  if (!id) {
    throw new Error("id transaksi wajib diisi");
  }

  const stokKeluarSheet = getStokKeluarSheet();
  const values = stokKeluarSheet.getDataRange().getValues();

  if (values.length <= 1) {
    throw new Error("Data stok keluar kosong");
  }

  const headers = values[0];
  const idIndex = headers.indexOf("id");
  const kodeIndex = headers.indexOf("kode_barang");
  const jumlahIndex = headers.indexOf("jumlah");

  if (idIndex === -1) {
    throw new Error("Kolom id pada stok_keluar tidak ditemukan");
  }

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      const kodeBarang = values[i][kodeIndex];
      const jumlah = Number(values[i][jumlahIndex]) || 0;
      incrementMasterStockByKode(kodeBarang, jumlah);
      stokKeluarSheet.deleteRow(i + 1);
      return;
    }
  }

  throw new Error("Data transaksi stok keluar tidak ditemukan");
}

function incrementMasterStockByKode(kodeBarang, deltaJumlah) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    throw new Error("Data master barang kosong");
  }

  const headers = values[0];
  const kodeIndex = headers.indexOf("kode_barang");
  const stokIndex = headers.indexOf("stok");

  if (kodeIndex === -1 || stokIndex === -1) {
    throw new Error(
      "Kolom kode_barang atau stok pada master_barang tidak ditemukan",
    );
  }

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][kodeIndex]) === String(kodeBarang)) {
      const currentStock = Number(values[i][stokIndex]) || 0;
      const nextStock = currentStock + Number(deltaJumlah);

      if (nextStock < 0) {
        throw new Error("Stok tidak mencukupi untuk rollback transaksi");
      }

      sheet.getRange(i + 1, stokIndex + 1).setValue(nextStock);
      return;
    }
  }

  throw new Error("Barang tidak ditemukan pada master_barang");
}

function getHeaders(sheet) {
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(function (header) {
      return String(header).trim();
    });
}

function validatePayload(data, isNew) {
  if (!data || typeof data !== "object") {
    throw new Error("Payload tidak valid");
  }

  // Required fields
  const requiredFields = ["nama", "kategori", "satuan", "stok", "stok_min"];

  requiredFields.forEach(function (field) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      String(data[field]).trim() === ""
    ) {
      throw new Error("Field wajib: " + field);
    }
  });

  // Validate kategori
  if (!VALID_CATEGORIES.includes(data.kategori)) {
    throw new Error(
      "Kategori tidak valid. Pilih dari: " + VALID_CATEGORIES.join(", "),
    );
  }

  // Validate satuan
  if (!VALID_SATUAN.includes(data.satuan)) {
    throw new Error(
      "Satuan tidak valid. Pilih dari: " + VALID_SATUAN.join(", "),
    );
  }

  // Validate numeric fields
  const numericFields = ["harga_beli", "harga_jual", "stok", "stok_min"];
  numericFields.forEach(function (field) {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      data[field] !== ""
    ) {
      if (isNaN(Number(data[field]))) {
        throw new Error(field + " harus berupa angka");
      }
    }
  });
}

function validateStokMasukPayload(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Payload stok masuk tidak valid");
  }

  const requiredFields = ["kode_barang", "jumlah"];
  requiredFields.forEach(function (field) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      String(data[field]).trim() === ""
    ) {
      throw new Error("Field wajib stok masuk: " + field);
    }
  });

  if (isNaN(Number(data.jumlah)) || Number(data.jumlah) <= 0) {
    throw new Error("jumlah harus berupa angka dan lebih dari 0");
  }
}

function validateStokKeluarPayload(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Payload stok keluar tidak valid");
  }

  const requiredFields = ["kode_barang", "jumlah"];
  requiredFields.forEach(function (field) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      String(data[field]).trim() === ""
    ) {
      throw new Error("Field wajib stok keluar: " + field);
    }
  });

  if (isNaN(Number(data.jumlah)) || Number(data.jumlah) <= 0) {
    throw new Error("jumlah harus berupa angka dan lebih dari 0");
  }
}

function mapRowToObject(headers, row) {
  const obj = {};
  headers.forEach(function (header, index) {
    obj[header] = row[index];
  });
  return obj;
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Payload kosong");
  }

  return JSON.parse(e.postData.contents);
}

function okResponse(data, message) {
  return jsonResponse({
    ok: true,
    message: message || "Sukses",
    data: data,
  });
}

function errorResponse(message) {
  return jsonResponse({
    ok: false,
    message: message || "Terjadi kesalahan",
    data: null,
  });
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
