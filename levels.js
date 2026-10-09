// Grade levels: the seven scales of each reference workbook and how its
// summary sheet turns scale totals into the two performance grades.
import { RUBRICS } from './rubrics.js';
import { RUBRICS_10, RUBRICS_11 } from './rubrics-10-11.js';

// Summary column header and weight of each scale.
const COLUMNS = {
  speak1: ['I. Tema Konuşma (%25)', 25], speak2: ['II. Tema Konuşma (%25)', 25], write1: ['I. Tema Yazma (%25)', 25], write2: ['II. Tema Yazma (%25)', 25],
  book1: ['I. Tema Kitap Okuma (%33)', 33], book2: ['II. Tema Kitap Okuma (%33)', 33], observe: ['Ders İçi Gözlem (%34)', 34],
};
// Every scale keeps the role (speak1, book2, …) of the 9th grade scale it replaces.
export const roleOf = rubric => rubric.id.split('-')[0];
const withColumns = list => list.map(r => ({ ...r, layout: r.layout || (r.performance === 1 ? 'levels' : 'statements'), column: COLUMNS[roleOf(r)][0], weight: COLUMNS[roleOf(r)][1] }));

const SECOND = {
  formula: 'weighted', column: 'normalized', subtitle: 'Kitap okuma %33 + %33 · Ders içi gözlem %34',
  help: '<p>1. ve 2. Tema Kitap Okuma (14 kriter, en çok 42) ile Ders İçi Gözlem (6 kriter, en çok 18) 100’lük sisteme çevrilip yuvarlanır; ardından <b>%33 + %33 + %34</b> alınır.</p><p class="muted">Sonuç ondalıklı olabilir: 85 için en yakın sonuç 84,98’dir. Excel bu hücreyi tam sayı biçiminde gösterdiği için çizelgede 85 görünür. En düşük not 33’tür.</p>',
};
// formula — roundedQuarter: Σ ROUND(toplam × %25) · quarter: Σ toplam × %25 ·
// average: ORTALAMA(ROUND(toplam / en çok × 100)) · weighted: Σ ROUND(toplam / en çok × 100) × ağırlık.
// column — the value each scale shows in the summary: its contribution or its 100-point equivalent.
export const LEVELS = {
  9: {
    level: 9, name: '9. sınıf', rubrics: withColumns(RUBRICS),
    performances: {
      1: {
        formula: 'roundedQuarter', column: 'contributions', subtitle: 'Konuşma ve yazma · her ölçek %25',
        help: '<p>1. ve 2. Tema Konuşma, 1. ve 2. Tema Yazma ölçeklerinin her biri 100 üzerinden puanlanır. Her ölçeğin %25’i <b>ayrı ayrı</b> tam sayıya yuvarlanır ve toplanır.</p><p class="muted">Kriter basamakları 4 · 6 · 8 · 10 (1. Tema Yazma “Özgünlük”: 8 · 12 · 16 · 20). Not aralığı 40–100; bu aralıktaki her tam sayı tam olarak üretilebilir.</p>',
      },
      2: SECOND,
    },
  },
  10: {
    level: 10, name: '10. sınıf', rubrics: withColumns(RUBRICS_10),
    performances: {
      1: {
        formula: 'average', column: 'normalized', subtitle: 'Konuşma ve yazma · dört ölçeğin 100’lük ortalaması',
        help: '<p>1. Tema Konuşma (11 kriter, en çok 33), 2. Tema Konuşma (6 kriter, en çok 18), 1. Tema Yazma (10 kriter, en çok 30) ve 2. Tema Yazma (7 kriter, en çok 21) 100’lük sisteme çevrilip <b>ayrı ayrı</b> tam sayıya yuvarlanır. 1. performans bu dört puanın ortalamasıdır.</p><p class="muted">Kriter basamakları 1 · 2 · 3 (3 iyi, 2 orta, 1 geliştirilebilir). En düşük not 33’tür. 33–100 arasındaki her tam not tam olarak üretilebilir; yalnızca 99 için en yakın sonuç 99,25’tir ve Excel bu hücreyi tam sayı biçiminde gösterdiği için çizelgede 99 görünür.</p>',
      },
      2: SECOND,
    },
  },
  11: {
    level: 11, name: '11. sınıf', rubrics: withColumns(RUBRICS_11),
    performances: {
      1: {
        formula: 'quarter', column: 'contributions', subtitle: 'Konuşma ve yazma · her ölçek %25',
        help: '<p>1. ve 2. Tema Konuşma, 1. ve 2. Tema Yazma ölçeklerinin her biri 100 üzerinden puanlanır. Her ölçeğin %25’i alınıp toplanır; kaynak Excel bu katkıları yuvarlamaz (ör. 21,5).</p><p class="muted">Her ölçüt dört düzeyde bir puan aralığıyla puanlanır (ör. 1–4 · 5–8 · 9–12 · 13–16); aralıktaki her tam puan verilebilir. 6–100 arasındaki her tam not tam olarak üretilebilir.</p>',
      },
      2: {
        ...SECOND, subtitle: 'Ders içi gözlem %34 · Kitap okuma %33 + %33',
        help: '<p>Ders İçi Gözlem (6 kriter, en çok 18) ile 1. ve 2. Tema Kitap Okuma (14 kriter, en çok 42) 100’lük sisteme çevrilip yuvarlanır; ardından <b>%34 + %33 + %33</b> alınır.</p><p class="muted">Sonuç ondalıklı olabilir: 85 için en yakın sonuç 84,98’dir. Excel bu hücreyi tam sayı biçiminde gösterdiği için çizelgede 85 görünür. En düşük not 33’tür.</p>',
      },
    },
  },
};
export const LEVEL_IDS = Object.keys(LEVELS).map(Number);
export const DEFAULT_LEVEL = 9;
export const levelOf = level => LEVELS[level] || LEVELS[DEFAULT_LEVEL];
export const isLevel = level => Object.hasOwn(LEVELS, level);
export const allRubrics = () => LEVEL_IDS.flatMap(l => LEVELS[l].rubrics);

// A criterion is scored either with fixed levels (4·6·8·10) or with a range of
// whole points per level (1–4 · 5–8 · …).
export const levelIndex = (criterion, value) => criterion.ranges ? criterion.ranges.findIndex(([a, b]) => value >= a && value <= b) : criterion.points.indexOf(value);
export const levelPoints = (criterion, j) => criterion.ranges ? `${criterion.ranges[j][0]}-${criterion.ranges[j][1]}` : String(criterion.points[j]);
export const pointsText = (criterion, separator = '·') => criterion.ranges ? `${criterion.points[0]}–${criterion.points.at(-1)}` : criterion.points.join(separator);
