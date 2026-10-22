export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api${url}`, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(options.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      data.error ?? "Layanan belum dapat dihubungi. Coba lagi sebentar.",
      response.status,
    );
  return data as T;
}
export const post = <T>(url: string, data: unknown = {}) =>
  api<T>(url, { method: "POST", body: JSON.stringify(data) });
