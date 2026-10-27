/* 세상 나침반 v2 (1025) — MJ 전용 · 한정수 투자관 웹앱. 기획 ~/Desktop/세상학개론/웹앱_기획서_1025.md · 자료 틀 ../SCHEMA.md
   data.enc = 맥이 잠근 자료(AES-GCM, PBKDF2 600k) → 암호로 풀고 키는 이 기기 IndexedDB 에 (꺼낼 수 없는 키로) 보관 · 저장본 먼저 그림
   MJ 가 쓰는 것(확신 노트·편집장 질문 답)은 같은 키로 잠가 Apps Script 저장소에 (서버는 내용을 못 읽음) · 매수·매도 권유 문구 없음
   v2 = 검수 4팀(기획·디자인·쓰기 편함·쉬운 말) 반영 */
'use strict';
const STORE = 'https://script.google.com/macros/s/AKfycbxAM2IW3ODzQmVbIwjjQNEjqnmPewvY_TFX36GMFh84Txj8W1j7hTzYuvrVyzfnr2iOvQ/exec';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const S = { tab: ls.get('cp_tab', 'world'), grp: ls.get('cp_grp', ''), sel: '', open: {}, D: null, key: null, tok: '', ver: '', user: blankUser(), save: { st: '', msg: '', at: 0, pulled: 0, busy: false, dirty: false } };
function blankUser() { return { v: 1, conv: {}, set: { cashPct: 15 }, qa: {} }; }

/* ---------- 아이콘 (lucide, stroke 1.5) ---------- */
const P = {
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  bld: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  news: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
  brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M12 5v13"/>',
  link: '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', minus: '<path d="M5 12h14"/>',
  arrows: '<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'
};
const ic = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

/* ---------- 숫자 · 날짜 (한 가지 방식으로) ---------- */
const YR = new Date().getFullYear();
const fd = d => { if (!d || !/^\d{4}-\d\d-\d\d/.test(d)) return ''; const y = +d.slice(0, 4), m = +d.slice(5, 7), dd = +d.slice(8, 10); return y === YR ? m + '/' + dd : String(y).slice(2) + '.' + String(m).padStart(2, '0') + '.' + String(dd).padStart(2, '0'); };
const when = t => { if (!t) return ''; const d = new Date(t); if (isNaN(d)) return ''; return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const NA = '<span class="dash">—</span>';
const usdT = v => v == null ? '—' : Math.abs(v) >= 1e12 ? (v / 1e12).toFixed(1) + '조 달러' : Math.abs(v) >= 1e9 ? Math.round(v / 1e8).toLocaleString('ko-KR') + '억 달러' : Math.abs(v) >= 1e8 ? (v / 1e8).toFixed(1) + '억 달러' : Math.round(v / 1e4).toLocaleString('ko-KR') + '만 달러';
const usd = v => v == null ? NA : usdT(v);
const sg = (v, d = 0) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const pct = (v, d = 0) => v == null ? NA : sg(v * 100, d) + '%';
const pct0 = (v, d = 0) => v == null ? NA : (v * 100).toFixed(d) + '%';
const w1 = v => v == null || isNaN(v) ? NA : v.toFixed(1) + '%';
function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 3000); }
const STANCE = h => !h || !h.stance ? '' : h.stance + (h.move ? ' · ' + fd(h.move.date) + ' ' + h.move.stance : '');
const old = d => d && Date.now() - Date.parse(d) > 180 * 864e5;

/* ---------- 잠금 (WebCrypto) ---------- */
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const tob64 = b => { let s = ''; new Uint8Array(b).forEach(x => { s += String.fromCharCode(x); }); return btoa(s); };
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
function idb(op, k, v) {
  return new Promise((res, rej) => { const r = indexedDB.open('compass', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onerror = () => rej(r.error);
    r.onsuccess = () => { const tx = r.result.transaction('kv', op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore('kv'), q = op === 'get' ? st.get(k) : op === 'del' ? st.clear() : st.put(v, k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }; });
}
async function derive(pass, salt, it) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: it, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function gunzip(buf) { return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text(); }
async function openData(o, key) { return JSON.parse(await gunzip(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(o.iv) }, key, b64(o.ct)))); }
async function sealUser(obj) { const iv = crypto.getRandomValues(new Uint8Array(12)); return JSON.stringify({ iv: tob64(iv), ct: tob64(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, S.key, new TextEncoder().encode(JSON.stringify(obj)))) }); }
async function openUser(s) { const o = JSON.parse(s); return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(o.iv) }, S.key, b64(o.ct)))); }
async function store(op, extra, keepalive) { const r = await fetch(STORE, { method: 'POST', keepalive: !!keepalive, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ t: S.tok, op }, extra || {})) }); return r.json(); }

async function boot() {   // 저장본 먼저 (기기에 둔 잠긴 자료로 바로 그림) → 새 자료 받으면 바꿔 끼움
  try { S.key = await idb('get', 'key'); S.tok = (await idb('get', 'tok')) || ''; } catch (e) { S.key = null; }
  let cached = null;
  if (S.key) { try { cached = await idb('get', 'enc'); if (cached) { S.D = await openData(cached, S.key); start(); } } catch (e) { S.D = null; } }
  let enc; try { enc = await (await fetch('data.enc?t=' + Date.now(), { cache: 'no-store' })).json(); } catch (e) {
    if (S.D) return toast('인터넷이 안 돼서 저장된 자료를 보여 줘요');
    $('#app').innerHTML = `<div class="lock"><div class="card"><h1>자료를 못 불러왔어요</h1><p>인터넷 연결을 확인해 주세요. 연결되면 저절로 다시 열려요.</p><button class="btn" onclick="location.reload()">다시 시도</button></div></div>`;
    addEventListener('online', () => location.reload(), { once: true }); return;
  }
  if (cached && cached.ct === enc.ct) return;
  if (S.key) { try { S.D = await openData(enc, S.key); idb('put', 'enc', enc).catch(() => {}); return S.started ? softRender() : start(); } catch (e) { if (S.D) return; S.key = null; } }
  lockScreen(enc);
}
function softRender() { const a = document.activeElement; if (a && /TEXTAREA|INPUT/.test(a.tagName) && a.id !== 'pw') { S.pending = true; return; } render(); }
function lockScreen(enc) {
  $('#app').innerHTML = `<div class="lock"><form class="card" id="lk"><div class="brand"><i class="lg">${ic('compass')}</i><b>세상 나침반</b></div>
    <h1>암호를 넣어 주세요</h1><p>MJ 전용이에요. 이 기기에서 한 번만 넣으면 다음부터 바로 열려요.</p>
    <input id="pw" type="password" autocomplete="current-password" placeholder="xxxx-xxxx-xxxx-xxxx" aria-label="암호" autofocus>
    <button class="btn" id="go">열기</button><p class="m" id="lm" role="alert"></p></form></div>`;
  $('#lk').addEventListener('submit', async e => {
    e.preventDefault(); const pw = $('#pw').value.trim(); if (!pw) return;
    $('#go').disabled = true; $('#go').textContent = '여는 중…'; $('#lm').textContent = '';
    try {
      const key = await derive(pw, b64(enc.salt), enc.it), D = await openData(enc, key);
      const tok = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('compass-store:' + pw)));
      S.key = key; S.tok = tok; S.D = D;
      try { await idb('put', 'key', key); await idb('put', 'tok', tok); await idb('put', 'enc', enc); } catch (x) {}
      start();
    } catch (x) { $('#go').disabled = false; $('#go').textContent = '열기'; $('#lm').textContent = '암호가 맞지 않아요'; $('#pw').select(); }
  });
}
function start() {
  if (S.started) return; S.started = true;
  history.replaceState({ tab: S.tab, grp: S.grp, sel: S.sel }, '');
  addEventListener('popstate', e => { const st = e.state || {}; S.tab = st.tab || 'world'; S.grp = st.grp || S.grp; S.sel = st.sel || ''; ls.set('cp_tab', S.tab); render(); });   // 안드로이드 뒤로 = 앱 안에서 한 단계 뒤로
  document.addEventListener('focusout', () => { if (S.pending) setTimeout(() => { if (S.pending && !/TEXTAREA|INPUT/.test((document.activeElement || {}).tagName || '')) { S.pending = false; render(); } }, 300); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { if (S.save.dirty) { clearTimeout(saveT); saveUser(true); } }   // 앱을 내릴 때 바로 저장 (안드로이드가 타이머를 멈출 수 있음)
    else if (Date.now() - S.save.pulled > 60e3) pullUser();
  });
  addEventListener('online', () => { if (S.save.dirty || S.save.st === 'err') saveUser(); });
  render(); pullUser();
}

