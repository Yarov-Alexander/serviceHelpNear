function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getRedirectPath(state: unknown): string | undefined {
  if (!isRecord(state) || !isRecord(state.from)) return undefined;

  const { pathname } = state.from;
  return typeof pathname === "string" ? pathname : undefined;
}
