// =============================================
// 9. Sınıf 2. Dönem Ölçekler - Web Uygulaması
// Karaman Mesleki ve Teknik Anadolu Lisesi
// =============================================

(function () {
    'use strict';

    // ==================
    // RUBRIC DEFINITIONS
    // ==================
    const RUBRICS = {
        tema3_konusma: {
            key: 'tema3_konusma',
            title: '3. Tema Konuşma Performans Ölçeği',
            pageTitle: '3. Tema Konuşma',
            maxScore: 51,
            weight: 15,
            criteria: [
                {
                    group: 'Organizasyon',
                    items: ['Sunuma etkili bir giriş yaparak sunumu sürdürmüş ve etkili bir şekilde tamamlamıştır.']
                },
                {
                    group: 'İçerik',
                    items: [
                        'Seçtiği hikâyenin mekânını başarılı bir şekilde yansıtmıştır.',
                        'Seçtiği hikâye mekânını kendi çevresiyle birlikte yeniden başarılı bir şekilde kurgulamıştır.',
                        'Sunumunda düşünceleri ana fikir etrafında ifade etmiştir.',
                        'Fikirlerini tekrara düşmeden sunmuştur.'
                    ]
                },
                {
                    group: 'Bilgi toplama',
                    items: [
                        'Sunumu bağlama uygun görsel ve işitsel araçlarla zenginleştirmiştir.',
                        'Fikrî mülkiyet haklarına dikkat ederek güvenilir bilgi kaynaklarından yararlanmıştır.'
                    ]
                },
                {
                    group: 'Söz varlığı',
                    items: [
                        'Bağlama uygun sözcüklerle sunumunu zenginleştirmiştir.',
                        'Dilimize henüz yerleşmemiş yabancı kelimelerin yerine Türkçe kelimeleri kullanmıştır.'
                    ]
                },
                {
                    group: 'Akıcılık ve anlatım',
                    items: [
                        'İşitilebilir bir ses tonuyla konuşmuştur.',
                        'Gereksiz ses tekrarına düşmeden sunumu akıcı bir şekilde gerçekleştirmiştir.',
                        'Sunumu vurgu ve tonlamaya dikkat ederek gerçekleştirmiştir.'
                    ]
                },
                {
                    group: 'Beden dili',
                    items: ['Sunumda jest ve mimikleri etkili kullanmış, dinleyicilerle yeterli göz teması kurmuştur.']
                },
                {
                    group: 'Slayt gösterisi',
                    items: [
                        'Slaytı bağlama uygun görsel ve işitsel araçlarla zenginleştirmiştir.',
                        'Slaytta kısa ve anlamlı ifadeler kullanmıştır.',
                        'Slaytta gözü yormayan arka plan, yazı karakteri ve renkler kullanmıştır.'
                    ]
                },
                {
                    group: 'Zaman yönetimi',
                    items: ['Sunumda süreyi etkin bir şekilde kullanmıştır.']
                }
            ]
        },
        tema3_yazma: {
            key: 'tema3_yazma',
            title: '3. Tema Yazma Performans Ölçeği',
            pageTitle: '3. Tema Yazma',
            maxScore: 30,
            weight: 15,
            criteria: [
                { group: 'Organizasyon', items: ['İnfografik metinde bilgileri etkili bir şekilde düzenlemiştir.'] },
                { group: 'İçerik', items: ['Belgeselin içeriğini infografik metinde doğru ve tam olarak yansıtmıştır.'] },
                { group: 'Bilgi Toplama', items: ['Belgeselde verilen bilgileri araştırma sonuçlarıyla zenginleştirmiştir.'] },
                { group: 'Söz Varlığı', items: ['İnfografik metinde deyim, atasözü ve kalıplaşmış ifadelerden yararlanarak anlatımı zenginleştirmiştir.'] },
                { group: 'Görsel Kullanımı', items: ['İnfografik metni görsellerle zenginleştirmiştir.'] },
                { group: 'Yazım ve Noktalama', items: ['İnfografik metinde yazım ve noktalama kurallarına uymuştur.'] },
                {
                    group: 'Özgünlük ve Güvenilirlik',
                    items: [
                        'İnfografik metinde güvenilir bilgi kaynaklarından yararlanmıştır.',
                        'Kendi yorumunu katarak infografik metinde özgün bir içerik oluşturmuştur.'
                    ]
                },
                {
                    group: 'Üslup',
                    items: [
                        'İnfografik metnin anlatımında belgesel metnin üslubunu korumuştur.',
                        'İnfografik metni oluştururken benzetme, karşılaştırma, örnekleme gibi düşünceyi geliştirme yollarından yararlanmıştır.'
                    ]
                }
            ]
        },
        tema3_kitap: {
            key: 'tema3_kitap',
            title: '3. Tema Kitap Okuma Değerlendirme Ölçeği',
            pageTitle: '3. Tema Kitap',
            maxScore: 39,
            weight: 10,
            headerInfo: '2025-2026 EĞİTİM ÖĞRETİM YILI KARAMAN MTAL KİTAP OKUMA GÖREVİ DEĞERLENDİRME ÖLÇEĞİ\n3.TEMA',
            criteria: [
                {
                    group: 'Kitap Okuma',
                    items: [
                        'Okuma öncesinde metnin başlığını, görsellerini ve afişini inceler.',
                        'Romanı / eseri okuma amacını belirler.',
                        'Okuduğu metni özetler.',
                        'Okuduğu metnin iletisini belirler.',
                        'Okuduğu metindeki kurgu ve gerçek unsurları belirleyerek metne katkısını tartışır.',
                        'Okuduğu metinde ilk defa karşılaştığı bilgilerin doğruluğunu araştırır.',
                        'Okuduğu metinlerdeki tutarsızlıkları fark eder.',
                        'Okuduğu metnin içeriği ile daha önce karşılaştığı metinleri çeşitli açılardan karşılaştırır.',
                        'Metnin yazarının yerine kendini koyarak bu metnin daha iyi nasıl olabileceğini düşünür.',
                        'Okuduğu metni arkadaşlarıyla tartışmak için argümanlar (çıkarım, kanıt) üretir.',
                        'Okuduğu metnin entelektüel merakına ve araştırmacı kişiliğine katkısını değerlendirir.',
                        'Okuduğu metin hakkında öğretmenin ve arkadaşlarının fikirlerini öğrendikten sonra kendi görüşleriyle karşılaştırır.',
                        'Okuduğu metinde geçen çatışmalara alternatif çözümler üretir. / Okuduğu metin öğretici metinse örnek metin oluşturur.'
                    ]
                }
            ]
        },
        tema4_konusma: {
            key: 'tema4_konusma',
            title: '4. Tema Konuşma Performans Ölçeği',
            pageTitle: '4. Tema Konuşma',
            maxScore: 39,
            weight: 15,
            criteria: [
                { group: 'Planlama', items: ['Sunuma etkili bir giriş yapmış, konuşmayı sürdürmüş, etkili bir şekilde tamamlamıştır.'] },
                {
                    group: 'Düşünsel süreçleri kontrol etme',
                    items: [
                        'Sunumda sosyal medya dilinde yapılan hatalara uygun örnekler vermiştir.',
                        'Düşüncelerini konuşmanın ana fikri etrafında ifade etmiştir.',
                        'Düşüncelerini tekrara düşmeden sunmuştur.'
                    ]
                },
                {
                    group: 'Söz varlığı',
                    items: [
                        'Sunumda görüşleri destekleyen bağlama uygun sözcükler kullanmıştır.',
                        'Dilimize henüz yerleşmemiş yabancı kelimelerin yerine Türkçe kelimeleri kullanmıştır.'
                    ]
                },
                {
                    group: 'Akıcılık',
                    items: [
                        'İşitilebilir ses tonuyla konuşmuştur.',
                        'Sunumu gereksiz ses tekrarına düşmeden akıcı bir şekilde gerçekleştirmiştir.',
                        'Sunumda vurgu ve tonlamaya dikkat etmiştir.'
                    ]
                },
                {
                    group: 'Beden dili',
                    items: [
                        'Sunumda jest ve mimikleri etkili kullanmıştır.',
                        'Dinleyicilerle yeterli düzeyde göz teması kurmuştur.'
                    ]
                },
                { group: 'İş birliği', items: ['Sunumda takım içindeki sorumluluğu yerine getirmiştir.'] },
                { group: 'Zaman yönetimi', items: ['Sunumda süreyi etkili ve verimli bir şekilde kullanmıştır.'] }
            ]
        },
        tema4_yazma: {
            key: 'tema4_yazma',
            title: '4. Tema Yazma Performans Ölçeği',
            pageTitle: '4. Tema Yazma',
            maxScore: 21,
            weight: 15,
            criteria: [
                { group: 'Planlama', items: ['Yazılı ürüne etkili bir giriş yapmış, yazıyı sürdürmüş ve etkili bir şekilde tamamlamıştır.'] },
                {
                    group: 'Düşünsel süreçleri kontrol etme',
                    items: [
                        'Otobiyografide yer alan olayları akışına uygun ifade etmiştir.',
                        'Yazılı ürünü tekrara düşmeden tamamlamıştır.'
                    ]
                },
                {
                    group: 'Söz Varlığı',
                    items: [
                        'Yazılı üründe görüşlerini destekleyen bağlama uygun sözcükler kullanmıştır.',
                        'Dilimize henüz yerleşmemiş yabancı kelimelerin yerine Türkçe kelimeleri kullanmıştır.'
                    ]
                },
                { group: 'Akıcılık', items: ['Bölümler arası geçişleri başarıyla yapmış ve yazılı ürünün kolay okunmasını sağlamıştır.'] },
                { group: 'Yazım ve noktalama', items: ['Yazılı üründe yazım kurallarına uymuş ve noktalama işaretlerini doğru kullanmıştır.'] }
            ]
        },
        tema4_kitap: {
            key: 'tema4_kitap',
            title: '4. Tema Kitap Okuma Değerlendirme Ölçeği',
            pageTitle: '4. Tema Kitap',
            maxScore: 39,
            weight: 10,
            headerInfo: '2025-2026 EĞİTİM ÖĞRETİM YILI KARAMAN MTAL KİTAP OKUMA GÖREVİ DEĞERLENDİRME ÖLÇEĞİ\n4.TEMA',
            criteria: [
                {
                    group: 'Kitap Okuma',
                    items: [
                        'Okuma öncesinde metnin başlığını, görsellerini ve afişini inceler.',
                        'Romanı / eseri okuma amacını belirler.',
                        'Okuduğu metni özetler.',
                        'Okuduğu metnin iletisini belirler.',
                        'Okuduğu metindeki kurgu ve gerçek unsurları belirleyerek metne katkısını tartışır.',
                        'Okuduğu metinde ilk defa karşılaştığı bilgilerin doğruluğunu araştırır.',
                        'Okuduğu metinlerdeki tutarsızlıkları fark eder.',
                        'Okuduğu metnin içeriği ile daha önce karşılaştığı metinleri çeşitli açılardan karşılaştırır.',
                        'Metnin yazarının yerine kendini koyarak bu metnin daha iyi nasıl olabileceğini düşünür.',
                        'Okuduğu metni arkadaşlarıyla tartışmak için argümanlar (çıkarım, kanıt) üretir.',
                        'Okuduğu metnin entelektüel merakına ve araştırmacı kişiliğine katkısını değerlendirir.',
                        'Okuduğu metin hakkında öğretmenin ve arkadaşlarının fikirlerini öğrendikten sonra kendi görüşleriyle karşılaştırır.',
                        'Okuduğu metinde geçen çatışmalara alternatif çözümler üretir. / Okuduğu metin öğretici metinse örnek metin oluşturur.'
                    ]
                }
            ]
        },
        ders_ici: {
            key: 'ders_ici',
            title: 'Ders İçi Davranış ve Gözlem/İzleme Performans Ölçeği',
            pageTitle: 'Ders İçi Performans',
            maxScore: 30,
            weight: 10,
            criteria: [
                {
                    group: 'Ders İçi Davranış',
                    items: [
                        'Derse vaktinde gelme',
                        'Sınıf kurallarına uyma',
                        'Derse hazırlıklı ve planlı gelme',
                        'Ders için gerekli araç gereçleri getirerek, düzenli ve temiz kullanma',
                        'Türkçe\'yi doğru ve düzgün konuşma',
                        'Derse karşı olumlu davranış geliştirme ve aktif katılma',
                        'Arkadaşlarıyla işbirliği yapma (Grup çalışmalarına katılma)',
                        'Soru ve önerilere yaratıcı cevap verme',
                        'Sınıf etkinliklerine katılma',
                        'Verilen ödevleri (görevleri) zamanında yapma'
                    ]
                }
            ]
        },
        film: {
            key: 'film',
            title: 'Film Değerlendirme Ölçeği',
            pageTitle: 'Film Değerlendirme',
            maxScore: 39,
            weight: 10,
            headerInfo: '2025-2026 EĞİTİM ÖĞRETİM YILI KARAMAN MTAL FİLM DEĞERLENDİRME ÖLÇEĞİ',
            criteria: [
                {
                    group: 'Film Değerlendirme',
                    items: [
                        'Okuma öncesinde metnin başlığını, görsellerini ve afişini inceler.',
                        'Romanı / eseri okuma amacını belirler.',
                        'Okuduğu metni özetler.',
                        'Okuduğu metnin iletisini belirler.',
                        'Okuduğu metindeki kurgu ve gerçek unsurları belirleyerek metne katkısını tartışır.',
                        'Okuduğu metinde ilk defa karşılaştığı bilgilerin doğruluğunu araştırır.',
                        'Okuduğu metinlerdeki tutarsızlıkları fark eder.',
                        'Okuduğu metnin içeriği ile daha önce karşılaştığı metinleri çeşitli açılardan karşılaştırır.',
                        'Metnin yazarının yerine kendini koyarak bu metnin daha iyi nasıl olabileceğini düşünür.',
                        'Okuduğu metni arkadaşlarıyla tartışmak için argümanlar (çıkarım, kanıt) üretir.',
                        'Okuduğu metnin entelektüel merakına ve araştırmacı kişiliğine katkısını değerlendirir.',
                        'Okuduğu metin hakkında öğretmenin ve arkadaşlarının fikirlerini öğrendikten sonra kendi görüşleriyle karşılaştırır.',
                        'Okuduğu metinde geçen çatışmalara alternatif çözümler üretir. / Okuduğu metin öğretici metinse örnek metin oluşturur.'
                    ]
                }
            ]
        }
    };

    // ==================
    // DATA STORE
    // ==================
    const STORAGE_KEY = 'olcek_app_data_v1';

    let appData = {
        students: [], // [{no:'', name:''}]
        scores: {}    // { rubricKey: { studentIndex: { criterionIndex: score } } }
    };

    function loadData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                appData = JSON.parse(saved);
            }
            // Ensure structure
            if (!appData.students) appData.students = [];
            if (!appData.scores) appData.scores = {};
        } catch (e) {
            console.error('Veri yükleme hatası:', e);
        }
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        } catch (e) {
            console.error('Veri kaydetme hatası:', e);
        }
    }

    function getScore(rubricKey, studentIndex, criterionIndex) {
        return appData.scores?.[rubricKey]?.[studentIndex]?.[criterionIndex] || 0;
    }

    function setScore(rubricKey, studentIndex, criterionIndex, value) {
        if (!appData.scores[rubricKey]) appData.scores[rubricKey] = {};
        if (!appData.scores[rubricKey][studentIndex]) appData.scores[rubricKey][studentIndex] = {};
        appData.scores[rubricKey][studentIndex][criterionIndex] = value;
        saveData();
    }

    // Calculate total raw score for a student in a rubric
    function getRubricTotal(rubricKey, studentIndex) {
        const rubric = RUBRICS[rubricKey];
        if (!rubric) return 0;
        let total = 0;
        let idx = 0;
        for (const group of rubric.criteria) {
            for (const item of group.items) {
                total += getScore(rubricKey, studentIndex, idx);
                idx++;
            }
        }
        return total;
    }

    // Convert to 100-point scale
    function getRubricScoreOutOf100(rubricKey, studentIndex) {
        const rubric = RUBRICS[rubricKey];
        if (!rubric) return 0;
        const total = getRubricTotal(rubricKey, studentIndex);
        return Math.round((total / rubric.maxScore) * 100);
    }

    function roundPerformanceScore(score) {
        return Math.round(score);
    }

    // Calculate final performance score before rounding
    function getFinalPerformanceRaw(studentIndex) {
        let total = 0;
        for (const key of Object.keys(RUBRICS)) {
            const rubric = RUBRICS[key];
            const score100 = getRubricScoreOutOf100(key, studentIndex);
            total += (score100 / 100) * rubric.weight;
        }
        return total;
    }

    // Calculate final performance score
    function getFinalPerformance(studentIndex) {
        return roundPerformanceScore(getFinalPerformanceRaw(studentIndex));
    }

    // Get criterion count for a rubric
    function getCriterionCount(rubricKey) {
        const rubric = RUBRICS[rubricKey];
        let count = 0;
        for (const group of rubric.criteria) {
            count += group.items.length;
        }
        return count;
    }

    // ==================
    // DOM HELPERS
    // ==================
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    function el(tag, attrs = {}, children = []) {
        const elem = document.createElement(tag);
        for (const [k, v] of Object.entries(attrs)) {
            if (k === 'className') elem.className = v;
            else if (k === 'textContent') elem.textContent = v;
            else if (k === 'innerHTML') elem.innerHTML = v;
            else if (k.startsWith('on')) elem.addEventListener(k.slice(2).toLowerCase(), v);
            else if (k === 'style' && typeof v === 'object') Object.assign(elem.style, v);
            else elem.setAttribute(k, v);
        }
        for (const child of children) {
            if (typeof child === 'string') elem.appendChild(document.createTextNode(child));
            else if (child) elem.appendChild(child);
        }
        return elem;
    }

    // ==================
    // TOAST
    // ==================
    function showToast(message, type = 'success') {
        const container = $('#toastContainer');
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        const toast = el('div', { className: `toast toast-${type}` }, [
            el('span', { className: 'toast-icon', textContent: icons[type] || '✅' }),
            el('span', { textContent: message })
        ]);
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ==================
    // SIDEBAR NAVIGATION
    // ==================
    let currentPage = 'ogrenci_bilgileri';
    let currentStudentIndex = 0;

    function initNavigation() {
        const sidebar = $('#sidebar');
        const hamburger = $('#hamburger');
        const sidebarClose = $('#sidebarClose');

        // Create overlay
        const overlay = el('div', { className: 'sidebar-overlay', id: 'sidebarOverlay' });
        document.body.appendChild(overlay);

        hamburger.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });

        function closeSidebar() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }

        sidebarClose.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);

        // Nav items
        $$('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    navigateTo(page);
                    closeSidebar();
                }
            });
        });

        // Save button
        $('#btnSaveAll').addEventListener('click', () => {
            saveData();
            showToast('Veriler başarıyla kaydedildi!');
        });

        // PDF Print button
        $('#btnPrintPDF').addEventListener('click', printPerformancePDF);
    }

    function navigateTo(page) {
        currentPage = page;
        $$('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = $(`.nav-item[data-page="${page}"]`);
        if (activeNav) activeNav.classList.add('active');

        renderPage();
    }

    function updateStudentCount() {
        const count = appData.students.length;
        $('#studentCount .count-text').textContent = `${count} Öğrenci`;
    }

    // ==================
    // PAGE RENDERERS
    // ==================
    function renderPage(preserveScroll) {
        const area = $('#contentArea');
        const scrollPos = area.scrollTop;
        area.innerHTML = '';
        if (!preserveScroll) area.scrollTop = 0;

        switch (currentPage) {
            case 'ogrenci_bilgileri':
                renderStudentPage(area);
                break;
            case 'performans_puani':
                renderPerformancePage(area);
                break;
            default:
                if (RUBRICS[currentPage]) {
                    renderRubricPage(area, currentPage);
                }
                break;
        }

        const rubric = RUBRICS[currentPage];
        const pageTitle = rubric ? rubric.pageTitle :
            currentPage === 'ogrenci_bilgileri' ? 'Öğrenci Bilgileri' :
                currentPage === 'performans_puani' ? '2. Dönem 2. Performans Puanı' : '';
        $('#pageTitle').textContent = pageTitle;

        updateStudentCount();

        if (preserveScroll) {
            area.scrollTop = scrollPos;
            setTimeout(() => { area.scrollTop = scrollPos; }, 0);
            setTimeout(() => { area.scrollTop = scrollPos; }, 50);
        }
    }

    // Update only score cells without full re-render (preserves scroll)
    function updatePerformanceInPlace() {
        const rubricOrder = [
            'tema3_konusma', 'tema4_konusma', 'tema3_yazma', 'tema4_yazma',
            'tema3_kitap', 'tema4_kitap', 'film', 'ders_ici'
        ];
        const tbody = document.querySelector('.perf-table tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        const finals = [];

        rows.forEach((row, i) => {
            if (i >= appData.students.length) return;
            const cells = row.querySelectorAll('td');
            // cells: 0=#, 1=no, 2=name, 3-10=scores, 11=final, 12=target
            rubricOrder.forEach((rKey, ri) => {
                const score = getRubricScoreOutOf100(rKey, i);
                const pill = cells[3 + ri]?.querySelector('.score-pill');
                if (pill) {
                    pill.textContent = String(score);
                    pill.className = `score-pill ${getScoreClass(score)}`;
                }
            });

            const finalScore = getFinalPerformance(i);
            finals.push(finalScore);
            const finalPill = cells[11]?.querySelector('.score-pill');
            if (finalPill) {
                finalPill.textContent = Math.round(finalScore).toString();
                finalPill.className = `score-pill ${getScoreClass(finalScore)}`;
            }
        });

        // Update stat cards
        const nonZero = finals.filter(f => f > 0);
        const statCards = document.querySelectorAll('.perf-stat-value');
        if (statCards.length >= 4) {
            const avg = nonZero.length > 0 ? (nonZero.reduce((a, b) => a + b, 0) / nonZero.length).toFixed(1) : '0';
            const max = nonZero.length > 0 ? Math.round(Math.max(...nonZero)).toString() : '0';
            const min = nonZero.length > 0 ? Math.round(Math.min(...nonZero)).toString() : '0';
            statCards[0].textContent = avg;
            statCards[1].textContent = max;
            statCards[2].textContent = min;
            statCards[3].textContent = String(nonZero.length);
        }
    }

    // ------ Student Info Page ------
    function renderStudentPage(area) {
        // Info banner
        const banner = el('div', { className: 'info-banner' }, [
            el('div', { className: 'info-banner-icon', textContent: '📋' }),
            el('div', { className: 'info-banner-content' }, [
                el('h3', { textContent: 'Öğrenci Bilgileri' }),
                el('p', {
                    textContent: 'Öğrenci numaralarını ve ad-soyad bilgilerini giriniz. ' +
                        'Girdiğiniz bilgiler tüm ölçek sayfalarında otomatik olarak görüntülenecektir. Maksimum 40 öğrenci eklenebilir.'
                })
            ])
        ]);
        area.appendChild(banner);

        // Table card
        const card = el('div', { className: 'card' });
        const header = el('div', { className: 'card-header' }, [
            el('h2', { textContent: 'Öğrenci Listesi' })
        ]);
        card.appendChild(header);

        const body = el('div', { className: 'card-body' });
        const table = el('table', { className: 'data-table', id: 'studentTable' });

        // thead
        const thead = el('thead');
        const headerRow = el('tr', {}, [
            el('th', { textContent: '#', style: { width: '50px' } }),
            el('th', { textContent: 'Öğrenci No.' }),
            el('th', { textContent: 'Öğrencinin Adı Soyadı' }),
            el('th', { textContent: '', style: { width: '48px' } })
        ]);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // tbody
        const tbody = el('tbody', { id: 'studentTbody' });
        appData.students.forEach((s, i) => {
            tbody.appendChild(createStudentRow(s, i));
        });
        table.appendChild(tbody);
        body.appendChild(table);
        card.appendChild(body);

        // Add student buttons
        if (appData.students.length < 40) {
            const addRow = el('div', { className: 'add-student-row' }, [
                el('button', {
                    className: 'btn-add-student',
                    id: 'btnAddStudent',
                    textContent: '+ Öğrenci Ekle',
                    onClick: () => {
                        addStudent();
                    }
                }),
                el('button', {
                    className: 'btn-add-student btn-bulk-import',
                    id: 'btnBulkImport',
                    textContent: '📋 Toplu Ekle',
                    onClick: () => {
                        showBulkImportModal();
                    }
                })
            ]);
            card.appendChild(addRow);
        }

        area.appendChild(card);
    }

    // ------ Bulk Import Modal ------
    function parseBulkStudentText(text) {
        const lines = text.split('\n');
        const students = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.includes('Öğrenci Not Bilgisi')) continue;

            const parts = trimmed.split(/\t/);
            if (parts.length >= 2) {
                const no = parts[0].trim();
                const name = parts[1].trim();
                // Valid: first part is a number, second part has at least 2 letters (actual name)
                if (/^\d+$/.test(no) && name && /[A-ZÇĞİÖŞÜa-zçğıöşü]{2,}/.test(name)) {
                    students.push({ no, name });
                }
            }
        }
        return students;
    }

    function showBulkImportModal() {
        // Remove existing modal if any
        const existing = $('#bulkImportModal');
        if (existing) existing.remove();

        const overlay = el('div', { className: 'modal-overlay', id: 'bulkImportModal' });

        const modal = el('div', { className: 'modal-card' });

        // Header
        const modalHeader = el('div', { className: 'modal-header' }, [
            el('div', { className: 'modal-header-text' }, [
                el('h2', { textContent: '📋 Toplu Öğrenci Ekle' }),
                el('p', { textContent: 'Okul sisteminden kopyaladığınız öğrenci listesini aşağıya yapıştırın.' })
            ]),
            el('button', {
                className: 'modal-close-btn',
                textContent: '✕',
                onClick: () => overlay.remove()
            })
        ]);
        modal.appendChild(modalHeader);

        // Body
        const modalBody = el('div', { className: 'modal-body' });

        const textarea = el('textarea', {
            className: 'bulk-textarea',
            id: 'bulkTextarea',
            placeholder: '322\tMEHDİ İŞLETEN\n346\tBİLAL KILINÇ\n...\n\nOkul sisteminden kopyaladığınız listeyi buraya yapıştırın.\nNumara ve ad soyad otomatik olarak ayrıştırılacaktır.',
            rows: '12'
        });
        modalBody.appendChild(textarea);

        // Preview area
        const previewArea = el('div', { className: 'bulk-preview', id: 'bulkPreview' });
        previewArea.style.display = 'none';
        modalBody.appendChild(previewArea);

        modal.appendChild(modalBody);

        // Footer
        const modalFooter = el('div', { className: 'modal-footer' });

        const previewBtn = el('button', {
            className: 'btn-modal btn-modal-secondary',
            textContent: '👁 Önizle',
            onClick: () => {
                const text = textarea.value;
                const parsed = parseBulkStudentText(text);
                const preview = $('#bulkPreview');
                if (parsed.length === 0) {
                    preview.innerHTML = '<div class="bulk-preview-empty">⚠️ Öğrenci bulunamadı. Listeyi doğru formatta yapıştırdığınızdan emin olun.</div>';
                    preview.style.display = 'block';
                    return;
                }

                let html = `<div class="bulk-preview-header">✅ ${parsed.length} öğrenci bulundu</div>`;
                html += '<div class="bulk-preview-list">';
                parsed.forEach((s, i) => {
                    html += `<div class="bulk-preview-item"><span class="bulk-preview-num">${i + 1}</span><span class="bulk-preview-no">${s.no}</span><span class="bulk-preview-name">${s.name}</span></div>`;
                });
                html += '</div>';
                preview.innerHTML = html;
                preview.style.display = 'block';
            }
        });

        const importBtn = el('button', {
            className: 'btn-modal btn-modal-primary',
            textContent: '✅ İçe Aktar',
            onClick: () => {
                const text = textarea.value;
                const parsed = parseBulkStudentText(text);
                if (parsed.length === 0) {
                    showToast('Öğrenci bulunamadı. Listeyi kontrol edin.', 'error');
                    return;
                }

                const maxAdd = 40 - appData.students.length;
                const toAdd = parsed.slice(0, maxAdd);

                for (const s of toAdd) {
                    appData.students.push({ no: s.no, name: s.name });
                }
                saveData();
                overlay.remove();
                renderPage();

                if (parsed.length > maxAdd) {
                    showToast(`${toAdd.length} öğrenci eklendi. ${parsed.length - maxAdd} öğrenci sınır aşımı nedeniyle eklenemedi.`, 'info');
                } else {
                    showToast(`${toAdd.length} öğrenci başarıyla eklendi!`, 'success');
                }
            }
        });

        const cancelBtn = el('button', {
            className: 'btn-modal btn-modal-secondary',
            textContent: 'İptal',
            onClick: () => overlay.remove()
        });

        modalFooter.appendChild(cancelBtn);
        modalFooter.appendChild(previewBtn);
        modalFooter.appendChild(importBtn);
        modal.appendChild(modalFooter);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        // Focus textarea
        setTimeout(() => textarea.focus(), 100);
    }

    function createStudentRow(student, index) {
        const tr = el('tr', {}, [
            el('td', {}, [el('span', { className: 'row-num', textContent: String(index + 1) })]),
            el('td', {}, [
                el('input', {
                    className: 'table-input',
                    type: 'text',
                    placeholder: 'Öğrenci no giriniz...',
                    value: student.no || '',
                    id: `student-no-${index}`,
                    onInput: (e) => {
                        appData.students[index].no = e.target.value;
                        saveData();
                    }
                })
            ]),
            el('td', {}, [
                el('input', {
                    className: 'table-input',
                    type: 'text',
                    placeholder: 'Ad Soyad giriniz...',
                    value: student.name || '',
                    id: `student-name-${index}`,
                    onInput: (e) => {
                        appData.students[index].name = e.target.value;
                        saveData();
                    }
                })
            ]),
            el('td', {}, [
                el('button', {
                    className: 'btn-remove-student',
                    textContent: '✕',
                    title: 'Öğrenciyi sil',
                    onClick: () => {
                        if (confirm(`${student.name || 'Bu öğrenci'}yi silmek istediğinize emin misiniz?`)) {
                            removeStudent(index);
                        }
                    }
                })
            ])
        ]);
        return tr;
    }

    function addStudent() {
        if (appData.students.length >= 40) {
            showToast('Maksimum 40 öğrenci eklenebilir.', 'error');
            return;
        }
        appData.students.push({ no: '', name: '' });
        saveData();
        renderPage();
        // Focus the new row
        setTimeout(() => {
            const lastNo = $(`#student-no-${appData.students.length - 1}`);
            if (lastNo) lastNo.focus();
        }, 50);
    }

    function removeStudent(index) {
        appData.students.splice(index, 1);
        // Also remove scores for this student and shift subsequent ones
        for (const rubricKey of Object.keys(appData.scores)) {
            const rubricScores = appData.scores[rubricKey];
            const newRubricScores = {};
            for (const [sIdx, data] of Object.entries(rubricScores)) {
                const si = parseInt(sIdx);
                if (si < index) {
                    newRubricScores[si] = data;
                } else if (si > index) {
                    newRubricScores[si - 1] = data;
                }
                // skip si === index (deleted)
            }
            appData.scores[rubricKey] = newRubricScores;
        }
        saveData();
        renderPage();
        showToast('Öğrenci silindi.', 'info');
    }

    // ------ Rubric Page ------
    function renderRubricPage(area, rubricKey) {
        const rubric = RUBRICS[rubricKey];

        // Info banner
        const notText = 'Ölçütleri karşılama değerleri: 3 puan → İyi, 2 puan → Orta, 1 puan → Geliştirilebilir. ' +
            'Her öğrenci için puanlama yapınız. Puanlar otomatik olarak toplanacaktır.';
        const banner = el('div', { className: 'info-banner' }, [
            el('div', { className: 'info-banner-icon', textContent: '📝' }),
            el('div', { className: 'info-banner-content' }, [
                el('h3', { textContent: rubric.title }),
                el('p', { textContent: notText })
            ])
        ]);
        area.appendChild(banner);

        if (appData.students.length === 0) {
            area.appendChild(el('div', { className: 'empty-state' }, [
                el('div', { className: 'empty-state-icon', textContent: '👤' }),
                el('div', { className: 'empty-state-text', textContent: 'Henüz öğrenci eklenmedi.' }),
                el('div', { className: 'empty-state-hint', textContent: 'Önce "Öğrenci Listesi" sayfasından öğrenci ekleyin.' })
            ]));
            return;
        }

        // Clamp current student index
        if (currentStudentIndex >= appData.students.length) currentStudentIndex = 0;

        // Student selector bar
        const headerBar = el('div', { className: 'rubric-header-bar' });
        const titleArea = el('div', { className: 'rubric-title-area' });
        const studentName = appData.students[currentStudentIndex]?.name || `Öğrenci ${currentStudentIndex + 1}`;
        titleArea.appendChild(el('h2', { textContent: studentName }));
        const score100 = getRubricScoreOutOf100(rubricKey, currentStudentIndex);
        titleArea.appendChild(el('p', { textContent: `100'lük puan: ${score100}` }));
        headerBar.appendChild(titleArea);

        const selectorArea = el('div', { className: 'student-selector' });
        selectorArea.appendChild(el('label', { textContent: 'Öğrenci:' }));

        const select = el('select', {
            className: 'student-select',
            id: 'rubricStudentSelect',
            onChange: (e) => {
                currentStudentIndex = parseInt(e.target.value);
                renderPage();
            }
        });
        appData.students.forEach((s, i) => {
            const opt = el('option', { value: String(i), textContent: `${i + 1}. ${s.name || 'İsimsiz'}` });
            if (i === currentStudentIndex) opt.selected = true;
            select.appendChild(opt);
        });
        selectorArea.appendChild(select);

        // Navigation arrows
        const navArrows = el('div', { className: 'student-nav-arrows' });
        const prevBtn = el('button', {
            className: 'student-nav-btn',
            textContent: '←',
            title: 'Önceki öğrenci',
            onClick: () => {
                if (currentStudentIndex > 0) {
                    currentStudentIndex--;
                    renderPage();
                }
            }
        });
        if (currentStudentIndex === 0) prevBtn.disabled = true;
        navArrows.appendChild(prevBtn);

        const nextBtn = el('button', {
            className: 'student-nav-btn',
            textContent: '→',
            title: 'Sonraki öğrenci',
            onClick: () => {
                if (currentStudentIndex < appData.students.length - 1) {
                    currentStudentIndex++;
                    renderPage();
                }
            }
        });
        if (currentStudentIndex === appData.students.length - 1) nextBtn.disabled = true;
        navArrows.appendChild(nextBtn);
        selectorArea.appendChild(navArrows);

        headerBar.appendChild(selectorArea);
        area.appendChild(headerBar);

        // Rubric card
        const rubricCard = el('div', { className: 'rubric-card' });
        const rubricTable = el('table', { className: 'rubric-table' });

        // Thead
        const thead = el('thead');
        thead.appendChild(el('tr', {}, [
            el('th', { textContent: 'Ölçüt', style: { width: '160px' } }),
            el('th', { textContent: 'Açıklama' }),
            el('th', { textContent: 'Puan', style: { width: '140px', textAlign: 'center' } })
        ]));
        rubricTable.appendChild(thead);

        // Tbody
        const tbody = el('tbody');
        let criterionIdx = 0;

        for (const group of rubric.criteria) {
            for (let j = 0; j < group.items.length; j++) {
                const cIdx = criterionIdx;
                const currentScore = getScore(rubricKey, currentStudentIndex, cIdx);

                const tr = el('tr');

                // Group label (only on first item of group)
                if (j === 0) {
                    const groupTd = el('td', {
                        className: 'criterion-group',
                    });
                    groupTd.textContent = group.group;
                    groupTd.rowSpan = group.items.length;
                    tr.appendChild(groupTd);
                }

                // Criterion description
                tr.appendChild(el('td', { className: 'criterion-detail', textContent: group.items[j] }));

                // Score buttons
                const scoreCell = el('td', { style: { textAlign: 'center' } });
                const btnsDiv = el('div', { className: 'score-buttons', style: { justifyContent: 'center' } });

                for (let s = 1; s <= 3; s++) {
                    const score = s;
                    const btn = el('button', {
                        className: `score-btn ${currentScore === score ? `selected-${score}` : ''}`,
                        textContent: String(score),
                        'data-criterion': String(cIdx),
                        'data-score': String(score),
                        onClick: () => {
                            // Toggle: click same score to deselect
                            if (getScore(rubricKey, currentStudentIndex, cIdx) === score) {
                                setScore(rubricKey, currentStudentIndex, cIdx, 0);
                            } else {
                                setScore(rubricKey, currentStudentIndex, cIdx, score);
                            }
                            renderPage();
                        }
                    });
                    btnsDiv.appendChild(btn);
                }
                scoreCell.appendChild(btnsDiv);
                tr.appendChild(scoreCell);

                tbody.appendChild(tr);
                criterionIdx++;
            }
        }

        rubricTable.appendChild(tbody);
        rubricCard.appendChild(rubricTable);

        // Score legend
        const legend = el('div', { className: 'score-legend' }, [
            el('div', { className: 'legend-item' }, [
                el('div', { className: 'legend-dot dot-1' }),
                el('span', { textContent: '1 = Geliştirilebilir' })
            ]),
            el('div', { className: 'legend-item' }, [
                el('div', { className: 'legend-dot dot-2' }),
                el('span', { textContent: '2 = Orta' })
            ]),
            el('div', { className: 'legend-item' }, [
                el('div', { className: 'legend-dot dot-3' }),
                el('span', { textContent: '3 = İyi' })
            ])
        ]);
        rubricCard.appendChild(legend);

        // Total row
        const rawTotal = getRubricTotal(rubricKey, currentStudentIndex);
        const totalDiv = el('div', { className: 'rubric-total' }, [
            el('span', { className: 'rubric-total-label', textContent: 'TOPLAM' }),
            el('div', {}, [
                el('span', { className: 'rubric-total-value', textContent: String(rawTotal) }),
                el('span', { className: 'rubric-total-max', textContent: ` / ${rubric.maxScore}` })
            ])
        ]);
        rubricCard.appendChild(totalDiv);

        area.appendChild(rubricCard);
    }

    // ------ Performance Page ------
    function renderPerformancePage(area) {
        // Info banner
        const banner = el('div', { className: 'info-banner' }, [
            el('div', { className: 'info-banner-icon', textContent: '🏆' }),
            el('div', { className: 'info-banner-content' }, [
                el('h3', { textContent: '2. Dönem 2. Performans Puanı' }),
                el('p', {
                    textContent: 'Bu sayfada atölye çalışmaları, kitap okuma performansı ve ders içi durum notlarının 100 üzerinden karşılığı verilmiştir. ' +
                        'Değişiklik için puanların bulunduğu sayfaya gidiniz.'
                })
            ])
        ]);
        area.appendChild(banner);

        if (appData.students.length === 0) {
            area.appendChild(el('div', { className: 'empty-state' }, [
                el('div', { className: 'empty-state-icon', textContent: '📊' }),
                el('div', { className: 'empty-state-text', textContent: 'Henüz öğrenci eklenmedi.' }),
                el('div', { className: 'empty-state-hint', textContent: 'Öğrenci ekledikten sonra performans puanları burada hesaplanacaktır.' })
            ]));
            return;
        }

        // Stats grid
        const statsContainer = el('div', { className: 'performance-grid' });
        
        // Calculate stats
        const finals = appData.students.map((_, i) => getFinalPerformance(i));
        const nonZero = finals.filter(f => f > 0);
        const avg = nonZero.length > 0 ? (nonZero.reduce((a, b) => a + b, 0) / nonZero.length).toFixed(1) : '0';
        const max = nonZero.length > 0 ? Math.round(Math.max(...nonZero)).toString() : '0';
        const min = nonZero.length > 0 ? Math.round(Math.min(...nonZero)).toString() : '0';
        const entered = nonZero.length;

        const stats = [
            { label: 'Ortalama Puan', value: avg, desc: 'Sınıf ortalaması', delay: '0s' },
            { label: 'En Yüksek', value: max, desc: 'En iyi performans', delay: '0.1s' },
            { label: 'En Düşük', value: min, desc: 'En düşük performans', delay: '0.2s' },
            { label: 'Puanı Girilenler', value: String(entered), desc: `Toplam ${appData.students.length} öğrenciden`, delay: '0.3s' }
        ];

        for (const stat of stats) {
            const statCard = el('div', { className: 'perf-stat-card', style: { animationDelay: stat.delay } }, [
                el('div', { className: 'perf-stat-label', textContent: stat.label }),
                el('div', { className: 'perf-stat-value', textContent: stat.value }),
                el('div', { className: 'perf-stat-desc', textContent: stat.desc })
            ]);
            statsContainer.appendChild(statCard);
        }
        area.appendChild(statsContainer);

        // Performance table
        const wrapper = el('div', { className: 'perf-table-wrapper' });
        const table = el('table', { className: 'perf-table' });

        // Header
        const thead = el('thead');
        const headerRow = el('tr');
        const headers = [
            { text: '#', cls: '' },
            { text: 'No', cls: '' },
            { text: 'Adı Soyadı', cls: 'th-student' },
            { text: '3. Konuşma (%15)', cls: '' },
            { text: '4. Konuşma (%15)', cls: '' },
            { text: '3. Yazma (%15)', cls: '' },
            { text: '4. Yazma (%15)', cls: '' },
            { text: '3. Kitap (%10)', cls: '' },
            { text: '4. Kitap (%10)', cls: '' },
            { text: 'Film (%10)', cls: '' },
            { text: 'Ders İçi (%10)', cls: '' },
            { text: 'PERFORMANS PUANI', cls: '' },
            { text: 'HEDEF PUAN', cls: '' }
        ];

        for (const h of headers) {
            headerRow.appendChild(el('th', { className: h.cls, textContent: h.text }));
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = el('tbody');
        const rubricOrder = [
            'tema3_konusma', 'tema4_konusma', 'tema3_yazma', 'tema4_yazma',
            'tema3_kitap', 'tema4_kitap', 'film', 'ders_ici'
        ];

        appData.students.forEach((student, i) => {
            const tr = el('tr');
            tr.appendChild(el('td', {}, [el('span', { className: 'row-num', textContent: String(i + 1) })]));
            tr.appendChild(el('td', { textContent: student.no || '-' }));
            tr.appendChild(el('td', { className: 'td-name', textContent: student.name || '-' }));

            for (const rKey of rubricOrder) {
                const score = getRubricScoreOutOf100(rKey, i);
                const td = el('td');
                const pill = el('span', { className: `score-pill ${getScoreClass(score)}`, textContent: String(score) });
                td.appendChild(pill);
                tr.appendChild(td);
            }

            const finalScore = getFinalPerformance(i);
            const finalTd = el('td', { className: 'td-final' });
            finalTd.appendChild(el('span', {
                className: `score-pill ${getScoreClass(finalScore)}`,
                textContent: Math.round(finalScore).toString(),
                style: { fontWeight: '700', fontSize: '0.9rem' }
            }));
            tr.appendChild(finalTd);

            // Target score input + distribute button
            const targetTd = el('td', { className: 'td-target', style: { minWidth: '140px' } });
            const targetWrapper = el('div', { className: 'target-input-wrapper' });
            const targetInput = el('input', {
                className: 'target-input',
                type: 'number',
                min: '0',
                max: '100',
                step: '1',
                placeholder: '0-100',
                id: `target-score-${i}`,
                value: appData.students[i].targetScore || ''
            });

            // Auto-distribute function
            let _distributing = false;
            const autoDistribute = () => {
                if (_distributing) return;
                _distributing = true;
                const val = parseFloat(targetInput.value);
                appData.students[i].targetScore = targetInput.value;
                saveData();
                if (!isNaN(val) && val >= 0 && val <= 100) {
                    distributeTargetScore(i, val);
                    updatePerformanceInPlace();
                }
                setTimeout(() => { _distributing = false; }, 100);
            };

            targetInput.addEventListener('input', (e) => {
                appData.students[i].targetScore = e.target.value;
                saveData();
            });

            // Auto-distribute on Enter key
            targetInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    targetInput.blur();
                    autoDistribute();
                }
            });

            // Auto-distribute on blur (leaving the field)
            targetInput.addEventListener('change', () => {
                autoDistribute();
            });

            const distributeBtn = el('button', {
                className: 'btn-distribute',
                title: 'Puanı yeniden dağıt',
                textContent: '🎲',
                onClick: () => {
                    const val = parseFloat(targetInput.value);
                    if (isNaN(val) || val < 0 || val > 100) {
                        showToast('Lütfen 0-100 arasında bir hedef puan giriniz.', 'error');
                        return;
                    }
                    distributeTargetScore(i, val);
                    showToast(`${appData.students[i].name || 'Öğrenci'} için puanlar yeniden dağıtıldı! (Hedef: ${val})`, 'success');
                    updatePerformanceInPlace();
                }
            });
            targetWrapper.appendChild(targetInput);
            targetWrapper.appendChild(distributeBtn);
            targetTd.appendChild(targetWrapper);
            tr.appendChild(targetTd);

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        wrapper.appendChild(table);
        area.appendChild(wrapper);
    }

    function getScoreClass(score) {
        if (score === 0) return 'score-zero';
        if (score >= 70) return 'score-high';
        if (score >= 40) return 'score-mid';
        return 'score-low';
    }

    // ==================
    // PDF PRINT
    // ==================
    function printPerformancePDF() {
        if (appData.students.length === 0) {
            showToast('Yazdırılacak öğrenci verisi yok.', 'error');
            return;
        }

        const rubricOrder = [
            'tema3_konusma', 'tema4_konusma', 'tema3_yazma', 'tema4_yazma',
            'tema3_kitap', 'tema4_kitap', 'film', 'ders_ici'
        ];

        const colHeaders = [
            '3. Konuşma<br>(%15)',
            '4. Konuşma<br>(%15)',
            '3. Yazma<br>(%15)',
            '4. Yazma<br>(%15)',
            '3. Kitap<br>(%10)',
            '4. Kitap<br>(%10)',
            'Film<br>(%10)',
            'Ders İçi<br>(%10)'
        ];

        // Build table rows
        let rowsHTML = '';
        appData.students.forEach((student, i) => {
            const finalScore = getFinalPerformance(i);
            let cells = '';
            for (const rKey of rubricOrder) {
                const s = getRubricScoreOutOf100(rKey, i);
                cells += `<td>${s}</td>`;
            }
            rowsHTML += `
                <tr>
                    <td class="col-sira">${i + 1}</td>
                    <td class="col-no">${student.no || ''}</td>
                    <td class="col-name">${student.name || ''}</td>
                    ${cells}
                    <td class="col-final">${Math.round(finalScore)}</td>
                </tr>`;
        });

        // Calculate class stats
        const finals = appData.students.map((_, i) => getFinalPerformance(i));
        const nonZero = finals.filter(f => f > 0);
        const avg = nonZero.length > 0 ? (nonZero.reduce((a, b) => a + b, 0) / nonZero.length).toFixed(1) : '-';
        const maxScore = nonZero.length > 0 ? Math.round(Math.max(...nonZero)).toString() : '-';
        const minScore = nonZero.length > 0 ? Math.round(Math.min(...nonZero)).toString() : '-';

        const today = new Date();
        const dateStr = today.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        // Column headers HTML
        let colHeadersHTML = colHeaders.map(h => `<th>${h}</th>`).join('');

        const printHTML = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Performans Puanı - PDF Çıktısı</title>
<style>
    @page {
        size: A4 landscape;
        margin: 8mm 8mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Times New Roman', 'Serif', serif;
        color: #1a1a1a;
        font-size: 9pt;
        line-height: 1.3;
        background: #fff;
    }

    .print-page {
        width: 100%;
        padding: 0;
    }

    /* HEADER */
    .print-header {
        text-align: center;
        margin-bottom: 8px;
        border-bottom: 2.5px double #1a1a1a;
        padding-bottom: 6px;
    }
    .print-header .school-name {
        font-size: 12pt;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 1px;
    }
    .print-header .doc-title {
        font-size: 10.5pt;
        font-weight: bold;
        margin-top: 2px;
    }
    .print-header .doc-subtitle {
        font-size: 8.5pt;
        color: #444;
        margin-top: 1px;
    }

    /* INFO ROW */
    .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 8.5pt;
    }
    .info-row .info-item {
        display: flex;
        gap: 4px;
    }
    .info-row .info-label {
        font-weight: bold;
    }

    /* TABLE */
    .perf-print-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 7.5pt;
        margin-bottom: 6px;
    }
    .perf-print-table thead th {
        background: #2c3e50;
        color: #fff;
        font-weight: 600;
        padding: 4px 3px;
        border: 1px solid #2c3e50;
        text-align: center;
        font-size: 7pt;
        line-height: 1.2;
        vertical-align: middle;
    }
    .perf-print-table thead th.th-name {
        text-align: left;
        min-width: 110px;
        padding-left: 6px;
    }
    .perf-print-table thead th.th-sira {
        width: 24px;
    }
    .perf-print-table thead th.th-no {
        width: 40px;
    }
    .perf-print-table thead th.th-final {
        background: #1a252f;
        font-size: 7pt;
    }
    .perf-print-table tbody td {
        padding: 2.5px 3px;
        border: 1px solid #bdc3c7;
        text-align: center;
        vertical-align: middle;
        font-size: 8pt;
    }
    .perf-print-table tbody tr:nth-child(even) {
        background: #f7f9fc;
    }
    .perf-print-table tbody tr:hover {
        background: #eef2f7;
    }
    .perf-print-table .col-sira {
        font-weight: 600;
        color: #555;
        text-align: center;
    }
    .perf-print-table .col-no {
        text-align: center;
        font-size: 7.5pt;
    }
    .perf-print-table .col-name {
        text-align: left;
        padding-left: 6px;
        font-weight: 500;
    }
    .perf-print-table .col-final {
        font-weight: bold;
        font-size: 8.5pt;
        background: #eaf0f7;
        border-left: 2px solid #2c3e50;
    }

    /* STATS */
    .stats-row {
        display: flex;
        gap: 20px;
        margin-bottom: 6px;
        font-size: 8pt;
        padding: 5px 10px;
        background: #f7f9fc;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    .stats-row .stat-item {
        display: flex;
        gap: 4px;
    }
    .stats-row .stat-label {
        font-weight: bold;
    }


    @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
    }
