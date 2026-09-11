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
        const breakdown = C.keysFor(rubric.performance).map(rKey => {
            const s = C.rubricResult(data, student.id, rKey);
            return `<span>${esc(R[rKey].title)} (%${R[rKey].weight}): ${s.complete ? fmt(s.score) : 'Eksik'}</span>`;
        }).join('');
        return `<article class="report-page${rubric.criteria.length > 16 ? ' report-long' : ''}">
            ${header(data, `${rubric.performance}. Performans · ${rubric.title}`)}
            <h2 class="report-subtitle">Dereceli Puanlama Ölçeği</h2>
            <div class="report-student"><span>Öğrenci: <b>${text(student.name)}</b></span><span>No: ${text(student.no)}</span><span>Sınıf / şube: ${text(data.metadata.className)}</span></div>
            ${book}<p class="report-legend">1 = Geliştirilebilir · 2 = Orta · 3 = İyi. İşaretlenmeyen ölçütler değerlendirilmemiştir.</p>
            <table class="report-table"><colgroup><col style="width:5%"><col style="width:67%"><col style="width:7%"><col style="width:7%"><col style="width:7%"><col style="width:7%"></colgroup>
            <thead><tr><th>No</th><th>Ölçüt ve açıklama</th><th>1</th><th>2</th><th>3</th><th>Puan</th></tr></thead><tbody>${rows}</tbody></table>
            <div class="report-totals"><span>Ham puan: <b>${result.raw} / ${rubric.maxScore}</b></span><span>${result.complete ? '100’lük puan' : 'Geçici 100’lük puan'}: <b>${fmt(result.score)}</b></span><span>Tamamlanan ölçüt: <b>${result.entered} / ${result.count}</b></span></div>
            <div class="report-breakdown">${breakdown}</div>
            <p>Hesaplama: her ölçeğin (ham puanı / en yüksek puanı × 100) tam sayıya yuvarlanır, sonra yukarıdaki ağırlıklar uygulanır.</p>
            <p class="report-result">${rubric.performance}. performans ağırlıklı sonucu: <b>${fmt(performance.raw)}</b> · Tam sayı not: <b>${fmt(performance.calculated)}</b>${performance.manual ? ` · Doğrudan girilen not: <b>${performance.final}</b>` : ''}</p>
            ${!performance.complete ? '<p class="report-note">Eksik ölçütler nedeniyle performansın ölçek hesabı tamamlanmamıştır.</p>' : ''}
            ${data.drafts[rubric.performance]?.[student.id] ? '<p class="report-note">Bu dereceler girilen nottan oluşturulmuş taslaktır; öğretmen tarafından kontrol edilmelidir.</p>' : ''}
            ${signatures(data)}
        </article>`;
    }
    function summaryPage(data, students) {
        const rows = students.map((student, index) => {
            const one = C.performanceResult(data, student.id, 1);
            const two = C.performanceResult(data, student.id, 2);
            const grade = result => `${fmt(result.final)}${result.manual ? ' *' : ''}`;
            return `<tr><td>${index + 1}</td><td>${esc(student.no)}</td><td class="report-description">${esc(student.name)}</td><td>${grade(one)}</td><td>${grade(two)}</td></tr>`;
        }).join('');
        return `<article class="report-page summary-page">${header(data, '1. ve 2. Performans Not Çizelgesi')}
            <p>Sınıf / şube: ${text(data.metadata.className)} · Öğrenci sayısı: ${students.length}</p>
            <table class="report-table"><thead><tr><th>Sıra</th><th>No</th><th>Ad soyad</th><th>1. Performans</th><th>2. Performans</th></tr></thead><tbody>${rows}</tbody></table>
            <p>1. performans: 1. tema konuşma %25, 2. tema konuşma %25, 1. tema yazma %25, 2. tema yazma %25.</p>
            <p>2. performans: 1. tema kitap %33, 2. tema kitap %33, ders içi %34.</p>
            <p>* Doğrudan girilen not. — Not girilmemiş veya ölçekler eksik. Ölçek notları, Excel ağırlıklı sonucunun tam sayıya yuvarlanmış halidir.</p>
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
        const pages = kind === 'summary' ? summaryPage(data, students) : students.map(student => keys.map(key => rubricPage(data, student, key)).join('')).join('');
        preview.innerHTML = `<div class="print-toolbar"><button type="button" class="button" id="closePreview">← Geri dön</button><span>Yazdırma önizlemesi · A4${kind === 'rubrics' ? ` · ${students.length * keys.length} ölçek` : ''}</span><button type="button" class="button primary" id="printDocument">Yazdır / PDF kaydet</button></div><div class="report-pages">${pages}</div>`;
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
