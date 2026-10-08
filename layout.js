// Printable pages shared by the browser print view and the Excel export.
// Every sheet is built with one common design that fills an A4 landscape page;
// a sheet has exactly as many student columns (or rows) as students on that page.
import { RUBRICS } from './rubrics.js';
import { TEMPLATE_SHEETS } from './template.js';

export const columnName = index => { let s = ''; for (let n = index + 1; n; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; };
const ref = (col, row) => `${columnName(col - 1)}${row}`;
const MM = 96 / 25.4, MARGIN = 10;
export const PAGE = { width: Math.floor((297 - 2 * MARGIN) * MM) - 2, height: Math.floor((210 - 2 * MARGIN) * MM) - 8 };
export const REPORT_MARGINS = { left: MARGIN / 25.4, right: MARGIN / 25.4, top: MARGIN / 25.4, bottom: MARGIN / 25.4, header: 0, footer: 0 };
// Page rule: up to 25 students on one page, up to 50 on at most two pages.
const ONE_PAGE = 25, MIN_FONT = 0.55, SIGNATURE = 230;
const BLACK = '#000000', HEAD_FILL = '#EDEDED', TOTAL_FILL = '#FFF59D', RESULT_FILL = '#F2F2F2';

// ---------- Text measurement (canvas in the browser, an estimate elsewhere) ----------
const ctx = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
const px = pt => pt * 4 / 3;
// The print view and Excel draw Arial differently: Excel wraps earlier and uses
// wider line spacing. Each output is laid out with its own metrics.
const METRICS = { print: { width: 1.06, line: 1.2, rotated: 1 }, excel: { width: 1.45, line: 1.5, rotated: 1.2 } };
let metric = METRICS.print;
function textWidth(text, pt, bold = false) {
  if (ctx) { ctx.font = `${bold ? 'bold ' : ''}${px(pt)}px Arial`; return ctx.measureText(String(text)).width * metric.width; }
  return [...String(text)].length * px(pt) * (bold ? 0.62 : 0.56) * metric.width;
}
const lineHeight = pt => px(pt) * metric.line;
function lineCount(text, width, pt, bold) {
  let total = 0;
  for (const paragraph of String(text ?? '').split('\n')) {
    let line = '', lines = 1;
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && textWidth(next, pt, bold) > width) { lines++; line = word; } else line = next;
    }
    total += lines;
  }
  return Math.max(1, total);
}
// Excel wraps a little earlier than the browser and pads cells; keep a margin.
const blockHeight = (text, width, pt, bold = false) => Math.ceil(lineCount(text, width - 8, pt, bold) * lineHeight(pt) + 5);

// Names with three or more parts (and long two-part names) are written on two balanced lines.
export function nameLines(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length < 2 || (words.length === 2 && words.join(' ').length <= 16)) return [words.join(' ')];
  let best = null;
  for (let k = 1; k < words.length; k++) {
    const lines = [words.slice(0, k).join(' '), words.slice(k).join(' ')], width = Math.max(...lines.map(l => textWidth(l, 7, true)));
    if (!best || width < best.width) best = { lines, width };
  }
  return best.lines;
}

// ---------- Source texts ----------
const dateText = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').reverse().join('.') : '…./…./……';
const fill = (text, meta) => String(text ?? '').replace(/\{\{(\w+)\}\}/g, (_, key) => meta[key] || '……………………').replace(/\s+/g, ' ').trim();
const SOURCE = Object.fromEntries(TEMPLATE_SHEETS.filter(s => s.spec).map(s => {
  const at = row => s.cells.find(c => c.row === row && typeof c.value === 'string' && c.value.trim())?.value || '';
  const note = at(2).replace(/\s+/g, ' ').trim();
  return [s.spec[0], { index: s.index, title: at(1), note: s.spec[1] === 6 ? note : note.split(/(?<=\.)\s/)[0], evaluation: s.spec[1] === 6 ? at(s.spec[2] + 1) : '' }];
}));
const SUMMARY_INDEX = 5;
export const SUMMARY_NAME = '1. DÖNEM PERFORMANS PUANLARI';

