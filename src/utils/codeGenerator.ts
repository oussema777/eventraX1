const UNAMBIGUOUS_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateAccessCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += UNAMBIGUOUS_CHARS[Math.floor(Math.random() * UNAMBIGUOUS_CHARS.length)];
  }
  return code;
}
