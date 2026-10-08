import { RUBRICS } from './rubrics.js';
import { evaluateStudent, gradeStatus, format, displayed, parseDelimited, parseGrade, studentsFromRows, rubricsFor, validShape, emptyScores, criterionValue, parseEokul } from './core.js';
import { buildReportHTML, reportIssues } from './reports.js';
import { createWorkbook, importWorkbook } from './xlsx.js';

const $ = id => document.getElementById(id);
export const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const esc = escapeHTML;
const KEY = 'olcek-v2', OLD_KEY = 'olcek-workspace-v1', EOKUL_KEY = 'olcek-eokul-columns', MAX_STUDENTS = 500, MAX_CLASSES = 60;
const uid = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const today = () => new Date().toLocaleDateString('sv-SE');
const schoolYear = () => { const d = new Date(), y = d.getFullYear(); return d.getMonth() >= 7 ? `${y}–${y + 1}` : `${y - 1}–${y}`; };
const blankStudent = () => ({ id: uid(), no: '', name: '', p1: '', p2: '' });
const newClass = (name = '') => ({ id: uid(), name, book1: '', book2: '', students: [] });
const isBlank = s => ![s.no, s.name, s.p1, s.p2].some(v => String(v).trim()) && !s.manual1 && !s.manual2;
const FIELDS = ['no', 'name', 'p1', 'p2'];
const WEIGHT = { book1: 33, book2: 33, observe: 34 };

// ---------- Workspace (several classes, shared teacher details) ----------
const text = (v, max, fallback = '') => typeof v === 'string' && v.length <= max ? v : fallback;
function cleanStudent(s) {
  if (!s || FIELDS.some(k => typeof s[k] !== 'string')) throw new Error('Yedekteki öğrenci alanları geçersiz.');
  if (s.no.length > 30 || s.name.length > 150 || s.p1.length > 6 || s.p2.length > 6) throw new Error('Yedekteki öğrenci alanları çok uzun.');
  const student = { id: text(s.id, 100) || uid(), no: s.no, name: s.name, p1: s.p1, p2: s.p2 };
  for (const p of [1, 2]) {
    if (typeof s[`accepted${p}`] === 'number') student[`accepted${p}`] = s[`accepted${p}`];
    if (validShape(s[`manual${p}`], p)) student[`manual${p}`] = Object.fromEntries(rubricsFor(p).map(r => [r.id, [...s[`manual${p}`][r.id]]]));
  }
  return student;
}
function cleanStudents(list) {
  if (!Array.isArray(list) || list.length > MAX_STUDENTS) throw new Error('Yedekteki öğrenci listesi geçersiz.');
  const students = list.map(cleanStudent).filter(s => !isBlank(s));
  if (new Set(students.map(s => s.id)).size !== students.length) throw new Error('Yedekte yinelenen öğrenci kayıtları var.');
  return students;
}
const cleanProfile = p => ({ school: text(p.school, 200), teacher: text(p.teacher, 120), year: text(p.year, 20) || schoolYear(), date: text(p.date, 10) || today() });
export function parseWorkspace(saved) {
  if (saved?.version === 1 && saved.meta && Array.isArray(saved.students)) {
    const m = saved.meta, c = newClass(text(m.className, 40));
    Object.assign(c, { book1: text(m.book1, 200), book2: text(m.book2, 200), students: cleanStudents(saved.students) });
    return { version: 2, profile: cleanProfile(m), activeId: c.id, classes: [c] };
  }
  if (saved?.version !== 2 || !Array.isArray(saved.classes) || !saved.classes.length || saved.classes.length > MAX_CLASSES) throw new Error('Bu dosya geçerli bir Ölçek yedeği değil.');
  const classes = saved.classes.map(c => ({ id: text(c?.id, 100) || uid(), name: text(c?.name, 40), book1: text(c?.book1, 200), book2: text(c?.book2, 200), students: cleanStudents(c?.students) }));
  if (new Set(classes.map(c => c.id)).size !== classes.length) throw new Error('Yedekte yinelenen sınıf kayıtları var.');
  return { version: 2, profile: cleanProfile(saved.profile || {}), activeId: classes.some(c => c.id === saved.activeId) ? saved.activeId : classes[0].id, classes };
}
// Several teachers may use the same computer one after another: every page load
// starts empty and nothing is kept in the browser. Earlier saved work is removed.
function loadWorkspace() {
  // Also the keys of the earlier versions published at mesutpeker.com/olcek.
  for (const key of [KEY, OLD_KEY, 'olcek_app_data_v2', 'olcek_app_data_v1']) { try { localStorage.removeItem(key); sessionStorage.removeItem(key); } catch {} }
  const c = newClass();
  return { version: 2, profile: cleanProfile({}), activeId: c.id, classes: [c] };
}

let ws = loadWorkspace();
let evaluations = [], sheet = 'grades', drawerIndex = -1, sortState = null;
const cls = () => ws.classes.find(c => c.id === ws.activeId) || ws.classes[0];
// Shown wherever the class is named; a new work session starts without a class name.
const classLabel = (c = cls()) => c.name.trim() || (ws.classes.filter(x => !x.name.trim()).length > 1 ? `Adsız sınıf ${ws.classes.indexOf(c) + 1}` : 'Sınıf adı girilmedi');
const students = () => cls().students;
const reportState = () => { const c = cls(); return { meta: { ...ws.profile, className: c.name.trim(), book1: c.book1, book2: c.book2 }, students: c.students, policy: 'rounded' }; };
const evaluateAll = () => { evaluations = students().map(evaluateStudent); };
const indexOf = id => students().findIndex(s => s.id === id);
const rubricById = id => RUBRICS.find(r => r.id === id);
const body = $('sheet-body');

const hasWork = () => ws.classes.some(c => c.students.some(s => !isBlank(s)));
function save() {
  $('save-status').textContent = hasWork() ? 'Kaydedilmez · saklamak için yedek indirin' : 'Sayfa kapanınca bilgiler silinir';
}

// ---------- Toast with undo ----------
function toast(message, action) {
  const el = $('toast');
  // Modal dialogs live in the top layer; keep the toast above them.
  const host = document.querySelector('dialog[open]') || document.body;
  if (el.parentElement !== host) host.appendChild(el);
  el.innerHTML = `<span>${esc(message)}</span>${action ? `<button>${esc(action.label)}</button>` : ''}`;
  if (action) el.querySelector('button').onclick = () => { el.hidden = true; action.run(); };
  el.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { el.hidden = true; }, action ? 7000 : 4500);
}
const snapshot = () => { const id = ws.activeId, list = structuredClone(students()); return () => { const c = ws.classes.find(c => c.id === id); if (!c) return; c.students = list; ws.activeId = id; renderAll(); save(); }; };
const undoable = (message, restore) => toast(message, { label: 'Geri al', run: restore });

