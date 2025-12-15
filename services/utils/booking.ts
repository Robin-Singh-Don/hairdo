export function toStartISO(dateYMD: string, time24: string): string {
  // dateYMD: "YYYY-MM-DD", time24: "HH:mm"
  const [y, m, d] = dateYMD.split('-').map((x) => parseInt(x, 10));
  const [hh, mm] = time24.split(':').map((x) => parseInt(x, 10));
  const dt = new Date(y, (m - 1), d, hh, mm, 0, 0);
  return dt.toISOString();
}

export function computeCancelBy(startISO: string, cnwHours: number): string {
  const start = new Date(startISO).getTime();
  const cancelBy = new Date(start - cnwHours * 60 * 60 * 1000);
  return cancelBy.toISOString();
}

export function nowISO(): string {
  return new Date().toISOString();
}


