/*
 * readaloud.js — Vorlese-/"Podcast"-Funktion für die News-Briefing-Reports.
 *
 * Selbstständig: injiziert eigenes CSS, einen "Bericht vorlesen"-Button oben,
 * je einen Play-Button pro Sektion sowie eine Playback-Leiste am unteren
 * Bildschirmrand. Nutzt die Web-Speech-API (speechSynthesis) des Browsers.
 *
 * Der jeweils neueste Bericht bindet diese Datei über
 *   <script src="/news-briefing/assets/readaloud.js" defer></script>
 * ein (absoluter Pfad, funktioniert aus dem Root und aus reports/ gleich).
 *
 * Konvention der Reports (wird hier vorausgesetzt):
 *   - Zusammenfassung: <div class="ueberblick"> im <header> (mit <strong>-Label)
 *   - Sektionen:       <section class="ebene" id="global|national|lokal|social|song">
 *   - Song-Embed:      #song .spotify-embed iframe (open.spotify.com/embed/track/…)
 * Vorgelesen werden nur Inhalte (Überschriften, Fließtext, Hinweise). Nicht
 * vorgelesen: Navigations-/Layout-Chips (.tag, nav.toc), Quellenangaben
 * (.quelle), Bildunterschriften, Footer, technische Embeds.
 */
