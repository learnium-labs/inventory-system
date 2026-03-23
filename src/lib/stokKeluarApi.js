const API_BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

const ACTIONS = {
  get: "stok-keluar-get",
  add: "stok-keluar-add",
  update: "stok-keluar-update",
  remove: "stok-keluar-delete",
};

function buildUrl(action, params = {}) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_APPS_SCRIPT_URL belum diatur.");
  }

  const url = new URL(API_BASE_URL);
  url.searchParams.set("action", action);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseResponse(response) {
  const payload = await response.json();

  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.message || "Terjadi kesalahan pada API.");
  }

  return payload;
}

export async function getStokKeluar() {
  const response = await fetch(buildUrl(ACTIONS.get), {
    method: "GET",
    cache: "no-store",
  });

  const payload = await parseResponse(response);
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function addStokKeluar(data) {
  const response = await fetch(buildUrl(ACTIONS.add), {
    method: "POST",
    body: JSON.stringify(data),
  });

  return parseResponse(response);
}

export async function deleteStokKeluar(id) {
  const response = await fetch(buildUrl(ACTIONS.remove), {
    method: "POST",
    body: JSON.stringify({ id }),
  });

  return parseResponse(response);
}

export async function updateStokKeluar(id, data) {
  const response = await fetch(buildUrl(ACTIONS.update), {
    method: "POST",
    body: JSON.stringify({ ...data, id }),
  });

  return parseResponse(response);
}
