/* Tank Care Guide — routing, rendering, checklists, stage states, motion control. */
(function () {
  'use strict';

  var C = window.CONTENT;
  var L = C.shared.labels;
  var V = C.views;
  var ORDER = C.nav;
  var doc = document;

  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = mq.matches;

  /* ---------------------------------------------------------------------
     Text helpers
     --------------------------------------------------------------------- */
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  function esc(s) {
    return String(s).replace(/'/g, '’').replace(/[&<>"]/g, function (c) { return ESC[c]; });
  }
  // Escape first, then turn **…** into <strong>.
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }
  function f1(n) { return Math.round(n * 10) / 10; }
  function stepRange(r) { return r[0] === r[1] ? L.step + ' ' + r[0] : L.steps + ' ' + r[0] + '–' + r[1]; }

  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }

  /* ---------------------------------------------------------------------
     Icons — 24×24, 1.75 stroke, currentColor
     --------------------------------------------------------------------- */
  var I = {
    home: '<path class="f" d="M4.5 10.2 12 4l7.5 6.2V19a1 1 0 0 1-1 1H14v-5h-4v5H5.5a1 1 0 0 1-1-1z"/>',
    'water-changes': '<path class="f" d="M12 3.5c3.2 3.7 5.75 6.9 5.75 10.1a5.75 5.75 0 0 1-11.5 0C6.25 10.4 8.8 7.2 12 3.5z"/><path d="M14.4 14.4a2.4 2.4 0 1 1-1.2-2.08"/><path d="M12.55 10.9l.7 1.45-1.6.4"/>',
    paludariums: '<path d="M6 20.5Q8 10 18.5 4.5"/><path class="f" d="M7.5 15.3c-1.7-.3-2.9-1.4-3.3-3 1.7.1 2.9 1.1 3.3 3z"/><path class="f" d="M7.5 15.3c1.6 0 3 .8 3.8 2.2-1.6.1-3-.7-3.8-2.2z"/><path class="f" d="M9.4 12c-1.4-.6-2.3-1.8-2.4-3.4 1.4.6 2.3 1.8 2.4 3.4z"/><path class="f" d="M9.4 12c1.6-.2 3.1.4 4.1 1.7-1.6.2-3.1-.4-4.1-1.7z"/><path class="f" d="M12 9.1c-1-.8-1.6-2-1.4-3.4 1 .8 1.6 2 1.4 3.4z"/><path class="f" d="M12 9.1c1.5-.4 2.9 0 4 1-1.5.4-2.9 0-4-1z"/><path d="M15.2 6.6c-.4-.7-.5-1.6-.2-2.5M15.2 6.6c1-.2 2-.1 2.8.4"/>',
    begonias: '<path class="f" d="M10 13.5c-3.6 1.5-6.7.1-7-2.9C2.7 6.6 6.4 3.6 10.8 4.1c4.3.5 8.1 3.6 9.4 8.3.3 1-.5 1.4-1.3 1-1.9-1-3.7-1.3-5.5-.8-1.3.4-2.5.9-3.4.9z"/><path d="M10 13.5 8.5 20.5"/><path d="M10 13.5 6.3 8.4M10 13.5l3.4-6.1M10 13.5l6.6-1.5"/>',
    'making-water': '<path class="f" d="M3 7.5h8.5a5 5 0 0 1 5 5V14h-3v-1.5a2 2 0 0 0-2-2H3z"/><path d="M8.5 7.5v-3M6.5 4.5h4"/><path d="M15 17.3c.9 1.1 1.5 1.9 1.5 2.6a1.5 1.5 0 0 1-3 0c0-.7.6-1.5 1.5-2.6z"/>',
    video: '<rect x="3" y="7" width="12.5" height="10" rx="2.2"/><path d="M15.5 10.6 21 7.6v8.8l-5.5-3z"/>',
    power: '<path d="M12 3.5v8"/><path d="M7.4 6.4a7 7 0 1 0 9.2 0"/>',
    message: '<path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 17h-8.5l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 5z"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    hose: '<path d="M12 11.5a1.5 1.5 0 0 0-3 0 3 3 0 0 0 6 0 4.5 4.5 0 0 0-9 0 6 6 0 0 0 6 6h7.5"/>',
    razor: '<rect x="3" y="7.5" width="18" height="9" rx="1.5"/><path d="M7.5 12h9"/><path d="M3 10.5h1.5M19.5 10.5H21"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    chevron: '<path d="M9.5 6l6 6-6 6"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.9v.1"/>'
  };
  function icon(name, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + I[name] + '</svg>';
  }
  // The caution sticker: the only filled icon on the site.
  function sticker(cls) {
    return '<svg class="sticker' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M12 4.3 21.1 19.7H2.9z" fill="#F4B740" stroke="#F4B740" stroke-width="3.2" stroke-linejoin="round"/>' +
      '<path d="M12 9.6v4.7" stroke="#0A110F" stroke-width="2.1" stroke-linecap="round"/>' +
      '<circle cx="12" cy="17.1" r="1.15" fill="#0A110F"/></svg>';
  }

  /* ---------------------------------------------------------------------
     Small components
     --------------------------------------------------------------------- */
  function mono(pid, cls) {
    return '<span class="mono mono--' + pid + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + esc(C.people[pid].initial) + '</span>';
  }
  function pill(pid, compact) {
    return '<span class="pill' + (compact ? ' pill--compact' : '') + '">' + mono(pid) +
      '<span class="pill-name">' + esc(C.people[pid].name) + '</span></span>';
  }
  function cbox(cls) {
    return '<span class="cbox' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><span class="cbox-fill"></span><span class="cbox-ripple"></span>' +
      '<svg viewBox="0 0 26 26"><path d="M7.6 13.6l3.6 3.6 7.3-7.7" pathLength="1"/></svg></span>';
  }
  function qrow(i, text, range) {
    return '<button class="qrow" type="button" role="checkbox" aria-checked="false" data-idx="' + i + '">' + cbox() +
      '<span class="qrow-text"><span class="strike">' + fmt(text) + '</span></span>' +
      (range ? '<span class="qrow-range small">' + esc(range) + '</span>' : '') + '</button>';
  }
  function qhead(id, n) {
    return '<div class="qhead"><h2 class="eyebrow" id="ql-' + id + '">' + esc(L.quickList) + '</h2>' +
      '<div class="qmeta"><button class="reset" type="button" tabindex="-1" aria-hidden="true">' + esc(L.reset) + '</button>' +
      '<span class="count">0/' + n + '</span></div></div>';
  }
  function quickList(id, items) {
    return '<section class="qlist card stg" data-list="' + id + '" aria-labelledby="ql-' + id + '">' + qhead(id, items.length) +
      '<div class="qrows">' + items.map(function (it, i) { return qrow(i, it.text, stepRange(it.steps)); }).join('') + '</div>' +
      '<div class="done" aria-live="polite"></div></section>';
  }
  function viewHeader(id) {
    var v = V[id];
    return '<header class="vhead">' +
      '<div class="vhead-row stg"><p class="eyebrow">' + esc(v.eyebrow) + '</p>' + pill(v.owner) + '</div>' +
      '<h1 class="t-view view-title stg" id="t-' + id + '">' + esc(v.title) + '</h1>' +
      '<p class="body intro stg">' + fmt(v.intro) + '</p></header>';
  }
  function stepCard(s) {
    var v = s.variant, tag = '';
    if (v === 'critical') tag = '<span class="tag">' + esc(L.mostImportant) + '</span>';
    if (v === 'caution') tag = '<span class="tag tag--amber">' + esc(L.waterLevel) + '</span>';
    if (v === 'stay') tag = '<span class="tag tag--amber">' + esc(L.stayHome) + '</span>';
    return '<li class="step reveal' + (v ? ' step--' + v : '') + '"><span class="numeral">' + s.n + '</span>' +
      '<div class="step-body">' + tag + '<p>' + fmt(s.text) + '</p></div>' + (v === 'caution' ? sticker('step-sticker') : '') + '</li>';
  }
  // Tip: the bold lead becomes the "If there's time" eyebrow; the rest is the body.
  function tipCard(s) {
    var m = /^\*\*(.+?):?\*\*\s*([\s\S]*)$/.exec(s.text);
    var lead = m ? m[1] : L.ifTime, rest = m ? m[2] : s.text;
    return '<div class="tip reveal">' + icon('razor') + '<div><p class="eyebrow">' + esc(lead) + '</p>' +
      '<p class="body">' + fmt(rest) + '</p></div></div>';
  }
  // Render a run of steps as <ol>s, splitting around tip cards so numbering stays true.
  function stepList(steps) {
    var out = '', run = [];
    function flush() {
      if (!run.length) return;
      out += '<ol class="steps" start="' + run[0].n + '">' + run.map(stepCard).join('') + '</ol>';
      run = [];
    }
    steps.forEach(function (s) { if (s.tip) { flush(); out += tipCard(s); } else run.push(s); });
    flush();
    return out;
  }
  function stepsSection(id, inner) {
    return '<section class="steps-sec stg" aria-labelledby="st-' + id + '"><h2 class="eyebrow steps-label" id="st-' + id + '">' +
      esc(L.steps) + '</h2>' + inner + '</section>';
  }
  function strip() {
    return '<p class="strip small stg">' + icon('video') + '<span>' + fmt(C.shared.lookOff) + '</span></p>';
  }
  function stageWrap(cls, label, svg, chip) {
    return '<div class="stage ' + cls + ' stg" role="img" aria-label="' + esc(label) + '">' + svg +
      (chip ? '<span class="stage-chip" aria-hidden="true"></span>' : '') +
      '<span class="stage-badge" aria-hidden="true">' + icon('check') + '</span></div>';
  }

  /* ---------------------------------------------------------------------
     Illustrations
     --------------------------------------------------------------------- */
  function wavePath(amp, period, x0, len) {
    var d = 'M' + x0 + ' 0', s = -1;
    for (var x = x0; x < x0 + len; x += period / 2) {
      d += ' Q' + f1(x + period / 4) + ' ' + f1(s * amp * 2) + ' ' + f1(x + period / 2) + ' 0';
      s = -s;
    }
    return d + ' V230 H' + x0 + ' Z';
  }

  function stemPlant(x, base, h, lean) {
    var d = 'M' + x + ' ' + base + ' Q' + f1(x + lean * 0.3) + ' ' + f1(base - h * 0.5) + ' ' + f1(x + lean) + ' ' + f1(base - h);
    for (var y = base - 9; y > base - h + 3; y -= 8) {
      var t = (base - y) / h;
      var px = x + lean * (0.6 * t * (1 - t) + t * t);
      var k = 1 - t * 0.45;
      d += ' M' + f1(px) + ' ' + f1(y) + ' q' + f1(-5 * k) + ' ' + f1(-1 * k) + ' ' + f1(-8 * k) + ' ' + f1(-5 * k);
      d += ' M' + f1(px) + ' ' + f1(y - 3) + ' q' + f1(5 * k) + ' ' + f1(-1 * k) + ' ' + f1(8 * k) + ' ' + f1(-5 * k);
    }
    return d;
  }

  // Water Changes: a rimless tank (viewBox 360×200)
  var WC = { FULL: 56, STOP: 140 };
  function svgWaterChanges() {
    var Lx = 40, R = 256, T = 46, B = 172;
    var sandY = function (x) { return 150 + (x - Lx) / (R - Lx) * 10; };
    var plants = [[66, 70, -6, 7.5, 0], [88, 94, 5, 6.2, -2], [208, 82, -4, 7, -4], [232, 58, 6, 5.6, -1]].map(function (p) {
      var b = f1(sandY(p[0]) + 1);
      return '<g class="plant" style="transform-origin:' + p[0] + 'px ' + b + 'px;--d:' + p[3] + 's;--dl:' + p[4] + 's"><path class="ln-s" d="' + stemPlant(p[0], b, p[1], p[2]) + '"/></g>';
    }).join('');
    var bubbles = [[70, 150, 3.4, 0], [120, 158, 4.2, -1.2], [150, 152, 3.8, -2.6], [190, 160, 4.6, -0.6], [224, 154, 3.6, -3.1], [104, 160, 5, -2]].map(function (b, i) {
      return '<circle class="bub" cx="' + b[0] + '" cy="' + b[1] + '" r="' + (i % 2 ? 1.6 : 2.2) + '" style="--d:' + b[2] + 's;--dl:' + b[3] + 's" fill="none" stroke="currentColor"/>';
    }).join('');
    return '<svg viewBox="0 -20 360 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<clipPath id="wc-clip"><rect x="41" y="22" width="214" height="149"/></clipPath>' +
      '<linearGradient id="wc-wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--aqua);stop-opacity:.2"/><stop offset="1" style="stop-color:var(--aqua);stop-opacity:.07"/></linearGradient>' +
      '<linearGradient id="wc-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--aqua);stop-opacity:.16"/><stop offset="1" style="stop-color:var(--aqua);stop-opacity:0"/></linearGradient>' +
      '<radialGradient id="wc-bar" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--aqua);stop-opacity:.5"/><stop offset="1" style="stop-color:var(--aqua);stop-opacity:0"/></radialGradient>' +
      '</defs>' +
      // light bar + cone
      '<path class="wc-cone" d="M62 29 H234 L254 171 H42 Z" fill="url(#wc-cone)"/>' +
      '<ellipse class="wc-barglow" cx="148" cy="30" rx="100" ry="10" fill="url(#wc-bar)"/>' +
      '<path class="ln-s" d="M64 28 V46 M232 28 V46"/>' +
      '<rect class="ln fl" x="58" y="24" width="180" height="4.5" rx="2.25"/>' +
      // sand + plants
      '<path d="M41 150 C100 147 170 156 255 160 V171 H41 Z" fill="rgba(234,242,237,.045)"/>' +
      '<path class="ln-s" d="M41 150 C100 147 170 156 255 160"/>' +
      '<g clip-path="url(#wc-clip)">' + plants +
      // water
      '<g class="wc-water">' +
      '<g class="wc-waves">' +
      '<path class="wv wv-back" d="' + wavePath(1.2, 72, 38, 300) + '" style="--p:-72px;--d:7s" fill="var(--aqua)" fill-opacity=".07"/>' +
      '<path class="wv" d="' + wavePath(1.6, 54, 38, 290) + '" style="--p:-54px;--d:4.6s" fill="url(#wc-wg)" stroke="var(--aqua)" stroke-opacity=".7" stroke-width="1.5"/>' +
      '</g>' +
      '<g class="wc-flat"><rect x="38" y="0" width="222" height="230" fill="url(#wc-wg)"/><path class="ln" d="M38 0 H260"/></g>' +
      '<g class="wc-ripples"><ellipse class="ripple" cx="58" cy="0" rx="7" ry="1.6" fill="none" stroke="var(--aqua)" stroke-width="1"/><ellipse class="ripple" cx="58" cy="0" rx="7" ry="1.6" fill="none" stroke="var(--aqua)" stroke-width="1"/></g>' +
      '</g>' +
      // filters running: current + bubbles
      '<g class="wc-fx" style="color:var(--aqua)"><path class="ln-s cur" d="M70 104 C110 92 150 116 210 98"/><path class="ln-s cur" d="M84 128 C130 118 170 136 236 120" style="animation-delay:-1.4s"/>' + bubbles + '</g>' +
      // pump + drain hose
      '<g class="wc-pump"><path class="ln" d="M57 144 C57 112 50 66 48 44 C47 36 38 34 34 41 L30 171" stroke-opacity=".55"/><rect class="ln fl" x="48" y="144" width="18" height="11" rx="2.5"/><path class="ln-s" d="M52 147.5 V152 M57 147.5 V152 M62 147.5 V152"/></g>' +
      '</g>' +
      // refill: tubing, box with holes, stream
      '<g class="wc-refill"><path class="ln" d="M10 171 C14 104 22 46 42 38 C49 35 53 37 54 41" stroke-opacity=".55"/>' +
      '<rect class="ln fl" x="45" y="49" width="19" height="13" rx="1.5"/><path class="ln-s" d="M43 47 H66"/>' +
      '<circle cx="50" cy="58" r=".9" fill="var(--aqua)"/><circle cx="54.5" cy="58" r=".9" fill="var(--aqua)"/><circle cx="59" cy="58" r=".9" fill="var(--aqua)"/>' +
      '<g class="wc-stream"><path class="ln flow-d" d="M54 42 V50"/><path class="ln-s flow-d" d="M50 62.5 V74 M54.5 62.5 V78 M59 62.5 V72"/></g></g>' +
      // marker lines
      '<g class="wc-stop"><rect class="wc-stop-glow" x="259" y="133" width="54" height="15" rx="7.5" fill="var(--aqua)" fill-opacity=".16"/><path class="ln dash" d="M41 140 H255"/><text class="lbl" x="264" y="143.5">' + esc(L.stopHere) + '</text></g>' +
      '<g class="wc-rim2 amb"><path class="ln dash" d="M41 56 H255"/><text class="lbl" x="264" y="59.5">' + esc(L.cmBelowRim) + '</text></g>' +
      // glass + stand
      '<rect class="ln" x="40" y="46" width="216" height="126" rx="3" fill="var(--aqua)" fill-opacity=".025"/>' +
      '<path class="ln" d="M43 46.75 H253" stroke-opacity=".95"/>' +
      '<path class="ln-base" d="M22 174.5 H274"/>' +
      '</svg>';
  }

  // Making Water: a tote on a dolly (viewBox 360×200)
  var MW = { EMPTY: 160, LINE: 74, SLOW: 128 };
  function svgMakingWater() {
    var parts = '';
    for (var i = 0; i < 16; i++) {
      var a = i * 0.95, r = 5 + i * 1.75;
      parts += '<circle cx="' + f1(180 + Math.cos(a) * r) + '" cy="' + f1(120 + Math.sin(a) * r * 0.62) + '" r="' + (i % 3 ? 1.1 : 1.6) + '" fill="var(--pure)" fill-opacity="' + (0.5 + (i % 4) * 0.12) + '"/>';
    }
    var drop = function () { return '<path class="drop" d="M236 55c1.6 2.2 2.4 3.4 2.4 4.4a2.4 2.4 0 0 1-4.8 0c0-1 .8-2.2 2.4-4.4z" fill="var(--pure)" fill-opacity=".75"/>'; };
    return '<svg viewBox="0 -8 360 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="mw-clip"><path d="M113 55 H247 L240 160 H120 Z"/></clipPath>' +
      '<linearGradient id="mw-wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--pure);stop-opacity:.22"/><stop offset=".7" style="stop-color:var(--pure);stop-opacity:.08"/></linearGradient></defs>' +
      '<path class="ln-base" d="M56 182.5 H304"/>' +
      '<g clip-path="url(#mw-clip)"><g class="mw-water"><rect x="104" y="0" width="152" height="170" fill="url(#mw-wg)"/><path class="ln" d="M104 0 H256"/></g>' +
      '<g class="mw-swirl">' + parts + '</g></g>' +
      // tote body
      '<path class="ln" d="M112 54 H248 L241 157.5 Q240.6 161 237 161 H123 Q119.4 161 119 157.5 Z" fill="var(--pure)" fill-opacity=".025"/>' +
      '<path class="ln" d="M106 54 H254 M106 54 V58.5 M254 54 V58.5"/>' +
      '<g class="mw-line"><path class="ln dash" d="M115 74 H245"/><text class="lbl" x="258" y="77.5">' + esc(L.inFromRim) + '</text></g>' +
      // dolly
      '<rect class="ln fl" x="108" y="163" width="144" height="6" rx="3"/>' +
      '<circle class="ln" cx="126" cy="176" r="6"/><circle cx="126" cy="176" r="1.5" fill="var(--pure)" fill-opacity=".7"/>' +
      '<circle class="ln" cx="234" cy="176" r="6"/><circle cx="234" cy="176" r="1.5" fill="var(--pure)" fill-opacity=".7"/>' +
      // RODI line + clamp
      '<path class="ln" d="M362 22 C314 20 274 24 259 40 C253 46 247 50 236 52" stroke-opacity=".6"/>' +
      '<rect class="ln fl" x="248" y="46" width="10" height="14" rx="2"/>' +
      '<g class="drops">' + drop() + drop() + drop() + '</g>' +
      // lid
      '<g class="mw-lid"><rect class="ln fl" x="103" y="45" width="154" height="8" rx="3"/><path class="ln" d="M166 45 V41 H194 V45"/></g>' +
      '</svg>';
  }

  // Begonias: three asymmetric leaves rising from a planter (viewBox 360×200)
  function svgBegonias() {
    var blade = 'M0 0C-14 6-34 0-36-16C-38-34-20-50 8-60C6-46 22-32 20-15C18-3 8 2 0 0Z';
    var veins = 'M0 0Q2-30 7-56M0 0Q-14-10-27-26M0 0Q-16-2-28-8M0 0Q10-10 15-26M1.4-20Q-7-25-14-38M3.5-36Q10-39 13-44M-14-10Q-20-18-22-30';
    var leaves = [
      { bx: 166, by: 166, px: 136, py: 112, rot: -30, sx: -1, s: 1.0, d: 5.4, dl: -2.7 },
      { bx: 180, by: 166, px: 186, py: 96, rot: 4, sx: 1, s: 1.15, d: 6.4, dl: -9.6 },
      { bx: 194, by: 166, px: 228, py: 120, rot: 34, sx: 1, s: 0.9, d: 7, dl: -3.5 }
    ];
    var g = leaves.map(function (l) {
      var cx = (l.bx + l.px) / 2 + (l.px - l.bx) * 0.15, cy = (l.by + l.py) / 2 + 6;
      return '<g class="leaf" style="transform-origin:' + l.bx + 'px ' + l.by + 'px;--d:' + l.d + 's;--dl:' + l.dl + 's">' +
        '<path class="ln" d="M' + l.bx + ' ' + l.by + ' Q' + f1(cx) + ' ' + f1(cy) + ' ' + l.px + ' ' + l.py + '"/>' +
        '<g transform="translate(' + l.px + ' ' + l.py + ') rotate(' + l.rot + ') scale(' + (l.sx * l.s) + ' ' + l.s + ')">' +
        '<path class="ln blade" d="' + blade + '" vector-effect="non-scaling-stroke"/>' +
        '<path class="ln-s" d="' + veins + '" vector-effect="non-scaling-stroke"/></g></g>';
    }).join('');
    var r = rng(7), sp = '';
    for (var i = 0; i < 11; i++) {
      var x = f1(70 + r() * 70), y = f1(46 + r() * 90), k = f1(0.7 + r() * 0.8);
      sp += '<path class="sp" style="--dl:' + f1(r() * 0.7) + 's" transform="translate(' + x + ' ' + y + ') scale(' + k + ')" d="M0-3.2L.7-.7 3.2 0 .7.7 0 3.2-.7.7-3.2 0-.7-.7Z" fill="var(--rose)"/>';
    }
    return '<svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="bg-gl" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--rose);stop-opacity:.22"/><stop offset="1" style="stop-color:var(--rose);stop-opacity:0"/></radialGradient></defs>' +
      '<ellipse class="bg-glow" cx="182" cy="104" rx="120" ry="78" fill="url(#bg-gl)"/>' +
      g +
      '<path class="ln" d="M98 166.5 H262"/>' +
      '<path class="ln" d="M103 168 L110 188 Q111 190 113.5 190 H246.5 Q249 190 250 188 L257 168" fill="var(--rose)" fill-opacity=".04"/>' +
      '<g class="sparks">' + sp + '</g>' +
      '</svg>';
  }

  // Paludariums: one tank, viewBox width 50·n so widths are a true 1:2:3.
  function svgTank(n, seed) {
    var W = 50 * n, r = rng(seed), id = 'pt' + n;
    var base = 110, moss = 'M2 ' + base, x = 2;
    while (x < W - 2.5) {
      var w = Math.min(W - 2 - x, 9 + r() * 11), h = 4 + r() * 7;
      moss += ' Q' + f1(x + w / 2) + ' ' + f1(base - h * 2) + ' ' + f1(x + w) + ' ' + base;
      x += w;
    }
    moss += ' V112 H2 Z';
    // fern fronds
    var fx = W * (n === 1 ? 0.5 : 0.36 + r() * 0.08), fy = 101, fern = '';
    var count = 3 + n;
    for (var i = 0; i < count; i++) {
      var a = (-160 + (i + 0.5) * (140 / count) + (r() - 0.5) * 10) * Math.PI / 180;
      var len = (n === 1 ? 26 : 34) + r() * (n === 1 ? 8 : 16);
      var tx = fx + Math.cos(a) * len, ty = fy + Math.sin(a) * len * 0.9;
      var cx = fx + Math.cos(a) * len * 0.45, cy = fy + Math.sin(a) * len * 0.45 - len * 0.32;
      fern += 'M' + f1(fx) + ' ' + fy + ' Q' + f1(cx) + ' ' + f1(cy) + ' ' + f1(tx) + ' ' + f1(ty);
      for (var t = 0.22; t < 0.95; t += 0.14) {
        var bx = (1 - t) * (1 - t) * fx + 2 * t * (1 - t) * cx + t * t * tx;
        var by = (1 - t) * (1 - t) * fy + 2 * t * (1 - t) * cy + t * t * ty;
        var dx = 2 * (1 - t) * (cx - fx) + 2 * t * (tx - cx), dy = 2 * (1 - t) * (cy - fy) + 2 * t * (ty - cy);
        var m = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / m, ny = dx / m, ux = dx / m, uy = dy / m;
        var ll = 5 * (1 - t * 0.6);
        fern += ' M' + f1(bx) + ' ' + f1(by) + ' l' + f1(nx * ll + ux * ll * 0.5) + ' ' + f1(ny * ll + uy * ll * 0.5);
        fern += ' M' + f1(bx) + ' ' + f1(by) + ' l' + f1(-nx * ll + ux * ll * 0.5) + ' ' + f1(-ny * ll + uy * ll * 0.5);
      }
      fern += ' ';
    }
    var mist = '', delays = [0, -1.35, -2.7];
    for (var j = 0; j < n + 1; j++) {
      var mx = f1(W * (j + 0.7) / (n + 1.4)), md = f1(delays[n - 1] - j * 0.5);
      mist += '<ellipse class="mist" style="--md:' + md + 's" cx="' + mx + '" cy="24" rx="' + (9 + n * 2) + '" ry="6" fill="url(#' + id + '-m)"/>';
    }
    return '<svg viewBox="0 0 ' + W + ' 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="' + id + '-m" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#EAF2ED" stop-opacity=".3"/><stop offset="1" stop-color="#EAF2ED" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + '-g" cx=".5" cy=".6" r=".6"><stop offset="0" style="stop-color:var(--moss);stop-opacity:.24"/><stop offset="1" style="stop-color:var(--moss);stop-opacity:0"/></radialGradient></defs>' +
      '<rect class="pt-glow" x="1" y="4" width="' + (W - 2) + '" height="114" rx="2.5" fill="url(#' + id + '-g)"/>' +
      '<path class="ln-s" d="' + fern + '"/>' +
      '<path class="ln" d="' + moss + '" fill="var(--moss)" fill-opacity=".16"/>' +
      '<rect x="2" y="111" width="' + (W - 4) + '" height="6" fill="var(--moss)" fill-opacity=".16"/><path class="ln" d="M2 111 H' + (W - 2) + '" stroke-opacity=".55"/>' +
      mist +
      '<ellipse class="puff" cx="' + f1(W / 2) + '" cy="30" rx="' + (12 + n * 5) + '" ry="9" fill="url(#' + id + '-m)"/>' +
      '<rect class="ln pt-glass" x="1" y="4" width="' + (W - 2) + '" height="114" rx="2.5"/>' +
      '</svg>';
  }

  // Home hero aquascape ridges (viewBox 1440×300)
  function ridge(seed, base, amp, tufts, tuftH, stones) {
    var r = rng(seed), W = 1440, step = 90, pts = [];
    for (var x = -180; x <= W + 180; x += step) pts.push([x, base - r() * amp]);
    var d = 'M' + pts[0][0] + ' 320 L' + pts[0][0] + ' ' + f1(pts[0][1]);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ' C' + f1(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
        f1(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + p2[0] + ' ' + f1(p2[1]);
    }
    d += ' L' + pts[pts.length - 1][0] + ' 320 Z';
    var yAt = function (x) {
      var k = Math.floor((x + 180) / step), a = pts[k], b = pts[k + 1] || a;
      return a[1] + (b[1] - a[1]) * ((x - a[0]) / step);
    };
    for (var s = 0; s < stones; s++) {
      var sx = r() * W, rx = 14 + r() * 26, ry = rx * (0.5 + r() * 0.25), sy = yAt(sx) + ry * 0.35;
      d += ' M' + f1(sx - rx) + ' ' + f1(sy) + ' a' + f1(rx) + ' ' + f1(ry) + ' 0 1 1 ' + f1(2 * rx) + ' 0 a' + f1(rx) + ' ' + f1(ry) + ' 0 1 1 ' + f1(-2 * rx) + ' 0Z';
    }
    for (var t = 0; t < tufts; t++) {
      var tx = r() * W, blades = 4 + Math.floor(r() * 6);
      for (var b = 0; b < blades; b++) {
        var bx = tx + (r() - 0.5) * 18, by = yAt(bx) + 4, h = tuftH * (0.35 + r() * 0.85);
        var lean = (r() - 0.5) * h * 0.7, w = 1.4 + r() * 2.2;
        d += ' M' + f1(bx - w) + ' ' + f1(by) + ' Q' + f1(bx + lean * 0.35) + ' ' + f1(by - h * 0.6) + ' ' + f1(bx + lean) + ' ' + f1(by - h) +
          ' Q' + f1(bx + lean * 0.35 + w * 0.4) + ' ' + f1(by - h * 0.5) + ' ' + f1(bx + w) + ' ' + f1(by) + 'Z';
      }
    }
    return d;
  }
  function svgHeroScape() {
    return '<svg class="hero-scape" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' +
      '<g class="ridge" data-k="0.1"><path fill="#11231C" d="' + ridge(11, 150, 60, 30, 78, 5) + '"/></g>' +
      '<g class="ridge" data-k="0.2"><path fill="#0C1A15" d="' + ridge(23, 205, 44, 26, 58, 7) + '"/></g>' +
      '<g class="ridge" data-k="0.3"><path fill="#0A110F" d="' + ridge(37, 252, 30, 22, 40, 6) + '"/></g>' +
      '</svg>';
  }
  function heroBubbles() {
    var r = rng(5), out = '';
    for (var i = 0; i < 12; i++) {
      var s = f1(2 + r() * 3), d = f1(8 + r() * 6);
      out += '<span class="bubble" style="--x:' + f1(6 + r() * 88) + '%;--s:' + s + 'px;--d:' + d + 's;--dl:' + f1(-r() * d) + 's;--o:' + f1(0.15 + r() * 0.2) + '"></span>';
    }
    return out;
  }

  // Home water-level gauge (≈140×72)
  function gauge(g) {
    var rim = 12, surf = rim + g.gap, bottom = 64, ac = 'var(--' + g.accent + ')', id = 'gg-' + g.accent;
    return '<svg viewBox="0 0 140 72" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:' + ac + ';stop-opacity:.3"/><stop offset="1" style="stop-color:' + ac + ';stop-opacity:.08"/></linearGradient></defs>' +
      '<rect x="9" y="' + surf + '" width="82" height="' + (bottom - surf) + '" fill="url(#' + id + ')"/>' +
      '<path d="M9 ' + surf + ' H91" fill="none" style="stroke:' + ac + '" stroke-width="1.5"/>' +
      '<path d="M8 ' + rim + ' V' + bottom + ' H92 V' + rim + '" fill="none" stroke="#A3B5AC" stroke-opacity=".55" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M2 ' + rim + ' H98" fill="none" stroke="#EAF2ED" stroke-opacity=".7" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M102 ' + rim + ' H110 M106 ' + rim + ' V' + surf + ' M102 ' + surf + ' H110" fill="none" stroke="#F4B740" stroke-width="1.5" stroke-linecap="round"/>' +
      '<text x="114" y="' + f1((rim + surf) / 2 + 4) + '" fill="#F4B740" style="font:600 11px var(--font-ui)">' + esc(g.depth) + '</text>' +
      '</svg>';
  }

  /* ---------------------------------------------------------------------
     Views
     --------------------------------------------------------------------- */
  function renderHome() {
    var h = C.home, hero = h.hero, S = h.sections;

    var crew = Object.keys(C.people).map(function (pid) {
      var chips = ORDER.filter(function (id) { return V[id].owner === pid; }).map(function (id) {
        return '<a class="chip" href="#' + id + '" data-accent="' + V[id].accent + '"><span class="chip-dot"></span>' + esc(V[id].navLabel) + '</a>';
      });
      if (h.oneOff.owner === pid) {
        chips.push('<button class="chip" type="button" data-scroll="one-off" data-accent="text"><span class="chip-dot"></span>' + esc(h.oneOff.chip) + '</button>');
      }
      return '<article class="crew-card card">' + mono(pid, 'mono--lg') + '<h3 class="crew-name">' + esc(C.people[pid].name) + '</h3>' +
        '<div class="chips">' + chips.join('') + '</div></article>';
    }).join('');

    var sched = h.schedule.map(function (r) {
      var v = V[r.view];
      return '<li><a class="srow" href="#' + r.view + '" data-accent="' + v.accent + '"><span class="srow-main">' +
        '<span class="eyebrow">' + esc(r.frequency) + '</span><span class="lead">' + esc(r.task) + '</span>' + dots(r.dots, r.frequency) +
        '</span><span class="srow-side">' + pill(v.owner, true) + icon('chevron', 'chev') + '</span></a></li>';
    }).join('');

    var wl = h.waterLevels;
    var waterCard = '<div class="callout callout--warn wl"><div class="wl-head">' + sticker() + '<h3 class="lead">' + esc(wl.title) + '</h3></div>' +
      '<div class="gauges">' + wl.gauges.map(function (g) {
        return '<figure class="gauge">' + gauge(g) + '<figcaption>' + esc(g.label) + '</figcaption></figure>';
      }).join('') + '</div>' +
      wl.lines.map(function (l) { return '<p class="body">' + fmt(l) + '</p>'; }).join('') + '</div>';

    var bpRows = function (rows) {
      return '<ul class="bp-list">' + rows.map(function (r) {
        return '<li class="bp-row">' + icon(r.icon) + '<p class="body">' + fmt(r.text) + '</p></li>';
      }).join('') + '</ul>';
    };
    var everyone = '<div class="bp-group"><div class="bp-label"><span class="monos">' + mono('jon') + mono('matt') + '</span>' +
      '<h3 class="eyebrow">' + esc(h.everyone.label) + '</h3></div>' + bpRows(h.everyone.rows) + '</div>';
    var wcd = '<div class="bp-group"><div class="bp-label"><h3 class="eyebrow">' + esc(h.waterChangeDays.label) + '</h3>' + pill(h.waterChangeDays.owner) + '</div>' +
      bpRows(h.waterChangeDays.rows) + '</div>';

    var tanks = h.tanks.map(function (t) {
      return '<a class="tcard card" href="#' + t.view + '" data-accent="' + t.accent + '">' + icon(t.icon) + '<p class="body">' + fmt(t.text) + '</p>' + icon('chevron', 'chev') + '</a>';
    }).join('');

    var oneOff = '<div class="oneoff card" id="one-off" data-list="oneoff"><div class="oneoff-head"><h2 class="t-section">' + esc(S.oneOff) + '</h2>' + pill(h.oneOff.owner) + '</div>' +
      '<div class="qrows" role="group" aria-label="' + esc(S.oneOff) + '">' + h.oneOff.items.map(function (t, i) { return qrow(i, t); }).join('') + '</div></div>';

    return '<section class="hero" aria-labelledby="t-home">' +
      '<canvas class="hero-canvas" aria-hidden="true"></canvas>' +
      '<div class="hero-bubbles" aria-hidden="true">' + heroBubbles() + '</div>' +
      svgHeroScape() +
      '<div class="hero-text wrap stg">' +
      '<p class="eyebrow" style="--h:0">' + esc(hero.eyebrow) + '</p>' +
      '<h1 class="t-hero view-title" id="t-home" style="--h:1">' + esc(hero.title) + '</h1>' +
      '<p class="body hero-intro" style="--h:2">' + fmt(hero.intro) + '</p></div></section>' +
      '<div class="wrap home-body">' +
      '<section class="stg" aria-labelledby="s-crew"><h2 class="t-section sec-title" id="s-crew">' + esc(S.crew) + '</h2><div class="crew">' + crew + '</div></section>' +
      '<section class="stg" aria-labelledby="s-sched"><h2 class="t-section sec-title" id="s-sched">' + esc(S.schedule) + '</h2>' +
      '<ul class="sched card">' + sched + '</ul>' +
      '<div class="callout sched-note" data-accent="aqua">' + icon('info') + '<p class="body">' + fmt(h.scheduleNote) + '</p></div></section>' +
      '<section class="stg" aria-labelledby="s-bp"><h2 class="t-section sec-title" id="s-bp">' + esc(S.bestPractices) + '</h2>' + waterCard + everyone + wcd + '</section>' +
      '<section class="stg" aria-labelledby="s-tanks"><h2 class="t-section sec-title" id="s-tanks">' + esc(S.tanks) + '</h2><div class="tcards">' + tanks + '</div></section>' +
      '<section class="stg" aria-label="' + esc(S.oneOff) + '">' + oneOff + '</section>' +
      '<p class="small foot stg">' + esc(h.footer) + '</p>' +
      '</div>';
  }

  function dots(pattern, label) {
    if (pattern === 'as-needed') return '<span class="small srow-asneeded">' + esc(L.asNeeded) + '</span>';
    var on = { daily: [0, 1, 2, 3, 4, 5, 6], twice: [0, 3], 'weekly-ideal': [0] }[pattern] || [];
    var out = '<svg class="dots" viewBox="0 0 78 6" role="img" aria-label="' + esc(label) + '">';
    for (var i = 0; i < 7; i++) {
      var cx = 3 + i * 12;
      if (on.indexOf(i) > -1) out += '<circle cx="' + cx + '" cy="3" r="3" style="fill:var(--accent)"/>';
      else if (pattern === 'weekly-ideal' && i === 3) out += '<circle cx="' + cx + '" cy="3" r="2.5" fill="none" style="stroke:var(--accent)" stroke-width="1" stroke-dasharray="1.6 1.33"/>';
      else out += '<circle cx="' + cx + '" cy="3" r="2.5" fill="none" style="stroke:rgba(var(--accent-rgb),.3)" stroke-width="1"/>';
    }
    return out + '</svg>';
  }

  function renderWaterChanges() {
    var id = 'water-changes', v = V[id];
    var phases = v.phases.map(function (p, i) {
      var nums = p.steps.filter(function (s) { return !s.tip; }).map(function (s) { return s.n; });
      var range = stepRange([nums[0], nums[nums.length - 1]]);
      return '<div class="phase" data-phase-label="' + esc(p.name + ' · ' + range) + '">' +
        '<h3 class="phase-head"><span class="phase-num">' + (i + 1) + '</span><span class="eyebrow">' + esc(p.name) + '</span><span class="phase-line" aria-hidden="true"></span></h3>' +
        stepList(p.steps) + '</div>';
    }).join('');
    return '<div class="wrap flow">' + viewHeader(id) +
      '<p class="note stg">' + icon('info') + '<span>' + fmt(v.note) + '</span></p>' +
      stageWrap('wc', v.stageLabel, svgWaterChanges(), true) +
      quickList(id, v.quickList) +
      stepsSection(id, phases) + strip() + '</div>';
  }

  function renderPaludariums() {
    var id = 'paludariums', v = V[id];
    var tanks = v.tanks.map(function (t, i) {
      return '<button class="ptank" type="button" role="checkbox" aria-checked="false" aria-label="' + esc(t.label) + '" data-idx="' + i + '" style="--n:' + (i + 1) + '">' +
        '<span class="ptank-vis">' + svgTank(i + 1, 101 + i * 17) + '<span class="badge" aria-hidden="true">' + icon('check') + '</span></span>' +
        '<span class="ptank-name" aria-hidden="true">' + esc(t.name) + '</span><span class="eyebrow ptank-size" aria-hidden="true">' + esc(t.size) + '</span></button>';
    }).join('');
    return '<div class="wrap flow">' + viewHeader(id) +
      '<section class="tankcheck card stg" data-list="' + id + '" aria-labelledby="ql-' + id + '">' + qhead(id, v.tanks.length) +
      '<div class="tanks" role="group" aria-labelledby="ql-' + id + '">' + tanks + '</div>' +
      '<p class="small tank-helper">' + esc(v.helper) + '</p><div class="done" aria-live="polite"></div></section>' +
      stepsSection(id, stepList(v.steps)) + strip() + '</div>';
  }

  function renderBegonias() {
    var id = 'begonias', v = V[id];
    return '<div class="wrap flow">' + viewHeader(id) +
      stageWrap('bgs', v.stageLabel, svgBegonias(), false) +
      '<div class="single stg" data-list="' + id + '">' +
      '<button class="taskcard card" type="button" role="checkbox" aria-checked="false" data-idx="0">' + cbox('cbox--lg') +
      '<span class="taskcard-text"><span class="strike">' + fmt(v.task) + '</span></span></button>' +
      '<div class="done" aria-live="polite"></div></div>' +
      strip() + '</div>';
  }

  function renderMakingWater() {
    var id = 'making-water', v = V[id];
    return '<div class="wrap flow">' + viewHeader(id) +
      '<div class="callout callout--warn stg"><span class="sticker-wrap breathe">' + sticker() + '</span><p class="body">' + fmt(v.warning) + '</p></div>' +
      stageWrap('mw', v.stageLabel, svgMakingWater(), true) +
      quickList(id, v.quickList) +
      stepsSection(id, stepList(v.steps)) + strip() + '</div>';
  }

  /* ---------------------------------------------------------------------
     Motion control: stages only animate when their view is active, the
     stage is on-screen and the tab is visible.
     --------------------------------------------------------------------- */
  var active = null;
  var stages = [];
  var stageIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { var s = e.target.__stage; s.inView = e.isIntersecting; s.sync(); });
  }, { threshold: 0 });

  function makeStage(el, viewId, hooks) {
    var s = {
      el: el, viewId: viewId, inView: false, ready: false, playing: false,
      sync: function () {
        var go = s.inView && s.ready && active === s.viewId && !doc.hidden;
        if (go === s.playing) return;
        s.playing = go;
        el.classList.toggle('is-paused', !go);
        if (go) { if (hooks.play) hooks.play(); } else if (hooks.pause) hooks.pause();
      }
    };
    el.__stage = s;
    el.classList.add('is-paused');
    stageIO.observe(el);
    stages.push(s);
    return s;
  }

  function loop(fn, period) {
    var raf = 0, acc = 0, last = 0;
    function tick(now) {
      acc += Math.min(1000, now - last);
      last = now;
      fn((acc / 1000) % period);
      raf = requestAnimationFrame(tick);
    }
    return {
      start: function () { if (raf) return; last = performance.now(); raf = requestAnimationFrame(tick); },
      stop: function () { cancelAnimationFrame(raf); raf = 0; },
      reset: function () { acc = 0; },
      get running() { return !!raf; }
    };
  }

  function setChip(chip, text) {
    if (!chip || chip.textContent === text) return;
    chip.textContent = text;
    chip.classList.remove('swap');
    if (text && !reduced) { void chip.offsetWidth; chip.classList.add('swap'); }
  }

  /* --- Water Changes stage --- */
  function waterStage(el) {
    var water = $('.wc-water', el), chip = $('.stage-chip', el);
    var live = 0, phase = '', back = 0, stage;
    var LIVE_Y = [0, WC.FULL, WC.STOP, WC.FULL, WC.FULL, WC.FULL];
    function setPhase(p) { if (p !== phase) { phase = p; if (p) el.setAttribute('data-phase', p); else el.removeAttribute('data-phase'); } }
    function level(y) { water.style.transform = 'translateY(' + f1(y) + 'px)'; }
    var lp = loop(function (t) {
      var y;
      if (t < 1.5) { setPhase('full'); y = WC.FULL; setChip(chip, L.drain); }
      else if (t < 5) { setPhase('drain'); y = lerp(WC.FULL, WC.STOP, easeInOut((t - 1.5) / 3.5)); setChip(chip, L.drain); }
      else if (t < 6.5) { setPhase('hold'); y = WC.STOP; }
      else if (t < 10) { setPhase('refill'); y = lerp(WC.STOP, WC.FULL, easeInOut((t - 6.5) / 3.5)); setChip(chip, L.refill); }
      else { setPhase('done'); y = WC.FULL; }
      level(y);
    }, 12);
    function staticFrame() { water.classList.remove('tween'); setPhase('hold'); level(WC.STOP); setChip(chip, L.drain); }
    function play() {
      if (live || back) return;
      if (reduced) { lp.stop(); staticFrame(); return; }
      water.classList.remove('tween');
      lp.start();
    }
    stage = makeStage(el, 'water-changes', { play: play, pause: function () { lp.stop(); } });
    staticFrame();
    return {
      setLive: function (n, text) {
        if (n === live) { if (n) setChip(chip, text); return; }
        live = n;
        clearTimeout(back); back = 0;
        if (n) {
          lp.stop();
          setPhase('');
          el.setAttribute('data-live', n);
          el.classList.add('is-live');
          el.classList.toggle('is-badged', n === 5);
          water.classList.toggle('tween', !reduced);
          level(LIVE_Y[n]);
          setChip(chip, text);
        } else {
          el.removeAttribute('data-live');
          el.classList.remove('is-live', 'is-badged');
          if (reduced) { staticFrame(); return; }
          water.classList.add('tween');
          setPhase('full');
          level(WC.FULL);
          setChip(chip, L.drain);
          back = setTimeout(function () { back = 0; lp.reset(); if (stage.playing) play(); }, 1250);
        }
      }
    };
  }

  /* --- Making Water stage --- */
  function toteStage(el) {
    var water = $('.mw-water', el), chip = $('.stage-chip', el);
    var live = 0, phase = '', back = 0, stage;
    var LIVE_Y = [0, MW.SLOW, MW.LINE, MW.LINE, MW.LINE, MW.LINE];
    function setPhase(p) { if (p !== phase) { phase = p; if (p) el.setAttribute('data-phase', p); else el.removeAttribute('data-phase'); } }
    function level(y) {
      water.style.transform = 'translateY(' + f1(y) + 'px)';
      el.style.setProperty('--fall', f1(Math.max(10, y - 62)) + 'px');
    }
    var lp = loop(function (t) {
      if (t < 7) { setPhase('fill'); level(lerp(MW.EMPTY, MW.LINE, easeInOutSine(t / 7))); setChip(chip, ''); }
      else if (t < 9.5) { setPhase('mix'); level(MW.LINE); setChip(chip, L.mix); }
      else if (t < 12.3) { setPhase('lid'); setChip(chip, ''); }
      else { setPhase('fade'); }
    }, 14);
    function staticFrame() {
      water.classList.remove('tween');
      setPhase(''); el.classList.add('mw-static');
      level(MW.LINE); setChip(chip, '');
    }
    function play() {
      if (live || back) return;
      if (reduced) { lp.stop(); staticFrame(); return; }
      el.classList.remove('mw-static');
      water.classList.remove('tween');
      lp.start();
    }
    stage = makeStage(el, 'making-water', { play: play, pause: function () { lp.stop(); } });
    staticFrame();
    return {
      setLive: function (n, text) {
        if (n === live) { if (n) setChip(chip, text); return; }
        live = n;
        clearTimeout(back); back = 0;
        if (n) {
          lp.stop();
          setPhase('');
          el.classList.remove('mw-static');
          el.setAttribute('data-live', n);
          el.classList.add('is-live');
          el.classList.toggle('is-badged', n === 5);
          water.classList.toggle('tween', !reduced);
          water.style.transitionDuration = n === 1 ? '8s, 400ms' : '';
          level(LIVE_Y[n]);
          setChip(chip, text);
        } else {
          el.removeAttribute('data-live');
          el.classList.remove('is-live', 'is-badged');
          water.style.transitionDuration = '';
          if (reduced) { staticFrame(); return; }
          setPhase('fade');
          setChip(chip, '');
          back = setTimeout(function () {
            back = 0;
            water.classList.remove('tween');
            level(MW.EMPTY);
            lp.reset();
            setPhase('fill');
            if (stage.playing) play();
          }, 1250);
        }
      }
    };
  }

  /* --- Begonias stage --- */
  function leafStage(el) {
    var leaves = $$('.leaf', el);
    makeStage(el, 'begonias', {});
    return {
      setLive: function (on) {
        el.classList.toggle('is-live', on);
        el.classList.toggle('is-badged', on);
        if (on) {
          // Settle each leaf from wherever its sway is now.
          leaves.forEach(function (lf) {
            var m = getComputedStyle(lf).transform;
            lf.style.transform = m === 'none' ? '' : m;
            lf.classList.add('is-frozen');
            void lf.getBoundingClientRect();
            lf.style.transform = 'rotate(0deg)';
          });
          if (!reduced) { el.classList.remove('sparkle'); void el.getBoundingClientRect(); el.classList.add('sparkle'); }
        } else {
          el.classList.remove('sparkle');
          leaves.forEach(function (lf) { lf.classList.remove('is-frozen'); lf.style.transform = ''; });
        }
      }
    };
  }

  /* --- Home hero --- */
  function heroStage(el) {
    var cv = $('.hero-canvas', el), ctx = cv.getContext('2d');
    var ridges = $$('.ridge', el);
    var w = 0, h = 0, raf = 0, lastDraw = 0, t0 = performance.now(), acc = 0, last = 0;
    var bands = [];
    for (var i = 0; i < 7; i++) {
      bands.push({
        y: 0.04 + i * 0.1,
        a: 0.022 + (i % 3) * 0.008,
        f: 0.011 + (i % 4) * 0.0035,
        f2: 0.019 + (i % 3) * 0.004,
        p: i * 1.7,
        s: 2 * Math.PI / (20 + ((i * 7) % 10)),
        s2: 2 * Math.PI / (24 + ((i * 5) % 7)),
        col: i % 2 ? '92,198,214' : '142,211,138'
      });
    }
    function resize() {
      var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(acc / 1000);
    }
    function draw(t) {
      if (!w) return;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.save();
      ctx.translate(w / 2, h * 0.3); ctx.rotate(-0.16); ctx.translate(-w / 2, -h * 0.3);
      for (var i = 0; i < bands.length; i++) {
        var b = bands[i], by = b.y * h;
        ctx.beginPath();
        for (var x = -w * 0.25; x <= w * 1.25; x += 18) {
          var y = by + Math.sin(x * b.f + t * b.s + b.p) * b.a * h + Math.sin(x * b.f2 - t * b.s2 + b.p * 0.5) * b.a * 0.6 * h;
          if (x === -w * 0.25) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(' + b.col + ',0.035)'; ctx.lineWidth = 46; ctx.stroke();
        ctx.strokeStyle = 'rgba(' + b.col + ',0.05)'; ctx.lineWidth = 12; ctx.stroke();
      }
      ctx.restore();
      ctx.globalCompositeOperation = 'destination-in';
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,.7)'); g.addColorStop(0.9, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    function tick(now) {
      acc += Math.min(1000, now - last); last = now;
      if (now - lastDraw >= 33) { lastDraw = now; draw(acc / 1000); } // ≤30fps
      raf = requestAnimationFrame(tick);
    }
    var pending = false;
    function parallax() {
      pending = false;
      var y = window.scrollY || 0;
      ridges.forEach(function (r) { r.style.transform = 'translateY(' + f1(y * parseFloat(r.getAttribute('data-k'))) + 'px)'; });
    }
    var s = makeStage(el, 'home', {
      play: function () {
        if (reduced) { draw(8); return; }
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
      },
      pause: function () { cancelAnimationFrame(raf); raf = 0; }
    });
    window.addEventListener('scroll', function () {
      if (!s.playing || reduced || pending) return;
      pending = true; requestAnimationFrame(parallax);
    }, { passive: true });
    window.addEventListener('resize', function () { if (active === 'home') resize(); });
    acc = 8000;
    return { resize: resize, reset: function () { ridges.forEach(function (r) { r.style.transform = ''; }); } };
  }

  /* ---------------------------------------------------------------------
     Checklists (in memory only; a reload clears everything)
     --------------------------------------------------------------------- */
  function burstHTML() {
    var s = '<span class="burst" aria-hidden="true">';
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2 + 0.35, d = i % 2 ? 30 : 24;
      s += '<i style="--dx:' + f1(Math.cos(a) * d) + 'px;--dy:' + f1(Math.sin(a) * d * 0.8) + 'px"></i>';
    }
    return s + '</span>';
  }
  function showDone(el, burst) {
    el.innerHTML = '<div class="done-inner"><span class="done-ico" aria-hidden="true">' + icon('check') + '</span><p>' + fmt(C.shared.allDone) + '</p>' +
      (burst && !reduced ? burstHTML() : '') + '</div>';
    el.classList.remove('is-shown'); void el.offsetWidth; el.classList.add('is-shown');
  }
  function hideDone(el) { el.classList.remove('is-shown'); el.innerHTML = ''; }

  function bindList(root, onChange) {
    var rows = $$('[data-idx]', root), count = $('.count', root), reset = $('.reset', root), done = $('.done', root);
    var set = {}, size = 0, wasDone = false;
    function render(burst) {
      rows.forEach(function (r) {
        var on = !!set[r.getAttribute('data-idx')];
        r.setAttribute('aria-checked', on ? 'true' : 'false');
        r.classList.toggle('is-checked', on);
      });
      if (count) count.textContent = size + '/' + rows.length;
      if (reset) {
        reset.classList.toggle('is-shown', size > 0);
        reset.tabIndex = size > 0 ? 0 : -1;
        reset.setAttribute('aria-hidden', size > 0 ? 'false' : 'true');
      }
      var isDone = size === rows.length;
      if (done && isDone !== wasDone) { if (isDone) showDone(done, burst); else hideDone(done); }
      wasDone = isDone;
    }
    function checked() { return Object.keys(set).map(Number); }
    rows.forEach(function (r) {
      r.addEventListener('click', function () {
        var i = r.getAttribute('data-idx');
        if (set[i]) { delete set[i]; size--; }
        else {
          set[i] = true; size++;
          if (!reduced) { r.classList.remove('pop'); void r.offsetWidth; r.classList.add('pop'); setTimeout(function () { r.classList.remove('pop'); }, 400); }
        }
        render(true);
        if (onChange) onChange(checked(), +i, !!set[i]);
      });
    });
    if (reset) reset.addEventListener('click', function () {
      set = {}; size = 0;
      render(false);
      rows[0].focus({ preventScroll: true });
      if (onChange) onChange([], -1, false);
    });
    render(false);
  }
  function furthest(list) { return list.length ? Math.max.apply(null, list) + 1 : 0; }

  /* ---------------------------------------------------------------------
     Shell: nav, routing, transitions, compact header, reveals
     --------------------------------------------------------------------- */
  var nav, pillEl, capR, mid, chead, cTitle, cPhase, cPill;

  function renderNav() {
    var tabs = $('#tabs');
    tabs.innerHTML = '<span class="nav-pill" aria-hidden="true"><i class="cap-l"></i><i class="mid"></i><i class="cap-r"></i></span>' +
      ORDER.map(function (id) {
        return '<button class="tab" type="button" data-view="' + id + '" data-accent="' + V[id].accent + '">' +
          '<span class="tab-ico">' + icon(id) + '</span><span class="tab-label">' + esc(V[id].navLabel) + '</span></button>';
      }).join('');
    nav = $('.nav'); pillEl = $('.nav-pill'); capR = $('.cap-r'); mid = $('.mid');
    $$('.tab', tabs).forEach(function (tab) {
      tab.addEventListener('click', function () {
        var ico = $('.tab-ico', tab);
        if (!reduced) { ico.classList.remove('squish'); void ico.offsetWidth; ico.classList.add('squish'); }
        var id = tab.getAttribute('data-view');
        if (id === active) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        else location.hash = id;
      });
    });
  }

  function placePill(animate) {
    var tab = $('.tab[data-view="' + active + '"]');
    if (!tab) return;
    var x = tab.offsetLeft, w = tab.offsetWidth;
    if (!animate || reduced) nav.classList.add('no-anim');
    nav.setAttribute('data-accent', V[active].accent);
    pillEl.style.transform = 'translateX(' + x + 'px)';
    mid.style.transform = 'scaleX(' + (Math.max(0, w - 32) / 100) + ')';
    capR.style.transform = 'translateX(' + (w - 17) + 'px)';
    if (!animate || reduced) { void pillEl.offsetWidth; requestAnimationFrame(function () { nav.classList.remove('no-anim'); }); }
  }

  function updateNav(animate) {
    $$('.tab').forEach(function (t) {
      if (t.getAttribute('data-view') === active) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    placePill(animate);
  }

  var titleIO, phaseIO, phaseEls = [], phaseHits = new Map(), currentPhase = '';

  function setupChead() {
    chead = $('.chead'); cTitle = $('.chead-title'); cPhase = $('.chead-phase'); cPill = $('.chead-pill');
    titleIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target.closest('.view').getAttribute('data-view') !== active) return;
        chead.classList.toggle('is-shown', !e.isIntersecting && e.boundingClientRect.top < 0);
      });
    }, { threshold: 0 });
    $$('.view-title').forEach(function (t) { titleIO.observe(t); });

    phaseEls = $$('#view-water-changes .phase');
    phaseIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { phaseHits.set(e.target, e.isIntersecting); });
      var hit = phaseEls.filter(function (p) { return phaseHits.get(p); })[0];
      if (hit) currentPhase = hit.getAttribute('data-phase-label');
      else if (phaseEls[0] && phaseEls[0].getBoundingClientRect().top > window.innerHeight * 0.35) currentPhase = '';
      if (active === 'water-changes') cPhase.textContent = currentPhase;
    }, { rootMargin: '-35% 0px -64% 0px', threshold: 0 });
    phaseEls.forEach(function (p) { phaseIO.observe(p); });
  }

  function updateChead(id) {
    var v = V[id];
    chead.classList.remove('is-shown');
    chead.setAttribute('data-accent', v.accent);
    cTitle.textContent = v.title;
    cPill.innerHTML = v.owner ? pill(v.owner, true) : '';
    cPhase.textContent = id === 'water-changes' ? currentPhase : '';
    var t = $('#view-' + id + ' .view-title');
    if (t) { titleIO.unobserve(t); titleIO.observe(t); }
  }

  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.15 });

  function setAccent(id) {
    var a = V[id].accent;
    $$('.glow i').forEach(function (g) { g.classList.toggle('is-on', id !== 'home' && g.getAttribute('data-accent') === a); });
  }

  function enter(view) {
    if (reduced) return;
    $$('.stg', view).forEach(function (k, i) { k.style.setProperty('--i', Math.min(i, 7)); });
    view.classList.remove('is-entering'); void view.offsetWidth; view.classList.add('is-entering');
    clearTimeout(view.__et);
    view.__et = setTimeout(function () { view.classList.remove('is-entering'); }, 900);
  }

  var readyT = 0, switchTok = 0;
  function show(id, initial) {
    if (id === active) return;
    var prev = active ? $('#view-' + active) : null, next = $('#view-' + id);
    function apply() {
      if (prev) prev.classList.remove('is-active', 'is-leaving');
      next.classList.add('is-active');
      active = id;
      window.scrollTo(0, 0);
      setAccent(id);
      updateNav(!initial);
      updateChead(id);
      if (id === 'home' && hero) { hero.reset(); hero.resize(); }
      if (!initial) enter(next);
      stages.forEach(function (s) { s.ready = false; s.sync(); });
      clearTimeout(readyT);
      readyT = setTimeout(function () {
        stages.forEach(function (s) { if (s.viewId === id) { s.ready = true; s.sync(); } });
      }, initial ? 700 : (reduced ? 100 : 440));
    }
    if (initial || !prev) { apply(); return; }
    if (doc.startViewTransition && !doc.hidden) {
      try {
        var vt = doc.startViewTransition(apply);
        var noop = function () {};
        if (vt) { if (vt.ready) vt.ready.catch(noop); if (vt.finished) vt.finished.catch(noop); if (vt.updateCallbackDone) vt.updateCallbackDone.catch(noop); }
        return;
      } catch (e) { /* fall through */ }
    }
    var tok = ++switchTok;
    prev.classList.add('is-leaving');
    setTimeout(function () { if (tok === switchTok) apply(); }, reduced ? 80 : 120);
  }

  function route(initial) {
    var id = location.hash.replace(/^#/, '');
    if (ORDER.indexOf(id) === -1) {
      history.replaceState(null, '', location.pathname + location.search + '#home');
      id = 'home';
    }
    show(id, initial);
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  var hero;
  function boot() {
    doc.title = C.site.title;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    var html = {
      home: renderHome(),
      'water-changes': renderWaterChanges(),
      paludariums: renderPaludariums(),
      begonias: renderBegonias(),
      'making-water': renderMakingWater()
    };
    ORDER.forEach(function (id) {
      var el = $('#view-' + id);
      el.innerHTML = html[id];
      el.setAttribute('aria-labelledby', 't-' + id);
    });
    renderNav();
    setupChead();

    // Stages
    hero = heroStage($('#view-home .hero'));
    var wc = waterStage($('#view-water-changes .stage'));
    var mw = toteStage($('#view-making-water .stage'));
    var bg = leafStage($('#view-begonias .stage'));
    makeStage($('#view-paludariums .tanks'), 'paludariums', {});

    // Checklists
    var wcItems = V['water-changes'].quickList, mwItems = V['making-water'].quickList;
    bindList($('[data-list="water-changes"]'), function (list) {
      var n = furthest(list); wc.setLive(n, n ? wcItems[n - 1].text : '');
    });
    bindList($('[data-list="making-water"]'), function (list) {
      var n = furthest(list); mw.setLive(n, n ? mwItems[n - 1].text : '');
    });
    bindList($('[data-list="begonias"]'), function (list) { bg.setLive(list.length > 0); });
    bindList($('[data-list="paludariums"]'), function (list, i, on) {
      if (!on || reduced) return;
      var t = $('.ptank[data-idx="' + i + '"]');
      t.classList.remove('puffing'); void t.offsetWidth; t.classList.add('puffing');
      setTimeout(function () { t.classList.remove('puffing'); }, 1300);
    });
    bindList($('[data-list="oneoff"]'));

    // One-off chip scrolls to its card
    $$('[data-scroll]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = doc.getElementById(b.getAttribute('data-scroll'));
        if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      });
    });

    // Reveals
    $$('.reveal').forEach(function (el) { if (reduced) el.classList.add('is-in'); else revealIO.observe(el); });

    // First load
    var homeFirst = location.hash === '' || location.hash === '#home' || ORDER.indexOf(location.hash.slice(1)) === -1;
    if (homeFirst && !reduced) {
      var heroEl = $('#view-home .hero');
      heroEl.classList.add('first-load');
      setTimeout(function () { heroEl.classList.remove('first-load'); }, 1000);
    }
    route(true);
    if (!homeFirst) enter($('#view-' + active));

    window.addEventListener('hashchange', function () { route(false); });
    window.addEventListener('resize', function () { placePill(false); });
    doc.addEventListener('visibilitychange', function () { stages.forEach(function (s) { s.sync(); }); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { placePill(false); });

    var onMotion = function (e) {
      reduced = e.matches;
      stages.forEach(function (s) { if (s.playing) { s.playing = false; s.sync(); } });
      $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    };
    if (mq.addEventListener) mq.addEventListener('change', onMotion); else if (mq.addListener) mq.addListener(onMotion);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();
