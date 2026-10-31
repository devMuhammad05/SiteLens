export const longDate = (iso, withWeekday = false) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
        ...(withWeekday ? { weekday: 'long' } : {}),
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

export const slugify = (s) => String(s || '').replace(/\W+/g, '-').toLowerCase();

export function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
