export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }).format(date);
}