// ---------- Status of a performance grade ----------
function statusHTML(s, entry, p) {
  const st = gradeStatus(s, entry, p);
  switch (st.kind) {
    case 'error': return `<span class="chip bad" title="${esc(st.message)}">Geçersiz not</span>`;
    case 'incomplete': return `<span class="chip warn" title="${esc(st.missing.map(m => `${m.name}: ${m.count} boş`).join(' · '))}">${st.count} kriter boş</span>`;
    case 'exact': return `<span class="chip ok" title="Excel’de aynı not çıkar">✓</span>`;
    case 'rounded': return `<span class="chip ok" title="Excel hesabı ${format(st.result)}; çizelgede ${displayed(st.result)} görünür">✓ <small>${format(st.result)}</small></span>`;
    case 'manual': return `<span class="chip manual" title="Not, girilen kriter puanlarından hesaplandı">✎ Kriterlerden</span>`;
    case 'accepted': return `<span class="chip soft" title="Girilen ${format(st.target)}; Excel sonucu ${format(st.result)} onaylandı">Excel ${format(st.result)} ✓</span>`;
    case 'pending': return `<button class="chip warn" data-accept="${p}" title="${esc(st.belowMin ? `Ölçeklerle en düşük ${st.min} üretilebilir. Görevi yapmayan öğrencinin notunu boş bırakın.` : `Girilen ${format(st.target)} tam üretilemiyor.`)} Onaylamak için tıklayın.">Excel ${format(st.result)} · Onayla</button>`;
    default: return '';
  }
}
const needsWork = kind => ['pending', 'error', 'incomplete'].includes(kind);

// ---------- Steps ----------
function renderSteps() {
  const issues = issueList(), p = ws.profile;
  const listed = students().map((s, i) => [s, i]).filter(([s]) => !isBlank(s));
  const missing = [!cls().name.trim() && 'sınıf adı', !p.school.trim() && 'okul adı', !p.teacher.trim() && 'öğretmen adı'].filter(Boolean);
  const graded = listed.filter(([s, i]) => [1, 2].some(q => evaluations[i][q - 1].data) && ![1, 2].some(q => needsWork(gradeStatus(s, evaluations[i][q - 1], q).kind))).length;
  const steps = [
    { title: 'Sınıf bilgileri', text: missing.length ? `Eksik: ${missing.join(', ')}` : `${p.school} · ${p.teacher}`, state: missing.length ? 'todo' : 'done', action: 'info' },
    { title: 'Öğrenci listesi', text: listed.length ? `${listed.length} öğrenci · e-Okul’dan güncelle` : 'e-Okul’dan yapıştırın', state: listed.length ? 'done' : 'todo', action: 'eokul' },
    { title: 'Notlar ve kriterler', text: !listed.length ? 'Önce öğrenci ekleyin' : issues.length ? `${issues.length} not kontrol bekliyor` : `${graded} öğrencinin notu hazır`, state: !listed.length ? 'idle' : issues.length ? 'warn' : graded ? 'done' : 'todo', action: 'notes' },
    { title: 'Yazdır / Excel', text: !graded ? 'Notlar girildikten sonra' : issues.length ? 'Önce uyarıları giderin' : 'Çizelgeler hazır', state: graded && !issues.length ? 'ready' : 'idle', action: 'print' },
  ];
  $('steps').innerHTML = steps.map((s, i) => `<li><button class="step ${s.state}" data-step="${s.action}"><span class="step-n">${s.state === 'done' ? '✓' : i + 1}</span><span class="step-t"><b>${s.title}</b><small>${esc(s.text)}</small></span></button></li>`).join('');
}
$('steps').onclick = event => {
  const action = event.target.closest('[data-step]')?.dataset.step;
  if (action === 'info') openInfo();
  if (action === 'eokul') openEokul();
  if (action === 'notes') { const it = issueList()[0]; if (it) goTo(it); else showSheet('grades'); }
  if (action === 'print') printReport('all');
};

// ---------- Sheet tabs ----------
function renderTabs() {
  const tab = (id, label, kind, sub = '') => `<button role="tab" class="sheet-btn ${kind}" data-sheet="${id}" aria-selected="${sheet === id}"><b>${esc(label)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`;
  const row = (p, title, weights) => `<span class="nav-label p${p}"><b>${title}</b><small>${weights}</small></span>${rubricsFor(p).map(r => tab(r.id, r.name, `p${p}`, `${r.criteria.length} kriter`)).join('')}${p === 2 ? '<span class="nav-gap" aria-hidden="true"></span>' : ''}`;
  $('sheet-tabs').innerHTML = `${tab('grades', 'Performans notları', 'main', 'Not girişi · tüm öğrenciler')}<div class="nav-grid">${row(1, '1. Performans', 'her ölçek %25')}${row(2, '2. Performans', '%33 · %33 · %34')}</div>`;
}
$('sheet-tabs').onclick = event => { const id = event.target.closest('[data-sheet]')?.dataset.sheet; if (id) showSheet(id); };
function showSheet(id) { sheet = id; renderTabs(); renderSheet(); }

function renderSheet() {
  const r = rubricById(sheet);
  body.classList.toggle('is-rubric', Boolean(r));
  if (!r) {
    $('sheet-title').textContent = `${classLabel()} · Performans notları`;
    $('sheet-desc').textContent = 'Notu yazın; kriter puanları ölçeklere otomatik dağıtılır. Kriterleri kendiniz girmek için yukarıdaki ölçek sekmelerini kullanın.';
    renderGrades();
  } else {
    const part = r.performance === 1 ? '1. performansın %25’i' : `2. performansın %${WEIGHT[r.id]}’ü (100’lük karşılığı)`;
    $('sheet-title').textContent = `${classLabel()} · ${r.name}`;
    $('sheet-desc').textContent = `${r.criteria.length} kriter · geçerli puanlar ${[...new Set(r.criteria.map(c => c.points.join('·')))].join(' / ')} · toplam ${r.min}–${r.max} · ${part}. Gri puanlar nottan otomatik dağıtıldı; bir puanı değiştirdiğinizde not kriterlerden hesaplanır.`;
    renderRubric(r);
  }
  renderFoot();
}
function renderFoot() {
  const avg = p => {
    const v = [];
    students().forEach((s, i) => { const st = gradeStatus(s, evaluations[i][p - 1], p); if (s.name.trim() && st.result !== undefined && !needsWork(st.kind)) v.push(displayed(st.result)); });
    return v.length ? format(Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10) : '—';
  };
  const legend = rubricById(sheet)
    ? ''
    : '<span><span class="chip ok">✓</span> Excel aynı notu verir</span><span><span class="chip manual">✎ Kriterlerden</span> kriterlerden hesaplandı</span><span class="hint-k">Excel’den sütun yapıştırılabilir · <kbd>Enter</kbd> alt satıra geçer</span>';
  $('sheet-foot').innerHTML = `<div class="legend">${legend}</div><div class="avgs">Sınıf ortalaması <b class="p1">1. P: ${avg(1)}</b><b class="p2">2. P: ${avg(2)}</b></div>`;
}