</style>
</head>
<body>
<div class="print-page">

    <div class="print-header">
        <div class="school-name">T.C.<br>KARAMAN MESLEKİ VE TEKNİK ANADOLU LİSESİ</div>
        <div class="doc-title">2. DÖNEM 2. PERFORMANS DEĞERLENDİRME PUAN ÇİZELGESİ</div>
        <div class="doc-subtitle">2025-2026 Eğitim Öğretim Yılı</div>
    </div>

    <div class="info-row">
        <div class="info-item"><span class="info-label">Sınıf:</span> <span>9. Sınıf</span></div>
        <div class="info-item"><span class="info-label">Dönem:</span> <span>2. Dönem</span></div>
        <div class="info-item"><span class="info-label">Öğrenci Sayısı:</span> <span>${appData.students.length}</span></div>
        <div class="info-item"><span class="info-label">Tarih:</span> <span>${dateStr}</span></div>
    </div>

    <table class="perf-print-table">
        <thead>
            <tr>
                <th class="th-sira">Sıra<br>No</th>
                <th class="th-no">Öğr.<br>No</th>
                <th class="th-name">Öğrencinin Adı Soyadı</th>
                ${colHeadersHTML}
                <th class="th-final">PERFORMANS<br>PUANI</th>
            </tr>
        </thead>
        <tbody>
            ${rowsHTML}
        </tbody>
    </table>

    <div class="stats-row">
        <div class="stat-item"><span class="stat-label">Sınıf Ortalaması:</span> <span>${avg}</span></div>
        <div class="stat-item"><span class="stat-label">En Yüksek:</span> <span>${maxScore}</span></div>
        <div class="stat-item"><span class="stat-label">En Düşük:</span> <span>${minScore}</span></div>
        <div class="stat-item"><span class="stat-label">Puanı Girilen:</span> <span>${nonZero.length} / ${appData.students.length}</span></div>
    </div>