// ---------- Cell helpers ----------
const thin = { left: ['thin', BLACK], right: ['thin', BLACK], top: ['thin', BLACK], bottom: ['thin', BLACK] };
const style = (o = {}) => ({ fontSize: 7, bold: false, italic: false, color: BLACK, fill: 'transparent', align: 'left', vertical: 'center', rotate: 0, wrap: true, borders: {}, ...o });
function sheet(name, index, extra = {}) {
  const cells = new Map();
  const put = (col, row, value, s, more = {}) => { cells.set(ref(col, row), { ref: ref(col, row), row, col, value: value ?? null, formula: null, style: style(s), ...more }); };
  return { name, index, cells, put, merges: [], ...extra };
}
function finish(model, widths, heights) {
  return { ...model, cells: [...model.cells.values()], widths, heights, bounds: [1, 1, widths.length, heights.length], margins: REPORT_MARGINS, orientation: 'landscape', scale: 100, fresh: true };
}
// Columns at the right that hold the date and signature block.
function signatureStart(widths) {
  let width = 0, col = widths.length;
  while (col > 1 && width + widths[col - 1] < SIGNATURE) { width += widths[col - 1]; col--; }
  return col;
}
// Note/date row, signature space, teacher name and title.
const footerHeights = f => [Math.ceil(lineHeight(7.5 * f) + 6), 16, Math.ceil(lineHeight(7.5 * f) + 3), Math.ceil(lineHeight(7.5 * f) + 3)];
const footerHeight = f => footerHeights(f).reduce((a, b) => a + b, 0);
function footer(m, widths, heights, row, note, meta, f) {
  const last = widths.length, sig = signatureStart(widths), size = 7.5 * f;
  if (note) { m.put(1, row, note, { fontSize: size, wrap: false }); if (sig > 2) m.merges.push(`${ref(1, row)}:${ref(sig - 1, row)}`); }
  m.put(sig, row, meta.date, { fontSize: size, align: 'center', wrap: false });
  m.put(sig, row + 2, meta.teacher, { fontSize: size, bold: true, align: 'center', wrap: false });
  m.put(sig, row + 3, 'TÜRK DİLİ VE EDEBİYATI ÖĞRETMENİ', { fontSize: size, align: 'center', wrap: false });
  for (const r of [row, row + 2, row + 3]) if (last > sig) m.merges.push(`${ref(sig, r)}:${ref(last, r)}`);
  heights.push(...footerHeights(f));
}

