// Proceseaza `items` in paralel, dar cu un plafon de concurenta -- nu
// pornim toate request-urile deodata (am putea lovi rate-limit-ul de la
// Groq sau Resend la scara mare), dar nici nu le facem strict secvential,
// unul dupa altul (prea lent la sute/mii de restaurante -- risca sa
// depaseasca limita de executie a functiei serverless).
//
// Model simplu de "worker pool": pornim `concurrency` worker-i care trag,
// fiecare, urmatorul element disponibil dintr-un indice comun, pana se
// termina lista. Rezultatele raman in ordinea originala a lui `items`.
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}
