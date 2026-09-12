/* ==========================================================================
   Tos posral! – herní logika a UI (bez závislostí, bez build kroku)
   Dvojjazyčné: cs / en. Texty rozhraní jsou v objektu I18N, fakta mají
   anglickou verzi v poli `en` (data/facts/*.json).
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- Značka (název hry, výzva) – EN název se doladí ---------- */
  const BRAND = {
    penalty: '💩',
    cs: { name: 'Tos posral!', challenge: 'Tos posral!', tagline: 'Párty hra o číslech pro 2–6 hráčů na jednom telefonu. Přihazuj, blafuj a hlavně nepřeháněj.' },
    en: { name: 'Tos posral!', challenge: 'Too far!', tagline: 'A party game of numbers for 2–6 players on one phone. Bid, bluff and, above all, don’t overshoot.' },
  };

  const CATEGORIES = {
    sport:       { emoji: '🏅', cs: 'Sport',          en: 'Sport' },
    umeni:       { emoji: '🎨', cs: 'Umění',          en: 'Art' },
    hudba:       { emoji: '🎵', cs: 'Hudba',          en: 'Music' },
    technologie: { emoji: '💻', cs: 'Technologie',    en: 'Technology' },
    zvirata:     { emoji: '🐾', cs: 'Zvířata',        en: 'Animals' },
    moda:        { emoji: '👗', cs: 'Móda',           en: 'Fashion' },
    veda:        { emoji: '🔭', cs: 'Věda a vesmír',  en: 'Science & Space' },
    zemepis:     { emoji: '🌍', cs: 'Zeměpis',        en: 'Geography' },
    historie:    { emoji: '🏛️', cs: 'Historie',       en: 'History' },
    jidlo:       { emoji: '🍕', cs: 'Jídlo a pití',   en: 'Food & Drink' },
    telo:        { emoji: '🫀', cs: 'Lidské tělo',    en: 'Human Body' },
    film:        { emoji: '🎬', cs: 'Film a seriály', en: 'Film & TV' },
    cesko:       { emoji: '🇨🇿', cs: 'Česko',          en: 'Czechia' },
  };
  const CATEGORY_ORDER = Object.keys(CATEGORIES);
  const PLAYER_COLORS = ['#ff5c8a', '#ffb547', '#3ddc97', '#4cc9f0', '#b388ff', '#ffe66d'];
  const PLAYER_EMOJI = ['🦊', '🐼', '🐸', '🐙', '🦄', '🐝', '🐯', '🐨', '🦖', '🐧', '🦩', '🐳'];
  const ROUND_OPTIONS = [5, 10, 15, 20];
  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 6;
  const MAX_DIGITS = 12;
  const STORAGE = { settings: 'tosposral.settings.v1', used: 'tosposral.used.v1', seen: 'tosposral.seen.v1', lang: 'tosposral.lang.v1' };

  /* ---------- Texty rozhraní ---------- */
  const I18N = {
    cs: {
      play: 'Hrát', howTo: 'Jak se hraje', factsSources: 'Fakta a zdroje',
      footnote: '{facts} · {cats} · každý se zdrojem',
      factsCount: { one: '{n} ověřený fakt', few: '{n} ověřené fakty', many: '{n} ověřených faktů' },
      catsCount: { one: '{n} kategorie', few: '{n} kategorie', many: '{n} kategorií' },
      questionsCount: { one: '{n} otázka', few: '{n} otázky', many: '{n} otázek' },
      roundsCount: { one: '{n} kolo', few: '{n} kola', many: '{n} kol' },
      newQuestionsCount: { one: '{n} nová otázka', few: '{n} nové otázky', many: '{n} nových otázek' },
      poopCount: { one: '{n} hovínko', few: '{n} hovínka', many: '{n} hovínek' },
      back: 'Zpět', newGame: 'Nová hra', players: 'Hráči', addPlayer: '+ Přidat hráče', playerN: 'Hráč {n}',
      changeIcon: 'Změnit ikonu hráče', removePlayer: 'Odebrat hráče', playerName: 'Jméno hráče {n}',
      categories: 'Kategorie', selectAll: 'Vybrat vše', clearAll: 'Zrušit vše', rounds: 'Počet kol', startGame: 'Začít hru',
      historyNote: 'Aplikace si pamatuje, které otázky kdo (podle jména) už hrál, a nabízí nejdřív ty nové.', resetHistory: 'Vynulovat historii',
      hintNoCat: 'Vyber aspoň jednu kategorii.',
      hintAllPlayed: 'Tahle parta už odehrála všechny otázky z vybraných kategorií ({total}) – otázky se budou opakovat.',
      hintFewNew: 'Pro tuhle partu zbývá jen {fresh}, které ještě nehrála – zbylých {rest} se bude opakovat.',
      hintShort: 'Ve vybraných kategoriích je jen {total} – hra bude mít {rounds}.',
      hintOk: 'Nových otázek pro tuhle partu: {fresh} z {total}.',
      round: 'Kolo', quitGame: 'Ukončit hru', scoreboard: 'Skóre', noBids: 'Zatím žádný tip – {name} začíná.',
      yourTurn: 'Na tahu', firstBid: 'zadej první tip', moreThan: 'víc než {n}', mustBeMore: 'musí být víc než {n}',
      keypad: 'Číselná klávesnice', delDigit: 'Smazat poslední číslici', clear: 'Vymazat', bid: 'Přihodit ↑',
      repeatBadge: '🔁 Tuhle otázku jste už hráli',
      correctAnswer: 'Správná odpověď', didYouKnow: 'Věděli jste?', source: 'Zdroj', nextRound: 'Další kolo →', results: 'Vyhodnocení 🏆',
      verdictOver: '{accused} říká <b>{bid}</b>, správně je <b>{answer}</b> – to je o {diff} víc. {p} dostává <b>{accused}</b>.',
      verdictExact: '🎯 Přesná trefa!', verdictExactText: '{accused} říká <b>{bid}</b> – a to je přesně ono! {challenger} obviňuje neprávem a dostává {p}.',
      verdictSafe: '✋ Nic přehnaného!', verdictSafeText: '{accused} říká <b>{bid}</b>, správně je <b>{answer}</b> – ještě zbývalo {diff}. {challenger} obviňuje neprávem a dostává {p}.',
      gameOver: 'Konec hry', tie: 'Remíza! Všichni mají {n}.', winner: '🏆 Vítězí {names}', mostPoop: 'Nejvíc {p}: {names} ({n})',
      playAgain: 'Hrát znovu', editGame: 'Upravit hráče a kategorie', home: 'Domů', and: ' a ',
      rulesTitle: 'Jak se hraje',
      rules: [
        ['🎯', 'Přečtěte si otázku. <b>Odpověď je vždy číslo.</b> Telefon může ležet na stole – nic se neschovává.'],
        ['1️⃣', 'První hráč zadá tip. Snaží se být co nejblíž správné odpovědi, ale <b>nesmí ji přestřelit</b>.'],
        ['⬆️', 'Další hráč musí <b>přihodit vyšší číslo</b>…'],
        ['💩', '…nebo zmáčknout <b>„{challenge}“</b>, pokud si myslí, že předchozí tip už je nad správnou odpovědí.'],
        ['⚖️', 'Odhalí se odpověď. Kdo se spletl – přestřelil, nebo obvinil neprávem – dostává {p}. Obviňující hráč začíná další kolo.'],
        ['🏆', 'Po posledním kole vyhrává ten, kdo má <b>nejméně {p}</b>. Kdo jich má nejvíc, ten to posral.'],
      ],
      tip1: '💡 Tip: Chytrý první tip je nízký. Čím výš přihazuješ, tím větší riziko, že tě někdo chytne. A klidně blafuj – když jsi „dole“, obvinění nezabolí tebe.',
      tip2: '📚 Všechna fakta jsou ověřená a mají uvedený zdroj – po každém kole se dá jedním klepnutím otevřít.',
      letsPlay: 'Jdeme hrát',
      factsTitle: 'Fakta a zdroje', factsIntro: '{n} otázek. Odpovědi jsou schované, ať si nezkazíš hru – odhal je jen, když chceš ověřit zdroj.',
      showAnswer: 'Ukázat odpověď', hideAnswer: 'Skrýt odpověď',
      quitTitle: 'Ukončit hru?', quitText: 'Rozehraná partie se zahodí a skóre se nepočítá.', backToGame: 'Zpět do hry', quit: 'Ukončit',
      repeatAllTitle: 'Všechny otázky už jste hráli', repeatSomeTitle: 'Otázky se budou opakovat',
      repeatAllText: 'Tahle parta už odehrála všech {total} otázek z vybraných kategorií. Můžete hrát dál – otázky se budou opakovat (nejdřív ty nejdéle nehrané) – nebo přidat kategorie.',
      repeatSomeText: 'Pro tuhle partu zbývá jen {fresh}, zbytek kol bude z těch, které už někdo z vás hrál. Pomůže přidat kategorie nebo zkrátit hru.',
      edit: 'Upravit', playAnyway: 'Hrát i tak',
      resetTitle: 'Vynulovat historii otázek?', resetText: 'Aplikace zapomene, které otázky kdo hrál. Všechny otázky se pak zase nabídnou jako nové.', reset: 'Vynulovat',
      langSwitch: 'Switch to English',
    },
    en: {
      play: 'Play', howTo: 'How to play', factsSources: 'Facts & sources',
      footnote: '{facts} · {cats} · every one with a source',
      factsCount: { one: '{n} verified fact', other: '{n} verified facts' },
      catsCount: { one: '{n} category', other: '{n} categories' },
      questionsCount: { one: '{n} question', other: '{n} questions' },
      roundsCount: { one: '{n} round', other: '{n} rounds' },
      newQuestionsCount: { one: '{n} new question', other: '{n} new questions' },
      poopCount: { one: '{n} poop', other: '{n} poops' },
      back: 'Back', newGame: 'New game', players: 'Players', addPlayer: '+ Add player', playerN: 'Player {n}',
      changeIcon: 'Change player icon', removePlayer: 'Remove player', playerName: 'Name of player {n}',
      categories: 'Categories', selectAll: 'Select all', clearAll: 'Clear all', rounds: 'Rounds', startGame: 'Start game',
      historyNote: 'The app remembers which questions each player (by name) has already seen and serves new ones first.', resetHistory: 'Reset history',
      hintNoCat: 'Pick at least one category.',
      hintAllPlayed: 'This group has already played every question in the selected categories ({total}) – questions will repeat.',
      hintFewNew: 'This group has only {fresh} left that it hasn’t played – the other {rest} will repeat.',
      hintShort: 'The selected categories have only {total} – the game will have {rounds}.',
      hintOk: 'New questions for this group: {fresh} of {total}.',
      round: 'Round', quitGame: 'Quit game', scoreboard: 'Score', noBids: 'No bids yet – {name} starts.',
      yourTurn: 'Your turn', firstBid: 'enter the first bid', moreThan: 'more than {n}', mustBeMore: 'must be more than {n}',
      keypad: 'Numeric keypad', delDigit: 'Delete last digit', clear: 'Clear', bid: 'Bid ↑',
      repeatBadge: '🔁 You’ve had this question before',
      correctAnswer: 'Correct answer', didYouKnow: 'Did you know?', source: 'Source', nextRound: 'Next round →', results: 'Results 🏆',
      verdictOver: '{accused} says <b>{bid}</b>, the answer is <b>{answer}</b> – that’s {diff} too many. {p} goes to <b>{accused}</b>.',
      verdictExact: '🎯 Spot on!', verdictExactText: '{accused} says <b>{bid}</b> – and that’s exactly it! {challenger} accused wrongly and gets {p}.',
      verdictSafe: '✋ Nothing overdone!', verdictSafeText: '{accused} says <b>{bid}</b>, the answer is <b>{answer}</b> – still {diff} to spare. {challenger} accused wrongly and gets {p}.',
      gameOver: 'Game over', tie: 'It’s a tie! Everyone has {n}.', winner: '🏆 {names} wins', mostPoop: 'Most {p}: {names} ({n})',
      playAgain: 'Play again', editGame: 'Edit players & categories', home: 'Home', and: ' and ',
      rulesTitle: 'How to play',
      rules: [
        ['🎯', 'Read the question. <b>The answer is always a number.</b> The phone can stay on the table – nothing is hidden.'],
        ['1️⃣', 'The first player enters a bid. Get as close to the real answer as you can, but <b>don’t overshoot it</b>.'],
        ['⬆️', 'The next player must <b>bid a higher number</b>…'],
        ['💩', '…or press <b>“{challenge}”</b> if they think the previous bid is already above the real answer.'],
        ['⚖️', 'The answer is revealed. Whoever got it wrong – overshot, or accused wrongly – gets {p}. The accuser starts the next round.'],
        ['🏆', 'After the last round the player with the <b>fewest {p}</b> wins. The one with the most… well, they blew it.'],
      ],
      tip1: '💡 Tip: A smart opening bid is low. The higher you bid, the bigger the risk of getting caught. And feel free to bluff – when you’re “low”, an accusation won’t hurt you.',
      tip2: '📚 Every fact is verified and comes with a source – one tap after each round opens it.',
      letsPlay: 'Let’s play',
      factsTitle: 'Facts & sources', factsIntro: '{n} questions. Answers are hidden so you don’t spoil the game – reveal them only to check a source.',
      showAnswer: 'Show answer', hideAnswer: 'Hide answer',
      quitTitle: 'Quit the game?', quitText: 'The current game will be discarded and the score won’t count.', backToGame: 'Back to game', quit: 'Quit',
      repeatAllTitle: 'You’ve played all the questions', repeatSomeTitle: 'Questions will repeat',
      repeatAllText: 'This group has already played all {total} questions in the selected categories. You can keep playing – questions will repeat (the least recently played first) – or add categories.',
      repeatSomeText: 'This group has only {fresh} left; the remaining rounds will use questions someone here has already played. Adding categories or shortening the game helps.',
      edit: 'Edit', playAnyway: 'Play anyway',
      resetTitle: 'Reset question history?', resetText: 'The app will forget which questions everyone has played. All questions will be offered as new again.', reset: 'Reset',
      langSwitch: 'Přepnout do češtiny',
    },
  };

  /* ---------- Data ---------- */
  const FACTS = (Array.isArray(window.FACTS) ? window.FACTS : [])
    .filter(f => f && CATEGORIES[f.category] && Number.isInteger(f.answer) && f.question);
  const factsByCategory = {};
  for (const f of FACTS) (factsByCategory[f.category] ||= []).push(f);
  const availableCategories = CATEGORY_ORDER.filter(c => factsByCategory[c]);

  /* ---------- Pomocné funkce ---------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* nic */ } },
  };
  function detectLang() {
    const saved = store.get(STORAGE.lang, null);
    if (saved === 'cs' || saved === 'en') return saved;
    const nav = String(navigator.language || '').toLowerCase();
    return nav.startsWith('cs') || nav.startsWith('sk') ? 'cs' : 'en';
  }
  let lang = detectLang();
  let numFmt = new Intl.NumberFormat(lang === 'cs' ? 'cs-CZ' : 'en-GB');
  const fmtNum = n => numFmt.format(n);
  const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? vars[k] : m));
  const t = (key, vars) => {
    const v = (I18N[lang] && I18N[lang][key]) ?? I18N.cs[key] ?? key;
    return typeof v === 'string' ? fill(v, vars) : v;
  };
  // Množné číslo: čeština 1 / 2–4 / 5+, angličtina 1 / ostatní.
  const plural = (n, forms) => {
    if (!forms) return '';
    const a = Math.abs(n);
    if (lang === 'en' || !('few' in forms)) return a === 1 ? forms.one : (forms.other ?? forms.many ?? forms.one);
    return a === 1 ? forms.one : (a >= 2 && a <= 4 ? forms.few : forms.many);
  };
  const tn = (key, n) => fill(plural(n, t(key)), { n: fmtNum(n) });
  const brand = () => BRAND[lang];
  const catName = c => CATEGORIES[c][lang] || CATEGORIES[c].cs;
  // Lokalizovaná pole faktu (EN s návratem k CS).
  const F = {
    q: f => (lang === 'en' && f.en && f.en.question) || f.question,
    unit: f => (lang === 'en' && f.en && f.en.unit) || f.unit,
    fact: f => (lang === 'en' && f.en && f.en.fact) || f.fact,
    note: f => (lang === 'en' && f.en ? (f.en.answerNote || '') : (f.answerNote || '')),
    src: f => (lang === 'en' ? String(f.sourceTitle).replace('Wikipedie (CS)', 'Czech Wikipedia') : f.sourceTitle),
  };
  const withUnit = (n, unit) => `${fmtNum(n)} ${plural(n, unit)}`.trim();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const vibrate = pattern => { try { navigator.vibrate && navigator.vibrate(pattern); } catch (_) { /* nic */ } };
  const joinNames = names => names.length <= 1 ? names.join('') : names.slice(0, -1).join(', ') + t('and') + names[names.length - 1];

  function setLang(next) {
    if (next !== 'cs' && next !== 'en') return;
    lang = next;
    numFmt = new Intl.NumberFormat(lang === 'cs' ? 'cs-CZ' : 'en-GB');
    store.set(STORAGE.lang, lang);
    document.documentElement.lang = lang;
    document.title = lang === 'cs' ? `${BRAND.cs.name} – párty hra o číslech` : `${BRAND.en.name} – the party game of numbers`;
  }

  /* ---------- Nastavení ---------- */
  function makePlayer(i) {
    return { name: '', color: PLAYER_COLORS[i % PLAYER_COLORS.length], emoji: PLAYER_EMOJI[i % PLAYER_EMOJI.length] };
  }
  function defaultSettings() {
    return { players: [makePlayer(0), makePlayer(1), makePlayer(2)], categories: availableCategories.slice(), rounds: 10 };
  }
  function loadSettings() {
    const s = store.get(STORAGE.settings, null);
    const d = defaultSettings();
    if (!s || typeof s !== 'object') return d;
    const players = Array.isArray(s.players) ? s.players.slice(0, MAX_PLAYERS).map((p, i) => ({
      name: typeof p.name === 'string' ? p.name.slice(0, 16) : '',
      color: PLAYER_COLORS.includes(p.color) ? p.color : PLAYER_COLORS[i % PLAYER_COLORS.length],
      emoji: PLAYER_EMOJI.includes(p.emoji) ? p.emoji : PLAYER_EMOJI[i % PLAYER_EMOJI.length],
    })) : d.players;
    while (players.length < MIN_PLAYERS) players.push(makePlayer(players.length));
    const categories = Array.isArray(s.categories) ? s.categories.filter(c => availableCategories.includes(c)) : d.categories;
    return {
      players,
      categories: categories.length ? categories : d.categories,
      rounds: ROUND_OPTIONS.includes(s.rounds) ? s.rounds : d.rounds,
    };
  }
  const saveSettings = () => store.set(STORAGE.settings, settings);
  const playerName = (p, i) => (p.name || '').trim() || t('playerN', { n: i + 1 });
  const freeColor = () => PLAYER_COLORS.find(c => !settings.players.some(p => p.color === c)) || PLAYER_COLORS[settings.players.length % PLAYER_COLORS.length];
  const freeEmoji = () => PLAYER_EMOJI.find(e => !settings.players.some(p => p.emoji === e)) || PLAYER_EMOJI[0];

  /* ---------- Stav ---------- */
  let settings = loadSettings();
  let game = null;
  let screen = 'home';
  let modal = null;
  const ui = { input: '', revealedFacts: new Set() };

  /* ---------- Výběr otázek a historie ---------- */
  // Historie se vede dvakrát: pro celý telefon (used) a pro každé jméno hráče (seen).
  // Když se k telefonu sejde jiná parta, ale někdo z ní už hrál, jeho otázky se nezopakují.
  const normName = n => String(n || '').trim().toLowerCase().replace(/\s+/g, ' ');
  function markUsed(id, names) {
    const used = store.get(STORAGE.used, []).filter(x => x !== id);
    used.push(id);
    store.set(STORAGE.used, used.slice(-1000));
    const seen = store.get(STORAGE.seen, {});
    for (const n of names || []) {
      const k = normName(n);
      if (!k) continue;
      const list = (seen[k] || []).filter(x => x !== id);
      list.push(id);
      seen[k] = list.slice(-1000);
    }
    store.set(STORAGE.seen, seen);
  }
  function excludedIds(names) {
    const ex = new Set(store.get(STORAGE.used, []));
    const seen = store.get(STORAGE.seen, {});
    for (const n of names || []) for (const id of (seen[normName(n)] || [])) ex.add(id);
    return ex;
  }
  function currentNames() { return settings.players.map(playerName); }
  function poolInfo(categories, names) {
    const pool = FACTS.filter(f => categories.includes(f.category));
    const ex = excludedIds(names);
    const fresh = pool.filter(f => !ex.has(f.id));
    return { total: pool.length, fresh: fresh.length };
  }
  function resetHistory() {
    store.set(STORAGE.used, []);
    store.set(STORAGE.seen, {});
  }
  function pickFacts(categories, count, names) {
    const pool = FACTS.filter(f => categories.includes(f.category));
    const ex = excludedIds(names);
    let fresh = shuffle(pool.filter(f => !ex.has(f.id)));
    const repeats = new Set();
    if (fresh.length < count) {
      // Nové otázky došly – doplní se nejdéle nehrané (podle pořadí v historii telefonu).
      const order = store.get(STORAGE.used, []);
      const rank = id => { const i = order.indexOf(id); return i < 0 ? -1 : i; };
      const older = pool.filter(f => ex.has(f.id)).sort((a, b) => rank(a.id) - rank(b.id));
      for (const f of older.slice(0, count - fresh.length)) repeats.add(f.id);
      fresh = fresh.concat(older);
    }
    // Pestrost: pokud to jde, dvě otázky ze stejné kategorie nejdou po sobě.
    const picked = [];
    const rest = fresh.slice(0, Math.max(count * 3, count));
    while (picked.length < count && rest.length) {
      const last = picked[picked.length - 1];
      let idx = rest.findIndex(f => !last || f.category !== last.category);
      if (idx < 0) idx = 0;
      picked.push(rest.splice(idx, 1)[0]);
    }
    return { facts: picked, repeats };
  }

  /* ---------- Herní akce ---------- */
  function startGame(force) {
    if (settings.players.length < MIN_PLAYERS) return;
    const names = currentNames();
    const info = poolInfo(settings.categories, names);
    if (!info.total) return;
    if (!force && info.fresh < Math.min(settings.rounds, info.total)) {
      modal = 'repeat';
      render();
      return;
    }
    const { facts, repeats } = pickFacts(settings.categories, settings.rounds, names);
    game = {
      players: settings.players.map((p, i) => ({ name: playerName(p, i), color: p.color, emoji: p.emoji, penalties: 0 })),
      facts,
      repeats,
      round: 0,
      totalRounds: facts.length,
      starter: 0,
      current: 0,
      bids: [],
      result: null,
    };
    ui.input = '';
    markUsed(facts[0].id, game.players.map(p => p.name));
    setScreen('game');
  }
  const currentFact = () => game.facts[game.round];
  const lastBid = () => game.bids[game.bids.length - 1] || null;
  const currentValue = () => (ui.input === '' ? null : Number(ui.input));
  function isValidBid(v) {
    if (v === null || !Number.isFinite(v)) return false;
    const last = lastBid();
    return last ? v > last.value : v >= 0;
  }
  function placeBid() {
    const v = currentValue();
    if (!isValidBid(v)) return;
    game.bids.push({ player: game.current, value: v });
    game.current = (game.current + 1) % game.players.length;
    ui.input = '';
    vibrate(12);
    render();
  }
  function challenge() {
    const last = lastBid();
    if (!last) return;
    const fact = currentFact();
    const overshoot = last.value > fact.answer;
    const loser = overshoot ? last.player : game.current;
    game.players[loser].penalties += 1;
    game.result = { challenger: game.current, accused: last.player, bid: last.value, overshoot, loser };
    setScreen('reveal');
  }
  function nextRound() {
    if (!game || !game.result) return;
    const nextStarter = game.result.challenger;
    game.round += 1;
    if (game.round >= game.totalRounds) {
      setScreen('results');
      return;
    }
    game.starter = nextStarter;
    game.current = nextStarter;
    game.bids = [];
    game.result = null;
    ui.input = '';
    markUsed(currentFact().id, game.players.map(p => p.name));
    setScreen('game');
  }
  function keyPress(k) {
    if (screen !== 'game') return;
    if (k === 'del') ui.input = ui.input.slice(0, -1);
    else if (k === 'clear') ui.input = '';
    else if (k === 'enter') { placeBid(); return; }
    else {
      if (ui.input === '0') ui.input = '';
      if (ui.input === '' && k === '000') { ui.input = '0'; }
      else if (ui.input.length + k.length <= MAX_DIGITS) ui.input += k;
      else { vibrate(30); return; }
    }
    updateBidUI();
  }

  /* ---------- Vykreslování ---------- */
  const $app = document.getElementById('app');

  function setScreen(name, { push = true } = {}) {
    screen = name;
    modal = null;
    render();
    window.scrollTo(0, 0);
    if (push) { try { history.pushState({ screen: name }, ''); } catch (_) { /* nic */ } }
  }

  function render() {
    const renderers = { home: renderHome, setup: renderSetup, game: renderGame, reveal: renderReveal, results: renderResults, rules: renderRules, facts: renderFacts };
    $app.innerHTML = (renderers[screen] || renderHome)() + (modal ? renderModal() : '');
    afterRender();
  }

  const langToggle = () => `<button class="lang-toggle" data-action="toggle-lang" aria-label="${esc(t('langSwitch'))}" title="${esc(t('langSwitch'))}">
      <span class="${lang === 'cs' ? 'on' : ''}">CS</span><span class="${lang === 'en' ? 'on' : ''}">EN</span></button>`;

  function renderHome() {
    const b = brand();
    return `
    <section class="screen screen-home">
      <div class="home-top">${langToggle()}</div>
      <div class="hero">
        <div class="logo" aria-hidden="true">${BRAND.penalty}</div>
        <h1 class="title">${esc(b.name)}</h1>
        <p class="tagline">${esc(b.tagline)}</p>
      </div>
      <div class="stack">
        <button class="btn btn-primary btn-xl" data-action="go-setup">${esc(t('play'))}</button>
        <button class="btn btn-ghost" data-action="go-rules">${esc(t('howTo'))}</button>
        <button class="btn btn-ghost" data-action="go-facts">${esc(t('factsSources'))}</button>
      </div>
      <p class="footnote">${esc(t('footnote', { facts: tn('factsCount', FACTS.length), cats: tn('catsCount', availableCategories.length) }))}</p>
    </section>`;
  }

  function setupHint() {
    const info = poolInfo(settings.categories, currentNames());
    if (info.total === 0) return { text: t('hintNoCat'), warn: false };
    const rounds = Math.min(settings.rounds, info.total);
    if (info.fresh === 0) return { text: t('hintAllPlayed', { total: tn('questionsCount', info.total) }), warn: true };
    if (info.fresh < rounds) return { text: t('hintFewNew', { fresh: tn('questionsCount', info.fresh), rest: fmtNum(rounds - info.fresh) }), warn: true };
    if (info.total < settings.rounds) return { text: t('hintShort', { total: tn('questionsCount', info.total), rounds: tn('roundsCount', info.total) }), warn: false };
    return { text: t('hintOk', { fresh: fmtNum(info.fresh), total: fmtNum(info.total) }), warn: false };
  }
  function updateSetupHint() {
    const el = document.getElementById('setup-hint');
    if (!el) return;
    const h = setupHint();
    el.textContent = h.text;
    el.classList.toggle('warn', h.warn);
  }

  function renderSetup() {
    const n = settings.players.length;
    const available = settings.categories.reduce((s, c) => s + (factsByCategory[c] || []).length, 0);
    const canStart = n >= MIN_PLAYERS && available > 0;
    const h = setupHint();
    const allOn = settings.categories.length === availableCategories.length;
    return `
    <section class="screen">
      <header class="topbar">
        <button class="icon-btn" data-action="go-home" aria-label="${esc(t('back'))}">←</button>
        <h2 class="topbar-title">${esc(t('newGame'))}</h2>
        ${langToggle()}
      </header>

      <div class="card">
        <div class="card-head"><h3>${esc(t('players'))}</h3><span class="muted">${n} / ${MAX_PLAYERS}</span></div>
        <ul class="players">
          ${settings.players.map((p, i) => `
          <li class="player-row" style="--c:${p.color}">
            <button class="avatar" data-action="cycle-emoji" data-index="${i}" aria-label="${esc(t('changeIcon'))}">${p.emoji}</button>
            <input type="text" data-field="name" data-index="${i}" value="${esc(p.name)}" placeholder="${esc(t('playerN', { n: i + 1 }))}" maxlength="16" autocomplete="off" autocapitalize="words" enterkeyhint="done" aria-label="${esc(t('playerName', { n: i + 1 }))}">
            <button class="icon-btn small" data-action="remove-player" data-index="${i}" aria-label="${esc(t('removePlayer'))}" ${n <= MIN_PLAYERS ? 'disabled' : ''}>✕</button>
          </li>`).join('')}
        </ul>
        ${n < MAX_PLAYERS ? `<button class="btn btn-soft" data-action="add-player">${esc(t('addPlayer'))}</button>` : ''}
      </div>

      <div class="card">
        <div class="card-head"><h3>${esc(t('categories'))}</h3><button class="link" data-action="toggle-all-categories">${esc(allOn ? t('clearAll') : t('selectAll'))}</button></div>
        <div class="chips">
          ${availableCategories.map(c => `<button class="chip ${settings.categories.includes(c) ? 'on' : ''}" data-action="toggle-category" data-cat="${c}" aria-pressed="${settings.categories.includes(c)}">${CATEGORIES[c].emoji} ${esc(catName(c))} <small>${factsByCategory[c].length}</small></button>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>${esc(t('rounds'))}</h3></div>
        <div class="segmented">
          ${ROUND_OPTIONS.map(r => `<button class="${settings.rounds === r ? 'on' : ''}" data-action="set-rounds" data-rounds="${r}" aria-pressed="${settings.rounds === r}">${r}</button>`).join('')}
        </div>
      </div>
      <p class="history-note">${esc(t('historyNote'))} <button class="link" data-action="reset-history">${esc(t('resetHistory'))}</button></p>

      <div class="sticky-bottom">
        <button class="btn btn-primary btn-xl" data-action="start-game" ${canStart ? '' : 'disabled'}>${esc(t('startGame'))}</button>
        <p class="hint ${h.warn ? 'warn' : ''}" id="setup-hint">${esc(h.text)}</p>
      </div>
    </section>`;
  }

  function renderScoreboard() {
    const dense = game.players.length > 4;
    return `<div class="scoreboard ${dense ? 'dense' : ''}" aria-label="${esc(t('scoreboard'))}">
      ${game.players.map((p, i) => `<div class="score-pill ${i === game.current && screen === 'game' ? 'current' : ''}" style="--c:${p.color}">
        <span class="avatar xs">${p.emoji}</span><span class="pill-name">${esc(p.name)}</span><span class="pill-score">${p.penalties ? p.penalties + ' ' + BRAND.penalty : '–'}</span>
      </div>`).join('')}
    </div>`;
  }

  function renderBids() {
    if (!game.bids.length) {
      return `<span class="bids-empty">${esc(t('noBids', { name: game.players[game.starter].name }))}</span>`;
    }
    return game.bids.map((b, i) => {
      const p = game.players[b.player];
      return `<span class="bid-chip ${i === game.bids.length - 1 ? 'last' : ''}" style="--c:${p.color}"><span class="dot"></span>${esc(p.name)} <b>${fmtNum(b.value)}</b></span>`;
    }).join('<span class="bid-arrow">›</span>');
  }

  function bidDisplayHTML() {
    const fact = currentFact();
    const v = currentValue();
    const unit = plural(v === null ? 0 : v, F.unit(fact));
    const len = ui.input.length;
    const sizeCls = len > 10 ? 'len-xl' : len > 8 ? 'len-lg' : len > 6 ? 'len-md' : '';
    return `<span class="bid-value ${v === null ? 'empty' : ''} ${sizeCls}">${v === null ? '0' : fmtNum(v)}</span>` +
      (unit ? `<span class="bid-unit">${esc(unit)}</span>` : '') +
      (ui.input ? `<button class="clear-btn" data-key="clear" aria-label="${esc(t('clear'))}">×</button>` : '');
  }

  function bidHint() {
    const last = lastBid();
    const v = currentValue();
    if (!last) return { text: t('firstBid'), warn: false };
    if (v !== null && v <= last.value) return { text: t('mustBeMore', { n: fmtNum(last.value) }), warn: true };
    return { text: t('moreThan', { n: fmtNum(last.value) }), warn: false };
  }

  function updateBidUI() {
    const display = document.getElementById('bid-display');
    const btn = document.getElementById('bid-btn');
    const hintEl = document.getElementById('bid-hint');
    if (!display || !btn || !hintEl) return;
    display.innerHTML = bidDisplayHTML();
    btn.disabled = !isValidBid(currentValue());
    const h = bidHint();
    hintEl.textContent = h.text;
    hintEl.classList.toggle('warn', h.warn);
  }

  function renderGame() {
    const fact = currentFact();
    const last = lastBid();
    const cur = game.players[game.current];
    const h = bidHint();
    return `
    <section class="screen screen-game">
      <header class="topbar">
        <button class="icon-btn" data-action="quit-game" aria-label="${esc(t('quitGame'))}">✕</button>
        <div class="round-info">${esc(t('round'))} <b>${game.round + 1}</b> / ${game.totalRounds}</div>
        <div class="cat-chip">${CATEGORIES[fact.category].emoji} ${esc(catName(fact.category))}</div>
      </header>
      ${renderScoreboard()}
      <div class="question-card"><p class="question">${esc(F.q(fact))}</p>${game.repeats && game.repeats.has(fact.id) ? `<span class="repeat-badge">${esc(t('repeatBadge'))}</span>` : ''}</div>
      <div class="bids" id="bids">${renderBids()}</div>
      <div class="input-card" style="--c:${cur.color}">
        <div class="turn">
          <span class="avatar sm">${cur.emoji}</span>
          <span class="name">${esc(cur.name)}</span>
          <span class="hint ${h.warn ? 'warn' : ''}" id="bid-hint">${esc(h.text)}</span>
        </div>
        <div class="bid-display" id="bid-display">${bidDisplayHTML()}</div>
        <div class="keypad" aria-label="${esc(t('keypad'))}">
          ${['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => `<button class="key" data-key="${k}">${k}</button>`).join('')}
          <button class="key fn" data-key="000">000</button>
          <button class="key" data-key="0">0</button>
          <button class="key fn" data-key="del" aria-label="${esc(t('delDigit'))}">⌫</button>
        </div>
        <div class="actions">
          <button class="btn btn-danger" data-action="challenge" ${last ? '' : 'disabled'}>${BRAND.penalty} ${esc(brand().challenge)}</button>
          <button class="btn btn-primary" data-action="bid" id="bid-btn" ${isValidBid(currentValue()) ? '' : 'disabled'}>${esc(t('bid'))}</button>
        </div>
      </div>
    </section>`;
  }

  function verdictContent() {
    const fact = currentFact();
    const r = game.result;
    const unit = F.unit(fact);
    const vars = {
      accused: esc(game.players[r.accused].name),
      challenger: esc(game.players[r.challenger].name),
      bid: withUnit(r.bid, unit),
      answer: withUnit(fact.answer, unit),
      diff: fmtNum(Math.abs(r.bid - fact.answer)),
      p: BRAND.penalty,
    };
    if (r.overshoot) return { cls: 'bad', title: `${BRAND.penalty} ${esc(brand().challenge)}`, text: t('verdictOver', vars) };
    if (r.bid === fact.answer) return { cls: 'good', title: t('verdictExact'), text: t('verdictExactText', vars) };
    return { cls: 'good', title: t('verdictSafe'), text: t('verdictSafeText', vars) };
  }

  function renderReveal() {
    const fact = currentFact();
    const v = verdictContent();
    const isLast = game.round + 1 >= game.totalRounds;
    const note = F.note(fact);
    return `
    <section class="screen screen-reveal">
      <header class="topbar">
        <span></span>
        <div class="round-info">${esc(t('round'))} <b>${game.round + 1}</b> / ${game.totalRounds}</div>
        <div class="cat-chip">${CATEGORIES[fact.category].emoji} ${esc(catName(fact.category))}</div>
      </header>
      <p class="question-small">${esc(F.q(fact))}</p>
      <div class="answer-card">
        <div class="answer-label">${esc(t('correctAnswer'))}</div>
        <div class="bignum ${String(fact.answer).length > 8 ? 'len-lg' : ''}" id="count">0</div>
        <div class="answer-unit" id="count-unit">${esc(plural(0, F.unit(fact)))}</div>
        ${note ? `<div class="answer-note">${esc(note)}</div>` : ''}
      </div>
      <div class="verdict ${v.cls}" id="verdict" hidden>
        <div class="verdict-title">${v.title}</div>
        <p class="verdict-text">${v.text}</p>
      </div>
      <div class="card fact-card" id="fact-card" hidden>
        <h4>${esc(t('didYouKnow'))}</h4>
        <p>${esc(F.fact(fact))}</p>
        <a class="source" href="${esc(fact.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(t('source'))}: ${esc(F.src(fact))} ↗</a>
      </div>
      <div class="sticky-bottom">
        <button class="btn btn-primary btn-xl" data-action="next-round" id="next-btn" disabled>${esc(isLast ? t('results') : t('nextRound'))}</button>
      </div>
    </section>`;
  }

  function renderResults() {
    const sorted = game.players.map((p, i) => ({ ...p, i })).sort((a, b) => a.penalties - b.penalties);
    const min = sorted[0].penalties;
    const max = sorted[sorted.length - 1].penalties;
    const tie = min === max;
    const winners = sorted.filter(p => p.penalties === min);
    const losers = sorted.filter(p => p.penalties === max);
    const headline = tie ? t('tie', { n: tn('poopCount', min) }) : t('winner', { names: esc(joinNames(winners.map(p => p.name))) });
    const sub = tie ? '' : t('mostPoop', { p: BRAND.penalty, names: esc(joinNames(losers.map(p => p.name))), n: max });
    return `
    <section class="screen screen-results">
      <div class="hero small"><div class="logo" aria-hidden="true">${tie ? '🤝' : '🏆'}</div><h2>${esc(t('gameOver'))}</h2></div>
      <p class="result-headline">${headline}${sub ? `<span class="muted">${sub}</span>` : ''}</p>
      <div class="card">
        <ol class="ranking">
          ${sorted.map((p, idx) => `
          <li class="rank-row ${!tie && p.penalties === min ? 'winner' : ''} ${!tie && p.penalties === max ? 'loser' : ''}" style="--c:${p.color};--i:${idx}">
            <span class="rank-pos">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1 + '.'}</span>
            <span class="avatar sm">${p.emoji}</span>
            <span class="rank-name">${esc(p.name)}</span>
            <span class="rank-score">${p.penalties} ${BRAND.penalty}</span>
          </li>`).join('')}
        </ol>
      </div>
      <div class="stack">
        <button class="btn btn-primary btn-xl" data-action="play-again">${esc(t('playAgain'))}</button>
        <button class="btn btn-ghost" data-action="go-setup">${esc(t('editGame'))}</button>
        <button class="btn btn-ghost" data-action="go-home">${esc(t('home'))}</button>
      </div>
    </section>`;
  }

  function renderRules() {
    const vars = { challenge: esc(brand().challenge), p: BRAND.penalty };
    return `
    <section class="screen">
      <header class="topbar">
        <button class="icon-btn" data-action="go-home" aria-label="${esc(t('back'))}">←</button>
        <h2 class="topbar-title">${esc(t('rulesTitle'))}</h2>
        ${langToggle()}
      </header>
      <div class="rules">
        ${t('rules').map(([ico, text]) => `<div class="rule"><span class="ico">${ico}</span><p>${fill(text, vars)}</p></div>`).join('')}
      </div>
      <p class="tip">${esc(t('tip1'))}</p>
      <p class="tip">${esc(t('tip2'))}</p>
      <div class="sticky-bottom"><button class="btn btn-primary btn-xl" data-action="go-setup">${esc(t('letsPlay'))}</button></div>
    </section>`;
  }

  function renderFacts() {
    return `
    <section class="screen">
      <header class="topbar">
        <button class="icon-btn" data-action="go-home" aria-label="${esc(t('back'))}">←</button>
        <h2 class="topbar-title">${esc(t('factsTitle'))}</h2>
        ${langToggle()}
      </header>
      <p class="facts-intro">${esc(t('factsIntro', { n: fmtNum(FACTS.length) }))}</p>
      <div class="stack">
        ${availableCategories.map(c => `
        <details class="fact-group">
          <summary>${CATEGORIES[c].emoji} ${esc(catName(c))} <span class="count">${factsByCategory[c].length}</span></summary>
          ${factsByCategory[c].map(f => {
            const open = ui.revealedFacts.has(f.id);
            const note = F.note(f);
            return `<div class="fact-item">
              <p class="q">${esc(F.q(f))}</p>
              <button class="link" data-action="reveal-fact" data-id="${esc(f.id)}">${esc(open ? t('hideAnswer') : t('showAnswer'))}</button>
              <div class="a" ${open ? '' : 'hidden'}>
                <span class="val">${withUnit(f.answer, F.unit(f))}</span>${note ? ` <span class="note">(${esc(note)})</span>` : ''}
                <p>${esc(F.fact(f))}</p>
                <a class="source" href="${esc(f.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(t('source'))}: ${esc(F.src(f))} ↗</a>
              </div>
            </div>`;
          }).join('')}
        </details>`).join('')}
      </div>
    </section>`;
  }

  function renderModal() {
    let title, text, buttons;
    if (modal === 'quit') {
      title = t('quitTitle'); text = t('quitText');
      buttons = `<button class="btn btn-ghost" data-action="close-modal">${esc(t('backToGame'))}</button><button class="btn btn-danger" data-action="confirm-quit">${esc(t('quit'))}</button>`;
    } else if (modal === 'repeat') {
      const info = poolInfo(settings.categories, currentNames());
      title = info.fresh === 0 ? t('repeatAllTitle') : t('repeatSomeTitle');
      text = info.fresh === 0 ? t('repeatAllText', { total: fmtNum(info.total) }) : t('repeatSomeText', { fresh: tn('newQuestionsCount', info.fresh) });
      buttons = `<button class="btn btn-ghost" data-action="close-modal">${esc(t('edit'))}</button><button class="btn btn-primary" data-action="start-anyway">${esc(t('playAnyway'))}</button>`;
    } else if (modal === 'reset') {
      title = t('resetTitle'); text = t('resetText');
      buttons = `<button class="btn btn-ghost" data-action="close-modal">${esc(t('back'))}</button><button class="btn btn-danger" data-action="confirm-reset">${esc(t('reset'))}</button>`;
    } else return '';
    return `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">${esc(title)}</h3>
        <p class="muted">${esc(text)}</p>
        <div class="row">${buttons}</div>
      </div>
    </div>`;
  }

  /* ---------- Po vykreslení ---------- */
  function afterRender() {
    if (screen === 'game') {
      const bids = document.getElementById('bids');
      if (bids) bids.scrollLeft = bids.scrollWidth;
    }
    if (screen === 'reveal') runReveal();
    if (screen === 'results') {
      const tie = game.players.every(p => p.penalties === game.players[0].penalties);
      if (!tie) confetti(3200);
      vibrate([30, 60, 30]);
    }
  }

  function runReveal() {
    const el = document.getElementById('count');
    const unitEl = document.getElementById('count-unit');
    const fact = currentFact();
    if (!el) return;
    const unit = F.unit(fact);
    const target = fact.answer;
    const duration = 1500;
    const start = performance.now();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      el.textContent = fmtNum(target);
      if (unitEl) unitEl.textContent = plural(target, unit);
      el.classList.add('pop');
      vibrate(game.result.overshoot ? [40, 40, 80] : [20]);
      const verdict = document.getElementById('verdict');
      const factCard = document.getElementById('fact-card');
      const next = document.getElementById('next-btn');
      setTimeout(() => {
        if (verdict) verdict.hidden = false;
        if (factCard) factCard.hidden = false;
        if (next) next.disabled = false;
      }, 350);
    };
    const frame = ts => {
      if (screen !== 'reveal' || finished) return;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(target * eased);
      el.textContent = fmtNum(v);
      if (unitEl) unitEl.textContent = plural(v, unit);
      if (p < 1) requestAnimationFrame(frame); else finish();
    };
    // Klepnutím na číslo se dá animace přeskočit.
    el.addEventListener('click', finish, { once: true });
    requestAnimationFrame(frame);
  }

  /* ---------- Konfety ---------- */
  function confetti(ms) {
    const cv = document.getElementById('confetti');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const parts = Array.from({ length: 170 }, (_, i) => ({
      x: Math.random() * W, y: -20 - Math.random() * H * 0.6,
      w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
      c: PLAYER_COLORS[i % PLAYER_COLORS.length],
      vy: 2.2 + Math.random() * 3, vx: -1 + Math.random() * 2,
      r: Math.random() * Math.PI, vr: -0.12 + Math.random() * 0.24,
    }));
    const start = performance.now();
    const frame = ts => {
      const el = ts - start;
      ctx.clearRect(0, 0, W, H);
      const alpha = el > ms - 700 ? Math.max(0, (ms - el) / 700) : 1;
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = alpha; ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (el < ms) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    };
    requestAnimationFrame(frame);
  }

  /* ---------- Akce ---------- */
  const actions = {
    'go-home': () => setScreen('home'),
    'go-setup': () => setScreen('setup'),
    'go-rules': () => setScreen('rules'),
    'go-facts': () => setScreen('facts'),
    'toggle-lang': () => { setLang(lang === 'cs' ? 'en' : 'cs'); render(); },
    'add-player': () => {
      if (settings.players.length >= MAX_PLAYERS) return;
      settings.players.push({ name: '', color: freeColor(), emoji: freeEmoji() });
      saveSettings(); render();
      const inputs = $app.querySelectorAll('[data-field="name"]');
      const last = inputs[inputs.length - 1];
      if (last) last.focus();
    },
    'remove-player': el => {
      if (settings.players.length <= MIN_PLAYERS) return;
      settings.players.splice(+el.dataset.index, 1);
      saveSettings(); render();
    },
    'cycle-emoji': el => {
      const p = settings.players[+el.dataset.index];
      const taken = new Set(settings.players.filter(x => x !== p).map(x => x.emoji));
      let idx = PLAYER_EMOJI.indexOf(p.emoji);
      for (let i = 0; i < PLAYER_EMOJI.length; i++) {
        idx = (idx + 1) % PLAYER_EMOJI.length;
        if (!taken.has(PLAYER_EMOJI[idx])) break;
      }
      p.emoji = PLAYER_EMOJI[idx];
      el.textContent = p.emoji;
      saveSettings();
    },
    'toggle-category': el => {
      const c = el.dataset.cat;
      const i = settings.categories.indexOf(c);
      if (i >= 0) settings.categories.splice(i, 1); else settings.categories.push(c);
      saveSettings(); render();
    },
    'toggle-all-categories': () => {
      settings.categories = settings.categories.length === availableCategories.length ? [] : availableCategories.slice();
      saveSettings(); render();
    },
    'set-rounds': el => { settings.rounds = +el.dataset.rounds; saveSettings(); render(); },
    'start-game': () => startGame(false),
    'play-again': () => startGame(false),
    'start-anyway': () => startGame(true),
    'reset-history': () => { modal = 'reset'; render(); },
    'confirm-reset': () => { resetHistory(); modal = null; render(); },
    'bid': placeBid,
    'challenge': challenge,
    'next-round': nextRound,
    'quit-game': () => { modal = 'quit'; render(); },
    'close-modal': () => { modal = null; render(); },
    'confirm-quit': () => { modal = null; game = null; setScreen('home'); },
    'reveal-fact': el => {
      const id = el.dataset.id;
      const item = el.closest('.fact-item');
      const a = item && item.querySelector('.a');
      if (ui.revealedFacts.has(id)) { ui.revealedFacts.delete(id); if (a) a.hidden = true; el.textContent = t('showAnswer'); }
      else { ui.revealedFacts.add(id); if (a) a.hidden = false; el.textContent = t('hideAnswer'); }
    },
  };

  $app.addEventListener('click', e => {
    const keyBtn = e.target.closest('[data-key]');
    if (keyBtn) { keyPress(keyBtn.dataset.key); return; }
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    if (el.classList.contains('modal-backdrop') && e.target !== el) return;
    const fn = actions[el.dataset.action];
    if (fn) fn(el, e);
  });

  $app.addEventListener('input', e => {
    const inp = e.target.closest('[data-field="name"]');
    if (!inp) return;
    settings.players[+inp.dataset.index].name = inp.value;
    saveSettings();
    updateSetupHint();
  });

  $app.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('[data-field="name"]')) e.target.blur();
  });

  // Klávesnice na počítači: číslice, Backspace, Enter (tip), Escape (zavřít dialog).
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal) { modal = null; render(); return; }
    if (screen !== 'game' || modal) return;
    if (e.target.matches('input, textarea')) return;
    if (/^[0-9]$/.test(e.key)) keyPress(e.key);
    else if (e.key === 'Backspace') keyPress('del');
    else if (e.key === 'Enter') keyPress('enter');
  });

  // Tlačítko zpět v prohlížeči / na Androidu.
  window.addEventListener('popstate', e => {
    if (screen === 'game' || screen === 'reveal') {
      try { history.pushState({ screen }, ''); } catch (_) { /* nic */ }
      if (!modal) { modal = 'quit'; render(); }
      return;
    }
    const target = (e.state && e.state.screen) || 'home';
    if (target === 'game' || target === 'reveal' || target === 'results') { setScreen('home', { push: false }); return; }
    setScreen(target, { push: false });
  });

  // Service worker (offline / instalace na plochu).
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/nosw/.test(location.search)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* nic */ }));
  }

  setLang(lang);
  try { history.replaceState({ screen: 'home' }, ''); } catch (_) { /* nic */ }
  render();
})();
