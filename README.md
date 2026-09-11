# Ölçek · 9. Sınıf 1. Dönem

Türk Dili ve Edebiyatı dersi için öğrenci listesi, iki ayrı performans notu ve öğrenci bazlı dereceli puanlama ölçekleri. Kurulum ve sunucu bağımlılığı olmayan HTML/CSS/JavaScript uygulamasıdır. `index.html` dosyasını tarayıcıda açabilir veya GitHub Pages üzerinde kullanabilirsiniz.

## Kullanım

1. **Öğrenci listesi** bölümünden tek öğrenci ekleyin veya Excel’den numara / ad soyad sütunlarını **Toplu ekle** alanına yapıştırın.
2. **Puan girişi** ekranında 1. ve 2. performans notlarını yan yana girin. Notlar otomatik kaydedilir. Enter, aynı performansın sonraki öğrencisine geçer.
3. İsterseniz **Ölçeğe uygula** ile girilen notu ilgili performansın ölçütlerine dağıtın. Bu işlem diğer performansı etkilemez. Mevcut ölçüt puanları varsa değiştirmeden önce sorulur. Oluşturulan dereceler taslak olarak belirtilir ve değiştirilebilir.
4. **Dereceli ölçekler** bölümünde öğrenci ve performansı seçin. **Tema ölçeği** açılır menüsünden ölçeği açın ve 1, 2 veya 3 puan işaretleyin. Seçili dereceye tekrar basmak o ölçütü temizler.
5. Öğrenci satırındaki **Yazdır** ile tek ölçek, bir performans veya tüm ölçekleri önizleyin. **Yazdır / PDF kaydet** tarayıcının yazdırma penceresini açar. Her ölçek yeni bir A4 sayfada başlar. Sınıf not çizelgesi ayrıca yazdırılabilir.
6. **Sınıf ve yedekleme** bölümünden okul, yıl, şube, öğretmen ve kitap adlarını girin; JSON yedeğini indirin veya geri yükleyin.

## Excel ile aynı hesaplama

Kaynaklar, kullanıcı tarafından sağlanan **9. SINIFLAR 1. DÖNEM 1. PERFORMANS ÖLÇEĞİ.xlsx** ve **9. SINIF 1. DÖNEM 2. PERFORMANS ÖLÇEĞİ.xlsx** dosyalarıdır. Öğrenci adları ve kaynak dosyaların içindeki örnek notlar uygulamaya gömülmemiştir.

| Performans | Ölçek | Ölçüt sayısı | En yüksek ham puan | Ağırlık |
|---|---|---:|---:|---:|
| 1 | 1. Tema Konuşma | 13 | 39 | %25 |
| 1 | 2. Tema Konuşma | 18 | 54 | %25 |
| 1 | 1. Tema Yazma | 10 | 30 | %25 |
| 1 | 2. Tema Yazma | 13 | 39 | %25 |
| 2 | 1. Tema Kitap | 14 | 42 | %33 |
| 2 | 2. Tema Kitap | 14 | 42 | %33 |
| 2 | Ders İçi | 6 | 18 | %34 |

Her ölçek önce `ROUND(hamPuan / enYuksekPuan * 100, 0)` ile 100’lük sisteme çevrilir. Performans sonucu bu tam sayıların ağırlıklı toplamıdır. Excel’in ondalıklı ağırlıklı sonucu ölçek ekranında ve çıktıda ayrıca gösterilir; not alanında bu sonuç tam sayıya yuvarlanır.

Boş ölçüt, sıfır puan anlamına gelmez. Eksik ölçeğin puanı geçici olarak gösterilir; tüm ölçütler tamamlanmadan kesin performans sonucu üretilmez. Doğrudan girilmiş **0** notu ise korunur. Ölçütler yalnızca 1–3 derecesini kabul ettiği için **0–32** notları doğrudan kaydedilebilir, fakat bu notlar ölçütlere dağıtılamaz.

Doğrudan not girişi mevcut ölçüt puanlarını değiştirmez. Bir doğrudan not varken ölçekten hesaplanan sonuç ayrıca gösterilir. Not alanını temizlemek veya **Ölçek sonucunu kullan** düğmesine basmak hesaplanan sonuca döner. **Ölçeğe uygula** sonrasında not yeniden ölçeklere bağlı hale gelir.

## Kayıt ve önceki sürüm

- Kayıtlar tarayıcının bu adresine ait `localStorage` alanında saklanır. Cihaz veya site adresi değişince JSON yedeğiyle taşınmalıdır.
- Yeni veri anahtarı `olcek_app_data_v2`’dir. Öğrenciler sabit kimliklerle tutulur; birini silmek diğer öğrencilerin puanlarını kaydırmaz.
- Eski `olcek_app_data_v1` bulunursa öğrenci listesi aktarılır. Eski 2. dönem ölçeklerinin puanları 1. döneme dönüştürülmez. Tam eski kayıt yeni yedeğin `legacyArchive` alanında saklanır; orijinal anahtar silinmez.
- Bozuk kayıt algılanırsa üzerine otomatik yazılmaz. Kurtarma dosyası indirilebilir ve geçerli yedek geri yüklenebilir.

## Dosyalar ve doğrulama

- `rubrics.js`: kaynak dosya, sayfa ve hücre bilgileriyle yedi ölçeğin tanımları.
- `core.js`: puanlama, ağırlıklar, not dağıtımı, veri doğrulama ve eski kayıt aktarımı.
- `app.js`: not girişi, öğrenci yönetimi, ölçek seçimi ve yedekleme arayüzü.
- `print.js`: öğrenci ölçekleri ve sınıf çizelgesinin güvenli yazdırma önizlemesi.
- `style.css`: ekran, dar ekran ve A4 yazdırma stilleri.

Hesaplama testleri: `node --test core.test.js`.

Yerel önizleme: `python3 -m http.server 8765 --bind 127.0.0.1` ve ardından `http://127.0.0.1:8765`.

Tarayıcıda doğrulanan akışlar: toplu öğrenci ekleme, Enter ile sonraki öğrenciye geçme, iki performansın bağımsız puanlanması, sayfa yenileme sonrası kayıt, geçersiz not kontrolü, derece seçme/temizleme, tema ve öğrenci değiştirme, tek ve tüm ölçek çıktıları. 1024 ve 390 piksel genişliklerde puan alanları ve derece düğmeleri yatay taşmadan kullanılır. Fiziksel yazıcı çıktısı alınmamıştır.
