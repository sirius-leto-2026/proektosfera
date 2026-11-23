// Общее для 3D-версии и каталога: карточка стенда, постоянные ссылки на стенд,
// «поделиться» и статистика визита (для проверки гипотезы).
(function () {
  const KEY = "proektosfera_stats";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };

  const mode = document.body.dataset.mode;           // "3d" или "catalog"
  const visit = { mode, start: Date.now(), end: Date.now(), opened: [], likes: [], questions: [] };
  const all = load(); all.push(visit);
  const flush = () => { visit.end = Date.now(); save(all); };
  setInterval(flush, 5000);
  window.addEventListener("beforeunload", flush);

  const hallName = (id) => (window.HALLS.find(h => h.id === id) || {}).name || id;
  const modal = document.getElementById("modal");
  const canUpdateHash = mode === "3d" || mode === "catalog";
  let lastFocus = null;

  // Числа на первом экране всегда берём из данных, чтобы статистика не расходилась с содержимым.
  const setCount = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
  setCount("n-stands", window.STANDS.length);
  setCount("n-halls", window.HALLS.length);

  // ---------- постоянная ссылка на стенд ----------
  const standFromHash = () => {
    const m = (location.hash || "").match(/^#stand=([\w-]+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  };
  const setHash = (id) => {
    if (!canUpdateHash) return;
    const url = id ? "#stand=" + encodeURIComponent(id) : location.pathname + location.search;
    try { history.replaceState(null, "", url); } catch (e) {}
  };
  const openFromHash = () => {
    const id = standFromHash();
    if (!id || !window.STANDS.some(s => s.id === id)) return;
    // В 3D сначала подходим к стенду, в каталоге просто открываем карточку.
    if (typeof window.goStand === "function") window.goStand(id);
    else window.openStand(id);
  };
  if (mode === "3d") {
    const scene = document.querySelector("a-scene");
    const run = () => openFromHash();
    if (scene) {
      if (scene.hasLoaded) run();
      else scene.addEventListener("loaded", run, { once: true });
    }
  } else if (mode === "catalog") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", openFromHash, { once: true });
    else openFromHash();
  }
  window.addEventListener("hashchange", () => {
    if (standFromHash()) openFromHash();
    else if (modal && !modal.hidden) closeModal(true);
  });

  // ---------- модальное окно и фокус ----------
  const focusables = () => modal ? [...modal.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter(el => el.getClientRects().length) : [];

  function showModal(html) {
    if (!modal) return;
    const active = document.activeElement;
    lastFocus = active && active !== document.body ? active : null;
    modal.innerHTML = html;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    const close = modal.querySelector(".x");
    if (close) close.focus();
  }
  function closeModal(restore) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.innerHTML = "";
    document.body.classList.remove("modal-open");
    if (restore) {
      const fallback = mode === "catalog" ? document.querySelector(".item") : document.getElementById("q");
      const target = lastFocus && document.contains(lastFocus) ? lastFocus : fallback;
      if (target && target.focus) target.focus();
    }
    lastFocus = null;
  }
  window.closeStand = () => { setHash(null); closeModal(true); };

  if (modal) {
    modal.addEventListener("click", e => { if (e.target === modal) window.closeStand(); });
    document.addEventListener("keydown", e => {
      if (modal.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); window.closeStand(); return; }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
        e.preventDefault(); first.focus();
      }
    });
  }

  // ---------- карточка стенда ----------
  window.openStand = function (id) {
    const s = window.STANDS.find(x => x.id === id);
    if (!s || !modal) return;
    setHash(s.id);
    if (!visit.opened.includes(id)) visit.opened.push(id);
    flush();
    const link = (url, label) => url
      ? `<a class="btn" href="${url.replace(/&/g, "&amp;")}" target="_blank" rel="noopener">${label}</a>`
      : `<span class="btn off" title="Автор добавит материал позже">${label} — скоро</span>`;
    // present.html собирает демонстрационную презентацию из карточки, поэтому честно называем её демо.
    const presUrl = s.links.presentation || `present.html?id=${encodeURIComponent(s.id)}`;
    const presLabel = s.links.presentation ? "Презентация" : "Демо-презентация";
    // Ссылка с параметром auto=1 — не видео, а демонстрационный авто-ролик.
    const videoLabel = s.links.video && /[?&]auto=1/.test(s.links.video) ? "Демо-ролик" : "Видео";
    const question = s.links.question
      ? link(s.links.question, "Вопрос автору")
      : `<button class="btn" type="button" onclick="showAskForm(this)">Вопрос автору</button>`;
    const liked = visit.likes.includes(s.id);
    showModal(`<div class="card" role="dialog" aria-modal="true" aria-label="${s.title}">
      <button class="x" type="button" onclick="closeStand()" aria-label="Закрыть карточку стенда">×</button>
      <div class="hall" style="border-left:5px solid ${s.color};padding-left:7px">${hallName(s.hall)}</div>
      <h2>${s.title}</h2><div class="meta">${s.team} · ${s.school}</div><p>${s.text}</p>
      <div class="btns">${link(presUrl, presLabel)}${link(s.links.video, videoLabel)}${link(s.links.product, "Продукт")}${question}
      <button class="btn like" type="button" aria-pressed="${liked}" onclick="likeStand('${s.id}', this)">${liked ? "♥ Нравится" : "♡ Нравится"}</button>
      <button class="btn" type="button" onclick="shareStand('${s.id}')">Поделиться</button></div>
      <p class="sharemsg" id="sharemsg" role="status" aria-live="polite" hidden></p>
      <form id="askf" class="ask" hidden onsubmit="return askAuthor(event, '${s.id}')">
        <label for="askq">Ваш вопрос команде (без имени и контактов)</label>
        <textarea id="askq" rows="3" maxlength="500" required></textarea>
        <label class="chk"><input type="checkbox" required> Мне есть 14 лет или родитель знает о вопросе. Вопрос сохранится в этом браузере и попадёт в выгрузку статистики.</label>
        <button class="btn" type="submit">Сохранить вопрос</button>
      </form></div>`);
  };
  window.showAskForm = function (btn) {
    const form = document.getElementById("askf");
    if (!form) return;
    form.hidden = false;
    btn.hidden = true;
    const field = document.getElementById("askq");
    if (field) field.focus();
  };
  window.askAuthor = function (e, id) {
    e.preventDefault();
    const q = document.getElementById("askq").value.trim();
    if (q) { visit.questions.push({ stand: id, text: q, at: new Date().toISOString() }); flush(); }
    e.target.innerHTML = "<p><b>Спасибо!</b> Вопрос сохранён в этом браузере. Чтобы передать его команде, выгрузите статистику на странице <a href=\"catalog.html\">каталога</a> и пришлите файл.</p>";
    const close = modal && modal.querySelector(".x");
    if (close) close.focus();
    return false;
  };
  window.likeStand = (id, el) => {
    if (!visit.likes.includes(id)) visit.likes.push(id);
    el.textContent = "♥ Нравится";
    el.setAttribute("aria-pressed", "true");
    flush();
  };

  // ---------- «поделиться стендом» ----------
  window.shareStand = async function (id) {
    const s = window.STANDS.find(x => x.id === id);
    if (!s) return;
    const url = new URL("index.html#stand=" + encodeURIComponent(s.id), location.href).href;
    const msg = document.getElementById("sharemsg");
    const show = (text, html) => {
      if (!msg) return;
      msg.hidden = false;
      if (html) msg.innerHTML = html; else msg.textContent = text;
    };
    if (navigator.share) {
      try {
        await navigator.share({ title: "ПроектоСфера — " + s.title, text: "Стенд выставки «ПроектоСфера»: " + s.title, url });
        return;
      } catch (e) { if (e && e.name === "AbortError") return; }
    }
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error("clipboard");
      await navigator.clipboard.writeText(url);
      show("Ссылка на стенд скопирована: " + url);
    } catch (e) {
      show("", `Ссылка на стенд: <a href="${url}">${url}</a>`);
    }
  };

  // ---------- статистика ----------
  // Сводка по всем визитам в этом браузере: среднее число открытых стендов и время по версиям.
  window.statsSummary = function () {
    const rows = load().filter(v => v.mode);
    const by = {};
    rows.forEach(v => {
      const b = by[v.mode] = by[v.mode] || { visits: 0, opened: 0, sec: 0 };
      b.visits++; b.opened += v.opened.length; b.sec += (v.end - v.start) / 1000;
    });
    return Object.entries(by).map(([m, b]) =>
      `${m === "3d" ? "3D-павильон" : "Каталог"}: визитов ${b.visits}, открыто в среднем ${(b.opened / b.visits).toFixed(1)}, время в среднем ${Math.round(b.sec / b.visits)} с`).join("\n") || "Пока нет данных";
  };
  window.exportStats = function () {
    const a = document.createElement("a");
    const blob = new Blob([JSON.stringify(load(), null, 1)], { type: "application/json" });
    a.href = URL.createObjectURL(blob);
    a.download = "proektosfera-stats.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  // Окно статистики: две столбчатые диаграммы «3D-павильон против каталога» с подписями осей и единицами.
  window.showStats = function () {
    const by = { "3d": { visits: 0, opened: 0, sec: 0 }, catalog: { visits: 0, opened: 0, sec: 0 } };
    load().forEach(v => { const b = by[v.mode]; if (!b) return; b.visits++; b.opened += v.opened.length; b.sec += (v.end - v.start) / 1000; });
    const avg = (b, k) => b.visits ? b[k] / b.visits : 0;
    const chart = (title, unit, k, digits) => {
      const vals = [["3D-павильон", avg(by["3d"], k), "#0e8aa6"], ["Каталог", avg(by.catalog, k), "#1b2a52"]];
      const max = Math.max(1, ...vals.map(v => v[1])) * 1.15, H = 140, W = 220;
      const chartLabel = `${title}: 3D-павильон — ${vals[0][1].toFixed(digits)}, каталог — ${vals[1][1].toFixed(digits)}`;
      const bars = vals.map(([name, val, c], i) => {
        const h = val / max * H, x = 60 + i * 80;
        return `<rect x="${x}" y="${20 + H - h}" width="50" height="${h}" fill="${c}" rx="3"/>
          <text x="${x + 25}" y="${14 + H - h}" text-anchor="middle" font-size="13" font-weight="700" fill="#1b2233">${val.toFixed(digits)}</text>
          <text x="${x + 25}" y="${H + 38}" text-anchor="middle" font-size="12" fill="#1b2233">${name}</text>`;
      }).join("");
      return `<figure class="chart"><figcaption>${title}</figcaption>
        <svg viewBox="0 0 ${W} ${H + 50}" role="img" aria-label="${chartLabel}">
          <line x1="44" y1="20" x2="44" y2="${H + 20}" stroke="#5d6472"/><line x1="44" y1="${H + 20}" x2="${W}" y2="${H + 20}" stroke="#5d6472"/>
          <text x="12" y="${20 + H / 2}" font-size="11" fill="#5d6472" transform="rotate(-90 12 ${20 + H / 2})" text-anchor="middle">${unit}</text>
          ${bars}</svg></figure>`;
    };
    const n = by["3d"].visits + by.catalog.visits;
    showModal(`<div class="card" role="dialog" aria-modal="true" aria-label="Статистика визитов">
      <button class="x" type="button" onclick="closeStand()" aria-label="Закрыть статистику">×</button>
      <h2>Статистика визитов</h2>
      <div class="meta">На выставке ${window.STANDS.length} стендов в ${window.HALLS.length} залах. Визитов в этом браузере: 3D — ${by["3d"].visits}, каталог — ${by.catalog.visits}. Гипотеза: в 3D открывают на 50 % больше стендов и проводят в 1,5 раза больше времени.</div>
      ${n ? `<div class="charts">${chart("Открыто стендов за визит", "стендов, шт.", "opened", 1)}${chart("Время на сайте за визит", "время, с", "sec", 0)}</div>`
          : "<p>Пока нет данных: откройте несколько стендов и вернитесь сюда.</p>"}
      <p class="note">Данные хранятся только в этом браузере и никуда не отправляются. Файл ниже можно передать команде проекта.</p>
      <div class="stats-actions"><button class="btn" type="button" onclick="exportStats()">Выгрузить статистику (JSON)</button></div>
    </div>`);
  };
})();
