// Общее для 3D-версии и каталога: карточка стенда и статистика визита (для проверки гипотезы).
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

  window.openStand = function (id) {
    const s = window.STANDS.find(x => x.id === id);
    if (!s) return;
    if (!visit.opened.includes(id)) visit.opened.push(id);
    flush();
    const link = (url, label) => url
      ? `<a class="btn" href="${url}" target="_blank" rel="noopener">${label}</a>`
      : `<span class="btn off" title="Автор добавит материал позже">${label} — скоро</span>`;
    const pres = s.links.presentation || `present.html?id=${encodeURIComponent(s.id)}`;
    const ask = s.links.question
      ? link(s.links.question, "Вопрос автору")
      : `<button class="btn" onclick="document.getElementById('askf').hidden=false;this.hidden=true">Вопрос автору</button>`;
    const box = document.getElementById("modal");
    box.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-label="${s.title}">
      <button class="x" onclick="closeStand()" aria-label="Закрыть">×</button>
      <div class="hall" style="border-left:5px solid ${s.color};padding-left:7px">${hallName(s.hall)}</div>
      <h2>${s.title}</h2><div class="meta">${s.team} · ${s.school}</div><p>${s.text}</p>
      <div class="btns">${link(pres, "Презентация")}${link(s.links.video, "Видео")}${link(s.links.product, "Продукт")}${ask}
      <button class="btn like" onclick="likeStand('${s.id}', this)">${visit.likes.includes(s.id) ? "♥ Нравится" : "♡ Нравится"}</button></div>
      <form id="askf" class="ask" hidden onsubmit="return askAuthor(event, '${s.id}')">
        <label for="askq">Ваш вопрос команде (без имени и контактов)</label>
        <textarea id="askq" rows="3" maxlength="500" required></textarea>
        <label class="chk"><input type="checkbox" required> Мне есть 14 лет или родитель знает о вопросе; вопрос будет передан автору стенда</label>
        <button class="btn" type="submit">Отправить</button>
      </form></div>`;
    box.hidden = false;
    box.querySelector(".x").focus();
  };
  window.askAuthor = function (e, id) {
    e.preventDefault();
    const q = document.getElementById("askq").value.trim();
    if (q) { visit.questions.push({ stand: id, text: q, at: new Date().toISOString() }); flush(); }
    e.target.innerHTML = "<p><b>Спасибо!</b> Вопрос сохранён и попадёт к автору вместе с выгрузкой статистики.</p>";
    return false;
  };
  window.closeStand = () => { document.getElementById("modal").hidden = true; };
  window.likeStand = (id, el) => { if (!visit.likes.includes(id)) visit.likes.push(id); el.textContent = "♥ Нравится"; flush(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") window.closeStand(); });

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
    a.href = URL.createObjectURL(new Blob([JSON.stringify(load(), null, 1)], { type: "application/json" }));
    a.download = "proektosfera-stats.json"; a.click();
  };
  // Окно статистики: две столбчатые диаграммы «3D-павильон против каталога» с подписями осей и единицами.
  window.showStats = function () {
    const by = { "3d": { visits: 0, opened: 0, sec: 0 }, catalog: { visits: 0, opened: 0, sec: 0 } };
    load().forEach(v => { const b = by[v.mode]; if (!b) return; b.visits++; b.opened += v.opened.length; b.sec += (v.end - v.start) / 1000; });
    const avg = (b, k) => b.visits ? b[k] / b.visits : 0;
    const chart = (title, unit, k, digits) => {
      const vals = [["3D-павильон", avg(by["3d"], k), "#0e8aa6"], ["Каталог", avg(by.catalog, k), "#1b2a52"]];
      const max = Math.max(1, ...vals.map(v => v[1])) * 1.15, H = 140, W = 220;
      const bars = vals.map(([name, val, c], i) => {
        const h = val / max * H, x = 60 + i * 80;
        return `<rect x="${x}" y="${20 + H - h}" width="50" height="${h}" fill="${c}" rx="3"/>
          <text x="${x + 25}" y="${14 + H - h}" text-anchor="middle" font-size="13" font-weight="700" fill="#1b2233">${val.toFixed(digits)}</text>
          <text x="${x + 25}" y="${H + 38}" text-anchor="middle" font-size="12" fill="#1b2233">${name}</text>`;
      }).join("");
      return `<figure class="chart"><figcaption>${title}</figcaption>
        <svg viewBox="0 0 ${W} ${H + 50}" role="img" aria-label="${title}">
          <line x1="44" y1="20" x2="44" y2="${H + 20}" stroke="#5d6472"/><line x1="44" y1="${H + 20}" x2="${W}" y2="${H + 20}" stroke="#5d6472"/>
          <text x="12" y="${20 + H / 2}" font-size="11" fill="#5d6472" transform="rotate(-90 12 ${20 + H / 2})" text-anchor="middle">${unit}</text>
          ${bars}</svg></figure>`;
    };
    const n = by["3d"].visits + by.catalog.visits;
    const box = document.getElementById("modal");
    box.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-label="Статистика визитов">
      <button class="x" onclick="closeStand()" aria-label="Закрыть">×</button>
      <h2>Статистика визитов</h2>
      <div class="meta">Визитов в этом браузере: 3D — ${by["3d"].visits}, каталог — ${by.catalog.visits}. Гипотеза: в 3D открывают на 50 % больше стендов и проводят в 1,5 раза больше времени.</div>
      ${n ? `<div class="charts">${chart("Открыто стендов за визит", "стендов, шт.", "opened", 1)}${chart("Время на сайте за визит", "время, с", "sec", 0)}</div>`
          : "<p>Пока нет данных: откройте несколько стендов и вернитесь сюда.</p>"}
    </div>`;
    box.hidden = false; box.querySelector(".x").focus();
  };
})();
