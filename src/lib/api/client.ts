export type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; message: string };

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** Fetch JSON contra las APIs del sistema con manejo uniforme de errores. */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  let body: ApiEnvelope<T> | null = null;
  try {
    body = await res.json();
  } catch {
    // respuesta sin cuerpo
  }
  if (!res.ok || !body || body.ok === false) {
    const message =
      body && body.ok === false ? body.message : `Error ${res.status} en ${url}`;
    throw new Error(message);
  }
  return body.data;
}

export const apiGet = <T>(url: string) => apiFetch<T>(url);

export const apiPost = <T>(url: string, body?: unknown) =>
  apiFetch<T>(url, { method: "POST", body: body != null ? JSON.stringify(body) : undefined });

export const apiPut = <T>(url: string, body?: unknown) =>
  apiFetch<T>(url, { method: "PUT", body: body != null ? JSON.stringify(body) : undefined });

export const apiPatch = <T>(url: string, body?: unknown) =>
  apiFetch<T>(url, { method: "PATCH", body: body != null ? JSON.stringify(body) : undefined });

export const apiDelete = <T>(url: string, body?: unknown) =>
  apiFetch<T>(url, { method: "DELETE", body: body != null ? JSON.stringify(body) : undefined });
