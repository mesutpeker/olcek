// Printable pages shared by the browser print view and the Excel export.
// Every sheet is built with one common design that fills an A4 landscape page;
// a sheet has exactly as many student columns (or rows) as students on that page.
import { levelOf, roleOf, levelPoints, DEFAULT_LEVEL } from './levels.js';
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
// 9th grade texts come from the template; the other grades carry their own source
// texts and reuse the template sheet of the 9th grade scale with the same role.
const texts = r => SOURCE[r.id] || { index: SOURCE[roleOf(r)].index, title: r.title, note: r.note, evaluation: r.evaluation || '' };
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
  // When the note does not fit beside the date (few students), the date moves one row down.
  const apart = Boolean(note) && textWidth(note, size) + 8 > widths.slice(0, sig - 1).reduce((a, b) => a + b, 0);
  if (note) { m.put(1, row, note, { fontSize: size, wrap: false }); const end = apart ? last : sig - 1; if (end > 1) m.merges.push(`${ref(1, row)}:${ref(end, row)}`); }
  m.put(sig, row + (apart ? 1 : 0), meta.date, { fontSize: size, align: 'center', wrap: false });
  m.put(sig, row + 2, meta.teacher, { fontSize: size, bold: true, align: 'center', wrap: false });
  m.put(sig, row + 3, 'TÜRK DİLİ VE EDEBİYATI ÖĞRETMENİ', { fontSize: size, align: 'center', wrap: false });
  for (const r of [row + (apart ? 1 : 0), row + 2, row + 3]) if (last > sig) m.merges.push(`${ref(sig, r)}:${ref(last, r)}`);
  heights.push(...footerHeights(f));
}

