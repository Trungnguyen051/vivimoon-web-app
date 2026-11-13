'use client';
import type { ApiResult } from './client';

const INTERNAL = { code: 'internal', message: 'Something went wrong. Please try again.' };

/**
 * Posts one file as multipart `file` to our own route handler, reporting upload progress (0–1).
 * XMLHttpRequest rather than `apiRequest`'s fetch, because fetch can't report upload progress.
 * Returns the envelope like `apiRequest`, never throws.
 */
export function uploadFile<T>(path: string, file: File, onProgress: (fraction: number) => void): Promise<ApiResult<T>> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', path);
    xhr.responseType = 'json';
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
    xhr.onload = () => {
      const json = xhr.response as unknown;
      const isEnvelope = typeof json === 'object' && json !== null && typeof (json as { ok?: unknown }).ok === 'boolean';
      resolve(isEnvelope ? (json as ApiResult<T>) : { ok: false, error: INTERNAL });
    };
    xhr.onerror = () => resolve({ ok: false, error: INTERNAL });
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}
