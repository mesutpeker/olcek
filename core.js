import { RUBRICS } from './rubrics.js';

export const sum = values => values.reduce((a, b) => a + b, 0);
export const round = n => Math.floor(n + 0.5 + 1e-9);
export const format = value => value === null || value === undefined ? '—' : new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(value);
export function parseGrade(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const text = String(value).trim().replace(',', '.');
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(text) || Number(text) > 100) throw new Error('Not 0–100 arasında, en fazla iki ondalıklı olmalıdır.');
  return Number(text);
}
const hash = value => [...String(value)].reduce((n, c) => ((n * 31 + c.codePointAt(0)) >>> 0), 0);

// Dynamic programming uses only levels explicitly present in the reference.
export function allocate(rubric, target, seed = '') {
  const offset = hash(seed + rubric.id) % rubric.criteria.length;
  const order = rubric.criteria.map((_, i) => (i + offset) % rubric.criteria.length);
  let states = new Map([[0, { cost: 0, values: [] }]]);
  for (const i of order) {
    const next = new Map();
    for (const [total, state] of states) for (const point of rubric.criteria[i].points) {
      const t = total + point;
      if (t > target) continue;
      const cost = state.cost + (point / rubric.criteria[i].points.at(-1) - target / rubric.max) ** 2;
      if (!next.has(t) || cost < next.get(t).cost - 1e-10) next.set(t, { cost, values: [...state.values, point] });
    }
    states = next;
  }
  const chosen = states.get(target);
  if (!chosen) throw new Error('Bu toplam, ölçeğin puan basamaklarıyla oluşturulamıyor.');
  const values = [];
  order.forEach((i, j) => { values[i] = chosen.values[j]; });
  return values;
}
export function calculate(scores, performance) {
  const rubrics = RUBRICS.filter(r => r.performance === performance);
  const totals = rubrics.map(r => sum(scores[r.id]));
  if (performance === 1) {
    const contributions = totals.map(t => round(t * .25));
    return { totals, normalized: totals, contributions, result: sum(contributions) };
  }
  const normalized = totals.map((t, i) => round(t / rubrics[i].max * 100));
  const contributions = normalized.map((n, i) => n * [33, 33, 34][i] / 100);
  return { totals, normalized, contributions, result: round(sum(contributions) * 100) / 100 };
}
const totalCache = new Map();
function chooseTotals(target, performance) {
  const key = `${performance}:${target}`;
  if (totalCache.has(key)) return totalCache.get(key);
  let selected;
  if (performance === 1) {
    let states = new Map([[0, { cost: 0, totals: [] }]]);
    for (let i = 0; i < 4; i++) {
      const next = new Map();
      for (const [score, entry] of states) for (let total = 40; total <= 100; total += 2) {
        const value = score + round(total / 4);
        const cost = entry.cost + (total - target) ** 2;
        if (!next.has(value) || cost < next.get(value).cost) next.set(value, { cost, totals: [...entry.totals, total] });
      }
      states = next;
    }
    selected = [...states].sort((a, b) => Math.abs(a[0] - target) - Math.abs(b[0] - target) || a[1].cost - b[1].cost || a[0] - b[0])[0][1].totals;
  } else {
    let bestDiff = Infinity, bestCost = Infinity;
    for (let a = 14; a <= 42; a++) for (let b = 14; b <= 42; b++) for (let c = 6; c <= 18; c++) {
      const n = [round(a / 42 * 100), round(b / 42 * 100), round(c / 18 * 100)];
      const actual = n[0] * 33 + n[1] * 33 + n[2] * 34;
      const diff = Math.abs(actual - round(target * 100));
      const cost = sum(n.map(x => (x - target) ** 2));
      if (diff < bestDiff || (diff === bestDiff && cost < bestCost)) {
        bestDiff = diff; bestCost = cost; selected = [a, b, c];
      }
    }
  }
  totalCache.set(key, selected);
  return selected;
}
export function distribute(value, performance, seed = '') {
  const target = parseGrade(value);
  if (target === null) return null;
  const totals = chooseTotals(target, performance);
  const rubrics = RUBRICS.filter(r => r.performance === performance);
  const scores = Object.fromEntries(rubrics.map((r, i) => [r.id, allocate(r, totals[i], seed)]));
  const computed = calculate(scores, performance);
  return { ...computed, scores, target, exact: Math.abs(computed.result - target) < .001 };
}
export const rubricsFor = performance => RUBRICS.filter(r => r.performance === performance);
// Criterion scores entered by the teacher, as in the source Excel sheets.
// null marks a criterion that has not been scored yet.
export function validShape(scores, performance) {
  return Boolean(scores) && rubricsFor(performance).every(r => Array.isArray(scores[r.id]) && scores[r.id].length === r.criteria.length && scores[r.id].every((v, i) => v === null || r.criteria[i].points.includes(v)));
}
export const validScores = (scores, performance) => validShape(scores, performance) && rubricsFor(performance).every(r => scores[r.id].every(v => v !== null));
export const emptyScores = performance => Object.fromEntries(rubricsFor(performance).map(r => [r.id, r.criteria.map(() => null)]));
// Turns a typed criterion value into a legal level, or explains why it is not one.
export function criterionValue(rubric, index, text) {
  const value = String(text ?? '').trim();
  if (!value) return { value: null };
  const points = rubric.criteria[index].points;
  if (!/^\d{1,2}$/.test(value) || !points.includes(Number(value))) return { error: `Bu kriter için yalnızca ${points.join(', ')} girilebilir.` };
  return { value: Number(value) };
}
export function evaluateStudent(student) {
  return [1, 2].map(p => {
    const manual = student[`manual${p}`];
    if (manual && validShape(manual, p)) {
      const scores = Object.fromEntries(rubricsFor(p).map(r => [r.id, [...manual[r.id]]]));
      if (!validScores(scores, p)) {
        const missing = rubricsFor(p).map(r => ({ name: r.name, count: scores[r.id].filter(v => v === null).length })).filter(m => m.count);
        return { data: null, error: null, incomplete: { missing, count: missing.reduce((a, m) => a + m.count, 0) }, scores };
      }
      const computed = calculate(scores, p);
      return { data: { ...computed, scores, target: computed.result, exact: true, manual: true }, error: null };
    }
    try { return { data: distribute(student[`p${p}`], p, student.id), error: null }; }
    catch (e) { return { data: null, error: e.message }; }
  });
}
// The source sheets display performance grades with number format "0".
export const displayed = result => round(result);
export function isAccepted(student, result, performance, policy = 'rounded') {
  return Boolean(result && (result.exact || (policy === 'rounded' && displayed(result.result) === result.target) || student[`accepted${performance}`] === result.result));
}
export function gradeStatus(student, entry, performance) {
  if (entry.error) return { kind: 'error', message: entry.error };
  if (entry.incomplete) return { kind: 'incomplete', ...entry.incomplete };
  const d = entry.data;
  if (!d) return { kind: 'empty' };
  if (d.manual) return { kind: 'manual', result: d.result };
  if (d.exact) return { kind: 'exact', result: d.result };
  if (displayed(d.result) === d.target) return { kind: 'rounded', result: d.result };
  if (student[`accepted${performance}`] === d.result) return { kind: 'accepted', result: d.result, target: d.target };
  const min = performance === 1 ? 40 : 33;
  return { kind: 'pending', result: d.result, target: d.target, belowMin: d.target < min, min };
}
export function parseDelimited(text) {
  const first = text.trim().split(/\r?\n/)[0] || '';
  const delimiter = first.includes('\t') ? '\t' : first.includes(';') ? ';' : ',';
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === delimiter && !quoted) { row.push(field.trim()); field = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i+1] === '\n') i++; row.push(field.trim()); if (row.some(Boolean)) rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (quoted) throw new Error('Kapatılmamış tırnak işareti var.');
  row.push(field.trim()); if (row.some(Boolean)) rows.push(row);
  return rows;
}
export function studentsFromRows(rows) {
  const norm = text => String(text || '').toLocaleLowerCase('tr-TR').replace(/[\s._]/g, '');
  const headerIndex = rows.findIndex(row => row.some(c => /ad.*soyad|öğrencininadı|adsoyad/.test(norm(c))));
  let columns = { no: 0, name: 1, p1: 2, p2: 3 }, data = rows;
  if (headerIndex >= 0) {
    const h = rows[headerIndex].map(norm);
    columns = {
      no: h.findIndex(c => /öğrencino|okulno|numara/.test(c) || c === 'no'),
      name: h.findIndex(c => /ad.*soyad|öğrencininadı|adsoyad/.test(c)),
      p1: h.findIndex(c => /1.*performans|performans1/.test(c)),
      p2: h.findIndex(c => /2.*performans|performans2/.test(c)),
    };
    data = rows.slice(headerIndex + 1);
  }
  const students = data.filter(row => String(row[columns.name] || '').trim()).map((row, i) => {
    const student = { id: globalThis.crypto?.randomUUID?.() ?? `s-${Date.now()}-${i}`, no: String(row[columns.no] ?? '').trim(), name: String(row[columns.name] ?? '').trim(), p1: String(row[columns.p1] ?? '').trim(), p2: String(row[columns.p2] ?? '').trim() };
    for (const key of ['p1', 'p2']) try { parseGrade(student[key]); } catch { throw new Error(`${i + 1}. öğrenci: ${key === 'p1' ? '1.' : '2.'} performans notu geçersiz.`); }
    if (student.name.length > 150 || student.no.length > 30) throw new Error('Öğrenci adı veya numarası çok uzun.');
    return student;
  });
  if (!students.length) throw new Error('Öğrenci bulunamadı. No ve Ad Soyad sütunlarını kontrol edin.');
  if (students.length > 500) throw new Error('Bir çalışma en fazla 500 öğrenci içerebilir.');
  const numbers = students.map(s => s.no).filter(Boolean);
  if (new Set(numbers).size !== numbers.length) throw new Error('Listede tekrar eden öğrenci numaraları var.');
  return students;
}

