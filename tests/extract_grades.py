"""Read the 10th and 11th grade reference workbooks. Export rubric text only, never student records.

Usage: python3 tests/extract_grades.py <10. sınıf.xlsx> <11. sınıf.xlsx>
"""
import json, pathlib, re, sys
import openpyxl

clean = lambda x: re.sub(r'\s+', ' ', str(x or '')).strip()
# Words the source splits with a hyphen to fit its narrow columns.
JOINED = {'canlandırma-nın': 'canlandırmanın', 'gerçekleştiril-miştir': 'gerçekleştirilmiştir', 'gerçekleştirilme-miştir': 'gerçekleştirilmemiştir', 'yönetilebilmiş-tir': 'yönetilebilmiştir'}
def text(x):
    value = clean(x)
    for old, new in JOINED.items(): value = value.replace(old, new)
    return value
def placeholders(value, book=None):
    value = re.sub(r'^[.…\s]*ANADOLU LİSESİ', '{{school}}', text(value))
    value = re.sub(r'1[01]/\s*A(?:TP)?\s+SINIFI', '{{className}} SINIFI', value)
    if book: value = re.sub(r'(SEÇİLEN KİTABIN ADI:)\s*[.…]+', r'\1 {{' + book + '}}', value)
    return value
first_sentence = lambda value: re.split(r'(?<=\.)\s', value)[0]
SCALE_NOTE = 'NOT: Ölçütleri karşılama değerleri 3 puan iyi, 2 puan orta, 1 puan geliştirilebilir derecesini göstermektedir.'
STEPS = ['Geliştirilebilir', 'Orta', 'İyi']

def sheet(workbook, name):
    return next(s for s in workbook if s.title.strip().lower() == name.lower())
def statements(s, rid, name, start, end, col, first, book=None):
    """Second performance: one statement per criterion, 1-2-3 points."""
    criteria = [dict(label=text(s.cell(r, col).value), descriptions=[], points=[1, 2, 3], sourceRow=r) for r in range(start, end + 1)]
    title_cell = s.cell(1, col)
    return dict(id=rid, name=name, performance=2, layout='statements', description='', levels=STEPS, criteria=criteria,
                title=placeholders(title_cell.value, book), note=first_sentence(text(s.cell(2, col).value)), source=dict(sheet=s.title.strip(), col=first))
def described(s, rid, name, start, end, note):
    """10th grade first performance: criterion, one explanation, 1-2-3 points."""
    criteria = [dict(label=text(s.cell(r, 2).value), note=text(s.cell(r, 3).value), descriptions=[], points=[1, 2, 3], sourceRow=r) for r in range(start, end + 1)]
    return dict(id=rid, name=name, performance=1, layout='described', description=note if note != SCALE_NOTE else '', levels=STEPS, criteria=criteria,
                title=placeholders(s.cell(1, 2).value), note=note, source=dict(sheet=s.title.strip(), col=4))
def ranged(s, rid, name, head, start, end, intro, subtitle=None):
    """11th grade first performance: four levels, each a range of points."""
    criteria = []
    for r in range(start, end + 1):
        descriptions = [text(s.cell(r, c).value) for c in range(3, 7)]
        ranges = [[int(a), int(b)] for a, b in (re.search(r'\((\d+)\s*-\s*(\d+)\s*puan\)', d).groups() for d in descriptions)]
        label = text(s.cell(r, 2).value)
        top = int(re.search(r'\((\d+)\s*puan\)', label).group(1))
        assert ranges[0][0] == 1 and ranges[-1][1] == top and all(ranges[i][1] + 1 == ranges[i + 1][0] for i in range(3)), (name, r, ranges)
        criteria.append(dict(label=label, descriptions=descriptions, points=list(range(1, top + 1)), ranges=ranges, sourceRow=r))
    system = next(v for v in (text(s.cell(r, 2).value) for r in range(end + 1, end + 6)) if 'Öğrenci bu formdan' in v)
    evaluation = 'Değerlendirme: ' + re.search(r'Öğrenci bu formdan.*$', system).group(0)
    extra = dict(subtitle=text(subtitle)) if subtitle else {}
    return dict(id=rid, name=name, performance=1, layout='levels', description=text(intro), levels=[text(s.cell(head, c).value) for c in range(3, 7)], criteria=criteria,
                title=placeholders(s.cell(1, 2).value or s.cell(1, 1).value), **extra, note=text(intro), evaluation=evaluation, source=dict(sheet=s.title.strip(), col=7))

