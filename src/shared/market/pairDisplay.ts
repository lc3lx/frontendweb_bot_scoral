const CURRENCY_FLAG_COUNTRY: Record<string, string> = {
  EUR: 'eu',
  USD: 'us',
  GBP: 'gb',
  JPY: 'jp',
  AUD: 'au',
  CAD: 'ca',
  CHF: 'ch',
  NZD: 'nz',
  TRY: 'tr',
  MXN: 'mx',
  ZAR: 'za',
  SGD: 'sg',
  HKD: 'hk',
  CNH: 'cn',
  CNY: 'cn',
  SEK: 'se',
  NOK: 'no',
  PLN: 'pl',
  DKK: 'dk',
  INR: 'in',
  BRL: 'br',
  RUB: 'ru',
  CZK: 'cz',
  HUF: 'hu',
  ILS: 'il',
  THB: 'th',
};

export type ParsedFxPair = {
  base: string;
  quote: string;
  isOtc: boolean;
};

export function parseFxPair(symbol: string): ParsedFxPair | null {
  let s = symbol.trim().replace(/\//g, '');
  const isOtc = /_otc$/i.test(s);
  if (isOtc) s = s.slice(0, -4);
  if (!/^[A-Za-z]{6}$/.test(s)) return null;
  return {
    base: s.slice(0, 3).toUpperCase(),
    quote: s.slice(3).toUpperCase(),
    isOtc,
  };
}

export function formatPairLabel(symbol: string, name?: string): string {
  if (name && name.includes('/')) return name.split(' ')[0] ?? name;
  const base = symbol.replace(/_otc$/i, '');
  if (base.length === 6) return `${base.slice(0, 3)}/${base.slice(3)}`;
  return base;
}

export function pairTypeFromSymbol(symbol: string): 'OTC' | 'Global' {
  return symbol.toLowerCase().includes('otc') ? 'OTC' : 'Global';
}

export function currencyFlagUrl(code: string, size = 40): string {
  const country = CURRENCY_FLAG_COUNTRY[code.toUpperCase()] ?? code.toLowerCase().slice(0, 2);
  return `https://flagcdn.com/w${size}/${country}.png`;
}

export function formatSelectedPairsLabel(ids: string[]): string {
  if (ids.length === 0) return '—';
  const labels = ids.map((id) => formatPairLabel(id));
  if (labels.length === 1) return labels[0] ?? '—';
  return `${labels[0]} +${labels.length - 1}`;
}
