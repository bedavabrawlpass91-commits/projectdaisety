import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Sparkles, Film, Heart, Palette, Globe, ChevronDown, Dices, Share2, Instagram, Music2, MessageCircle, Clock, Bookmark, Trash2, Zap, Crown, X, Settings, KeyRound } from 'lucide-react';
import daisyLogo from './daisy-logo.svg';
import { debouncedSearch, type ITunesResult } from './itunesSearch';
import { analyzeSong } from './aiAnalysis';
import {
  type TabId,
  type Lang,
  type ThemeId,
  VIBES_TR,
  VIBES_EN,
  CHARACTERS,
  FEELINGS,
  ALBUM_ART,
  SONG_SUGGESTIONS,
  CREDITS,
  THANK_YOU,
  pickThree,
  hashString,
  UI,
} from './auraData';

const TABS: TabId[] = ['VIBE', 'CHARACTER', 'FEELING'];
const DAILY_CREDIT = 5;
const AD_CREDIT = 3;

type SavedItem = {
  id: string;
  song: string;
  artist: string;
  tab: TabId;
  seed: number;
  date: number;
  vibe: string;
  charName: string;
  feeling: string;
};

type AiResult = {
  vibes: string[];
  characters: { name: string; source: string }[];
  feelings: { title: string }[];
  mood?: string;
};

const THEMES: { id: ThemeId; label: string; tr: string; swatch: string }[] = [
  { id: 'bordo', label: 'Bordo', tr: 'Bordo', swatch: 'linear-gradient(135deg, #d4385e, #7a1633)' },
  { id: 'ocean', label: 'Ocean', tr: 'Mavi', swatch: 'linear-gradient(135deg, #6f898b, #3a5057)' },
  { id: 'lime', label: 'Lime', tr: 'Yeşil', swatch: 'linear-gradient(135deg, #7acc30, #2a7c04)' },
];

const TAB_ICON: Record<TabId, typeof Sparkles> = {
  VIBE: Sparkles,
  CHARACTER: Film,
  FEELING: Heart,
};

// Y2K / Gen Z aesthetic color palettes — moody, holographic, dreamy
const Y2K_PALETTES: { c1: string; c2: string; c3: string }[] = [
  { c1: '#ff6ec7', c2: '#6a5acd', c3: '#00ced1' },  // pink → indigo → teal
  { c1: '#ff4b6e', c2: '#1a1a40', c3: '#8a2be2' },  // hot pink → midnight → violet
  { c1: '#00f5ff', c2: '#ff00e6', c3: '#fffaac' },  // cyberwave
  { c1: '#f7768e', c2: '#1f2333', c3: '#7dcfff' },  // dark coral
  { c1: '#c084fc', c2: '#22d3ee', c3: '#fde68a' },  // pastel holographic
  { c1: '#fb7185', c2: '#4f46e5', c3: '#22d3ee' },  // sunset y2k
  { c1: '#a3e635', c2: '#1a2e05', c3: '#84cc16' },  // toxic green
  { c1: '#e879f9', c2: '#7c3aed', c3: '#06b6d4' },  // iridescent
  { c1: '#fbbf24', c2: '#7c2d12', c3: '#f472b6' },  // amber retro
  { c1: '#67e8f9', c2: '#0e7490', c3: '#fde047' },  // aqua sunshine
  { c1: '#f0abfc', c2: '#581c87', c3: '#5eead4' },  // lavender mint
  { c1: '#fca5a5', c2: '#3730a3', c3: '#a7f3d0' },  // dusty rose
];

