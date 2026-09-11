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

    function normalizeData(input) {
        if (!input || input.version !== 2 || !Array.isArray(input.students) || !input.scores || typeof input.scores !== 'object') throw new Error('Geçerli bir Ölçek Sistemi yedeği seçin.');
        const data = newData();
        const ids = new Set();
        data.students = input.students.map(item => {
            if (!item || typeof item.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(item.id) || ['__proto__', 'constructor', 'prototype'].includes(item.id) || ids.has(item.id) || typeof item.name !== 'string' || typeof item.no !== 'string') throw new Error('Yedekteki öğrenci bilgileri geçersiz veya yinelenmiş.');
            ids.add(item.id);
            for (const p of [1, 2]) if (item.grades?.[p] != null && !validGrade(item.grades[p])) throw new Error('Yedekte 0–100 aralığı dışında bir not var.');
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

    // Find valid rubric totals whose Excel-weighted result rounds to the target.
    // Deterministic, no random criteria and no invented 0-point degree.
    const distributionCache = new Map();
    function distribution(performance, target) {
        if (!validGrade(target) || target < 33) throw new Error('1–3 dereceli ölçeklerde en düşük hesaplanan not 33’tür. 0–32 arası notlar doğrudan kaydedilebilir; ölçütlere dağıtılamaz.');
        const cacheKey = `${performance}:${target}`;
        if (distributionCache.has(cacheKey)) return distributionCache.get(cacheKey);
        const keys = keysFor(performance);
        if (!keys.length) throw new Error('Geçersiz performans.');
        let states = new Map([[0, { cost: 0, totals: [] }]]);
        for (const key of keys) {
            const rubric = RUBRICS[key];
            const next = new Map();
            for (const [sum, state] of states) {
                for (let raw = rubric.criteria.length; raw <= rubric.maxScore; raw++) {
                    const score = Math.round(raw / rubric.maxScore * 100);
                    const total = sum + score * rubric.weight;
                    const cost = state.cost + (score - target) ** 2;
                    if (!next.has(total) || cost < next.get(total).cost) next.set(total, { cost, totals: [...state.totals, raw] });
                }
            }
            states = next;
        }
        const matching = [...states].filter(([sum]) => Math.round(sum / 100) === target)
            .sort((a, b) => a[1].cost - b[1].cost || Math.abs(a[0] - target * 100) - Math.abs(b[0] - target * 100));
        if (!matching.length) throw new Error('Bu not 1–3 dereceleriyle tam olarak oluşturulamıyor. Doğrudan not olarak kaydedebilirsiniz.');
        const result = {};
        keys.forEach((key, index) => {
            const count = RUBRICS[key].criteria.length;
            const raw = matching[0][1].totals[index];
            const base = Math.floor(raw / count);
            result[key] = Array.from({ length: count }, (_, i) => base + (i < raw % count ? 1 : 0));
        });
        distributionCache.set(cacheKey, result);
        return result;
    }

    const api = { RUBRICS, STORAGE_KEY, LEGACY_KEY, keysFor, validGrade, validDegree, newStudent, newData,
        rubricResult, performanceResult, setDegree, removeStudent, normalizeData, migrateLegacy, parseStudents, distribution };
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.OlcekCore = api;
})(typeof window === 'undefined' ? this : window);