// ---------- Scale sheets ----------
// A level's points go into its header when every criterion shares them; the
// repeated "(N puan)" note is then dropped from the description cells.
const POINT_NOTE = /\s*\(?\s*(\d+)\s*puan\s*\)?\.?\s*$/i;
const sharedPoints = r => r.levels.map((_, j) => { const set = new Set(r.criteria.map(c => c.points[j])); return set.size === 1 ? [...set][0] : null; });
const levelHeader = (r, j) => { const pts = sharedPoints(r)[j]; return pts == null ? r.levels[j] : `${r.levels[j]}\n(${pts} puan)`; };
function levelText(r, k, j) {
  const text = r.criteria[k].descriptions[j].replace(/\s+/g, ' ').trim(), pts = sharedPoints(r)[j], m = text.match(POINT_NOTE);
  return pts != null && m && Number(m[1]) === pts ? text.replace(POINT_NOTE, '').trim() : text;
}
const scaleTitle = (r, meta) => { const t = fill(SOURCE[r.id].title, meta); return /ÖLÇEĞİ/.test(t) ? t : `${t} DEĞERLENDİRME ÖLÇEĞİ`; };
function scaleSizes(r, names, f, meta, pageLabel, force = false) {
  const n = names.length, p = r.performance, W = PAGE.width;
  const sz = { title: 10 * f, note: 7.5 * f, head: 7.5 * f, label: 7.5 * f, desc: 7 * f, stmt: 7.5 * f, score: 8 * f, name: 7 * f };
  const lines = Math.max(1, ...names.map(l => l.length));
  const minStudent = Math.max(lines * lineHeight(sz.name) * metric.rotated + 6, textWidth('100', sz.score, true) + 7, 16);
  const ideal = p === 1 ? 700 : 560;
  const student = Math.min(38, Math.max(minStudent, (W - ideal) / Math.max(1, n)));
  const description = W - student * n;
  if (!force && description < (p === 1 ? 380 : 260)) return null;
  const label = p === 1 ? Math.min(120, Math.max(86, description * 0.15)) : description, level = p === 1 ? (description - label) / 4 : 0;
  const widths = p === 1 ? [label, level, level, level, level, ...Array(n).fill(student)] : [description, ...Array(n).fill(student)];
  const nameLength = Math.max(0, ...names.flat().map(l => textWidth(l, sz.name, true)));
  const header = Math.max(36, nameLength + 14, ...(p === 1 ? r.levels.map((_, j) => blockHeight(levelHeader(r, j), level, sz.head, true)) : []));
  const rows = r.criteria.map((c, k) => p === 1
    ? Math.max(22, ...c.descriptions.map((_, j) => blockHeight(levelText(r, k, j), level, sz.desc)), r.criteria[k - 1]?.label === c.label || r.criteria[k + 1]?.label === c.label ? 0 : blockHeight(c.label, label, sz.label, true))
    : Math.max(18, blockHeight(c.label, description, sz.stmt)));
  const heights = [blockHeight(`${scaleTitle(r, meta)}${pageLabel}`, W, sz.title, true), blockHeight(SOURCE[r.id].note, W, sz.note), header, ...rows, 20];
  const used = heights.reduce((a, b) => a + b, 0) + footerHeight(f);
  return { widths, heights, sz, student, used };
}
function fitScale(r, names, meta, pageLabel = '') {
  for (let f = 1; f >= MIN_FONT - 1e-9; f -= 0.025) {
    const size = scaleSizes(r, names, f, meta, pageLabel);
    if (size && size.used <= PAGE.height) return { ...size, f };
  }
  return null;
}
function scalePage(r, page, meta, names, pageNo, pages, sheetName) {
  const p = r.performance, pageLabel = pages > 1 ? ` (${pageNo}/${pages})` : '';
  const size = fitScale(r, names, meta, pageLabel) || { ...scaleSizes(r, names, MIN_FONT, meta, pageLabel, true), f: MIN_FONT };
  const { widths, heights, sz, f } = size, m = sheet(sheetName, SOURCE[r.id].index, { spec: [r.id], rubric: r.id, page: pageNo });
  const start = p === 1 ? 6 : 2, last = widths.length, totalRow = 4 + r.criteria.length;
  m.put(1, 1, `${scaleTitle(r, meta)}${pageLabel}`, { fontSize: sz.title, bold: true, align: 'center' }); m.merges.push(`A1:${ref(last, 1)}`);
  m.put(1, 2, SOURCE[r.id].note, { fontSize: sz.note }); m.merges.push(`A2:${ref(last, 2)}`);
  const head = { fontSize: sz.head, bold: true, align: 'center', fill: HEAD_FILL, borders: thin };
  m.put(1, 3, 'ÖLÇÜTLER', head);
  if (p === 1) r.levels.forEach((_, j) => m.put(2 + j, 3, levelHeader(r, j), head));
  page.forEach(({ student }, i) => m.put(start + i, 3, names[i].join('\n'), { ...head, fontSize: sz.name, rotate: 90, vertical: 'bottom', wrap: names[i].length > 1 }));
  r.criteria.forEach((c, k) => {
    const row = 4 + k;
    const merged = r.criteria[k - 1]?.label === c.label;
    m.put(1, row, merged ? null : c.label, { fontSize: p === 1 ? sz.label : sz.stmt, bold: p === 1, borders: thin, align: p === 1 ? 'center' : 'left' });
    if (p === 1 && !merged) { let end = k; while (r.criteria[end + 1]?.label === c.label) end++; if (end > k) m.merges.push(`${ref(1, row)}:${ref(1, 4 + end)}`); }
    if (p === 1) c.descriptions.forEach((_, j) => m.put(2 + j, row, levelText(r, k, j), { fontSize: sz.desc, borders: thin }));
    page.forEach(({ result }, i) => m.put(start + i, row, result?.scores[r.id]?.[k], { fontSize: sz.score, align: 'center', borders: thin, wrap: false, shrink: true }, { unlocked: true, padding: 0 }));
  });
  const total = { fontSize: sz.score, bold: true, align: 'center', fill: TOTAL_FILL, borders: thin, wrap: false };
  m.put(1, totalRow, 'TOPLAM', total);
  for (let col = 2; col < start; col++) m.put(col, totalRow, null, total);
  if (start > 2) m.merges.push(`${ref(1, totalRow)}:${ref(start - 1, totalRow)}`);
  page.forEach(({ result }, i) => {
    const col = start + i, sum = result ? result.scores[r.id].reduce((a, b) => a + b, 0) : null;
    m.put(col, totalRow, sum, { ...total, shrink: true }, { formula: sum === null ? null : `SUM(${ref(col, 4)}:${ref(col, totalRow - 1)})`, padding: 0 });
  });
  const evaluation = SOURCE[r.id].evaluation || `Değerlendirme: Bu ölçekten en düşük ${r.min} puan, en yüksek ${r.max} puan alınabilir.`;
  footer(m, widths, heights, totalRow + 1, evaluation.replace(/\s+/g, ' ').trim(), meta, f);
  const groups = new Map();
  r.criteria.forEach((c, k) => { const key = c.points.join(','); groups.set(key, [...(groups.get(key) || []), `${ref(start, 4 + k)}:${ref(last, 4 + k)}`]); });
  m.validations = [...groups].map(([points, ranges]) => ({ points, sqref: ranges.join(' ') }));
  m.totalRow = totalRow; m.start = start;
  // Excel sizes these wrapped rows itself, so its own font metrics never cut the text.
  m.autoRows = r.criteria.map((_, k) => 4 + k);
  return finish(m, widths, heights);
}