/* ---------- MJ 저장 문서 ---------- */
function mergeUser(a, b) {   // 종목·날짜별로 더 최근에 고친 쪽
  const o = blankUser();
  o.set = (a.setAt || 0) >= (b.setAt || 0) ? Object.assign({}, b.set, a.set) : Object.assign({}, a.set, b.set); o.setAt = Math.max(a.setAt || 0, b.setAt || 0);
  ['conv', 'qa'].forEach(f => new Set([...Object.keys(a[f] || {}), ...Object.keys(b[f] || {})]).forEach(k => { const x = (a[f] || {})[k], y = (b[f] || {})[k]; o[f][k] = !x ? y : !y ? x : (x.at || 0) >= (y.at || 0) ? x : y; }));
  return o;
}
async function pullUser() {
  if (!S.tok) return; S.save.pulled = Date.now();
  try {
    const j = await store('get'); if (!j.ok) { if (j.msg === '암호') setSave('err', '저장소 암호 오류'); return; }
    if (j.doc) S.user = mergeUser(S.user, mergeUser(blankUser(), await openUser(j.doc)));   // 덮어쓰지 않고 합침 (안 보낸 수정이 사라지지 않게)
    S.ver = j.ver || S.ver;
    if (S.save.dirty || S.save.st === 'err') queueSave();
    if (S.tab !== 'cmp') softRender();
  } catch (e) { setSave('err', '저장소 연결 안 됨'); }
}
let saveT = 0;
function queueSave() { S.save.dirty = true; clearTimeout(saveT); setSave('ing'); saveT = setTimeout(saveUser, 1200); }
async function saveUser(now) {
  if (!S.tok) { setSave('err', '다시 잠금 해제가 필요해요'); return; }
  if (S.save.busy) { S.save.again = true; return; }   // 한 번에 하나씩
  S.save.busy = true; S.save.dirty = false;
  try {
    let j = await store('put', { doc: await sealUser(S.user), base: S.ver }, now === true);
    if (j.conflict) { S.user = mergeUser(S.user, await openUser(j.doc)); S.ver = j.ver; j = await store('put', { doc: await sealUser(S.user), base: S.ver }, now === true); }
    if (j.ok) { S.ver = j.ver; if (!S.save.dirty && !S.save.again) setSave('ok'); }
    else { S.save.dirty = true; setSave('err', j.msg === '암호' ? '저장소 암호 오류' : '저장 실패 — 다시 시도해요'); }
  } catch (e) { S.save.dirty = true; setSave('err', '저장 실패 — 연결되면 다시 저장해요'); }
  S.save.busy = false;
  if (S.save.again) { S.save.again = false; saveUser(); }
}
function setSave(st, msg) {
  S.save.st = st; S.save.msg = msg || ''; if (st === 'ok') S.save.at = Date.now();
  const el = $('#sv'); if (!el) return;
  el.className = 'sv' + (st === 'err' ? ' err' : st ? '' : ' idle'); el.textContent = saveText();
  if (st === 'ok') setTimeout(() => { if (S.save.st === 'ok' && innerWidth < 840) el.classList.add('idle'); }, 2500);
}
function saveText() { const s = S.save; return s.st === 'ing' ? '저장 중…' : s.st === 'ok' ? '저장됨 ' + when(s.at).split(' ')[1] : s.st === 'err' ? s.msg : ''; }

