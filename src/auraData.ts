export type TabId = 'VIBE' | 'CHARACTER' | 'FEELING';
export type Lang = 'tr' | 'en';
export type ThemeId = 'bordo' | 'ocean' | 'lime';

type Localized = { tr: string; en: string };

const VIBES_TR = [
  'gece yarısı ağlarken içilen sigara',
  'ilk sex sonrası utangaç sessizlik',
  'yağmurlu camdan dışarıya bakmak',
  'partiden ayrılırken gelen pişmanlık',
  'eski mesajları geri okumak',
  'sabaha karşı uyanıp ne yaptığını hatırlamamak',
  'kışın ilk sıcak çikolatası',
  'arkadaşınla kavga edip barışmamak',
  'yolda yürürken kulaklıkta patlayan şarkı',
  'eski aşık mektubu okumak',
  'deniz kenarında güneş batarken sigara',
  'kalabalıkta yalnız hissetmek',
  'liseden kalma karışık kaset',
  'sarhoşken aranılan eski sevgili',
  'sabaha karşı mutfakta oturmak',
  'yeni taşınılan boş evde yankılanan müzik',
  'panjur aralığından süzülen ışık',
  'dolaptaki eski fotoğrafları bulmak',
  'sonbaharda ıslak yaprak sesi',
  'gece yarısı ani enerji patlaması',
];

const VIBES_EN = [
  'cigarette at 3am while crying',
  'the shy silence after your first time',
  'staring out a rain-streaked window',
  'leaving the party and feeling instant regret',
  're-reading old text messages',
  'waking up at 5am not remembering what you did',
  'first hot chocolate of winter',
  'fighting your bestie and not making up',
  'the song that hits different walking home',
  'finding an old love letter',
  'smoking at the beach during sunset',
  'feeling lonely in a crowded room',
  'a dusty old mixtape from high school',
  'drunk-calling your ex at 2am',
  'sitting in the kitchen at 4am',
  'music echoing in an empty new apartment',
  'light slipping through half-closed blinds',
  'finding old photos in the back of a drawer',
  'the sound of wet leaves in autumn',
  'a sudden burst of energy at midnight',
];

const CHARACTERS = [
  { name: 'Mia Wallace', source: 'Pulp Fiction', note: { tr: 'zarif, meraklı, tehlikeli', en: 'elegant, curious, dangerous' } },
  { name: 'Driver', source: 'Drive', note: { tr: 'sessiz, yoğun, karanlık', en: 'quiet, intense, dark' } },
  { name: 'Catherine Tramell', source: 'Basic Instinct', note: { tr: 'soğuk, baştan çıkarıcı, kontrol', en: 'cold, seductive, controlling' } },
  { name: 'Patrick Bateman', source: 'American Psycho', note: { tr: 'farksız, takıntılı, maske', en: 'detached, obsessive, mask' } },
  { name: 'Betty Draper', source: 'Mad Men', note: { tr: 'kırılgan, mükemmeliyetçi, sıkışmış', en: 'fragile, perfectionist, trapped' } },
  { name: 'Tony Soprano', source: 'The Sopranos', note: { tr: 'çelişkili, otorite, yumuşak iç', en: 'conflicted, authority, soft inside' } },
  { name: 'Skyler White', source: 'Breaking Bad', note: { tr: 'pratik, boğucu, ahlaklı', en: 'practical, suffocating, moral' } },
  { name: 'Diane Selwyn', source: 'Mulholland Drive', note: { tr: 'rüya gibi, trajik, kayıp', en: 'dreamlike, tragic, lost' } },
  { name: 'Elio', source: 'Call Me By Your Name', note: { tr: 'arzulu, yaz tatili, nostaljik', en: 'desiring, summer romance, nostalgic' } },
  { name: 'Marla Singer', source: 'Fight Club', note: { tr: 'isyan, kaos, umursamaz', en: 'rebellion, chaos, careless' } },
  { name: 'Don Draper', source: 'Mad Men', note: { tr: 'karizmatik, boş, kaçış', en: 'charismatic, empty, escaping' } },
  { name: 'Rust Cohle', source: 'True Detective', note: { tr: 'felsefi, karanlık, yalnız', en: 'philosophical, dark, lonely' } },
  { name: 'Hannibal Lecter', source: 'Hannibal', note: { tr: 'zarif, tehlikeli, estet', en: 'refined, dangerous, aesthetic' } },
  { name: 'Amy Dunne', source: 'Gone Girl', note: { tr: 'hesaplı, soğuk, intikam', en: 'calculated, cold, vengeful' } },
  { name: 'Rebecca Bunch', source: 'Crazy Ex-Girlfriend', note: { tr: 'takıntılı, komik, dürüst', en: 'obsessive, funny, honest' } },
  { name: 'Thomas Shelby', source: 'Peaky Blinders', note: { tr: 'sakin, hesaplı, ağır', en: 'calm, calculating, heavy' } },
  { name: 'Walter White', source: 'Breaking Bad', note: { tr: 'gurur, dönüşüm, yıkım', en: 'pride, transformation, destruction' } },
  { name: 'Effy Stonem', source: 'Skins', note: { tr: 'gizemli, yıkıcı, kayıp', en: 'mysterious, destructive, lost' } },
  { name: 'Spike Spiegel', source: 'Cowboy Bebop', note: { tr: 'cool, yalnız, melankolik', en: 'cool, lonely, melancholic' } },
  { name: 'Nana Osaki', source: 'NANA', note: { tr: 'asi, tutkulu, kırılgan', en: 'rebellious, passionate, fragile' } },
  { name: 'Rei Ayanami', source: 'Neon Genesis Evangelion', note: { tr: 'sessiz, uzak, gizemli', en: 'quiet, distant, mysterious' } },
  { name: 'Howl', source: "Howl's Moving Castle", note: { tr: 'romantik, gösterişli, kaçak', en: 'romantic, flamboyant, runaway' } },
  { name: 'L', source: 'Death Note', note: { tr: 'tuhaf, zeki, takıntılı', en: 'strange, brilliant, obsessive' } },
  { name: 'Mima Kirigoe', source: 'Perfect Blue', note: { tr: 'gerilimli, parçalı, rüya gibi', en: 'tense, fractured, dreamlike' } },
  { name: 'Violet Evergarden', source: 'Violet Evergarden', note: { tr: 'zarif, iyileşen, özlemli', en: 'graceful, healing, yearning' } },
  { name: 'Mikasa Ackerman', source: 'Attack on Titan', note: { tr: 'sadık, sert, koruyucu', en: 'loyal, fierce, protective' } },
  { name: 'Asuka Langley', source: 'Neon Genesis Evangelion', note: { tr: 'iddialı, yaralı, yoğun', en: 'bold, wounded, intense' } },
];

