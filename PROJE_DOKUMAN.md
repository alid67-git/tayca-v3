# Kolay Tayca Öğrenme — Proje Dökümanı
**Claude Code için kapsamlı teknik ve içerik rehberi**
**Son güncelleme: v3.55**

---

## 1. PROJE GENEL BİLGİ
- **Kullanıcı:** Ali Dinçer, Türk, Phuket'te yaşıyor
- **Dil:** Uygulama içi iletişim Türkçe
- **Zamir tercihi:** Erkek (ผม/pom, ครับ/khrap) — tüm içerik buna göre
- **GitHub:** https://alid67-git.github.io/tayca-v3/tayca-v3.html
- **Amaç:** Phuket'te günlük hayatta kullanılan Tayca öğretmek

---

## 2. DOSYA YAPISI (v3.54)

```
tayca-v3.html     (~228 KB)  — Ana uygulama: CSS + HTML + JS motoru
ders1.js … ders19.js         — Senaryo dersleri (lazy load)
ders20.js … ders48.js        — BONUS CORE 2000 kelime setleri
tools/enrich-bonus.mjs       — BONUS kelimelere Thai ekleme scripti
index.html                   — tayca-v3.html yonlendirme
```

**Tüm dosyalar GitHub'da aynı klasörde olmalı.**

---

## 3. KRİTİK MİMARİ KARARLAR

### 3.1 Lazy Load Sistemi
Ders verileri sayfa açılışında yüklenmez. Kullanıcı ders kartına tıklayınca ilgili `dersN.js` dosyası dinamik olarak yüklenir:

```javascript
const LESSONS = {};
const _lessonLoading = {};
async function loadDers(num){
  if(LESSONS[num]) return;
  if(_lessonLoading[num]) return _lessonLoading[num];
  _lessonLoading[num] = new Promise((resolve, reject)=>{
    const script = document.createElement('script');
    script.src = `ders${num}.js?v=v3.18`;  // Cache buster!
    script.onload = ()=>{ resolve(); delete _lessonLoading[num]; };
    script.onerror = ()=>{ reject(new Error('Ders '+num+' yüklenemedi')); };
    document.head.appendChild(script);
  });
  return _lessonLoading[num];
}
```

**Her dersN.js dosyasının sonunda:** `LESSONS[N] = LN;` satırı olmalı.
**openLesson async olmalı:**

```javascript
async function openLesson(num){
  const meta = LESSONS_META.find(m=>m.num===num);
  if(!meta) return;
  await loadDers(num);
  const lessonData = LESSONS[num];
  if(!lessonData) return;
  // ...
}
```

### 3.2 Thai Karakter Enjeksiyonu
Thai karakterler HTML'de `<script type="application/json" id="thai-data">` bloğunda tutulur. `ders1.js` yüklenince bu veriyi L1'e enjekte eder:

```javascript
// ders1.js'in SONUNDA:
(function(){
  const thaiDataEl = document.getElementById('thai-data');
  if(!thaiDataEl) return;
  const THAI = JSON.parse(thaiDataEl.textContent);
  THAI.words.forEach((tw,i)=>{
    if(L1.words[i]){
      L1.words[i].th = tw.th;
      (tw.examples||[]).forEach((ex,j)=>{ 
        if(L1.words[i].examples[j]) L1.words[i].examples[j].th = ex; 
      });
    }
  });
  // speaking, dialogues, listening, tones, grammar için de aynısı...
})();
```

### 3.3 Click Event Delegation
Tüm click eventleri tek bir `document.addEventListener('click')` üzerinden geçer:

```javascript
document.addEventListener('click', function(e){
  const speakEl = e.target.closest('[data-speak]');
  if(speakEl){ speak(...); return; }
  const starEl = e.target.closest('[data-star]');
  if(starEl){ toggleStar(...); return; }
  // vb.
});
```

**Inline `onclick` kullanma** — sadece zorunlu durumlarda (örn. SRS değerlendirme butonları) kullanılıyor.

### 3.4 Cache Busting
- HTML'de meta tagları: `Cache-Control: no-cache, no-store, must-revalidate`
- Service Worker temizleme: `navigator.serviceWorker.getRegistrations().then(...)`
- Versiyon kontrolü localStorage ile: `APP_VERSION` değişkeni
- Script src'de `?v=v3.18` query string

### 3.5 Versiyon Yükseltme Kuralı
Her değişiklikte:
1. `APP_VERSION = 'v3.18'` → arttır
2. `<span id="app-version">v3.18</span>` → güncelle
3. `help-overlay` içindeki changelog'a yeni giriş ekle
4. `script src` query string'ini güncelle: `ders${num}.js?v=v3.19`

---

