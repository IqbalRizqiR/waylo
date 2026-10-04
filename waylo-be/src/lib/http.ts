import type {ApiError} from "@waylo/shared";

export function ok<T>(data: T) {
  return {data, error: null as null};
}

export function fail(code: string, message: string): {data: null; error: ApiError} {
  return {data: null, error: {code, message}};
}

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }

  static badRequest(message: string, code = "bad_request") {
    return new HttpError(400, code, message);
  }

  static unauthorized(message = "Tidak terautentikasi.", code = "unauthorized") {
    return new HttpError(401, code, message);
  }

  static forbidden(message = "Akses ditolak.", code = "forbidden") {
    return new HttpError(403, code, message);
  }

  static notFound(message = "Data tidak ditemukan.", code = "not_found") {
    return new HttpError(404, code, message);
  }

  static conflict(message: string, code = "conflict") {
    return new HttpError(409, code, message);
  }
}