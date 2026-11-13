/**
 * What an uploaded file really is, read from its first bytes. The browser's declared type is the
 * uploader's say-so, so the upload route trusts this instead (#228).
 */
export function sniffMediaType(bytes: Uint8Array): string | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (ascii(0, 8) === '\x89PNG\r\n\x1a\n') return 'image/png';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  // ISO base media; QuickTime (`qt  `) shares the box layout but isn't an mp4.
  if (ascii(4, 8) === 'ftyp' && ascii(8, 12) !== 'qt  ') return 'video/mp4';
  return null;
}

/**
 * An mp4's length in seconds from its movie header (`mvhd`), or null when the header can't be found,
 * in which case the size cap is the only limit.
 */
export function mp4DurationSeconds(bytes: Uint8Array): number | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 4; i + 4 <= bytes.length; i++) {
    // 'mvhd' as a box type, then version, flags, two dates, timescale and duration.
    if (bytes[i] !== 0x6d || bytes[i + 1] !== 0x76 || bytes[i + 2] !== 0x68 || bytes[i + 3] !== 0x64) continue;
    const at = i + 4;
    const v1 = bytes[at] === 1;
    if (at + (v1 ? 32 : 20) > bytes.length) return null;
    const timescale = view.getUint32(at + (v1 ? 20 : 12));
    const duration = v1 ? Number(view.getBigUint64(at + 24)) : view.getUint32(at + 16);
    return timescale > 0 ? duration / timescale : null;
  }
  return null;
}