// Students per scale page: the whole class up to 25, two balanced pages up to 50,
// then pages of at most 25. Font size is reduced as far as needed to fit.
export function studentsPerPage(names) {
  const n = names.length;
  return n <= ONE_PAGE ? Math.max(1, n) : n <= 2 * ONE_PAGE ? Math.ceil(n / 2) : ONE_PAGE;
}
// Splits a class into the fewest pages, with page sizes differing by at most one.
function balanced(list, size) {
  const pages = Math.max(1, Math.ceil(list.length / size)), base = Math.floor(list.length / pages), extra = list.length % pages;
  let at = 0;
  return Array.from({ length: pages }, (_, i) => { const n = base + (i < extra ? 1 : 0), page = list.slice(at, at + n); at += n; return page; });
}
const sheetName = (base, page, pages) => pages > 1 ? `${base} (${page})`.slice(0, 31) : base.slice(0, 31);

// ---------- Common performance summary ----------
const SUMMARY_HEADERS = ['SIRA NO', 'ÖĞR. NO', 'ÖĞRENCİNİN ADI VE SOYADI', 'I. Tema Konuşma (%25)', 'II. Tema Konuşma (%25)', 'I. Tema Yazma (%25)', 'II. Tema Yazma (%25)', '1. Performans Puanı', 'I. Tema Kitap Okuma (%33)', 'II. Tema Kitap Okuma (%33)', 'Ders İçi Gözlem (%34)', '2. Performans Puanı'];
function summaryGeometry(names, f = 1) {
  const W = PAGE.width, nameWidth = Math.min(320, Math.max(210, ...names.flat().map(l => textWidth(l, 8 * f) + 16)));
  const number = (W - 36 - 56 - nameWidth) / 9, widths = [36, 56, nameWidth, ...Array(9).fill(number)];
  const header = Math.max(...SUMMARY_HEADERS.map((h, i) => blockHeight(h, widths[i], 7.5 * f, true)));
  const rowHeight = lines => Math.ceil(lines * px(8 * f) * 1.15 + 4);
  return { widths, header, rowHeight };
}
export function summaryPerPage(names, f = 1) {
  const { header, rowHeight } = summaryGeometry(names, f), title = Math.ceil(3 * lineHeight(10) + 12), foot = footerHeight(f);
  let used = title + header + foot, n = 0;
  const sorted = names.map(l => rowHeight(l.length)).sort((a, b) => b - a);
  for (const h of sorted) { if (used + h > PAGE.height) break; used += h; n++; }
  return Math.max(1, n);
}
function summaryPage(rows, meta, pageNo, pages, name, locate, twoLines, f) {
  const names = rows.map(r => twoLines ? nameLines(r.student.name) : [r.student.name.trim()]), { widths, header, rowHeight } = summaryGeometry(names, f);
  const m = sheet(name, SUMMARY_INDEX, { page: pageNo }), last = widths.length;
  const title = `${meta.year} EĞİTİM ÖĞRETİM YILI ${meta.school}\n${meta.className} SINIFI TÜRK DİLİ VE EDEBİYATI DERSİ\n1. DÖNEM 1. VE 2. PERFORMANS PUANLARI${pages > 1 ? ` (${pageNo}/${pages})` : ''}`;
  m.put(1, 1, title, { fontSize: 10, bold: true, align: 'center' }); m.merges.push(`A1:${ref(last, 1)}`);
  SUMMARY_HEADERS.forEach((h, i) => m.put(1 + i, 2, h, { fontSize: 7.5 * f, bold: true, align: 'center', fill: HEAD_FILL, borders: thin }));
  const heights = [Math.ceil(3 * lineHeight(10) + 12), header];
  rows.forEach((record, k) => {
    const row = 3 + k, r = record.results, cell = { fontSize: 8 * f, align: 'center', borders: thin, wrap: false };
    m.put(1, row, record.number, cell);
    m.put(2, row, record.student.no, cell);
    m.put(3, row, names[k].join('\n'), { ...cell, align: 'left', wrap: names[k].length > 1 });
    RUBRICS.filter(x => x.performance === 1).forEach((rubric, j) => {
      const at = locate(rubric.id, record.index), value = r?.[0]?.contributions[j];
      m.put(4 + j, row, value, cell, { formula: value == null ? null : `ROUND('${at.sheet}'!${at.ref}*25/100,0)` });
    });
    m.put(8, row, r?.[0]?.result, { ...cell, bold: true, fill: RESULT_FILL }, { formula: r?.[0] ? `SUM(D${row}:G${row})` : null });
    RUBRICS.filter(x => x.performance === 2).forEach((rubric, j) => {
      const at = locate(rubric.id, record.index), value = r?.[1]?.normalized[j];
      m.put(9 + j, row, value, cell, { formula: value == null ? null : `ROUND('${at.sheet}'!${at.ref}/${rubric.max}*100,0)` });
    });
    m.put(12, row, r?.[1]?.result, { ...cell, bold: true, fill: RESULT_FILL }, { formula: r?.[1] ? `I${row}*33/100+J${row}*33/100+K${row}*34/100` : null, numberFormat: '0' });
    heights.push(rowHeight(names[k].length));
  });
  footer(m, widths, heights, 3 + rows.length, '', meta, f);
  return finish(m, widths, heights);
}