/* ---------- 화면 틀 ---------- */
const TABS = [['world', '오늘의 세상', 'globe'], ['cmp', '기업 비교', 'bld'], ['conv', '확신 노트', 'target']];
function render() {
  const D = S.D, fa = document.activeElement, fk = fa && fa.dataset && fa.dataset.act ? [fa.dataset.act, fa.dataset.k || '', fa.dataset.i || ''] : null;
  const dk = d => S.tab + '|' + (d.previousElementSibling || d.closest('section') || d).textContent.slice(0, 80) + '|' + ((d.querySelector('summary') || {}).textContent || '');   // 다시 그려도 펼친 더보기는 그대로
  const opened = new Set([...document.querySelectorAll('#app details[open]')].map(dk));
  let body;
  try { body = S.tab === 'cmp' ? cmpTab(D) : S.tab === 'conv' ? convTab(D) : worldTab(D); }
  catch (e) { console.error(e); body = `<section class="card err-card"><h2>${ic('alert')}이 화면을 그리다 문제가 생겼어요</h2><p class="sub">다른 탭은 그대로 쓸 수 있어요. 맥 자료가 새로 오면 저절로 고쳐져요.</p><p class="muted" style="font-size:12px">${esc(e.message)}</p></section>`; }
  const nav = () => TABS.map(([k, n, i]) => `<button data-act="tab" data-k="${k}" class="${S.tab === k ? 'on' : ''}" aria-current="${S.tab === k ? 'page' : 'false'}">${ic(i)}${n}</button>`).join('');
  $('#app').innerHTML = `<header class="top"><div class="top-in"><div class="brand"><i class="lg">${ic('compass')}</i><b>세상 나침반</b><small>${D && D.at ? when(D.at) + ' 자료' : ''}</small></div>
    <nav class="tabs" aria-label="화면">${nav()}</nav><span id="sv" class="sv ${S.save.st === 'err' ? 'err' : S.save.st ? '' : 'idle'}" role="status" aria-live="polite">${esc(saveText())}</span>
    <button class="ib" data-act="lock" aria-label="이 기기 잠그기" title="이 기기 잠그기">${ic('lock')}</button></div></header>
    <main class="main" id="main">${banners(D)}${body}<p class="note-ad">한정수(세상학개론) 팬딩 글·강의를 AI가 정리한 개인용 자료예요. 투자 권유가 아니고, 결정은 MJ가 해요.</p></main>
    <nav class="bnav" aria-label="화면">${nav()}</nav>`;
  if (fk) { const el = document.querySelector(`[data-act="${fk[0]}"][data-k="${CSS.escape(fk[1])}"]${fk[2] ? `[data-i="${CSS.escape(fk[2])}"]` : ''}`); if (el) el.focus({ preventScroll: true }); }
  if (opened.size) document.querySelectorAll('#app details').forEach(d => { if (opened.has(dk(d))) d.open = true; });
  if (S.tab === 'world') requestAnimationFrame(balance);
}
function banners(D) {
  if (!D) return '';
  const out = [], age = (Date.now() - Date.parse(D.at)) / 3600e3, b = D.world && D.world.brief, now = new Date(), today = new Date(now.getTime() - now.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  if (age > 30) out.push(`맥 자료가 ${Math.round(age)}시간 전 것이에요 — 맥이 꺼져 있나요?`);
  if (S.tab === 'world' && now.getHours() >= 8 && (!b || b.date !== today)) out.push('오늘 브리핑은 아직이에요 (7:30 이후 맥이 만들면 반영돼요)');
  return out.map(t => `<div class="banner" role="status">${ic('alert')}<span>${esc(t)}</span></div>`).join('');
}

/* ---------- ① 오늘의 세상 ---------- */
const TH = { us10y: [5, 5.3, 6], us30y: [5.3], fg: [25, 70], vix: [20, 30] };
function spark(g) {
  const s = g.series || []; if (s.length < 2) return '';
  const W = 300, H = 56, th = TH[g.key] || [], vs = s.map(p => p[1]), near = th.filter(t => t >= Math.min(...vs) * 0.9 && t <= Math.max(...vs) * 1.1);
  const lo = Math.min(...vs, ...near), hi = Math.max(...vs, ...near), y = v => H - 4 - (v - lo) / ((hi - lo) || 1) * (H - 10), x = i => i / (s.length - 1) * W;
  const pts = s.map((p, i) => x(i).toFixed(1) + ',' + y(p[1]).toFixed(1)).join(' ');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(g.name)} 최근 ${s.length}일 · 점선은 그가 말한 기준선">${near.map(t => `<line class="th" x1="0" x2="${W}" y1="${y(t)}" y2="${y(t)}"/>`).join('')}<polygon class="ar" points="0,${H} ${pts} ${W},${H}"/><polyline class="ln" points="${pts}"/></svg>`;
}
function chg(v, unit) { if (v == null) return '—'; const d = unit === '%' ? 2 : 1, cls = v > 0 ? 'up' : v < 0 ? 'down' : ''; return `<span class="${cls}">${v > 0 ? '▲' : v < 0 ? '▼' : ''}${Math.abs(v).toFixed(d)}${unit === '%' ? '%p' : ''}</span>`; }
function gcard(g) {
  if (g.value == null) return `<article class="card g"><div class="gh">${esc(g.name)}</div><p class="muted">자료 없음</p></article>`;
  const z = g.zone || {};
  return `<article class="card g"><div class="gh"><span>${esc(g.name)}</span><span class="pill s t-${z.tone || ''}">${esc(z.label)}</span></div>
    <div class="gv">${g.unit === '%' ? g.value.toFixed(2) : Math.round(g.value)}${esc(g.unit)}</div><div class="gc">하루 ${chg(g.d1, g.unit)} · 한 달 ${chg(g.d20, g.unit)} · ${fd(g.date)}</div>
    ${spark(g)}<p class="gr">그의 규칙 · ${fd(z.ruleDate)} — ${esc(z.rule)}</p></article>`;
}
function briefText(t, links) {   // [12] → 원문 링크 (맥이 붙인 주소만) · 키캡 숫자 → ①
  const L = {}; (links || []).forEach(l => { L[l.n] = l; });
  return esc(t).replace(/([0-9])️?⃣/g, (m, d) => '①②③④⑤⑥⑦⑧⑨'[d - 1] || d).replace(/\*\*/g, '')
    .replace(/\[(\d+)\]/g, (m, n) => L[n] ? `<a class="ref" href="${esc(L[n].url)}" target="_blank" rel="noopener" title="${esc(L[n].ch + ' · ' + L[n].t)}">[${n}]</a>` : `<span class="ref">[${n}]</span>`);
}
function newsBlocks(t, b, items) {   // 기사마다 [더보기] → 맥이 만든 요약(sum.js) · items=1면(①②③ 묶음) / 아니면 줄마다
  const sum = b.sum || {}, L = {}; (b.links || []).forEach(l => { L[l.n] = l; });
  const lines = String(t).split('\n'), chunks = [];
  if (items) { lines.forEach(l => { if (/^\s*(?:[0-9]\uFE0F?\u20E3|[①-⑨]|\d[.)])/.test(l) || !chunks.length) chunks.push([l]); else chunks[chunks.length - 1].push(l); }); }
  else lines.forEach(l => { if (l.trim()) chunks.push([l]); });
  return chunks.map(c => { const tx = c.join('\n').trim(), refs = [...new Set([...tx.matchAll(/\[(\d+)\]/g)].map(m => m[1]))].filter(n => sum[n]);
    return `<div class="nb"><p>${briefText(tx, b.links)}</p>${refs.length ? `<details class="nd"><summary>${ic('down', 'chev')}더보기 · 기사 요약 ${refs.length > 1 ? refs.length + '개' : ''}</summary>${refs.map(n => { const v = sum[n], l = L[n]; return `<div class="ns"><div class="nh"><span class="pill s">${esc(v.basis)}</span><span>${esc(l ? l.ch : '')}</span>${l ? `<a href="${esc(l.url)}" target="_blank" rel="noopener">원문 ${ic('ext')}</a>` : ''}</div><p>${esc(v.s)}</p>${v.why ? `<p class="why"><b>왜 중요?</b> ${esc(v.why)}</p>` : ''}</div>`; }).join('')}</details>` : ''}</div>`; }).join('');
}
function logicBody(t, links) {   // '이 논리에 쓰인 규칙: 병목' → 알약
  const m = t.match(/이 논리에 쓰인 규칙\s*[:：]\s*(.+)$/m), body = m ? t.replace(m[0], '').trim() : t;
  return `<p>${briefText(body, links)}</p>${m ? `<div class="chips"><span class="pill t-pri">이 논리에 쓰인 그의 규칙 · ${esc(m[1].replace(/\(.*$/, '').trim())}</span></div>` : ''}`;
}
function worldTab(D) {
  const w = D.world || {}, ph = w.phase || {}, b = w.brief, mind = w.mind || {}, br = D.brain || {}, st = br.stats || {}, pc = (br.predictions || {}).counts || {};
  const sec = k => b && (b.sections || []).find(s => s.key === k);
  const top = sec('🗞'), logic = sec('🎓'), q = sec('❓'), chk = sec('💼'), rest = b ? (b.sections || []).filter(s => !['🗞', '🎓', '❓', '💼'].includes(s.key)) : [];
  const judged = (pc['맞음'] || 0) + (pc['부분'] || 0) + (pc['틀림'] || 0), now = ph.his;
  const hero = `<section class="card hero"><div class="eyebrow">지금 국면 · 그의 규칙으로 읽은 지표</div><h1>${esc(ph.title)}</h1>${ph.sub ? `<p class="hs">${esc(ph.sub)}</p>` : ''}
    <div class="chips">${(ph.why || []).map(x => `<span class="pill">${esc(x)}</span>`).join('')}${(ph.caveats || []).map(x => `<span class="pill t-warn">${esc(x)}</span>`).join('')}</div>
    ${now ? `<div class="now"><b>그의 지금 판단 · ${fd(now.date)} ${esc(now.kind)}</b><a class="t" href="https://fanding.kr/@sesang101/post/${esc(String(now.id).replace(/v$/, ''))}/" target="_blank" rel="noopener">${esc(now.title)}</a><p>${esc(now.view)}</p></div>` : ''}
    <div class="brainline">${ic('brain')}<span>그의 뇌: 글 ${st.posts || 0}개 · 규칙 ${(st.rules || 0).toLocaleString('ko-KR')}개 · 매매 ${st.moves || 0}건 · 마지막 학습 ${fd((st.range || [])[1])}</span></div>
    ${judged ? `<details class="tr"><summary>${ic('check')}그의 예측 판정 ${judged}개 — 맞음 ${pc['맞음'] || 0} · 부분 ${pc['부분'] || 0} · 틀림 ${pc['틀림'] || 0} (진행 중 ${pc['진행중'] || pc['진행 중'] || 0}) · 펼쳐 보기</summary>
      ${((br.predictions || {}).recent || []).map(p => `<div class="trl"><span class="pill s ${p.status === '맞음' ? 't-ok' : p.status === '틀림' ? 't-bad' : ''}">${esc(p.status)}</span> <span class="dt">${fd(p.date)}</span>${esc(p.claim)}<div class="muted" style="font-size:12px;margin-top:2px">${esc(p.why)}</div></div>`).join('')}
      <p class="sub" style="margin:8px 0 0">그도 "100% 믿지 마라"고 했어요. 맞힌 것만 보지 않게 틀린 것도 같이 보여 줘요.</p></details>` : ''}</section>`;
  const learn = !b ? `<section class="card bf"><h2>${ic('bulb')}오늘의 논리</h2><p class="empty">오늘 브리핑이 아직 없어요 (매일 7:30)</p></section>`
    : `<section class="card bf"><h2>${ic('bulb')}오늘의 논리<small>${fd(b.date)} 브리핑</small></h2>${logic ? logicBody(logic.body, b.links) : '<p class="muted">오늘은 논리 칸이 없어요</p>'}
      ${q ? `<div class="lg-q"><b>편집장 질문</b>${briefText(q.body, b.links)}<textarea data-f="qa" data-k="${esc(b.date)}" aria-label="내 답 한 줄" placeholder="내 답 한 줄 — 맞고 틀리고 없이 내 생각만">${esc(((S.user.qa || {})[b.date] || {}).a || '')}</textarea></div>` : ''}
      ${qaHistory(b.date)}</section>`;
  const front = !b ? '' : `<section class="card bf"><h2>${ic('news')}오늘의 1면<small>그의 '편집장' 방식으로 고른 3개</small></h2>${top ? newsBlocks(top.body, b, true) : ''}
    ${rest.length ? `<details class="more" data-act="more" ${S.open.brief ? 'open' : ''}><summary>전체 브리핑 보기 · ${rest.map(s => esc(s.title.replace(/\(.*?\)/g, '').trim())).join(' · ')}</summary>${rest.map(s => `<h3>${esc(s.title)}</h3>${['📰', '🏛'].includes(s.key) ? newsBlocks(s.body, b, false) : `<p>${briefText(s.body, b.links)}</p>`}`).join('')}</details>` : ''}</section>`;
  const latest = `<section class="card" id="c-latest"><h2>${ic('brain')}그의 최신 생각<small>팬딩 글·라이브</small></h2>${(mind.latest || []).map((v, i) => `<div class="li" ${i >= 3 ? 'data-x="1" hidden' : ''}><span class="dt">${fd(v.date)}</span><span class="muted" style="font-size:13px">${esc(v.kind)}</span>
      <div class="t"><a href="https://fanding.kr/@sesang101/post/${esc(String(v.id).replace(/v$/, ''))}/" target="_blank" rel="noopener">${esc(v.title)}</a></div><div class="v">${esc(v.view)}</div>${v.changed ? `<div class="c"><b>바뀐 점</b> · ${esc(v.changed)}</div>` : ''}</div>`).join('')}</section>`;
  const moves = `<section class="card" id="c-moves"><h2>${ic('arrows')}그의 최근 매매<small>글에서 말한 것만</small></h2>${(mind.moves || []).map((m, i) => `<div class="mv" ${i >= 3 ? 'data-x="1" hidden' : ''}><span class="dt">${fd(m.date)}</span><span><b>${esc(m.name)}</b> <span class="pill s">${esc(m.stance)}</span></span><span class="r">${esc(m.reason)}</span></div>`).join('')}</section>`;
  const H = (D.holdings || {}).items || [], hmatch = name => H.find(h => [h.name, h.sym, String(h.name).replace(/\s*(그룹|홀딩스|ETF)$/, '')].some(k => k && name.includes(k)));
  const ckLines = chk ? chk.body.split('\n').map(l => l.replace(/^[•\-·]\s*/, '').trim()).filter(Boolean) : [];
  const checkCard = `<section class="card" id="c-check"><h2>${ic('shield')}내 종목 근거 체크<small>오늘 브리핑 · 누르면 확신 노트</small></h2>${ckLines.length ? ckLines.map(l => { const [n, v, ...r] = l.split(/\s+[—-]\s+/), h = hmatch(n || l), tone = /약화/.test(v || '') ? 't-warn' : /강화/.test(v || '') ? 't-ok' : '';
      return `<div class="ckl" ${h ? `data-act="openEd" data-k="${esc(h.sym)}" tabindex="0" role="button"` : ''}><span><b>${esc(n)}</b>${v ? ` <span class="pill s ${tone}">${esc(v)}</span>` : ''}</span><span class="r">${briefText(r.join(' — ') || '', b && b.links)}${h && h.his && h.his.stance ? ` · 그: ${esc(STANCE(h.his))}` : ''}</span></div>`; }).join('') : '<p class="muted">오늘 브리핑에 근거 체크가 없어요</p>'}</section>`;
  const gauges = `<section class="gg" aria-label="지표 — 초록은 그의 규칙상 우호적, 호박은 경계">${(w.gauges || []).map(gcard).join('')}</section>`;
  return hero + `<div class="cols" id="wcols"><div class="col" id="colA">${learn}${front}</div><div class="col" id="colB">${latest}${checkCard}${moves}</div></div>` + gauges;
}
function qaHistory(today) {
  const xs = Object.entries(S.user.qa || {}).filter(([d, v]) => d !== today && v && v.a).sort((a, b) => a[0] < b[0] ? 1 : -1);
  return xs.length ? `<details class="more"><summary>지난 답 보기 (${xs.length})</summary>${xs.slice(0, 20).map(([d, v]) => `<div class="trl"><span class="dt">${fd(d)}</span>${esc(v.q || '')}<div style="margin-top:4px;color:var(--ink)">${esc(v.a)}</div></div>`).join('')}</details>` : '';
}
function balance() {   // PC 두 칸 높이 맞춤 (빈 공간 금지 규칙): 짧은 쪽 목록을 하나씩 더 펼치고, 오른쪽이 너무 길면 매매 카드를 왼쪽으로
  const A = $('#colA'), B = $('#colB'); if (!A || !B || innerWidth < 1100) return;
  const fill = (col, other) => { for (let i = 0; i < 40 && col.offsetHeight < other.offsetHeight - 40; i++) { const el = col.querySelector('[data-x][hidden]'); if (!el) break; el.hidden = false; } };
  if (B.offsetHeight > A.offsetHeight + 120) { const m = $('#c-moves'); if (m) A.appendChild(m); }
  fill(B, A); fill(A, B);
}

/* ---------- ② 기업 비교 ---------- */
const QL = e => e.slice(2, 4) + ' ' + Math.ceil(+e.slice(5, 7) / 3) + 'Q';
function bars(q) {
  q = (q || []).filter(x => x.rev != null); if (!q.length) return '';
  const W = 320, H = 96, mx = Math.max(...q.map(x => x.rev)), bw = W / q.length;
  return `<svg class="bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="분기 매출 ${q.length}개 · 마지막 ${QL(q[q.length - 1].end)} ${esc(usdT(q[q.length - 1].rev))}">${q.map((x, i) => { const h = Math.max(2, x.rev / mx * (H - 34)), last = i === q.length - 1;
    return `<rect x="${(i * bw + 4).toFixed(1)}" y="${(H - 14 - h).toFixed(1)}" width="${(bw - 8).toFixed(1)}" height="${h.toFixed(1)}" rx="3"><title>${esc(QL(x.end))} ${esc(usdT(x.rev))}</title></rect><text x="${(i * bw + bw / 2).toFixed(1)}" y="${H - 2}" text-anchor="middle">${esc(QL(x.end))}</text>${last ? `<text class="v" x="${(i * bw + bw / 2).toFixed(1)}" y="${(H - 18 - h).toFixed(1)}" text-anchor="end">${esc(usdT(x.rev))}</text>` : ''}`; }).join('')}</svg>`;
}
function lastQYoY(q) {   // 최근 분기 vs 1년 전 같은 분기
  q = (q || []).filter(x => x.rev != null); if (q.length < 5) return null;
  const l = q[q.length - 1], p = q.find(x => Math.abs((Date.parse(l.end) - Date.parse(x.end)) / 864e5 - 365) < 25);
  return p && p.rev ? l.rev / p.rev - 1 : null;
}
function vsBench(x, B) {   // 그의 피어 비교: 대표 기업 한 곳과 견줌 (시총 차이 · 같은 몸값 배수면 몇 배)
  if (!B) return { cell: NA, line: '' };
  if (x.sym === B.sym) return { cell: '<span class="pill s t-pri">비교 기준</span>', line: '' };
  const r = x.mcap && B.mcap ? B.mcap / x.mcap : null, fyX = (x.fin.ttm || {}).basis && x.fin.ttm.basis !== 'TTM', fyB = (B.fin.ttm || {}).basis && B.fin.ttm.basis !== 'TTM';
  const mult = x.evSales && B.evSales ? B.evSales / x.evSales : null, rs = r == null ? '' : r >= 1 ? (r >= 10 ? Math.round(r) : r.toFixed(1)) + '배' : '1/' + (1 / r).toFixed(1);
  return { cell: (r == null ? NA : '시총 ' + rs) + (mult ? `<div class="t2">몸값 기준 ${mult.toFixed(1)}배${fyX || fyB ? ' · 연간 숫자 주의' : ''}</div>` : ''),
    line: r == null ? '' : `${esc(B.name)} 시총은 이 회사의 ${rs}${mult ? ` · ${esc(B.name)}와 같은 몸값/매출로 평가받으면 지금의 ${mult.toFixed(1)}배${fyX || fyB ? ' (한쪽이 연간 숫자라 부풀려질 수 있어요)' : ''}` : ''} — 목표 주가가 아니라 크기 비교예요` };
}
function cmpTab(D) {
  const C = D.companies; if (!C || !C.groups || !C.groups.length) return `<section class="card"><p class="empty">기업 비교 자료를 만드는 중이에요</p></section>`;
  const gk = C.groups.some(g => g.key === S.grp) ? S.grp : C.groups[0].key, G = C.groups.find(g => g.key === gk), mem = G.members.map(s => C.items[s]).filter(Boolean), B = C.items[G.bench];
  const sel = mem.find(x => x.sym === S.sel) || mem.find(x => x.held) || mem[0];
  const row = x => { const f = x.fin || {}, t = f.ttm || {}, ly = lastQYoY(f.q), vb = vsBench(x, B), lq = (f.q || []).filter(e => e.rev != null).slice(-1)[0];
    return `<tr data-act="sel" data-k="${esc(x.sym)}" tabindex="0" class="${x === sel ? 'sel' : ''}">
      <td><span class="nm">${esc(x.name)}</span>${x.held ? '<span class="held">보유</span>' : ''}<div class="t2">${esc(x.ticker)}${x.his && x.his.stance ? ' · 그: ' + esc(STANCE(x.his)) : ''}</div></td>
      <td data-l="${esc(B ? B.name : '기준')} 대비">${vb.cell}</td>
      <td data-l="매출 (최근 12개월)">${t.rev != null ? usd(t.rev) : lq ? usd(lq.rev) + '<div class="t2">최근 분기만</div>' : NA}${t.rev != null ? `<div class="t2 ${t.revYoY > 0 ? 'up' : t.revYoY < 0 ? 'down' : ''}">${t.basis && t.basis !== 'TTM' ? esc(t.basis) + ' 연간 · ' : '1년 전보다 '}${pct(t.revYoY)}</div>` : ''}</td>
      <td data-l="최근 분기 (1년 전 대비)" class="${ly > 0 ? 'up' : ly < 0 ? 'down' : ''}">${pct(ly)}${lq ? `<div class="t2">${esc(QL(lq.end))}</div>` : ''}</td>
      <td data-l="이익률 (매출총 · 영업)">${pct0(t.gm)}<div class="t2 ${t.om < 0 ? 'down' : ''}">영업 ${pct(t.om)}</div></td>
      <td data-l="현금 · 부채">${usd(f.cash)}<div class="t2">부채 ${f.debt == null ? '자료 없음' : usdT(f.debt)}</div></td>
      <td data-l="52주 고점 대비" class="down">${x.dd == null ? NA : sg(x.dd) + '%'}</td></tr>`; };
  const PM = { cloud: 'AI 인프라', space: '우주', quantum: '정찰병', memory: '병목 순환' }, pd = ((D.brain || {}).paradigms || []).find(p => p.name.includes(PM[gk] || '\u0000'));
  const mv = mem.flatMap(x => (x.moves || []).map(m => Object.assign({ name: x.name }, m))).sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 6);
  const table = `<section class="card c-t" id="c-table"><h2>${ic('bld')}${esc(G.name)}<small>${mem.length}개 기업 · 공시 ${when(C.at)} 정리</small></h2>
    <div class="why">${ic('link')}<span>${esc(G.why)}${G.note ? `<br><span class="muted">${esc(G.note)}</span>` : ''}</span></div>
    <div class="tw"><table class="dt-t ct rt"><thead><tr><th>기업</th><th>${esc(B ? B.name : '기준')} 대비</th><th>매출 12개월</th><th>최근 분기</th><th>이익률</th><th>현금 · 부채</th><th>고점 대비</th></tr></thead><tbody>${mem.map(row).join('')}</tbody></table></div>
    <details class="more"><summary>용어 풀이 · 숫자 읽는 법</summary><div class="gls">
      <div><b>${esc(B ? B.name : '기준')} 대비</b> — 그는 대표 기업 한 곳과 견줘요 (아이렌↔네비우스, 로켓랩↔스페이스X). '시총 4배' = 기준 회사가 4배 큼. 목표 주가가 아니에요</div>
      <div><b>몸값 / 매출</b> — 회사 전체 가격(시총 + 부채 − 현금)이 1년 매출의 몇 배인지. 높을수록 미래 기대가 많이 들어 있어요</div>
      <div><b>매출 12개월</b> — 최근 4분기 매출 합. '연간'이라고 붙으면 분기 공시가 없어 지난 회계연도 숫자예요</div>
      <div><b>최근 분기 (1년 전 대비)</b> — 12개월 합은 늘었어도 최근 분기만 보면 줄고 있을 수 있어요</div>
      <div><b>영업이익률 −148%</b> — 매출 100을 벌 때 영업에서 148을 잃었다는 뜻이에요</div>
      <div><b>계약 잔고</b> — 이미 계약했지만 아직 매출로 안 잡힌 금액 (앞으로 받을 돈)</div>
      <div><b>주식 수 증가 (희석)</b> — 새 주식을 찍어 돈을 모으면 내 몫이 그만큼 작아져요</div>
      <div><b>—</b> — 공시에 그 숫자가 없어요 (0이 아니에요)</div></div></details></section>`;
  const flow = pd ? `<section class="card c-f"><h2>${ic('arrows')}이 묶음이 올라탄 흐름<small>그의 큰 흐름 · ${fd(pd.since || '')}부터</small></h2><p class="sub">${esc(pd.belief)}</p>
    <ol class="chain">${(pd.chain || []).map(c => `<li>${esc(c)}</li>`).join('')}</ol></section>` : '';
  const moves = mv.length ? `<section class="card c-m"><h2>${ic('brain')}그가 이 묶음에서 한 매매<small>글에서 말한 것만</small></h2>${mv.map(m => `<div class="mv"><span class="dt">${fd(m.date)}</span><span><b>${esc(m.name)}</b> <span class="pill s">${esc(m.stance)}</span></span><span class="r">${esc(m.reason)}</span></div>`).join('')}</section>` : '';
  return `<div class="seg" aria-label="묶음">${C.groups.map(g => `<button data-act="grp" data-k="${esc(g.key)}" class="${g.key === gk ? 'on' : ''}" aria-pressed="${g.key === gk}">${esc(g.name)}</button>`).join('')}</div>
    <div class="cmp"><div class="cl">${table}${flow}${moves}</div>${sel ? detail(sel, B) : ''}</div>`;
}
const COMPANY_Q = [0, 1, 3, 4, 5, 6, 7], MINE_Q = [2, 8, 9, 10, 11];   // 체크리스트: 회사 7문항 · 내 계획 5문항 (가설 한 문장 · 정찰병 · 50% 하락 · 현금 · 팔 조건)
function detail(x, B) {
  const a = x.ai || {}, f = x.fin || {}, h = x.his || {}, ck = (a.checklist || []).filter((c, i) => COMPANY_Q.includes(i)), n = r => ck.filter(c => c.r === r).length, t = f.ttm || {}, vb = vsBench(x, B);
  const li = s => `<li><span class="pill s">${esc(s.src)}</span>${esc(s.t)}${s.ref ? `<span class="src">${esc(s.ref)}</span>` : ''}</li>`;
  const fy = t.basis && t.basis !== 'TTM', noTTM = t.rev == null;
  return `<section class="card det" id="det"><button class="back" data-act="back">${ic('up')}표로 돌아가기</button><h2>${esc(x.name)} <span class="muted">${esc(x.ticker)}</span>${x.held ? '<span class="held">보유</span>' : ''}<small>${x.price == null ? '' : '$' + x.price}</small></h2>
    ${h.stance ? `<p class="hisl">그: <b>${esc(STANCE(h))}</b>${old(h.date) ? ' <span class="pill s">오래된 입장</span>' : ''} · ${esc(h.reason)}</p>` : '<p class="hisl muted">그가 이 회사를 언급한 적 없어요</p>'}
    ${a.pitch ? `<div class="pitch">${esc(a.pitch)}<small>AI가 그의 관점으로 쓴 가설 초안 · ${a.at ? fd(a.at.slice(0, 10)) : ''}</small></div>` : ''}
    ${fy || noTTM ? `<div class="banner">${ic('alert')}<span>${noTTM ? '최근 12개월 매출을 아직 알 수 없어요 (상장 직후·공시 부족) — 몸값 배수 비교가 빠져요' : `분기 매출 공시가 기계로 읽히지 않아 ${esc(t.basis)} 연간 숫자예요 — 다른 회사와 배수 비교는 주의`}</span></div>` : ''}
    ${vb.line ? `<p class="sub" style="margin:0 0 4px">${vb.line}</p>` : ''}
    <div class="kv"><div><small>시가총액</small><b>${usd(x.mcap)}</b></div><div><small>몸값 / 매출</small><b>${x.evSales == null ? NA : x.evSales.toFixed(1) + '배'}</b></div><div><small>계약 잔고</small><b>${usd(f.rpo)}</b></div>
      <div><small>주식 수 1년 증가</small><b>${pct(f.sharesYoY)}</b></div><div><small>52주 고점</small><b>${x.high52 == null ? NA : '$' + x.high52}</b></div><div><small>고점 대비</small><b class="down">${x.dd == null ? NA : sg(x.dd, 1) + '%'}</b></div></div>
    <div class="sw"><div><h3 class="p">${ic('plus')}강점</h3><ul>${(a.strengths || []).map(li).join('')}</ul></div><div><h3 class="m">${ic('minus')}약점</h3><ul>${(a.weaknesses || []).map(li).join('')}</ul></div></div>
    <div class="sec"><h3>분기 매출 ${f.asOf ? `<span class="muted" style="font-weight:500;font-size:13px">· ${fd(f.asOf)} 기준</span>` : ''}</h3>${bars(f.q) || '<p class="muted">분기 자료 없음</p>'}</div>
    <div class="sec"><h3>${ic('check')}그의 체크리스트 · 회사 7문항 <span class="muted" style="font-weight:500;font-size:13px">통과 ${n('통과')} · 미통과 ${n('미통과')} · 모름 ${n('모름')}</span></h3>
      <div class="ckbar" aria-hidden="true"><i class="p" style="width:${n('통과') / 7 * 100}%"></i><i class="f" style="width:${n('미통과') / 7 * 100}%"></i><i class="u" style="width:${n('모름') / 7 * 100}%"></i></div>
      <ul class="ck">${ck.map(c => `<li><span class="pill s ${c.r === '통과' ? 't-ok' : c.r === '미통과' ? 't-bad' : ''}">${esc(c.r)}</span><span>${esc(c.q)}</span><span class="w">${esc(c.why)}</span></li>`).join('')}</ul>
      <p class="sub" style="margin:10px 0 0">나머지 5문항(가설 한 문장 · 정찰병 · 50% 하락 · 현금 · 팔 조건)은 MJ의 계획이라 ${x.held ? `<a href="#" data-act="openEd" data-k="${esc(x.sym)}">확신 노트</a>에서` : '확신 노트에서'} 직접 정해요.</p></div>
    ${(x.moves || []).length ? `<div class="sec"><h3>${ic('brain')}그의 매매 기록</h3>${x.moves.map(m => `<div class="mv"><span class="dt">${fd(m.date)}</span><span class="pill s">${esc(m.stance)}</span><span class="r">${esc(m.reason)}</span></div>`).join('')}<p class="sub" style="margin:6px 0 0">${h.mentions || 0}번 언급 · ${fd(h.first)} ~ ${fd(h.last)}</p></div>` : ''}
    ${f.src ? `<p class="sub" style="margin:14px 0 0"><a href="${esc(f.src.replace(/&type=10-Q$/, ''))}" target="_blank" rel="noopener">${ic('ext')} SEC 공시 목록</a> · 재무 숫자는 공시 그대로, 강점·약점은 AI 정리</p>` : ''}</section>`;
}

