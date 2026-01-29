// frontend/src/api/api.js

const API = import.meta.env.VITE_API_BASE_URL; // example: https://pulse-7nyf.onrender.com

function buildUrl(path) {
  if (!API) {
    throw new Error("VITE_API_BASE_URL is missing. Set it in Vercel env vars.");
  }
  // Ensure exactly one "/" between base + path
  const base = API.endsWith("/") ? API.slice(0, -1) : API;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

// ✅ JSON helper (for normal APIs)
export async function apiFetch(path, options = {}) {
  const url = buildUrl(path);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) data = await res.json();
  else data = await res.text();

  if (!res.ok) {
    const message =
      (data && data.message) || (typeof data === "string" ? data : "Request failed");
    const err = new Error(message);
    err.response = { status: res.status, data };
    throw err;
  }

  return data;
}

// ✅ Upload helper (FormData) — DO NOT set Content-Type
export async function apiUpload(path, formData, options = {}) {
  const url = buildUrl(path);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) data = await res.json();
  else data = await res.text();

  if (!res.ok) {
    const message =
      (data && data.message) || (typeof data === "string" ? data : "Upload failed");
    const err = new Error(message);
    err.response = { status: res.status, data };
    throw err;
  }

  return data;
}