// ---------- Grade table ----------
function gradeRow(s, i) {
  const label = { no: 'öğrenci numarası', name: 'adı ve soyadı', p1: '1. performans notu', p2: '2. performans notu' };
  const input = k => `<input data-field="${k}" value="${esc(s[k])}" aria-label="${i + 1}. satır ${label[k]}" ${k === 'no' ? 'maxlength="30" inputmode="numeric" placeholder="No"' : k === 'name' ? 'maxlength="150" placeholder="Adı ve soyadı"' : 'maxlength="6" inputmode="decimal" placeholder="—" autocomplete="off"'}>`;
  return `<tr data-id="${esc(s.id)}"><td class="c-idx">${i + 1}</td><td class="c-no">${input('no')}</td><td class="c-name">${input('name')}</td>${[1, 2].map(p => `<td class="c-grade p${p}" data-label="${p}. Performans"><div class="grade-cell">${input(`p${p}`)}<span class="status" data-status="${p}"></span></div></td>`).join('')}<td class="c-act"><button class="btn link" data-open>Ölçekler</button><button class="btn icon subtle" data-remove aria-label="${i + 1}. satırı sil" title="Sil">×</button></td></tr>`;
}
const emptyState = () => `<div class="empty-state"><h2>${cls().name.trim() ? `${esc(cls().name.trim())} sınıfında henüz öğrenci yok` : 'Henüz öğrenci yok'}</h2><p>e-Okul’daki öğrenci listesini kopyalayıp buraya aktarın. Notlar da varsa birlikte alınabilir.</p><div><button class="btn primary" data-empty="eokul">📋 e-Okul’dan yapıştır</button><button class="btn" data-empty="add">Tek tek ekle</button></div></div>`;
function renderGrades() {
  const list = students();
  body.innerHTML = list.length ? `<table class="grid grades"><thead><tr><th class="c-idx">#</th><th class="c-no"><button class="sort" data-sort="no">No</button></th><th class="c-name"><button class="sort" data-sort="name">Adı ve soyadı</button></th><th class="c-grade p1">1. Performans<small>Konuşma · Yazma</small></th><th class="c-grade p2">2. Performans<small>Kitap okuma · Gözlem</small></th><th class="c-act"><span class="sr-only">İşlemler</span></th></tr></thead><tbody id="rows">${list.map(gradeRow).join('')}</tbody></table>` : emptyState();
  list.forEach((_, i) => updateRow(i));
  markDuplicates();
}
const rowOf = (container, s) => s && document.querySelector(`#${container} tr[data-id="${CSS.escape(s.id)}"]`);
function updateRow(i) {
  const s = students()[i], row = rowOf('rows', s);
  if (!row) return;
  for (const p of [1, 2]) {
    const input = row.querySelector(`[data-field="p${p}"]`), st = gradeStatus(s, evaluations[i][p - 1], p);
    if (document.activeElement !== input && input.value !== s[`p${p}`]) input.value = s[`p${p}`];
    input.setAttribute('aria-invalid', st.kind === 'error');
    input.classList.toggle('manual', st.kind === 'manual' || st.kind === 'incomplete');
    input.placeholder = st.kind === 'incomplete' ? '…' : '—';
    row.querySelector(`[data-status="${p}"]`).innerHTML = statusHTML(s, evaluations[i][p - 1], p);
  }
  row.querySelector('[data-field="name"]').setAttribute('aria-invalid', Boolean(!s.name.trim() && !isBlank(s)));
}
function markDuplicates() {
  const counts = new Map();
  for (const s of students()) { const n = s.no.trim(); if (n) counts.set(n, (counts.get(n) || 0) + 1); }
  document.querySelectorAll('#rows [data-field="no"]').forEach((input, i) => {
    const n = students()[i]?.no.trim(), dup = Boolean(n && counts.get(n) > 1);
    input.setAttribute('aria-invalid', dup); input.title = dup ? 'Bu numara listede birden fazla kez var.' : '';
  });
}
function renderClassSelect() {
  $('class-select').innerHTML = ws.classes.map(c => `<option value="${esc(c.id)}">${esc(classLabel(c))} · ${c.students.filter(s => s.name.trim()).length} öğrenci</option>`).join('') + (ws.classes.length < MAX_CLASSES ? '<option value="__new">＋ Yeni sınıf ekle</option>' : '');
  $('class-select').value = cls().id;
}
function renderAll() {
  evaluateAll(); renderClassSelect(); renderTabs(); renderSheet(); renderSteps();
  if ($('student-dialog').open) { if (drawerIndex < students().length) renderDrawer(); else $('student-dialog').close(); }
}
// Refresh after one student changed, without rebuilding the inputs being typed in.
function changed(i) {
  evaluations[i] = evaluateStudent(students()[i]);
  if (rubricById(sheet)) updateRubricRow(i); else updateRow(i);
  renderSteps(); renderFoot(); renderClassSelect(); save();
  if ($('student-dialog').open && drawerIndex === i) renderDrawer();
}
function focusCell(i, field) {
  const row = rowOf(rubricById(sheet) ? 'rubric-rows' : 'rows', students()[i]), input = row?.querySelector(`[data-field="${field}"]`);
  if (input) { input.focus(); input.select?.(); input.scrollIntoView({ block: 'center' }); }
}
function goTo(issue) {
  if ($('issues-dialog').open) $('issues-dialog').close();
  showSheet(issue.rubric || 'grades');
  focusCell(issue.i, issue.rubric ? `k${issue.k}` : issue.field);
}
function addRow(focusField = 'no') {
  if (students().length >= MAX_STUDENTS) return toast(`Bir sınıfta en fazla ${MAX_STUDENTS} öğrenci olabilir.`);
  if (sheet !== 'grades') sheet = 'grades';
  students().push(blankStudent()); renderAll(); save(); focusCell(students().length - 1, focusField);
}
// Puts a performance in criterion mode: the grade is computed from the teacher's scores.
function setManual(i, p, scores) {
  const s = students()[i]; s[`manual${p}`] = scores; delete s[`accepted${p}`];
  const entry = evaluateStudent(s)[p - 1];
  s[`p${p}`] = entry.data ? format(entry.data.result) : '';
  changed(i);
}
function clearManual(i, p) {
  const s = students()[i], manual = s[`manual${p}`], grade = s[`p${p}`];
  delete s[`manual${p}`]; renderAll(); save();
  undoable(`${s.name.trim() || 'Öğrenci'}: ${p}. performans kriterleri nota göre otomatik dağıtıldı.`, () => { const k = indexOf(s.id); if (k < 0) return; s[`p${p}`] = grade; setManual(k, p, manual); renderAll(); });
}

