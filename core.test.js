const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('./core.js');

function fixture() {
    const data = C.newData();
    const student = C.newStudent('101', 'Deneme Öğrenci');
    data.students.push(student);
    return { data, student };
}
function applyRaw(data, student, key, raw) {
    const count = C.RUBRICS[key].criteria.length;
    for (let i = 0; i < count; i++) C.setDegree(data, student.id, key, i, Math.floor(raw / count) + (i < raw % count ? 1 : 0));
}

test('Excel ölçekleri: ölçüt sayıları, paydalar ve performans ağırlıkları', () => {
    assert.deepEqual(Object.values(C.RUBRICS).map(r => [r.criteria.length, r.maxScore, r.weight, r.performance]), [
        [13,39,25,1], [18,54,25,1], [10,30,25,1], [13,39,25,1], [14,42,33,2], [14,42,33,2], [6,18,34,2]
    ]);
    for (const p of [1, 2]) assert.equal(C.keysFor(p).reduce((sum, key) => sum + C.RUBRICS[key].weight, 0), 100);
});
test('Excel ile aynı: önce ölçek yuvarlaması, sonra ağırlıklı sonuç', () => {
    const { data, student } = fixture();
    [25, 40, 20, 30].forEach((raw, index) => applyRaw(data, student, C.keysFor(1)[index], raw));
    const result = C.performanceResult(data, student.id, 1);
    assert.equal(result.raw, 70.5); // (64 + 74 + 67 + 77) / 4
    assert.equal(result.calculated, 71);
    [30, 35, 15].forEach((raw, index) => applyRaw(data, student, C.keysFor(2)[index], raw));
    assert.equal(C.performanceResult(data, student.id, 2).raw, 79.04); // 71*.33 + 83*.33 + 83*.34
    assert.equal(C.performanceResult(data, student.id, 2).final, 79);
});
test('Boş veya eksik ölçek kesin not değildir; gerçek sıfır notu korunur', () => {
    const { data, student } = fixture();
    assert.equal(C.performanceResult(data, student.id, 1).final, null);
    C.setDegree(data, student.id, 'tema1_konusma', 0, 3);
    assert.equal(C.rubricResult(data, student.id, 'tema1_konusma').score, 8);
    assert.equal(C.performanceResult(data, student.id, 1).final, null);
    student.grades[1] = 0;
    assert.equal(C.performanceResult(data, student.id, 1).final, 0);
    assert.equal(C.normalizeData(JSON.parse(JSON.stringify(data))).students[0].grades[1], 0);
});
test('33–100 notlarının tamamı her iki performansa tam ve bağımsız dağıtılır', () => {
    for (const p of [1, 2]) {
        for (let target = 33; target <= 100; target++) {
            const { data, student } = fixture();
            for (const [key, values] of Object.entries(C.distribution(p, target))) values.forEach((degree, index) => C.setDegree(data, student.id, key, index, degree));
            assert.equal(C.performanceResult(data, student.id, p).final, target, `P${p} / ${target}`);
            assert.equal(C.performanceResult(data, student.id, p === 1 ? 2 : 1).final, null);
        }
    }
    for (const invalid of [0, 32, -1, 101, 80.5, NaN, Infinity, null]) assert.throws(() => C.distribution(1, invalid));
});
test('Mümkün olan tüm hedeflerde alt ölçeklerin 100’lük notları birbirinden farklıdır', () => {
    for (const [performance, minimum] of [[1, 35], [2, 36]]) {
        for (let target = minimum; target <= 98; target++) {
            const { data, student } = fixture();
            for (const [key, values] of Object.entries(C.distribution(performance, target))) {
                values.forEach((degree, index) => C.setDegree(data, student.id, key, index, degree));
            }
            const scores = C.keysFor(performance).map(key => C.rubricResult(data, student.id, key).score);
            assert.equal(new Set(scores).size, scores.length, `P${performance} / ${target}: ${scores}`);
            assert.equal(C.performanceResult(data, student.id, performance).final, target);
        }
    }
});
test('Sınır notlarında hedef korunur ve mümkün olan en çok farklı alt not kullanılır', () => {
    const cases = [[1,33,1], [1,34,3], [1,99,3], [1,100,2], [2,33,1], [2,34,2], [2,35,2], [2,99,2], [2,100,1]];
    for (const [performance, target, distinct] of cases) {
        const { data, student } = fixture();
        for (const [key, values] of Object.entries(C.distribution(performance, target))) {
            values.forEach((degree, index) => C.setDegree(data, student.id, key, index, degree));
        }
        const scores = C.keysFor(performance).map(key => C.rubricResult(data, student.id, key).score);
        assert.equal(new Set(scores).size, distinct, `P${performance} / ${target}`);
        assert.equal(C.performanceResult(data, student.id, performance).final, target);
    }
});
test('Doğrudan not, ölçek puanlarını değiştirmez; silinince hesaplanan not kullanılır', () => {
    const { data, student } = fixture();
    for (const key of C.keysFor(1)) applyRaw(data, student, key, C.RUBRICS[key].maxScore);
    student.grades[1] = 85;
    assert.equal(C.performanceResult(data, student.id, 1).final, 85);
    assert.equal(C.performanceResult(data, student.id, 1).calculated, 100);
    student.grades[1] = null;
    assert.equal(C.performanceResult(data, student.id, 1).final, 100);
});
test('Öğrenci silme ve sıralama kalan puanları yanlış öğrenciye taşımaz', () => {
    const { data, student } = fixture();
    const second = C.newStudent('102', 'İkinci Deneme'); data.students.push(second);
    C.setDegree(data, second.id, 'tema1_konusma', 0, 2);
    C.removeStudent(data, student.id);
    assert.equal(data.students[0].id, second.id);
    assert.equal(C.rubricResult(data, second.id, 'tema1_konusma').raw, 2);
});
test('Öğrenci düzenleme kimliği, notları ve ölçek puanlarını korur', () => {
    const { data, student } = fixture();
    const second = C.newStudent('102', 'İkinci Öğrenci'); data.students.push(second);
    student.grades[1] = 84;
    C.setDegree(data, student.id, 'tema1_konusma', 0, 3);
    data.drafts[1] = { [student.id]: true };
    const originalId = student.id;

    C.updateStudent(data, student.id, { no: '201', name: '  Düzenlenen Öğrenci  ' });

    assert.equal(student.id, originalId);
    assert.equal(student.no, '201');
    assert.equal(student.name, 'Düzenlenen Öğrenci');
    assert.equal(student.grades[1], 84);
    assert.equal(C.rubricResult(data, student.id, 'tema1_konusma').raw, 3);
    assert.equal(data.drafts[1][student.id], true);
    assert.throws(() => C.updateStudent(data, student.id, { no: '102', name: 'Başka Öğrenci' }), /zaten listede/);
    assert.throws(() => C.updateStudent(data, student.id, { no: '201', name: '   ' }), /boş bırakılamaz/);
});
test('Eski kayıtlar arşivlenir, 2. dönem notları 1. döneme aktarılmaz', () => {
    const original = { students: [{ no: '101', name: 'Önceki Öğrenci', targetScore: 75 }], scores: { ders_ici: { 0: { 0: 3 } }, tema3_konusma: { 0: { 0: 2 } } } };
    const data = C.migrateLegacy(original);
    assert.deepEqual(data.legacyArchive, original);
    assert.equal(data.students[0].name, original.students[0].name);
    assert.equal(C.performanceResult(data, data.students[0].id, 2).final, null);
    assert.deepEqual(C.normalizeData(JSON.parse(JSON.stringify(data))).legacyArchive, original);
});
test('Kayıt doğrulaması geçersiz puan ve yinelenen kimlikleri reddeder', () => {
    const { data, student } = fixture();
    C.setDegree(data, student.id, 'tema1_konusma', 0, 3);
    assert.deepEqual(C.normalizeData(data).scores.tema1_konusma[student.id], { 0: 3 });
    assert.throws(() => C.setDegree(data, student.id, 'tema1_konusma', 0, 0));
    student.grades[1] = 101; assert.throws(() => C.normalizeData(data));
    student.grades[1] = null; data.students.push(student); assert.throws(() => C.normalizeData(data));
});
test('Excel ve düz metin öğrenci listeleri ile başlıklar ayrıştırılır', () => {
    const parsed = C.parseStudents('Öğrenci No\tAd Soyad\n1\t101\tDeneme Öğrenci\n102 İkinci Öğrenci\n103;Üçüncü Öğrenci');
    assert.deepEqual(parsed.students, [{ no: '101', name: 'Deneme Öğrenci' }, { no: '102', name: 'İkinci Öğrenci' }, { no: '103', name: 'Üçüncü Öğrenci' }]);
    assert.equal(parsed.skipped, 1);
});
