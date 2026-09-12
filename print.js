(function () {
    'use strict';
    const C = window.OlcekCore;
    const R = C.RUBRICS;
    const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const fmt = value => value == null ? '—' : value.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
    const text = value => esc(value || '................................');
    let previousFocus;
    let previousTitle;
    let previousScroll;
    function header(data, title) {
        return `<header class="report-header"><p>${text(data.metadata.school)}</p><p>${text(data.metadata.year)} Eğitim Öğretim Yılı</p><h1>${esc(title)}</h1><p>9. Sınıf · Türk Dili ve Edebiyatı · 1. Dönem</p></header>`;
    }
    function signatures(data) {
        return `<footer class="report-signatures"><span>Tarih: ${esc(new Date().toLocaleDateString('tr-TR'))}</span><span>Öğretmen: ${text(data.metadata.teacher)}<br>İmza: ................................</span></footer>`;
    }
    function rubricPage(data, student, key) {
        const rubric = R[key];
        const result = C.rubricResult(data, student.id, key);
        const performance = C.performanceResult(data, student.id, rubric.performance);
        const rows = rubric.criteria.map((criterion, index) => {
            const degree = data.scores[key]?.[student.id]?.[index];
            return `<tr><td>${index + 1}</td><td class="report-description"><b>${esc(criterion.group)} · </b>${esc(criterion.text)}</td>${[1, 2, 3].map(value => `<td class="report-degree${value === degree ? ' marked' : ''}">${value === degree ? '●' : ''}</td>`).join('')}<td>${degree ?? '—'}</td></tr>`;
        }).join('');
        const book = key.includes('kitap') ? `<p>Kitabın adı: ${text(data.metadata[key === 'tema1_kitap' ? 'book1' : 'book2'])}</p>` : '';
        return `<article class="report-page${rubric.criteria.length > 16 ? ' report-long' : ''}">
            ${header(data, `${rubric.performance}. Performans · ${rubric.title}`)}
            <h2 class="report-subtitle">Dereceli Puanlama Ölçeği</h2>
            <div class="report-student"><span>Öğrenci: <b>${text(student.name)}</b></span><span>No: ${text(student.no)}</span><span>Sınıf / şube: ${text(data.metadata.className)}</span></div>
            ${book}<p class="report-legend">1 = Geliştirilebilir · 2 = Orta · 3 = İyi. İşaretlenmeyen ölçütler değerlendirilmemiştir.</p>
            <table class="report-table"><colgroup><col style="width:5%"><col style="width:67%"><col style="width:7%"><col style="width:7%"><col style="width:7%"><col style="width:7%"></colgroup>
            <thead><tr><th>No</th><th>Ölçüt ve açıklama</th><th>1</th><th>2</th><th>3</th><th>Puan</th></tr></thead><tbody>${rows}</tbody></table>
            <div class="report-totals"><span>Ham puan: <b>${result.raw} / ${rubric.maxScore}</b></span><span>${result.complete ? '100’lük puan' : 'Geçici 100’lük puan'}: <b>${fmt(result.score)}</b></span><span>Tamamlanan ölçüt: <b>${result.entered} / ${result.count}</b></span></div>
            <p class="report-result">${rubric.performance}. performans ağırlıklı sonucu: <b>${fmt(performance.raw)}</b> · Tam sayı not: <b>${fmt(performance.calculated)}</b>${performance.manual ? ` · Doğrudan girilen not: <b>${performance.final}</b>` : ''}</p>
            ${!performance.complete ? '<p class="report-note">Eksik ölçütler nedeniyle performansın ölçek hesabı tamamlanmamıştır.</p>' : ''}
            ${signatures(data)}
        </article>`;
    }
    function summaryPage(data, students, performance) {
        const keys = C.keysFor(performance);
        const headings = keys.map(key => `<th scope="col">${esc(R[key].title)}<br>(%${R[key].weight})</th>`).join('');
        const componentWidth = 48 / keys.length;
        const columns = `<col style="width:5%"><col style="width:8%"><col style="width:27%">${keys.map(() => `<col style="width:${componentWidth}%">`).join('')}<col style="width:12%">`;
        const rows = students.map((student, index) => {
            const result = C.performanceResult(data, student.id, performance);
            const components = keys.map(key => {
                const score = C.rubricResult(data, student.id, key);
                return `<td>${fmt(score.score)}${score.entered && !score.complete ? ' †' : ''}</td>`;
            }).join('');
            const weighted = result.raw !== null && (result.manual || result.raw !== result.final)
                ? `<small class="summary-weighted">Hesap: ${fmt(result.raw)}</small>` : '';
            return `<tr><td>${index + 1}</td><td>${esc(student.no)}</td><td class="report-description">${esc(student.name)}</td>${components}<td class="summary-final"><strong>${fmt(result.final)}${result.manual ? ' *' : ''}</strong>${weighted}</td></tr>`;
        }).join('');
        return `<article class="report-page summary-page" aria-label="${performance}. performans not çizelgesi">${header(data, `1. Dönem ${performance}. Performans Puanı`)}
            <p>Sınıf / şube: ${text(data.metadata.className)} · Öğrenci sayısı: ${students.length}</p>
            <table class="report-table"><colgroup>${columns}</colgroup><thead><tr><th scope="col">Sıra no.</th><th scope="col">Öğrenci no.</th><th scope="col">Öğrencinin adı soyadı</th>${headings}<th scope="col">${performance}. Performans puanı</th></tr></thead><tbody>${rows}</tbody></table>
            <p>Alt notlar 100 üzerindendir. Her ölçeğin ham puanı önce 100’lük sisteme yuvarlanır; sütun başlıklarındaki oranlarla ağırlıklı toplamı hesaplanır.</p>
            <p>Performans puanı, ağırlıklı toplamın tam sayıya yuvarlanmış halidir. “Hesap” Excel’deki ondalıklı ağırlıklı sonucu gösterir.</p>
            <p>* Doğrudan girilen not. † Eksik ölçütün geçici puanı. — Henüz not girilmedi veya hesaplama tamamlanmadı.</p>
            ${signatures(data)}</article>`;
    }
    function close() {
        document.getElementById('printPreview').hidden = true;
        document.getElementById('appShell').hidden = false;
        document.body.classList.remove('preview-open');
        document.title = previousTitle;
        window.scrollTo(0, previousScroll);
        if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    }
    function show(data, { kind, students, keys }) {
        previousFocus = document.activeElement; previousTitle = document.title; previousScroll = window.scrollY;
        const preview = document.getElementById('printPreview');
        const pages = kind === 'summary' ? [1, 2].map(performance => summaryPage(data, students, performance)).join('') : students.map(student => keys.map(key => rubricPage(data, student, key)).join('')).join('');
        preview.innerHTML = `<div class="print-toolbar"><button type="button" class="button" id="closePreview">← Geri dön</button><span>Yazdırma önizlemesi · A4${kind === 'rubrics' ? ` · ${students.length * keys.length} ölçek` : ' · 1. ve 2. performans ayrı sayfalarda'}</span><button type="button" class="button primary" id="printDocument">Yazdır / PDF kaydet</button></div><div class="report-pages">${pages}</div>`;
        document.getElementById('appShell').hidden = true;
        document.body.classList.add('preview-open'); preview.hidden = false;
        document.title = kind === 'summary' ? '9. Sınıf 1. Dönem Performans Notları' : `${students[0].name || 'Öğrenci'} - Dereceli Puanlama Ölçekleri`;
        document.getElementById('closePreview').addEventListener('click', close);
        document.getElementById('printDocument').addEventListener('click', () => window.print());
        window.scrollTo(0, 0); document.getElementById('printDocument').focus({ preventScroll: true });
    }
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && document.body.classList.contains('preview-open')) close(); });
    window.OlcekPrint = { show };
})();