body.addEventListener('input', event => {
  const input = event.target, row = input.closest('tr[data-id]'); if (!row) return;
  const i = indexOf(row.dataset.id), s = students()[i];
  if (input.dataset.k !== undefined) return rubricInput(input, i);
  const field = input.dataset.field; if (!field) return;
  s[field] = input.value;
  if (field.startsWith('p')) {
    const p = field.slice(1); delete s[`accepted${p}`];
    if (s[`manual${p}`]) {
      const manual = s[`manual${p}`]; delete s[`manual${p}`];
      undoable(`${p}. performans kriterleri yeni nota göre yeniden dağıtılacak.`, () => { const k = indexOf(s.id); if (k >= 0) { setManual(k, p, manual); renderSheet(); } });
    }
  }
  if (field === 'no') markDuplicates();
  changed(i);
});
body.addEventListener('keydown', event => {
  const input = event.target, row = input.closest?.('tr[data-id]'); if (!row || input.tagName !== 'INPUT') return;
  const rows = [...body.querySelectorAll('tbody tr[data-id]')], r = rows.indexOf(row), field = input.dataset.field;
  const move = to => { const target = rows[to]?.querySelector(`[data-field="${field}"]`); if (target) { event.preventDefault(); target.focus(); target.select(); } };
  if (event.key === 'Enter' || event.key === 'ArrowDown') {
    if (r === rows.length - 1 && event.key === 'Enter' && sheet === 'grades' && !isBlank(students()[indexOf(row.dataset.id)])) { event.preventDefault(); addRow(field); }
    else move(r + 1);
  } else if (event.key === 'ArrowUp') move(r - 1);
  else if (input.dataset.k !== undefined && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    const atEdge = event.key === 'ArrowLeft' ? input.selectionStart === 0 : input.selectionEnd === input.value.length;
    const next = row.querySelector(`[data-k="${Number(input.dataset.k) + (event.key === 'ArrowLeft' ? -1 : 1)}"]`);
    if (atEdge && next) { event.preventDefault(); next.focus(); next.select(); }
  }
});
body.addEventListener('focusout', event => {
  const input = event.target; if (input.dataset?.k === undefined || input.getAttribute('aria-invalid') !== 'true') return;
  const i = indexOf(input.closest('tr').dataset.id), r = rubricById(sheet), k = Number(input.dataset.k);
  toast(`${r.criteria[k].label}: ${criterionValue(r, k, input.value).error || 'Eksik puan.'} Önceki puan geri getirildi.`);
  updateRubricRow(i, true);
});
body.addEventListener('paste', event => {
  const input = event.target, row = input.closest?.('tr[data-id]'); if (!row) return;
  const raw = event.clipboardData?.getData('text/plain') || '';
  if (!/[\t\n]/.test(raw.trim())) return;
  event.preventDefault();
  let grid = raw.replace(/\r/g, '').replace(/\n+$/, '').split('\n').map(line => line.split('\t').map(v => v.trim()));
  if (input.dataset.k !== undefined) return pasteScores(grid, indexOf(row.dataset.id), Number(input.dataset.k));
  if (/not\s*bilgisi/i.test(raw)) return openEokul(raw);
  if (grid[0].some(v => /soyad|performans|öğrenci\s*no/i.test(v))) grid = grid.slice(1);
  const start = indexOf(row.dataset.id), col = FIELDS.indexOf(input.dataset.field);
  if (start + grid.length > MAX_STUDENTS) return toast(`Bir sınıfta en fazla ${MAX_STUDENTS} öğrenci olabilir.`);
  const restore = snapshot();
  grid.forEach((cells, r) => {
    const s = students()[start + r] || (students().push(blankStudent()), students().at(-1));
    cells.forEach((value, c) => {
      const key = FIELDS[col + c]; if (!key) return;
      s[key] = value.slice(0, key === 'name' ? 150 : key === 'no' ? 30 : 6);
      if (key.startsWith('p')) { delete s[`accepted${key[1]}`]; delete s[`manual${key[1]}`]; }
    });
  });
  renderAll(); save(); undoable(`${grid.length} satır yapıştırıldı.`, restore);
});
body.addEventListener('click', event => {
  const empty = event.target.closest('[data-empty]');
  if (empty) return empty.dataset.empty === 'eokul' ? openEokul() : addRow();
  const sort = event.target.closest('[data-sort]');
  if (sort) return sortBy(sort.dataset.sort);
  const row = event.target.closest('tr[data-id]'); if (!row) return;
  const i = indexOf(row.dataset.id), s = students()[i];
  if (event.target.closest('[data-remove]')) {
    const restore = snapshot();
    students().splice(i, 1); renderAll(); save();
    if (!isBlank(s)) undoable(`${s.name.trim() || 'Öğrenci'} silindi.`, restore);
  } else if (event.target.closest('[data-open]')) openDrawer(i);
  else if (event.target.closest('[data-reset]')) clearManual(i, rubricById(sheet).performance);
  else if (event.target.closest('[data-accept]')) {
    const p = event.target.closest('[data-accept]').dataset.accept;
    s[`accepted${p}`] = evaluations[i][p - 1].data.result; changed(i);
  }
});
function sortBy(key) {
  if (students().length < 2) return;
  const dir = sortState?.key === key && sortState.dir === 1 ? -1 : 1; sortState = { key, dir };
  const restore = snapshot(), collator = new Intl.Collator('tr', { numeric: true, sensitivity: 'base' });
  students().sort((a, b) => (isBlank(a) - isBlank(b)) || dir * collator.compare(a[key].trim(), b[key].trim()));
  renderAll(); save(); undoable(`Liste ${key === 'no' ? 'numaraya' : 'ada'} göre sıralandı.`, restore);
}
$('add-row').onclick = () => addRow();