</div>

<script>
    window.onload = function() { window.print(); };
</script>
</body>
</html>`;

        const printWin = window.open('', '_blank', 'width=1100,height=700');
        if (printWin) {
            printWin.document.write(printHTML);
            printWin.document.close();
            showToast('PDF yazdırma penceresi açıldı.', 'success');
        } else {
            showToast('Yazdırma penceresi açılamadı. Pop-up engelleyiciyi kontrol edin.', 'error');
        }
    }

    // ==================
    // SCORE DISTRIBUTION
    // ==================

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function distributeTargetScore(studentIndex, targetScore) {
        const rubricKeys = Object.keys(RUBRICS);

        // Step 1: For each rubric, assign random criterion scores targeting ~targetScore%
        // Add random variation (±15) per rubric for a natural look
        const variation = Math.min(targetScore, 100 - targetScore, 15);

        for (const key of rubricKeys) {
            const rubric = RUBRICS[key];
            const count = getCriterionCount(key);

            // Random target for this rubric, centered on targetScore
            let rubricTarget = targetScore + (Math.random() * 2 - 1) * variation;
            rubricTarget = Math.max(0, Math.min(100, rubricTarget));

            // Convert to raw score
            let targetRaw = Math.round(rubricTarget / 100 * rubric.maxScore);
            // Clamp to valid range [count (all 1s), count*3 (all 3s)]
            targetRaw = Math.max(count, Math.min(count * 3, targetRaw));

            // Distribute targetRaw across criteria (each 1-3)
            const scores = new Array(count).fill(1);
            let remaining = targetRaw - count; // how many extra points to distribute

            // Shuffle indices for randomness
            const indices = shuffleArray(Array.from({ length: count }, (_, idx) => idx));

            for (const idx of indices) {
                if (remaining <= 0) break;
                const add = Math.min(2, remaining, Math.random() < 0.5 ? 1 : 2);
                scores[idx] += add;
                remaining -= add;
            }

            // If still remaining, do another pass
            while (remaining > 0) {
                for (let idx = 0; idx < count && remaining > 0; idx++) {
                    if (scores[idx] < 3) {
                        scores[idx]++;
                        remaining--;
                    }
                }
            }

            // Apply scores
            for (let ci = 0; ci < count; ci++) {
                setScore(key, studentIndex, ci, scores[ci]);
            }
        }

        // Step 2: Fine-tune to hit the exact target
        // Iteratively adjust random criteria up/down until we're within ±0.5 of target
        const roundedTarget = roundPerformanceScore(targetScore);
        let actual = getFinalPerformanceRaw(studentIndex);
        let attempts = 0;

        while (roundPerformanceScore(actual) !== roundedTarget && attempts < 500) {
            const randKey = rubricKeys[Math.floor(Math.random() * rubricKeys.length)];
            const count = getCriterionCount(randKey);
            const randCrit = Math.floor(Math.random() * count);
            const currentVal = getScore(randKey, studentIndex, randCrit);

            if (actual < targetScore && currentVal < 3) {
                setScore(randKey, studentIndex, randCrit, currentVal + 1);
            } else if (actual > targetScore && currentVal > 1) {
                setScore(randKey, studentIndex, randCrit, currentVal - 1);
            }

            const newActual = getFinalPerformanceRaw(studentIndex);
            const currentDistance = Math.abs(roundPerformanceScore(actual) - roundedTarget);
            const newDistance = Math.abs(roundPerformanceScore(newActual) - roundedTarget);

            // If rounding moved us farther from the intended displayed score, revert.
            if (newDistance > currentDistance) {
                setScore(randKey, studentIndex, randCrit, currentVal);
            } else {
                actual = newActual;
            }
            attempts++;
        }
    }

    // ==================
    // INIT
    // ==================
    function init() {
        loadData();
        initNavigation();
        renderPage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