// ---------- All pages of a class ----------
export function reportModels(state, evaluations, { target = 'print' } = {}) {
  metric = METRICS[target] || METRICS.print;
  const meta = { ...state.meta, className: (state.meta.className || '').trim() || '……', school: state.meta.school || '…………………… ANADOLU LİSESİ', teacher: state.meta.teacher || '……………………', date: dateText(state.meta.date) };
  const records = state.students.map((student, i) => ({ student, results: evaluations[i].map(e => e.data) })).filter(r => r.student.name.trim()).map((r, index) => ({ ...r, index, number: index + 1 }));
  if (!records.length) return [];
  const names = records.map(r => nameLines(r.student.name));
  const scalePages = balanced(records, studentsPerPage(names));
  const located = new Map(), scales = [];
  for (const r of RUBRICS) {
    const p = r.performance;
    scalePages.forEach((page, g) => {
      const name = sheetName(r.name, g + 1, scalePages.length);
      const model = scalePage(r, page.map(x => ({ student: x.student, result: x.results[p - 1] })), meta, page.map(x => names[x.index]), g + 1, scalePages.length, name);
      page.forEach((x, i) => located.set(`${r.id}:${x.index}`, { sheet: name, ref: ref(model.start + i, model.totalRow) }));
      scales.push(model);
    });
  }
  // The whole class should stay on one summary page: try two-line names, then one-line
  // names in the wide name column, then slightly smaller text before splitting.
  const single = records.map(r => [r.student.name.trim()]), N = records.length;
  const options = [1, 0.95, 0.9, 0.85, 0.8].flatMap(f => [{ twoLines: true, f }, { twoLines: false, f }]);
  const choice = options.find(o => summaryPerPage(o.twoLines ? names : single, o.f) >= N) || { twoLines: false, f: 1 };
  const summaryPages = balanced(records, summaryPerPage(choice.twoLines ? names : single, choice.f));
  const summaries = summaryPages.map((rows, g) => summaryPage(rows, meta, g + 1, summaryPages.length, summaryPages.length > 1 ? `1. DÖNEM PERF. PUANLARI (${g + 1})` : SUMMARY_NAME, (id, index) => located.get(`${id}:${index}`), choice.twoLines, choice.f));
  return [...summaries, ...scales];
}
