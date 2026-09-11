/* Ölçütler, kullanıcının sağladığı iki Excel ölçeğinden alınmıştır. */
(function (root) {
    const rubrics = {
  "tema1_konusma": {
    "key": "tema1_konusma",
    "title": "1. Tema · Konuşma",
    "performance": 1,
    "weight": 25,
    "maxScore": 39,
    "criteria": [
      {
        "group": "Planlama",
        "text": "Konuşmaya etkili bir giriş yapmış, konuşmayı sürdürmüş ve etkili bir şekilde tamamlamıştır.",
        "sourceCell": "C4"
      },
      {
        "group": "Düşünsel süreçleri kontrol etme",
        "text": "Şapkanın simgelediği görüşe uygun örnekler sunmuştur.",
        "sourceCell": "C5"
      },
      {
        "group": "Düşünsel süreçleri kontrol etme",
        "text": "Düşünceleri, konuşmanın ana fikri etrafında ifade etmiştir.",
        "sourceCell": "C6"
      },
      {
        "group": "Düşünsel süreçleri kontrol etme",
        "text": "Düşüncelerini tekrara düşmeden sunmuştur.",
        "sourceCell": "C7"
      },
      {
        "group": "Söz varlığı",
        "text": "Bağlama uygun zengin bir kelime hazinesiyle anlatımını zenginleştirmiştir.",
        "sourceCell": "C8"
      },
      {
        "group": "Söz varlığı",
        "text": "Dilimize henüz yerleşmemiş yabancı kelimelerin yerine Türkçe kelimeleri kullanmıştır.",
        "sourceCell": "C9"
      },
      {
        "group": "Organizasyon",
        "text": "Duygu ve düşüncelerini tutarlı bir biçimde organize etmiştir.",
        "sourceCell": "C10"
      },
      {
        "group": "Akıcılık",
        "text": "İşitilebilir bir ses tonuyla konuşmuştur.",
        "sourceCell": "C11"
      },
      {
        "group": "Akıcılık",
        "text": "Gereksiz ses tekrarına düşmeden akıcı bir şekilde konuşmuştur.",
        "sourceCell": "C12"
      },
      {
        "group": "Akıcılık",
        "text": "Vurgu ve tonlamaya dikkat ederek konuşmuştur.",
        "sourceCell": "C13"
      },
      {
        "group": "Beden dili",
        "text": "Sunumda jest ve mimiklerini etkili kullanmış, dinleyicilerle yeterli göz temasını kurmuştur.",
        "sourceCell": "C14"
      },
      {
        "group": "İş birliği",
        "text": "Takımda yapılan görev paylaşımı doğrultusunda seçilen şapkanın temsil ettiği görevi yerine getirmiştir.",
        "sourceCell": "C15"
      },
      {
        "group": "Zaman yönetimi",
        "text": "Süreyi etkili bir şekilde kullanarak sunumu gerçekleştirmiştir.",
        "sourceCell": "C16"
      }
    ],
    "source": {
      "file": "9. SINIFLAR 1. DÖNEM 1. PERFORMANS ÖLÇEĞİ.xlsx",
      "sheet": "1.Tema_Konuşma"
    }
  },
  "tema2_konusma": {
    "key": "tema2_konusma",
    "title": "2. Tema · Konuşma",
    "performance": 1,
    "weight": 25,
    "maxScore": 54,
    "criteria": [
      {
        "group": "Planlama",
        "text": "Sunuma etkili bir giriş yapmış, konuşmayı sürdürmüş ve etkili bir şekilde tamamlamıştır.",
        "sourceCell": "C4"
      },
      {
        "group": "Planlama",
        "text": "Sunumu planlamış ve bu plan doğrultusunda gerçekleştirmiştir.",
        "sourceCell": "C5"
      },
      {
        "group": "Düşünsel süreçleri kontrol etme",
        "text": "Sunumu amaca uygun örneklerle desteklemiştir.",
        "sourceCell": "C6"
      },
      {
        "group": "Düşünsel süreçleri kontrol etme",
        "text": "Karakterinin fiziksel ve ruhsal özelliklerini tutarlı bir şekilde kurgulamıştır.",
        "sourceCell": "C7"
      },
      {
        "group": "Düşünsel süreçleri kontrol etme",
        "text": "Karakterini tekrara düşmeden kurgulamıştır.",
        "sourceCell": "C8"
      },
      {
        "group": "Söz varlığı",
        "text": "Sunumda görüşlerini destekleyen bağlama uygun sözcükler kullanmıştır.",
        "sourceCell": "C9"
      },
      {
        "group": "Söz varlığı",
        "text": "Dilimize henüz yerleşmemiş yabancı kelimelerin yerine Türkçe kelimeleri kullanmıştır.",
        "sourceCell": "C10"
      },
      {
        "group": "Akıcılık",
        "text": "İşitilebilir bir ses tonuyla konuşmuştur.",
        "sourceCell": "C11"
      },
      {
        "group": "Akıcılık",
        "text": "Gereksiz ses tekrarlarına düşmeden sunumu akıcı bir şekilde gerçekleştirmiştir.",
        "sourceCell": "C12"
      },
      {
        "group": "Akıcılık",
        "text": "Vurgu ve tonlamaya dikkat ederek konuşmuştur.",
        "sourceCell": "C13"
      },
      {
        "group": "Beden dili",
        "text": "Sunumda jest ve mimiklerini etkili kullanmış, dinleyicilerle yeterli göz temasını kurmuştur.",
        "sourceCell": "C14"
      },
      {
        "group": "İş birliği",
        "text": "Sunumda görüşlerini destekleyen bağlama uygun sözcükler kullanmıştır.",
        "sourceCell": "C15"
      },
      {
        "group": "İş birliği",
        "text": "Sunumda takım içindeki sorumluluğunu yerine getirmiştir.",
        "sourceCell": "C16"
      },
      {
        "group": "Zaman yönetimi",
        "text": "Süreyi etkili bir şekilde kullanarak sunumu gerçekleştirmiştir.",
        "sourceCell": "C17"
      },
      {
        "group": "İçerik kurgusu",
        "text": "Sunumda açık ve örtük iletilere yer vermiştir.",
        "sourceCell": "C18"
      },
      {
        "group": "İçerik kurgusu",
        "text": "Kurguladığı karakteri millî ve manevi değerlerle zenginleştirmiştir.",
        "sourceCell": "C19"
      },
      {
        "group": "İçerik kurgusu",
        "text": "Sunumda karşılaştırma, betimleme, benzetme gibi düşünceyi geliştirme yollarından yararlanmıştır.",
        "sourceCell": "C20"
      },
      {
        "group": "İçerik kurgusu",
        "text": "Sunum metninde dil bilgisi kurallarına uymuştur.",
        "sourceCell": "C21"
      }
    ],
    "source": {
      "file": "9. SINIFLAR 1. DÖNEM 1. PERFORMANS ÖLÇEĞİ.xlsx",
      "sheet": "2.Tema_Konuşma"
    }
  },
  "tema1_yazma": {
    "key": "tema1_yazma",
    "title": "1. Tema · Yazma",
    "performance": 1,
    "weight": 25,
    "maxScore": 30,
    "criteria": [
      {
        "group": "Temaya uygunluk",
        "text": "Dörtlüklerin temasını tam olarak yansıtmıştır.",
        "sourceCell": "C4"
      },
      {
        "group": "Ana duyguya uygunluk",
        "text": "Dörtlüklerin ana duygusunu tam olarak yansıtmıştır.",
        "sourceCell": "C5"
      },
      {
        "group": "İmge ve çağrışım kullanımı",
        "text": "Yazılı ürünü imge ve çağrışım değeri yüksek ifadelerle zenginleştirmiştir.",
        "sourceCell": "C6"
      },
      {
        "group": "Açık ve örtük iletiler",
        "text": "Dörtlüklerin açık ve örtük iletilerini tam olarak yansıtmıştır.",
        "sourceCell": "C7"
      },
      {
        "group": "Betimleme unsurları",
        "text": "Yazılı üründe niteleyici kelime ve kelime gruplarını anlatımı zenginleştirecek düzeyde kullanmıştır.",
        "sourceCell": "C8"
      },
      {
        "group": "Söz varlığı",
        "text": "Bağlama uygun zengin bir kelime hazinesi ile yazılı ürünün anlatımını zenginleştirmiştir.",
        "sourceCell": "C9"
      },
      {
        "group": "Söz varlığı",
        "text": "Dilimize henüz yerleşmemiş yabancı kelimelerin yerine Türkçe kelimeleri kullanmıştır.",
        "sourceCell": "C10"
      },
      {
        "group": "Akıcılık",
        "text": "Bölümler arası geçişleri başarıyla yaparak yazılı ürünün kolay okunmasını sağlamıştır.",
        "sourceCell": "C11"
      },
      {
        "group": "Yazım ve noktalama",
        "text": "Yazılı üründe yazım kurallarını ve noktalama işaretlerini doğru kullanmıştır.",
        "sourceCell": "C12"
      },
      {
        "group": "Özgünlük",
        "text": "Yazılı ürünü özgün fikirlerle zenginleştirmiştir.",
        "sourceCell": "C13"
      }
    ],
    "source": {
      "file": "9. SINIFLAR 1. DÖNEM 1. PERFORMANS ÖLÇEĞİ.xlsx",
      "sheet": "1.Tema_Yazma"
    }
  },
  "tema2_yazma": {
    "key": "tema2_yazma",
    "title": "2. Tema · Yazma",
    "performance": 1,
    "weight": 25,
    "maxScore": 39,
    "criteria": [
      {
        "group": "Planlama",
        "text": "Yazılı ürünü bir plan doğrultusunda oluşturmuştur.",
        "sourceCell": "C4"
      },
      {
        "group": "Temaya uygunluk",
        "text": "Yazılı üründe dinlediği şiirin temasına uygun duyguları yansıtmıştır.",
        "sourceCell": "C5"
      },
      {
        "group": "İmge ve çağrışım kullanımı",
        "text": "Yazılı ürünün anlamını zenginleştiren imgelerden yararlanmıştır.",
        "sourceCell": "C6"
      },
      {
        "group": "İmge ve çağrışım kullanımı",
        "text": "Kelimeleri okurda çağrışım uyandıracak şekilde kullanmıştır.",
        "sourceCell": "C7"
      },
      {
        "group": "Açık ve örtük İletiler",
        "text": "Temaya uygun açık ve örtük iletilerle ana duyguyu yansıtmıştır.",
        "sourceCell": "C8"
      },
      {
        "group": "Söz varlığı",
        "text": "Bağlama uygun sözcüklerle yazılı ürünü zenginleştirmiştir.",
        "sourceCell": "C9"
      },
      {
        "group": "Söz varlığı",
        "text": "Dilimize henüz yerleşmemiş yabancı kelimelerin yerine Türkçe kelimeleri kullanmıştır.",
        "sourceCell": "C10"
      },
      {
        "group": "Ritim ve ahenk",
        "text": "Yazılı üründe ses tekrarları ve ses benzerlikleriyle ahenk oluşturmuştur.",
        "sourceCell": "C11"
      },
      {
        "group": "Ritim ve ahenk",
        "text": "Dizelerdeki hecelerin eşitliğiyle ritim ve ahenk oluşturmuştur.",
        "sourceCell": "C12"
      },
      {
        "group": "Akıcılık",
        "text": "Bölümler arası geçişleri başarıyla yaparak yazılı ürünün kolay okunmasını sağlamıştır.",
        "sourceCell": "C13"
      },
      {
        "group": "Şiirin sunumu",
        "text": "Yazılı ürünü vurgu ve tonlamaya dikkat ederek sunmuştur.",
        "sourceCell": "C14"
      },
      {
        "group": "Şiirin sunumu",
        "text": "Yazılı ürünü sunarken kelimeleri doğru telaffuz etmiştir.",
        "sourceCell": "C15"
      },
      {
        "group": "Şiirin sunumu",
        "text": "Yazılı ürünü sunarken beden dilini doğru ve etkili kullanmıştır.",
        "sourceCell": "C16"
      }
    ],
    "source": {
      "file": "9. SINIFLAR 1. DÖNEM 1. PERFORMANS ÖLÇEĞİ.xlsx",
      "sheet": "2.Tema_Yazma"
    }
  },
  "tema1_kitap": {
    "key": "tema1_kitap",
    "title": "1. Tema · Kitap okuma",
    "performance": 2,
    "weight": 33,
    "maxScore": 42,
    "criteria": [
      {
        "group": "Kitap okuma",
        "text": "Okuma öncesinde metnin başlığını, görsellerini ve afişini inceler.",
        "sourceCell": "C4"
      },
      {
        "group": "Kitap okuma",
        "text": "Romanı / eseri okuma amacını, belirler.",
        "sourceCell": "C5"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metni özetler.",
        "sourceCell": "C6"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metnin iletisini belirler",
        "sourceCell": "C7"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metindeki kurgu ve gerçek unsurları belirleyerek metne katkısını tartışırır.",
        "sourceCell": "C8"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metinde ilk defa karşılaştığı bilgilerin doğruluğunu araştırır.",
        "sourceCell": "C9"
      },
      {
        "group": "Kitap okuma",
        "text": "Metindeki imge, sembol, metafor, çağrışım ve göndermeleri tespit eder.",
        "sourceCell": "C10"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metnin içeriği ile daha önce karşılaştığı metinleri çeşitli açılardan karşılaştırır.",
        "sourceCell": "C11"
      },
      {
        "group": "Kitap okuma",
        "text": "Metnin yazarının yerine kendimi koyarak bu metnin daha iyi nasıl olabileceğini düşünür",
        "sourceCell": "C12"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğum metni arkadaşlarımla tartışmak için argümanlar (çıkarım, kanıt) üretirir.",
        "sourceCell": "C13"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metnin entelektüel merakına ve araştırmacı kişiliğine katkısını değerlendirir.",
        "sourceCell": "C14"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metin hakkında öğretmenin ve arkadaşlarının fikirlerini öğrendikten sonra kendi görüşleriyle karşılaştırır.",
        "sourceCell": "C15"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metinde geçen çatışmalara alternatif çözümler üretir./ Okuduğu metin öğretici metinse örnek metin oluşturur.",
        "sourceCell": "C16"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metnin farklı disiplinlerle(psikoloji, tarih, felsefe, coğrafya vb.) ilişkilerini tespit eder.",
        "sourceCell": "C17"
      }
    ],
    "source": {
      "file": "9. SINIF 1. DÖNEM 2. PERFORMANS ÖLÇEĞİ.xlsx",
      "sheet": "1.Tema_Kitap"
    }
  },
  "tema2_kitap": {
    "key": "tema2_kitap",
    "title": "2. Tema · Kitap okuma",
    "performance": 2,
    "weight": 33,
    "maxScore": 42,
    "criteria": [
      {
        "group": "Kitap okuma",
        "text": "Okuma öncesinde metnin başlığını, görsellerini ve afişini inceler.",
        "sourceCell": "C4"
      },
      {
        "group": "Kitap okuma",
        "text": "Romanı / eseri okuma amacını, belirler.",
        "sourceCell": "C5"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metni özetler.",
        "sourceCell": "C6"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metnin iletisini belirler",
        "sourceCell": "C7"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metindeki kurgu ve gerçek unsurları belirleyerek metne katkısını tartışırır.",
        "sourceCell": "C8"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metinde ilk defa karşılaştığı bilgilerin doğruluğunu araştırır.",
        "sourceCell": "C9"
      },
      {
        "group": "Kitap okuma",
        "text": "Metindeki imge, sembol, metafor, çağrışım ve göndermeleri tespit eder.",
        "sourceCell": "C10"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metnin içeriği ile daha önce karşılaştığı metinleri çeşitli açılardan karşılaştırır.",
        "sourceCell": "C11"
      },
      {
        "group": "Kitap okuma",
        "text": "Metnin yazarının yerine kendimi koyarak bu metnin daha iyi nasıl olabileceğini düşünür",
        "sourceCell": "C12"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğum metni arkadaşlarımla tartışmak için argümanlar (çıkarım, kanıt) üretirir.",
        "sourceCell": "C13"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metnin entelektüel merakına ve araştırmacı kişiliğine katkısını değerlendirir.",
        "sourceCell": "C14"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metin hakkında öğretmenin ve arkadaşlarının fikirlerini öğrendikten sonra kendi görüşleriyle karşılaştırır.",
        "sourceCell": "C15"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metinde geçen çatışmalara alternatif çözümler üretir./ Okuduğu metin öğretici metinse örnek metin oluşturur.",
        "sourceCell": "C16"
      },
      {
        "group": "Kitap okuma",
        "text": "Okuduğu metnin farklı disiplinlerle(psikoloji, tarih, felsefe, coğrafya vb.) ilişkilerini tespit eder.",
        "sourceCell": "C17"
      }
    ],
    "source": {
      "file": "9. SINIF 1. DÖNEM 2. PERFORMANS ÖLÇEĞİ.xlsx",
      "sheet": "2.Tema_Kitap"
    }
  },
  "donem1_ders_ici": {
    "key": "donem1_ders_ici",
    "title": "Ders içi performans",
    "performance": 2,
    "weight": 34,
    "maxScore": 18,
    "criteria": [
      {
        "group": "Ders içi davranış",
        "text": "Derse hazırlıklı ve planlı gelme, ders dışı etkinliklerini gerçekleştirme",
        "sourceCell": "C4"
      },
      {
        "group": "Ders içi davranış",
        "text": "Ders için gerekli araç gereçleri getirerek, düzenli ve temiz kullanma",
        "sourceCell": "C5"
      },
      {
        "group": "Ders içi davranış",
        "text": "Türkçe'yi doğru ve düzgün konuşma ve yazma",
        "sourceCell": "C6"
      },
      {
        "group": "Ders içi davranış",
        "text": "Derse karşı olumlu davranış geliştirme ve aktif katılma",
        "sourceCell": "C7"
      },
      {
        "group": "Ders içi davranış",
        "text": "Arkadaşlarıyla işbirliği yapma (Grup çalışmalarına katılma)",
        "sourceCell": "C8"
      },
      {
        "group": "Ders içi davranış",
        "text": "Verilen ödevleri (görevleri) zamanında yapma",
        "sourceCell": "C9"
      }
    ],
    "source": {
      "file": "9. SINIF 1. DÖNEM 2. PERFORMANS ÖLÇEĞİ.xlsx",
      "sheet": "Ders_İçi"
    }
  }
};
    if (typeof module === "object" && module.exports) module.exports = rubrics;
    else root.OlcekRubrics = rubrics;
})(typeof window === "undefined" ? this : window);
