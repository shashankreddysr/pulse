const API = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(path, options = {}) {
  if (!API) {
    throw new Error("Missing VITE_API_BASE_URL");
  }

  const token = localStorage.getItem("token"); // 👈 get saved token

  const url = `${API}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "", // 👈 send token
    },
    credentials: "include",
  });

  let data;
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const err = new Error(data?.message || "Request failed");
    err.response = { status: res.status, data };
    throw err;
  }

  return data;
}