(function () {
  'use strict';

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  var SPOTIFY_API = 'https://open.spotify.com/embed/iframe-api/v1';

  var LABELS = {
    summary: 'Zusammenfassung',
    global: 'Global',
    national: 'National',
    lokal: 'Lokal (OWL)',
    social: 'Social',
    song: 'Song des Tages'
  };

  var ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 6h2v12H7zM20 6l-9 6 9 6z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6h2v12h-2zM4 6l9 6-9 6z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4L10.6 10.6l6.3-6.3z"/></svg>',
    small: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
  };

  var CSS = [
    '.ra-report-btn{display:inline-flex;align-items:center;gap:8px;margin:4px 0 18px;',
    'font:inherit;font-size:.92rem;font-weight:600;color:#faf8f4;background:#1c1a17;',
    'border:none;border-radius:22px;padding:9px 18px 9px 16px;cursor:pointer;',
    'box-shadow:0 2px 8px rgba(0,0,0,.14);transition:transform .08s ease,opacity .15s;}',
    '.ra-report-btn:hover{opacity:.92;}.ra-report-btn:active{transform:scale(.97);}',
    '.ra-report-btn svg{width:18px;height:18px;fill:currentColor;}',
    '.ra-sec-btn{display:inline-flex;align-items:center;justify-content:center;',
    'width:30px;height:30px;margin-left:12px;vertical-align:middle;padding:0;',
    'border:1px solid rgba(28,26,23,.22);border-radius:50%;background:#fff;color:#1c1a17;',
    'cursor:pointer;flex:0 0 auto;transition:background .12s,color .12s,transform .08s;}',
    '.ra-sec-btn:hover{background:#1c1a17;color:#faf8f4;}.ra-sec-btn:active{transform:scale(.94);}',
    '.ra-sec-btn svg{width:15px;height:15px;fill:currentColor;margin-left:1px;}',
    '.ueberblick .ra-sec-btn{margin-left:10px;}',
    '.ra-sec-btn.ra-on{background:#1c1a17;color:#faf8f4;}',
    '.ra-bar{position:fixed;left:0;right:0;bottom:0;z-index:99999;display:flex;justify-content:center;',
    'padding:0 12px 12px;pointer-events:none;padding-bottom:calc(12px + env(safe-area-inset-bottom));}',
    '.ra-panel{pointer-events:auto;position:relative;display:flex;flex-direction:column;align-items:center;',
    'gap:7px;width:100%;max-width:420px;background:#1c1a17;color:#faf8f4;border-radius:18px;',
    'padding:14px 22px 16px;box-shadow:0 10px 34px rgba(0,0,0,.30);',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Georgia,serif;}',
    '.ra-label{font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;opacity:.72;',
    'max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.ra-row{display:flex;align-items:center;gap:26px;}',
    '.ra-ctrl{display:inline-flex;align-items:center;justify-content:center;border:none;',
    'background:transparent;color:#faf8f4;cursor:pointer;padding:0;transition:transform .08s,opacity .15s;}',
    '.ra-ctrl:hover{opacity:.8;}.ra-ctrl:active{transform:scale(.92);}',
    '.ra-ctrl svg{fill:currentColor;}',
    '.ra-skip{width:34px;height:34px;}.ra-skip svg{width:26px;height:26px;}',
    '.ra-toggle{width:56px;height:56px;border-radius:50%;background:#faf8f4;color:#1c1a17;',
    'box-shadow:0 3px 10px rgba(0,0,0,.25);}',
    '.ra-toggle svg{width:26px;height:26px;margin-left:2px;}',
    '.ra-toggle.ra-paused svg{margin-left:3px;}',
    '.ra-close{position:absolute;top:-11px;right:-11px;width:26px;height:26px;border-radius:50%;',
    'background:#faf8f4;color:#1c1a17;border:none;cursor:pointer;display:inline-flex;',
    'align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.28);}',
    '.ra-close svg{width:14px;height:14px;fill:currentColor;}',
    '@media (prefers-reduced-motion:reduce){.ra-report-btn,.ra-sec-btn,.ra-ctrl{transition:none;}}'
  ].join('');

  // ---- Sektionsmodell -----------------------------------------------------

  var sections = [];   // { key, label, el, chunks:[...] }
  var voice = null;

  function cleanText(el) {
    var clone = el.cloneNode(true);
    var junk = clone.querySelectorAll(
      'button, .quelle, .tag, .spotify-embed, svg, figure, figcaption, script, style, nav'
    );
    for (var i = 0; i < junk.length; i++) junk[i].parentNode.removeChild(junk[i]);
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  var ABBR = {};
  ['z.b','d.h','u.a','u.ä','o.ä','ca','bzw','inkl','mrd','mio','nr','tel','st','str',
   'ggf','evtl','usw','etc','abs','art','vgl','dr','prof','sog','max','min','bspw','ph']
    .forEach(function (a) { ABBR[a] = true; });

  // Trennt an Aufzählungsmarken „(1) (2) …" bzw. „(a) (b) …" und entfernt die
  // Marke selbst — so entsteht zwischen den Punkten eine hörbare Pause.
  function splitEnum(s) {
    var parts = s.split(/\s*\((?:\d{1,2}|[a-hA-H])\)\s*/);
    var res = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].replace(/\s+/g, ' ').trim();
      if (p) res.push(p);
    }
    return res.length ? res : [s];
  }

  function toSentences(text) {
    text = (text || '').replace(/\s+/g, ' ').trim();
    if (!text) return [];
    var raw = text.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [text];
    var out = [], buf = '';
    for (var i = 0; i < raw.length; i++) {
      var t = raw[i].trim();
      if (!t) continue;
      var cur = buf ? buf + ' ' + t : t;
      var lastWord = (cur.replace(/[.!?]+$/, '').split(/\s+/).pop() || '').toLowerCase();
      if (ABBR[lastWord]) { buf = cur; } else { out.push(cur); buf = ''; }
    }
    if (buf) out.push(buf);
    var expanded = [];
    for (var j = 0; j < out.length; j++) expanded = expanded.concat(splitEnum(out[j]));
    return expanded;
  }

  function extractSummary(el) {
    var chunks = [];
    var strong = el.querySelector('strong');
    if (strong) chunks = chunks.concat(toSentences(strong.textContent));
    var clone = el.cloneNode(true);
    var s = clone.querySelector('strong');
    if (s) s.parentNode.removeChild(s);
    var rest = clone.querySelectorAll('button, .ra-sec-btn');
    for (var i = 0; i < rest.length; i++) rest[i].parentNode.removeChild(rest[i]);
    chunks = chunks.concat(toSentences((clone.textContent || '').replace(/\s+/g, ' ').trim()));
    return chunks;
  }

  function extractSection(key, el) {
    var chunks = [];
    var blocks = el.querySelectorAll('h2, h3, p');
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (b.closest('.spotify-embed')) continue;
      if (b.matches('.quelle')) continue;
      if (key === 'song' && b.matches('.hinweis')) continue;
      var txt = cleanText(b);
      if (txt) chunks = chunks.concat(toSentences(txt));
    }
    return chunks;
  }

  function buildSections() {
    var defs = [
      { key: 'summary', el: document.querySelector('header .ueberblick') },
      { key: 'global', el: document.getElementById('global') },
      { key: 'national', el: document.getElementById('national') },
      { key: 'lokal', el: document.getElementById('lokal') },
      { key: 'social', el: document.getElementById('social') },
      { key: 'song', el: document.getElementById('song') }
    ];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      if (!d.el) continue;
      var chunks = d.key === 'summary' ? extractSummary(d.el) : extractSection(d.key, d.el);
      if (!chunks.length) continue;
      sections.push({ key: d.key, label: LABELS[d.key] || d.key, el: d.el, chunks: chunks });
    }
  }

  // ---- Stimme -------------------------------------------------------------

  function pickVoice() {
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^de([-_]|$)/i.test(v.lang); });
    if (!vs.length) return null;
    function score(v) {
      var s = 0, n = (v.name || '').toLowerCase();
      if (/de[-_]de/i.test(v.lang)) s += 3;
      if (/(neural|premium|enhanced|natural|siri|google)/.test(n)) s += 5;
      if (/(anna|petra|katja|conrad|amelie|markus|yannick|vicki|hedda|hannah|marlene|klara)/.test(n)) s += 2;
      if (v.localService) s += 1;
      return s;
    }
    return vs.slice().sort(function (a, b) { return score(b) - score(a); })[0];
  }
  function refreshVoice() { var v = pickVoice(); if (v) voice = v; }

  // ---- Spotify-Steuerung --------------------------------------------------

  var spotifyController = null;

  function setupSpotify() {
    var song = document.getElementById('song');
    if (!song) return;
    var iframe = song.querySelector('.spotify-embed iframe');
    if (!iframe) return;
    var m = (iframe.src || '').match(/embed\/track\/([A-Za-z0-9]+)/);
    if (!m) return;
    var trackId = m[1];
    var holder = document.createElement('div');
    iframe.parentNode.insertBefore(holder, iframe);
    window.onSpotifyIframeApiReady = function (IFrameAPI) {
      try {
        IFrameAPI.createController(
          holder,
          { uri: 'spotify:track:' + trackId, width: '100%', height: 152 },
          function (ctrl) {
            spotifyController = ctrl;
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          }
        );
      } catch (e) { /* Fallback: ursprüngliches iframe bleibt bestehen */ }
    };
    var s = document.createElement('script');
    s.src = SPOTIFY_API; s.async = true;
    document.body.appendChild(s);
  }

  // ---- Wiedergabe-Engine --------------------------------------------------

  var order = [];        // Indizes in `sections` in Abspielreihenfolge
  var pos = 0;           // Index in `order`
  var chunkIdx = 0;      // Index innerhalb der aktuellen Sektion
  var gen = 0;           // invalidiert veraltete utterance-Callbacks
  var paused = false;
  var finished = false;
  var spotifyActive = false;
  var gapTimer = null;       // Pause zwischen zwei Sprech-Einheiten
  var pendingResume = false; // in einer Pause pausiert -> beim Fortsetzen neu starten

  function stopSpeaking() {
    gen++;
    if (gapTimer) { clearTimeout(gapTimer); gapTimer = null; }
    pendingResume = false;
    try { speechSynthesis.cancel(); } catch (e) {}
  }

  function speak(text) {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    try { if (voice) u.voice = voice; } catch (e) { /* ungültige Stimme: Default nutzen */ }
    u.rate = 1; u.pitch = 1; u.volume = 1;
    var myGen = ++gen;
    function advance() {
      chunkIdx++;
      // Etwas längere Pause nach Satzende/Doppelpunkt, kürzere sonst.
      var gap = /[:.!?…]$/.test(text.replace(/\s+$/, '')) ? 320 : 170;
      gapTimer = setTimeout(function () {
        gapTimer = null;
        if (myGen !== gen) return;
        if (paused) { pendingResume = true; return; }
        speakStep();
      }, gap);
    }
    u.onend = function () { if (myGen !== gen) return; advance(); };
    u.onerror = function () { if (myGen !== gen) return; advance(); };
    try { speechSynthesis.cancel(); } catch (e) {}
    speechSynthesis.speak(u);
    paused = false; spotifyActive = false; finished = false;
    updateToggle();
  }

  function speakStep() {
    if (pos >= order.length) { finishPlayback(); return; }
    var sec = sections[order[pos]];
    setLabel(sec.label);
    setActiveSectionBtn(order[pos]);
    if (chunkIdx >= sec.chunks.length) { sectionDone(); return; }
    speak(sec.chunks[chunkIdx]);
  }

  function sectionDone() {
    var sec = sections[order[pos]];
    if (sec.key === 'song' && spotifyController) {
      stopSpeaking();
      spotifyActive = true; paused = false; finished = false;
      updateToggle();
      try { spotifyController.play(); } catch (e) {}
      try { sec.el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      return;
    }
    pos++; chunkIdx = 0;
    if (pos >= order.length) { finishPlayback(); return; }
    speakStep();
  }

  function finishPlayback() {
    stopSpeaking();
    finished = true; paused = true; spotifyActive = false;
    setActiveSectionBtn(-1);
    updateToggle();
  }

  function startPlayback(orderArr) {
    stopSpeaking();
    order = orderArr; pos = 0; chunkIdx = 0;
    paused = false; finished = false; spotifyActive = false; pendingResume = false;
    if (spotifyController) { try { spotifyController.pause(); } catch (e) {} }
    refreshVoice();
    showBar();
    speakStep();
  }

  function nextSection() {
    if (!order.length) return;
    stopSpeaking();
    if (spotifyActive && spotifyController) { try { spotifyController.pause(); } catch (e) {} }
    spotifyActive = false;
    pos++; chunkIdx = 0;
    if (pos >= order.length) { finishPlayback(); return; }
    speakStep();
  }

  function prevSection() {
    if (!order.length) return;
    stopSpeaking();
    if (spotifyActive) {
      // Aus dem Song-Clip zurück heißt: die Begründung erneut vorlesen.
      if (spotifyController) { try { spotifyController.pause(); } catch (e) {} }
      spotifyActive = false; chunkIdx = 0; speakStep(); return;
    }
    if (chunkIdx > 0 || finished) {
      chunkIdx = 0; finished = false; speakStep(); return; // aktuelle Sektion neu starten
    }
    pos = Math.max(0, pos - 1); chunkIdx = 0;
    speakStep();
  }

  function togglePause() {
    if (finished) { startPlayback(order.slice()); return; }
    if (spotifyActive) {
      if (paused) { try { spotifyController.play(); } catch (e) {} paused = false; }
      else { try { spotifyController.pause(); } catch (e) {} paused = true; }
      updateToggle(); return;
    }
    if (paused) {
      paused = false;
      if (pendingResume) { pendingResume = false; updateToggle(); speakStep(); return; }
      try { speechSynthesis.resume(); } catch (e) {}
    } else {
      try { speechSynthesis.pause(); } catch (e) {} paused = true;
    }
    updateToggle();
  }

  function closePlayer() {
    stopSpeaking();
    if (spotifyController) { try { spotifyController.pause(); } catch (e) {} }
    spotifyActive = false; paused = false; finished = false;
    setActiveSectionBtn(-1);
    hideBar();
  }

  // Chrome bricht lange Wiedergaben ohne diesen "keep-alive" ab.
  setInterval(function () {
    if (barVisible && !paused && !spotifyActive && speechSynthesis.speaking) {
      try { speechSynthesis.resume(); } catch (e) {}
    }
  }, 9000);

  // ---- UI -----------------------------------------------------------------

  var bar = null, panel = null, labelEl = null, toggleBtn = null;
  var barVisible = false;
  var secButtons = {}; // sectionIndex -> button

  function injectStyle() {
    var st = document.createElement('style');
    st.setAttribute('data-readaloud', '');
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function makeBtn(cls, icon, label, handler) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.innerHTML = icon;
    b.setAttribute('aria-label', label);
    b.title = label;
    b.addEventListener('click', handler);
    return b;
  }

  function injectReportButton() {
    var header = document.querySelector('header');
    if (!header) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ra-report-btn';
    btn.innerHTML = ICON.play + '<span>Bericht vorlesen</span>';
    btn.setAttribute('aria-label', 'Gesamten Bericht vorlesen');
    btn.addEventListener('click', function () {
      startPlayback(sections.map(function (_, i) { return i; }));
    });
    var anchor = header.querySelector('.datum');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    else header.appendChild(btn);
  }

  function injectSectionButtons() {
    for (var i = 0; i < sections.length; i++) {
      (function (idx) {
        var sec = sections[idx];
        var host = sec.key === 'summary'
          ? (sec.el.querySelector('strong') || sec.el)
          : sec.el.querySelector('h2');
        if (!host) return;
        var b = makeBtn('ra-sec-btn', ICON.small, 'Sektion „' + sec.label + '" vorlesen',
          function () { startPlayback([idx]); });
        host.appendChild(b);
        secButtons[idx] = b;
      })(i);
    }
  }

  function setActiveSectionBtn(idx) {
    for (var k in secButtons) {
      if (secButtons.hasOwnProperty(k)) {
        secButtons[k].classList.toggle('ra-on', String(idx) === k);
      }
    }
  }

  function buildBar() {
    bar = document.createElement('div');
    bar.className = 'ra-bar';
    bar.style.display = 'none';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Wiedergabe-Steuerung');

    panel = document.createElement('div');
    panel.className = 'ra-panel';

    var close = makeBtn('ra-close', ICON.close, 'Wiedergabe schließen', closePlayer);

    labelEl = document.createElement('div');
    labelEl.className = 'ra-label';
    labelEl.textContent = '';

    var row = document.createElement('div');
    row.className = 'ra-row';
    var prev = makeBtn('ra-ctrl ra-skip', ICON.prev, 'Vorherige Sektion', prevSection);
    toggleBtn = makeBtn('ra-ctrl ra-toggle', ICON.pause, 'Pause', togglePause);
    var next = makeBtn('ra-ctrl ra-skip', ICON.next, 'Nächste Sektion', nextSection);
    row.appendChild(prev); row.appendChild(toggleBtn); row.appendChild(next);

    panel.appendChild(close);
    panel.appendChild(labelEl);
    panel.appendChild(row);
    bar.appendChild(panel);
    document.body.appendChild(bar);
  }

  function showBar() { if (bar) { bar.style.display = 'flex'; barVisible = true; } }
  function hideBar() { if (bar) { bar.style.display = 'none'; barVisible = false; } }
  function setLabel(t) { if (labelEl) labelEl.textContent = t; }
  function updateToggle() {
    if (!toggleBtn) return;
    var showPlay = paused || finished;
    toggleBtn.innerHTML = showPlay ? ICON.play : ICON.pause;
    toggleBtn.classList.toggle('ra-paused', showPlay);
    toggleBtn.setAttribute('aria-label', showPlay ? 'Wiedergabe' : 'Pause');
    toggleBtn.title = showPlay ? 'Wiedergabe' : 'Pause';
  }

  // ---- Init ---------------------------------------------------------------

  function init() {
    buildSections();
    if (!sections.length) return;
    injectStyle();
    injectReportButton();
    injectSectionButtons();
    buildBar();
    setupSpotify();
    refreshVoice();
    if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
      speechSynthesis.onvoiceschanged = refreshVoice;
    }
    window.addEventListener('beforeunload', function () { try { speechSynthesis.cancel(); } catch (e) {} });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