## 4. VERİ YAPISI

### 4.1 LESSONS_META Dizisi

```javascript
const LESSONS_META = [
  {num:1, emoji:'👋', title:'Temel İfadeler ve Tanışma', hasContent:true, hasTones:true},
  {num:2, emoji:'🔢', title:'Sayılar ve Para',           hasContent:true, hasTones:false},
  // ...
  {num:10, emoji:'🏖️', title:'Plaj ve Deniz',           hasContent:false, hasTones:false},
  // 10-19 arası hasContent:false (henüz içerik yok)
];
```

### 4.2 Ders Verisi Yapısı (her dersN.js)

```javascript
const LN = {
  tones:[],       // Sadece L1'de dolu. Diğerlerinde boş dizi []
  words:[
    {
      id:'w1',
      th:'สวัสดีครับ',     // Thai karakter (ders1.js için injection ile gelir)
      ro:'sa-wat-dee-khrap', // Romanizasyon (okunuş)
      tr:'Merhaba',          // Türkçe anlam
      tip:'...',             // Telaffuz ipucu
      ctx:'...',             // Bağlam notu
      examples:[
        {
          th:'...',
          ro:'...',
          tr:'...',
          bd:[  // Breakdown (cümle analizi)
            {ro:'pom', tr:'ben', role:'S - Ozne'},
            {ro:'chue', tr:'adı', role:'V - Yuklem'},
            // role değerleri: S - Ozne, V - Yuklem, O - Nesne,
            //                 Kibar, Soru/Olumsuz, Edat, Aspect, Kelime, Vurgu
          ]
        }
      ]
    }
  ],
  grammar:[
    {
      title:'1. Kural Adı',
      formula:'KALIP + YAPI',
      explain:'Açıklama metni',
      tips:['ipucu 1', 'ipucu 2'],
      examples:[{th:'...', ro:'...', tr:'...', bd:[...]}]
    }
  ],
  speaking:[
    {task:'Görev adı', th:'...', ro:'...', tr:'...', bd:[...]}
  ],
  dialogues:[
    {
      title:'🏪 Başlık',
      lines:[
        {s:'Ali', th:'...', ro:'...', tr:'...', bd:[...]},
        {s:'Nada', th:'...', ro:'...', tr:'...', bd:[...]}
        // s: 'Ali' (erkek, düşük pitch) veya 'Nada' (kadın, yüksek pitch)
      ]
    }
  ],
  listening:[
    {diff:'easy',  th:'...', q:'Soru?', opts:['A','B','C'], c:0}
    // diff: 'easy' | 'medium' | 'hard'
    // c: doğru cevabın index'i (0-based)
  ],
  quiz:[
    {q:'Soru metni?', opts:['A','B','C','D'], c:2}
    // c: doğru cevabın index'i
  ]
};
LESSONS[N] = LN;  // Dosya sonunda mutlaka bu satır!
```

### 4.3 Ders 2 Özel Alanları
Ders 2'de ekstra:

```javascript
numbers:[
  {n:0, thai:'๐', word:'ศูนย์', roman:'sǔun', tr:'sıfır'},
  // ...
],
compounds:[
  {n:145, thai:'หนึ่งร้อยสี่สิบห้า', roman:'...', tr:'yüz kırk beş',
   breakdown:[{val:'100', th:'หนึ่งร้อย', rm:'nùeng-rɔ́ɔi'}, ...]}
],
```

### 4.4 Sekme Sistemi

```javascript
function getTabsForLesson(meta){
  if(meta.hasTones) 
    return ['words','tones','grammar','speaking','dialogue','listening','quiz'];
  if(meta.num===2)  
    return ['numbers','calc','words','grammar','speaking','dialogue','listening','quiz'];
  return ['words','grammar','speaking','dialogue','listening','quiz'];
}
```

---

## 5. localStorage ANAHTARLARI

| Anahtar | İçerik |
|---------|--------|
| `tv3_star` | Yıldızlanan kartlar `{key: {type, th, ro, tr, bd}}` |
| `tv3_visited` | Ziyaret edilen sekmeler `{'L1_words': true, ...}` |
| `tv3_stats` | Ders istatistikleri `{1: {totalSec, quizCorrect, quizTotal, ...}}` |
| `tv3_complete` | Tamamlanan ders numaraları `[1, 2, 3]` |
| `tv3_srs` | SRS kart veritabanı (SM-2 algoritması) |
| `app_version` | Versiyon kontrolü için `'v3.18'` |
| `tayca_api_key` | Anthropic API key (ayarlar) |
| `tayca_gist_token` | GitHub Gist token (ayarlar) |

---

## 6. SRS (ARALIKLI TEKRAR) SİSTEMİ

