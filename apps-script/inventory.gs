const SHEET_NAME = "master_barang";
const VALID_CATEGORIES = [
  "Elektronik",
  "Furniture",
  "Pakaian",
  "Makanan",
  "Lainnya",
];
const VALID_SATUAN = ["unit", "pcs", "box", "kg", "liter", "meter"];

const ACTIONS = {
  get: "master-get",
  getById: "master-get-by-id",
  add: "master-add",
  update: "master-update",
  remove: "master-delete",
};

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "";

  try {
    if (action === ACTIONS.get) {
      return okResponse(getAllMasterBarang());
    }

    if (action === ACTIONS.getById) {
      return okResponse(getMasterBarangById(e.parameter.kode_barang));
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

function addMasterBarang(data) {
  const sheet = getSheet();
  validatePayload(data, true);

  const headers = getHeaders(sheet);
  const newData = Object.assign({}, data);

  // Generate auto kode_barang jika belum ada
  if (!newData.kode_barang) {
    newData.kode_barang = generateKodeBarang();
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
    if (key !== "kode_barang") {
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
