const timeFormat = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });
const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });

export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

/** Сегодня — время, раньше — дата («9 нояб.») */
export function formatListTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  return date.toDateString() === now.toDateString()
    ? timeFormat.format(date)
    : dateFormat.format(date);
}