SM-2 algoritması tabanlı. `const SRS = {...}` objesi:

```javascript
// Kart yapısı:
{
  id: 'L1_w_w1',    // prefix: L{num}_w_ (kelime), _ex_ (örnek), _sp_ (konuşma)
  th, ro, tr,        // kart içeriği
  lessonNum: 1,
  type: 'word',      // 'word' | 'example' | 'speaking'
  interval: 1,       // gün
  easeFactor: 2.5,   // başlangıç
  nextReview: Date.now(),
  reps: 0,
  lapses: 0,
}
// Değerlendirme q değerleri:
// 0 = Bilmiyorum → 1 gün interval
// 1 = Zor        → interval * 1.2
// 2 = Normal     → SM-2 formülü
// 3 = Kolay      → interval * easeFactor * 1.3
```

**Kart türleri:**
- Yeni kart (reps===0) → her zaman Flashcard
- Tekrarlı kart → %50 Flashcard, %50 Çoktan Seçmeli

---

## 7. TEST MODÜLÜ (📝 Test Sekmesi)

**3 ana seçenek:**

### 7.1 Tek Ders
- Ders listesi → ders seç
- Konu filtresi: Tümü / Zamirler / İfadeler / Gramer
- Kart modu: Flashcard / Çoktan Seçmeli / Karma
- Yön: Thai→Türkçe / Türkçe→Thai / Karma

### 7.2 Tüm Dersler
- Sadece `isCompleted(num)` olan dersler dahil edilir
- Tüm kartlar karışık gelir

### 7.3 Yıldızlılar
- `localStorage.getItem('tv3_star')` dan kartlar
- `lessonNum: 0` (tüm havuzdan yanlış seçenek üretilir)

**Önemli:** `lessonNum=0` veya null ise `getWrongOptions()` tüm derslerden yanlış seçenek alır:

```javascript
const lessons = (lessonNum && LESSONS[lessonNum])
  ? [LESSONS[lessonNum]]
  : Object.values(LESSONS).filter(Boolean);
```

**Test akışı:**
1. `renderTestView()` → 3 kart seçenek ekranı
2. `openTestModeMenu('lesson'|'all'|'starred')` → mod seçim
3. `selectTestLesson(num)` → ders + filtre seçimi
4. `startFromState()` → kartları karıştır, `testState` hazırla
5. `showTestCard()` → Flashcard veya MC render
6. `recordTestAnswer(bool)` → ileri git
7. `showTestResult()` → sonuç + yanlışlar listesi

---

## 8. SEKMELERİN GÖRSELİ

### Sekme Buton Durumları (CSS `::before` ile)
- `○` (gri) → ziyaret edilmedi
- `★` (yeşil, `#e0f2f1` arka plan) → ziyaret edildi
- `★` (beyaz, `#0d9488` arka plan) → şu an aktif

### Çift Tıklama ile Ziyaret Sıfırlama

```javascript
let lastTap = 0;
btn.addEventListener('click',(e)=>{
  const now = Date.now();
  if(now - lastTap < 300 && visitedTabs[vkey]){
    delete visitedTabs[vkey];
    saveVisited();
    btn.classList.remove('visited');
    btn.style.transform = 'scale(.88)';
    setTimeout(()=>btn.style.transform='', 200);
    lastTap = 0;
    return;
  }
  lastTap = now;
  switchLessonTab(tab, btn);
});
```

### Ders Tamamlama
1. Tüm sekmeler ziyaret edilmeli
2. Quiz sekmesinde "✅ Dersi Tamamladım" butonu görünür
3. `markLessonDone(num)` → `completedLessons[]` array'ine ekler
4. Ders kartında 🎉 Tamamlandı rozeti

---

## 9. SES SİSTEMİ (Web Speech API)

```javascript
function speak(text, slow, gender){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH';
  if(gender==='m'){      // Ali (erkek)
    u.pitch = slow ? 0.65 : 0.70;
    u.rate  = slow ? 0.35 : 0.80;
  } else if(gender==='f'){ // Nada (kadın)
    u.pitch = slow ? 1.65 : 1.75;
    u.rate  = slow ? 0.40 : 0.90;
  }
  // Ses motoru seçimi + speak()
}
```

- 🔊 butonu → normal hız
- 🐢 butonu → yavaş mod
- Diyalog oynatma: Ali erkek pitch, Nada kadın pitch

---

## 10. CÜMLE ANALİZİ MODALİ

`showGramModal(th, tr, bdJson)` veya `openGramModal(th, tr, bd)` ile açılır.

**Renk kodları:**

