/** pluralize(2, ['заявка', 'заявки', 'заявок']) → 'заявки' */
export function pluralize(count: number, forms: readonly [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}