// e-Okul "Not Girişi" copy: "No<TAB>AD SOYAD<TAB>" followed by a line of grade
// cells ending with "Öğrenci Not Bilgisi". One-line "No, Ad, notlar" rows also work.
export function parseEokul(text) {
  const students = [], skipped = [];
  const cellsOf = line => line.split('\t').map(c => c.replace(/\u00a0/g, ' ').trim());
  const gradeCells = cells => { const list = cells.filter(c => !/not\s*bilgisi/i.test(c)); while (list.length && !list.at(-1)) list.pop(); return list; };
  let current = null;
  for (const raw of String(text || '').replace(/\r/g, '').split('\n')) {
    const cells = cellsOf(raw);
    if (!cells.some(Boolean)) continue;
    if (/^\d{1,9}$/.test(cells[0]) && /\p{L}/u.test(cells[1] || '') && !/not\s*bilgisi/i.test(cells[1])) {
      current = { no: cells[0], name: cells[1].replace(/\s+/g, ' '), grades: gradeCells(cells.slice(2)) };
      students.push(current);
    } else if (current && !current.grades.length) current.grades = gradeCells(cells);
    else if (!students.length) continue;
    else skipped.push(raw);
  }
  if (!students.length) throw new Error('Listede öğrenci bulunamadı. e-Okul’daki öğrenci satırlarını numara ve adlarıyla birlikte kopyalayın.');
  if (students.length > 500) throw new Error('Bir sınıfta en fazla 500 öğrenci olabilir.');
  const numbers = students.map(s => s.no);
  const repeated = numbers.find((n, i) => numbers.indexOf(n) !== i);
  if (repeated) throw new Error(`${repeated} numarası listede birden fazla kez geçiyor.`);
  for (const s of students) if (s.name.length > 150) throw new Error('Öğrenci adı çok uzun.');
  const columns = Math.max(0, ...students.map(s => s.grades.length));
  return { students, columns, skipped };
}