| Role değeri | Renk | Anlam |
|-------------|------|-------|
| `S - Ozne` | Mavi `#eff6ff` | Özne |
| `V - Yuklem` | Yeşil `#f0fdf4` | Yüklem |
| `O - Nesne` | Sarı `#fffbeb` | Nesne |
| `Kibar` | Teal `#f0fdfa` | Kibar eki |
| `Soru/Olumsuz` | Kırmızı `#fef2f2` | Soru/Olumsuz |
| `Edat` | Mor `#f5f3ff` | Edat |
| `Aspect` | Turuncu `#fff7ed` | Aspect |
| `Kelime` | Gri | Diğer |

---

## 11. PROGRESS BAR
- **Header'da:** Tamamlanan ders sayısı / 19
- **Mantık:** Tamamlanan ders = 1 puan, kısmen ziyaret = orantılı puan
- `updateProgressBar()` → her sekme ziyaretinde ve ders tamamlamada çağrılır

---

## 12. CANLI TIMER
Ders açılınca `startLessonTimer(num)` başlar, kapanınca `stopLessonTimer()` elapsed süreyi `tv3_stats`'a kaydeder.

---

## 13. YILDIZLAMA SİSTEMİ

```javascript
function toggleStar(key, type, th, ro, tr, el, bd){
  if(starred[key]){ delete starred[key]; }
  else {
    const obj = {type, th, ro, tr};
    if(bd) obj.bd = typeof bd==='string' ? JSON.parse(bd) : bd;
    starred[key] = obj;
  }
  saveStars();
  if(el) el.classList.toggle('on', !!starred[key]);
}
```

- Kelime, örnek cümle ve diyalog satırları yıldızlanabilir
- Liste sekmesinde filtrelenir (Tümü / Sözcükler / Örnekler / Diyalog)
- Yıldızlı kartlar Test → Yıldızlılar'da test edilebilir

---

## 14. MEVCUT DERSLER (v3.54)

| # | Emoji | Başlık | Durum |
|---|-------|--------|-------|
| 1-9 | — | Temel senaryo dersleri | Tam icerik |
| 10 | 🏖️ | Plaj ve Deniz | Tam icerik |
| 11 | 🏥 | Hastane ve Eczane | Tam icerik (kritik) |
| 12 | 🆘 | Acil Durumlar | Tam icerik (191/1669/199) |
| 13-19 | — | Ev, Sosyal, Immigration, Kultur, Tabela, LINE, Simulasyon | Tam icerik |
| 20-48 | ⭐ | BONUS Kelime setleri (29 set, ~1408 kelime) | Kelimeler + Quiz |

**Senaryo dersleri (1-19):** kelime, gramer, konusma, diyalog, dinleme, quiz sekmeleri.
**BONUS (20+):** sadece kelimeler + quiz. Thai karakterler kismen (`node tools/enrich-bonus.mjs` ile zenginlestirilir).

---

## 15. DERS 1 ÖZEL İÇERİK

### Kelimeler (w1-w17)
- w1: sa-wat-dee-khrap (Merhaba)
- w3: khob-khun (Teşekkür)
- w4: yin-dee-tii-dai-ruu-jak (Tanıştığıma memnun) ← **dai** dahil!
- w5: mai-pen-rai (Sorun değil)
- w6: khrap (Kibar eki - erkek)
- w8: pom (Ben - erkek)
- w9: khun (Sen/Siz)
- w10: chue (Ad)
- w11: maa jaak (Gelmek)
- w12: tham ngaan (Çalışmak)
- w13: yuu (Olmak/Yaşamak)
- w14: ayu (Yaş)
- w15: chan (Ben - kadın)
- w16: rao (Biz)
- w17: khao (O)

### Gramer (9 kural)
1. Thai Cümle Yapısı (SVO)
2. Kibar Ekler (khrap/kha)
3. Olumsuzluk (mai)
4. Soru Yapısı
5. Kendini Tanıtma
6. Zaman Belirteci
7. Sahiplik (khong)
8. Karşılaştırma (kwaa / tii-sut)
9. **Kişi Zamirleri** — pom/chan/khun/khao/rao/phuak-khao (12 örnek)

### Quiz: 20 soru
- İlk 6 soru: zamir odaklı
- Kalan 14: kelimeler, gramer, kibar ekler

---

## 16. KOD YAZARKEN DİKKAT EDİLECEKLER

### Apostrof Sorunları
JS string içinde Thai metin kullanılınca apostrof çakışması olur:

```javascript
// YANLIŞ:
onclick="speak('ยินดีต้อนรับ', 0)"
// DOĞRU — ayrı fonksiyon:
onclick="speakTestWord()"
function speakTestWord(){
  const u = new SpeechSynthesisUtterance(card.th||card.ro);
  // ...
}
```

### Template Literal içinde font-family

