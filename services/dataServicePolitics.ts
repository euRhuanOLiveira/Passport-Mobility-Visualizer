// services/dataServicePolitics.ts

export async function fetchPoliticsData(): Promise<Record<string, any>> {
  const base = import.meta.env.BASE_URL || '/';

  const url = `${base}output/politics/by_iso2.json`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to load politics data: ${res.status}`);
  }

  return res.json();
}
