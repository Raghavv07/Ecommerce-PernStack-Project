const raw = import.meta.env.VITE_API_URL;
const base = typeof raw === "string" ? raw.replace(/\/+$/, "") : ""; // remove trailing slashes

// this is an authenticated fetch req that we use to send reqs to our api
export async function apiFetch(path, opts = {}) {
  const { getToken, method = "GET", body } = opts;
  const headers = { "Content-Type": "application/json" };

  let token = null;
  if (getToken) {
    token = await getToken();
  } else if (typeof window !== "undefined") {
    token = localStorage.getItem("ecommerce_jwt_token");
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = typeof data?.error === "string" ? data.error : res.statusText || `Request failed with status ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }

  return data;
}
