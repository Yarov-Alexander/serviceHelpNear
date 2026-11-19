/** «Анна Ковалёва» → «Анна К.» */
export function getShortName(fullName: string): string {
  const [first, ...rest] = fullName.trim().split(/\s+/).filter(Boolean);
  if (!first) return "";
  const last = rest[rest.length - 1];
  return last ? `${first} ${last.charAt(0).toUpperCase()}.` : first;
}