// AI-curated mood → Pexels photo mapping (picked by the AI's mood tag)
const MOOD_PHOTOS: Record<string, string[]> = {
  nightcity: [
    'https://images.pexels.com/photos/26732101/pexels-photo-26732101.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/33474766/pexels-photo-33474766.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3629564/pexels-photo-3629564.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/16408142/pexels-photo-16408142.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/11290329/pexels-photo-11290329.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/20711923/pexels-photo-20711923.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/30641513/pexels-photo-30641513.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  rain: [
    'https://images.pexels.com/photos/8889107/pexels-photo-8889107.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/9306790/pexels-photo-9306790.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/34250453/pexels-photo-34250453.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/734785/pexels-photo-734785.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/268832/pexels-photo-268832.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/20894397/pexels-photo-20894397.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/36525955/pexels-photo-36525955.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/722149/pexels-photo-722149.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  sunset: [
    'https://images.pexels.com/photos/10967040/pexels-photo-10967040.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/17528291/pexels-photo-17528291.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/540520/pexels-photo-540520.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/14119661/pexels-photo-14119661.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/39281443/pexels-photo-39281443.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/29150580/pexels-photo-29150580.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5688203/pexels-photo-5688203.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/33940418/pexels-photo-33940418.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  neon: [
    'https://images.pexels.com/photos/20994431/pexels-photo-20994431.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/31723109/pexels-photo-31723109.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/11689101/pexels-photo-11689101.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/11808109/pexels-photo-11808109.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/12142495/pexels-photo-12142495.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/12820781/pexels-photo-12820781.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/15556731/pexels-photo-15556731.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  fog: [
    'https://images.pexels.com/photos/12363164/pexels-photo-12363164.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/9804651/pexels-photo-9804651.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3934053/pexels-photo-3934053.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/14845820/pexels-photo-14845820.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/38118567/pexels-photo-38118567.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/10974352/pexels-photo-10974352.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/9076763/pexels-photo-9076763.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  ocean: [
    'https://images.pexels.com/photos/34155535/pexels-photo-34155535.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4638772/pexels-photo-4638772.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/10534365/pexels-photo-10534365.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/39192620/pexels-photo-39192620.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/30903100/pexels-photo-30903100.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4609222/pexels-photo-4609222.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/15305610/pexels-photo-15305610.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/12280319/pexels-photo-12280319.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  energy: [
    'https://images.pexels.com/photos/31009823/pexels-photo-31009823.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/11418777/pexels-photo-11418777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/2544990/pexels-photo-2544990.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6817477/pexels-photo-6817477.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/10136493/pexels-photo-10136493.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/28589282/pexels-photo-28589282.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/33124004/pexels-photo-33124004.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  blossom: [
    'https://images.pexels.com/photos/31192317/pexels-photo-31192317.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4366839/pexels-photo-4366839.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/20441418/pexels-photo-20441418.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/36633362/pexels-photo-36633362.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/16683388/pexels-photo-16683388.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/16000943/pexels-photo-16000943.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/12052722/pexels-photo-12052722.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  desert: [
    'https://images.pexels.com/photos/16830227/pexels-photo-16830227.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/50628/pexels-photo-50628.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/8869381/pexels-photo-8869381.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/35972428/pexels-photo-35972428.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/16726602/pexels-photo-16726602.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/31364749/pexels-photo-31364749.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/16908875/pexels-photo-16908875.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  decay: [
    'https://images.pexels.com/photos/12746940/pexels-photo-12746940.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4888471/pexels-photo-4888471.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/34340837/pexels-photo-34340837.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/1710847/pexels-photo-1710847.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/12190398/pexels-photo-12190398.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/16778146/pexels-photo-16778146.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  cosmic: [
    'https://images.pexels.com/photos/1341279/pexels-photo-1341279.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/30648194/pexels-photo-30648194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/956999/milky-way-starry-sky-night-sky-star-956999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/20881655/pexels-photo-20881655.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/23522893/pexels-photo-23522893.png?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/35496726/pexels-photo-35496726.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/8148340/pexels-photo-8148340.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4233216/pexels-photo-4233216.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  smoke: [
    'https://images.pexels.com/photos/8780929/pexels-photo-8780929.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/14398806/pexels-photo-14398806.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6548516/pexels-photo-6548516.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/11230057/pexels-photo-11230057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5228726/pexels-photo-5228726.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/9694698/pexels-photo-9694698.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4598191/pexels-photo-4598191.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/13922614/pexels-photo-13922614.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  flowers: [
    'https://images.pexels.com/photos/30262554/pexels-photo-30262554.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/33292590/pexels-photo-33292590.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3351910/pexels-photo-3351910.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/32633821/pexels-photo-32633821.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/8462351/pexels-photo-8462351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/38027227/pexels-photo-38027227.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/13911779/pexels-photo-13911779.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/31640581/pexels-photo-31640581.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  ice: [
    'https://images.pexels.com/photos/5052445/pexels-photo-5052445.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6384610/pexels-photo-6384610.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6384608/pexels-photo-6384608.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7787959/pexels-photo-7787959.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4321318/pexels-photo-4321318.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/21714578/pexels-photo-21714578.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7127403/pexels-photo-7127403.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/17665455/pexels-photo-17665455.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
};

const MOOD_KEYS = Object.keys(MOOD_PHOTOS);

function moodPhoto(mood: string | undefined, seed: number): string {
  if (mood && MOOD_PHOTOS[mood]) {
    return MOOD_PHOTOS[mood][seed % MOOD_PHOTOS[mood].length];
  }
  const fallback = MOOD_KEYS[seed % MOOD_KEYS.length];
  return MOOD_PHOTOS[fallback][0];
}

const Y2KVisual = ({ seed, tab, loading, mood }: { seed: number; tab: TabId; loading: boolean; mood?: string }) => {
  const palette = Y2K_PALETTES[seed % Y2K_PALETTES.length];
  const photo = moodPhoto(mood, seed);
  const usePhoto = tab !== 'CHARACTER';
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-end)' }}>
        <Loader2 size={18} className="animate-spin accent-text" />
      </div>
    );
  }
  return (
    <div className="y2k-visual w-full h-full" style={{ background: '#0a0a14' }}>
      {/* AI-selected mood photo (vibe & feeling only) */}
      {usePhoto && (
        <>
          <img
            src={photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.45, mixBlendMode: 'luminosity' }}
            loading="lazy"
          />
          {/* Color tint overlay */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${palette.c1}40, ${palette.c2}60)`, mixBlendMode: 'color' }} />
        </>
      )}
      {/* Mesh blob layers */}
      <div
        className="y2k-blob y2k-blob-1"
        style={{ width: '70%', height: '70%', top: '-15%', left: '-10%', background: palette.c1, opacity: usePhoto ? 0.35 : 0.55 }}
      />
      <div
        className="y2k-blob y2k-blob-2"
        style={{ width: '65%', height: '65%', bottom: '-15%', right: '-10%', background: palette.c2, opacity: usePhoto ? 0.4 : 0.6 }}
      />
      <div
        className="y2k-blob y2k-blob-3"
        style={{ width: '50%', height: '50%', top: '25%', left: '30%', background: palette.c3, opacity: usePhoto ? 0.25 : 0.35 }}
      />
      {/* Conic shimmer */}
      <div className="y2k-conic" />
      {/* Holographic sweep */}
      <div className="y2k-holo" />
      {/* Film grain */}
      <div className="y2k-grain" />
      {/* CRT scanlines */}
      <div className="y2k-scanlines" />
      {/* Chromatic glow */}
      <div className="y2k-glow" />
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [songInput, setSongInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lang, setLang] = useState<Lang>('tr');
  const [theme, setTheme] = useState<ThemeId>('ocean');
  const [themeOpen, setThemeOpen] = useState(false);
  const [randomResult, setRandomResult] = useState<{
    song: string;
    artist: string;
    seed: number;
  } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [randomLockUntil, setRandomLockUntil] = useState<number | null>(null);
  const [showRandom, setShowRandom] = useState(false);
  const [now, setNow] = useState(Date.now());
  const themeRef = useRef<HTMLDivElement>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [saveFlash, setSaveFlash] = useState<string | null>(null);
  const [credits, setCredits] = useState(DAILY_CREDIT);
  const [creditsDate, setCreditsDate] = useState<string>('');
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adDone, setAdDone] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [premium, setPremium] = useState<boolean>(() => localStorage.getItem('aura_premium') === '1');
  const [codeInput, setCodeInput] = useState('');
  const [codeMsg, setCodeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiError, setAiError] = useState(false);
  const [randomAi, setRandomAi] = useState<AiResult | null>(null);
  const [randomAiLoading, setRandomAiLoading] = useState(false);
  const [itunesResults, setITunesResults] = useState<ITunesResult[]>([]);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);

  const todayKey = () => new Date().toISOString().slice(0, 10);

  const t = UI[lang];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const storedLock = localStorage.getItem('aura_random_lock');
    const storedResult = localStorage.getItem('aura_random_result');
    let parsedResult: { song: string; artist: string; seed: number } | null = null;
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        if (parsed && typeof parsed.song === 'string' && typeof parsed.artist === 'string' && typeof parsed.seed === 'number') {
          parsedResult = parsed;
        }
      } catch { /* ignore */ }
    }
    if (storedLock) {
      const ts = parseInt(storedLock, 10);
      if (!isNaN(ts) && ts > Date.now() && parsedResult) {
        setRandomLockUntil(ts);
        setRandomResult(parsedResult);
      } else {
        localStorage.removeItem('aura_random_lock');
        localStorage.removeItem('aura_random_result');
      }
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (randomLockUntil && now >= randomLockUntil && !premium) {
      setRandomLockUntil(null);
      setRandomResult(null);
      setShowRandom(false);
      localStorage.removeItem('aura_random_lock');
      localStorage.removeItem('aura_random_result');
    }
  }, [now, randomLockUntil, premium]);

  useEffect(() => {
    const tk = todayKey();
    const storedCredits = localStorage.getItem('aura_credits');
    const storedDate = localStorage.getItem('aura_credits_date');
    if (storedCredits && storedDate === tk) {
      setCredits(parseInt(storedCredits, 10));
    } else {
      setCredits(DAILY_CREDIT);
    }
    setCreditsDate(tk);
    const storedSaved = localStorage.getItem('aura_saved');
    if (storedSaved) {
      try { setSavedItems(JSON.parse(storedSaved)); } catch { /* ignore */ }
    }
  }, []);

  const persistCredits = (n: number) => {
    setCredits(n);
    setCreditsDate(todayKey());
    localStorage.setItem('aura_credits', String(n));
    localStorage.setItem('aura_credits_date', todayKey());
  };

  const persistPremium = (on: boolean) => {
    setPremium(on);
    localStorage.setItem('aura_premium', on ? '1' : '0');
    if (on) {
      setRandomLockUntil(null);
      localStorage.removeItem('aura_random_lock');
      localStorage.removeItem('aura_random_result');
    }
  };

  const handleCodeApply = () => {
    const code = codeInput.trim().toUpperCase();
    if (code === 'ADMINTEST') {
      persistPremium(true);
      setCodeMsg({ ok: true, text: t.premiumOn });
      setCodeInput('');
    } else if (code === 'ADMINTESTOFF') {
      persistPremium(false);
      setCodeMsg({ ok: true, text: t.premiumOff });
      setCodeInput('');
    } else {
      setCodeMsg({ ok: false, text: t.codeWrong });
    }
    setTimeout(() => setCodeMsg(null), 2500);
  };

  const persistSaved = (items: SavedItem[]) => {
    setSavedItems(items);
    localStorage.setItem('aura_saved', JSON.stringify(items));
  };

  const handleSave = () => {
    if (!activeTab || !songInput.trim()) return;
    const v = aiResult?.vibes[0] ?? pickThree(lang === 'tr' ? VIBES_TR : VIBES_EN, seed)[0];
    const c = aiResult?.characters[0] ?? pickThree(CHARACTERS, seed)[0];
    const f = aiResult?.feelings[0]?.title ?? pickThree(FEELINGS, seed)[0].title[lang];
    const item: SavedItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      song: songInput.trim(),
      artist: selectedArtist || findArtist(songInput) || '',
      tab: activeTab,
      seed,
      date: Date.now(),
      vibe: v,
      charName: c.name,
      feeling: f,
    };
    const next = [item, ...savedItems];
    persistSaved(next);
    setSaveFlash(item.id);
    setTimeout(() => setSaveFlash((cur) => (cur === item.id ? null : cur)), 1500);
  };

  const handleDeleteSaved = (id: string) => {
    persistSaved(savedItems.filter((it) => it.id !== id));
  };

  const handleClearAll = () => persistSaved([]);

  const handleWatchAd = () => {
    setShowAd(true);
    setAdCountdown(5);
    setAdDone(false);
  };

  useEffect(() => {
    if (!showAd || adDone) return;
    if (adCountdown <= 0) {
      setAdDone(true);
      persistCredits(credits + AD_CREDIT);
      setTimeout(() => {
        setShowAd(false);
        setAdDone(false);
      }, 1200);
      return;
    }
    const id = setTimeout(() => setAdCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [showAd, adCountdown, adDone, credits]);

  const randomLocked = randomLockUntil !== null && now < randomLockUntil && !premium;
  const randomMsLeft = randomLockUntil ? randomLockUntil - now : 0;
  const fmtCountdown = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const buildShareText = (song: string, artist?: string) => {
    const a = artist ? ` — ${artist}` : '';
    return `DAISY ◆ ${song}${a}\nŞarkının ruhunu oku → ${window.location.origin}`;
  };

  const handleShare = async (platform: 'instagram' | 'tiktok' | 'whatsapp', song: string, artist?: string) => {
    const text = buildShareText(song, artist);
    try {
      if (navigator.share && platform !== 'instagram' && platform !== 'tiktok') {
        await navigator.share({ title: 'DAISY', text });
        return;
      }
    } catch { /* fall through */ }
    const url = window.location.origin;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'instagram') {
      await navigator.clipboard.writeText(text).catch(() => {});
      window.open('https://www.instagram.com/', '_blank');
    } else if (platform === 'tiktok') {
      await navigator.clipboard.writeText(text).catch(() => {});
      window.open('https://www.tiktok.com/upload', '_blank');
    }
  };

  const ShareButtons = ({ song, artist }: { song: string; artist?: string }) => (
    <div className="flex items-center gap-3 mt-4 pt-2">
      <span className="text-[9px] tracking-[0.2em] font-bold accent-text flex items-center gap-1">
        <Share2 size={10} />
        {t.shareLabel}
      </span>
      <button
        type="button"
        onClick={() => handleShare('instagram', song, artist)}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'linear-gradient(45deg, #f09433, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
        aria-label="Instagram"
      >
        <Instagram size={14} className="text-white" />
      </button>
      <button
        type="button"
        onClick={() => handleShare('tiktok', song, artist)}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #25F4EE, #000, #FE2C55)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
        aria-label="TikTok"
      >
        <Music2 size={14} className="text-white" />
      </button>
      <button
        type="button"
        onClick={() => handleShare('whatsapp', song, artist)}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
        aria-label="WhatsApp"
      >
        <MessageCircle size={14} className="text-white" />
      </button>
    </div>
  );

  const seed = hashString(songInput.trim().toLowerCase() + activeTab);
  const albumArt = selectedArtwork || ALBUM_ART[seed % ALBUM_ART.length];

  const handleTabClick = (tab: TabId) => {
    setITunesResults([]);
    setSelectedArtist('');
    setSelectedArtwork(null);
    setActiveTab(tab);
    setShowResult(false);
    setSongInput('');
    setShowRandom(false);
    setShowSaved(false);
    setAiResult(null);
    setAiError(false);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTab || !songInput.trim()) return;
    if (credits <= 0 && !premium) {
      setShowPaywall(true);
      return;
    }
    setAnalyzing(true);
    setAiResult(null);
    setAiError(false);
    if (!premium) persistCredits(credits - 1);
    const artist = selectedArtist || findArtist(songInput) || itunesResults.find((r) => r.trackName.toLowerCase() === songInput.trim().toLowerCase())?.artistName || '';
    const songTitle = songInput.trim();

    const aiData = await analyzeSong(songTitle, artist, lang);

    if (aiData) {
      setAiResult(aiData);
    } else {
      setAiError(true);
    }

    setAnalyzing(false);
    setShowResult(true);
  };

  const handleLangToggle = () => {
    setLang((prev) => (prev === 'tr' ? 'en' : 'tr'));
  };

  const handleRandomRoll = () => {
    if (randomLocked && !premium) {
      if (randomResult) setShowRandom(true);
      return;
    }
    setRolling(true);
    setRandomResult(null);
    setRandomAi(null);
    setTimeout(() => {
      const song = SONG_SUGGESTIONS[Math.floor(Math.random() * SONG_SUGGESTIONS.length)];
      const randSeed = hashString(song.title.toLowerCase() + Math.random().toString(36));
      setRandomResult({ song: song.title, artist: song.artist, seed: randSeed });
      setRolling(false);
      setShowRandom(true);
      if (!premium) {
        const lockTs = Date.now() + 24 * 60 * 60 * 1000;
        setRandomLockUntil(lockTs);
        localStorage.setItem('aura_random_lock', String(lockTs));
        localStorage.setItem('aura_random_result', JSON.stringify({ song: song.title, artist: song.artist, seed: randSeed }));
      }
      setRandomAiLoading(true);
      analyzeSong(song.title, song.artist, lang).then((ai) => {
        setRandomAi(ai);
        setRandomAiLoading(false);
      });
    }, 900);
  };

  const findArtist = (title: string) =>
    SONG_SUGGESTIONS.find((s) => s.title.toLowerCase() === title.trim().toLowerCase())?.artist;

  const handleTryAnother = () => {
    setShowResult(false);
    setSelectedArtwork(null);
  };

  const renderSingleCard = (label: string, Icon: typeof Sparkles, cardSeed: number, tab: TabId) => {
    const sectionSeed = hashString(cardSeed.toString() + tab);
    let inner: React.ReactNode = null;
    if (tab === 'VIBE') {
      const aiVibes = randomAi?.vibes ?? [];
      const vibes = aiVibes.length ? aiVibes : pickThree(lang === 'tr' ? VIBES_TR : VIBES_EN, sectionSeed);
      const query = vibes[0];
      inner = (
        <div className="gel-card rounded-[8px] overflow-hidden fade-in-stagger h-full flex flex-col">
          <div className="w-full h-20 overflow-hidden shrink-0">
            <Y2KVisual seed={sectionSeed} tab={'VIBE'} loading={randomAiLoading} mood={randomAi?.mood} />
          </div>
          <div className="p-2.5 h-24 flex flex-col justify-center overflow-hidden">
            <span className="text-[9px] font-bold tracking-widest accent-text">01</span>
            {randomAiLoading ? (
              <div className="flex items-center gap-1 mt-0.5">
                <Loader2 size={9} className="animate-spin accent-text" />
                <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{t.analyzing}</span>
              </div>
            ) : (
              <p className="text-[10px] leading-tight font-medium mt-0.5 break-words" style={{ color: 'var(--ink)' }}>{query}</p>
            )}
          </div>
        </div>
      );
    } else if (tab === 'CHARACTER') {
      const c = pickThree(CHARACTERS, sectionSeed)[0];
      const aiC = randomAi?.characters?.[0];
      const name = aiC?.name || c.name;
      const source = aiC?.source || c.source;
      inner = (
        <div className="gel-card rounded-[8px] overflow-hidden fade-in-stagger h-full flex flex-col">
          <div className="w-full h-20 overflow-hidden shrink-0">
            <Y2KVisual seed={sectionSeed} tab={'CHARACTER'} loading={randomAiLoading} mood={randomAi?.mood} />
          </div>
          <div className="p-2.5 h-24 flex flex-col justify-center gap-0.5 overflow-hidden">
            <p className="text-[11px] font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>{name}</p>
            <p className="text-[8px] leading-tight truncate" style={{ color: 'var(--text-secondary)' }}>{source}</p>
          </div>
        </div>
      );
    } else {
      const f = pickThree(FEELINGS, sectionSeed)[0];
      const aiF = randomAi?.feelings?.[0];
      const title = aiF?.title || f.title[lang];
      const query = title;
      inner = (
        <div className="gel-card rounded-[8px] overflow-hidden fade-in-stagger h-full flex flex-col">
          <div className="w-full h-20 overflow-hidden shrink-0">
            <Y2KVisual seed={sectionSeed} tab={'FEELING'} loading={randomAiLoading} mood={randomAi?.mood} />
          </div>
          <div className="p-2.5 h-24 flex flex-col justify-center overflow-hidden">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3 h-3 shrink-0 accent-text" strokeWidth={1.5} fill="currentColor" />
              <p className="text-[11px] font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>{title}</p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon size={10} className="accent-text" />
          <span className="text-[9px] tracking-[0.2em] font-bold accent-text truncate">{label}</span>
        </div>
        {inner}
      </div>
    );
  };

  const renderResult = (tab: TabId) => {
    if (aiResult) return renderAiResult(tab, aiResult);
    return renderLocalResult(tab);
  };

  const renderAiResult = (tab: TabId, ai: AiResult) => {
    if (tab === 'VIBE') {
      const vibes = (ai.vibes.length ? ai.vibes : pickThree(lang === 'tr' ? VIBES_TR : VIBES_EN, seed)).slice(0, 3);
      return (
        <div className="grid grid-cols-3 gap-2">
          {vibes.map((v, i) => (
            <div key={i} className="gel-card rounded-[8px] overflow-hidden fade-in-stagger flex flex-col h-full" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-full h-20 overflow-hidden shrink-0">
                <Y2KVisual seed={seed + i} tab={'VIBE'} loading={analyzing} mood={aiResult?.mood} />
              </div>
              <div className="p-2.5 h-24 flex flex-col justify-center overflow-hidden">
                <span className="text-[9px] font-bold tracking-widest accent-text">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-[10px] leading-tight font-medium mt-0.5 break-words" style={{ color: 'var(--ink)' }}>{v}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (tab === 'CHARACTER') {
      const localChars = pickThree(CHARACTERS, seed);
      const chars = ai.characters.length
        ? ai.characters.map((c, i) => ({
            name: c.name,
            source: c.source || localChars[i]?.source || '',
          }))
        : localChars.map((c) => ({ name: c.name, source: c.source }));
      return (
        <div className="grid grid-cols-3 gap-2">
          {chars.slice(0, 3).map((c, i) => {
            const query = `${c.name} ${c.source}`.trim();
            return (
              <div key={i} className="gel-card rounded-[8px] overflow-hidden fade-in-stagger flex flex-col h-full" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-full h-20 overflow-hidden shrink-0">
                  <Y2KVisual seed={seed + i} tab={'CHARACTER'} loading={analyzing} mood={aiResult?.mood} />
                </div>
                <div className="p-2.5 h-24 flex flex-col justify-center gap-0.5 overflow-hidden">
                  <p className="text-[12px] font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>{c.name}</p>
                  {c.source && (
                    <p className="text-[9px] leading-tight truncate" style={{ color: 'var(--text-secondary)' }}>{c.source}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    const feelings = ai.feelings.length ? ai.feelings : pickThree(FEELINGS, seed).map((f) => ({ title: f.title[lang] }));
    return (
      <div className="grid grid-cols-3 gap-2">
        {feelings.slice(0, 3).map((f, i) => (
          <div key={i} className="gel-card rounded-[8px] overflow-hidden fade-in-stagger flex flex-col h-full" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-full h-20 overflow-hidden shrink-0">
              <Y2KVisual seed={seed + i} tab={'FEELING'} loading={analyzing} mood={aiResult?.mood} />
            </div>
            <div className="p-2.5 h-24 flex items-center overflow-hidden">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3 h-3 shrink-0 accent-text" strokeWidth={1.5} fill="currentColor" />
                <p className="text-[12px] font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>{f.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLocalResult = (tab: TabId) => {
    if (tab === 'VIBE') {
      const pool = lang === 'tr' ? VIBES_TR : VIBES_EN;
      const vibes = pickThree(pool, seed);
      return (
        <div className="grid grid-cols-3 gap-2">
          {vibes.map((v, i) => (
            <div key={i} className="gel-card rounded-[8px] overflow-hidden fade-in-stagger flex flex-col h-full" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-full h-20 overflow-hidden shrink-0">
                <Y2KVisual seed={seed + i} tab={'VIBE'} loading={analyzing} />
              </div>
              <div className="p-2.5 h-24 flex flex-col justify-center overflow-hidden">
                <span className="text-[10px] font-bold tracking-widest accent-text">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[11px] leading-snug font-medium mt-1" style={{ color: 'var(--ink)' }}>{v}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (tab === 'CHARACTER') {
      const chars = pickThree(CHARACTERS, seed);
      return (
        <div className="grid grid-cols-3 gap-2">
          {chars.map((c, i) => {
            const query = `${c.name} ${c.source}`.trim();
            return (
              <div key={i} className="gel-card rounded-[8px] overflow-hidden fade-in-stagger flex flex-col h-full" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-full h-20 overflow-hidden shrink-0">
                  <Y2KVisual seed={seed + i} tab={'CHARACTER'} loading={analyzing} mood={aiResult?.mood} />
                </div>
                <div className="p-2.5 h-24 flex flex-col justify-center gap-0.5 overflow-hidden">
                  <p className="text-[12px] font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>{c.name}</p>
                  <p className="text-[9px] leading-tight truncate" style={{ color: 'var(--text-secondary)' }}>{c.source}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    const feelings = pickThree(FEELINGS, seed);
    return (
      <div className="grid grid-cols-3 gap-2">
        {feelings.map((f, i) => (
          <div key={i} className="gel-card rounded-[8px] overflow-hidden fade-in-stagger flex flex-col h-full" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-full h-20 overflow-hidden shrink-0">
              <Y2KVisual seed={seed + i} tab={'FEELING'} loading={analyzing} mood={aiResult?.mood} />
            </div>
            <div className="p-2.5 h-24 flex items-center overflow-hidden">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3 h-3 shrink-0 accent-text" strokeWidth={1.5} fill="currentColor" />
                <p className="text-[12px] font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>{f.title[lang]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabIcon = activeTab ? TAB_ICON[activeTab] : null;

  return (
    <div className="min-h-screen flex items-center justify-center select-none" style={{ background: 'var(--body-bg)', transition: 'background 0.3s' }} data-theme={theme}>
      <div
        className="relative flex flex-col overflow-hidden w-full h-[100dvh] sm:h-[100dvh] sm:max-w-[440px] sm:rounded-[8px] sm:my-2"
        style={{
          background: 'linear-gradient(180deg, var(--bg-start) 0%, var(--bg-end) 100%)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          transition: 'background 0.3s',
        }}
      >
        {/* === HEADER === */}
            <header className="shrink-0 px-5 pt-5 pb-3 flex items-center justify-between">
              <img src={daisyLogo} alt="daisy" className="h-7 w-auto object-contain" />

              <div className="flex items-center gap-2">
                {/* Language toggle */}
                <button
                  onClick={handleLangToggle}
                  className="flex items-center gap-1 rounded-[6px] px-2.5 py-1.5 transition-all"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(245,240,242,0.5))',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <Globe size={11} className="accent-text" />
                  <span className="text-[10px] font-bold tracking-wide accent-text">{lang.toUpperCase()}</span>
                </button>

                {/* Theme selector */}
                <div ref={themeRef} className="relative">
                  <button
                    onClick={() => setThemeOpen((p) => !p)}
                    className="flex items-center gap-1 rounded-[6px] px-2.5 py-1.5 transition-all"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(245,240,242,0.5))',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <Palette size={11} className="accent-text" />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: THEMES.find((th) => th.id === theme)?.swatch }}
                    />
                    <ChevronDown size={10} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  {themeOpen && (
                    <div
                      className="absolute right-0 top-full mt-1.5 rounded-[8px] p-1.5 fade-in-stagger z-50"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,248,249,0.95))',
                        border: '1px solid var(--card-border)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      }}
                    >
                      {THEMES.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => { setTheme(th.id); setThemeOpen(false); }}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors w-full hover:bg-black/5"
                        >
                          <span className="w-4 h-4 rounded-full" style={{ background: th.swatch }} />
                          <span className="text-[12px] font-medium" style={{ color: 'var(--ink)' }}>
                            {lang === 'tr' ? th.tr : th.label}
                          </span>
                          {theme === th.id && (
                            <span className="ml-auto text-[10px] accent-text font-bold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Settings */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-1 rounded-[6px] px-2.5 py-1.5 transition-all"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(245,240,242,0.5))',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <Settings size={11} className="accent-text" />
                  {premium && <Crown size={10} className="accent-text" />}
                </button>
              </div>
            </header>

            {/* Marquee */}
            <div className="overflow-hidden py-1" style={{ background: 'linear-gradient(90deg, var(--accent-700), var(--accent-500), var(--accent-700))' }}>
              <div className="marquee-track text-[9px] tracking-[0.15em] font-semibold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {t.marquee}
              </div>
            </div>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 flex flex-col px-6 overflow-hidden">
          {/* Idle */}
          {!activeTab && !showRandom && !showSaved && (
            <div className="flex-1 flex flex-col justify-center gap-5 fade-in">
              <div className="gel-card rounded-[8px] p-6">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles size={12} className="accent-text" />
                  <p className="text-[9px] tracking-[0.2em] font-semibold accent-text">
                    {t.engine}
                  </p>
                </div>
                <h2 className="font-serif text-[28px] leading-[1.15]" style={{ color: 'var(--ink)' }}>
                  {lang === 'tr' ? (
                    <>Şarkın <span className="accent-text italic">ne</span><br /><span className="accent-text italic">hissettiriyor?</span></>
                  ) : (
                    <>What does your<br /><span className="accent-text italic">song</span> feel like?</>
                  )}
                </h2>
              </div>

              <p className="text-[13px] leading-relaxed px-1" style={{ color: 'var(--text-secondary)' }}>
                {t.heroDesc}
              </p>

              <div className="flex items-center justify-center gap-2 mt-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="rounded-full"
                    style={{
                      width: `${10 - i}px`,
                      height: `${10 - i}px`,
                      backgroundColor: 'var(--accent-400)',
                      opacity: 0.2 + i * 0.15,
                    }}
                  />
                ))}
                <span className="text-[10px] tracking-widest ml-2 accent-text">
                  {t.ready}
                </span>
              </div>

              {/* Random roll button */}
              <button
                type="button"
                onClick={handleRandomRoll}
                disabled={rolling}
                className="btn-gel-accent rounded-full py-3.5 text-[13px] font-bold tracking-[0.1em] text-white flex items-center justify-center gap-2 mt-3"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
              >
                {rolling ? (
                  <span className="flex items-center justify-center gap-2">
                    <Dices size={16} className="animate-spin" />
                    {t.analyzing}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Dices size={16} />
                    {t.random}
                  </span>
                )}
              </button>

              {/* Saved shortcut + credit hint */}
              <div className="flex items-center justify-between mt-1 px-1">
                <button
                  type="button"
                  onClick={() => { setShowSaved(true); setActiveTab(null); setShowRandom(false); }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold accent-text"
                >
                  <Bookmark size={12} />
                  {t.savedTab} {savedItems.length > 0 && `(${savedItems.length})`}
                </button>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {premium ? '∞' : credits} {t.creditsLeft}
                </span>
              </div>
            </div>
          )}

          {/* Saved view */}
          {showSaved && (
            <div className="flex-1 flex flex-col gap-3 fade-in py-3 overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowSaved(false)}
                className="btn-gel-silver rounded-full px-4 py-1.5 text-[11px] font-semibold self-start tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.back}
              </button>
              <h2 className="font-serif text-[24px] leading-tight accent-text">{t.savedTab}</h2>
              {savedItems.length === 0 ? (
                <div className="gel-card rounded-[8px] p-6 flex flex-col items-center gap-2 text-center mt-4">
                  <Bookmark size={24} className="accent-text opacity-40" />
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{t.savedEmpty}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{t.savedEmptyDesc}</p>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="btn-gel-silver rounded-full px-3 py-1 text-[10px] font-semibold self-end tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.clearAll}
                  </button>
                  {savedItems.map((it) => (
                    <div key={it.id} className="gel-card rounded-[8px] p-3 flex gap-3 items-start fade-in-stagger">
                      <img src={ALBUM_ART[it.seed % ALBUM_ART.length]} alt="Album" className="w-12 h-12 rounded-[5px] object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>{it.song}</p>
                        {it.artist && <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{it.artist}</p>}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-100)', color: 'var(--accent-700)' }}>{it.vibe}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-100)', color: 'var(--accent-700)' }}>{it.charName}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-100)', color: 'var(--accent-700)' }}>{it.feeling}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSaved(it.id)}
                        className="shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        aria-label={t.delete}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Random result */}
          {showRandom && randomResult && (
            <div className="flex-1 flex flex-col gap-3 fade-in py-3 overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowRandom(false)}
                className="btn-gel-silver rounded-full px-4 py-1.5 text-[11px] font-semibold self-start tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.back}
              </button>

              <div className="gel-card rounded-[8px] p-4">
                <div className="flex gap-3 items-center">
                  <img src={ALBUM_ART[randomResult.seed % ALBUM_ART.length]} alt="Album cover" className="w-16 h-16 rounded-[6px] object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="font-serif text-[19px] font-normal leading-tight break-words line-clamp-2" style={{ color: 'var(--ink)' }}>
                      {randomResult.song}
                    </p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {randomResult.artist}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {renderSingleCard(t.vibeLabel, Sparkles, randomResult.seed, 'VIBE')}
                {renderSingleCard(t.charLabel, Film, randomResult.seed, 'CHARACTER')}
                {renderSingleCard(t.feelingLabel, Heart, randomResult.seed, 'FEELING')}
              </div>

              <ShareButtons song={randomResult.song} artist={randomResult.artist} />

              {randomLocked && (
                <div className="gel-card rounded-[8px] p-3 flex flex-col items-center gap-1">
                  <Clock size={16} className="accent-text" />
                  <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{t.randomLimitDesc}</p>
                  <p className="text-[14px] font-mono font-bold accent-text tracking-widest">{fmtCountdown(randomMsLeft)}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowRandom(false)}
                className="btn-gel-silver rounded-full px-5 py-2 text-[11px] font-semibold self-start tracking-wide mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.back}
              </button>
            </div>
          )}

          {/* Search form */}
          {activeTab && !showResult && (
            <form onSubmit={handleAnalyze} className="flex-1 flex flex-col gap-5 fade-in pt-3">
              <button
                type="button"
                onClick={() => setActiveTab(null)}
                className="btn-gel-silver rounded-full px-4 py-1.5 text-[11px] font-semibold self-start tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.back}
              </button>

              <div className="gel-card rounded-[8px] p-5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {tabIcon && (() => { const Icon = tabIcon; return <Icon size={11} className="accent-text" />; })()}
                  <p className="text-[9px] tracking-[0.2em] font-semibold accent-text">
                    {(activeTab === 'VIBE' ? t.vibeBlurb : activeTab === 'CHARACTER' ? t.charBlurb : t.feelingBlurb).toUpperCase()}
                  </p>
                </div>
                <h2 className="font-serif text-[30px] leading-tight capitalize accent-text">
                  {activeTab.toLowerCase()}
                </h2>
              </div>

              {!analyzing && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-widest font-semibold accent-text">
                  {t.trackName}
                </label>
                <div className="gel-inset rounded-[6px] px-4 py-3.5 flex items-center gap-2.5">
                  <Search size={16} className="accent-text" />
                  <input
                    type="text"
                    placeholder={t.placeholder}
                    value={songInput}
                    onChange={(e) => {
                      setSongInput(e.target.value);
                      setSelectedArtist('');
                      debouncedSearch(e.target.value, setITunesResults);
                    }}
                    autoFocus
                    className="flex-1 bg-transparent text-[15px] outline-none font-medium"
                    style={{ color: 'var(--ink)', caretColor: 'var(--accent-500)' }}
                  />
                </div>
                {itunesResults.length > 0 && (
                  <div className="flex flex-col gap-1 mt-2 max-h-[200px] overflow-y-auto rounded-[8px] p-1" style={{ background: 'rgba(255,255,255,0.35)' }}>
                    {itunesResults.map((song, idx) => (
                      <button
                        key={`${song.trackId}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSongInput(song.trackName);
                          setSelectedArtist(song.artistName);
                          setSelectedArtwork(song.artworkUrl100 ? song.artworkUrl100.replace('100x100', '300x300') : null);
                          setITunesResults([]);
                        }}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-white/70 transition-colors fade-in-stagger"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        {song.artworkUrl100 ? (
                          <img src={song.artworkUrl100} alt="" className="w-8 h-8 rounded-[4px] object-cover shrink-0" />
                        ) : (
                          <Music2 size={16} className="accent-text shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold truncate leading-tight" style={{ color: 'var(--ink)' }}>{song.trackName}</p>
                          <p className="text-[10px] truncate leading-tight" style={{ color: 'var(--text-secondary)' }}>{song.artistName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              )}

              <button
                type="submit"
                disabled={!songInput.trim() || analyzing}
                className="btn-gel-accent mt-auto mb-4 rounded-full py-4 text-[14px] font-bold tracking-[0.1em] text-white"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    {t.analyzing}
                  </span>
                ) : (
                  t.analyze
                )}
              </button>
            </form>
          )}

          {/* Result */}
          {showResult && activeTab && (
            <div className="flex-1 flex flex-col gap-3.5 fade-in py-3 overflow-y-auto">
              <div className="gel-card rounded-[8px] p-4">
                <div className="flex gap-3 items-center">
                  <img src={albumArt} alt="Album cover" className="w-16 h-16 rounded-[6px] object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="font-serif text-[19px] font-normal leading-tight break-words line-clamp-2" style={{ color: 'var(--ink)' }}>
                      {songInput}
                    </p>
                    {(selectedArtist || findArtist(songInput)) && (
                      <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {selectedArtist || findArtist(songInput)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {renderResult(activeTab)}

              {aiError && (
                <div className="gel-inset rounded-[8px] px-3 py-2 flex items-center gap-2 fade-in">
                  <Sparkles size={11} className="opacity-50" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{t.aiError}</p>
                </div>
              )}

              <ShareButtons song={songInput} artist={selectedArtist || findArtist(songInput)} />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className={`btn-gel-silver rounded-full px-4 py-2 text-[11px] font-semibold tracking-wide flex items-center gap-1.5 ${saveFlash ? 'accent-text' : ''}`}
                  style={{ color: saveFlash ? 'var(--accent-600)' : 'var(--text-secondary)' }}
                >
                  {saveFlash ? <Bookmark size={12} fill="currentColor" /> : <Bookmark size={12} />}
                  {saveFlash ? t.saved : t.save}
                </button>
                <button
                  type="button"
                  onClick={handleTryAnother}
                  className="btn-gel-silver rounded-full px-5 py-2 text-[11px] font-semibold tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t.tryAnother}
                </button>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{premium ? '∞' : credits} {t.creditsLeft}</span>
            </div>
          )}

        </main>

        {/* Ad modal */}
        {showAd && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 fade-in" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="gel-card rounded-[8px] p-6 flex flex-col items-center gap-3 max-w-[80%] text-center">
              {adDone ? (
                <>
                  <Zap size={28} className="accent-text" />
                  <p className="text-[14px] font-bold accent-text">{t.adDone}</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <p className="text-[12px] text-white">{t.adWatching}</p>
                  <p className="text-[28px] font-mono font-bold text-white">{adCountdown}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Paywall / out-of-credits modal */}
        {showPaywall && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 fade-in" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowPaywall(false)}>
            <div className="gel-card rounded-[12px] p-6 flex flex-col gap-4 max-w-[85%]" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setShowPaywall(false)} className="self-end p-1 rounded-full hover:bg-black/5" style={{ color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
              <div className="flex flex-col items-center gap-2 text-center">
                <Crown size={28} className="accent-text" />
                <p className="text-[14px] font-bold" style={{ color: 'var(--ink)' }}>{t.outOfCredits}</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowPaywall(false); handleWatchAd(); }}
                className="btn-gel-accent rounded-full py-3 text-[12px] font-bold tracking-wide text-white flex items-center justify-center gap-2"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
              >
                <Zap size={14} />
                {t.watchAd}
              </button>
              <div className="gel-card rounded-[8px] p-3 flex flex-col gap-1.5 text-center">
                <p className="text-[11px] font-bold accent-text">{t.proSoon}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{t.proDesc}</p>
              </div>
            </div>
          </div>
        )}

        {/* Full-screen settings */}
        {showSettings && (
          <div className="absolute inset-0 z-50 flex flex-col fade-in" style={{ background: 'linear-gradient(180deg, var(--bg-start) 0%, var(--bg-end) 100%)' }}>
            <header className="shrink-0 px-5 pt-5 pb-3 flex items-center justify-between">
              <h2 className="font-serif text-[20px] lowercase" style={{ color: 'var(--ink)' }}>{t.settings}</h2>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 transition-all"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(245,240,242,0.5))', border: '1px solid var(--card-border)' }}
              >
                <X size={14} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.close}</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-4">
              {/* Credits / Thanks */}
              <div className="gel-card rounded-[10px] p-5 fade-in-stagger">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={13} className="accent-text" fill="currentColor" />
                  <span className="text-[10px] tracking-[0.2em] font-bold accent-text">{t.credits}</span>
                </div>
                <h3 className="font-serif text-[24px] leading-tight mb-1" style={{ color: 'var(--ink)' }}>{t.creditsTitle}</h3>
                <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{t.creditsDesc}</p>
                <div className="flex flex-col gap-2.5">
                  {CREDITS.map((c, i) => (
                    <div key={i} className="fade-in-stagger" style={{ animationDelay: `${i * 60}ms` }}>
                      <p className="text-[13px] font-bold leading-tight" style={{ color: 'var(--ink)' }}>{c.name}</p>
                      <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{c.role[lang]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thank you */}
              <div className="gel-card rounded-[10px] p-5 fade-in-stagger">
                <p className="text-[11px] leading-relaxed text-center" style={{ color: 'var(--text-secondary)' }}>
                  {lang === 'tr' ? 'Her şey için teşekkürler' : 'Thank you for everything'}
                </p>
                <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mt-2">
                  {THANK_YOU.map((name, i) => (
                    <span key={i} className="font-serif text-[18px] accent-text">{name}{i < THANK_YOU.length - 1 ? ',' : ''}</span>
                  ))}
                </div>
              </div>

              {/* Code */}
              <div className="gel-card rounded-[10px] p-4 fade-in-stagger">
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound size={13} className="accent-text" />
                  <span className="text-[10px] tracking-[0.2em] font-bold accent-text">{t.code}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCodeApply(); } }}
                    placeholder={t.codePlaceholder}
                    className="gel-inset rounded-[8px] px-3 py-2.5 text-[13px] outline-none font-medium w-full"
                    style={{ color: 'var(--ink)', caretColor: 'var(--accent-500)' }}
                  />
                  <button
                    type="button"
                    onClick={handleCodeApply}
                    className="btn-gel-accent rounded-[8px] px-4 py-2.5 text-[12px] font-bold text-white w-full"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                  >
                    {t.codeApply}
                  </button>
                </div>
                {codeMsg && (
                  <p className="text-[11px] mt-2 font-semibold fade-in" style={{ color: codeMsg.ok ? 'var(--accent-600)' : 'var(--text-secondary)' }}>
                    {codeMsg.text}
                  </p>
                )}
                {premium && (
                  <div className="gel-inset rounded-[8px] px-3 py-2 mt-3 flex items-center gap-1.5">
                    <Crown size={13} className="accent-text" />
                    <span className="text-[11px] font-bold accent-text tracking-wide">PREMIUM</span>
                    <span className="ml-auto text-[11px] font-bold" style={{ color: 'var(--ink)' }}>∞</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === BOTTOM NAV === */}
        <footer className="shrink-0 px-5 pb-6 pt-3">
            <nav className="flex gap-2 mb-3">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                const Icon = TAB_ICON[tab];
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={`flex-1 py-3 rounded-full text-[12px] font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                      isActive ? 'btn-gel-accent' : 'btn-gel-silver'
                    }`}
                    style={
                      isActive
                        ? { color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }
                        : { color: 'var(--text-secondary)' }
                    }
                  >
                    <Icon size={12} />
                    {tab}
                  </button>
                );
              })}
            </nav>

        </footer>
      </div>
    </div>
  );
}

export default App;
