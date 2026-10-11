// Small helper functions that talk to the backend.
// In development VITE_API_URL is empty, so requests go to /api (proxied by Vite).
const API = import.meta.env.VITE_API_URL || "";

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Can't reach the server. Is the backend running?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

export const createUrl = (originalUrl, customAlias) =>
  request("/api/urls", {
    method: "POST",
    body: JSON.stringify({ originalUrl, customAlias }),
  });

export const getUrls = () => request("/api/urls");

export const deleteUrl = (id) => request(`/api/urls/${id}`, { method: "DELETE" });
