import { NextResponse } from 'next/server';
import { HTTP_STATUS, type ErrorCode } from './schemas/common';

export function apiOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true as const, data }, init);
}

export function apiFail(
  code: ErrorCode,
  message: string,
  opts: { field?: string; status?: number } = {},
): NextResponse {
  return NextResponse.json(
    { ok: false as const, error: { code, message, field: opts.field } },
    { status: opts.status ?? HTTP_STATUS[code] },
  );
}
