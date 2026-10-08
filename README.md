# Ölçek — Performans Değerlendirme

9. sınıf Türk Dili ve Edebiyatı, 1. dönem performans notlarını referans Excel dosyasındaki yedi ölçeğe dağıtan web uygulaması. Sunucu, hesap, API anahtarı veya derleme gerektirmez. GitHub Pages üzerinde çalışır. Mevcut Chrome uzantısından bağımsızdır.

Canlı adres: https://mesutpeker.com/olcek/

## Kullanım

Üstteki adım şeridi sırayı gösterir: **Sınıf bilgileri → Öğrenci listesi → Notlar ve kriterler → Yazdır / Excel**. Her adıma tıklayarak ilgili işleme gidebilirsiniz.

1. **Sınıf:** Üst çubuktaki seçiciden sınıfı seçin veya **＋ Yeni sınıf ekle** ile yeni şube açın. Okul, öğretmen, yıl ve tarih **Sınıf bilgileri** penceresinden girilir ve tüm sınıflarda ortaktır; kitap adları sınıfa özeldir.
2. **e-Okul’dan yapıştır:** e-Okul’un not giriş ekranında öğrenci listesini seçip kopyalayın, pencereye yapıştırın. “No / AD SOYAD” satırı ile altındaki not satırı (“Öğrenci Not Bilgisi”) birlikte okunur. Kopyada not varsa hangi not sütununun 1. ve 2. performans olduğunu seçebilirsiniz (varsayılan: aktarma); seçim hatırlanır. Aynı numaralı öğrencinin adı güncellenir, yeni öğrenciler eklenir. Excel/CSV dosyası ve özgün ölçek dosyası **⋯ → Excel / CSV dosyasından aktar** ile alınır.
3. **Performans notları** sekmesinde notları yazın. Notun yanındaki işaret: **✓** Excel aynı notu verir (**✓ 84,98** Excel’in ondalıklı hesabıdır, çizelgede 85 görünür); **Excel 40 · Onayla** not ölçekle üretilemiyor; **✎ Kriterlerden** not kriterlerden hesaplandı; **N kriter boş** elle girilen kriterlerde eksik var.
4. **Ölçek sekmeleri** (1. Tema Konuşma … Ders İçi Gözlem) Excel’deki sayfaların karşılığıdır. Satırlar öğrenci, sütunlar kriterdir (K1, K2… başlığın üzerine gelince tam metin görünür). Gri puanlar nottan otomatik dağıtılmıştır; bir puanı yazdığınızda o öğrencinin o performansı kriterlerden hesaplanır. Rakam yazınca imleç sonraki kritere geçer, `Enter` alt satıra iner. Excel’deki ölçek sayfasından kopyalanan blok (satırlar kriter, sütunlar öğrenci) doğrudan yapıştırılabilir. **↺** öğrencinin kriterlerini silip nota göre otomatik dağıtıma döner.
5. **Tümünü yazdır** ortak çizelgeyi ve 7 ölçeği yazdırır/PDF yapar; **⋯** menüsünden yalnızca ortak çizelge veya yalnızca ölçekler yazdırılabilir. **Excel indir** tüm sayfaları içerir. Kontrol bekleyen not varsa önce liste gösterilir; maddeye tıklayınca ilgili hücreye gidilir.

**Doğru hesaplama için önlemler:** Kriter hücreleri yalnızca o kriterin geçerli puanlarını kabul eder (ör. 4, 6, 8, 10); geçersiz değer reddedilir ve önceki puan geri gelir, yapıştırmada atlanır. Boş kriter kalan performans hesaplanmaz ve yazdırma/Excel öncesinde uyarılır. Not tablosundan not yeniden yazılırsa kriterler otomatik dağıtılır (Geri al ile dönülebilir). İndirilen Excel’de kriter hücreleri açılır listeyle yalnızca geçerli puanları kabul eder, toplam ve performans formülleri kilitlidir (şifresiz; Gözden Geçir → Sayfa Korumasını Kaldır) ve dosya her açılışta yeniden hesaplanır.

