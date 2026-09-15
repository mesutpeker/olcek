(function (root) {
    'use strict';
    const RUBRICS = typeof module === 'object' && module.exports ? require('./rubrics.js') : root.OlcekRubrics;
    const STORAGE_KEY = 'olcek_app_data_v2';
    const LEGACY_KEY = 'olcek_app_data_v1';
    const keysFor = performance => Object.keys(RUBRICS).filter(key => RUBRICS[key].performance === Number(performance));
    const validGrade = value => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100;
    const validDegree = value => Number.isInteger(value) && value >= 1 && value <= 3;
    const uid = () => 's_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
    const newStudent = (no = '', name = '') => ({ id: uid(), no, name, grades: { 1: null, 2: null } });
    const newData = () => ({ version: 2, students: [], scores: {}, drafts: {}, metadata: { school: '', year: '', className: '9', teacher: '', book1: '', book2: '' } });

    function rubricResult(data, studentId, key) {
        const rubric = RUBRICS[key];
        const scores = data.scores[key]?.[studentId] || {};
        const values = rubric.criteria.map((_, index) => scores[index]);
        const entered = values.filter(validDegree).length;
        const raw = values.reduce((sum, value) => sum + (validDegree(value) ? value : 0), 0);
        // Excel ROUND(raw / max * 100, 0). Missing criteria never form a completed grade.
        return { raw, entered, count: values.length, complete: entered === values.length, score: entered ? Math.round(raw / rubric.maxScore * 100) : null };
    }

    function performanceResult(data, studentId, performance) {
        const keys = keysFor(performance);
        const results = keys.map(key => rubricResult(data, studentId, key));
        const complete = results.every(result => result.complete);
        // Integer hundredths preserve the Excel weighted sum exactly.
        const weighted = results.reduce((sum, result, index) => sum + (result.score ?? 0) * RUBRICS[keys[index]].weight, 0);
        const raw = complete ? weighted / 100 : null;
        const calculated = raw === null ? null : Math.round(raw);
        const student = data.students.find(item => item.id === studentId);
        const manual = student?.grades?.[performance];
        return { raw, calculated, final: validGrade(manual) ? manual : calculated, manual: validGrade(manual), complete,
            completed: results.filter(result => result.complete).length, total: keys.length };
    }

    function setDegree(data, studentId, key, index, degree) {
        if (!RUBRICS[key] || !data.students.some(s => s.id === studentId) || !Number.isInteger(index) || index < 0 || index >= RUBRICS[key].criteria.length) throw new Error('Geçersiz ölçüt.');
        if (degree !== null && !validDegree(degree)) throw new Error('Derece 1, 2 veya 3 olmalıdır.');
        data.scores[key] ||= {};
        data.scores[key][studentId] ||= {};
        if (degree === null) delete data.scores[key][studentId][index];
        else data.scores[key][studentId][index] = degree;
    }

    function removeStudent(data, id) {
        data.students = data.students.filter(student => student.id !== id);
        for (const entries of Object.values(data.scores)) delete entries[id];
        for (const entries of Object.values(data.drafts)) delete entries[id];
    }

    function updateStudent(data, id, { no = '', name = '' }) {
        const student = data.students.find(item => item.id === id);
        const normalizedNo = String(no).trim();
        const normalizedName = String(name).trim();
        if (!student) throw new Error('Öğrenci bulunamadı.');
        if (!normalizedName) throw new Error('Öğrenci adı soyadı boş bırakılamaz.');
        if (normalizedNo && data.students.some(item => item.id !== id && item.no === normalizedNo)) {
            throw new Error('Bu öğrenci numarası zaten listede.');
        }
        student.no = normalizedNo;
        student.name = normalizedName;
        return student;
    }

    function normalizeData(input) {
        if (!input || input.version !== 2 || !Array.isArray(input.students) || !input.scores || typeof input.scores !== 'object') throw new Error('Ölçek Sistemi kaydı geçersiz.');
        const data = newData();
        const ids = new Set();
        data.students = input.students.map(item => {
            if (!item || typeof item.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(item.id) || ['__proto__', 'constructor', 'prototype'].includes(item.id) || ids.has(item.id) || typeof item.name !== 'string' || typeof item.no !== 'string') throw new Error('Kayıttaki öğrenci bilgileri geçersiz veya yinelenmiş.');
            ids.add(item.id);
            for (const p of [1, 2]) if (item.grades?.[p] != null && !validGrade(item.grades[p])) throw new Error('Kayıtta 0–100 aralığı dışında bir not var.');
            return { id: item.id, no: item.no, name: item.name, grades: { 1: item.grades?.[1] ?? null, 2: item.grades?.[2] ?? null } };
        });
        for (const key of Object.keys(RUBRICS)) {
            data.scores[key] = {};
            for (const student of data.students) {
                const values = input.scores[key]?.[student.id];
                if (values == null) continue;
                for (const [index, degree] of Object.entries(values)) setDegree(data, student.id, key, Number(index), degree);
            }
        }
        for (const key of Object.keys(data.metadata)) if (typeof input.metadata?.[key] === 'string') data.metadata[key] = input.metadata[key];
        for (const p of [1, 2]) {
            data.drafts[p] = {};
            for (const student of data.students) if (input.drafts?.[p]?.[student.id] === true) data.drafts[p][student.id] = true;
        }
        if (input.legacyArchive) data.legacyArchive = input.legacyArchive;
        return data;
    }

    function migrateLegacy(legacy) {
        if (!legacy || !Array.isArray(legacy.students) || !legacy.scores || typeof legacy.scores !== 'object') throw new Error('Önceki kayıt okunamadı.');
        const data = newData();
        data.students = legacy.students.map(student => newStudent(String(student.no ?? ''), String(student.name ?? '')));
        // Term 2 has different criteria. Preserve the original, never relabel its grades.
        data.legacyArchive = legacy;
        return data;
    }

    function parseStudents(text) {
        const students = [];
        let skipped = 0;
        for (const line of text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)) {
            let parts = line.split(/\t|;/).map(part => part.trim());
            if (parts.length >= 3 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) parts = parts.slice(1);
            let no, name;
            if (parts.length >= 2) [no, name] = parts;
            else { const match = line.match(/^(\d+)\s+(.+)$/); if (match) [, no, name] = match; }
            if (no && /^\d+$/.test(no) && name && /\p{L}/u.test(name)) students.push({ no, name });
            else skipped++;
        }
        return { students, skipped };
    }

    // Enumerate valid totals once per performance. Prefer the greatest number of
    // distinct 100-point rubric grades, then keep them as close to the target as
    // possible. Keeping only one partial result per sum would lose distinct solutions.
    const distributionCache = new Map();
    function distributionOptions(performance) {
        const keys = keysFor(performance);
        if (!keys.length) throw new Error('Geçersiz performans.');
        const candidates = keys.map(key => {
            const rubric = RUBRICS[key];
            return Array.from({ length: rubric.maxScore - rubric.criteria.length + 1 }, (_, index) => {
                const raw = rubric.criteria.length + index;
                const score = Math.round(raw / rubric.maxScore * 100);
                return { raw, score, weighted: score * rubric.weight };
            });
        });
        const bestByTarget = new Map();
        const totals = [];
        const scores = [];
        function visit(index, weighted, distinct) {
            if (index === keys.length) {
                const target = Math.round(weighted / 100);
                const cost = scores.reduce((sum, score) => sum + (score - target) ** 2, 0);
                const distance = Math.abs(weighted - target * 100);
                const best = bestByTarget.get(target);
                if (!best || distinct > best.distinct || (distinct === best.distinct &&
                    (cost < best.cost || (cost === best.cost && distance < best.distance)))) {
                    bestByTarget.set(target, { distinct, cost, distance, totals: [...totals] });
                }
                return;
            }
            for (const candidate of candidates[index]) {
                const isNew = !scores.includes(candidate.score);
                scores.push(candidate.score);
                totals.push(candidate.raw);
                visit(index + 1, weighted + candidate.weighted, distinct + Number(isNew));
                scores.pop();
                totals.pop();
            }
        }
        visit(0, 0, 0);
        return bestByTarget;
    }

    function distribution(performance, target) {
        if (!validGrade(target) || target < 33) throw new Error('1–3 dereceli ölçeklerde en düşük hesaplanan not 33’tür. 0–32 arası notlar doğrudan kaydedilebilir; ölçütlere dağıtılamaz.');
        performance = Number(performance);
        const keys = keysFor(performance);
        if (!distributionCache.has(performance)) distributionCache.set(performance, distributionOptions(performance));
        const allocation = distributionCache.get(performance).get(target);
        if (!allocation) throw new Error('Bu not 1–3 dereceleriyle tam olarak oluşturulamıyor. Doğrudan not olarak kaydedebilirsiniz.');
        const result = {};
        keys.forEach((key, index) => {
            const count = RUBRICS[key].criteria.length;
            const raw = allocation.totals[index];
            const base = Math.floor(raw / count);
            result[key] = Array.from({ length: count }, (_, i) => base + (i < raw % count ? 1 : 0));
        });
        return result;
    }

    const api = { RUBRICS, STORAGE_KEY, LEGACY_KEY, keysFor, validGrade, validDegree, newStudent, newData,
        rubricResult, performanceResult, setDegree, removeStudent, updateStudent, normalizeData, migrateLegacy, parseStudents, distribution };
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.OlcekCore = api;
})(typeof window === 'undefined' ? this : window);