/* ---------- ③ 확신 노트 ---------- */
const ING = [['doubt', '의심 · 욕먹는 정도', '시장이 의심하고 조롱할수록 높게 (모두가 인정하면 낮게)'], ['flow', '큰 흐름 · 구조 변화', '기술 · 트렌드 · 정책 3축이 받쳐 주나'], ['growth', '실제 성장', '매출 · 이익(또는 사용자)이 실제로 늘고 있나'], ['cheap', '일시적 저평가', '공포 · 폭락으로 지금 가격이 눌려 있나 (저평가만으로는 사지 않아요 — 9/7)'], ['time', '긴 시간', '3~4년 들고 갈 수 있나 · 경영진 트랙레코드']];
const PLAN = [['scout', '정찰병으로 시작했나 · 늘리는 조건', '예: 1차 소액 → 다음 계약 발표 확인되면 늘림'], ['drop', '50% 빠지면 더 살까 — 근거 기준', '예: 근거(계약·전력)가 그대로면 산다, 훼손이면 멈춘다'], ['cash', '현금 10~20% · 레버리지 없음 · 1년 안 쓸 돈', '예: 지킴 / 결혼 준비 자금은 따로'], ['exit', '팔 조건 · 기한', '예: 2027년 5월까지 다음 딜이 없으면 근거를 다시 본다']];
const scoreOf = u => { if (!u || !u.s) return { n: 0, t: null }; const n = ING.filter(([k]) => u.s[k] != null).length; return { n, t: n === 5 ? ING.reduce((a, [k]) => a + u.s[k], 0) : null }; };
function weights(D) {
  const cash = S.user.set.cashPct, rows = D.holdings.items.map(h => { const u = S.user.conv[h.sym], sc = scoreOf(u); return { h, u, t: sc.t, n: sc.n }; });
  const sum = rows.reduce((a, r) => a + (r.t >= 70 ? r.t - 70 : 0), 0);
  rows.forEach(r => { r.f = r.t == null ? null : r.t >= 70 && sum ? (100 - cash) * (r.t - 70) / sum : 0; });
  return rows;
}
function wtab(D) {
  const rows = weights(D), scored = rows.filter(r => r.t != null).length, tot = D.holdings.total || 0, cashNow = tot ? D.holdings.cash / tot * 100 : null;
  const st = r => { const h = r.h, out = []; if (h.cap && h.weight > h.cap) out.push(`<span class="pill s t-bad">한도 ${h.cap}% 넘음</span>`);
    if (r.t == null) out.push(`<span class="pill s">${r.n ? r.n + '/5 채점' : '점수 없음'}</span>`); else if (r.t < 70) out.push('<span class="pill s t-warn">70점 미만 — 점수 비례로는 0%</span>');
    else { const d = h.weight - r.f; out.push(`<span class="pill s">점수 비례와 ${d > 0 ? '+' : d < 0 ? '−' : ''}${Math.abs(d).toFixed(1)}%p</span>`); }
    return out.join(' '); };
  const themes = Object.entries(D.holdings.themes || {}).filter(([, v]) => v.weight);
  return `<div class="tw"><table class="dt-t wtab rt"><thead><tr><th>종목</th><th>확신 점수</th><th>점수 비례 (참고)</th><th>지금 비중</th><th>한도</th><th style="text-align:left">점검</th></tr></thead><tbody>
    ${rows.map(r => `<tr data-act="openEd" data-k="${esc(r.h.sym)}" tabindex="0"><td><span class="nm">${esc(r.h.name)}</span></td><td data-l="점수"><b>${r.t == null ? NA : r.t}</b></td><td data-l="점수 비례">${r.f == null ? NA : r.f.toFixed(1) + '%'}</td><td data-l="지금">${w1(r.h.weight)}</td><td data-l="한도">${r.h.cap ? r.h.cap + '%' : NA}</td><td class="wide" style="text-align:left">${st(r)}</td></tr>`).join('')}
    <tr><td><span class="nm">현금</span></td><td data-l="점수">${NA}</td><td data-l="점수 비례">${S.user.set.cashPct}%</td><td data-l="지금">${w1(cashNow)}</td><td data-l="한도">10~20%</td><td class="wide" style="text-align:left"><span class="pill s">그의 평소 현금 10~20%</span></td></tr>
    </tbody></table></div>
    ${themes.length ? `<h3 style="font-size:15px;margin:18px 0 6px">테마 한도 <span class="muted" style="font-weight:500;font-size:13px">MJ가 정한 한도</span></h3><div class="tw"><table class="dt-t wtab rt"><tbody>${themes.map(([k, v]) => `<tr><td><span class="nm">${esc(k)}</span></td><td data-l="지금">${w1(v.weight)}</td><td data-l="한도">${v.limit}%</td><td class="wide" style="text-align:left">${v.weight > v.limit ? `<span class="pill s t-bad">${(v.weight - v.limit).toFixed(1)}%p 넘음</span>` : '<span class="pill s t-ok">한도 안</span>'}</td></tr>`).join('')}</tbody></table></div>` : ''}
    <p class="sub" style="margin:10px 0 0">${scored ? `점수를 다 매긴 종목 ${scored}개 · 70점 넘는 종목만 (점수 − 70)에 비례해 나눠요` : '아래 종목을 펼쳐 재료 5개에 모두 점수를 매기면 점수 비례 비중이 계산돼요'} · 비중은 맥이 ${when(D.holdings.at)}에 읽은 보유 기준</p>`;
}
function editor(D, h, C) {
  const u = S.user.conv[h.sym] || {}, sc = scoreOf(u), his = h.his, co = C && C.items && C.items[h.sym], ai = co && co.ai, aiCk = ai && ai.checklist, ck = u.ck || {}, Q = ((D.brain || {}).checklist || []);
  const mine = !his || !his.stance;
  return `<details class="ed" data-k="${esc(h.sym)}" ${S.open[h.sym] ? 'open' : ''}><summary><span style="min-width:0"><span class="nm">${esc(h.name)}</span>${mine ? '<span class="mine">그의 글에 없음 · 내 고유 확신</span>' : ''}<span class="meta">${w1(h.weight)} · ${esc(h.theme)}${!mine ? ' · 그: ' + esc(STANCE(his)) : ''}</span></span>
      <span class="sc" data-tot="${esc(h.sym)}">${sc.t != null ? `<span class="scp">${sc.t}점</span>` : `<span class="pill t-pri">${sc.n ? sc.n + '/5 채점' : '점수 매기기'}</span>`}</span>${ic('down', 'chev')}</summary>
    <div class="edb"><div class="fld full"><label for="p-${esc(h.sym)}">가설 한 문장 (엘리베이터 피치)</label><textarea id="p-${esc(h.sym)}" data-f="pitch" data-k="${esc(h.sym)}" placeholder="예: 전력망이 연결된 부지를 가진 회사가 AI 클라우드로 바뀌면서 MW당 단가가 오른다">${esc(u.pitch || '')}</textarea>
      ${ai && ai.pitch && !u.pitch ? `<button class="btn2" style="margin-top:8px" data-act="aiPitch" data-k="${esc(h.sym)}">${ic('bulb')}AI 가설 초안 가져오기</button>` : ''}</div>
    <div><div style="font-weight:600;margin-bottom:8px">그의 텐배거 재료 5개 <span class="muted" style="font-weight:500;font-size:13px">각 0~20점 · 다 매기면 확신 점수</span></div>${ING.map(([k, n, help]) => { const v = u.s && u.s[k] != null ? u.s[k] : null; return `<div class="sl"><b>${n}</b><span class="rv" data-rv="${esc(h.sym)}-${k}">${v == null ? '—' : v}</span><input type="range" min="0" max="20" step="1" value="${v == null ? 10 : v}" class="${v == null ? 'un' : ''}" data-f="s" data-i="${k}" data-k="${esc(h.sym)}" aria-label="${n} 0~20점" ${v == null ? 'aria-valuetext="아직 안 매김"' : ''}><span class="h">${help}</span></div>`; }).join('')}</div>
    <div>${PLAN.map(([k, n, ph]) => `<div class="fld"><label for="${k}-${esc(h.sym)}">${n}</label><input type="text" id="${k}-${esc(h.sym)}" data-f="plan" data-i="${k}" data-k="${esc(h.sym)}" value="${esc((u.plan || {})[k] || '')}" placeholder="${esc(ph)}"></div>`).join('')}
      <div class="fld"><label for="n-${esc(h.sym)}">기타 메모</label><textarea id="n-${esc(h.sym)}" data-f="note" data-k="${esc(h.sym)}">${esc(u.note || '')}</textarea></div></div>
    <div class="full">${!mine ? `<div class="fld"><span class="lb">그의 입장 <span class="dt">${fd(his.date)}</span>${old(his.date) ? '<span class="pill s">오래된 입장</span>' : ''}</span><div class="gl">${esc(STANCE(his))} · ${esc(his.reason)}</div></div>` : `<div class="gl">그의 글에는 이 종목 이야기가 없어요. 아래 체크리스트로 그의 일반 규칙을 직접 대어 보세요.</div>`}
      ${(h.checks || []).length ? `<div class="fld"><span class="lb">브리핑 근거 체크 기록 <span class="muted" style="font-weight:500;font-size:13px">최근 ${h.checks.length}건</span></span>${h.checks.map(c => `<div class="trl"><span class="dt">${fd(c.date)}</span>${c.tone ? `<span class="pill s t-${c.tone === 'bad' ? 'warn' : 'ok'}">${c.tone === 'bad' ? '약화' : '강화'}</span> ` : ''}${briefText(c.t, [])}</div>`).join('')}</div>` : ''}
      <details class="more" data-act="ckOpen" data-k="${esc(h.sym)}" ${S.open['ck:' + h.sym] ? 'open' : ''}><summary>그의 체크리스트 12문항으로 직접 점검 (${Object.keys(ck).length}/12)</summary><div class="chk">${Q.map((q, i) => `<div><span>${i + 1}. ${esc(q)}</span><span class="tri" role="group" aria-label="${i + 1}번 답">${['통과', '미통과', '모름'].map((r, j) => `<button data-act="ck" data-k="${esc(h.sym)}" data-i="${i}" data-r="${r}" class="${ck[i] === r ? 'on ' + 'pfu'[j] : ''}" aria-pressed="${ck[i] === r}">${r}</button>`).join('')}</span>${aiCk && aiCk[i] && !MINE_Q.includes(i) ? `<span class="ai">AI 참고: ${esc(aiCk[i].r)} — ${esc(aiCk[i].why)}</span>` : ''}</div>`).join('')}</div></details>
      ${u.at ? `<p class="sub" style="margin:10px 0 0">마지막 수정 ${when(u.at)}${u.hist && u.hist.length > 1 ? ' · 점수 흐름 ' + u.hist.slice(-6).map(x => x.total).join(' → ') : ''}</p>` : ''}</div></div></details>`;
}
function convTab(D) {
  const H = D.holdings.items, C = D.companies, anyScored = H.some(h => scoreOf(S.user.conv[h.sym]).t != null);
  const main = H.filter(h => h.country !== 'CRYPTO' && h.weight >= 1), etc = H.filter(h => !main.includes(h));
  return `<section class="card"><h2>${ic('target')}확신 점수 → 비중 (참고)</h2><p class="sub">그의 9/6 스터디데이 방식: 70점 이상만 담고, (점수 − 70)에 비례해 나눠요. 현금은 먼저 떼어 둬요. 그도 "배점은 감이라 정답 공식은 없다"고 했어요.</p>
      ${anyScored ? '' : '<div class="formula"><code>A 90 · B 85 · C 72</code>→<code>20 + 15 + 2 = 37</code>→<code>54% · 41% · 5%</code></div>'}
      <div class="rng"><label for="cash">현금 먼저 떼기</label><input id="cash" type="range" min="0" max="50" step="1" value="${S.user.set.cashPct}" data-f="cash" aria-label="현금 비율"><span class="rv" id="cashv">${S.user.set.cashPct}%</span></div>
      <div id="wtab" style="margin-top:12px">${wtab(D)}</div>
      <div class="routine">${ic('book')} 그의 점검 루틴 — 매일 근거 · 새 가설 · 돈 3가지 확인 · 주 1회 점수를 ±5 안에서 다시 매김 · 비중 조정은 월 1회, 전체의 10% 안에서 (가격이 아니라 근거가 바뀔 때)</div></section>
    <h2 style="font-size:17px;margin:4px 0 10px">종목별 확신 노트 <span class="muted" style="font-size:13px;font-weight:500">재료 5개 × 20점 · 계획 4줄 · 체크리스트</span></h2>
    <section class="notes">${main.map(h => editor(D, h, C)).join('')}</section>
    ${etc.length ? `<details class="more" style="margin-top:12px" data-act="etcOpen" ${S.open.etc ? 'open' : ''}><summary>기타 — 코인 · 1% 미만 종목 ${etc.length}개</summary><section class="notes" style="margin-top:8px">${etc.map(h => editor(D, h, C)).join('')}</section></details>` : ''}`;
}