Silme, yapıştırma, sıralama, liste temizleme ve aktarma işlemleri bildirimdeki **Geri al** ile geri alınabilir. Notlar 0–100 arasında, en fazla iki ondalıklı olabilir. Bir sınıfta en fazla 500 öğrenci olabilir.

**Bilgiler kaydedilmez.** Aynı bilgisayarı art arda farklı öğretmenler kullanabileceği için sayfa her açıldığında (yenilemede de) boş bir çalışmayla başlar; öğrenci girilmişken sayfadan ayrılmak istenirse tarayıcı uyarır. Uygulamanın önceki sürümlerinin tarayıcıda bıraktığı kayıtlar ilk açılışta silinir. Çalışmaya sonra devam etmek için **⋯ → Yedek indir** ile JSON yedeği alın ve **Yedekten aç** ile yükleyin. Yedek tüm sınıfları içerir. Öğrenci bilgileri hiçbir sunucuya gönderilmez. (Yalnızca e-Okul sütun seçimi tercihi hatırlanır.)

## Excel’in puanlama mantığı

Kaynak: `9.SINIFLAR   1. DÖNEM PERF. ÖLÇEĞİ 2026.xlsx`.

| Ölçek | Kriter | Her kriterin geçerli puanları | Ham toplam |
| --- | ---: | --- | --- |
| 1. Tema Konuşma | 10 | 4, 6, 8, 10 | 40–100 |
| 2. Tema Konuşma | 10 | 4, 6, 8, 10 | 40–100 |
| 1. Tema Yazma | 9 | İlk 8 kriter: 4, 6, 8, 10; Özgünlük: 8, 12, 16, 20 | 40–100 |
| 2. Tema Yazma | 10 | 4, 6, 8, 10 | 40–100 |
| 1. Tema Kitap Okuma | 14 | 1, 2, 3 | 14–42 |
| 2. Tema Kitap Okuma | 14 | 1, 2, 3 | 14–42 |
| Ders İçi Gözlem | 6 | 1, 2, 3 | 6–18 |

**1. performans:** Her ölçeğin ham toplamı %25 ile çarpılır ve ayrı ayrı tam sayıya yuvarlanır. Sonuç bu dört katkının toplamıdır. Kaynak: `1. DÖNEM 1. PERFORMANS PUANI!E4:I4`. Bu yüzden dört ham toplamın ortalamasını sonradan yuvarlamak aynı işlem değildir. 40–100 arasındaki her tam not üretilebilir.

**2. performans:** Kitap toplamları 42’ye, gözlem toplamı 18’e bölünerek 100 ile çarpılır. Her 100’lük karşılık ayrı ayrı tam sayıya yuvarlanır. Ardından %33 + %33 + %34 ile ağırlıklı toplam hesaplanır. Kaynak: `1. DÖNEM 2. PERFORMANS PUANI!E4:H4`. Son toplam kaynak Excel’de yuvarlanmaz. En düşük sonuç 33’tür. Her hedef not tam olarak mümkün değildir; örneğin 85 için en yakın sonuç 84,98; 90 için 89,99’dur. 33–100 arasındaki 68 tam sayıdan yalnızca 14’ü tam olarak üretilebilir. Kaynak dosya bu hücreleri `0` sayı biçimiyle gösterdiği için her tam sayı hedefte çizelgede görünen not girilen notla aynıdır (en büyük fark 0,32); uygulama bu durumu onay istemeden kabul eder.

Uygulama geçerli tüm ölçek toplamları arasından hedefe en yakın sonucu bulur. Eşit yakınlıkta hedefe daha dengeli dağılan ölçek toplamlarını seçer. Kriterler yalnızca kaynakta belirtilen puan basamaklarını alır. Aynı öğrenci ve aynı notlar her zaman aynı dağılımı üretir. Bu ters hesaplama kaynak Excel’de bulunmayan, uygulamanın eklediği bir özelliktir. Toplam not tek bir kriter dağılımını belirlemez; üretilen dağılım, gerçekleşmiş gözlemleri yeniden elde ettiği iddiası taşımaz.

