/* Matikkaseikkailu – lasten matematiikkapeli.
   Pelkkää selaimen JavaScriptiä, ei riippuvuuksia eikä build-vaihetta. */
(() => {
  'use strict';

  // ======================================================================
  // Apuvälineet
  // ======================================================================
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const times = (n, v) => Array.from({ length: Math.max(0, n) }, () => v);
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ======================================================================
  // SVG-grafiikka
  // ======================================================================
  const INK = '#3A3A4A';

  function starPath(cx, cy, R, r, n = 5) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const ang = -Math.PI / 2 + (i * Math.PI) / n;
      const rad = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + rad * Math.cos(ang)).toFixed(1) + ' ' + (cy + rad * Math.sin(ang)).toFixed(1);
    }
    return d + 'Z';
  }

  const STAR_SVG = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="${starPath(20, 21, 17, 7.5)}" fill="#F2C14E" stroke="#E0A93A" stroke-width="2" stroke-linejoin="round"/></svg>`;

  const eye = (x, y, r = 4.5) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.38}" r="${r * 0.33}" fill="#fff"/>`;
  const smile = (x1, y, x2, depth = 4) =>
    `<path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + depth} ${x2} ${y}" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const blush = (x, y, c = '#F2B8A0') => `<circle cx="${x}" cy="${y}" r="4.5" fill="${c}" opacity=".7"/>`;

  const CHARACTERS = [
    {
      id: 'kettu', name: 'Kettu',
      svg: `<path d="M22 14 L44 34 L24 48Z" fill="#E8955A"/><path d="M27 22 L38 34 L28 42Z" fill="#FBE3D0"/>
        <path d="M78 14 L56 34 L76 48Z" fill="#E8955A"/><path d="M73 22 L62 34 L72 42Z" fill="#FBE3D0"/>
        <ellipse cx="50" cy="56" rx="32" ry="27" fill="#E8955A"/>
        <path d="M19 58 Q34 66 50 66 Q66 66 81 58 Q74 86 50 88 Q26 86 19 58Z" fill="#FFF6EC"/>
        ${eye(38, 50)}${eye(62, 50)}
        <ellipse cx="50" cy="68" rx="5" ry="3.6" fill="${INK}"/>
        ${smile(45, 76, 55, 3.5)}${blush(28, 64)}${blush(72, 64)}`,
    },
    {
      id: 'pupu', name: 'Pupu',
      svg: `<ellipse cx="38" cy="26" rx="9" ry="22" fill="#EEE8F3"/><ellipse cx="38" cy="27" rx="4.5" ry="15" fill="#F5C6D3"/>
        <ellipse cx="62" cy="26" rx="9" ry="22" fill="#EEE8F3"/><ellipse cx="62" cy="27" rx="4.5" ry="15" fill="#F5C6D3"/>
        <circle cx="50" cy="62" r="28" fill="#EEE8F3"/>
        ${eye(40, 58)}${eye(60, 58)}
        <path d="M46 66 L54 66 L50 70Z" fill="#E7909F"/>
        <path d="M50 70 L50 73 M44 74 Q47 77 50 73 Q53 77 56 74" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        ${blush(32, 68, '#F5C6D3')}${blush(68, 68, '#F5C6D3')}`,
    },
    {
      id: 'lohikaarme', name: 'Lohikäärme',
      svg: `<path d="M34 36 L29 13 L43 31Z" fill="#F2D38A"/><path d="M66 36 L71 13 L57 31Z" fill="#F2D38A"/>
        <path d="M43 32 L50 21 L57 32Z" fill="#6FB585"/>
        <ellipse cx="50" cy="56" rx="31" ry="27" fill="#8CCB9B"/>
        <ellipse cx="50" cy="70" rx="18" ry="11" fill="#BFE5C7"/>
        <circle cx="44" cy="67" r="1.8" fill="#4E7F5D"/><circle cx="56" cy="67" r="1.8" fill="#4E7F5D"/>
        ${eye(38, 49)}${eye(62, 49)}
        ${smile(44, 74, 56, 3.5)}${blush(25, 60)}${blush(75, 60)}`,
    },
    {
      id: 'robotti', name: 'Robotti',
      svg: `<line x1="50" y1="16" x2="50" y2="29" stroke="#8AA3BD" stroke-width="3"/><circle cx="50" cy="14" r="5" fill="#F2C14E"/>
        <rect x="13" y="48" width="9" height="18" rx="3" fill="#8AA3BD"/><rect x="78" y="48" width="9" height="18" rx="3" fill="#8AA3BD"/>
        <rect x="20" y="28" width="60" height="56" rx="14" fill="#AFC6DE"/>
        <rect x="28" y="37" width="44" height="32" rx="9" fill="#EEF4FA"/>
        ${eye(40, 51, 5)}${eye(60, 51, 5)}
        ${smile(43, 61, 57, 4)}
        <circle cx="36" cy="77" r="2.6" fill="#E8955A"/><circle cx="44" cy="77" r="2.6" fill="#8CCB9B"/><rect x="54" y="75" width="12" height="4" rx="2" fill="#8AA3BD"/>`,
    },
    {
      id: 'pollo', name: 'Pöllö',
      svg: `<path d="M23 34 L28 12 L41 27Z" fill="#A68565"/><path d="M77 34 L72 12 L59 27Z" fill="#A68565"/>
        <ellipse cx="50" cy="56" rx="31" ry="32" fill="#B89A7A"/>
        <ellipse cx="50" cy="70" rx="18" ry="17" fill="#E8D9C4"/>
        <path d="M43 66 q3 3 6 0 M51 66 q3 3 6 0 M47 73 q3 3 6 0" stroke="#CDB797" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle cx="38" cy="46" r="12" fill="#FFFDF8"/><circle cx="62" cy="46" r="12" fill="#FFFDF8"/>
        ${eye(38, 46, 6)}${eye(62, 46, 6)}
        <path d="M45 56 L55 56 L50 63Z" fill="#E8A55A"/>`,
    },
    {
      id: 'kissa', name: 'Kissa',
      svg: `<path d="M21 22 L43 34 L24 50Z" fill="#B7B9CC"/><path d="M27 29 L37 35 L28 43Z" fill="#F5C6D3"/>
        <path d="M79 22 L57 34 L76 50Z" fill="#B7B9CC"/><path d="M73 29 L63 35 L72 43Z" fill="#F5C6D3"/>
        <ellipse cx="50" cy="58" rx="31" ry="27" fill="#B7B9CC"/>
        ${eye(39, 54)}${eye(61, 54)}
        <path d="M47 63 L53 63 L50 66Z" fill="#E7909F"/>
        <path d="M50 66 Q47 71 44 69 M50 66 Q53 71 56 69" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M30 63 L15 60 M30 67 L15 69 M70 63 L85 60 M70 67 L85 69" stroke="#8D8FA6" stroke-width="1.8" stroke-linecap="round"/>
        ${blush(31, 70, '#F5C6D3')}${blush(69, 70, '#F5C6D3')}`,
    },
  ];
  const charSVG = (id) => {
    const c = CHARACTERS.find((x) => x.id === id) || CHARACTERS[0];
    return `<svg viewBox="0 0 100 100" role="img" aria-label="${c.name}">${c.svg}</svg>`;
  };

  // Kukan terälehdet lasketaan valmiiksi
  const petals = [0, 1, 2, 3, 4].map((i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return `<circle cx="${(20 + 7.5 * Math.cos(a)).toFixed(1)}" cy="${(16 + 7.5 * Math.sin(a)).toFixed(1)}" r="6" fill="#F2A7C3"/>`;
  }).join('');

  const ITEMS = {
    omena: { part: 'omenaa', svg: `<circle cx="20" cy="23" r="13" fill="#E07A6F"/><path d="M20 11 Q21 6 24 4" stroke="#7A5C45" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="27" cy="9" rx="5" ry="2.6" fill="#7DBB7A" transform="rotate(-25 27 9)"/><circle cx="15" cy="19" r="3" fill="#fff" opacity=".35"/>` },
    sieni: { part: 'sientä', svg: `<rect x="15" y="20" width="10" height="15" rx="4" fill="#F3E6D3"/><path d="M4 23 Q4 6 20 6 Q36 6 36 23Z" fill="#D9776B"/><circle cx="13" cy="15" r="2.6" fill="#fff"/><circle cx="23" cy="11" r="2.1" fill="#fff"/><circle cx="28" cy="18" r="2.3" fill="#fff"/>` },
    kukka: { part: 'kukkaa', svg: `<path d="M20 22 L20 37" stroke="#7DBB7A" stroke-width="3" stroke-linecap="round"/><ellipse cx="26" cy="31" rx="5" ry="2.5" fill="#7DBB7A" transform="rotate(-30 26 31)"/>${petals}<circle cx="20" cy="16" r="5" fill="#F6D365"/>` },
    kala: { part: 'kalaa', svg: `<path d="M27 20 L37 12 L36 28Z" fill="#F2A65A"/><ellipse cx="17" cy="20" rx="14" ry="10" fill="#F5B36E"/><path d="M20 11 Q23 20 20 29" stroke="#E8955A" stroke-width="2" fill="none"/><circle cx="10" cy="18" r="2.2" fill="${INK}"/>` },
    meritahti: { part: 'meritähteä', svg: `<path d="${starPath(20, 21, 17, 7.5)}" fill="#F4A3A3" stroke="#E58C8C" stroke-width="1.5" stroke-linejoin="round"/><circle cx="20" cy="20" r="1.5" fill="#fff" opacity=".7"/><circle cx="20" cy="12" r="1.2" fill="#fff" opacity=".7"/>` },
    simpukka: { part: 'simpukkaa', svg: `<path d="M20 34 L6 18 Q8 6 20 6 Q32 6 34 18Z" fill="#F5CDB0"/><path d="M20 33 L12 9 M20 33 L20 6 M20 33 L28 9" stroke="#E3A988" stroke-width="1.6"/><rect x="15" y="31" width="10" height="5" rx="2.5" fill="#E3A988"/>` },
    tahti: { part: 'tähteä', svg: `<path d="${starPath(20, 21, 17, 7.5)}" fill="#F6D365" stroke="#E8BE4E" stroke-width="1.5" stroke-linejoin="round"/>` },
    planeetta: { part: 'planeettaa', svg: `<circle cx="20" cy="20" r="11" fill="#A9B8EC"/><circle cx="16" cy="16" r="2.5" fill="#fff" opacity=".35"/><ellipse cx="20" cy="21" rx="18" ry="5" fill="none" stroke="#E9C46A" stroke-width="2.5" transform="rotate(-15 20 21)"/>` },
    raketti: { part: 'rakettia', svg: `<path d="M20 3 Q30 12 28 27 L12 27 Q10 12 20 3Z" fill="#E9EEF5" stroke="#B9C4D6" stroke-width="1.5"/><circle cx="20" cy="15" r="4" fill="#9FC3E8"/><path d="M12 19 L6 30 L12 28Z" fill="#E07A6F"/><path d="M28 19 L34 30 L28 28Z" fill="#E07A6F"/><path d="M15 28 L20 37 L25 28Z" fill="#F2C14E"/>` },
    ilmapallo: { part: 'ilmapalloa', svg: `<ellipse cx="20" cy="16" rx="11" ry="13" fill="#8FCFC0"/><path d="M18 29 L22 29 L20 31Z" fill="#8FCFC0"/><path d="M20 31 Q16 34 20 38" stroke="#9A9AAE" stroke-width="1.5" fill="none"/><ellipse cx="16" cy="11" rx="3" ry="4" fill="#fff" opacity=".4"/>` },
    sydan: { part: 'sydäntä', svg: `<path d="M20 34 C6 25 4 16 8 11 C12 6 18 8 20 13 C22 8 28 6 32 11 C36 16 34 25 20 34Z" fill="#F29BA8"/><ellipse cx="12" cy="14" rx="2.5" ry="3.5" fill="#fff" opacity=".35"/>` },
    timantti: { part: 'timanttia', svg: `<path d="M8 15 L14 7 L26 7 L32 15 L20 34Z" fill="#A6DDF0"/><path d="M8 15 L32 15 M14 7 L20 15 L26 7 M20 15 L20 34" stroke="#7FC3DD" stroke-width="1.3" fill="none"/>` },
  };
  const itemSVG = (id) => `<svg viewBox="0 0 40 40" aria-hidden="true">${ITEMS[id].svg}</svg>`;

  // ---------- Maailmojen taustat ----------
  const tree = (x, y, s, c = '#8FC19A') =>
    `<rect x="${x - 3 * s}" y="${y - 14 * s}" width="${6 * s}" height="${16 * s}" rx="${2 * s}" fill="#B49577"/>` +
    `<path d="M${x} ${y - 56 * s} L${x + 20 * s} ${y - 12 * s} L${x - 20 * s} ${y - 12 * s}Z" fill="${c}"/>` +
    `<path d="M${x} ${y - 72 * s} L${x + 15 * s} ${y - 36 * s} L${x - 15 * s} ${y - 36 * s}Z" fill="${c}"/>`;
  const wave = (y, amp, color) => {
    let d = `M0 ${y}`;
    for (let x = 0; x < 400; x += 50) d += ` Q${x + 25} ${y - amp} ${x + 50} ${y}`;
    return `<path d="${d} V160 H0Z" fill="${color}"/>`;
  };
  const cloud = (x, y, s) =>
    `<g fill="#fff" opacity=".9"><circle cx="${x}" cy="${y}" r="${12 * s}"/><circle cx="${x + 14 * s}" cy="${y - 6 * s}" r="${15 * s}"/><circle cx="${x + 30 * s}" cy="${y}" r="${11 * s}"/><rect x="${x}" y="${y}" width="${30 * s}" height="${11 * s}"/></g>`;
  const SPACE_STARS = [[30, 20], [80, 52], [140, 14], [196, 42], [258, 20], [300, 74], [372, 28], [112, 88], [232, 84], [18, 74], [170, 70], [350, 96]]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1.6 : 2.4}" fill="#F6E7B0" opacity=".75"/>`).join('');

  const WORLDS = [
    {
      id: 'metsa', name: 'Metsä', sky: '#E7F1E1', items: ['omena', 'sieni', 'kukka'],
      scene: `<path d="M0 105 Q100 70 200 100 T400 92 V160 H0Z" fill="#D3E8C9"/>${tree(40, 114, 0.9)}${tree(86, 108, 0.7, '#A3CDA6')}${tree(318, 104, 0.8, '#A3CDA6')}${tree(366, 112, 1)}<path d="M0 130 Q120 108 240 126 T400 118 V160 H0Z" fill="#BEDDB2"/>`,
    },
    {
      id: 'meri', name: 'Meri', sky: '#E2EFF6', items: ['kala', 'meritahti', 'simpukka'],
      scene: `<circle cx="338" cy="44" r="18" fill="#F7E4A8"/>${wave(98, 8, '#C6E0EC')}${wave(120, 8, '#ABD1E3')}<path d="M0 146 Q200 132 400 146 V160 H0Z" fill="#EADFC8"/>`,
    },
    {
      id: 'avaruus', name: 'Avaruus', sky: '#454E80', items: ['tahti', 'planeetta', 'raketti'],
      scene: `${SPACE_STARS}<circle cx="330" cy="56" r="20" fill="#9FB0E4"/><ellipse cx="330" cy="57" rx="32" ry="7" fill="none" stroke="#E9C46A" stroke-width="3" transform="rotate(-12 330 57)"/><path d="M0 132 Q200 102 400 132 V160 H0Z" fill="#5D669C"/><ellipse cx="120" cy="134" rx="16" ry="4" fill="#4F5890"/><ellipse cx="260" cy="128" rx="10" ry="3" fill="#4F5890"/>`,
    },
    {
      id: 'pilvi', name: 'Pilvilinna', sky: '#F5E7EF', items: ['ilmapallo', 'sydan', 'timantti'],
      scene: `${cloud(30, 40, 1)}${cloud(170, 26, 0.8)}<g fill="#EBCFDD"><rect x="282" y="66" width="70" height="56"/><rect x="270" y="50" width="22" height="72"/><rect x="342" y="50" width="22" height="72"/></g><g fill="#DDB3C8"><path d="M268 50 L281 30 L294 50Z"/><path d="M340 50 L353 30 L366 50Z"/><path d="M280 66 L317 42 L354 66Z"/></g><rect x="308" y="94" width="18" height="28" rx="9" fill="#C997B0"/><path d="M0 130 Q40 112 80 128 Q120 110 160 128 Q200 112 240 128 Q280 110 320 128 Q360 112 400 128 V160 H0Z" fill="#fff"/>`,
    },
  ];
  const sceneSVG = (w) => `<svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${w.scene}</svg>`;
  const worldBg = (w) => `<div class="world-bg" style="--sky:${w.sky}">${sceneSVG(w)}</div>`;

  const ICON = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 L12 4 L20 11 V20 H14.5 V14.5 H9.5 V20 H4Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6 L9 4 L15 6 L21 4 V18 L15 20 L9 18 L3 20Z M9 4 V18 M15 6 V20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9 H7.5 L12.5 5 V19 L7.5 15 H3.5Z" fill="currentColor"/><path d="M15.5 9 Q17.5 12 15.5 15 M18 6.5 Q21.5 12 18 17.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9 H7.5 L12.5 5 V19 L7.5 15 H3.5Z" fill="currentColor"/><path d="M16 9.5 L21 14.5 M21 9.5 L16 14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    speak: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9 H7.5 L12.5 5 V19 L7.5 15 H3.5Z" fill="currentColor"/><path d="M15.5 9 Q17.5 12 15.5 15 M18 6.5 Q21.5 12 18 17.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11 V8 a4 4 0 0 1 8 0 V11" stroke="currentColor" stroke-width="2.2" fill="none"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5 L19 12 L8 19Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    compare: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="8" width="16" height="24" rx="4" fill="#ECE7DD"/><rect x="22" y="8" width="16" height="24" rx="4" fill="#DCEDE7"/><circle cx="10" cy="20" r="3" fill="#7FA7D9"/><circle cx="26" cy="15" r="3" fill="#7FA7D9"/><circle cx="34" cy="15" r="3" fill="#7FA7D9"/><circle cx="30" cy="25" r="3" fill="#7FA7D9"/></svg>`,
  };

  // ======================================================================
  // Tallennus (localStorage, erikseen kummallekin pelaajalle)
  // ======================================================================
  const STORE_KEY = 'matikkaseikkailu-v1';
  const PLAYERS = {
    pienet: { name: 'Pienet', sub: 'noin 4-vuotiaat' },
    isot: { name: 'Isot', sub: 'noin 8-vuotiaat' },
  };
  const defaultPlayer = () => ({ character: null, level: 0, correct: 0, unlocked: 0, stars: 0 });

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && s.players) {
        for (const k of Object.keys(PLAYERS)) s.players[k] = Object.assign(defaultPlayer(), s.players[k] || {});
        s.sound = !!s.sound;
        s.rate = typeof s.rate === 'number' ? s.rate : 0.9;
        s.voice = s.voice || '';
        return s;
      }
    } catch (e) { /* ei tallennusta tai estetty */ }
    return { sound: false, rate: 0.9, voice: '', players: { pienet: defaultPlayer(), isot: defaultPlayer() } };
  }
  let store = load();
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* yksityinen tila tms. */ }
  }

  // ======================================================================
  // Ääni (oletuksena pois) ja puhe
  // ======================================================================
  let actx = null;
  function tone(freqs, dur = 0.16, vol = 0.07) {
    if (!store.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t0 = actx.currentTime + 0.02;
      freqs.forEach((f, i) => {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        const st = t0 + i * dur * 0.85;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.linearRampToValueAtTime(vol, st + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, st + dur * 2);
        o.connect(g);
        g.connect(actx.destination);
        o.start(st);
        o.stop(st + dur * 2.1);
      });
    } catch (e) { /* ei ääntä */ }
  }
  const sfx = {
    ok: () => tone([523, 659, 784]),
    try: () => tone([392, 349], 0.18, 0.035),
    level: () => tone([523, 659, 784, 1047], 0.18),
  };

  // ---------- Puhe ----------
  // Käytetään vain suomenkielisiä ääniä. Jos sellaista ei ole, ei puhuta lainkaan,
  // koska vieraskielinen ääni lausuu suomea huonosti.
  const hasSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const VOICE_HELP = 'Luonnollisemman äänen saa lataamalla laitteeseen paremman suomenkielisen äänen. ' +
    '<b>Mac:</b> Järjestelmäasetukset → Käyttöapu → Puhuttu sisältö → Järjestelmän ääni → Hallitse ääniä… → Suomi → lataa esim. Satu (parannettu tai premium). ' +
    '<b>iPad/iPhone:</b> Asetukset → Käyttöapu → Puhuttu sisältö → Äänet → Suomi. ' +
    '<b>Windows:</b> Microsoft Edge -selaimessa on valmiina luonnolliset suomenkieliset äänet (Noora, Harri). ' +
    'Lataamisen jälkeen sulje selain kokonaan ja avaa peli uudelleen.';
  let fiVoices = [];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  function voiceScore(v) {
    const id = `${v.name} ${v.voiceURI}`;
    let s = 0;
    if (/natural|neural/i.test(id)) s += 6;
    if (/premium/i.test(id)) s += 5;
    if (/enhanced|parannettu/i.test(id)) s += 3;
    if (/compact|espeak/i.test(id)) s -= 3;
    // Applen hupi-/Eloquence-äänet kuulostavat robottimaisilta
    if (/\b(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)\b/i.test(v.name)) s -= 4;
    return s;
  }
  function loadVoices() {
    if (!hasSpeech) return;
    const vs = window.speechSynthesis.getVoices() || [];
    fiVoices = vs.filter((v) => /^fi([-_]|$)/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a));
    document.documentElement.classList.toggle('no-speech', fiVoices.length === 0);
    fillVoiceSettings();
  }
  const currentVoice = () => fiVoices.find((v) => v.voiceURI === store.voice) || fiVoices[0] || null;

  function fillVoiceSettings() {
    const box = document.getElementById('voiceSettings');
    if (!box) return;
    if (!fiVoices.length) {
      box.innerHTML = `<p><b>Puheääni:</b> tässä selaimessa ei ole suomenkielistä puheääntä, joten ääneen lukeminen on pois käytöstä.</p><p class="small">${VOICE_HELP}</p>`;
      return;
    }
    const cv = currentVoice();
    box.innerHTML = `
      <label class="set-row"><span>Puheääni</span><select id="voiceSel">${fiVoices.map((v) =>
        `<option value="${esc(v.voiceURI)}" ${v === cv ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select></label>
      <label class="set-row"><span>Nopeus</span><input id="rateSel" type="range" min="0.6" max="1.2" step="0.05" value="${store.rate}"></label>
      <div class="row"><button class="text-btn" data-act="testVoice">Kokeile ääntä</button></div>
      <p class="small">${VOICE_HELP}</p>`;
  }

  document.documentElement.classList.add('no-speech');
  if (hasSpeech) {
    loadVoices();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    else window.speechSynthesis.onvoiceschanged = loadVoices;
    setTimeout(loadVoices, 700); // osa selaimista lataa äänet viiveellä
  }
  function speak(text) {
    const v = hasSpeech && currentVoice();
    if (!v || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.voice = v;
      u.lang = v.lang;
      u.rate = store.rate;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ei puhetta */ }
  }
  const sayIfSound = (text) => { if (store.sound) speak(text); };

  // ======================================================================
  // Tehtävägeneraattorit
  // ======================================================================
  const SMALL_OFFS = [1, -1, 2, -2, 3, -3];

  function numberOptions(ans, n, min, max, offs) {
    const set = new Set([ans]);
    for (const o of shuffle(offs.slice())) {
      if (set.size >= n) break;
      const v = ans + o;
      if (v >= min && v <= max) set.add(v);
    }
    let guard = 0;
    const hi = Math.max(max, min + n);
    while (set.size < n && guard++ < 300) set.add(rand(min, hi));
    return [...set].sort((a, b) => a - b);
  }

  const mix = (...gens) => (w, e) => pick(gens)(w, e);

  // ---------- Pienet: kuvat, ei lukutaitoa vaativia ohjeita ----------
  const P = {
    count: (max) => (w, e) => {
      const m = e ? Math.max(3, max - 2) : max;
      const n = rand(1, m);
      const item = pick(w.items);
      const part = ITEMS[item].part;
      return {
        kind: 'count', key: `c${n}${item}`, item, n, answer: n,
        options: numberOptions(n, 3, 1, Math.max(m, 3), SMALL_OFFS),
        icon: itemSVG(item) + '?', text: `Montako ${part}?`,
        speak: `Montako ${part} näet? Laske ja valitse oikea luku.`,
      };
    },
    compare: (max) => (w, e) => {
      const m = e ? Math.max(4, max - 3) : max;
      const minDiff = e ? 2 : 1;
      let a, b;
      do { a = rand(1, m); b = rand(1, m); } while (Math.abs(a - b) < minDiff);
      const item = pick(w.items);
      return {
        kind: 'compare', key: `k${a}-${b}`, item, a, b, answer: a > b ? 0 : 1, options: [0, 1],
        icon: ICON.compare, text: 'Kummassa on enemmän?',
        speak: `Kummassa on enemmän ${ITEMS[item].part}? Napauta sitä puolta.`,
      };
    },
    add: (maxSum) => (w, e) => {
      const m = e ? Math.min(3, maxSum) : maxSum;
      const a = rand(1, m - 1);
      const b = rand(1, m - a);
      const item = pick(w.items);
      const part = ITEMS[item].part;
      return {
        kind: 'addpic', key: `p${a}+${b}`, item, a, b, answer: a + b,
        options: numberOptions(a + b, 3, 1, Math.max(m, 4), SMALL_OFFS),
        icon: itemSVG(item) + '+', text: 'Montako yhteensä?',
        speak: `Montako ${part} on yhteensä?`,
      };
    },
  };

  // ---------- Isot: laskutoimitukset ----------
  const OPWORD = { '+': 'plus', '−': 'miinus', '·': 'kertaa' };

  function eqTask(w, a, op, b, c, miss, ease, extra = {}) {
    const vals = { a, b, c };
    const answer = vals[miss];
    const big = Math.max(a, b, c) > 20;
    const offs = extra.offs || (big ? [1, -1, 2, -2, 10, -10, 9, -9, 11, -11] : SMALL_OFFS);
    const max = Math.max(a, b, c) + (big ? 20 : 4);
    const show = (k) => (k === miss ? 'jokin luku' : String(vals[k]));
    const spoken = miss === 'c'
      ? `Paljonko on ${a} ${OPWORD[op]} ${b}?`
      : `Mikä luku puuttuu? ${show('a')} ${OPWORD[op]} ${show('b')} on ${show('c')}.`;
    return Object.assign({
      kind: 'eq', eq: { a, op, b, c, miss }, answer,
      key: `${a}${op}${b}=${c}${miss}`,
      options: numberOptions(answer, ease ? 3 : 4, 0, max, offs),
      icon: itemSVG(pick(w.items)), text: miss === 'c' ? 'Laske.' : 'Mikä luku puuttuu?',
      speak: spoken,
    }, extra);
  }

  const I = {
    add: (max) => (w, e) => {
      const m = e ? Math.max(5, Math.round(max / 2)) : max;
      const c = rand(2, m);
      const a = rand(1, c - 1);
      return eqTask(w, a, '+', c - a, c, 'c', e);
    },
    sub: (max) => (w, e) => {
      const m = e ? Math.max(5, Math.round(max / 2)) : max;
      const a = rand(2, m);
      const b = rand(1, a - 1);
      return eqTask(w, a, '−', b, a - b, 'c', e);
    },
    addsub: (max) => (w, e) => (Math.random() < 0.5 ? I.add(max) : I.sub(max))(w, e),
    // Kymmenen ylitys 0–20 (esim. 8 + 5, 13 − 6)
    cross: () => (w, e) => {
      if (e) return I.addsub(20)(w, true);
      if (Math.random() < 0.5) {
        const a = rand(2, 9);
        const b = rand(11 - a, 9);
        return eqTask(w, a, '+', b, a + b, 'c', e);
      }
      const a = rand(11, 18);
      const b = rand(a - 9, 9);
      return eqTask(w, a, '−', b, a - b, 'c', e);
    },
    missing: (max) => (w, e) => {
      const m = e ? 10 : max;
      const form = pick(['a+?', '?+b', 'a-?']);
      if (form === 'a-?') {
        const a = rand(2, m);
        const x = rand(1, a - 1);
        return eqTask(w, a, '−', x, a - x, 'b', e);
      }
      const c = rand(2, m);
      const x = rand(1, c - 1);
      return form === 'a+?' ? eqTask(w, c - x, '+', x, c, 'b', e) : eqTask(w, x, '+', c - x, c, 'a', e);
    },
    // Täysiä kymmeniä 0–100 (esim. 30 + 40)
    tens: () => (w, e) => {
      const top = e ? 5 : 9;
      if (Math.random() < 0.5) {
        const a = rand(1, top - 1);
        const b = rand(1, top - a);
        return eqTask(w, a * 10, '+', b * 10, (a + b) * 10, 'c', e);
      }
      const a = rand(2, top);
      const b = rand(1, a - 1);
      return eqTask(w, a * 10, '−', b * 10, (a - b) * 10, 'c', e);
    },
    // Kaksinumeroiset 0–100, aluksi ilman kymmenylitystä
    big: (carry) => (w, e) => {
      if (e) return I.tens()(w, true);
      const add = Math.random() < 0.5;
      if (!carry) {
        if (add) {
          const ta = rand(1, 7), tb = rand(0, 8 - ta), oa = rand(0, 9), ob = rand(tb ? 0 : 1, 9 - oa);
          const a = ta * 10 + oa, b = tb * 10 + ob;
          if (b === 0) return I.tens()(w, false);
          return eqTask(w, a, '+', b, a + b, 'c', e);
        }
        const ta = rand(2, 9), oa = rand(0, 9), tb = rand(0, ta - 1), ob = rand(0, oa);
        const a = ta * 10 + oa, b = tb * 10 + ob;
        if (b === 0) return I.tens()(w, false);
        return eqTask(w, a, '−', b, a - b, 'c', e);
      }
      if (add) {
        const a = rand(11, 88);
        const b = rand(2, 100 - a);
        return eqTask(w, a, '+', b, a + b, 'c', e);
      }
      const a = rand(20, 99);
      const b = rand(2, a - 1);
      return eqTask(w, a, '−', b, a - b, 'c', e);
    },
    missing100: () => (w, e) => {
      if (e) return I.missing(20)(w, true);
      let a, x;
      if (Math.random() < 0.5) {
        a = 10 * rand(1, 8);
        x = 10 * rand(1, 9 - a / 10);
      } else {
        const oa = rand(0, 8);
        a = rand(1, 8) * 10 + oa;
        x = rand(1, 9 - oa);
      }
      const c = a + x;
      const form = pick(['a+?', '?+b', 'c-?']);
      if (form === 'a+?') return eqTask(w, a, '+', x, c, 'b', e);
      if (form === '?+b') return eqTask(w, x, '+', a, c, 'a', e);
      return eqTask(w, c, '−', x, a, 'b', e);
    },
    mul: (tables) => (w, e) => {
      const t = pick(tables);
      const k = e ? rand(1, 5) : rand(1, 10);
      const c = k * t;
      const extra = { offs: [t, -t, 1, -1, 2, -2, 2 * t], mul: { k, t } };
      return Math.random() < 0.5 ? eqTask(w, k, '·', t, c, 'c', e, extra) : eqTask(w, t, '·', k, c, 'c', e, extra);
    },
  };

  // 4 maailmaa × 3 tasoa. Vaikeus nousee hitaasti.
  const LEVELS = {
    pienet: [
      // Metsä
      P.count(4), P.count(5), mix(P.count(5), P.compare(5)),
      // Meri
      mix(P.compare(6), P.count(6)), mix(P.add(3), P.count(6)), mix(P.add(4), P.compare(6)),
      // Avaruus
      P.count(7), mix(P.count(10), P.compare(8)), mix(P.add(4), P.count(8)),
      // Pilvilinna
      P.count(10), mix(P.compare(10), P.add(4)), mix(P.count(10), P.compare(10), P.add(4)),
    ],
    isot: [
      // Metsä
      I.add(10), I.addsub(10), I.addsub(20),
      // Meri
      I.cross(), I.missing(20), I.tens(),
      // Avaruus
      I.big(false), I.missing100(), I.mul([2, 10]),
      // Pilvilinna
      I.mul([5]), I.mul([2, 5, 10]), mix(I.big(true), I.missing100(), I.mul([2, 5, 10])),
    ],
  };
  const PER_WORLD = 3;
  const GOAL = 5;
  const worldOf = (lvl) => Math.floor(lvl / PER_WORLD);
  const levelLabel = (lvl) => `${WORLDS[worldOf(lvl)].name} · taso ${(lvl % PER_WORLD) + 1}`;

  // ======================================================================
  // Vihjeet
  // ======================================================================
  const dotsHTML = (list) => `<div class="dots" aria-hidden="true">${list.map((c) => `<i class="dot ${c}"></i>`).join('')}</div>`;

  function eqHint(t) {
    const { a, op, b, c, miss } = t.eq;
    if (op === '·') {
      const { k, t: m } = t.mul;
      if (k <= 5) return `${k} · ${m} tarkoittaa: ${times(k, m).join(' + ')}`;
      const name = { 2: 'kahden', 5: 'viiden', 10: 'kymmenen' }[m];
      return `Laske ${name} välein: ${m}, ${2 * m}, ${3 * m}, … Tee ${k} hyppyä.`;
    }
    const small = Math.max(a, b, c) <= 20;
    if (miss === 'c') {
      const tb = b - (b % 10), ob = b % 10;
      if (op === '+') {
        if (small) return 'Laske kaikki pallot yhteen.' + dotsHTML([...times(a, 'a'), ...times(b, 'b')]);
        if (a % 10 === 0 && b % 10 === 0) return `Ajattele kymppejä: ${a / 10} kymppiä + ${b / 10} kymppiä.`;
        if (tb === 0) return `Aloita luvusta ${a} ja laske ${b} askelta eteenpäin.`;
        if (ob === 0) return `Lisää luvun ${a} kymppeihin vielä ${b / 10} kymppiä.`;
        return `Lisää ensin kymmenet: ${a} + ${tb} = ${a + tb}. Lisää sitten vielä ${ob}.`;
      }
      if (small) return 'Yliviivatut pallot otetaan pois. Montako jää?' + dotsHTML([...times(a - b, 'a'), ...times(b, 'gone')]);
      if (a % 10 === 0 && b % 10 === 0) return `Ajattele kymppejä: ${a / 10} kymppiä − ${b / 10} kymppiä.`;
      if (tb === 0) return `Aloita luvusta ${a} ja laske ${b} askelta taaksepäin.`;
      if (ob === 0) return `Vähennä luvusta ${a} kymppejä: ${b / 10} kappaletta.`;
      return `Vähennä ensin kymmenet: ${a} − ${tb} = ${a - tb}. Vähennä sitten vielä ${ob}.`;
    }
    if (op === '+') {
      const known = miss === 'a' ? b : a;
      if (small) return `Montako tyhjää paikkaa pitää täyttää, että palloja on ${c}?` + dotsHTML([...times(known, 'a'), ...times(c - known, 'empty')]);
      return `Vinkki: laske ${c} − ${known}.`;
    }
    if (small) return `Luvusta ${a} otetaan jotain pois, ja jäljelle jää ${c}. Montako yliviivattiin?` + dotsHTML([...times(c, 'a'), ...times(a - c, 'gone')]);
    return `Vinkki: laske ${a} − ${c}.`;
  }

  // ======================================================================
  // Pelin tila ja näkymät
  // ======================================================================
  const app = document.getElementById('app');
  const cur = { player: null, task: null, easeNext: false, lastKey: '', locked: false, timer: null };
  const player = () => store.players[cur.player];

  const soundBtn = () =>
    `<button class="icon-btn ${store.sound ? 'on' : ''}" data-act="sound" aria-pressed="${store.sound}" aria-label="${store.sound ? 'Äänet päällä' : 'Äänet pois'}">${store.sound ? ICON.soundOn : ICON.soundOff}</button>`;
  const starCount = (n) => `<div class="star-count" id="starCount" aria-label="Tähtiä ${n}">${STAR_SVG}<span>${n}</span></div>`;

  function clearTimer() {
    if (cur.timer) { clearTimeout(cur.timer); cur.timer = null; }
    resetKeys();
    if (hasSpeech) try { window.speechSynthesis.cancel(); } catch (e) { /* */ }
  }

  // ---------- Aloitus ----------
  function renderHome() {
    clearTimer();
    cur.player = null;
    const card = (id) => {
      const p = store.players[id];
      const av = p.character ? charSVG(p.character)
        : `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="${id === 'pienet' ? '#FBE3D0' : '#DCEDE7'}"/><text x="50" y="64" text-anchor="middle" font-size="40" font-weight="800" fill="#3D3B4F" font-family="inherit">${id === 'pienet' ? '123' : '+ −'}</text></svg>`;
      const meta = p.character
        ? `${STAR_SVG}<span>${p.stars}</span><span>· ${WORLDS[worldOf(p.level)].name}</span>`
        : `<span>${PLAYERS[id].sub}</span>`;
      return `<button class="pcard" data-act="pickPlayer" data-id="${id}" aria-label="${PLAYERS[id].name}, ${PLAYERS[id].sub}">
        <div class="av">${av}</div><div class="name">${PLAYERS[id].name}</div><div class="meta">${meta}</div></button>`;
    };
    app.innerHTML = `<div class="world-bg" style="--sky:#F6F3EC">${sceneSVG(WORLDS[0])}</div>
      <div class="screen">
        <div class="topbar"><span class="spacer"></span><span class="grow"></span>${soundBtn()}</div>
        <h1 class="logo">Matikka<span>seikkailu</span></h1>
        <p class="subtitle">Kuka pelaa?</p>
        <div class="player-cards">${card('pienet')}${card('isot')}</div>
        <details class="parents">
          <summary>Aikuisille</summary>
          <div class="inner">
            <p><b>Pienet</b>: esineiden laskeminen, kumpi on enemmän ja yhteenlasku kuvilla. <b>Isot</b>: yhteen- ja vähennyslasku 0–100, puuttuva luku sekä kertotaulut 2, 5 ja 10.</p>
            <p>Viisi oikeaa vastausta vie seuraavalle tasolle. Väärästä vastauksesta saa vihjeen ja uuden yrityksen; kahden virheen jälkeen seuraava tehtävä on helpompi. Eteneminen tallentuu tähän selaimeen.</p>
            <p><b>Näppäimistö:</b> vastauksen voi valita myös numeronäppäimillä. Kaksinumeroinen luku näppäillään numero kerrallaan (esim. 1 ja 5 = 15), ja pienten tehtävissä 0 tarkoittaa lukua 10. Kumpi on enemmän ‑tehtävässä valitaan nuolinäppäimillä ← ja →. Enter jatkaa seuraavalle tasolle.</p>
            <p>Äänet ovat oletuksena pois päältä. Kaiutinpainike tehtävän vieressä lukee ohjeen ääneen.</p>
            <div id="voiceSettings"></div>
            <div class="row">
              <button class="text-btn" data-act="reset" data-id="pienet">Nollaa Pienet</button>
              <button class="text-btn" data-act="reset" data-id="isot">Nollaa Isot</button>
            </div>
          </div>
        </details>
      </div>`;
    fillVoiceSettings();
  }

  // ---------- Hahmon valinta ----------
  function renderCharacters() {
    clearTimer();
    const p = player();
    app.innerHTML = `<div class="world-bg" style="--sky:#F6F3EC">${sceneSVG(WORLDS[0])}</div>
      <div class="screen">
        <div class="topbar"><button class="icon-btn" data-act="${p.character ? 'map' : 'home'}" aria-label="Takaisin">${ICON.back}</button><span class="grow"><h2 class="title">Valitse kaveri</h2></span>${soundBtn()}</div>
        <div class="char-grid">
          ${CHARACTERS.map((c) => `<button class="char-btn ${p.character === c.id ? 'selected' : ''}" data-act="pickChar" data-id="${c.id}">${charSVG(c.id)}<span>${c.name}</span></button>`).join('')}
        </div>
      </div>`;
  }

  // ---------- Kartta ----------
  function renderMap() {
    clearTimer();
    const p = player();
    const total = LEVELS[cur.player].length;
    const worlds = WORLDS.map((w, wi) => {
      const first = wi * PER_WORLD;
      const locked = first > p.unlocked;
      const lv = [0, 1, 2].map((li) => {
        const idx = first + li;
        if (idx >= total) return '';
        if (idx > p.unlocked) return `<button class="lvl locked" disabled aria-label="Taso ${li + 1}, lukittu">${ICON.lock}</button>`;
        const done = idx < p.unlocked;
        return `<button class="lvl ${idx === p.level ? 'current' : ''}" data-act="playLevel" data-idx="${idx}" aria-label="${w.name}, taso ${li + 1}${done ? ', läpäisty' : ''}">${done ? STAR_SVG : li + 1}</button>`;
      }).join('');
      return `<div class="world-card ${locked ? 'locked' : ''}" style="--sky:${w.sky}">${sceneSVG(w)}<h3>${w.name}</h3><div class="lvls">${lv}</div></div>`;
    }).join('');
    app.innerHTML = `<div class="world-bg" style="--sky:#F6F3EC"></div>
      <div class="screen">
        <div class="topbar"><button class="icon-btn" data-act="home" aria-label="Alkuun">${ICON.home}</button><span class="grow">${starCount(p.stars)}</span>${soundBtn()}</div>
        <div class="map-head">
          <div class="av">${charSVG(p.character)}</div>
          <div class="col">
            <button class="big-btn" data-act="play" aria-label="Pelaa: ${levelLabel(p.level)}">${ICON.play}Pelaa</button>
            <button class="text-btn" data-act="changeChar">Vaihda kaveria</button>
          </div>
        </div>
        <div class="worlds">${worlds}</div>
      </div>`;
  }

  // ---------- Tehtävä ----------
  function itemsGrid(id, n, start = 1, perRow = 5) {
    let html = '<div class="items">';
    for (let r = 0; r < Math.ceil(n / perRow); r++) {
      html += '<div class="irow">';
      for (let i = r * perRow; i < Math.min(n, (r + 1) * perRow); i++) {
        html += `<span class="item">${itemSVG(id)}<span class="num">${start + i}</span></span>`;
      }
      html += '</div>';
    }
    return html + '</div>';
  }
  const miniDots = (n) => `<span class="md" aria-hidden="true">${'<i></i>'.repeat(n)}</span>`;

  function taskBody(t) {
    switch (t.kind) {
      case 'count':
        return itemsGrid(t.item, t.n);
      case 'addpic':
        return `<div class="addpic">${itemsGrid(t.item, t.a)}<span class="bigop">+</span>${itemsGrid(t.item, t.b, t.a + 1)}</div>`;
      case 'compare':
        return `<div class="cmp">
          <button class="cmp-btn" data-act="answer" data-val="0" aria-label="Vasen puoli">${itemsGrid(t.item, t.a, 1, 3)}</button>
          <button class="cmp-btn" data-act="answer" data-val="1" aria-label="Oikea puoli">${itemsGrid(t.item, t.b, 1, 3)}</button></div>`;
      case 'eq': {
        const { a, op, b, c, miss } = t.eq;
        const part = (k, v) => (k === miss ? '<span class="box">?</span>' : `<span>${v}</span>`);
        return `<div class="eq" aria-label="${miss === 'c' ? `${a} ${OPWORD[op]} ${b}` : t.speak}">${part('a', a)}<span class="op">${op}</span>${part('b', b)}<span class="op">=</span>${part('c', c)}</div>`;
      }
    }
    return '';
  }

  function renderPlay() {
    const p = player();
    const w = WORLDS[worldOf(p.level)];
    const t = cur.task;
    const small = cur.player === 'pienet';
    const slots = Array.from({ length: GOAL }, (_, i) => `<span class="slot ${i < p.correct ? '' : 'empty'}">${STAR_SVG}</span>`).join('');
    const opts = t.kind === 'compare' ? '' :
      `<div class="options n${t.options.length}" style="--n:${t.options.length}">${t.options.map((v) =>
        `<button class="opt" data-act="answer" data-val="${v}" aria-label="${v}"><span class="digit">${v}</span>${small ? miniDots(v) : ''}</button>`).join('')}</div>`;
    app.innerHTML = `${worldBg(w)}
      <div class="screen play">
        <div class="topbar">
          <button class="icon-btn" data-act="map" aria-label="Kartalle">${ICON.map}</button>
          <span class="grow"><span class="progress" id="progress" aria-label="${p.correct} / ${GOAL}">${slots}</span></span>
          ${starCount(p.stars)}
          ${soundBtn()}
        </div>
        <div class="prompt-row">
          <div class="buddy" id="buddy">${charSVG(p.character)}</div>
          <div class="prompt panel">
            <button class="speak-btn" data-act="speak" aria-label="Kuuntele ohje">${ICON.speak}</button>
            <span class="picon">${t.icon}</span>
            <span class="ptext">${t.text}</span>
          </div>
        </div>
        <div class="task panel" id="task">${taskBody(t)}</div>
        ${opts}
        <div class="feedback" id="feedback" aria-live="polite"></div>
      </div>`;
  }

  function nextTask() {
    clearTimer();
    const p = player();
    if (p.correct >= GOAL) { finishLevel(); return; }
    const gen = LEVELS[cur.player][p.level];
    const w = WORLDS[worldOf(p.level)];
    let t, tries = 0;
    do { t = gen(w, cur.easeNext); } while (t.key === cur.lastKey && tries++ < 12);
    t.wrongs = 0;
    cur.lastKey = t.key;
    cur.easeNext = false;
    cur.task = t;
    cur.locked = false;
    renderPlay();
    if (cur.player === 'pienet') sayIfSound(t.speak);
  }

  const PRAISE = ['Hienoa!', 'Oikein!', 'Mahtavaa!', 'Hyvin laskettu!', 'Upeaa!', 'Juuri niin!'];
  const TRY = ['Melkein! Yritä uudelleen.', 'Ei haittaa, kokeile vielä!', 'Hyvä yritys! Kokeile uudelleen.'];

  function setFeedback(html) {
    const fb = document.getElementById('feedback');
    if (fb) fb.innerHTML = html;
  }

  function answer(btn) {
    const t = cur.task;
    if (cur.locked || !t || btn.disabled) return;
    const val = Number(btn.dataset.val);
    if (val === t.answer) return onCorrect(btn);
    onWrong(btn);
  }

  function onWrong(btn) {
    const t = cur.task;
    t.wrongs++;
    btn.classList.add('tried');
    btn.disabled = true;
    sfx.try();
    const msg = pick(TRY);
    if (t.kind === 'eq') {
      setFeedback(`<div class="fb-msg try">${msg}</div><div class="hint-box">${eqHint(t)}</div>`);
    } else {
      // Pienille vihje on kuvallinen: esineisiin ilmestyvät numerot.
      document.getElementById('task').classList.add('hint-on');
      setFeedback(`<div class="fb-msg try">${msg}</div>`);
      sayIfSound(t.kind === 'compare' ? 'Melkein! Lasketaan yhdessä.' : 'Melkein! Lasketaan yhdessä ja kokeillaan uudelleen.');
    }
  }

  function onCorrect(btn) {
    const t = cur.task;
    const p = player();
    cur.locked = true;
    btn.classList.add('correct');
    app.querySelectorAll('[data-act="answer"]').forEach((b) => { b.disabled = true; });
    // Kaksi väärää peräkkäin → seuraava tehtävä on helpompi.
    cur.easeNext = t.wrongs >= 2;
    p.stars++;
    p.correct = Math.min(GOAL, p.correct + 1);
    save();
    sfx.ok();
    const praise = pick(PRAISE);
    setFeedback(`<div class="fb-msg ok">${praise}</div>`);
    sayIfSound(praise);
    const buddy = document.getElementById('buddy');
    if (buddy) buddy.classList.add('hop');
    flyStar(btn, () => {
      const slot = document.querySelectorAll('#progress .slot')[p.correct - 1];
      if (slot) { slot.classList.remove('empty'); slot.classList.add('pop'); }
    });
    cur.timer = setTimeout(() => {
      cur.timer = null;
      if (p.correct >= GOAL) finishLevel();
      else nextTask();
    }, reduceMotion ? 1300 : 1700);
  }

  function flyStar(fromEl, after) {
    const target = document.getElementById('starCount');
    const done = () => {
      if (target) {
        target.querySelector('span').textContent = player().stars;
        target.classList.remove('pop');
        void target.offsetWidth;
        target.classList.add('pop');
      }
      after && after();
    };
    if (reduceMotion || !target) { done(); return; }
    const r1 = fromEl.getBoundingClientRect();
    const r2 = target.getBoundingClientRect();
    const size = 64;
    const s = document.createElement('div');
    s.className = 'fly-star';
    s.innerHTML = STAR_SVG;
    s.style.left = (r1.left + r1.width / 2 - size / 2) + 'px';
    s.style.top = (r1.top + r1.height / 2 - size / 2) + 'px';
    document.body.appendChild(s);
    const dx = r2.left + 20 - (r1.left + r1.width / 2);
    const dy = r2.top + r2.height / 2 - (r1.top + r1.height / 2);
    setTimeout(() => {
      s.style.transform = `translate(${dx}px, ${dy}px) scale(.45)`;
      s.style.opacity = '.7';
    }, 380);
    setTimeout(() => { s.remove(); done(); }, 1260);
  }

  // ---------- Taso läpi ----------
  function finishLevel() {
    const p = player();
    const total = LEVELS[cur.player].length;
    const finished = p.level;
    p.correct = 0;
    if (finished >= p.unlocked) p.unlocked = Math.min(total, finished + 1);
    const allDone = finished === total - 1;
    const next = Math.min(finished + 1, total - 1);
    p.level = next;
    save();
    sfx.level();
    const newWorld = !allDone && worldOf(next) !== worldOf(finished);
    const w = WORLDS[worldOf(finished)];
    const nw = WORLDS[worldOf(next)];
    let title = 'Taso läpi!';
    let text = `${levelLabel(finished)} on tehty.`;
    let extra = '';
    if (allDone) {
      title = 'Kaikki maailmat läpi!';
      text = 'Olet oikea matikkamestari! Voit pelata lisää milloin vain.';
    } else if (newWorld) {
      title = 'Maailma läpi!';
      text = `Koko ${w.name.toLowerCase()} on tehty. Nyt matka jatkuu!`;
      extra = `<div class="next-world" style="--sky:${nw.sky}">${sceneSVG(nw)}<b>Seuraavaksi: ${nw.name}</b></div>`;
    }
    sayIfSound(title);
    app.innerHTML = `${worldBg(w)}
      <div class="screen">
        <div class="topbar"><button class="icon-btn" data-act="map" aria-label="Kartalle">${ICON.map}</button><span class="grow">${starCount(p.stars)}</span>${soundBtn()}</div>
        <div class="done-card panel">
          <div class="av hop">${charSVG(p.character)}</div>
          <div class="star-row">${times(GOAL, `<span>${STAR_SVG}</span>`).join('')}</div>
          <h2>${title}</h2>
          <p>${text}</p>
          ${extra}
          <div class="btn-row">
            <button class="big-btn" data-act="play" aria-label="Jatka">${ICON.play}Jatka</button>
            <button class="big-btn soft" data-act="map">${ICON.map}Kartta</button>
          </div>
        </div>
      </div>`;
  }

  // ======================================================================
  // Tapahtumat
  // ======================================================================
  const actions = {
    home: renderHome,
    map: renderMap,
    pickPlayer: (b) => {
      cur.player = b.dataset.id;
      cur.easeNext = false;
      cur.lastKey = '';
      if (player().character) renderMap(); else renderCharacters();
    },
    pickChar: (b) => {
      player().character = b.dataset.id;
      save();
      renderMap();
    },
    changeChar: renderCharacters,
    play: () => nextTask(),
    playLevel: (b) => {
      const p = player();
      const idx = Number(b.dataset.idx);
      if (idx > p.unlocked) return;
      if (idx !== p.level) { p.level = idx; p.correct = 0; save(); }
      cur.easeNext = false;
      nextTask();
    },
    answer,
    speak: () => cur.task && speak(cur.task.speak),
    sound: (b) => {
      store.sound = !store.sound;
      save();
      b.outerHTML = soundBtn();
      if (store.sound) tone([659], 0.12, 0.05);
      else if (hasSpeech) try { window.speechSynthesis.cancel(); } catch (e) { /* */ }
    },
    reset: (b) => {
      const id = b.dataset.id;
      if (!window.confirm(`Nollataanko pelaajan "${PLAYERS[id].name}" eteneminen? Tähdet, tasot ja hahmo poistuvat.`)) return;
      store.players[id] = defaultPlayer();
      save();
      renderHome();
    },
    testVoice: () => speak('Hei! Montako omenaa näet? Seitsemän plus viisi on kaksitoista.'),
  };

  app.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || !app.contains(b)) return;
    const fn = actions[b.dataset.act];
    if (fn) fn(b, e);
  });

  // Puheäänen asetukset (Aikuisille-osio)
  app.addEventListener('change', (e) => {
    if (e.target.id === 'voiceSel') { store.voice = e.target.value; save(); actions.testVoice(); }
    if (e.target.id === 'rateSel') { store.rate = Number(e.target.value); save(); actions.testVoice(); }
  });

  // ======================================================================
  // Näppäimistö: numeronäppäimet valitsevat vastauksen
  // ======================================================================
  let keyBuf = '';
  let keyTimer = null;
  const onPlayScreen = () => !!(cur.task && app.querySelector('.screen.play'));

  function resetKeys() {
    keyBuf = '';
    if (keyTimer) { clearTimeout(keyTimer); keyTimer = null; }
    markTyped();
  }
  function markTyped() {
    app.querySelectorAll('.opt').forEach((b) =>
      b.classList.toggle('typed', !!keyBuf && !b.disabled && b.dataset.val.startsWith(keyBuf)));
  }
  function pressOption(val) {
    const b = app.querySelector(`.opt[data-val="${val}"]`);
    if (b && !b.disabled) answer(b);
  }
  function nudge() {
    const o = app.querySelector('.options');
    if (!o) return;
    o.classList.remove('nudge');
    void o.offsetWidth;
    o.classList.add('nudge');
  }
  function onDigit(d) {
    const t = cur.task;
    if (cur.locked || t.kind === 'compare') return;
    const vals = [...app.querySelectorAll('.opt:not(:disabled)')].map((b) => b.dataset.val);
    // Pienille: 0 tarkoittaa lukua 10, jos nolla ei ole vaihtoehto
    if (d === '0' && !keyBuf && !vals.includes('0') && vals.includes('10')) { resetKeys(); pressOption(10); return; }
    let buf = keyBuf + d;
    if (!vals.some((v) => v.startsWith(buf))) buf = d;
    if (!vals.some((v) => v.startsWith(buf))) { resetKeys(); nudge(); return; }
    if (keyTimer) { clearTimeout(keyTimer); keyTimer = null; }
    keyBuf = buf;
    const exact = vals.includes(buf);
    const longer = vals.some((v) => v !== buf && v.startsWith(buf));
    if (exact && !longer) { resetKeys(); pressOption(buf); return; }
    markTyped();
    // Esim. vaihtoehdot 1 ja 12: odotetaan hetki, tuleeko toinen numero
    keyTimer = setTimeout(() => {
      const v = keyBuf;
      resetKeys();
      if (exact) pressOption(v);
    }, exact ? 1200 : 3000);
  }

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input, select, textarea')) return;
    if (/^[0-9]$/.test(e.key)) {
      if (onPlayScreen()) { e.preventDefault(); onDigit(e.key); }
      return;
    }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && onPlayScreen() && cur.task.kind === 'compare') {
      e.preventDefault();
      const b = app.querySelector(`.cmp-btn[data-val="${e.key === 'ArrowLeft' ? 0 : 1}"]`);
      if (b && !b.disabled && !cur.locked) answer(b);
      return;
    }
    if (e.key === 'Enter' && !(e.target.closest && e.target.closest('button, summary'))) {
      const p = app.querySelector('[data-act="play"]');
      if (p) { e.preventDefault(); p.click(); }
    }
  });

  renderHome();
})();