/* ---------- 입력 ---------- */
function nav(push) { const st = { tab: S.tab, grp: S.grp, sel: S.sel }; push ? history.pushState(st, '') : history.replaceState(st, ''); }
function openEd(k) {
  if (S.tab !== 'conv') { S.tab = 'conv'; ls.set('cp_tab', 'conv'); nav(true); }
  S.open[k] = true; const h = S.D.holdings.items.find(x => x.sym === k); if (h && (h.country === 'CRYPTO' || h.weight < 1)) S.open.etc = true;
  render(); const el = document.querySelector(`.ed[data-k="${CSS.escape(k)}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a || a.tagName === 'DETAILS') return; const k = a.dataset.k, act = a.dataset.act;
  if (act === 'tab') { if (S.tab === k) return window.scrollTo(0, 0); S.tab = k; ls.set('cp_tab', k); nav(true); render(); window.scrollTo(0, 0); }
  else if (act === 'grp') { S.grp = k; S.sel = ''; ls.set('cp_grp', k); nav(false); render(); }
  else if (act === 'sel') { const had = !!S.sel; S.sel = k; nav(!had); render(); if (innerWidth < 1100) { const d = $('#det'); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }
  else if (act === 'back') { const t = $('#c-table'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  else if (act === 'openEd') { e.preventDefault(); openEd(k); }
  else if (act === 'aiPitch') { const co = S.D.companies && S.D.companies.items[k]; if (!co || !co.ai) return; const u = touch(k); u.pitch = co.ai.pitch; queueSave(); render(); }
  else if (act === 'ck') { const u = touch(k); u.ck = u.ck || {}; const i = a.dataset.i; if (u.ck[i] === a.dataset.r) delete u.ck[i]; else u.ck[i] = a.dataset.r; queueSave(); S.open['ck:' + k] = true; render(); }
  else if (act === 'lock') { if (confirm('이 기기를 잠글까요? 다음에 열 때 암호를 다시 넣어야 해요.')) idb('del').finally(() => location.reload()); }
});
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-act],.ckl[data-act]')) { e.preventDefault(); e.target.click(); } });
document.addEventListener('toggle', e => { const d = e.target; if (!d.classList) return; if (d.classList.contains('ed')) S.open[d.dataset.k] = d.open; else if (d.dataset.act === 'more') S.open.brief = d.open; else if (d.dataset.act === 'ckOpen') S.open['ck:' + d.dataset.k] = d.open; else if (d.dataset.act === 'etcOpen') S.open.etc = d.open; }, true);
function touch(k) { const u = S.user.conv[k] = S.user.conv[k] || {}; u.at = Date.now(); return u; }
document.addEventListener('input', e => {
  const el = e.target, f = el.dataset.f; if (!f) return;
  if (f === 'cash') { S.user.set.cashPct = +el.value; S.user.setAt = Date.now(); $('#cashv').textContent = el.value + '%'; $('#wtab').innerHTML = wtab(S.D); return queueSave(); }
  if (f === 'qa') { const b = S.D.world.brief, q = (b.sections || []).find(s => s.key === '❓'); S.user.qa = S.user.qa || {}; S.user.qa[el.dataset.k] = { q: q ? q.body.slice(0, 300) : '', a: el.value, at: Date.now() }; return queueSave(); }
  const k = el.dataset.k, u = touch(k);
  if (f === 's') {   // 손댄 재료만 점수로 (나머지를 몰래 10점으로 채우지 않음)
    u.s = u.s || {}; u.s[el.dataset.i] = +el.value; el.classList.remove('un'); el.removeAttribute('aria-valuetext');
    document.querySelector(`[data-rv="${CSS.escape(k + '-' + el.dataset.i)}"]`).textContent = el.value;
    const sc = scoreOf(u), tb = document.querySelector(`[data-tot="${CSS.escape(k)}"]`); tb.innerHTML = sc.t != null ? `<span class="scp">${sc.t}점</span>` : `<span class="pill t-pri">${sc.n}/5 채점</span>`;
    $('#wtab').innerHTML = wtab(S.D);
  } else if (f === 'plan') { u.plan = u.plan || {}; u.plan[el.dataset.i] = el.value; }
  else u[f] = el.value;
  queueSave();
});
document.addEventListener('change', e => {   // 점수 흐름은 손을 뗄 때 한 번만 남김 (6시간 안 고친 건 한 줄로)
  const el = e.target; if (el.dataset.f !== 's') return; const u = S.user.conv[el.dataset.k]; if (!u) return; const t = scoreOf(u).t; if (t == null) return; const hs = u.hist = u.hist || [];
  const last = hs[hs.length - 1]; if (last && Date.now() - last.at < 6 * 3600e3) { last.total = t; last.at = Date.now(); } else hs.push({ at: Date.now(), total: t }); if (hs.length > 60) hs.shift();
  queueSave();
});
S.rw = innerWidth; addEventListener('resize', () => { if (innerWidth === S.rw) return; S.rw = innerWidth; if (S.tab === 'world' && S.D) { clearTimeout(S.rz); S.rz = setTimeout(softRender, 250); } });   // 1027 폭이 바뀔 때만 (휴대폰 스크롤로 주소창이 접히면 높이만 바뀜 → 다시 그리면 펼친 더보기가 접혔음)
boot();