Kriter adları, alt ölçütler ve düzey açıklamaları kaynak dosyadan alınmıştır. Yalnızca fazla boşluklar ve satır sonları düzenlenmiştir; kaynak metindeki yazım hataları ve `1. Tema Konuşma` açıklamasındaki “yazma performans çalışması” ifadesi korunmuştur. Çıktılardaki birleştirilmiş kriter başlıkları, özgün dosyadaki birleşimleriyle korunur.

## Çıktı düzeni (yazdırma ve Excel)

Ortak performans çizelgesi ve yedi ölçek tek ve ortak bir tasarımla, yatay A4 sayfayı (10 mm kenar boşluğu) tam dolduracak şekilde oluşturulur:

- **Sütunlar öğrenci sayısı kadardır.** Boş öğrenci sütunu veya satırı oluşmaz.
- **Sayfa kuralı:** 25 öğrenciye kadar her ölçek tek sayfadır. 26–50 öğrenci en fazla iki sayfaya dengeli bölünür (ör. 34 → 17 + 17). Daha kalabalık sınıflarda sayfa başına en fazla 25 öğrenci olur. Bölünen tablolar aynı düzenle sonraki sayfada yeniden oluşturulur ve başlıkta sayfa numarası (1/2) yazar. Tüm ölçeklerde aynı öğrenciler aynı sayfa numarasındadır. Yazı boyutu, sayfaya sığacak en büyük değere kendiliğinden ayarlanır. Ortak çizelge, mümkünse bütün sınıfı tek sayfada gösterir.
- **Yazı boyutları birbirine yakındır:** Ölçüt adları kalın, düzey açıklamaları, puanlar ve adlar aynı ölçekte küçültülür. Başlık satırı gri, toplam satırı sarıdır.
- **Puanlar başlıkta:** Bir düzeyin puanı bütün kriterlerde aynıysa düzey başlığına yazılır ("Başlangıç Düzeyinde (4 puan)"). Açıklama hücrelerindeki tekrar eden "(4 puan)" notu kaldırılır. Puanı farklı olan kriterlerde (1. Tema Yazma "Özgünlük") not hücrede kalır.
- **Uzun adlar:** Üç ve daha fazla isimli öğrencilerin adı, ayrıca 16 karakterden uzun iki isimli adlar, dikey ad hücresinde iki dengeli satıra yazılır. Ortak çizelgede ad, sayfa sayısını artırmıyorsa iki satıra, artırıyorsa tek satıra yazılır.
- **Baskı ve Excel ayrı ölçülür:** Yazdırma görünümü tarayıcının, Excel dosyası Excel'in yazı ölçüsüne (daha geniş satır aralığı, daha erken satır kaydırma) göre düzenlenir.
- **Excel'de satır yükseklikleri:** Kriter açıklaması satırlarının yüksekliğini Excel kendi yazı ölçümüyle belirler. Sayfa yapısı "1 sayfa genişliğinde, 1 sayfa yüksekliğinde" ve A4'tür. Böylece metin kesilmez, her sayfa tek kâğıda basılır. (Excel'in Sayfa Düzeni görünümü bu ölçeklemeyi göstermeyebilir; baskı önizlemesi ve PDF doğrudur.)
- **Formül bağlantıları:** Ortak çizelgedeki formüller her öğrencinin ilgili ölçek sayfasındaki toplam hücresine bağlıdır (ör. `ROUND('1. Tema Konuşma (2)'!H14*25/100,0)`). Elle girilen kriter puanları dosyanın belge özelliklerinde de saklanır, yeniden içe aktarılabilir.
- **Kaynaktan farklar:** Kriter, düzey ve açıklama metinleri kaynak dosyadan alınır. 2. performans ölçeklerindeki kaynakta yarım kalan “NOT” cümlesinin yalnızca ilk cümlesi kullanılır. Bu ölçeklere kaynakta olmayan “en düşük/en yüksek puan” satırı eklenmiştir. Kaynakta “DEĞERLENDİRME ÖLÇEĞİ” ifadesi eksik olan 2. Tema Yazma başlığı tamamlanır.

## GitHub Pages’te yayınlama

1. Yeni bir GitHub deposu oluşturun.
2. Bu klasörün **içeriğini** deponun köküne yükleyin. `index.html` doğrudan kökte bulunmalı; `assets` klasör yapısı korunmalıdır. Kaynak Excel dosyasını veya öğrenci yedeklerini yüklemeyin.
3. Depoda **Settings → Pages → Build and deployment** bölümünü açın.
4. **Source: Deploy from a branch**, **Branch: main**, **Folder: /(root)** seçip **Save** düğmesine basın.
5. GitHub’ın gösterdiği Pages adresini açın.

Derleme adımı veya npm kurulumu gerekmez. Dosya bağlantıları göreli olduğu için proje alt adreslerinde de çalışır. `.nojekyll` dosyası pakete dahildir.

[GitHub’ın yayınlama belgesi](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Yerel çalıştırma

Depoyu indirip (Code → Download ZIP) bir klasöre çıkarın ve `index.html` dosyasını çift tıklayarak açın. Öğrenci ekleme, not dağıtımı, Excel ve PDF çıktıları internet bağlantısı veya yerel sunucu gerektirmez. `app.bundle.js` ve `assets` dahil paket dosyalarını aynı klasör yapısında tutun.

İsterseniz klasörde `python3 -m http.server 4173` çalıştırıp `http://localhost:4173` adresini de açabilirsiniz. Yerel dosya ve web adresi ayrı tarayıcı kayıtları kullanır; çalışmanızı aralarında taşımak için **Yedek indir / Yedek aç** kullanın.

Kaynak JavaScript dosyalarını değiştiriyorsanız ilk seferde `npm ci`, ardından `npm run build` çalıştırın. Bu işlem tarayıcının doğrudan yüklediği `app.bundle.js` dosyasını günceller. Kullanım ve GitHub Pages yayını için npm gerekmez; hazır paket bu dosyayı içerir.

## Testler ve dosyalar

- `node --test tests/core.test.js`: Puan sınırları, tüm yasal ham toplamlar, 40–100 arasındaki ilk performans notları, ikinci performansın tüm 0–100 tam hedefleri için en yakın sonuç, yuvarlama, içe aktarma ve rapor kabul kuralları.
- `app.bundle.js`: `npm run build` ile kaynak modüllerden üretilen, yerel dosya ve GitHub Pages üzerinde çalışan tarayıcı paketi.
- `rubrics.js`: Öğrenci bilgisi içermeyen kaynak ölçek tanımları.
- `core.js`: Dağıtım ve hesaplama.
- `layout.js`: Ortak çizelge ve yedi ölçeğin sayfa yerleşimi, sayfalara bölme ve formül bağlantıları (yazdırma ve Excel için ortak).
- `reports.js`: Baskı görünümü ve çıktı öncesi kontroller.
- `xlsx.js`: OOXML şablonunu ortak rapor düzeniyle doldurma ve Excel okuma.
- `template.js`: Kişisel örnek verileri temizlenmiş Excel şablonu (biçemler, kaynak başlık ve not metinleri).
- `assets/jszip.min.js`: Yerel paketlenmiş JSZip; lisansı aynı klasördedir. Uygulama harici CDN çağırmaz.

Excel formülleri, kaydedilen sayısal sonuçlar ve tarayıcı çıktıları test edilmiştir. Uygulamanın indirdiği Excel dosyası Microsoft Excel’de açılmış; sayfa koruması, kriter hücrelerindeki geçerli puan listesi ve bir kriter değiştirildiğinde toplam ile performans notunun yeniden hesaplandığı doğrulanmıştır. Ayrıca uygulamanın ürettiği kriter puanları özgün kaynak dosyaya yazılıp Excel’de yeniden hesaplatılmış; 1. performansın 40–100 arasındaki tüm notlarında, 2. performansın 33–100 arasındaki tüm tam sayı hedeflerinde ve sınır dışı değerlerde Excel sonucu uygulamanın sonucuyla aynı çıkmıştır.