// ---------- Rubric sheets: criterion scores typed by the teacher ----------
// A student's own entries when present, otherwise the automatic distribution.
function rubricScores(s, i, r) {
  const p = r.performance, manual = s[`manual${p}`];
  if (manual) return { values: manual[r.id], manual: true };
  const d = evaluations[i][p - 1].data;
  return { values: d ? d.scores[r.id] : r.criteria.map(() => null), manual: false };
}
function renderRubric(r) {
  const list = students().map((s, i) => [s, i]).filter(([s]) => !isBlank(s));
  if (!list.length) { body.innerHTML = emptyState(); return; }
  const p = r.performance;
  const heads = r.criteria.map((c, k) => {
    const sub = c.descriptions.length ? c.descriptions.at(-1).replace(/\(?\s*\d+\s*puan\s*\)?\.?\s*$/i, '').trim() : '';
    return `<th class="crit" title="${esc(`K${k + 1}. ${c.label}${sub ? ` — ${sub}` : ''}\nGeçerli puanlar: ${c.points.join(', ')}`)}"><b>K${k + 1}</b><span>${esc(c.label)}</span><small>${c.points.join('·')}</small></th>`;
  }).join('');
  body.innerHTML = `<div class="rubric-scroll"><table class="grid rubric-grid p${p}"><thead><tr><th class="c-idx">#</th><th class="c-student">Öğrenci</th>${heads}<th class="c-sum">Toplam<small>${r.min}–${r.max}</small></th><th class="c-sum">${p === 1 ? 'Katkı<small>%25</small>' : `100’lük<small>%${WEIGHT[r.id]}</small>`}</th><th class="c-perf">${p}. Performans</th><th class="c-act"></th></tr></thead><tbody id="rubric-rows">${list.map(([s, i]) => `<tr data-id="${esc(s.id)}"><td class="c-idx">${i + 1}</td><td class="c-student"><b>${esc(s.name || 'Adsız')}</b><small>${esc(s.no)}</small></td>${r.criteria.map((c, k) => `<td class="sc"><input data-k="${k}" data-field="k${k}" inputmode="numeric" maxlength="2" autocomplete="off" aria-label="${esc(`${s.name} K${k + 1} ${c.label}`)}"></td>`).join('')}<td class="c-sum" data-total></td><td class="c-sum" data-part></td><td class="c-perf" data-perf></td><td class="c-act" data-act></td></tr>`).join('')}</tbody></table></div>`;
  list.forEach(([, i]) => updateRubricRow(i, true));
}
function updateRubricRow(i, values = false) {
  const r = rubricById(sheet), s = students()[i], row = r && rowOf('rubric-rows', s); if (!row) return;
  const p = r.performance, j = rubricsFor(p).indexOf(r), { values: scores, manual } = rubricScores(s, i, r);
  row.querySelectorAll('[data-k]').forEach(input => {
    const v = scores[Number(input.dataset.k)];
    if (values || document.activeElement !== input) { input.value = v ?? ''; input.removeAttribute('aria-invalid'); }
    input.classList.toggle('auto', !manual); input.classList.toggle('empty', v === null);
  });
  const missing = scores.filter(v => v === null).length, d = evaluations[i][p - 1].data;
  row.querySelector('[data-total]').innerHTML = missing ? `<span class="muted">${missing} boş</span>` : `<b>${scores.reduce((a, b) => a + b, 0)}</b>`;
  row.querySelector('[data-part]').textContent = d ? (p === 1 ? d.contributions[j] : d.normalized[j]) : '—';
  row.querySelector('[data-perf]').innerHTML = `${d ? `<b>${displayed(d.result)}</b>` : ''}${statusHTML(s, evaluations[i][p - 1], p)}`;
  row.querySelector('[data-act]').innerHTML = manual ? '<button class="btn icon subtle reset" data-reset title="Elle girilen kriterleri silip girilen nota göre otomatik dağıt" aria-label="Otomatik dağılıma dön">↺</button>' : '';
}
function setScore(i, r, k, value) {
  const s = students()[i], p = r.performance, d = evaluations[i][p - 1].data;
  const scores = structuredClone(s[`manual${p}`] || d?.scores || emptyScores(p));
  scores[r.id][k] = value; setManual(i, p, scores);
}
function rubricInput(input, i) {
  const r = rubricById(sheet), k = Number(input.dataset.k), typed = input.value.trim();
  const { value, error } = criterionValue(r, k, typed), points = r.criteria[k].points.map(String);
  const prefix = Boolean(typed) && points.some(pt => pt.length > typed.length && pt.startsWith(typed));
  input.setAttribute('aria-invalid', Boolean(error));
  input.classList.toggle('typing', Boolean(error && prefix));
  if (error) return;
  setScore(i, r, k, value);
  // Move on as soon as the typed value cannot grow into another legal level.
  if (value !== null && !prefix) {
    const row = input.closest('tr'), next = row.querySelector(`[data-k="${k + 1}"]`) || row.nextElementSibling?.querySelector('[data-k="0"]');
    if (next) { next.focus(); next.select(); }
  }
}
function pasteScores(grid, start, k0) {
  const r = rubricById(sheet), n = r.criteria.length, p = r.performance;
  // A block copied from the Excel sheet has criteria as rows and students as columns.
  if (grid.length === n - k0 && grid[0].length !== n - k0) grid = grid[0].map((_, c) => grid.map(row => row[c] ?? ''));
  const rows = [...document.querySelectorAll('#rubric-rows tr[data-id]')], first = rows.findIndex(row => row.dataset.id === students()[start].id);
  const restore = snapshot(); let applied = 0, rejected = 0;
  grid.forEach((cells, dr) => {
    const row = rows[first + dr]; if (!row) return;
    const i = indexOf(row.dataset.id), s = students()[i];
    const scores = structuredClone(s[`manual${p}`] || evaluations[i][p - 1].data?.scores || emptyScores(p));
    cells.forEach((v, dc) => { const k = k0 + dc; if (k >= n) return; const res = criterionValue(r, k, v); if (res.error) rejected++; else { scores[r.id][k] = res.value; applied++; } });
    s[`manual${p}`] = scores; delete s[`accepted${p}`];
    const entry = evaluateStudent(s)[p - 1]; s[`p${p}`] = entry.data ? format(entry.data.result) : '';
  });
  renderAll(); save();
  undoable(`${applied} puan yapıştırıldı${rejected ? `, ${rejected} geçersiz değer atlandı` : ''}.`, restore);
}

