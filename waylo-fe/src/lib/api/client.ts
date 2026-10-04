import type {ApiError} from "@waylo/shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(error: ApiError, status: number) {
    super(error.message);
    this.name = "ApiRequestError";
    this.code = error.code;
    this.status = status;
  }
}

type Envelope<T> = {data: T; error: null} | {data: null; error: ApiError};

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      credentials: "include",
    });
    console.log(response);
  } catch(error) {
    console.error(error);
    throw new ApiRequestError(
      {code: "network_error", message: "Gagal terhubung ke server."},
      0,
    );
  }

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.error) {
    throw new ApiRequestError(
      payload?.error ?? {
        code: "unexpected_error",
        message: "Terjadi kesalahan yang tidak terduga.",
      },
      response.status,
    );
  }

  return payload.data;
}