```javascript
// YANLIŞ:
`style="font-family:'Noto Sans Thai'"` // apostrof çakışır
// DOĞRU — DOM ile oluştur:
const btn = document.createElement('button');
btn.style.fontFamily = "'Noto Sans Thai', sans-serif";
```

### tip/ctx alanlarında apostrof

```javascript
// YANLIŞ:
tip:"Phuket'te kullanılır"  // tırnak türü karışınca bozulur
// DOĞRU:
tip:'Phuket te kullanilir'  // Türkçe karakterler de kaçınılır (ASCII)
```

### Syntax Kontrol (her değişiklikten sonra)

```bash
node --check tayca-v3.html
```

---

## 17. CSS RENK PALETİ

```css
/* Ana renkler */
header: linear-gradient(135deg, #0d9488, #06b6d4)
primary: #0d9488  (teal)
primary-dark: #0f766e
primary-light: #e0f2f1
/* Cümle analizi */
S (Özne):     #eff6ff (mavi açık), #3b82f6 (yazı)
V (Yüklem):   #f0fdf4 (yeşil açık), #10b981 (yazı)
O (Nesne):    #fffbeb (sarı açık), #f59e0b (yazı)
Kibar:        #f0fdfa (teal açık), #0d9488 (yazı)
Soru/Olumsuz: #fef2f2 (kırmızı açık), #ef4444 (yazı)
Edat:         #f5f3ff (mor açık), #7c3aed (yazı)
```

---

## 18. PLANLANMIŞ / EKSİK ÖZELLİKLER

### Yüksek Öncelik
1. **Dersler 10-19 içerik** — `hasContent:false` olan 10 ders için veri eklenmesi
2. **Test modülü iyileştirme** — köşe durumlar

### Orta Öncelik
3. **Çeviri modülü** — `translate-view` placeholder → Claude API entegrasyonu
4. **Ekle modülü** — `add-view` placeholder → kullanıcı kelime ekleyebilsin