g10 = openpyxl.load_workbook(sys.argv[1])
write_note = lambda name: text(sheet(g10, name).cell(2, 2).value)
grade10 = [
    described(sheet(g10, '1. Tema Konuşma'), 'speak1-10', '1. Tema Konuşma', 4, 14, SCALE_NOTE),
    described(sheet(g10, '2. Tema Konuşma'), 'speak2-10', '2. Tema Konuşma', 4, 9, SCALE_NOTE),
    described(sheet(g10, '1. Tema Yazma'), 'write1-10', '1. Tema Yazma', 4, 13, write_note('1. Tema Yazma')),
    described(sheet(g10, '2. Tema Yazma'), 'write2-10', '2. Tema Yazma', 4, 10, write_note('2. Tema Yazma')),
    statements(sheet(g10, '1. Tema Kitap Okuma'), 'book1-10', '1. Tema Kitap Okuma', 4, 17, 3, 4, 'book1'),
    statements(sheet(g10, '2. Tema Kitap Okuma'), 'book2-10', '2. Tema Kitap Okuma', 4, 17, 3, 4, 'book2'),
    statements(sheet(g10, 'Ders İçi Gözlem'), 'observe-10', 'Ders İçi Gözlem', 4, 9, 2, 4),
]
g11 = openpyxl.load_workbook(sys.argv[2])
s = lambda name: sheet(g11, name)
grade11 = [
    ranged(s('1. Tema Konuşma'), 'speak1-11', '1. Tema Konuşma', 3, 4, 9, s('1. Tema Konuşma').cell(2, 2).value),
    ranged(s('2. Tema Konuşma'), 'speak2-11', '2. Tema Konuşma', 3, 4, 8, s('2. Tema Konuşma').cell(2, 2).value),
    ranged(s('1. Tema Yazma'), 'write1-11', '1. Tema Yazma', 4, 5, 10, s('1. Tema Yazma').cell(3, 2).value, s('1. Tema Yazma').cell(2, 2).value),
    ranged(s('2. Tema Yazma'), 'write2-11', '2. Tema Yazma', 4, 5, 9, s('2. Tema Yazma').cell(3, 2).value, s('2. Tema Yazma').cell(2, 2).value),
    # The 11th grade summary lists the observation first, then the two books.
    statements(s('Ders İçi Gözlem'), 'observe-11', 'Ders İçi Gözlem', 4, 9, 2, 4),
    statements(s('1. Tema Kitap Okuma'), 'book1-11', '1. Tema Kitap Okuma', 4, 17, 2, 4, 'book1'),
    statements(s('2. Tema Kitap Okuma'), 'book2-11', '2. Tema Kitap Okuma', 4, 17, 2, 4, 'book2'),
]
for rubric in grade10 + grade11:
    rubric['max'] = sum(c['points'][-1] for c in rubric['criteria'])
    rubric['min'] = sum(c['points'][0] for c in rubric['criteria'])
dest = pathlib.Path(__file__).resolve().parents[1] / 'rubrics-10-11.js'
dest.write_text('// 10. ve 11. sınıf kaynak Excel dosyalarından alınmıştır. Yalnızca boşluklar ve satır sonu için bölünmüş sözcükler düzenlenmiştir.\n'
                'export const RUBRICS_10 = ' + json.dumps(grade10, ensure_ascii=False, indent=2) + ';\n'
                'export const RUBRICS_11 = ' + json.dumps(grade11, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
for grade, rubrics in [(10, grade10), (11, grade11)]:
    print(grade, [(r['name'], len(r['criteria']), r['min'], r['max']) for r in rubrics])