// ---------- Scale sheets ----------
// A level's points go into its header when every criterion shares them at every
// level; the repeated "(N puan)" or "(1-4 puan)" note is then dropped from the cells.
const POINT_NOTE = /\s*\(?\s*(\d+(?:\s*-\s*\d+)?)\s*puan\s*\)?\.?\s*$/i;
function sharedPoints(r) {
  const shared = r.levels.map((_, j) => { const set = new Set(r.criteria.map(c => levelPoints(c, j))); return set.size === 1 ? [...set][0] : null; });
  return shared.every(pts => pts != null) ? shared : shared.map(() => null);
}
const levelHeader = (r, j) => { const pts = sharedPoints(r)[j]; return pts == null ? r.levels[j] : `${r.levels[j]}\n(${pts} puan)`; };
function levelText(r, k, j) {
  const text = r.criteria[k].descriptions[j].replace(/\s+/g, ' ').trim(), pts = sharedPoints(r)[j], m = text.match(POINT_NOTE);
  return pts != null && m && m[1].replace(/\s/g, '') === pts ? text.replace(POINT_NOTE, '').trim() : text;
}
// A source subtitle (11th grade writing scales) goes on a second title line.
const scaleTitle = (r, meta) => { const t = fill(texts(r).title, meta); return `${/ÖLÇEĞİ/.test(t) ? t : `${t} DEĞERLENDİRME ÖLÇEĞİ`}${r.subtitle ? `\n${r.subtitle}` : ''}`; };
// Text columns before the student columns: criterion and four level descriptions
// (levels), one statement (statements), or criterion and its explanation (described).
const textColumns = r => ({ levels: 5, statements: 1, described: 2 })[r.layout];
function scaleSizes(r, names, f, meta, pageLabel, force = false) {
  const n = names.length, W = PAGE.width, layout = r.layout;
  const sz = { title: 10 * f, note: 7.5 * f, head: 7.5 * f, label: 7.5 * f, desc: 7 * f, stmt: 7.5 * f, score: 8 * f, name: 7 * f };
  const lines = Math.max(1, ...names.map(l => l.length));
  const minStudent = Math.max(lines * lineHeight(sz.name) * metric.rotated + 6, textWidth('100', sz.score, true) + 7, 16);
  const ideal = layout === 'levels' ? 700 : 560;
  const student = Math.min(38, Math.max(minStudent, (W - ideal) / Math.max(1, n)));
  const description = W - student * n;
  if (!force && description < ({ levels: 380, statements: 260, described: 300 })[layout]) return null;
  const label = layout === 'levels' ? Math.min(120, Math.max(86, description * 0.15)) : layout === 'described' ? Math.min(170, Math.max(96, description * 0.3)) : description;
  const level = layout === 'levels' ? (description - label) / 4 : description - label;
  const widths = [label, ...Array(textColumns(r) - 1).fill(level), ...Array(n).fill(student)];
  const nameLength = Math.max(0, ...names.flat().map(l => textWidth(l, sz.name, true)));
  const header = Math.max(36, nameLength + 14, ...(layout === 'levels' ? r.levels.map((_, j) => blockHeight(levelHeader(r, j), level, sz.head, true)) : []));
  const rows = r.criteria.map((c, k) => layout === 'levels'
    ? Math.max(22, ...c.descriptions.map((_, j) => blockHeight(levelText(r, k, j), level, sz.desc)), r.criteria[k - 1]?.label === c.label || r.criteria[k + 1]?.label === c.label ? 0 : blockHeight(c.label, label, sz.label, true))
    : layout === 'described' ? Math.max(20, blockHeight(c.label, label, sz.label, true), blockHeight(c.note, level, sz.stmt))
    : Math.max(18, blockHeight(c.label, description, sz.stmt)));
  const heights = [blockHeight(`${scaleTitle(r, meta)}${pageLabel}`, W, sz.title, true), blockHeight(texts(r).note, W, sz.note), header, ...rows, 20];
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
  const levels = r.layout === 'levels', pageLabel = pages > 1 ? ` (${pageNo}/${pages})` : '';
  const size = fitScale(r, names, meta, pageLabel) || { ...scaleSizes(r, names, MIN_FONT, meta, pageLabel, true), f: MIN_FONT };
  const { widths, heights, sz, f } = size, m = sheet(sheetName, texts(r).index, { spec: [r.id], rubric: r.id, page: pageNo });
  const start = 1 + textColumns(r), last = widths.length, totalRow = 4 + r.criteria.length;
  m.put(1, 1, `${scaleTitle(r, meta)}${pageLabel}`, { fontSize: sz.title, bold: true, align: 'center' }); m.merges.push(`A1:${ref(last, 1)}`);
  m.put(1, 2, texts(r).note, { fontSize: sz.note }); m.merges.push(`A2:${ref(last, 2)}`);
  const head = { fontSize: sz.head, bold: true, align: 'center', fill: HEAD_FILL, borders: thin };
  m.put(1, 3, 'ÖLÇÜTLER', head);
  if (levels) r.levels.forEach((_, j) => m.put(2 + j, 3, levelHeader(r, j), head));
  if (r.layout === 'described') m.put(2, 3, 'AÇIKLAMALAR', head);
  page.forEach(({ student }, i) => m.put(start + i, 3, names[i].join('\n'), { ...head, fontSize: sz.name, rotate: 90, vertical: 'bottom', wrap: names[i].length > 1 }));
  r.criteria.forEach((c, k) => {
    const row = 4 + k;
    const merged = levels && r.criteria[k - 1]?.label === c.label, statement = r.layout === 'statements';
    m.put(1, row, merged ? null : c.label, { fontSize: statement ? sz.stmt : sz.label, bold: !statement, borders: thin, align: levels ? 'center' : 'left' });
    if (levels && !merged) { let end = k; while (r.criteria[end + 1]?.label === c.label) end++; if (end > k) m.merges.push(`${ref(1, row)}:${ref(1, 4 + end)}`); }
    if (levels) c.descriptions.forEach((_, j) => m.put(2 + j, row, levelText(r, k, j), { fontSize: sz.desc, borders: thin }));
    if (r.layout === 'described') m.put(2, row, c.note, { fontSize: sz.stmt, borders: thin });
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
  const evaluation = texts(r).evaluation || `Değerlendirme: Bu ölçekten en düşük ${r.min} puan, en yüksek ${r.max} puan alınabilir.`;
  footer(m, widths, heights, totalRow + 1, evaluation.replace(/\s+/g, ' ').trim(), meta, f);
  // Excel accepts only the legal levels: a list of them, or a whole number in a range.
  const groups = new Map();
  r.criteria.forEach((c, k) => { const key = c.ranges ? `${c.points[0]}-${c.points.at(-1)}` : c.points.join(','); groups.set(key, [...(groups.get(key) || []), `${ref(start, 4 + k)}:${ref(last, 4 + k)}`]); });
  m.validations = [...groups].map(([key, ranges]) => key.includes('-') ? { min: Number(key.split('-')[0]), max: Number(key.split('-')[1]), sqref: ranges.join(' ') } : { points: key, sqref: ranges.join(' ') });
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
const summaryHeaders = level => {
  const rubrics = levelOf(level).rubrics, of = p => rubrics.filter(r => r.performance === p).map(r => r.column);
  return ['SIRA NO', 'ÖĞR. NO', 'ÖĞRENCİNİN ADI VE SOYADI', ...of(1), '1. Performans Puanı', ...of(2), '2. Performans Puanı'];
};
function summaryGeometry(names, f = 1, headers = summaryHeaders(DEFAULT_LEVEL)) {
  const W = PAGE.width, nameWidth = Math.min(320, Math.max(210, ...names.flat().map(l => textWidth(l, 8 * f) + 16)));
  const number = (W - 36 - 56 - nameWidth) / 9, widths = [36, 56, nameWidth, ...Array(9).fill(number)];
  const header = Math.max(...headers.map((h, i) => blockHeight(h, widths[i], 7.5 * f, true)));
  const rowHeight = lines => Math.ceil(lines * px(8 * f) * 1.15 + 4);
  return { widths, header, rowHeight };
}
// Student rows are distributed evenly: every row is as tall as the tallest name,
// so one-line and two-line names share one row height.
const summaryLines = names => Math.max(1, ...names.map(l => l.length));
export function summaryPerPage(names, f = 1, headers) {
  const { header, rowHeight } = summaryGeometry(names, f, headers), title = Math.ceil(3 * lineHeight(10) + 12), foot = footerHeight(f);
  return Math.max(1, Math.floor((PAGE.height - title - header - foot) / rowHeight(summaryLines(names))));
}
// The summary cells of each performance, written as in the reference workbook.
const SHARE = {
  roundedQuarter: at => `ROUND('${at.sheet}'!${at.ref}*25/100,0)`,
  quarter: at => `'${at.sheet}'!${at.ref}*25/100`,
  average: (at, r) => `ROUND('${at.sheet}'!${at.ref}/${r.max}*100,0)`,
  weighted: (at, r) => `ROUND('${at.sheet}'!${at.ref}/${r.max}*100,0)`,
};
function performanceTotal(formula, rubrics, cols, row) {
  if (formula === 'average') return `AVERAGE(${ref(cols[0], row)}:${ref(cols.at(-1), row)})`;
  if (formula === 'weighted') return rubrics.map((r, j) => `${ref(cols[j], row)}*${r.weight}/100`).join('+');
  return `SUM(${ref(cols[0], row)}:${ref(cols.at(-1), row)})`;
}
function summaryPage(rows, meta, pageNo, pages, name, locate, twoLines, f, lines) {
  const level = levelOf(meta.level), headers = summaryHeaders(level.level);
  const names = rows.map(r => twoLines ? nameLines(r.student.name) : [r.student.name.trim()]), { widths, header, rowHeight } = summaryGeometry(names, f, headers);
  const m = sheet(name, SUMMARY_INDEX, { page: pageNo }), last = widths.length;
  const title = `${meta.year} EĞİTİM ÖĞRETİM YILI ${meta.school}\n${meta.className} SINIFI TÜRK DİLİ VE EDEBİYATI DERSİ\n1. DÖNEM 1. VE 2. PERFORMANS PUANLARI${pages > 1 ? ` (${pageNo}/${pages})` : ''}`;
  m.put(1, 1, title, { fontSize: 10, bold: true, align: 'center' }); m.merges.push(`A1:${ref(last, 1)}`);
  headers.forEach((h, i) => m.put(1 + i, 2, h, { fontSize: 7.5 * f, bold: true, align: 'center', fill: HEAD_FILL, borders: thin }));
  const heights = [Math.ceil(3 * lineHeight(10) + 12), header];
  rows.forEach((record, k) => {
    const row = 3 + k, r = record.results, cell = { fontSize: 8 * f, align: 'center', borders: thin, wrap: false };
    m.put(1, row, record.number, cell);
    m.put(2, row, record.student.no, cell);
    m.put(3, row, names[k].join('\n'), { ...cell, align: 'left', wrap: names[k].length > 1 });
    let col = 4;
    for (const p of [1, 2]) {
      const { formula, column } = level.performances[p], rubrics = level.rubrics.filter(x => x.performance === p), result = r?.[p - 1], cols = rubrics.map((_, j) => col + j);
      rubrics.forEach((rubric, j) => {
        const at = locate(rubric.id, record.index), value = result?.[column][j];
        m.put(cols[j], row, value, cell, { formula: value == null ? null : SHARE[formula](at, rubric) });
      });
      col += rubrics.length;
      // The reference sheets show the performance grade with number format "0".
      m.put(col, row, result?.result, { ...cell, bold: true, fill: RESULT_FILL }, { formula: result ? performanceTotal(formula, rubrics, cols, row) : null, ...(formula === 'roundedQuarter' ? {} : { numberFormat: '0' }) });
      col++;
    }
    heights.push(rowHeight(lines));
  });
  footer(m, widths, heights, 3 + rows.length, '', meta, f);
  return finish(m, widths, heights);
}

// ---------- All pages of a class ----------
export function reportModels(state, evaluations, { target = 'print' } = {}) {
  metric = METRICS[target] || METRICS.print;
  const level = levelOf(state.level);
  const meta = { ...state.meta, level: level.level, className: (state.meta.className || '').trim() || '……', school: state.meta.school || '…………………… ANADOLU LİSESİ', teacher: state.meta.teacher || '……………………', date: dateText(state.meta.date) };
  const records = state.students.map((student, i) => ({ student, results: evaluations[i].map(e => e.data) })).filter(r => r.student.name.trim()).map((r, index) => ({ ...r, index, number: index + 1 }));
  if (!records.length) return [];
  const names = records.map(r => nameLines(r.student.name));
  const scalePages = balanced(records, studentsPerPage(names));
  const located = new Map(), scales = [];
  for (const r of level.rubrics) {
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
  const single = records.map(r => [r.student.name.trim()]), N = records.length, headers = summaryHeaders(level.level);
  const options = [1, 0.95, 0.9, 0.85, 0.8].flatMap(f => [{ twoLines: true, f }, { twoLines: false, f }]);
  const choice = options.find(o => summaryPerPage(o.twoLines ? names : single, o.f, headers) >= N) || { twoLines: false, f: 1 };
  const listed = choice.twoLines ? names : single, lines = summaryLines(listed);
  const summaryPages = balanced(records, summaryPerPage(listed, choice.f, headers));
  const summaries = summaryPages.map((rows, g) => summaryPage(rows, meta, g + 1, summaryPages.length, summaryPages.length > 1 ? `1. DÖNEM PERF. PUANLARI (${g + 1})` : SUMMARY_NAME, (id, index) => located.get(`${id}:${index}`), choice.twoLines, choice.f, lines));
  return [...summaries, ...scales];
}
