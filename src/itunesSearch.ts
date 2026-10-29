export interface ITunesResult {
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackId: number;
}

const ITUNES_BASE = "https://itunes.apple.com/search";

function detectRegion(): string {
  try {
    const locale = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || "en-US";
    const parts = locale.split("-");
    if (parts.length >= 2) {
      return parts[1].toUpperCase();
    }
    return "US";
  } catch {
    return "US";
  }
}

export function getRegion(): string {
  return detectRegion();
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastQuery = "";

export function debouncedSearch(
  query: string,
  callback: (results: ITunesResult[]) => void,
  delay = 350,
): void {
  const trimmed = query.trim();
  if (debounceTimer) clearTimeout(debounceTimer);

  if (!trimmed) {
    lastQuery = "";
    callback([]);
    return;
  }

  debounceTimer = setTimeout(async () => {
    const results = await searchITunes(trimmed);
    callback(results);
  }, delay);
}

function dedupeAndRank(results: ITunesResult[], query: string): ITunesResult[] {
  const seen = new Set<string>();
  const q = query.toLowerCase();

  const exactTitle: ITunesResult[] = [];
  const titleStartsWith: ITunesResult[] = [];
  const titleContains: ITunesResult[] = [];
  const artistMatch: ITunesResult[] = [];
  const rest: ITunesResult[] = [];

  for (const r of results) {
    const key = `${r.trackName.toLowerCase()}|${r.artistName.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const titleLower = r.trackName.toLowerCase();
    if (titleLower === q) {
      exactTitle.push(r);
    } else if (titleLower.startsWith(q)) {
      titleStartsWith.push(r);
    } else if (titleLower.includes(q)) {
      titleContains.push(r);
    } else if (r.artistName.toLowerCase().includes(q)) {
      artistMatch.push(r);
    } else {
      rest.push(r);
    }
  }

  return [...exactTitle, ...titleStartsWith, ...titleContains, ...artistMatch, ...rest].slice(0, 7);
}

export async function searchITunes(query: string): Promise<ITunesResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const region = detectRegion();
  const url = `${ITUNES_BASE}?term=${encodeURIComponent(trimmed)}&country=${region}&media=music&entity=song&limit=20&explicit=Yes&v=${Date.now()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.results || !Array.isArray(data.results)) return [];

    const mapped = data.results
      .filter((r: Record<string, unknown>) => r.trackName && r.artistName)
      .map((r: Record<string, unknown>) => ({
        trackName: String(r.trackName),
        artistName: String(r.artistName),
        artworkUrl100: String(r.artworkUrl100 || ""),
        previewUrl: String(r.previewUrl || ""),
        trackId: Number(r.trackId || 0),
      }));

    return dedupeAndRank(mapped, trimmed);
  } catch {
    return [];
  }
}

export async function searchITunesSuggestions(query: string): Promise<ITunesResult[]> {
  return searchITunes(query);
}