const FEELINGS = [
  { title: { tr: 'Hüzün', en: 'Sorrow' }, desc: { tr: 'Göğsünde oturan, ağır ama tanıdık bir ağırlık', en: 'A heavy but familiar weight sitting on your chest' } },
  { title: { tr: 'Arzu', en: 'Desire' }, desc: { tr: 'Bir şeyi çok istemek ama elde edememek', en: 'Wanting something so badly you can\'t have it' } },
  { title: { tr: 'Nostalji', en: 'Nostalgia' }, desc: { tr: 'Geçmişe özlem, tatlı acı', en: 'A bittersweet longing for the past' } },
  { title: { tr: 'Öfke', en: 'Rage' }, desc: { tr: 'Sessizce kaynayan, yüzeye çıkmayan bir kızgınlık', en: 'A simmering anger that never reaches the surface' } },
  { title: { tr: 'Huzur', en: 'Peace' }, desc: { tr: 'Düşüncelerin yavaşladığı, nefes aldığın an', en: 'The moment your thoughts slow and you breathe' } },
  { title: { tr: 'Yalnızlık', en: 'Loneliness' }, desc: { tr: 'Kalabalıkta bile hissedilen, derin bir boşluk', en: 'A deep emptiness felt even in a crowd' } },
  { title: { tr: 'Coşku', en: 'Euphoria' }, desc: { tr: 'Göğsünü kabartan, hareket ettiren enerji', en: 'A swelling energy that moves you' } },
  { title: { tr: 'Korku', en: 'Dread' }, desc: { tr: 'Bilinmeyene karşı, midede hissedilen gerilim', en: 'A tension in your gut toward the unknown' } },
  { title: { tr: 'Aşk', en: 'Love' }, desc: { tr: 'Her şeyin mümkün göründüğü, saf bir güven', en: 'A pure trust where anything feels possible' } },
  { title: { tr: 'Kıskançlık', en: 'Jealousy' }, desc: { tr: 'Başkasının sahip olduğuna özlem ve kızgınlık karışımı', en: 'A mix of longing and resentment toward what others have' } },
  { title: { tr: 'Umut', en: 'Hope' }, desc: { tr: 'Karanlıkta bir ışık, hafif ama inatçı', en: 'A light in the dark, faint but stubborn' } },
  { title: { tr: 'Melankoli', en: 'Melancholy' }, desc: { tr: 'Güzellikle karışık, sürekli bir hüzün hali', en: 'A persistent sadness mixed with beauty' } },
  { title: { tr: 'Özgürlük', en: 'Freedom' }, desc: { tr: 'Bağların kalktığı, hafiflik hissi', en: 'The lightness of chains falling away' } },
  { title: { tr: 'Vicdan azabı', en: 'Guilt' }, desc: { tr: 'Yapılan bir şeyin sonra gelen hesaplaşması', en: 'The reckoning that follows something you did' } },
  { title: { tr: 'Tutku', en: 'Passion' }, desc: { tr: 'Kontrolü kaybeden, yoğun bir istek', en: 'An intense desire that loses control' } },
  { title: { tr: 'Kabulleniş', en: 'Acceptance' }, desc: { tr: 'Direnmeyi bırakıp, olduğuyla barışmak', en: 'Stopping the fight and making peace with what is' } },
  { title: { tr: 'Gizem', en: 'Mystery' }, desc: { tr: 'Merak ve belirsizliğin uyandırdığı çekim', en: 'The pull of curiosity and uncertainty' } },
  { title: { tr: 'İsyan', en: 'Rebellion' }, desc: { tr: 'Kurallara ve düzene karşı içten gelen başkaldırı', en: 'A rising against rules and order from within' } },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickThree<T>(pool: T[], seed: number): T[] {
  const result: T[] = [];
  const indices = new Set<number>();
  let current = seed;
  while (indices.size < 3 && indices.size < pool.length) {
    current = (current * 1103515245 + 12345) & 0x7fffffff;
    const idx = current % pool.length;
    if (!indices.has(idx)) {
      indices.add(idx);
      result.push(pool[idx]);
    }
  }
  return result;
}

const UI: Record<Lang, Record<string, string>> = {
  tr: {
    online: 'AKTİF',
    engine: 'DAISY ENGINE',
    heroLine1: 'Şarkın',
    heroLine2: 'ne hissettiriyor?',
    heroDesc: 'Bir şarkı gir. Ritmini, sözlerini ve enerjisini okur — sonra vibe, karakter ve duygu olarak sana geri verir.',
    ready: 'hazır',
    back: '‹ geri',
    trackName: 'ŞARKI ADI',
    placeholder: 'örn. Redbone',
    analyzing: 'okuyor...',
    analyze: 'Analiz et',
    aura: 'DAISY',
    tryAnother: '‹ başka şarkı',
    screenshot: 'ekran görüntüsü',
    tapExit: 'çık için dokun',
    vibeBlurb: 'Vibe & enerji',
    charBlurb: 'Film / dizi / anime karakteri',
    feelingBlurb: 'Hissettirdiği duygular',
    marquee: '◆ DAISY ENGINE ◆ ŞARKININ RUHUNU OKU ◆ VIBE / KARAKTER / DUYGU ◆',
    random: 'random',
    rollAgain: '‹ tekrar at',
    vibeLabel: 'VIBE',
    charLabel: 'KARAKTER',
    feelingLabel: 'DUYGU',
    shareLabel: 'PAYLAŞ',
    randomLimit: 'Bugünlük bitti',
    randomLimitDesc: 'Random 24 saatte bir açılır',
    randomIn: 'Kalan süre',
    save: 'Kaydet',
    saved: 'Kaydedildi',
    savedTab: 'KAYITLAR',
    savedEmpty: 'Henüz kayıtlı sonuç yok',
    savedEmptyDesc: 'Analiz ettiğin şarkıları burada biriktir',
    delete: 'Sil',
    creditsLeft: 'kalan hak',
    outOfCredits: 'Bugünlük hakların bitti',
    watchAd: 'Reklam izle (+3 hak)',
    adWatching: 'reklam oynuyor...',
    adDone: '3 hak eklendi!',
    goPro: 'Sınırsız için abone ol',
    proSoon: 'Abonelik yakında',
    proDesc: 'Sınırsız analiz, reklamsız deneyim.',
    close: 'Kapat',
    clearAll: 'Tümünü sil',
    settings: 'Ayarlar',
    credits: 'Teşekkürler',
    creditsTitle: 'Yardımcı Olanlar',
    creditsDesc: 'Bu projeye katkı veren herkese özel teşekkürler.',
    creditsHeart: 'Kalbim sizinle.',
    volume: 'Ses',
    volumeHint: 'Analizde şarkının güzel kısmı çalacak',
    code: 'Kod',
    codePlaceholder: 'Kod gir...',
    codeApply: 'Uygula',
    codeWrong: 'Geçersiz kod',
    premiumOn: 'Premium aktif!',
    premiumOff: 'Premium kapatıldı',
    aiError: 'AI analizi başarısız oldu, yerel veriyle gösteriliyor',
    loadingAudio: 'ses bulunuyor...',
    loadingAnalysis: 'analiz ediliyor...',
    nowPlaying: 'şimdi çalıyor',
    audioError: 'Ses yüklenemedi',
  },
  en: {
    online: 'ONLINE',
    engine: 'DAISY ENGINE',
    heroLine1: 'What does your',
    heroLine2: 'song feel like?',
    heroDesc: 'Type a track. It reads the rhythm, lyrics and energy — then gives it back as vibe, character and feeling.',
    ready: 'ready',
    back: '‹ back',
    trackName: 'TRACK NAME',
    placeholder: 'e.g. Redbone',
    analyzing: 'reading...',
    analyze: 'Analyze',
    aura: 'DAISY',
    tryAnother: '‹ try another',
    screenshot: 'screenshot',
    tapExit: 'tap to exit',
    vibeBlurb: 'Vibe & energy',
    charBlurb: 'Movie / TV / anime character',
    feelingBlurb: 'What it makes you feel',
    marquee: '◆ DAISY ENGINE ◆ READ YOUR SONG\'S SOUL ◆ VIBE / CHARACTER / FEELING ◆',
    random: 'random',
    rollAgain: '‹ roll again',
    vibeLabel: 'VIBE',
    charLabel: 'CHARACTER',
    feelingLabel: 'FEELING',
    shareLabel: 'SHARE',
    randomLimit: 'Done for today',
    randomLimitDesc: 'Random opens once every 24 hours',
    randomIn: 'Time left',
    save: 'Save',
    saved: 'Saved',
    savedTab: 'SAVED',
    savedEmpty: 'No saved results yet',
    savedEmptyDesc: 'Analyzed songs will be collected here',
    delete: 'Delete',
    creditsLeft: 'credits left',
    outOfCredits: "You're out of credits today",
    watchAd: 'Watch ad (+3 credits)',
    adWatching: 'playing ad...',
    adDone: '3 credits added!',
    goPro: 'Subscribe for unlimited',
    proSoon: 'Subscription coming soon',
    proDesc: 'Unlimited analyses, ad-free experience.',
    close: 'Close',
    clearAll: 'Clear all',
    settings: 'Settings',
    credits: 'Thanks',
    creditsTitle: 'Contributors',
    creditsDesc: 'Special thanks to everyone who contributed to this project.',
    creditsHeart: 'With love.',
    volume: 'Volume',
    volumeHint: 'The song\'s best part will play during analysis',
    code: 'Code',
    codePlaceholder: 'Enter code...',
    codeApply: 'Apply',
    codeWrong: 'Invalid code',
    premiumOn: 'Premium activated!',
    premiumOff: 'Premium disabled',
    aiError: 'AI analysis failed, showing local data',
    loadingAudio: 'finding audio...',
    loadingAnalysis: 'analyzing...',
    nowPlaying: 'now playing',
    audioError: 'Audio failed to load',
  },
};

const ALBUM_ART = [
  'https://images.pexels.com/photos/10522613/pexels-photo-10522613.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/16251531/pexels-photo-16251531.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/16015743/pexels-photo-16015743.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const SONG_SUGGESTIONS = [
  { title: 'Redbone', artist: 'Childish Gambino' },
  { title: 'Nights', artist: 'Frank Ocean' },
  { title: 'Cellophane', artist: 'FKA twigs' },
  { title: '505', artist: 'Arctic Monkeys' },
  { title: 'The Less I Know The Better', artist: 'Tame Impala' },
  { title: 'After Dark', artist: 'Mr.Kitty' },
];

const CREDITS = [
  { name: 'iTunes API', role: { tr: 'Şarkı arama & albüm kapakları', en: 'Song search & album artwork' } },
  { name: 'Tavily', role: { tr: 'Web araması ile şarkı bağlamı', en: 'Web search for song context' } },
  { name: 'Gemini AI', role: { tr: 'Şarkı analizi & içerik üretimi', en: 'Song analysis & content generation' } },
];

const THANK_YOU = ['Cemre', 'Must', 'Yus', 'Esma', 'Deniz'];

export { VIBES_TR, VIBES_EN, CHARACTERS, FEELINGS, ALBUM_ART, SONG_SUGGESTIONS, CREDITS, THANK_YOU, pickThree, hashString, UI };
