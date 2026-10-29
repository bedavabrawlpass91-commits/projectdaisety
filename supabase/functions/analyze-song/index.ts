// Edge function: analyze-song (v2: character GIFs)
// 1. Searches the web via Tavily for the song's lyrics, meaning, and cultural context.
// 2. Feeds those results as context to Gemini (fixed model: gemini-3.5-flash-lite)
//    so the AI doesn't need to rely on its own (possibly outdated) training data.
// 3. Returns structured vibes / characters / feelings.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const TAVILY_ENDPOINT = "https://api.tavily.com/search";
const TAVILY_API_KEY = "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";

interface AnalyzeRequest {
  song: string;
  artist?: string;
  lang?: "tr" | "en";
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as AnalyzeRequest;
    const song = (body.song || "").trim();
    const artist = (body.artist || "").trim();
    const lang = body.lang === "en" ? "en" : "tr";

    if (!song) {
      return new Response(
        JSON.stringify({ error: "Song title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 1: Search the web for lyrics, meaning, and cultural context
    const webContext = await searchWeb(song, artist);

    // Step 2: Build prompt with web context and call Gemini
    const prompt = buildPrompt(song, artist, lang, webContext);

    let lastError = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const geminiRes = await fetch(GEMINI_ENDPOINT, {
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

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          lastError = `AI request failed (${geminiRes.status}): ${errText.slice(0, 300)}`;
          // 503 = overloaded, 429 = rate limited — retry
          if ((geminiRes.status === 503 || geminiRes.status === 429) && attempt < 2) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          break;
        }

        const geminiJson = await geminiRes.json();
        const text: string | undefined =
          geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          lastError = "AI returned an empty response";
          break;
        }

        const parsed = tryParseJson(text);
        if (!parsed) {
          lastError = "AI returned malformed JSON";
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          break;
        }

        const result = normalizeResult(parsed, lang, song.length + artist.length);

        if (result.vibes.length === 0 && result.characters.length === 0 && result.feelings.length === 0) {
          lastError = "AI returned empty analysis";
          break;
        }

        return new Response(
          JSON.stringify({ ok: true, ...result }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch {
        clearTimeout(timeout);
        lastError = "AI request timed out or failed";
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        break;
      }
    }

    return new Response(
      JSON.stringify({ error: lastError || "AI analysis failed" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// --- Tavily web search ---

async function searchWeb(song: string, artist: string): Promise<string> {
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
        "Authorization": `Bearer ${TAVILY_API_KEY}`,
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

    const data = await res.json() as {
      answer?: string;
      results?: TavilyResult[];
    };

    const parts: string[] = [];
    if (data.answer) {
      parts.push(`Summary: ${data.answer}`);
    }
    if (data.results && data.results.length > 0) {
      const snippets = data.results
        .slice(0, 5)
        .map((r) => `[${r.title}]\n${r.content.slice(0, 500)}`)
        .join("\n\n");
      parts.push(snippets);
    }

    return parts.join("\n\n");
  } catch {
    // Web search is supplementary — if it fails, continue without it
    return "";
  }
}

// --- JSON parsing helper ---

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

// --- Prompt builder ---

function buildPrompt(song: string, artist: string, lang: "tr" | "en", webContext: string): string {
  const artistLine = artist ? ` by ${artist}` : "";
  const langName = lang === "tr" ? "Turkish" : "English";
  const vibeGuide = lang === "tr"
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

// --- Result normalization ---

interface RawResult {
  vibes?: unknown;
  characters?: unknown;
  feelings?: unknown;
  mood?: unknown;
}

interface NormalizedResult {
  vibes: string[];
  characters: { name: string; source: string; gifUrl?: string }[];
  feelings: { title: string }[];
  mood: string;
}

function normalizeResult(parsed: unknown, _lang: "tr" | "en", fallbackSeed: number): NormalizedResult {
  const r = (parsed || {}) as RawResult;

  const vibes = Array.isArray(r.vibes)
    ? r.vibes.map((v) => typeof v === "string" ? v : String(v ?? "")).filter(Boolean).slice(0, 3)
    : [];
  const characters = Array.isArray(r.characters)
    ? r.characters.map((c): { name: string; source: string } => {
        const obj = (c || {}) as Record<string, unknown>;
        return {
          name: String(obj.name ?? obj.character ?? "Unknown"),
          source: String(obj.source ?? obj.movie ?? obj.show ?? ""),
        };
      }).slice(0, 3)
    : [];
  const feelings = Array.isArray(r.feelings)
    ? r.feelings.map((f): { title: string } => {
        const obj = (f || {}) as Record<string, unknown>;
        const title = typeof f === "string" ? f : String(obj.title ?? obj.name ?? "");
        return { title };
      }).filter((f) => f.title).slice(0, 3)
    : [];
  const validMoods = ['nightcity','rain','sunset','neon','fog','ocean','energy','blossom','desert','decay','cosmic','smoke','flowers','ice'];
  const moodRaw = typeof r.mood === 'string' ? r.mood.toLowerCase().trim() : '';
  const mood = validMoods.includes(moodRaw) ? moodRaw : validMoods[fallbackSeed % validMoods.length];
  return { vibes, characters, feelings, mood };
}


