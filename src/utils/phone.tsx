export const strip86 = (phone?: string | null): string => (phone || '').replace(/^\+86/, '');

export const add86 = (phone?: string | null): string =>
  phone && !phone.startsWith('+86') ? `+86${phone}` : phone || '';