// ---------- Student drawer ----------
const PERF = { 1: ['1. Performans', 'Konuşma ve yazma · her ölçek %25'], 2: ['2. Performans', 'Kitap okuma %33 + %33 · Ders içi gözlem %34'] };
const stripPoints = d => String(d || '').replace(/\(?\s*\d+\s*puan\s*\)?\s*\.?\s*$/i, '').trim();
function perfSection(s, i, p) {
  const entry = evaluations[i][p - 1], d = entry.data, [title, sub] = PERF[p];
  const manual = s[`manual${p}`], scores = manual || d?.scores;
  const head = `<div class="perf-head p${p}"><div><h3>${title}</h3><p>${sub}</p></div>`;
  if (!scores) return `<section class="perf">${head}</div><div class="perf-empty">${entry.error ? `<p class="bad-text">${esc(entry.error)}</p>` : '<p>Not girilmedi.</p>'}<button class="btn" data-manual-start="${p}">Kriterleri doğrudan puanla</button></div></section>`;
  const result = d ? `<b>${displayed(d.result)}</b>${displayed(d.result) !== d.result ? `<small>Excel hesabı ${format(d.result)}</small>` : ''}` : `<small class="warn-text">${entry.incomplete.count} kriter boş</small>`;
  const mode = manual ? `<span class="chip manual">✎ Kriterlerden hesaplanıyor</span><button class="btn link" data-auto="${p}">Otomatik dağılıma dön</button>` : '<span class="chip">Girilen nota göre dağıtıldı</span>';
  const rubrics = rubricsFor(p).map((r, j) => {
    const vals = scores[r.id], done = vals.every(v => v !== null);
    return `<details class="rubric" data-rubric="${r.id}"><summary><span class="r-name">${esc(r.name)}</span><span class="r-score">${done ? vals.reduce((a, b) => a + b, 0) : '…'} <small>/ ${r.max}</small></span><span class="r-part">${d ? (p === 1 ? `${d.contributions[j]} puan` : `${d.normalized[j]} / 100`) : ''}</span></summary>${r.description ? `<p class="r-desc">${esc(r.description)}</p>` : ''}<ol class="criteria">${r.criteria.map((c, k) => {
      const v = vals[k], desc = v === null ? '' : stripPoints(c.descriptions[c.points.indexOf(v)]);
      return `<li class="${v === null ? 'missing' : ''}"><div class="c-text"><b>${esc(c.label)}</b>${desc ? `<span>${esc(desc)}</span>` : v === null ? '<span>Puan verilmedi</span>' : ''}</div><div class="levels" role="group" aria-label="${esc(c.label)}">${c.points.map((pt, m) => `<button class="lvl${pt === v ? ' on' : ''}" data-r="${r.id}" data-k="${k}" data-v="${pt}" aria-pressed="${pt === v}" title="${esc(r.levels[m])}">${pt}</button>`).join('')}</div></li>`;
    }).join('')}</ol></details>`;
  }).join('');
  return `<section class="perf">${head}<div class="perf-result">${result}</div></div><div class="perf-mode">${mode}</div>${rubrics}</section>`;
}
function renderDrawer() {
  const s = students()[drawerIndex]; if (!s) return;
  const el = $('drawer-body'), top = el.scrollTop, open = [...el.querySelectorAll('details[open]')].map(d => d.dataset.rubric);
  $('drawer-title').textContent = s.name.trim() || 'Adı girilmemiş öğrenci';
  $('drawer-sub').textContent = `${s.no.trim() ? `No ${s.no.trim()} · ` : ''}${classLabel()} · ${drawerIndex + 1}. sıra`;
  $('drawer-prev').disabled = drawerIndex === 0; $('drawer-next').disabled = drawerIndex === students().length - 1;
  el.innerHTML = [1, 2].map(p => perfSection(s, drawerIndex, p)).join('') + '<p class="drawer-note">Bir kriterin puanını değiştirdiğinizde o performansın notu kriterlerden hesaplanır. Notu tablodan yeniden yazarsanız kriterler otomatik dağıtılır.</p>';
  el.querySelectorAll('details').forEach(d => { if (open.includes(d.dataset.rubric)) d.open = true; });
  el.scrollTop = top;
}
function openDrawer(i) { drawerIndex = i; $('drawer-body').innerHTML = ''; renderDrawer(); if (!$('student-dialog').open) $('student-dialog').showModal(); $('drawer-body').scrollTop = 0; }
$('drawer-body').addEventListener('click', event => {
  const i = drawerIndex, lvl = event.target.closest('.lvl');
  if (lvl) return setScore(i, rubricById(lvl.dataset.r), Number(lvl.dataset.k), Number(lvl.dataset.v));
  const start = event.target.closest('[data-manual-start]');
  if (start) { const p = Number(start.dataset.manualStart); setManual(i, p, emptyScores(p)); return; }
  const auto = event.target.closest('[data-auto]');
  if (auto) clearManual(i, Number(auto.dataset.auto));
});
$('drawer-prev').onclick = () => openDrawer(Math.max(0, drawerIndex - 1));
$('drawer-next').onclick = () => openDrawer(Math.min(students().length - 1, drawerIndex + 1));
$('drawer-close').onclick = () => $('student-dialog').close();
$('student-dialog').addEventListener('close', () => { if (rubricById(sheet)) renderSheet(); });
$('student-dialog').addEventListener('click', event => { if (event.target === $('student-dialog')) $('student-dialog').close(); });
$('student-dialog').addEventListener('keydown', event => {
  if (event.target.closest('input,textarea')) return;
  if (event.key === 'ArrowLeft' && drawerIndex > 0) openDrawer(drawerIndex - 1);
  if (event.key === 'ArrowRight' && drawerIndex < students().length - 1) openDrawer(drawerIndex + 1);
});

