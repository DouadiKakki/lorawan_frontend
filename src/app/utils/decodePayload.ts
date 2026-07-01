export interface DecodeResult {
  data?: any;
  warnings?: string[];
  errors?: string[];
}

function hexToBytes(hexPayload: string): number[] {
  const clean = hexPayload.replace(/[^0-9a-fA-F]/g, '');
  if (!clean || clean.length % 2 !== 0) return [];
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return bytes;
}

export function decodeUplinkPayload(hexPayload: string, formatterCode: string, fPort?: number): DecodeResult {
  const bytes = hexToBytes(hexPayload);
  if (bytes.length === 0) {
    return { errors: ['Invalid payload'] };
  }
  try {
    const run = new Function('input', `${formatterCode}\nreturn decodeUplink(input);`);
    return run({ bytes, fPort });
  } catch (error: any) {
    return { errors: [String(error?.message ?? error)] };
  }
}
