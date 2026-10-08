"""Read the supplied reference. Export rubric text only, never student records."""
import json, pathlib, re, sys
import openpyxl

workbook = openpyxl.load_workbook(sys.argv[1])
specs = [
    ('speak1', '1. Tema Konuşma', 1, 4, 13, 1),
    ('speak2', '2. Tema Konuşma', 1, 4, 13, 1),
    ('write1', '1. Tema Yazma', 1, 4, 12, 1),
    ('write2', '2. Tema Yazma', 1, 4, 13, 1),
    ('book1', '1. Tema Kitap Okuma', 2, 4, 17, 3),
    ('book2', '2. Tema Kitap Okuma', 2, 4, 17, 2),
    ('observe', 'Ders İçi Gözlem', 2, 4, 9, 2),
]
clean = lambda x: re.sub(r'\s+', ' ', str(x or '')).strip()
rubrics = []
for key, name, performance, start, end, col in specs:
    sheet = workbook[name]
    criteria = []
    label = ''
    for row in range(start, end + 1):
        label = clean(sheet.cell(row, col).value) or label
        descriptions = [clean(sheet.cell(row, c).value) for c in range(2, 6)] if performance == 1 else []
        points = [int(re.search(r'(\d+)\s*puan', d).group(1)) for d in descriptions] if descriptions else [1, 2, 3]
        criteria.append(dict(label=label, descriptions=descriptions, points=points, sourceRow=row))
    rubrics.append(dict(id=key, name=name, performance=performance, description=clean(sheet.cell(2, 1).value) if performance == 1 else '', levels=[clean(sheet.cell(3,c).value) for c in range(2,6)] if performance == 1 else ['Geliştirilebilir', 'Orta', 'İyi'], criteria=criteria, max=sum(c['points'][-1] for c in criteria), min=sum(c['points'][0] for c in criteria)))
dest = pathlib.Path(__file__).resolve().parents[1] / 'rubrics.js'
dest.write_text('// Kaynak Excel’den alınmıştır. Yalnızca boşluklar düzenlenmiştir.\nexport const RUBRICS = '+json.dumps(rubrics, ensure_ascii=False, indent=2)+';\n', encoding='utf-8')
print([(r['name'], len(r['criteria']), r['min'], r['max']) for r in rubrics])