// ---------- e-Okul list ----------
let eokulParsed = null;
function openEokul(textValue) {
  $('eokul-error').textContent = '';
  if (typeof textValue === 'string') $('eokul-text').value = textValue;
  previewEokul();
  if (!$('eokul-dialog').open) $('eokul-dialog').showModal();
  if (!$('eokul-text').value) $('eokul-text').focus();
}
const savedColumns = () => { try { return JSON.parse(localStorage.getItem(EOKUL_KEY)) || {}; } catch { return {}; } };
function previewEokul() {
  const value = $('eokul-text').value; eokulParsed = null; $('eokul-error').textContent = '';
  if (!value.trim()) { $('eokul-preview').innerHTML = ''; $('eokul-import').disabled = true; $('eokul-import').textContent = 'Listeye aktar'; return; }
  try { eokulParsed = parseEokul(value); } catch (e) { $('eokul-preview').innerHTML = ''; $('eokul-error').textContent = e.message; $('eokul-import').disabled = true; return; }
  const { students: list, columns } = eokulParsed, used = [...Array(columns).keys()].filter(c => list.some(s => s.grades[c]));
  const saved = savedColumns(), sample = c => [...new Set(list.map(s => s.grades[c]).filter(Boolean))].slice(0, 3).join(', ');
  const select = p => `<label>${p}. performans notu<select id="eokul-p${p}"><option value="">Aktarma (boş bırak)</option>${used.map(c => `<option value="${c}" ${String(saved[p]) === String(c) ? 'selected' : ''}>${c + 1}. not sütunu (örn. ${esc(sample(c))})</option>`).join('')}</select></label>`;
  const known = new Set(students().map(s => s.no.trim()).filter(Boolean)), fresh = list.filter(s => !known.has(s.no)).length;
  const merge = $('eokul-replace').checked || !known.size ? '' : ` · ${fresh} yeni öğrenci eklenecek, ${list.length - fresh} öğrenci numarasıyla eşleşip güncellenecek`;
  $('eokul-preview').innerHTML = `<div class="eokul-found"><b>✓ ${list.length} öğrenci bulundu</b>${merge}</div>${used.length ? `<div class="eokul-map"><p>Kopyada not sütunları da var. e-Okul’daki sütun sırasına göre hangisinin hangi performans olduğunu seçin; emin değilseniz <b>Aktarma</b> bırakın.</p><div class="form-grid">${select(1)}${select(2)}</div></div>` : ''}<div class="eokul-table"><table><thead><tr><th>No</th><th>Adı soyadı</th>${used.map(c => `<th>${c + 1}. not</th>`).join('')}</tr></thead><tbody>${list.slice(0, 6).map(s => `<tr><td>${esc(s.no)}</td><td>${esc(s.name)}</td>${used.map(c => `<td>${esc(s.grades[c] || '')}</td>`).join('')}</tr>`).join('')}${list.length > 6 ? `<tr><td colspan="${2 + used.length}" class="muted">… ${list.length - 6} öğrenci daha</td></tr>` : ''}</tbody></table></div>`;
  $('eokul-import').disabled = false; $('eokul-import').textContent = `${list.length} öğrenciyi aktar`;
}
$('eokul-text').addEventListener('input', previewEokul);
$('eokul-replace').addEventListener('change', previewEokul);
$('eokul-clipboard').onclick = async () => {
  try { const value = await navigator.clipboard.readText(); if (!value.trim()) throw new Error(); $('eokul-text').value = value; previewEokul(); }
  catch { $('eokul-error').textContent = 'Pano okunamadı. Kutuya tıklayıp Ctrl + V (Mac’te ⌘ + V) ile yapıştırın.'; $('eokul-text').focus(); }
};
$('eokul-import').onclick = () => {
  if (!eokulParsed) return;
  const map = { 1: $('eokul-p1')?.value ?? '', 2: $('eokul-p2')?.value ?? '' };
  if (map[1] !== '' && map[1] === map[2]) { $('eokul-error').textContent = 'İki performans için aynı sütun seçilemez.'; return; }
  localStorage.setItem(EOKUL_KEY, JSON.stringify(map));
  const replace = $('eokul-replace').checked, list = replace ? [] : structuredClone(students().filter(s => !isBlank(s)));
  const byNo = new Map(list.filter(s => s.no.trim()).map(s => [s.no.trim(), s]));
  let added = 0, updated = 0, bad = 0, grades = 0;
  for (const e of eokulParsed.students) {
    let s = byNo.get(e.no);
    if (s) { s.name = e.name; updated++; } else { s = { ...blankStudent(), no: e.no, name: e.name }; list.push(s); byNo.set(e.no, s); added++; }
    for (const p of [1, 2]) {
      if (map[p] === '') continue;
      const value = (e.grades[Number(map[p])] || '').trim(); if (!value) continue;
      try { parseGrade(value); s[`p${p}`] = value.slice(0, 6); delete s[`accepted${p}`]; delete s[`manual${p}`]; grades++; } catch { bad++; }
    }
  }
  if (list.length > MAX_STUDENTS) { $('eokul-error').textContent = `Bir sınıfta en fazla ${MAX_STUDENTS} öğrenci olabilir.`; return; }
  const restore = snapshot();
  cls().students = list; renderAll(); save();
  $('eokul-dialog').close(); $('eokul-text').value = ''; $('eokul-replace').checked = false;
  undoable(`${added} öğrenci eklendi${updated ? `, ${updated} güncellendi` : ''}${grades ? `, ${grades} not alındı` : ''}${bad ? `, ${bad} geçersiz not atlandı` : ''}.`, restore);
};
$('eokul-open').onclick = () => openEokul();

// ---------- Classes and report details ----------
const INFO = { className: ['class', 'name'], book1: ['class', 'book1'], book2: ['class', 'book2'], school: ['profile', 'school'], teacher: ['profile', 'teacher'], year: ['profile', 'year'], date: ['profile', 'date'] };
function openInfo() { for (const [id, [where, key]] of Object.entries(INFO)) $(`f-${id}`).value = (where === 'class' ? cls() : ws.profile)[key]; $('info-dialog').showModal(); }
for (const [id, [where, key]] of Object.entries(INFO)) $(`f-${id}`).addEventListener('input', event => {
  const value = event.target.value;
  if (where === 'class') cls()[key] = value; else ws.profile[key] = value;
  save(); renderClassSelect(); renderSteps();
});
$('info-dialog').addEventListener('close', () => renderSheet());
function nextClassName() {
  const m = cls().name.match(/^(\d+)\s*[\/-]\s*([A-ZÇĞİÖŞÜ])$/u), letters = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
  const next = m && letters[letters.indexOf(m[2]) + 1], name = next ? `${m[1]}/${next}` : '';
  return name && ws.classes.some(c => c.name === name) ? '' : name;
}
$('class-select').onchange = event => {
  if (event.target.value === '__new') {
    const c = newClass(nextClassName()); ws.classes.push(c); ws.activeId = c.id; sheet = 'grades'; save(); renderAll();
    openInfo(); $('f-className').select();
  } else { ws.activeId = event.target.value; sortState = null; save(); renderAll(); }
};
$('open-info').onclick = openInfo;
$('delete-class').onclick = () => {
  const c = cls(), count = c.students.filter(s => !isBlank(s)).length;
  if (!confirm(`${classLabel(c)}${c.name.trim() ? ' sınıfı' : ''}${count ? ` ve ${count} öğrencisi` : ''} silinsin mi? Bu işlem geri alınamaz.`)) return;
  ws.classes = ws.classes.filter(x => x.id !== c.id);
  if (!ws.classes.length) ws.classes.push(newClass());
  ws.activeId = ws.classes[0].id; save(); $('info-dialog').close(); renderAll(); toast(`${c.name.trim() || 'Sınıf'} silindi.`);
};

