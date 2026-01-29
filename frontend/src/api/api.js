// frontend/src/api/api.js

const API = import.meta.env.VITE_API_BASE_URL; // ex: https://pulse-7nyf.onrender.com

export async function apiFetch(path, options = {}) {
  if (!API) {
    throw new Error("VITE_API_BASE_URL is missing. Add it in frontend .env");
  }

  const url = `${API}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // keep if backend uses cookies
  });

  // Try to parse JSON safely
  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    // Normalize error
    const message =
      (data && data.message) ||
      (typeof data === "string" ? data : "Request failed");
    const err = new Error(message);
    err.response = { status: res.status, data };
    throw err;
  }

  return data;
}