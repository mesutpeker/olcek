/* UI only. Definitions, calculations and printing live in their own files. */
(function () {
    'use strict';
    const C = window.OlcekCore;
    const R = C.RUBRICS;
    const $ = selector => document.querySelector(selector);
    let data = C.newData();
    let storageBlocked = false;
    let currentPage = 'grades';
    let selectedId = null;
    let selectedPerformance = 1;
    let selectedRubric = C.keysFor(1)[0];
    let search = '';
    let toastTimer;
    const fmt = value => value == null ? '—' : value.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
    const studentName = student => student.name || 'Adı girilmemiş öğrenci';

    function el(tag, attrs = {}, children = []) {
        const node = document.createElement(tag);
        for (const [key, value] of Object.entries(attrs)) {
            if (key === 'className') node.className = value;
            else if (key === 'text') node.textContent = value;
            else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
            else if (key === 'disabled') node.disabled = value;
            else node.setAttribute(key, value);
        }
        for (const child of children) if (child != null) node.append(child);
        return node;
    }
    const button = (text, action, className = 'button', attrs = {}) => el('button', { type: 'button', className, text, onClick: action, ...attrs });
    const field = (label, input) => el('label', { className: 'field' }, [el('span', { text: label }), input]);
    function toast(message) {
        clearTimeout(toastTimer);
        $('#toast').textContent = message;
        $('#toast').hidden = false;
        toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
    }
    function storageError(message) {
        $('#storageAlert').hidden = false;
        $('#storageAlert').textContent = message;
        $('#saveStatus').textContent = 'Kaydedilemedi';
    }
    function save() {
        if (storageBlocked) return false;
        try {
            localStorage.setItem(C.STORAGE_KEY, JSON.stringify(data));
            $('#saveStatus').textContent = 'Kaydedildi · bu tarayıcıda';
            return true;
        } catch (error) {
            storageError('Değişiklikler tarayıcıya kaydedilemiyor. Tarayıcınızın bu site için depolamaya izin verdiğini ve yeterli boş alan bulunduğunu kontrol edin.');
            return false;
        }
    }
    function load() {
        try {
            const saved = localStorage.getItem(C.STORAGE_KEY);
            if (saved) data = C.normalizeData(JSON.parse(saved));
            else {
                const old = localStorage.getItem(C.LEGACY_KEY);
                if (old) {
                    data = C.migrateLegacy(JSON.parse(old));
                    save();
                    toast('Öğrenci listesi aktarıldı. Önceki 2. dönem puanları arşivde saklanıyor.');
                }
            }
        } catch (error) {
            storageBlocked = true;
            storageError('Kayıt okunamadığı için mevcut verinin üzerine yazılmadı. Kayıt sorunu çözülene kadar değişiklikler kaydedilemez.');
        }
    }
    function dialog(title, content, actions = []) {
        $('#dialogBody').replaceChildren(el('div', { className: 'dialog-heading' }, [
            el('h2', { text: title }), button('×', () => $('#dialog').close(), 'icon-button', { 'aria-label': 'Pencereyi kapat' })
        ]), content, el('div', { className: 'dialog-actions' }, actions));
        if (!$('#dialog').open) $('#dialog').showModal();
    }
    function confirmAction(title, message, action, label = 'Uygula') {
        dialog(title, el('p', { text: message }), [button('Vazgeç', () => $('#dialog').close()), button(label, () => { $('#dialog').close(); action(); }, 'button primary')]);
    }
    function heading(title, description, actions = []) {
        return el('div', { className: 'page-heading' }, [el('div', {}, [el('h1', { text: title }), description ? el('p', { className: 'muted', text: description }) : null]), actions.length ? el('div', { className: 'actions' }, actions) : null]);
    }
    function go(page) {
        currentPage = page;
        document.querySelectorAll('[data-page]').forEach(node => {
            if (node.dataset.page === page) node.setAttribute('aria-current', 'page');
            else node.removeAttribute('aria-current');
        });
        render();
        window.scrollTo(0, 0);
    }
    function studentActions() {
        return [button('+ Öğrenci ekle', () => editStudent(), 'button primary'), button('Excel’den toplu ekle', importStudents)];
    }
    function emptyState() {
        const steps = ['Öğrenci ekle', 'Notu gir ve dağıt', 'Yazdır'];
        return el('section', { className: 'empty-state card' }, [
            el('h2', { text: 'İlk öğrencinizi ekleyin' }),
            el('div', { className: 'actions' }, studentActions()),
            el('ol', { className: 'quick-steps', 'aria-label': 'Kullanım sırası' }, steps.map((text, index) => el('li', {}, [el('span', { className: 'step-number', text: index + 1, 'aria-hidden': 'true' }), el('span', { text })])))
        ]);
    }
    function gradeHelp() {
        const weights = el('div', { className: 'weight-cards' });
        [1, 2].forEach(p => weights.append(el('section', { className: 'weight-card' }, [
            el('h3', { text: `${p}. Performans` }),
            el('ul', { className: 'weight-tags' }, C.keysFor(p).map(key => el('li', { text: `${R[key].title} · %${R[key].weight}` })))
        ])));
        return el('details', { className: 'grade-help card' }, [el('summary', { text: 'Hesaplama ve kullanım' }), el('div', { className: 'grade-help-content' }, [
            el('p', { text: '0–100 arasında not girin. “Notu dağıt”, bu notu ölçeklere uygular; “Ölçeği aç” ile ölçütleri değiştirebilirsiniz.' }),
            el('p', { text: 'Enter ile sıradaki öğrenciye geçin. Not alanını boş bırakırsanız tamamlanan ölçeklerin sonucu kullanılır.' }),
            weights,
            el('p', { text: 'Alt ölçek puanları önce 100 üzerinden yuvarlanır, ardından bu oranlarla performans notu hesaplanır. Dağıtılan ölçütleri yazdırmadan önce kontrol edin.' })
        ])]);
    }
    function render() {
        if (!data.students.some(s => s.id === selectedId)) selectedId = data.students[0]?.id ?? null;
        $('#main').replaceChildren();
        if (currentPage === 'students') renderStudents();
        else if (currentPage === 'rubrics') renderRubrics();
        else if (currentPage === 'class') renderClassInfo();
        else renderGrades();
    }
    function matchingStudents() {
        const q = search.toLocaleLowerCase('tr-TR');
        return data.students.filter(s => `${s.no} ${s.name}`.toLocaleLowerCase('tr-TR').includes(q));
    }
    function searchBox(onInput) {
        return el('input', { type: 'search', value: search, className: 'search-input', placeholder: 'Öğrenci adı veya numarası ara', 'aria-label': 'Öğrenci ara', onInput: event => { search = event.target.value; onInput(); } });
    }
    function renderGrades() {
        const hasStudents = data.students.length > 0;
        $('#main').append(heading('Performans notları', hasStudents ? 'Notu girin → Notu dağıt → Yazdır' : '', hasStudents ? [...studentActions(), button('Sınıf notlarını yazdır', () => showPrint('summary'))] : []));
        if (!hasStudents) { $('#main').append(emptyState(), gradeHelp()); return; }
        const card = el('section', { className: 'card grade-card' });
        card.append(el('div', { className: 'card-toolbar' }, [el('h2', { text: `Öğrenci listesi · ${data.students.length}` }), searchBox(renderGradeRows)]), el('div', { className: 'grade-table-header', 'aria-hidden': 'true' }, [el('span', { text: 'ÖĞRENCİ' }), el('span', { text: '1. PERFORMANS' }), el('span', { text: '2. PERFORMANS' }), el('span', { text: 'ÖLÇEK ÇIKTISI' })]), el('div', { id: 'gradeRows' }));
        $('#main').append(card, gradeHelp());
        renderGradeRows();
    }
    function renderGradeRows() {
        const rows = $('#gradeRows');
        rows.replaceChildren();
        const students = matchingStudents();
        if (!students.length) { rows.append(el('p', { className: 'no-results', text: 'Aramanızla eşleşen öğrenci yok.' })); return; }
        students.forEach(student => {
            const row = el('article', { className: 'grade-row', 'aria-label': studentName(student) });
            row.append(el('div', { className: 'student-identity' }, [el('span', { className: 'student-avatar', text: String(data.students.indexOf(student) + 1).padStart(2, '0') }), el('div', {}, [el('strong', { text: studentName(student) }), el('span', { className: 'muted', text: `No ${student.no || '—'} · ${data.metadata.className || '9. sınıf'}` })])]));
            [1, 2].forEach(p => row.append(gradeCell(student, p)));
            row.append(button('Yazdır', () => printChoice(student), 'button quiet print-student', { 'aria-label': `${studentName(student)} ölçeklerini yazdır` }));
            rows.append(row);
        });
    }
    function gradeCell(student, p) {
        const result = C.performanceResult(data, student.id, p);
        const cell = el('div', { className: 'grade-cell' });
        const note = el('div', { className: 'grade-note' });
        const input = el('input', { type: 'number', min: 0, max: 100, step: 1, inputmode: 'numeric', className: 'grade-input', value: student.grades[p] ?? '', placeholder: result.calculated ?? '—', 'aria-label': `${studentName(student)} ${p}. performans notu`, 'data-grade-student': student.id, 'data-performance': p });
        function updateNote() {
            const value = C.performanceResult(data, student.id, p);
            const label = value.manual ? `Girilen not: ${value.final}` : value.complete ? `Ölçekten: ${value.calculated}` : 'Not girilmedi';
            note.textContent = `${label} · ${value.completed}/${value.total} ölçek`;
            input.placeholder = value.calculated ?? '—';
            input.classList.toggle('filled', value.final !== null);
        }
        input.addEventListener('input', () => {
            const isEmpty = input.value === '' && !input.validity.badInput;
            const value = isEmpty ? null : Number(input.value);
            const valid = isEmpty || (input.validity.valid && C.validGrade(value));
            input.setAttribute('aria-invalid', String(!valid));
            if (!valid) { note.textContent = '0–100 arasında tam sayı girin.'; return; }
            student.grades[p] = value;
            save();
            updateNote();
        });
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (!input.validity.valid) { input.reportValidity(); return; }
                const fields = [...document.querySelectorAll(`[data-performance="${p}"][data-grade-student]`)];
                const next = fields[fields.indexOf(input) + 1];
                if (next) { next.focus(); next.select(); }
                else input.blur();
            }
            if (event.key === 'Escape') { input.value = student.grades[p] ?? ''; input.setAttribute('aria-invalid', 'false'); updateNote(); }
        });
        cell.append(el('span', { className: 'mobile-label', text: `${p}. Performans` }), el('div', { className: 'grade-entry' }, [input, button('Notu dağıt', () => {
            if (!input.validity.valid) { input.reportValidity(); return; }
            applyDistribution(student, p);
        }, 'button small')]), el('div', { className: 'grade-detail' }, [note, button('Ölçeği aç', () => openRubric(student.id, p), 'text-button')]));
        updateNote();
        return cell;
    }
    function applyDistribution(student, p) {
        const target = student.grades[p] ?? C.performanceResult(data, student.id, p).calculated;
        if (target === null) { toast('Önce performans notunu girin.'); return; }
        let allocation;
        try { allocation = C.distribution(p, target); } catch (error) { toast(error.message); return; }
        const apply = () => {
            for (const [key, values] of Object.entries(allocation)) values.forEach((degree, index) => C.setDegree(data, student.id, key, index, degree));
            data.drafts[p] ||= {};
            data.drafts[p][student.id] = true;
            // The resulting grade now follows the rubric, including later edits.
            student.grades[p] = null;
            save(); render(); toast(`${p}. performans için ${target} puanlık ölçek taslağı oluşturuldu.`);
        };
        if (C.keysFor(p).some(key => C.rubricResult(data, student.id, key).entered > 0)) {
            confirmAction('Ölçüt puanları güncellensin mi?', `${studentName(student)} için ${p}. performansın mevcut ölçüt puanları, ${target} notuna göre yeniden oluşturulacak. Diğer performansın puanları korunur.`, apply);
        } else apply();
    }
    function openRubric(id, p) {
        selectedId = id; selectedPerformance = p; selectedRubric = C.keysFor(p)[0]; go('rubrics');
    }
    function renderRubrics() {
        $('#main').append(heading('Dereceli puanlama ölçekleri', 'Öğrenciyi ve ölçeği seçin, her ölçüt için 1–3 arasında bir derece işaretleyin.'));
        if (!selectedId) { $('#main').append(emptyState()); return; }
        const student = data.students.find(s => s.id === selectedId);
        const toolbar = el('section', { className: 'rubric-controls card' });
        const studentSelect = el('select', { id: 'studentSelect', onChange: event => { selectedId = event.target.value; render(); } }, data.students.map(s => el('option', { value: s.id, text: `${s.no || '—'} · ${studentName(s)}` })));
        studentSelect.value = selectedId;
        const rubricSelect = el('select', { id: 'rubricSelect', onChange: event => { selectedRubric = event.target.value; render(); } }, C.keysFor(selectedPerformance).map(key => el('option', { value: key, text: `${R[key].title} (%${R[key].weight})` })));
        rubricSelect.value = selectedRubric;
        const segmented = el('div', { className: 'segmented', role: 'group', 'aria-label': 'Performans seçimi' }, [1, 2].map(p => button(`${p}. Performans`, () => { selectedPerformance = p; selectedRubric = C.keysFor(p)[0]; render(); }, p === selectedPerformance ? 'active' : '', { 'aria-pressed': p === selectedPerformance })));
        const index = data.students.findIndex(s => s.id === selectedId);
        toolbar.append(el('div', { className: 'student-picker' }, [field('Öğrenci', studentSelect), el('div', { className: 'actions' }, [button('←', () => { selectedId = data.students[index - 1].id; render(); }, 'icon-button', { disabled: index === 0, 'aria-label': 'Önceki öğrenci' }), button('→', () => { selectedId = data.students[index + 1].id; render(); }, 'icon-button', { disabled: index === data.students.length - 1, 'aria-label': 'Sonraki öğrenci' })])]), el('div', { className: 'rubric-picker' }, [segmented, field('Tema ölçeği', rubricSelect)]));
        $('#main').append(toolbar);
        const panel = el('section', { className: 'card rubric-card' });
        panel.append(el('div', { className: 'rubric-heading' }, [el('div', {}, [el('h2', { text: R[selectedRubric].title }), el('p', { className: 'muted', text: `${R[selectedRubric].criteria.length} ölçüt · En çok ${R[selectedRubric].maxScore} puan · ${selectedPerformance}. performansa etkisi %${R[selectedRubric].weight}` })]), button('Bu ölçeği yazdır', () => showPrint('rubrics', [student], [selectedRubric]))]));
        panel.append(el('div', { id: 'rubricSummary', className: 'rubric-summary', 'aria-live': 'polite' }));
        panel.append(el('div', { className: 'rubric-legend' }, [el('span', { text: '1 Geliştirilebilir' }), el('span', { text: '2 Orta' }), el('span', { text: '3 İyi' }), el('span', { text: 'Seçili dereceye tekrar basarak temizleyin.' })]));
        const criteria = el('div', { className: 'criteria' });
        R[selectedRubric].criteria.forEach((criterion, index) => {
            const row = el('div', { className: 'criterion-row', 'data-criterion-row': index });
            const descriptionId = `criterion-${index}`;
            const buttons = el('div', { className: 'degree-buttons', role: 'group', 'aria-labelledby': descriptionId });
            [1, 2, 3].forEach(degree => buttons.append(button(String(degree), () => {
                const old = data.scores[selectedRubric]?.[selectedId]?.[index];
                C.setDegree(data, selectedId, selectedRubric, index, old === degree ? null : degree);
                save(); updateRubricSummary(); updateDegrees(row, index);
            }, 'degree-button', { 'aria-label': `${degree} puan · ${['', 'Geliştirilebilir', 'Orta', 'İyi'][degree]}`, 'data-degree': degree })));
            row.append(el('span', { className: 'criterion-number', text: String(index + 1).padStart(2, '0') }), el('div', { className: 'criterion-description', id: descriptionId }, [el('span', { className: 'criterion-group', text: criterion.group }), el('p', { text: criterion.text })]), buttons);
            criteria.append(row); updateDegrees(row, index);
        });
        panel.append(criteria, el('div', { className: 'rubric-bottom' }, [el('span', { className: 'muted', text: 'Puanlar işaretledikçe kaydedilir.' }), button('Sonraki öğrenci →', () => { selectedId = data.students[index + 1].id; render(); window.scrollTo(0, 0); }, 'button primary', { disabled: index === data.students.length - 1 })]));
        $('#main').append(panel);
        updateRubricSummary();
    }
    function updateDegrees(row, index) {
        const current = data.scores[selectedRubric]?.[selectedId]?.[index];
        row.querySelectorAll('[data-degree]').forEach(node => {
            const active = Number(node.dataset.degree) === current;
            node.classList.toggle('selected', active); node.setAttribute('aria-pressed', String(active));
        });
    }
    function updateRubricSummary() {
        const score = C.rubricResult(data, selectedId, selectedRubric);
        const performance = C.performanceResult(data, selectedId, selectedPerformance);
        const student = data.students.find(s => s.id === selectedId);
        const summary = $('#rubricSummary');
        summary.replaceChildren(el('div', {}, [el('span', { text: 'İşaretlenen ölçüt' }), el('strong', { text: `${score.entered} / ${score.count}` })]), el('div', {}, [el('span', { text: 'Ham puan' }), el('strong', { text: `${score.raw} / ${R[selectedRubric].maxScore}` })]), el('div', {}, [el('span', { text: score.complete ? '100’lük puan' : 'Geçici 100’lük puan' }), el('strong', { text: fmt(score.score) })]), el('div', {}, [el('span', { text: `${selectedPerformance}. performans notu` }), el('strong', { text: fmt(performance.final) })]));
        const old = $('#rubricNotice'); if (old) old.remove();
        const notice = el('div', { id: 'rubricNotice', className: 'rubric-notice' });
        notice.append(el('span', { text: performance.complete ? `Excel ağırlıklı sonuç: ${fmt(performance.raw)} · Tam sayı not: ${performance.calculated}` : `${performance.completed}/${performance.total} ölçek tamamlandı. Kesin hesaplama için tüm ölçütleri puanlayın.` }));
        if (performance.manual) notice.append(el('span', { text: ` Doğrudan girilen ${performance.final} notu kullanılıyor.` }), button('Ölçek sonucunu kullan', () => { student.grades[selectedPerformance] = null; save(); updateRubricSummary(); }, 'text-button'));
        if (data.drafts[selectedPerformance]?.[selectedId]) notice.append(el('span', { text: ' Dereceler, girilen nottan oluşturulmuş bir taslaktır.' }));
        summary.after(notice);
    }
    function renderStudents() {
        $('#main').append(heading('Öğrenci listesi', '', data.students.length ? studentActions() : []));
        if (!data.students.length) { $('#main').append(emptyState()); return; }
        const list = el('section', { className: 'card roster' });
        data.students.forEach(student => list.append(el('div', { className: 'roster-row' }, [el('span', { className: 'roster-no', text: student.no || '—' }), el('strong', { text: studentName(student) }), el('div', { className: 'actions' }, [button('Düzenle', () => editStudent(student), 'button small'), button('Sil', () => confirmAction('Öğrenciyi sil', `${studentName(student)} ve bu öğrenciye ait iki performansın puanları silinecek.`, () => { C.removeStudent(data, student.id); save(); render(); }, 'Öğrenciyi sil'), 'button small danger')])])));
        $('#main').append(list);
    }
    function editStudent(student) {
        const no = el('input', { value: student?.no || '', inputmode: 'numeric', maxLength: 40 });
        const name = el('input', { value: student?.name || '', required: '', maxLength: 200 });
        const form = el('form', { className: 'form-grid' }, [field('Öğrenci numarası', no), field('Ad soyad', name)]);
        const submit = () => {
            if (!name.value.trim()) { name.reportValidity(); return; }
            if (no.value.trim() && data.students.some(s => s.id !== student?.id && s.no === no.value.trim())) { toast('Bu öğrenci numarası zaten listede.'); return; }
            if (student) { student.no = no.value.trim(); student.name = name.value.trim(); }
            else data.students.push(C.newStudent(no.value.trim(), name.value.trim()));
            save(); $('#dialog').close(); render();
        };
        form.addEventListener('submit', event => { event.preventDefault(); submit(); });
        dialog(student ? 'Öğrenciyi düzenle' : 'Öğrenci ekle', form, [button('Kaydet', submit, 'button primary')]);
        name.focus();
    }
    function importStudents() {
        const textarea = el('textarea', { rows: 9, placeholder: '101\tÖrnek Öğrenci\n102\tÖrnek Öğrenci', 'aria-label': 'Toplu öğrenci listesi' });
        const preview = el('p', { className: 'hint', text: 'Excel’den numara ve ad soyad sütunlarını kopyalayıp yapıştırın. Sıra no / öğrenci no / ad soyad biçimi de desteklenir.' });
        const content = el('div', {}, [textarea, preview]);
        textarea.addEventListener('input', () => { const result = C.parseStudents(textarea.value); preview.textContent = `${result.students.length} öğrenci bulundu. ${result.skipped} başlık veya geçersiz satır atlanacak.`; });
        dialog('Toplu öğrenci ekle', content, [button('Listeye ekle', () => {
            const parsed = C.parseStudents(textarea.value); let added = 0; let duplicates = 0;
            const numbers = new Set(data.students.map(s => s.no).filter(Boolean));
            for (const student of parsed.students) {
                if (numbers.has(student.no)) { duplicates++; continue; }
                numbers.add(student.no); data.students.push(C.newStudent(student.no, student.name)); added++;
            }
            if (!added) { toast(duplicates ? 'Bu öğrenciler zaten listede.' : 'Numara ve ad soyad içeren bir liste girin.'); return; }
            save(); $('#dialog').close(); render(); toast(`${added} öğrenci eklendi.${duplicates ? ` ${duplicates} yinelenen numara atlandı.` : ''}`);
        }, 'button primary')]);
    }
    function renderClassInfo() {
        const grid = el('div', { className: 'form-grid' });
        const labels = { school: 'Okul adı', year: 'Eğitim öğretim yılı', className: 'Sınıf / şube', teacher: 'Öğretmen', book1: '1. tema kitabının adı', book2: '2. tema kitabının adı' };
        Object.entries(labels).forEach(([key, label]) => grid.append(field(label, el('input', { value: data.metadata[key], placeholder: key === 'year' ? 'Örn. 2026–2027' : '', maxLength: 200, onInput: event => { data.metadata[key] = event.target.value; save(); } }))));
        $('#main').append(
            heading('Sınıf bilgileri', 'Yazdırma çıktılarında kullanılacak bilgileri girin.'),
            el('section', { className: 'card class-info-card', 'aria-label': 'Sınıf bilgileri' }, [grid]),
            el('p', { className: 'hint', text: 'Değişiklikler otomatik kaydedilir.' })
        );
    }
    function printChoice(student) {
        const select = el('select', { 'aria-label': 'Yazdırılacak ölçekler' }, [el('option', { value: 'all', text: '1. ve 2. performans · tüm ölçekler' }), el('option', { value: '1', text: 'Yalnızca 1. performans ölçekleri' }), el('option', { value: '2', text: 'Yalnızca 2. performans ölçekleri' }), ...Object.keys(R).map(key => el('option', { value: key, text: R[key].title }))]);
        dialog(`${studentName(student)} · Ölçek çıktısı`, field('Yazdırılacak ölçekler', select), [button('Önizlemeyi aç', () => {
            const value = select.value;
            const keys = value === 'all' ? Object.keys(R) : ['1', '2'].includes(value) ? C.keysFor(Number(value)) : [value];
            $('#dialog').close(); showPrint('rubrics', [student], keys);
        }, 'button primary')]);
    }
    function showPrint(kind, students = data.students, keys = Object.keys(R)) {
        if (!students.length) { toast('Önce öğrenci ekleyin.'); return; }
        window.OlcekPrint.show(data, { kind, students, keys });
    }
    document.querySelectorAll('[data-page]').forEach(node => node.addEventListener('click', () => go(node.dataset.page)));
    load(); render();
})();
