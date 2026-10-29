export interface AiResult {
  vibes: string[];
  characters: { name: string; source: string }[];
  feelings: { title: string }[];
  mood?: string;
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

const GEMINI_MODEL = "gemini-2.0-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const TAVILY_ENDPOINT = "https://api.tavily.com/search";

async function searchWeb(song: string, artist: string): Promise<string> {
  const tavilyKey = import.meta.env.VITE_TAVILY_API_KEY;
  if (!tavilyKey) return "";

  const query = artist
    ? `"${song}" ${artist} song lyrics meaning analysis`
    : `"${song}" song lyrics meaning analysis`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(TAVILY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tavilyKey}`,
      },
      body: JSON.stringify({
        query,
        max_results: 5,
        include_answer: true,
        search_depth: "advanced",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return "";

    const data = (await res.json()) as { answer?: string; results?: TavilyResult[] };

    const parts: string[] = [];
    if (data.answer) parts.push(`Summary: ${data.answer}`);
    if (data.results?.length) {
      const snippets = data.results
        .slice(0, 5)
        .map((r) => `[${r.title}]\n${r.content.slice(0, 500)}`)
        .join("\n\n");
      parts.push(snippets);
    }
    return parts.join("\n\n");
  } catch {
    return "";
  }
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildPrompt(song: string, artist: string, lang: "tr" | "en", webContext: string): string {
  const artistLine = artist ? ` by ${artist}` : "";
  const langName = lang === "tr" ? "Turkish" : "English";
  const vibeGuide =
    lang === "tr"
      ? "şarkının RUHUNA ve MOOD'una uyan, çiğ ve dürüst, ama BENZERSİZ bir yaşam anı. Şarkı neşeli, coşkulu veya enerjikse vibe'lar POZİTİF olmalı — ilk öpücük, dostlarla geceyarısı dans, güneşin doğuşunda araba kullanmak, kediyi kucağa alıp mutlu olmak gibi. Şarkı melankolik veya hüzünlüyse vibe'lar o duyguya uygun olmalı. Önemli: vibe'ların tonu şarkının gerçek mood'unu yansıtmalı — her şarkıya hüzünlü vibe verme! Spesifik ve beklenmedik bir duygusal/sözel detay içermeli. Maksimum 7 kelime. KAÇIN: tek başına 'ağlamak', 'yalnızlık', 'gece', 'mutluluk' gibi genel sözler."
      : "a raw, honest, but UNIQUE life moment that matches THIS SONG'S actual MOOD and energy. If the song is joyful, upbeat, or energetic, vibes MUST be POSITIVE — first kiss, dancing with friends at midnight, driving at sunrise, holding a warm cat on your lap. If the song is melancholic or sad, vibes should match that tone. CRITICAL: vibe tone must reflect the song's real emotional energy — do NOT default to sad vibes for every song! Include a specific, unexpected detail tied to the song's essence. Max 7 words. AVOID: standalone generics like 'crying', 'loneliness', 'night', 'happiness'.";

  const contextBlock = webContext
    ? `\n\n=== WEB SEARCH RESULTS (use this as your primary source of truth) ===\n${webContext}\n=== END WEB SEARCH RESULTS ===\n\nBase your analysis on the real lyrics, themes, and cultural context found above. Quote specific lyrics or details from the search results.`
    : "";

  return `You are DAISY, an expert music analyst with deep knowledge of song lyrics, musical theory, production, and cultural context.

Analyze the song "${song}"${artistLine}.${contextBlock}

Based on the information above, analyze the song through these lenses:

1. LYRICS & THEMES: What is the song about? What are the key phrases, metaphors, and storytelling elements? What emotional narrative does it tell? Reference specific lyrics.

2. RHYTHM & MUSICAL ENERGY: What is the tempo (slow/mid/fast)? What instruments dominate? Is there a distinctive beat, bassline, guitar riff, synth, or vocal style? Is the energy building, dropping, steady, or chaotic? Describe the sonic texture.

3. MOOD & EMOTIONAL ARC: What is the primary emotion? Does it shift during the song? Is there a climax, a drop, a quiet moment? What feeling does the listener walk away with?

4. CULTURAL MOMENT: How is this song used and discussed on social media (TikTok, Instagram, playlists)? What emotional context do people attach to it? Is it a hype song, a crying-in-your-car song, a nostalgia trigger?

Now produce a JSON object with EXACTLY these fields, all text in ${langName}:

{
  "vibes": [3 raw, visceral, HIGHLY UNIQUE life-moment vibes specific to THIS song. Each ${vibeGuide}. Every vibe must be grounded in a concrete detail from your analysis above — a specific lyric, a sonic texture, a cultural use. Match the song's real emotional energy. Never repeat vibes across different songs.],
  "characters": [3 fictional characters from film, TV, anime, or games whose personality arc or aesthetic matches this song's energy. Think about the CHARACTER, not just the show. Each as {"name": "character name", "source": "movie/show/game title"}. ALWAYS include the source title. Pick characters whose specific story resonates with this song's themes, not generic matches.],
  "feelings": [3 distinct emotion words it evokes. Be specific — not just "sad" or "happy" but nuanced emotions. Each as {"title": "one word emotion in ${langName}"}],
  "mood": "EXACTLY ONE of these aesthetic tags that best matches the song's overall vibe: 'nightcity' | 'rain' | 'sunset' | 'neon' | 'fog' | 'ocean' | 'energy' | 'blossom' | 'desert' | 'decay' | 'cosmic' | 'smoke' | 'flowers' | 'ice'. Pick the one that most closely matches the emotional and visual atmosphere of the song."
}

Return ONLY the JSON object. No commentary, no markdown, no explanation.`;
}

interface RawResult {
  vibes?: unknown;
  characters?: unknown;
  feelings?: unknown;
  mood?: unknown;
}

function normalizeResult(parsed: unknown, fallbackSeed: number): AiResult {
  const r = (parsed || {}) as RawResult;

  const vibes = Array.isArray(r.vibes)
    ? r.vibes.map((v) => (typeof v === "string" ? v : String(v ?? ""))).filter(Boolean).slice(0, 3)
    : [];
  const characters = Array.isArray(r.characters)
    ? r.characters
        .map((c): { name: string; source: string } => {
          const obj = (c || {}) as Record<string, unknown>;
          return {
            name: String(obj.name ?? obj.character ?? "Unknown"),
            source: String(obj.source ?? obj.movie ?? obj.show ?? ""),
          };
        })
        .slice(0, 3)
    : [];
  const feelings = Array.isArray(r.feelings)
    ? r.feelings
        .map((f): { title: string } => {
          const obj = (f || {}) as Record<string, unknown>;
          const title = typeof f === "string" ? f : String(obj.title ?? obj.name ?? "");
          return { title };
        })
        .filter((f) => f.title)
        .slice(0, 3)
    : [];

  const validMoods = [
    "nightcity", "rain", "sunset", "neon", "fog", "ocean",
    "energy", "blossom", "desert", "decay", "cosmic", "smoke", "flowers", "ice",
  ];
  const moodRaw = typeof r.mood === "string" ? r.mood.toLowerCase().trim() : "";
  const mood = validMoods.includes(moodRaw) ? moodRaw : validMoods[fallbackSeed % validMoods.length];

  return { vibes, characters, feelings, mood };
}

export async function analyzeSong(song: string, artist: string, lang: "tr" | "en"): Promise<AiResult | null> {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!geminiKey) return null;

  const webContext = await searchWeb(song, artist);
  const prompt = buildPrompt(song, artist, lang, webContext);
  const fallbackSeed = song.length + artist.length;

  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.85,
            responseMimeType: "application/json",
            maxOutputTokens: 2048,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        if ((res.status === 503 || res.status === 429) && attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        return null;
      }

      const json = await res.json();
      const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return null;

      const parsed = tryParseJson(text);
      if (!parsed) {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        return null;
      }

      const result = normalizeResult(parsed, fallbackSeed);
      if (result.vibes.length === 0 && result.characters.length === 0 && result.feelings.length === 0) {
        return null;
      }
      return result;
    } catch {
      clearTimeout(timeout);
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      return null;
    }
  }
  return null;
}