// ---------- File import, backup, menu ----------
function addImported(list, replace) {
  const existing = replace ? [] : students().filter(s => !isBlank(s));
  if (existing.length + list.length > MAX_STUDENTS) throw new Error(`Bir sınıfta en fazla ${MAX_STUDENTS} öğrenci olabilir.`);
  const numbers = new Set(existing.map(s => s.no.trim()).filter(Boolean)), clash = list.find(s => s.no && numbers.has(s.no));
  if (clash) throw new Error(`${clash.no} numaralı öğrenci listede zaten var. “Mevcut listeyi silip bununla değiştir” seçeneğini işaretleyin.`);
  const restore = snapshot();
  cls().students = [...existing, ...list]; renderAll(); save();
  $('import-dialog').close(); $('import-file').value = '';
  const scored = list.filter(s => s.manual1 || s.manual2).length;
  undoable(`${list.length} öğrenci aktarıldı${scored ? `, ${scored} öğrencinin kriter puanları alındı` : ''}.`, restore);
}
$('import-file').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  $('import-error').textContent = '';
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error('Dosya 10 MB sınırını aşıyor.');
    const list = /\.xlsx$/i.test(file.name) ? await importWorkbook(file, { withScores: $('import-scores').checked }) : studentsFromRows(parseDelimited(await file.text()));
    addImported(list, $('import-replace').checked);
  } catch (e) { $('import-error').textContent = e.message; event.target.value = ''; }
};
function download(blob, name) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); }
const fileName = ext => `performans-${cls().name.replace(/[^\p{L}\p{N}-]/gu, '-') || 'sinif'}-${ws.profile.date || 'rapor'}.${ext}`;
const actions = {
  'print-summary': () => printReport('summary'),
  'print-scales': () => printReport('scales'),
  import: () => { $('import-error').textContent = ''; $('import-dialog').showModal(); },
  backup: () => download(new Blob([JSON.stringify(ws, null, 2)], { type: 'application/json' }), `olcek-yedek-${today()}.json`),
  restore: () => $('restore-file').click(),
  demo: () => {
    const restore = snapshot(), taken = new Set(students().map(s => s.no.trim()));
    const demo = [['101', 'Örnek Öğrenci A', '80', '85'], ['102', 'Örnek Beyza Nur Kaya', '92', '90'], ['103', 'Örnek Ada Nur Demirtaş', '75', '100'], ['104', 'Örnek Öğrenci D', '64', '70'], ['105', 'Örnek Öğrenci E', '35', '']];
    cls().students = [...students().filter(s => !isBlank(s)), ...demo.map(([no, name, p1, p2]) => ({ ...blankStudent(), no: taken.has(no) ? '' : no, name, p1, p2 }))];
    renderAll(); save(); undoable('Örnek öğrenciler eklendi.', restore);
  },
  clear: () => {
    if (!students().some(s => !isBlank(s))) return toast('Liste zaten boş.');
    const restore = snapshot(); cls().students = []; renderAll(); save(); undoable('Liste temizlendi.', restore);
  },
};
function toggleMenu(open = $('menu').hidden) { $('menu').hidden = !open; $('menu-button').setAttribute('aria-expanded', open); if (open) $('menu').querySelector('button').focus(); }
$('menu-button').onclick = () => toggleMenu();
$('menu').onclick = event => { const a = event.target.closest('[data-action]')?.dataset.action; if (a) { toggleMenu(false); actions[a](); } };
document.addEventListener('click', event => { if (!$('menu').hidden && !event.target.closest('.menu-wrap')) toggleMenu(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('menu').hidden) { toggleMenu(false); $('menu-button').focus(); } });
$('restore-file').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('Yedek dosyası çok büyük.');
    const restored = parseWorkspace(JSON.parse(await file.text()));
    if (hasWork() && !confirm('Yedek, şu anki tüm sınıfların yerini alacak. Devam edilsin mi?')) return;
    ws = restored; save(); renderAll(); toast(`Yedek açıldı: ${ws.classes.length} sınıf.`);
  } catch (e) { toast(e instanceof SyntaxError ? 'Yedek dosyası okunamadı.' : e.message); } finally { event.target.value = ''; }
};
$('help').onclick = () => $('help-dialog').showModal();
for (const d of document.querySelectorAll('dialog.modal')) d.addEventListener('click', event => { if (event.target === d) d.close(); });

// ---------- Checks, printing and Excel ----------
function issueList() {
  const items = [];
  students().forEach((s, i) => {
    if (isBlank(s)) return;
    const who = s.name.trim() || `${i + 1}. satır`;
    if (!s.name.trim()) items.push({ i, field: 'name', text: `${i + 1}. satırda öğrenci adı eksik.` });
    for (const p of [1, 2]) {
      const entry = evaluations[i][p - 1], st = gradeStatus(s, entry, p);
      if (st.kind === 'error') items.push({ i, field: `p${p}`, text: `${who}: ${p}. performans notu geçersiz.` });
      if (st.kind === 'pending') items.push({ i, field: `p${p}`, text: `${who}: ${p}. performans için ${format(st.target)} girildi, Excel ${format(st.result)} hesaplayacak. Onaylayın veya notu değiştirin.` });
      if (st.kind === 'incomplete') {
        const r = rubricsFor(p).find(r => entry.scores[r.id].some(v => v === null));
        items.push({ i, field: `p${p}`, rubric: r.id, k: entry.scores[r.id].indexOf(null), text: `${who}: ${st.missing.map(m => `${m.name} ${m.count} kriter`).join(', ')} boş.` });
      }
    }
  });
  return items;
}
function checkBeforeOutput() {
  const items = issueList();
  if (!reportIssues(reportState(), evaluations).length) return true;
  $('issues-list').innerHTML = items.length ? items.slice(0, 40).map((it, n) => `<li><button class="btn link" data-issue="${n}">${esc(it.text)}</button></li>`).join('') + (items.length > 40 ? `<li class="muted">… ve ${items.length - 40} uyarı daha</li>` : '') : '<li>Çıktı için en az bir öğrencinin adını ve performans notunu girin.</li>';
  $('issues-list').onclick = event => { const b = event.target.closest('[data-issue]'); if (b) goTo(items[Number(b.dataset.issue)]); };
  $('issues-dialog').showModal();
  return false;
}
let printScope = 'all';
const fillPrint = () => { $('print-root').innerHTML = reportIssues(reportState(), evaluations).length ? '<p>Yazdırmadan önce uyarıları giderin.</p>' : buildReportHTML(reportState(), evaluations, printScope); };
function printReport(scope) {
  if (!checkBeforeOutput()) return;
  printScope = scope; fillPrint(); window.print(); printScope = 'all';
}
$('print').onclick = () => printReport('all');
$('export-excel').onclick = async () => {
  if (!checkBeforeOutput()) return;
  const button = $('export-excel'), label = button.innerHTML; button.disabled = true; button.textContent = 'Hazırlanıyor…';
  try { download(await createWorkbook(reportState(), evaluations), fileName('xlsx')); toast('Excel dosyası indirildi.'); }
  catch { toast('Excel oluşturulamadı. Tekrar deneyin.'); }
  finally { button.disabled = false; button.innerHTML = label; }
};
window.addEventListener('beforeprint', fillPrint);
window.addEventListener('afterprint', () => { $('print-root').innerHTML = ''; });
// Leaving or reloading the page discards the work; ask first.
window.addEventListener('beforeunload', event => { if (hasWork()) { event.preventDefault(); event.returnValue = ''; } });

renderAll();
save();