### Düşük Öncelik
5. **Her ders için Flashcard sekmesi** (SRS'ten bağımsız)
6. **SRS istatistikleri sayfası** — öğrenme grafiği, streak sayacı

---

## 19. VERSİYON GEÇMİŞİ (Özet)

| Versiyon | Önemli değişiklik |
|----------|-------------------|
| v3.00 | SRS, test, yıldızlama, diyalog, 9 ders |
| v3.02 | Cümle analizi S/V/O, yin-dee düzeltmesi, Ders 2 sayılar |
| v3.04 | Canlı ders timer, quiz/dinleme skor |
| v3.05 | Manuel ders tamamlama, "✅ Dersi Tamamladım" butonu |
| v3.06 | Sekme butonları: ○/★ görsel sistemi |
| v3.08 | Sekme çift tıklama → ziyaret sıfırla |
| v3.09 | khrap/kha tekrarları kaldırıldı, chan/rao/khao kelimeleri |
| v3.10 | Kişi zamirleri tablosu, Gramer 9. kural |
| v3.11 | Quiz 20 soruya, gramer örnekleri 12'ye |
| v3.12 | Test modülü tam işlevsel |
| v3.13 | Test: 3 seçenek menüsü (Tek/Tüm/Yıldızlı) |
| v3.14 | Test script error düzeltmeleri |
| v3.16 | Tüm Dersler sadece tamamlanmış dersleri getiriyor |
| v3.17 | Cache-busting (GitHub kısayol sorunu çözüldü) |
| v3.18 | **Dosya bölme**: ders1-9.js ayrı, HTML 132KB'a düştü |

---

## 20. CLAUDE CODE İÇİN TAVSİYELER
1. **Her değişiklikten sonra `node --check`** ile syntax kontrol et
2. **Versiyon numarasını arttır** — APP_VERSION, span, changelog, script src query string
3. **Ders verisi değişikliklerinde** ilgili `dersN.js` dosyasını güncelle, HTML'e dokunma
4. **Thai karakterleri** ders1.js'de `L1.words[i].th = ...` şeklinde atanır, data JSON'da tutulur
5. **Apostrof içeren metinler** JS string'inde `'` tırnak içinde `'` karakteri sorun yaratır — ASCII kullan
6. **Test modülünde** `testState._lessonNum` 0 veya null ise tüm ders havuzundan yanlış seçenek al
7. **GitHub'a push sonrası** cache sorununu önlemek için script src'deki versiyon query'sini güncelle

---

# BÖLÜM 1: HER DERSİN SEKME YAPISI

## 1.1 Standart Sekmeler (tüm dersler)
```
📚 Sözcükler → 📖 Gramer → 🗣️ Konuşma → 👥 Diyalog → 🎧 Dinleme → 📝 Quiz
```

## 1.2 Ders 1 Özel Sekmeler
```
📚 Sözcükler → 🎵 Tonlar → 📖 Gramer → 🗣️ Konuşma → 👥 Diyalog → 🎧 Dinleme → 📝 Quiz
```

## 1.3 Ders 2 Özel Sekmeler (numbers ve calc BAŞA gelir)
```
🔢 Sayılar → 🧮 Hesapla → 📚 Sözcükler → 📖 Gramer → 🗣️ Konuşma → 👥 Diyalog → 🎧 Dinleme → 📝 Quiz
```

## 1.4 Sekme Ziyaret Takibi
- Her sekme ziyaret edildiğinde `visitedTabs['L{num}_{tab}'] = true` olarak kaydedilir
- Ziyaret edilen sekmede `★` yeşil gösterilir
- Ziyaret edilmemiş sekme `○` gri gösterilir
- Çift tıklama (300ms içinde) → o sekmenin ziyaret kaydı silinir (titreme animasyonu ile)
- Tüm sekmeler ziyaret edilince "✅ Dersi Tamamladım" butonu aktif olur

## 1.5 Ders Tamamlama Koşulu
1. Dersin TÜM sekmelerini ziyaret et
2. Quiz sekmesindeki "✅ Dersi Tamamladım" butonuna bas
3. `completedLessons[]` array'ine o ders numarası eklenir
4. Ders kartında 🎉 Tamamlandı rozeti gösterilir, renk değişir
5. Progress bar güncellenir

---

# BÖLÜM 2: HER SEKMENİN DETAYLI YAPISI

## 2.1 📚 Sözcükler Sekmesi
- Ders 1'de başa kişi zamirleri hızlı referans tablosu (özel)
- Her kelime kartı: Thai (soluk gri) + Romanizasyon (koyu siyah) + Türkçe
- Kelime kartı sağda: ⭐ yıldız butonu, 🔊 normal ses, 🐢 yavaş ses
- Her kelimede: `tip` (telaffuz ipucu) + `ctx` (bağlam notu)
- Her kelime altında: örnek cümleler listesi
- Eğer `bd` (breakdown) verisi varsa → cümleye tıklanınca Cümle Analizi Modalı açılır

**Ders 1 kişi zamirleri tablosu:**
| Kişi | Thai | Okunuş | Not |
|------|------|--------|-----|
| Ben (E) | ผม | pom | Erkek |
| Ben (K) | ฉัน | chan | Kadın |
| Sen/Siz | คุณ | khun | Kibar, herkese |
| O | เขา | khao | E+K aynı kelime |
| Biz | เรา | rao | + samimi "ben" |
| Siz (çoğul) | พวกคุณ | phuak-khun | Grup hitabı |
| Onlar | พวกเขา | phuak-khao | phuak=grup |

## 2.2 🎵 Tonlar Sekmesi (Yalnızca Ders 1)
5 ton kartı: Orta (gri), Alçak (mavi), Düşen (kırmızı), Yüksek (sarı), Yükselen (yeşil)
Her tonda 5 örnek kelime + 🔊 ve 🐢 butonları

## 2.3 📖 Gramer Sekmesi
- Her kural bir kart: mor sol kenar
- Kural başlığı, formül kutusu, açıklama metni, `tips` array
- Her örnek cümlede 📖 ikonu → Cümle Analizi Modalı

## 2.4 🗣️ Konuşma Sekmesi
- Görev listesi: numaralı görev + Thai + Romanizasyon + Türkçe
- 🔊 Dinle + 🐢 Yavaş butonları
- Thai metne tıklanınca Cümle Analizi Modalı (bd varsa)

## 2.5 👥 Diyalog Sekmesi
- Ali satırları mavi kabarcık (sol), Nada satırları pembe kabarcık (sağ)
- ▶ Tümü butonu → `playDialogue(di)` → satırlar sırayla okunur, aktif satır sarı vurgulanır
- Ali pitch: 0.4 / rate: 0.82 | Nada pitch: 1.8 / rate: 0.82

## 2.6 🎧 Dinleme Sekmesi
- Zorluk rozeti: ⭐ Kolay / ⭐⭐ Orta / ⭐⭐⭐ Zor
- 🔊 SESİ DİNLE butonu, soru, 3 şık
- Her derste 10 soru: 3-4 Easy, 3-4 Medium, 2-3 Hard

## 2.7 📝 Quiz Sekmesi
- Çoktan seçmeli (4 şık), tıklanınca renk değişir
- "✅ Dersi Tamamladım" butonu — tüm sekmeler ziyaret edilmişse aktif

## 2.8 🔢 Sayılar Sekmesi (Yalnızca Ders 2)
3 grup: Temel Rakamlar (0-9), Onlar (10-100), Büyük Birimler (1000+)
Bileşik sayı örnekleri: 145, 350, 1500, 3550, 183500

## 2.9 🧮 Hesapla Sekmesi (Yalnızca Ders 2)
- 0-9.999.999 arası sayı girişi → anında Thai + romanizasyon + Türkçe
- `l2BuildThai` algoritması: 20 için "yii-sip", 11-19 için "sip + rakam"

---

# BÖLÜM 3: TEKRAR (SRS) MODÜLİ DETAYI

## 3.1 SM-2 Algoritması
```
q=0 (Bilmiyorum) → interval=1 gün, lapses++, reps=0
q=1 (Zor)        → interval = max(1, round(interval * 1.2))
q=2 (Normal)     → reps=0: 1gün | reps=1: 6gün | reps>1: round(interval * easeFactor)
q=3 (Kolay)      → reps=0: 4gün | reps=1: 10gün | reps>1: round(interval * easeFactor * 1.3)
```

## 3.2 Kart ID Formatı
```
L{lessonNum}_w_{wordId}       → kelime kartı
L{lessonNum}_ex_{wordId}_{n}  → örnek kart
L{lessonNum}_sp_{n}           → konuşma kartı
```

## 3.3 Karma Kart Modu
- Yeni kart (reps=0) → HER ZAMAN Flashcard
- Tekrarlı kart → %50 Flashcard, %50 Çoktan Seçmeli
- Yön → reps<2: Thai→Türkçe; reps≥2: %60 Thai→TR, %40 TR→Thai

---

# BÖLÜM 4: TEST MODÜLİ DETAYI

## 4.1 Ana Menü
- 📚 Tek Ders → Ders Seç → Konu Filtresi → Mod + Yön → Başlat
- 🗂️ Tüm Dersler → sadece `isCompleted(num)` olanlar
- ⭐ Yıldızlılar → localStorage'dan kartlar

## 4.2 Konu Filtresi
```javascript
// Kategoriler: 'all' | 'pronouns' | 'phrases' | 'grammar'
```

## 4.3 Yanlış Seçenek Üretimi
```javascript
// lessonNum=0 veya null → tüm derslerden havuz
// lessonNum=N → sadece o dersten havuz
```

## 4.4 Sonuç Ekranı
- Büyük emoji (🏆/🎯/👍/📚), puan yüzdesi, doğru/yanlış sayısı
- Yanlışlar listesi: Thai + Romanizasyon + Türkçe
- "🔄 Tekrar" → aynı kartlarla | "← Ana Menü"

---

# BÖLÜM 5: CÜMLE ANALİZİ MODALİ

Açıldığı yerler: Gramer örnekleri, Sözcükler örnekleri, Konuşma görevi, Diyalog satırları, Liste sekmesi

Her `bd` array elemanı:
```javascript
{ro: 'pom', tr: 'ben', role: 'S - Ozne'}
```

---

# BÖLÜM 6: YAPILACAKLAR

## 🔴 Yüksek Öncelik
- **Dersler 10-19 içerik** — öneri sırası: Ders 10 (Plaj) → 11 (Hastane) → 12 (Acil)
- **hasContent güncelleme** — `LESSONS_META[N-1].hasContent = true`

## 🟡 Orta Öncelik
- **Çeviri modülü** (`translate-view`) — Claude API entegrasyonu
- **Ekle modülü** (`add-view`) — kullanıcı kelime ekleyebilsin

## 🟢 Düşük Öncelik
- **SRS istatistik sayfası** — streak, grafik
- **Ders Flashcard sekmesi** — SRS'ten bağımsız

---

# BÖLÜM 7: MEVCUT DERSLER DETAY İÇERİĞİ

**Ders 1 — 👋 Temel İfadeler ve Tanışma**
- 17 kelime, 9 gramer kuralı, 12 konuşma, 5 diyalog, 10 dinleme, 20 quiz
- Özel: Tonlar sekmesi, Kişi zamirleri tablosu

**Ders 2 — 🔢 Sayılar ve Para**
- 7 kelime, 2 gramer kuralı, 8 konuşma, 2 diyalog, 10 dinleme, 10 quiz
- Özel: Sayılar + Hesapla sekmeleri

**Ders 3 — 🕐 Tarih ve Saat**
- 10 kelime: wan-nii, proong-nii, meua-waan, kii-mong, mong, wan, nat, duan, pii, ton
- 3 gramer kuralı, 8 konuşma, 4 diyalog, 10 dinleme, 10 quiz

**Ders 4 — 🍜 Restoran**
- 10 kelime: raan-aa-haan, aa-haan, me-nuu, sang, phet, a-roi, chek-bin, naam, khao-phat, phat-thai
- 2 gramer kuralı, 8 konuşma, 4 diyalog, 10 dinleme, 10 quiz

**Ders 5 — 🛒 Market ve Alışveriş**
- 10 kelime: sue, raa-khaa, lot, phaeng, thuuk, mii, jai, kha-nat, long, thueng
- 2 gramer kuralı, 8 konuşma, 4 diyalog, 10 dinleme, 10 quiz

**Ders 6 — 🗺️ Yol Tarifi**
- 10 kelime: thii-nai, trong-pai, liaw, glai(yakın), glai(uzak), tha-non, phaen-thii, khaang-khaang, dern, trong-nii
- 2 gramer kuralı, 8 konuşma, 4 diyalog, 10 dinleme, 10 quiz

**Ders 7 — 🚗 Grab ve Ulaşım**
- 10 kelime: taek-sii, ja-pai-thii, jot, reo, thueng laeo, sa-naam-bin, khit-ngoen, rot, aep Grab, plian
- 2 gramer kuralı, 8 konuşma, 4 diyalog, 10 dinleme, 10 quiz

**Ders 8 — 🏨 Otel ve Konaklama**
- 10 kelime: roong-raem, chek-in, hong-phak, jong, khueng, aae, phaa-chet-tua, rii-mot, sia, plian-hong
- 2 gramer kuralı, 8 konuşma, 4 diyalog, 10 dinleme, 10 quiz

**Ders 9 — 🏍️ Motorsiklet ve Trafik**
- 10 kelime: mot-toe-sai, chao, muak-gan-nok, naam-man, fai-daeng, pra-gan, yaang, tam-ruat, u-bat-ti-het, bai-khap-khii
- 2 gramer kuralı, 8 konuşma, 4 diyalog, 10 dinleme, 10 quiz

---

# BÖLÜM 8: ÖNERİLEN DERS 10-19 İÇERİKLERİ

| # | Konu | Öncelik |
|---|------|---------|
| 10 | 🏖️ Plaj ve Deniz | Orta |
| 11 | 🏥 Hastane ve Eczane | **Kritik** |
| 12 | 🆘 Acil Durumlar | **Kritik** |
| 13 | 🏠 Ev Yaşamı ve İnternet | Orta |
| 14 | 🎉 Sosyalleşme | Düşük |
| 15 | 🏦 Immigration ve Resmi İşler | Orta |
| 16 | 🙏 Thai Kültürü | Düşük |
| 17 | 🔤 Tabela ve Menü Okuma | Orta |
| 18 | 📱 LINE ve Telefon | Düşük |
| 19 | 🌴 Phuket Tam Gün Simülasyonu | Düşük |

**Ders 11 (Hastane) ve 12 (Acil) önce yapılmalı** — Phuket'te en kritik.
Acil numaralar: 191 (polis), 1669 (ambulans), 199 (itfaiye)

---

# BÖLÜM 9: VERSİYON YÜKSELTME KONTROL LİSTESİ

```
[ ] APP_VERSION = 'v3.XX' → arttır
[ ] <span id="app-version">v3.XX</span> → güncelle
[ ] help-overlay changelog'una yeni giriş ekle
[ ] script.src sorgu stringini güncelle: ders${num}.js?v=v3.XX
[ ] node --check ile syntax kontrol et
[ ] GitHub'a push et: tayca-v3.html + değişen dersN.js dosyaları
```

---

# BÖLÜM 10: SIK YAPILAN HATALAR VE ÇÖZÜMLERİ

**Hata 1: injectThai çalışmıyor**
`injectThai()` kodu `ders1.js`'in sonunda, `LESSONS[1] = L1` satırından sonra olmalı.

**Hata 2: Test başlatınca "Script error"**
`getWrongOptions` içinde `lessonNum && LESSONS[lessonNum]` kontrol et.

**Hata 3: Tüm Dersler testinde tamamlanmamış dersler geliyor**
```javascript
LESSONS_META.filter(m=>m.hasContent && isCompleted(m.num)).forEach(m=>{...})
```

**Hata 4: Sekme çift tıklama sıfırlamıyor**
Başarılı çift tıklamada `lastTap = 0` set et.

**Hata 5: Ders yüklenemiyor (GitHub'da)**
Versiyon stringini değiştir, cache-busting meta tagları HTML'de var.

**Hata 6: Flashcard ses butonu crash**
Inline onclick içinde Thai karakterler apostrof çakışması.
`speakTestWord()` ayrı fonksiyon kullan, `card.th` direkt oradan çek.

---

*Bu döküman Claude Code ile proje devam ettirilirken referans olarak kullanılmalıdır.*
