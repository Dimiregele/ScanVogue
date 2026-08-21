// Logica de grupare a reclamatiilor pe tema + detectare tipar zi/ora.
// Folosita atat de raportul lunar cat si de cel saptamanal -- extrasa aici
// o singura data, ca sa nu avem doua implementari care ar putea diverge
// (bug clasic: repari una, uiti de cealalta).

// Praguri pentru onestitate statistica -- nu raportam un "tipar" (ex: "apare
// mai ales vineri seara") daca sunt prea putine cazuri ca sa insemne ceva
// real, nu doar coincidenta. 2 reclamatii in acelasi interval nu e un tipar.
export const MIN_OCCURRENCES_FOR_THEME = 3;
export const MIN_OCCURRENCES_FOR_TIME_PATTERN = 4;
export const MIN_SHARE_FOR_TIME_PATTERN = 0.4; // cel putin 40% din cazuri in acelasi interval

// Forma adverbiala corecta ("lunea", nu "luna") -- nu se poate deriva algoritmic
// din numele zilei prin taiere de litere, trebuie mapata direct. Index = getDay().
export const DAY_ADVERBIAL = ["duminica", "lunea", "marțea", "miercurea", "joia", "vinerea", "sâmbăta"];

export function timeBucket(hour: number): string {
  if (hour >= 6 && hour < 11) return "dimineața";
  if (hour >= 11 && hour < 15) return "la prânz";
  if (hour >= 15 && hour < 18) return "după-amiaza";
  if (hour >= 18 && hour < 22) return "seara";
  return "noaptea";
}

export type ThemeStat = {
  theme: string;
  count: number;
  // null daca nu exista suficiente date pentru un tipar de timp real
  timePattern: string | null;
};

export type ThemedComplaintRow = { theme: string | null; created_at: string };

export function computeThemeStats(rows: ThemedComplaintRow[], limit: number = 5): ThemeStat[] {
  // Grupam pe tema -> lista de date (ca sa putem cauta tiparul de zi/ora dupa)
  const byTheme = new Map<string, Date[]>();
  for (const r of rows) {
    const theme = r.theme?.trim() || "necategorizat";
    const dates = byTheme.get(theme) ?? [];
    dates.push(new Date(r.created_at));
    byTheme.set(theme, dates);
  }

  return Array.from(byTheme.entries())
    .filter(([, dates]) => dates.length >= MIN_OCCURRENCES_FOR_THEME)
    .map(([theme, dates]) => {
      let timePattern: string | null = null;

      if (dates.length >= MIN_OCCURRENCES_FOR_TIME_PATTERN) {
        // Numaram aparitiile pe combinatia (zi din saptamana + interval orar).
        // Cheia foloseste indexul zilei (0-6), nu numele, ca sa putem folosi
        // corect forma adverbiala mai jos ("lunea", nu derivata din "Luni").
        const bucketCounts = new Map<string, number>();
        for (const d of dates) {
          const key = `${d.getDay()}|${timeBucket(d.getHours())}`;
          bucketCounts.set(key, (bucketCounts.get(key) ?? 0) + 1);
        }
        const [topKey, topCount] = Array.from(bucketCounts.entries()).sort((a, b) => b[1] - a[1])[0];
        if (topCount / dates.length >= MIN_SHARE_FOR_TIME_PATTERN) {
          const [dayIndexStr, part] = topKey.split("|");
          const dayIndex = Number(dayIndexStr);
          timePattern = `mai ales ${DAY_ADVERBIAL[dayIndex]} ${part}`;
        }
      }

      return { theme, count: dates.length, timePattern };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
