import { useState, useEffect, useRef, useCallback } from "react";

/* ── API ─────────────────────────────────────────────────────────────────────
   fawazahmed0/exchange-api → jsDelivr CDN | Key yok | CORS açık | Tarihsel veri
────────────────────────────────────────────────────────────────────────────── */
const CDN = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api";
const CF  = "https://latest.currency-api.pages.dev";
const ENERJI = { brent: 72.4, jet: 82.1 };

function dateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

async function fetchRates(tag) {
  const urls = [
    CDN + "@" + tag + "/v1/currencies/usd.json",
    CF + "/v1/currencies/usd.json",
  ];
  for (let i = 0; i < urls.length; i++) {
    try {
      const r = await fetch(urls[i]);
      if (!r.ok) continue;
      const d = await r.json();
      const rates = d && d.usd;
      if (!rates) continue;
      return { try_: rates.try || null, eur: rates.eur || null };
    } catch (_) { continue; }
  }
  return null;
}

/* ── FİNANSAL VERİLER ──────────────────────────────────────────────────────── */
const FIN = [
  {
    id:"thy", ad:"Turkish Airlines", kod:"THYAO", bors:"BIST", renk:"#C8102E",
    mali:"Ocak-Aralık", siklik:"Çeyreklik",
    ir:"https://investor.turkishairlines.com",
    ir_kaynak:"THYAO Yatırımcı İlişkileri",
    yil:{
      "2022":{g:16.8,ik:2.6, nk:2.4, p:71.4, lf:79.8, im:15.5, nm:14.3, f:411},
      "2023":{g:20.5,ik:3.6, nk:3.0, p:83.4, lf:82.3, im:17.6, nm:14.6, f:444},
      "2024":{g:22.7,ik:4.18,nk:3.42,p:90.2, lf:84.1, im:18.4, nm:15.1, f:492},
      "2025":{g:24.1,ik:3.65,nk:2.90,p:97.2, lf:84.8, im:15.1, nm:12.0, f:516},
    },
    q:[
      {d:"Q1 2026",g:5.9, nk:0.23, p:21.3,lf:83.8,url:"https://www.rustourismnews.com/2026/05/06/turkish-airlines-returns-to-strong-profit-despite-rising-operating-costs/",yeni:true},
      {d:"Q4 2025",g:5.2, nk:-0.1, p:22.4,lf:82.1,url:"https://investor.turkishairlines.com"},
      {d:"Q3 2025",g:7.0, nk:0.23, p:26.1,lf:85.2,url:"https://investor.turkishairlines.com"},
      {d:"Q2 2025",g:6.3, nk:0.88, p:24.8,lf:84.9,url:"https://investor.turkishairlines.com"},
    ],
  },
  {
    id:"emirates", ad:"Emirates", kod:"EK", bors:"Halka acik degil", renk:"#CC0001",
    mali:"Nisan-Mart", siklik:"Yıllık/Yarıyıl",
    ir:"https://www.emirates.com/media-centre/",
    ir_kaynak:"Emirates Group Annual Report",
    not:"OP ayrıştırılmaz.",
    yil:{
      "2022":{g:26.0,ik:null,nk:1.5, p:45.7,lf:72.0,im:null,nm:5.8, f:259},
      "2023":{g:32.6,ik:null,nk:4.7, p:51.9,lf:78.4,im:null,nm:14.4,f:260},
      "2024":{g:36.9,ik:null,nk:4.7, p:52.1,lf:79.9,im:null,nm:12.7,f:261},
      "2025":{g:39.6,ik:null,nk:5.19,p:53.7,lf:78.9,im:null,nm:14.9,f:270},
    },
    q:[{d:"H1 2025-26",g:21.4,nk:3.2,p:27.8,lf:79.5,url:"https://www.emirates.com/media-centre/emirates-group-hits-new-half-year-profit-record-for-2025-26/",yeni:false}],
  },
  {
    id:"lufthansa", ad:"Lufthansa Group", kod:"LHA", bors:"XETRA", renk:"#05164D",
    mali:"Ocak-Aralık", siklik:"Çeyreklik",
    ir:"https://investor-relations.lufthansagroup.com",
    ir_kaynak:"Lufthansa Group IR",
    not:"EUR/USD ~1.08",
    yil:{
      "2022":{g:34.1,ik:1.5, nk:0.8, p:102.6,lf:78.4,im:4.4,nm:2.3, f:775},
      "2023":{g:38.8,ik:2.7, nk:1.7, p:123.0,lf:82.2,im:7.0,nm:4.4, f:783},
      "2024":{g:40.6,ik:1.78,nk:1.51,p:130.7,lf:83.1,im:4.4,nm:3.7, f:800},
      "2025":{g:42.7,ik:2.12,nk:1.40,p:135.0,lf:83.2,im:4.9,nm:3.3, f:821},
    },
    q:[
      {d:"Q1 2026",g:9.2, nk:0.31,p:33.2,lf:81.4,url:"https://investor-relations.lufthansagroup.com/en/financial-reports-publications.html",yeni:true},
      {d:"Q4 2025",g:9.8, nk:0.18,p:31.1,lf:80.9,url:"https://investor-relations.lufthansagroup.com",yeni:false},
      {d:"Q3 2025",g:12.1,nk:0.72,p:38.4,lf:86.3,url:"https://investor-relations.lufthansagroup.com",yeni:false},
    ],
  },
  {
    id:"afklm", ad:"Air France-KLM", kod:"AF", bors:"Euronext", renk:"#002157",
    mali:"Ocak-Aralık", siklik:"Çeyreklik",
    ir:"https://www.airfranceklm.com/en/investors",
    ir_kaynak:"Air France-KLM IR",
    not:"EUR/USD ~1.08",
    yil:{
      "2022":{g:28.9,ik:1.3, nk:0.7, p:88.1, lf:80.0,im:4.5,nm:2.4, f:522},
      "2023":{g:32.5,ik:1.7, nk:0.9, p:97.6, lf:86.4,im:5.2,nm:2.8, f:530},
      "2024":{g:33.8,ik:1.72,nk:1.06,p:98.0, lf:87.8,im:5.1,nm:3.1, f:541},
      "2025":{g:35.6,ik:2.16,nk:1.84,p:102.8,lf:87.2,im:6.1,nm:5.2, f:545},
    },
    q:[
      {d:"Q4 2025",g:8.1, nk:0.63,p:24.9,lf:85.1,url:"https://www.airfranceklm.com/sites/default/files/2026-02/afklm_full_year_2025_press_release_english.pdf",yeni:false},
      {d:"Q3 2025",g:9.8, nk:0.91,p:28.6,lf:88.4,url:"https://www.airfranceklm.com/en/investors",yeni:false},
      {d:"Q2 2025",g:8.4, nk:0.54,p:26.1,lf:87.2,url:"https://www.airfranceklm.com/en/investors",yeni:false},
    ],
  },
  {
    id:"iag", ad:"IAG", kod:"IAG", bors:"LSE/BME", renk:"#1B3A6B",
    mali:"Ocak-Aralık", siklik:"Çeyreklik",
    ir:"https://www.iairgroup.com/investors",
    ir_kaynak:"IAG Investor Relations",
    not:"EUR/USD ~1.08",
    yil:{
      "2022":{g:23.0,ik:1.5, nk:0.9, p:98.4, lf:82.0,im:6.5, nm:3.9, f:530},
      "2023":{g:29.3,ik:3.5, nk:2.7, p:116.0,lf:86.5,im:11.9,nm:9.2, f:540},
      "2024":{g:32.1,ik:4.05,nk:3.24,p:121.8,lf:86.8,im:12.6,nm:10.1,f:560},
      "2025":{g:34.5,ik:4.28,nk:3.56,p:127.5,lf:87.1,im:12.4,nm:10.3,f:571},
    },
    q:[
      {d:"Q1 2026",g:7.8, nk:0.61,p:30.2,lf:84.8,url:"https://www.iairgroup.com/investors/results-and-presentations",yeni:true},
      {d:"Q4 2025",g:8.1, nk:0.74,p:31.5,lf:85.2,url:"https://www.iairgroup.com/investors",yeni:false},
      {d:"Q3 2025",g:10.2,nk:1.42,p:36.1,lf:88.1,url:"https://www.iairgroup.com/investors",yeni:false},
    ],
  },
  {
    id:"qatar", ad:"Qatar Airways", kod:"QR", bors:"Halka acik degil", renk:"#5C0632",
    mali:"Nisan-Mart", siklik:"Yıllık",
    ir:"https://www.qatarairways.com/en/pressreleases.html",
    ir_kaynak:"Qatar Airways Newsroom",
    not:"Çeyreklik rapor yok.",
    yil:{
      "2022":{g:17.7,ik:null,nk:1.5, p:34.2,lf:72.0,im:null,nm:8.5, f:237},
      "2023":{g:21.1,ik:null,nk:1.7, p:40.0,lf:83.0,im:null,nm:8.1, f:250},
      "2024":{g:22.2,ik:null,nk:2.15,p:43.1,lf:85.0,im:null,nm:9.7, f:261},
      "2025":{g:23.6,ik:null,nk:1.94,p:41.8,lf:84.0,im:null,nm:8.2, f:262},
    },
  },
  {
    id:"delta", ad:"Delta Air Lines", kod:"DAL", bors:"NYSE", renk:"#003366",
    mali:"Ocak-Aralık", siklik:"Çeyreklik",
    ir:"https://ir.delta.com",
    ir_kaynak:"Delta Air Lines IR",
    yil:{
      "2022":{g:50.6,ik:3.7,nk:1.3, p:192.0,lf:83.0,im:7.3,nm:2.6, f:980},
      "2023":{g:58.0,ik:5.6,nk:4.6, p:200.0,lf:84.8,im:9.7,nm:7.9, f:1002},
      "2024":{g:61.6,ik:5.8,nk:3.5, p:204.0,lf:85.2,im:9.4,nm:5.7, f:1010},
      "2025":{g:62.9,ik:5.5,nk:3.2, p:205.0,lf:85.1,im:8.7,nm:5.1, f:1025},
    },
    q:[
      {d:"Q1 2026",g:14.0,nk:0.24,p:50.1,lf:83.2,url:"https://ir.delta.com/news-releases/news-release-details/delta-air-lines-announces-march-quarter-2026-financial-results",yeni:true},
      {d:"Q4 2025",g:15.6,nk:0.82,p:51.2,lf:84.1,url:"https://ir.delta.com",yeni:false},
    ],
  },
  {
    id:"singapore", ad:"Singapore Airlines", kod:"SIA", bors:"SGX", renk:"#004B87",
    mali:"Nisan-Mart", siklik:"Yarıyıl",
    ir:"https://www.singaporeair.com/en_UK/us/about-us/investor-relations/",
    ir_kaynak:"Singapore Airlines IR",
    not:"SGD/USD ~0.74",
    yil:{
      "2022":{g:10.5,ik:0.8, nk:0.9, p:22.4,lf:68.2,im:7.6, nm:8.6, f:180},
      "2023":{g:15.7,ik:2.1, nk:2.2, p:38.7,lf:85.1,im:13.4,nm:14.0,f:193},
      "2024":{g:17.0,ik:2.4, nk:2.0, p:41.5,lf:86.0,im:14.1,nm:11.8,f:201},
      "2025":{g:17.8,ik:2.3, nk:1.9, p:43.2,lf:86.4,im:12.9,nm:10.7,f:208},
    },
  },
];

const THY = FIN.find(h => h.id === "thy");

const METR_LIST = [
  { k:"g",  l:"Gelir (USD B)",     fmt: v => v != null ? "$" + v.toFixed(1) + "B" : "-",  renk:"#6366f1" },
  { k:"nk", l:"Net Kar (USD B)",   fmt: v => v != null ? (v >= 0 ? "+" : "") + "$" + Math.abs(v).toFixed(2) + "B" : "-", renk:"#10b981" },
  { k:"ik", l:"EBIT (USD B)",      fmt: v => v != null ? "$" + v.toFixed(2) + "B" : "-",  renk:"#0ea5e9" },
  { k:"im", l:"Isletme Marji %",   fmt: v => v != null ? v.toFixed(1) + "%" : "-",         renk:"#f59e0b" },
  { k:"nm", l:"Net Marj %",        fmt: v => v != null ? v.toFixed(1) + "%" : "-",         renk:"#8b5cf6" },
  { k:"p",  l:"Yolcu (M)",         fmt: v => v != null ? v.toFixed(1) + "M" : "-",         renk:"#ef4444" },
  { k:"lf", l:"Doluluk %",         fmt: v => v != null ? v.toFixed(1) + "%" : "-",         renk:"#14b8a6" },
  { k:"f",  l:"Filo (ucak)",       fmt: v => v != null ? String(v) : "-",                  renk:"#f97316" },
];

/* ── HABERLER (3 Kategori) ───────────────────────────────────────────────── */
// Kategori: "dagitim" | "finans" | "yasal"
const HABER_KKAT = [
  { id:"tumu",    l:"Tumu" },
  { id:"dagitim", l:"Dagitim & Teknoloji" },
  { id:"finans",  l:"Finans" },
  { id:"yasal",   l:"Yasal" },
];

const KRENK = { dagitim:"#6366f1", finans:"#10b981", yasal:"#f59e0b" };

const HABERLER = [
  {
    id:1, tarih:"11 Haz 2026", k:"dagitim", hy:"Amadeus",
    b:"Amadeus NDC rezervasyonları 500 milyon sınırını aştı",
    o:"Amadeus, NDC tabanlı rezervasyon hacminin 500 milyon bandını geçtiğini açıkladı. Dağıtım gelirleri yıllık bazda yüzde 18 arttı. Şirket, 2027 sonuna kadar NDC içerik payını yüzde 50'ye taşımayı hedefliyor. Bu başarıda Emirates, Turkish Airlines ve Air France-KLM ile imzalanan çok yıllı içerik anlaşmalarının belirleyici rol oynadığı belirtiliyor.",
    s:[{a:"Amadeus IR",u:"https://ir.amadeus.com/en/financial-news-and-events/press-releases"},{a:"PhocusWire",u:"https://www.phocuswire.com/amadeus-ndc-500-million-bookings"}],az:true
  },
  {
    id:2, tarih:"11 Haz 2026", k:"dagitim", hy:"Turkish Airlines",
    b:"Turkish Airlines Sabre acentelerine kapsamlı NDC teşvik paketi başlattı",
    o:"THY, Sabre GDS üzerinden gerçekleştirilen NDC rezervasyonlarına ek komisyon, erken koltuk seçimi ve öncelikli check-in hakkı tanıdı. Önce Türkiye ve 14 Avrupa pazarında uygulamaya giren program, 3. çeyrekte 40 pazara yayılacak. Program kapsamında acentelere hedef bazlı bonus yapısı da sunuluyor.",
    s:[{a:"THY Newsroom",u:"https://www.turkishairlines.com/en-int/press-room/news/"},{a:"Travel Weekly",u:"https://www.travelweekly.com/Travel-News/Airline-News/Turkish-Airlines-Sabre-NDC"}],az:true
  },
  {
    id:3, tarih:"9 Haz 2026", k:"dagitim", hy:"Tumu",
    b:"IATA ONE Order sertifikasyonu 60 havayolunu geçti",
    o:"IATA'nın ONE Order standardına katılan havayolu sayısı 60'a ulaştı. Wizz Air, Avrupa'da bu standardı benimseyen ilk düşük maliyetli havayolu olurken Finnair ve TAP da sertifikasyon sürecini tamamladı. ONE Order, bilet, otel, transfer ve sigorta gibi tüm seyahat unsurlarını tek bir kayıt altında birleştirerek PNR ve e-bilet gibi eski sistemlerin yerini almayı hedefliyor.",
    s:[{a:"IATA ONE Order",u:"https://www.iata.org/en/programs/ops-infra/one-order/"},{a:"PhocusWire",u:"https://www.phocuswire.com/iata-one-order-60-airlines"}],az:true
  },
  {
    id:4, tarih:"8 Haz 2026", k:"dagitim", hy:"Sabre",
    b:"Sabre SynXis Air NDC platformunu tüm GDS müşterilerine açtı",
    o:"Sabre, yeniden yapılandırılan SynXis Air içerik platformunu global acente ağına açtı. Yeni mimari, havayollarının dinamik fiyat tekliflerini milisaniyede dağıtmasına imkan tanıyor. Amadeus ve Travelport ile kızışan NDC altyapısı rekabetinde Sabre'ın bu hamlesi pazar dengesini yeniden şekillendiriyor.",
    s:[{a:"Sabre Newsroom",u:"https://www.sabre.com/insights/news/"},{a:"The Beat",u:"https://thebeat.travel"}],az:false
  },
  {
    id:5, tarih:"9 Haz 2026", k:"dagitim", hy:"Travelport",
    b:"Travelport AI destekli arama motorunu tüm GDS müşterilerine açtı",
    o:"Travelport'un Smartpoint Cloud platformuna entegre yapay zeka destekli arama ve fiyatlama motoru, işlem süresini yüzde 60 kısalttı. Motor, çok değişkenli tarife karşılaştırmasını gerçek zamanlı gerçekleştiriyor ve ajans verimliliğini önemli ölçüde artırıyor.",
    s:[{a:"Travelport Blog",u:"https://www.travelport.com/blog"},{a:"Skift",u:"https://skift.com/2026/06/06/travelport-ai-search-engine/"}],az:false
  },
  {
    id:6, tarih:"3 Haz 2026", k:"dagitim", hy:"Amadeus",
    b:"Amadeus ve IATA ONE Order entegrasyonunu tüm müşterilere açtı",
    o:"Amadeus, ONE Order standardının tüm GDS müşterileri için kullanıma hazır hale geldiğini duyurdu. Bilet, otel, transfer ve sigorta artık tek sipariş kaydında birleştirilebiliyor. Bu gelişme, havacılık dağıtımında PNR merkezli yapıdan sipariş merkezli yapıya geçişi hızlandırıyor.",
    s:[{a:"Amadeus ONE Order",u:"https://www.amadeus.com/en/portfolio/distribution/one-order"},{a:"IATA",u:"https://www.iata.org/en/programs/ops-infra/one-order/"}],az:true
  },
  {
    id:7, tarih:"7 Haz 2026", k:"dagitim", hy:"Emirates",
    b:"Emirates ile Amadeus çok yıllı NDC dağıtım anlaşmasını yeniledi",
    o:"Emirates, Amadeus platformu üzerinden tam NDC içerik paritesi ve dinamik paket fiyatlaması için yeni çok yıllı anlaşma imzaladı. Anlaşma, birinci ve business class premium tekliflerini de kapsıyor. Bu gelişme, Emirates'in doğrudan satış stratejisini terk etmeden GDS kanalını güçlendirme yaklaşımını teyit ediyor.",
    s:[{a:"Emirates Newsroom",u:"https://www.emirates.com/media-centre/"},{a:"Amadeus Newsroom",u:"https://ir.amadeus.com/en/financial-news-and-events/press-releases"}],az:true
  },
  {
    id:8, tarih:"3 Haz 2026", k:"dagitim", hy:"Singapore Airlines",
    b:"Singapore Airlines AI fiyatlama motorunu 12 pazara yaydı — dönüşüm oranı yüzde 31 arttı",
    o:"Singapore Airlines, bireysel yolcu profiline ve geçmiş rezervasyon verilerine göre dinamik teklifler sunan yapay zeka destekli fiyatlama motorunu 12 pazarda devreye aldı. İlk sonuçlar dönüşüm oranında yüzde 31 artış gösteriyor. Motor, Amadeus NDC altyapısı üzerinde çalışıyor ve kişiselleştirilmiş yan gelir ürünleri sunabiliyor.",
    s:[{a:"SIA Media Hub",u:"https://www.singaporeair.com/en_UK/us/about-us/press-room/news-releases/"},{a:"Skift",u:"https://skift.com/2026/06/03/singapore-airlines-ai-pricing/"}],az:true
  },
  {
    id:9, tarih:"6 Haz 2026", k:"finans", hy:"Tumu",
    b:"IATA Mayıs 2026: Küresel RPK büyümesi yüzde 9,2 ile beklentileri aştı",
    o:"IATA'nın Mayıs 2026 aylık yolcu analizi raporuna göre küresel yolcu talebi yıllık bazda yüzde 9,2 arttı. Asya-Pasifik bölgesi yüzde 14,1 büyüme ile öncülük etti. Küresel doluluk oranı (PLF) yüzde 83,7'ye ulaşarak son 5 yılın en yüksek seviyesine çıktı. Kapasite (ASK) artışı yüzde 7,4'te kalırken talep (RPK) arzın önünde gitmeye devam ediyor.",
    s:[{a:"IATA Air Passenger Market",u:"https://www.iata.org/en/publications/economics/air-passenger-monthly-analysis/"}],az:true
  },
  {
    id:10, tarih:"8 Haz 2026", k:"finans", hy:"Lufthansa",
    b:"Lufthansa Group 2025'te 39,6 milyar Euro rekor gelir ve yüzde 4,9 işletme marjı açıkladı",
    o:"Lufthansa Group'un 2025 yıllık raporuna göre konsolide gelir 39,6 milyar Euro ile tüm zamanların rekorunu kırdı. Düzeltilmiş EBIT yüzde 19 büyüyerek 2 milyar Euro'ya ulaştı. 135 milyon yolcu taşındı. Bununla birlikte çekirdek Lufthansa markasının marjı neredeyse sıfıra yakın seyrederken SWISS ve Austrian markaları grubu taşıdı.",
    s:[{a:"Lufthansa AR 2025",u:"https://report.lufthansagroup.com/2025/annual-report/en/"},{a:"Lufthansa Newsroom",u:"https://newsroom.lufthansagroup.com/en/lufthansa-group-increases-operating-profit-by-20-percent-and-achieves-highest-revenue-in-company-history/"}],az:true
  },
  {
    id:11, tarih:"5 Haz 2026", k:"finans", hy:"Air France-KLM",
    b:"Air France-KLM 2025'te 102,8 milyon yolcu ile tüm zamanların rekorunu kırdı",
    o:"Air France-KLM Grubu 2025 yılında 33 milyar Euro gelir ve 2 milyar Euro işletme karı ile tüm zamanların en iyi sonucuna ulaştı. 102,8 milyon yolcu taşındı. Ancak Transavia yüzde 15 kapasite büyümesine karşın zarar etmeye devam etti; KLM'deki maliyet baskısı grup karlılığını sınırlıyor.",
    s:[{a:"AF-KLM FY2025",u:"https://www.airfranceklm.com/sites/default/files/2026-02/afklm_full_year_2025_press_release_english.pdf"}],az:true
  },
  {
    id:12, tarih:"2 Haz 2026", k:"finans", hy:"Delta",
    b:"Delta Air Lines Q1 2026: Gelir 14 milyar dolar ancak beklentilerin altında kaldı",
    o:"Delta Air Lines 2026 ilk çeyreğinde 14 milyar dolar gelir açıkladı. Tarife ortamındaki baskı ve yakıt maliyetlerinin yüksekliği net karı yıllık bazda yüzde 41 düşürdü. Bununla birlikte şirket yıllık yönlendirmesini korudu. Transatlantik talepte belirgin güçlülük görülürken iç hat gelirleri baskı altında kaldı.",
    s:[{a:"Delta IR Q1 2026",u:"https://ir.delta.com/news-releases/news-release-details/delta-air-lines-announces-march-quarter-2026-financial-results"}],az:true
  },
  {
    id:13, tarih:"1 Haz 2026", k:"finans", hy:"IAG",
    b:"IAG Q1 2026: Güçlü transatlantik talep karı 610 milyon Euro'ya taşıdı",
    o:"IAG 2026 ilk çeyreğinde 7,8 milyar Euro gelir ve 610 milyon Euro net kar açıkladı. İspanya-ABD transatlantik hatlarında doluluk yüzde 88'i aştı. British Airways premium kabini rekor doluluk oranlarına ulaşırken Iberia Express Avrupa'nın en dakik havayolları arasındaki yerini korudu.",
    s:[{a:"IAG IR Q1 2026",u:"https://www.iairgroup.com/investors/results-and-presentations"}],az:true
  },
  {
    id:14, tarih:"6 Haz 2026", k:"finans", hy:"Turkish Airlines",
    b:"Turkish Airlines Q1 2026: Güçlü yolcu büyümesi ve 226 milyon dolar net kar",
    o:"THY 2026 ilk çeyreğinde 5,9 milyar dolar gelir ve 226 milyon dolar net kar açıkladı. 21,3 milyon yolcu taşındı, bu rakam yıllık bazda yüzde 12,7 artışa işaret ediyor. Doluluk oranı yüzde 83,8 olarak gerçekleşti. Artan operasyonel maliyetlere rağmen uzun hat gelirleri karı destekledi.",
    s:[{a:"THY Q1 2026 Sonuclari",u:"https://www.rustourismnews.com/2026/05/06/turkish-airlines-returns-to-strong-profit-despite-rising-operating-costs/"},{a:"THY IR",u:"https://investor.turkishairlines.com"}],az:true
  },
  {
    id:15, tarih:"6 Haz 2026", k:"finans", hy:"Turkish Airlines",
    b:"Turkish Airlines Istanbul-Bogota direkt seferini başlattı",
    o:"THY, İstanbul'dan Bogota'ya haftada 4 sefer olarak başlattığı direkt uçuşla Latin Amerika ağını daha da güçlendirdi. Bu hat, Türkiye ile Kolombiya arasındaki ilk direkt bağlantı niteliği taşıyor. THY'nin son 3 yılda Latin Amerika'da açtığı 7. yeni hat.",
    s:[{a:"THY Newsroom",u:"https://www.turkishairlines.com/en-int/press-room/news/"},{a:"Simple Flying",u:"https://simpleflying.com/turkish-airlines-istanbul-bogota-launch/"}],az:false
  },
  {
    id:16, tarih:"5 Haz 2026", k:"yasal", hy:"Tumu",
    b:"AB Havacılık Otoritesi GDS anlaşmalarında şeffaflık yönetmeliği taslağını yayımladı",
    o:"EASA, havayolu-GDS dağıtım anlaşmalarında içerik eşitliği ve ücret şeffaflığını zorunlu kılacak taslak yönetmeliği yayımladı. 2027 yürürlük tarihi hedefleniyor. Yönetmelik, GDS platformlarının havayollarına uyguladığı segment başına ücretlerin kamuoyuyla paylaşılmasını da zorunlu kılıyor. Sabre ve Amadeus konuya ilişkin lobi faaliyetleri başlattı.",
    s:[{a:"EC Transport",u:"https://transport.ec.europa.eu/transport-modes/air_en"},{a:"PhocusWire",u:"https://www.phocuswire.com/eu-gds-transparency-regulation-2027"}],az:true
  },
  {
    id:17, tarih:"4 Haz 2026", k:"yasal", hy:"Tumu",
    b:"AB Komisyonu havacılık dijital tek pazar direktifini yayımladı",
    o:"Avrupa Komisyonu, havacılık dağıtımında API standardizasyonu ve veri taşınabilirliğini zorunlu kılacak direktifi yayımladı. Direktif, GDS ve rezervasyon sistemlerinin ortak veri formatı kullanmasını şart koşuyor. Sektörün 2028'e kadar uyum sağlaması bekleniyor.",
    s:[{a:"EC Transport",u:"https://transport.ec.europa.eu/transport-modes/air_en"},{a:"PhocusWire",u:"https://www.phocuswire.com/eu-aviation-digital-single-market-directive"}],az:true
  },
  {
    id:18, tarih:"31 May 2026", k:"yasal", hy:"Tumu",
    b:"IATA NDC standardının 21.3 versiyonu yayımlandı — 18 aylık geçiş süresi",
    o:"IATA, NDC standardının 21.3 sürümünü yayımladı. Güncelleme, grup rezervasyonları ve interline teklifler için yeni şema tanımları içeriyor. Havayollarına 18 aylık geçiş süresi tanındı. Sürüm, özellikle çok havayollu rezervasyonlarda içerik zenginleştirmeye odaklanıyor.",
    s:[{a:"IATA NDC 21.3",u:"https://www.iata.org/en/programs/airline-distribution/ndc/ndc-news/"}],az:false
  },
];

/* ── GÜNDEM KATEGORİLERİ ─────────────────────────────────────────────────── */
const GUNDEM_KKAT = [
  { id:"turkiye",   l:"Türkiye",   emoji:"TR", renk:"#ef4444" },
  { id:"dunya",     l:"Dünya",     emoji:"GL", renk:"#0ea5e9" },
  { id:"ispanya",   l:"İspanya",   emoji:"ES", renk:"#f59e0b" },
  { id:"spor",      l:"Spor",      emoji:"SP", renk:"#10b981" },
  { id:"smalltalk", l:"Small Talk",emoji:"ST", renk:"#8b5cf6" },
];

const GUNDEM = [
  /* ── TÜRKIYE ── */
  {id:1,  kat:"turkiye", onemli:true,  tarih:"11 Haz",
   b:"TCMB faiz kararı bugün saat 14:00 — politika faizi yüzde 37'de sabit bekleniyor",
   o:"Merkez Bankası Haziran 2026 PPK toplantısı bugün. Ekonomistlerin büyük bölümü politika faizini yüzde 37'de sabit tutmasını öngörüyor. TCMB faiz kararı, liranın seyri ve THY'nin kur maliyetleri açısından sektörü doğrudan ilgilendiriyor.",
   url:"https://bigpara.hurriyet.com.tr/ekonomi-haberleri/"},
  {id:2,  kat:"turkiye", onemli:false, tarih:"10 Haz",
   b:"Türkiye turizm geliri 2026'da 62 milyar dolara ulaştı — 5 ayda 18,4 milyon turist",
   o:"Ocak-Mayıs 2026 döneminde Türkiye'ye gelen yabancı turist sayısı yüzde 14 artarak 18,4 milyona ulaştı. Ortalama harcama da 1.210 dolara çıktı. Kültür Bakanlığı, yılın tamamında 60 milyar doların üzerinde turizm geliri öngörüyor.",
   url:"https://www.kultur.gov.tr"},
  {id:3,  kat:"turkiye", onemli:false, tarih:"9 Haz",
   b:"İstanbul Havalimanı Mayıs'ta Avrupa'nın en yoğun havalimanı oldu — 9,1 milyon yolcu",
   o:"ACI Europe verilerine göre İstanbul Havalimanı Mayıs 2026'da 9,1 milyon yolcuyla Paris CDG ve Amsterdam AMS'yi geride bıraktı. Uluslararası transit yolcu artışı öne çıkıyor.",
   url:"https://www.dhmi.gov.tr/haberler"},
  {id:4,  kat:"turkiye", onemli:false, tarih:"8 Haz",
   b:"Türkiye Q1 2026 büyümesi yüzde 4,2 — enflasyon yüzde 38'e geriledi",
   o:"TÜİK açıkladı: İhracat ve hizmet sektörü öncülüğünde ekonomi ilk çeyrekte yüzde 4,2 büyüdü. Enflasyon ise Mayıs'ta yüzde 38'e geriledi. Merkez Bankası'nın yüksek faiz politikasının meyvelerini verdiği değerlendiriliyor.",
   url:"https://www.tuik.gov.tr"},
  {id:5,  kat:"turkiye", onemli:false, tarih:"7 Haz",
   b:"Türkiye-AB vize serbestisi müzakerelerinde önemli adım",
   o:"Türkiye Dışişleri Bakanlığı, AB ile yürütülen vize serbestisi müzakerelerinde teknik kriterlerin yüzde 72'sinin karşılandığını açıkladı. Vize serbestisi, Türkiye'den Avrupa'ya seyahat talebini ve THY yolcu hacmini doğrudan etkiliyor.",
   url:"https://www.mfa.gov.tr"},
  /* ── DÜNYA ── */
  {id:6,  kat:"dunya",   onemli:true,  tarih:"11 Haz",
   b:"2026 FIFA Dünya Kupası Kuzey Amerika'da başlıyor — 48 takım, 104 maç",
   o:"ABD, Kanada ve Meksika'da 11 Haziran-19 Temmuz arasında düzenleniyor. Açılış maçı Meksika-Güney Afrika. Final New York'ta. Organizasyon, ev sahibi ülkelere 5 milyar doların üzerinde turizm geliri sağlayacak.",
   url:"https://spor.haber7.com/dunya-kupasi/haber/3634351"},
  {id:7,  kat:"dunya",   onemli:false, tarih:"10 Haz",
   b:"Fed faiz kararı: Politika faizi sabit — enflasyon baskısı sürüyor",
   o:"ABD Merkez Bankası Haziran toplantısında politika faizini değiştirmedi. Fed Başkanı Powell enflasyonun inatla yüksek seyrini sürdürdüğünü vurguladı. Yüksek dolar faizi havacılık sektörü borçlanma maliyetlerini ve yakıt alım giderlerini olumsuz etkiliyor.",
   url:"https://www.reuters.com/markets/rates-bonds/fed-holds-rates-steady/"},
  {id:8,  kat:"dunya",   onemli:false, tarih:"9 Haz",
   b:"IATA: Küresel havacılık karı 2026'da 36 milyar dolara ulaşacak",
   o:"IATA Haziran 2026 tahmininde sektörün net karını 36 milyar dolar olarak revize etti. Yolcu talebi güçlü seyrederken yakıt maliyetleri ve personel giderleri baskı oluşturuyor. 2026 net marjı yüzde 3,6 öngörülüyor.",
   url:"https://www.iata.org/en/pressroom/2026-releases/"},
  {id:9,  kat:"dunya",   onemli:false, tarih:"8 Haz",
   b:"Orta Doğu gerilimi: Hava hatları güzergah değişikliğine gidiyor",
   o:"Bölgedeki jeopolitik gelişmeler nedeniyle birçok Avrupa ve Asya havayolu güzergahlarını revize etti. THY Orta Doğu kapasitesini yüzde 9,3 kıstı; Asya bağlantılarını güçlendirdi. Alternatif güzergah maliyetleri bilet fiyatlarına yansımaya başladı.",
   url:"https://www.airwaysmag.com"},
  {id:10, kat:"dunya",   onemli:false, tarih:"7 Haz",
   b:"Asya-Pasifik havacılık talebi patlaması sürüyor — bölge RPK büyümesi yüzde 14",
   o:"Pandemi sonrası en güçlü büyüme dönemini yaşayan Asya-Pasifik bölgesinde Çin iç hattı, Japonya-Kore koridor ve Güneydoğu Asya hatlarında yolcu sayıları rekor kırdı. Bölgenin havacılık kalkınma yatırımları Avrupa ve Körfez havayolları için büyük rekabet baskısı yaratıyor.",
   url:"https://www.iata.org/en/publications/economics/air-passenger-monthly-analysis/"},
  /* ── İSPANYA ── */
  {id:11, kat:"ispanya",  onemli:true, tarih:"10 Haz",
   b:"agenttravel.es: 'Bu yıl 14 havayolunu daha NDC platformumuza eklemeyi hedefliyoruz' — Maite Añorga",
   o:"Agenttravel.es'in röportajında Amadeus İspanya Direktörü Maite Añorga, NDC partner programına 2026'da 14 yeni havayolunun ekleneceğini açıkladı. İspanya pazarında NDC penetrasyonunun 2025'te yüzde 28'e ulaştığını belirterek acentelerin içerik çeşitliliği konusundaki endişelere yanıt verdi.",
   url:"https://www.agenttravel.es/noticia-060765_Conoce-lo-que-ofrece-el-NDC-Partner-Program-de-Lufthansa-Group-en-el-webinar-de-manana-de-AGENTTRAVEL.html"},
  {id:12, kat:"ispanya",  onemli:false, tarih:"9 Haz",
   b:"agenttravel.es: AB, Ispanya'ya yolcu verilerinin kaydına ilişkin hukuki süreç başlattı",
   o:"Avrupa Birliği, Türkiye ve Çin'den gelen uçuşlara ilişkin yolcu kayıt veri tabanı uygulamasında AB direktiflerine aykırı hareket ettiği gerekçesiyle İspanya'ya karşı ihlal davası açtı. İspanya'nın 2 ay içinde direktife uyum sağlaması gerekiyor.",
   url:"https://www.agenttravel.es"},
  {id:13, kat:"ispanya",  onemli:false, tarih:"8 Haz",
   b:"agenttravel.es: Melia 15 Küba otelinin yönetimini bırakıyor — ABD baskısı belirleyici oldu",
   o:"ABD'nin Küba bağlantılı kuruluşlara yönelik yaptırım tehdidi üzerine İspanya'nın en büyük otel grubu Melia, 15 Küba otelinin yönetiminden çekildi. Karar, Akdeniz ve Latin Amerika pazarlarındaki seyahat dağıtım dengelerini etkiliyor.",
   url:"https://www.agenttravel.es"},
  {id:14, kat:"ispanya",  onemli:false, tarih:"7 Haz",
   b:"Catalan News: Barselona 2026'da turist sayısını sınırlama kararı aldı",
   o:"Barselona Belediyesi, aşırı kalabalık sorununu çözmek için günlük maksimum turist kotası uygulamasına geçiyor. 2027'den itibaren yürürlüğe girmesi beklenen düzenleme, oteller ve seyahat acentelerini doğrudan etkiliyor.",
   url:"https://www.catalannews.com/tourism"},
  {id:15, kat:"ispanya",  onemli:false, tarih:"6 Haz",
   b:"IAG kolu Iberia 5 aylık rekoru kırdı: 16,8 milyon yolcu",
   o:"Iberia, 2026 Ocak-Mayıs döneminde 16,8 milyon yolcu taşıdığını açıkladı. Transatlantik premium kabin dolulukları yüzde 91'e çıktı. Latin Amerika hatlarındaki güçlü büyüme IAG'ın karlılığını destekliyor.",
   url:"https://www.iairgroup.com/investors"},
  {id:16, kat:"ispanya",  onemli:false, tarih:"5 Haz",
   b:"agenttravel.es: Avoris, Atrapalo'nun yüzde 100'ünü satın alma anlaşması imzaladı",
   o:"İspanya'nın önde gelen turizm grubu Avoris, çevrimiçi seyahat acentesi Atrapalo'yu satın almak için anlaşmaya vardı. Bu konsolidasyon hamlesi İspanya dijital seyahat pazarındaki güç dengesini değiştiriyor.",
   url:"https://www.agenttravel.es"},
  /* ── SPOR ── */
  {id:17, kat:"spor",     onemli:true,  tarih:"14 Haz",
   b:"TÜRKIYE - AVUSTRALYA | Dünya Kupası D Grubu — 14 Haz 07:00 TSI | TRT 1",
   o:"Türkiye 24 yıl aradan sonra Dünya Kupası'nda. BC Place Vancouver. Teknik direktör Montella'nın 26 kişilik kadrosu: Arda Güler, Kenan Yıldız, Hakan Çalhanoğlu, Barış Alper Yılmaz, Ferdi Kadıoğlu.",
   url:"https://www.milliyet.com.tr/galeri/milli-mac-ne-zaman-avustralya-turkiye-2026-fifa-dunya-kupasi-maci-ne-zaman-saat-kacta-hangi-kanalda-a-milli-takim-grupta-ilk-7603344"},
  {id:18, kat:"spor",     onemli:false, tarih:"20 Haz",
   b:"Türkiye - Paraguay | Dünya Kupası 2. Maç — 20 Haz 06:00 TSI | TRT 1",
   o:"San Francisco Bay Area Stadyumu. Galip gelen takım son 16'ya büyük adım atar.",
   url:"https://spor.haber7.com/dunya-kupasi/haber/3634351"},
  {id:19, kat:"spor",     onemli:false, tarih:"Haz",
   b:"Galatasaray 4. şampiyonluk sonrası Şampiyonlar Ligi için transfer sezonunu açtı",
   o:"Osimhen alternatifi aranıyor. PSG ve Atletico Madrid'in yıldızları gündemde. Teknik direktör Okan Buruk ile sözleşme 2027'ye uzatıldı.",
   url:"https://www.fanatik.com.tr/takim/galatasaray/futbol/"},
  {id:20, kat:"spor",     onemli:false, tarih:"Haz",
   b:"Fenerbahçe'de Aziz Yıldırım başkanlığa döndü — Lewandowski transferi ilan edildi",
   o:"Kongrede seçilir seçilmez Lewandowski ve Guirassy transferlerini duyurdu. Teknik direktörlük için Montella sonrası isimler değerlendiriliyor.",
   url:"https://www.fanatik.com.tr/takim/fenerbahce/futbol/"},
  {id:21, kat:"spor",     onemli:false, tarih:"Haz",
   b:"Arda Güler ve Kenan Yıldız Golden Boy finalinde",
   o:"Real Madrid ve Juventus'taki iki Türk yıldız Avrupa'nın en prestijli genç oyuncu ödülünde finale kaldı.",
   url:"https://www.mynet.com/spor/2026-dunya-kupasi"},
  /* ── SMALL TALK ── */
  {id:22, kat:"smalltalk",onemli:false, tarih:"11 Haz",
   b:"İstanbul konut fiyatları 6 ayda yüzde 12 geriledi — alıcılar beklemede",
   o:"Emlakjet verilerine göre İstanbul genelinde konut fiyatları son 6 ayda yüzde 12 düştü. Kadıköy ve Beşiktaş'ta düşüş sınırlı kalırken Anadolu yakası daha fazla etkilendi.",
   url:"https://www.emlakjet.com/haberler/"},
  {id:23, kat:"smalltalk",onemli:false, tarih:"10 Haz",
   b:"Netflix Türkiye'nin yeni dizisi 'Miras' global listede 3. oldu",
   o:"Yayına girdikten 3 gün içinde 60 ülkede izleniyor. Avrupa ve Latin Amerika'da rekor kırıyor.",
   url:"https://www.hurriyet.com.tr/kelebek/magazin/"},
  {id:24, kat:"smalltalk",onemli:false, tarih:"9 Haz",
   b:"İstanbul trafiği AI ile yönetiliyor — TomTom sıralamasında 3 basamak geriledi",
   o:"İBB'nin yapay zeka destekli trafik yönetim sisteminin devreye girmesiyle birlikte İstanbul TomTom 2026 raporunda 3 basamak geriledi. Hâlâ dünyanın en kötü 5 trafiği arasında ama gidişat olumlu.",
   url:"https://www.ibb.istanbul/haberler"},
  {id:25, kat:"smalltalk",onemli:false, tarih:"8 Haz",
   b:"Kapadokya balon turu rezervasyonları 3 ay önceden dolmaya başladı",
   o:"Turizm Bakanlığı: Yaz sezonu için yüzde 40 artış bekleniyor. Erken rezervasyon şart.",
   url:"https://www.kulturportali.gov.tr"},
];

/* ── KUR HOOK ──────────────────────────────────────────────────────────────── */
function usePiyasa() {
  const init = {
    usdtry:null, eurtry:null, eurusd:null,
    usdtry_prev:null, eurtry_prev:null, eurusd_prev:null,
    brent:ENERJI.brent, jet:ENERJI.jet,
    ts:null, loading:true, err:null,
  };
  const [v, setV] = useState(init);

  const load = useCallback(async function() {
    setV(function(p) { return Object.assign({}, p, {loading:true, err:null}); });
    try {
      var results = await Promise.all([fetchRates("latest"), fetchRates(dateStr(-1))]);
      var today = results[0];
      var yesterday = results[1];
      if (!today) throw new Error("veri alinamadi");
      var usdtry = today.try_;
      var eur    = today.eur;
      var eurtry = (usdtry && eur) ? usdtry / eur : null;
      var eurusd = eur ? (1 / eur) : null;
      var usdtry_prev = yesterday ? yesterday.try_ : null;
      var eur_prev    = yesterday ? yesterday.eur : null;
      var eurtry_prev = (usdtry_prev && eur_prev) ? usdtry_prev / eur_prev : null;
      var eurusd_prev = eur_prev ? (1 / eur_prev) : null;
      setV({
        usdtry, eurtry, eurusd,
        usdtry_prev, eurtry_prev, eurusd_prev,
        brent: ENERJI.brent, jet: ENERJI.jet,
        ts: new Date().toLocaleTimeString("tr-TR"),
        loading: false, err: null,
      });
    } catch (e) {
      setV(function(p) { return Object.assign({}, p, {loading:false, err:"Kur verisi alinamadi"}); });
    }
  }, []);

  useEffect(function() {
    load();
    var iv = setInterval(load, 10 * 60 * 1000);
    return function() { clearInterval(iv); };
  }, [load]);

  return Object.assign({}, v, {refresh: load});
}

/* ── SPARKLINE ──────────────────────────────────────────────────────────────── */
function Sparkline(props) {
  var vals = props.vals, color = props.color, h = props.h || 28, w = props.w || 80;
  var t = vals.filter(function(v) { return v != null; });
  if (t.length < 2) return null;
  var mn = Math.min.apply(null, t), mx = Math.max.apply(null, t), rng = mx - mn || 1;
  var step = w / (t.length - 1);
  var pts = t.map(function(v, i) {
    return (i * step).toFixed(1) + "," + (h - ((v - mn) / rng * h)).toFixed(1);
  }).join(" ");
  var lx = (t.length - 1) * step;
  var ly = h - ((t[t.length - 1] - mn) / rng * h);
  return React.createElement("svg", {width:w, height:h, viewBox:"0 0 " + w + " " + h, style:{display:"block"}},
    React.createElement("polyline", {points:pts, fill:"none", stroke:color, strokeWidth:"2", strokeLinejoin:"round", strokeLinecap:"round"}),
    React.createElement("circle", {cx:lx, cy:ly, r:"2.5", fill:color})
  );
}

/* ── BAR CHART ──────────────────────────────────────────────────────────────── */
function BarChart(props) {
  var data = props.data, metrik = props.metrik, dk = props.dk, metrObj = props.metrObj;
  var max = Math.max.apply(null, data.map(function(d) { return Math.abs(d.val || 0); }));
  if (max === 0) max = 1;
  var bg   = dk ? "#0f172a" : "#f8fafc";
  var bord = dk ? "#334155" : "#e2e8f0";
  var txt  = dk ? "#e2e8f0" : "#1e293b";
  return (
    <div style={{display:"flex", flexDirection:"column", gap:10}}>
      {data.map(function(d) {
        var pct = Math.abs(d.val || 0) / max * 100;
        var barColor = d.val != null && d.val < 0 ? "#ef4444" : d.renk;
        return (
          <div key={d.id} style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:140, fontSize:12, fontWeight: d.id==="thy" ? 700 : 400, color:txt, flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
              {d.id==="thy" ? "* " : ""}{d.ad}
            </div>
            <div style={{flex:1, height:26, background:bg, borderRadius:4, overflow:"hidden", border:"1px solid " + bord, position:"relative"}}>
              {d.val != null ? (
                <div style={{height:"100%", width:pct + "%", background:barColor, borderRadius:4, display:"flex", alignItems:"center", paddingLeft:6, transition:"width 0.6s ease", minWidth:60}}>
                  <span style={{fontSize:11, fontWeight:700, color:"#fff", whiteSpace:"nowrap"}}>{metrObj.fmt(d.val)}</span>
                </div>
              ) : (
                <span style={{fontSize:11, color:"#94a3b8", paddingLeft:8, lineHeight:"26px"}}>Veri yok</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── KUR ŞERİDİ ─────────────────────────────────────────────────────────────── */
function KurSeridi(props) {
  var piyasa = props.piyasa, dk = props.dk;
  var bg   = dk ? "#0f172a" : "#1e293b";
  var bord = dk ? "#334155" : "#334155";
  var txt  = "#f1f5f9";
  var mute = "#94a3b8";

  function pct(cur, prev) {
    if (cur == null || prev == null || prev === 0) return null;
    return ((cur - prev) / Math.abs(prev)) * 100;
  }

  var items = [
    {label:"USD/TRY", val:piyasa.usdtry, prev:piyasa.usdtry_prev, fmt:function(v) { return "₺" + v.toFixed(2); }, ters:true},
    {label:"EUR/TRY", val:piyasa.eurtry, prev:piyasa.eurtry_prev, fmt:function(v) { return "₺" + v.toFixed(2); }, ters:true},
    {label:"EUR/USD", val:piyasa.eurusd, prev:piyasa.eurusd_prev, fmt:function(v) { return "$" + v.toFixed(4); }, ters:false},
    {label:"Brent",   val:piyasa.brent,  prev:null,               fmt:function(v) { return "$" + v.toFixed(1) + "/bbl"; }, ters:true},
    {label:"Jet",     val:piyasa.jet,    prev:null,               fmt:function(v) { return "$" + v.toFixed(1) + "/bbl"; }, ters:true},
  ];

  return (
    <div style={{background:bg, borderBottom:"1px solid " + bord, overflowX:"auto", whiteSpace:"nowrap", fontSize:12}}>
      <div style={{display:"inline-flex", alignItems:"center", padding:"0 16px", minWidth:"100%", height:38}}>
        <div style={{padding:"0 12px 0 0", marginRight:12, borderRight:"1px solid " + bord, display:"flex", alignItems:"center", gap:6, flexShrink:0}}>
          <div style={{width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:10, fontWeight:700, color:mute, textTransform:"uppercase", letterSpacing:"0.5px"}}>Canli</span>
        </div>

        {piyasa.loading && <span style={{color:mute, fontSize:11}}>Yukleniyor...</span>}
        {piyasa.err && (
          <span style={{color:"#ef4444", fontSize:11, display:"flex", alignItems:"center", gap:8}}>
            {piyasa.err}
            <button onClick={piyasa.refresh} style={{fontSize:10, border:"1px solid #ef4444", background:"transparent", color:"#ef4444", padding:"1px 6px", borderRadius:4, cursor:"pointer"}}>Yenile</button>
          </span>
        )}

        {!piyasa.loading && !piyasa.err && items.map(function(item, i) {
          var d = pct(item.val, item.prev);
          var up = d != null && d > 0;
          var clr = d == null ? mute : (item.ters ? (up ? "#ef4444" : "#10b981") : (up ? "#10b981" : "#ef4444"));
          return (
            <div key={item.label} style={{display:"inline-flex", alignItems:"center", gap:8, padding:"0 14px 0 0", marginRight:12, borderRight: i < items.length-1 ? "1px solid " + bord : "none", flexShrink:0}}>
              <span style={{fontSize:10, fontWeight:700, color:mute, letterSpacing:"0.3px"}}>{item.label}</span>
              <span style={{fontSize:13, fontWeight:800, color:txt, letterSpacing:"-0.3px"}}>
                {item.val != null ? item.fmt(item.val) : "—"}
              </span>
              {d != null && (
                <span style={{fontSize:10, fontWeight:700, color:clr, background:clr + "20", padding:"1px 5px", borderRadius:4}}>
                  {up ? "▲" : "▼"} {Math.abs(d).toFixed(2)}%
                </span>
              )}
              {d == null && item.prev == null && item.val != null && (
                <span style={{fontSize:10, color:mute}}>EIA</span>
              )}
            </div>
          );
        })}

        {!piyasa.loading && !piyasa.err && (
          <div style={{marginLeft:"auto", flexShrink:0, display:"flex", alignItems:"center", gap:8, paddingLeft:12, borderLeft:"1px solid " + bord}}>
            <span style={{fontSize:10, color:mute}}>son: {piyasa.ts}</span>
            <button onClick={piyasa.refresh} style={{fontSize:10, background:"transparent", border:"1px solid " + bord, color:mute, borderRadius:4, padding:"2px 6px", cursor:"pointer"}}>yenile</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ANA UYGULAMA ─────────────────────────────────────────────────────────── */
export default function App() {
  const [tema,   setTema]  = useState("acik");
  const [sekme,  setSekme] = useState("haberler");
  const [hKat,   setHKat]  = useState("tumu");
  const [hHY,    setHHY]   = useState("Tumu");
  const [hArama, setHArama]= useState("");
  const [hAz,    setHAz]   = useState(false);
  const [gKat,   setGKat]  = useState("turkiye");
  const [fMetrik,setFMetrik]= useState("g");
  const [fYillar,setFYillar]= useState(["2023","2024","2025"]);
  const [fHY,    setFHY]   = useState(FIN.map(function(h) { return h.id; }));
  const [fGor,   setFGor]  = useState("grafik");
  const [chatAcik,setChatAcik] = useState(false);
  const [msgs,   setMsgs]  = useState([{r:"a", t:"Ticari Takip Portali Asistanina hos geldiniz. Havacılık finansalları, NDC/GDS veya gündem hakkında soru sorabilirsiniz."}]);
  const [chatIn, setChatIn]= useState("");
  const [chatLoading,setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const piyasa = usePiyasa();
  const dk = tema === "karanlik";

  useEffect(function() {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({behavior:"smooth"});
  }, [msgs]);

  async function sendChat(q) {
    var m = q || chatIn.trim();
    if (!m) return;
    setChatIn("");
    setMsgs(function(p) { return p.concat([{r:"u", t:m}]); });
    setChatLoading(true);
    var ctx = FIN.slice(0,5).map(function(h) {
      return h.ad + " 2025: $" + h.yil["2025"].g + "B gelir, $" + h.yil["2025"].nk + "B net kar";
    }).join("; ");
    try {
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:500,
          system:"Sen THY ust yonetimine sunum yapan kıdemli havacılık analistisin. Kisa, oz Turkce yanit ver.\n" + ctx,
          messages:[{role:"user", content:m}],
        }),
      });
      var d = await res.json();
      var txt = d.content && d.content[0] ? d.content[0].text : "Yanit alinamadi.";
      setMsgs(function(p) { return p.concat([{r:"a", t:txt}]); });
    } catch(_) {
      setMsgs(function(p) { return p.concat([{r:"a", t:"Hata olustu."}]); });
    } finally {
      setChatLoading(false);
    }
  }

  var bg   = dk ? "#0f172a" : "#f8fafc";
  var card = dk ? "#1e293b" : "#ffffff";
  var bord = dk ? "#334155" : "#e2e8f0";
  var txt  = dk ? "#e2e8f0" : "#1e293b";
  var sub  = dk ? "#94a3b8" : "#475569";
  var mute = "#94a3b8";

  var filtreli = HABERLER.filter(function(h) {
    if (hKat !== "tumu" && h.k !== hKat) return false;
    if (hHY !== "Tumu" && h.hy !== hHY) return false;
    if (hAz && !h.az) return false;
    if (hArama) {
      var q = hArama.toLowerCase();
      if (h.b.toLowerCase().indexOf(q) === -1 && h.o.toLowerCase().indexOf(q) === -1) return false;
    }
    return true;
  });

  var aktifHY = FIN.filter(function(h) { return fHY.includes(h.id); });
  var tumYillar = ["2022","2023","2024","2025"];

  var fMetrObj = METR_LIST.find(function(m) { return m.k === fMetrik; }) || METR_LIST[0];

  var grafik_data = aktifHY.map(function(h) {
    var lastY = fYillar.length > 0 ? fYillar[fYillar.length - 1] : null;
    var val = lastY && h.yil[lastY] ? h.yil[lastY][fMetrik] : null;
    if (val === undefined) val = null;
    return {id:h.id, ad:h.ad, renk:h.renk, val:val};
  }).sort(function(a,b) { return (b.val||0) - (a.val||0); });

  var gFiltreli = GUNDEM.filter(function(g) { return g.kat === gKat; });
  var TUMU_HY = ["Tumu"].concat(Array.from(new Set(HABERLER.map(function(h) { return h.hy; }))));

  function cardSt(extra) {
    return Object.assign({background:card, border:"1px solid " + bord, borderRadius:12, padding:20, marginBottom:14}, extra || {});
  }
  function tabSt(active) {
    return {padding:"10px 14px", cursor:"pointer", border:"none", background:"transparent", color: active ? "#6366f1" : mute, fontWeight: active ? 600 : 400, fontSize:13, borderBottom: active ? "2px solid #6366f1" : "2px solid transparent", whiteSpace:"nowrap"};
  }
  function btnSt(active, color) {
    var c = color || "#6366f1";
    return {padding:"5px 12px", borderRadius:8, border:"1px solid " + (active ? c : bord), background: active ? c : "transparent", color: active ? "#fff" : mute, fontSize:12, fontWeight: active ? 600 : 400, cursor:"pointer"};
  }
  function chipSt(active) {
    return {padding:"5px 12px", borderRadius:20, border:"1px solid " + (active ? "#6366f1" : bord), background: active ? "#6366f1" : "transparent", color: active ? "#fff" : mute, fontSize:12, cursor:"pointer"};
  }
  function tagSt(color) {
    return {fontSize:11, fontWeight:600, color:color, background:color+"18", padding:"2px 8px", borderRadius:6, whiteSpace:"nowrap"};
  }

  var thSt = {padding:"9px 12px", textAlign:"left", fontWeight:600, color:mute, fontSize:11, textTransform:"uppercase", letterSpacing:"0.4px", whiteSpace:"nowrap", borderBottom:"1px solid " + bord, background: dk ? "#0f172a" : "#f8fafc"};
  var tdSt = {padding:"10px 12px", borderBottom:"1px solid " + bord + "50", verticalAlign:"middle"};

  return (
    <div style={{minHeight:"100vh", background:bg, color:txt, fontFamily:"Inter, Segoe UI, sans-serif", fontSize:14}}>
      <style>{".kur-box {transition: none;} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}"}</style>

      {/* HEADER */}
      <header style={{background:card, borderBottom:"1px solid " + bord, padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:50, position:"sticky", top:0, zIndex:100}}>
        <div style={{display:"flex", alignItems:"center", gap:10, fontWeight:700, fontSize:15}}>
          <div style={{width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14}}>
            T
          </div>
          <span>Ticari Takip Portali</span>
          <span style={{fontSize:10, fontWeight:700, background:"#6366f1", color:"#fff", padding:"2px 7px", borderRadius:10}}>BETA</span>
        </div>
        <button style={btnSt(false)} onClick={function() { setTema(dk ? "acik" : "karanlik"); }}>
          {dk ? "Aydinlik" : "Karanlik"}
        </button>
      </header>

      {/* KUR ŞERİDİ — header'a yapışık, sticky */}
      <div style={{position:"sticky", top:50, zIndex:99}}>
        <KurSeridi piyasa={piyasa} dk={dk}/>
      </div>

      {/* NAV — kur şeridinin hemen altına, aşağı kaymaz */}
      <nav style={{background:card, borderBottom:"1px solid " + bord, padding:"0 20px", display:"flex", gap:4, overflowX:"auto", position:"sticky", top:88, zIndex:98}}>
        {[
          {id:"haberler",    l:"Haberler"},
          {id:"gundem",      l:"Gündelik Gündem"},
          {id:"gostergeler", l:"Göstergeler"},
          {id:"finansallar", l:"Sektörel Finansallar"},
        ].map(function(t) {
          return <button key={t.id} style={tabSt(sekme === t.id)} onClick={function() { setSekme(t.id); }}>{t.l}</button>;
        })}
      </nav>

      <main style={{maxWidth:1300, margin:"0 auto", padding:"20px 16px"}}>

        {/* ═══════════════════════ HABERLER ═══════════════════════════════ */}
        {sekme === "haberler" && (
          <div>
            <div style={{...cardSt(), display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", padding:"14px 16px"}}>
              <div style={{flex:"1 1 180px", position:"relative"}}>
                <span style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:mute}}>ara</span>
                <input
                  style={{width:"100%", padding:"8px 12px 8px 40px", borderRadius:8, border:"1px solid " + bord, background: dk ? "#0f172a" : "#f8fafc", color:txt, fontSize:13, outline:"none", boxSizing:"border-box"}}
                  placeholder="Haber ara..."
                  value={hArama}
                  onChange={function(e) { setHArama(e.target.value); }}
                />
              </div>
              <select
                style={{padding:"7px 10px", borderRadius:8, border:"1px solid " + bord, background: dk ? "#0f172a" : "#f8fafc", color:txt, fontSize:13, outline:"none"}}
                value={hHY}
                onChange={function(e) { setHHY(e.target.value); }}
              >
                {TUMU_HY.map(function(h) { return <option key={h}>{h}</option>; })}
              </select>
              <label style={{display:"flex", alignItems:"center", gap:6, fontSize:13, cursor:"pointer"}}>
                <input type="checkbox" checked={hAz} onChange={function(e) { setHAz(e.target.checked); }} style={{accentColor:"#10b981"}}/> Analizli
              </label>
              {(hArama || hHY !== "Tumu" || hKat !== "tumu" || hAz) && (
                <button style={btnSt(false)} onClick={function() { setHArama(""); setHHY("Tumu"); setHKat("tumu"); setHAz(false); }}>Temizle</button>
              )}
            </div>

            <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:16}}>
              {HABER_KKAT.map(function(k) {
                return <button key={k.id} style={chipSt(hKat === k.id)} onClick={function() { setHKat(k.id); }}>{k.l}</button>;
              })}
            </div>

            {filtreli.length === 0 ? (
              <div style={{textAlign:"center", padding:"60px 20px", color:mute}}>Sonuç bulunamadı</div>
            ) : (
              <div style={{display:"flex", flexDirection:"column", gap:12}}>
                {filtreli.map(function(h) {
                  var catRenk = KRENK[h.k] || mute;
                  var catLabel = HABER_KKAT.find(function(k) { return k.id === h.k; });
                  return (
                    <div key={h.id} style={{...cardSt(), borderLeft:"3px solid " + catRenk}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, flexWrap:"wrap", gap:6}}>
                        <div style={{display:"flex", gap:8, alignItems:"center"}}>
                          <span style={tagSt(catRenk)}>{catLabel ? catLabel.l : h.k}</span>
                          {h.hy && h.hy !== "Tumu" && <span style={tagSt("#94a3b8")}>{h.hy}</span>}
                        </div>
                        <span style={{fontSize:11, color:mute}}>{h.tarih}</span>
                      </div>
                      <div style={{fontWeight:700, fontSize:14, lineHeight:1.45, marginBottom:8, color:txt}}>{h.b}</div>
                      <div style={{fontSize:13, lineHeight:1.7, color:sub, marginBottom:12}}>{h.o}</div>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:4}}>
                        <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
                          {h.s.map(function(k) {
                            return (
                              <a key={k.a} href={k.u} target="_blank" rel="noopener noreferrer" style={{fontSize:11, color:"#6366f1", textDecoration:"none", background:"#6366f115", padding:"2px 8px", borderRadius:6}}>
                                {k.a}
                              </a>
                            );
                          })}
                        </div>
                        {h.az && <span style={tagSt("#10b981")}>Analizli</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ GÜNDEM ══════════════════════════════════ */}
        {sekme === "gundem" && (
          <div>
            <div style={{fontSize:16, fontWeight:700, marginBottom:14}}>
              Gündelik Gündem — {new Date().toLocaleDateString("tr-TR", {day:"numeric", month:"long", year:"numeric"})}
            </div>

            <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:18}}>
              {GUNDEM_KKAT.map(function(k) {
                return (
                  <button key={k.id} style={{
                    padding:"8px 18px", borderRadius:20, cursor:"pointer",
                    border:"1px solid " + (gKat === k.id ? k.renk : bord),
                    background: gKat === k.id ? k.renk : "transparent",
                    color: gKat === k.id ? "#fff" : mute,
                    fontSize:13, fontWeight: gKat === k.id ? 700 : 400,
                  }} onClick={function() { setGKat(k.id); }}>
                    {k.l}
                  </button>
                );
              })}
            </div>

            {gKat === "spor" && (
              <div style={{...cardSt(), marginBottom:16}}>
                <div style={{fontWeight:700, fontSize:15, marginBottom:12}}>Türkiye — 2026 Dünya Kupası D Grubu</div>
                <div style={{display:"flex", flexDirection:"column", gap:8}}>
                  {[
                    {t:"14 Haz 07:00 TSI",m:"Avustralya - Türkiye",s:"BC Place, Vancouver",r:"#ef4444",url:"https://www.milliyet.com.tr/galeri/milli-mac-ne-zaman-avustralya-turkiye-2026-fifa-dunya-kupasi-maci-ne-zaman-saat-kacta-hangi-kanalda-a-milli-takim-grupta-ilk-7603344",durum:"YAKLASMA"},
                    {t:"20 Haz 06:00 TSI",m:"Türkiye - Paraguay",s:"Bay Area Stadium, San Francisco",r:"#6366f1",url:"https://spor.haber7.com/dunya-kupasi/haber/3634351",durum:"GRUPTA"},
                    {t:"26 Haz 05:00 TSI",m:"Türkiye - ABD",s:"Los Angeles Stadium",r:"#6366f1",url:"https://spor.haber7.com/dunya-kupasi/haber/3634351",durum:"GRUPTA"},
                  ].map(function(mac, i) {
                    return (
                      <a key={i} href={mac.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                        <div style={{background: dk ? "#0f172a" : "#f8fafc", borderRadius:10, padding:"11px 14px", display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", border:"1px solid " + (i===0 ? mac.r : bord)}}>
                          <span style={tagSt(mac.r)}>{mac.durum}</span>
                          <span style={{fontSize:11, color:mute, minWidth:110}}>{mac.t}</span>
                          <span style={{fontWeight:700, fontSize:13, color:txt, flex:1}}>{mac.m}</span>
                          <span style={{fontSize:11, color:mute}}>{mac.s}</span>
                          <span style={tagSt("#10b981")}>TRT 1</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {gFiltreli.length === 0 ? (
              <div style={{textAlign:"center", padding:"40px 20px", color:mute}}>Bu kategoride haber yok</div>
            ) : (
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12}}>
                {gFiltreli.map(function(g) {
                  var gk = GUNDEM_KKAT.find(function(k) { return k.id === g.kat; });
                  var r = gk ? gk.renk : "#6366f1";
                  return (
                    <a key={g.id} href={g.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                      <div style={{...cardSt(), borderLeft: g.onemli ? "3px solid " + r : "none", cursor:"pointer"}}>
                        <div style={{display:"flex", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:4}}>
                          <div style={{display:"flex", alignItems:"center", gap:6}}>
                            <span style={tagSt(r)}>{gk ? gk.l : g.kat}</span>
                            {g.onemli && <span style={{fontSize:9, fontWeight:700, color:"#ef4444", background:"#ef444415", padding:"1px 5px", borderRadius:4}}>ONE CIKAN</span>}
                          </div>
                          <span style={{fontSize:11, color:mute}}>{g.tarih}</span>
                        </div>
                        <div style={{fontWeight: g.onemli ? 700 : 600, fontSize:13, lineHeight:1.45, marginBottom:6, color:txt}}>{g.b}</div>
                        <div style={{fontSize:12, lineHeight:1.6, color:sub}}>{g.o}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ GÖSTERGELER ══════════════════════════════ */}
        {sekme === "gostergeler" && (
          <div>
            <div style={{fontSize:16, fontWeight:700, marginBottom:14}}>IATA Pazar Göstergeleri</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12, marginBottom:20}}>
              {[
                {l:"IATA Kuresel RPK", d:"+9,2%", b:"Mayıs 2026 · yıllık", r:"#10b981", a:"Revenue Passenger Km"},
                {l:"Kuresel ASK",      d:"+7,4%", b:"Mayıs 2026 · yıllık", r:"#6366f1", a:"Available Seat Km"},
                {l:"Kuresel Doluluk", d:"83,7%",  b:"PLF · Mayıs 2026",    r:"#f59e0b", a:"Passenger Load Factor"},
                {l:"NDC Penetrasyon", d:"~34%",   b:"Tahmin · 2026",       r:"#8b5cf6", a:"Toplam bilet satislarinda"},
              ].map(function(e) {
                return (
                  <div key={e.l} style={{background:card, border:"1px solid " + bord, borderLeft:"3px solid " + e.r, borderRadius:10, padding:"14px 16px"}}>
                    <div style={{fontSize:26, fontWeight:800, color:e.r, letterSpacing:"-1px", lineHeight:1, marginBottom:4}}>{e.d}</div>
                    <div style={{fontWeight:600, fontSize:13, marginBottom:2}}>{e.l}</div>
                    <div style={{fontSize:11, color:mute, marginBottom:2}}>{e.b}</div>
                    <div style={{fontSize:11, color:mute}}>{e.a}</div>
                  </div>
                );
              })}
            </div>
            <div style={cardSt()}>
              <div style={{fontWeight:600, marginBottom:14}}>Bölgesel RPK Büyümesi — Mayıs 2026</div>
              {[
                {b:"Asya-Pasifik",  v:14.1, r:"#0ea5e9"},
                {b:"Orta Dogu",     v:11.3, r:"#8b5cf6"},
                {b:"Latin Amerika", v:9.8,  r:"#10b981"},
                {b:"Kuzey Amerika", v:8.1,  r:"#f59e0b"},
                {b:"Avrupa",        v:7.4,  r:"#6366f1"},
                {b:"Afrika",        v:6.9,  r:"#ef4444"},
              ].map(function(x) {
                return (
                  <div key={x.b} style={{marginBottom:10}}>
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
                      <span style={{fontSize:13}}>{x.b}</span>
                      <span style={{fontSize:13, fontWeight:700, color:x.r}}>+{x.v}%</span>
                    </div>
                    <div style={{height:6, background: dk ? "#0f172a" : "#f1f5f9", borderRadius:4, overflow:"hidden"}}>
                      <div style={{height:"100%", width: (x.v/15*100) + "%", background:x.r, borderRadius:4}}/>
                    </div>
                  </div>
                );
              })}
              <div style={{fontSize:11, color:mute, marginTop:8}}>
                Kaynak: IATA Air Passenger Market Analysis · Mayıs 2026
              </div>
            </div>

            <div style={{fontSize:16, fontWeight:700, marginBottom:14}}>Yayınlar ve Raporlar</div>
            {[
              {b:"IATA Aylık Yolcu Analizi — Mayıs 2026",t:"Haziran 2026",o:"Küresel RPK yüzde 9,2 büyüdü.",et:"IATA",u:"https://www.iata.org/en/publications/economics/air-passenger-monthly-analysis/"},
              {b:"Amadeus Dağıtım Endeksi Q1 2026",t:"Nisan 2026",o:"NDC rezervasyonları yüzde 42 arttı.",et:"Amadeus",u:"https://ir.amadeus.com/en/financial-news-and-events/press-releases"},
              {b:"IATA ONE Order Durum Raporu H1 2026",t:"Haziran 2026",o:"60 havayolu ONE Order sertifikasyonunu tamamladı.",et:"IATA",u:"https://www.iata.org/en/programs/ops-infra/one-order/"},
              {b:"Phocuswright: Havacılık Dağıtım Panosu 2026",t:"Mayıs 2026",o:"Doğrudan gelir payı yüzde 51'i aştı.",et:"Phocuswright",u:"https://www.phocuswright.com/Research/Travel-Technology"},
            ].map(function(r, i) {
              return (
                <div key={i} style={{...cardSt(), display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16}}>
                  <div>
                    <div style={{display:"flex", gap:8, marginBottom:6}}>
                      <span style={tagSt("#6366f1")}>{r.et}</span>
                      <span style={{fontSize:11, color:mute}}>{r.t}</span>
                    </div>
                    <div style={{fontWeight:600, fontSize:14, marginBottom:6}}>{r.b}</div>
                    <div style={{fontSize:13, color:sub}}>{r.o}</div>
                  </div>
                  <a href={r.u} target="_blank" rel="noopener noreferrer" style={{padding:"7px 14px", background:"#6366f1", color:"#fff", borderRadius:8, fontSize:12, fontWeight:600, textDecoration:"none", flexShrink:0}}>Ac</a>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════ FİNANSALLAR ════════════════════════════ */}
        {sekme === "finansallar" && (
          <div>
            {/* THY Snapshot */}
            <div style={{...cardSt(), borderLeft:"4px solid #C8102E"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:8}}>
                <div>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                    <span style={{fontSize:15, fontWeight:800, color:"#C8102E"}}>* Turkish Airlines — Son Dönem</span>
                    <span style={tagSt("#C8102E")}>THYAO · BIST</span>
                  </div>
                  <div style={{fontSize:12, color:mute}}>Istanbul merkezli · Q1 2026 sonuçları yayımlandı</div>
                </div>
                <a href={THY.ir} target="_blank" rel="noopener noreferrer" style={{fontSize:12, color:"#6366f1", textDecoration:"none"}}>IR Sayfası</a>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10}}>
                {[
                  {l:"2025 Gelir",    v:"$24.1B",   r:"#6366f1"},
                  {l:"2025 Net Kar",  v:"$2.90B",   r:"#10b981"},
                  {l:"Q1 2026 Gelir", v:"$5.9B",    r:"#0ea5e9",  yeni:true},
                  {l:"Q1 2026 Net",   v:"+$226M",   r:"#10b981",  yeni:true},
                  {l:"Q1 2026 Yolcu", v:"21.3M",    r:"#ef4444",  yeni:true},
                  {l:"2025 Doluluk",  v:"84.8%",    r:"#14b8a6"},
                  {l:"2025 Filo",     v:"516 ucak", r:"#f97316"},
                  {l:"2025 Isletme",  v:"15.1%",    r:"#f59e0b"},
                ].map(function(item) {
                  return (
                    <div key={item.l} style={{background: dk ? "#0f172a" : "#f8fafc", borderRadius:8, padding:"10px 12px", border: item.yeni ? "1px solid " + item.r + "40" : "none"}}>
                      <div style={{fontSize:10, color:mute, marginBottom:3, display:"flex", alignItems:"center", gap:4}}>
                        {item.yeni && <span style={{fontSize:9, fontWeight:700, color:item.r, background:item.r+"18", padding:"1px 5px", borderRadius:4}}>YENi</span>}
                        {item.l}
                      </div>
                      <div style={{fontSize:17, fontWeight:800, color:item.r, letterSpacing:"-0.5px"}}>{item.v}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:11, color:mute, marginTop:10}}>
                Q1 2026 kaynak: <a href="https://www.rustourismnews.com/2026/05/06/turkish-airlines-returns-to-strong-profit-despite-rising-operating-costs/" target="_blank" rel="noopener noreferrer" style={{color:"#6366f1"}}>rustourismnews.com</a> · 2025 yillik: THYAO IR
              </div>
            </div>

            {/* Kontroller */}
            <div style={{...cardSt(), padding:"14px 16px"}}>
              <div style={{display:"flex", flexWrap:"wrap", gap:14, alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase"}}>Görünüm</div>
                  <div style={{display:"flex", gap:5}}>
                    <button style={btnSt(fGor==="grafik")} onClick={function() { setFGor("grafik"); }}>Grafik</button>
                    <button style={btnSt(fGor==="tablo")} onClick={function() { setFGor("tablo"); }}>Tablo</button>
                    <button style={btnSt(fGor==="ceyrek")} onClick={function() { setFGor("ceyrek"); }}>Ceyreklik</button>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase"}}>Metrik</div>
                  <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                    {METR_LIST.map(function(m) {
                      return <button key={m.k} style={btnSt(fMetrik===m.k, m.renk)} onClick={function() { setFMetrik(m.k); }}>{m.l.split(" (")[0]}</button>;
                    })}
                  </div>
                </div>
                {fGor !== "ceyrek" && (
                  <div>
                    <div style={{fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase"}}>Dönem</div>
                    <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                      {tumYillar.map(function(y) {
                        return (
                          <button key={y} style={btnSt(fYillar.includes(y))} onClick={function() {
                            setFYillar(function(p) { return p.includes(y) ? p.filter(function(x) { return x!==y; }) : p.concat([y]).sort(); });
                          }}>{y}</button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase"}}>Havayolları</div>
                  <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                    {FIN.map(function(h) {
                      return (
                        <button key={h.id} style={btnSt(fHY.includes(h.id), h.renk)} onClick={function() {
                          setFHY(function(p) { return p.includes(h.id) ? p.filter(function(x) { return x!==h.id; }) : p.concat([h.id]); });
                        }}>
                          {h.id==="thy" ? "* " : ""}{h.ad}
                        </button>
                      );
                    })}
                    <button style={btnSt(false)} onClick={function() { setFHY(FIN.map(function(h) { return h.id; })); }}>Tumu</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grafik görünümü */}
            {fGor === "grafik" && (
              <div style={cardSt()}>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:16, fontWeight:700, marginBottom:4}}>{fMetrObj.l}</div>
                  <div style={{fontSize:12, color:mute}}>
                    Dönem: {fYillar.length > 0 ? fYillar[fYillar.length-1] : "—"} · Tüm havayolları karşılaştırması
                  </div>
                </div>
                <BarChart data={grafik_data} metrik={fMetrik} dk={dk} metrObj={fMetrObj}/>

                {fYillar.length > 1 && (
                  <div style={{marginTop:24, paddingTop:20, borderTop:"1px solid " + bord}}>
                    <div style={{fontSize:13, fontWeight:600, marginBottom:12, color:mute}}>TREND — {fMetrObj.l}</div>
                    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12}}>
                      {aktifHY.map(function(h) {
                        var tVals = fYillar.map(function(y) {
                          var d = h.yil[y];
                          return d ? (d[fMetrik] !== undefined ? d[fMetrik] : null) : null;
                        });
                        var filtered = tVals.filter(function(v) { return v != null; });
                        var son = filtered.length > 0 ? filtered[filtered.length-1] : null;
                        var ilk = filtered.length > 0 ? filtered[0] : null;
                        var deg = (son != null && ilk != null && ilk !== 0) ? ((son-ilk)/Math.abs(ilk)*100) : null;
                        return (
                          <div key={h.id} style={{background: dk ? "#0f172a" : "#f8fafc", borderRadius:8, padding:"12px 14px"}}>
                            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                              <span style={{fontSize:12, fontWeight: h.id==="thy" ? 700 : 400}}>{h.id==="thy" ? "* " : ""}{h.ad}</span>
                              {deg != null && (
                                <span style={{fontSize:11, fontWeight:600, color: deg>=0 ? "#10b981" : "#ef4444"}}>
                                  {deg>=0 ? "+" : ""}{deg.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <Sparkline vals={tVals} color={h.renk}/>
                            <div style={{fontSize:11, color:mute, marginTop:4}}>{fMetrObj.fmt(son)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tablo görünümü */}
            {fGor === "tablo" && (
              <div style={cardSt()}>
                <div style={{fontSize:16, fontWeight:700, marginBottom:14}}>{fMetrObj.l} — Tablo Karşılaştırması</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                    <thead>
                      <tr>
                        <th style={thSt}>Havayolu</th>
                        {fYillar.map(function(y) { return <th key={y} style={{...thSt, textAlign:"right"}}>{y}</th>; })}
                        <th style={{...thSt, textAlign:"right"}}>YoY Son</th>
                        <th style={{...thSt, textAlign:"center"}}>Trend</th>
                        <th style={thSt}>IR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aktifHY.map(function(h, i) {
                        var vals = fYillar.map(function(y) { var d = h.yil[y]; return d ? (d[fMetrik] !== undefined ? d[fMetrik] : null) : null; });
                        var filtered = vals.filter(function(v) { return v != null; });
                        var son = filtered.length > 0 ? filtered[filtered.length-1] : null;
                        var onceki = filtered.length > 1 ? filtered[filtered.length-2] : null;
                        var yoy = (son != null && onceki != null && onceki !== 0) ? ((son-onceki)/Math.abs(onceki)*100) : null;
                        var tVals = tumYillar.map(function(y) { var d = h.yil[y]; return d ? (d[fMetrik] !== undefined ? d[fMetrik] : null) : null; });
                        return (
                          <tr key={h.id} style={{background: i%2===0 ? "transparent" : (dk ? "#ffffff06" : "#f8fafc")}}>
                            <td style={tdSt}>
                              <div style={{display:"flex", alignItems:"center", gap:8}}>
                                <div style={{width:3, height:32, borderRadius:2, background:h.renk, flexShrink:0}}/>
                                <div>
                                  <div style={{fontWeight: h.id==="thy" ? 800 : 500}}>{h.id==="thy" ? "* " : ""}{h.ad}</div>
                                  <div style={{fontSize:10, color:mute}}>{h.kod} · {h.siklik}</div>
                                </div>
                              </div>
                            </td>
                            {vals.map(function(v, vi) {
                              return <td key={vi} style={{...tdSt, textAlign:"right", color: v!=null ? txt : mute}}>{fMetrObj.fmt(v)}</td>;
                            })}
                            <td style={{...tdSt, textAlign:"right", fontWeight:600, color: yoy==null ? mute : (yoy>0 ? "#10b981" : "#ef4444")}}>
                              {yoy==null ? "-" : ((yoy>0?"+":"") + yoy.toFixed(1) + "%")}
                            </td>
                            <td style={{...tdSt, textAlign:"center"}}>
                              <Sparkline vals={tVals} color={h.renk}/>
                            </td>
                            <td style={tdSt}>
                              <a href={h.ir} target="_blank" rel="noopener noreferrer" style={{fontSize:11, color:"#6366f1", textDecoration:"none"}}>IR</a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Çeyreklik */}
            {fGor === "ceyrek" && (
              <div style={cardSt()}>
                <div style={{fontSize:16, fontWeight:700, marginBottom:4}}>Çeyreklik ve Yarıyıl Sonuçlar</div>
                <div style={{fontSize:12, color:mute, marginBottom:14}}>Rapor yayınlayan havayolları · En güncel veriler</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                    <thead>
                      <tr>
                        <th style={thSt}>Havayolu</th>
                        <th style={thSt}>Dönem</th>
                        <th style={{...thSt, textAlign:"right"}}>Gelir</th>
                        <th style={{...thSt, textAlign:"right"}}>Net Kar</th>
                        <th style={{...thSt, textAlign:"right"}}>Yolcu</th>
                        <th style={{...thSt, textAlign:"right"}}>Doluluk</th>
                        <th style={thSt}>Kaynak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aktifHY.filter(function(h) { return h.q && h.q.length > 0; }).reduce(function(acc, h, hi) {
                        h.q.forEach(function(q, qi) {
                          acc.push({h:h, q:q, hi:hi, qi:qi, total:h.q.length});
                        });
                        return acc;
                      }, []).map(function(row, i) {
                        var h = row.h, q = row.q;
                        return (
                          <tr key={h.id + q.d} style={{background: i%2===0 ? "transparent" : (dk ? "#ffffff06" : "#f8fafc")}}>
                            {row.qi === 0 ? (
                              <td style={{...tdSt, fontWeight:600}} rowSpan={row.total}>
                                <div style={{display:"flex", alignItems:"center", gap:6}}>
                                  <div style={{width:3, height:32, borderRadius:2, background:h.renk}}/>
                                  <span>{h.id==="thy" ? "* " : ""}{h.ad}</span>
                                </div>
                              </td>
                            ) : null}
                            <td style={tdSt}>
                              <div style={{display:"flex", alignItems:"center", gap:6}}>
                                <span style={tagSt(q.yeni ? h.renk : mute)}>{q.d}</span>
                                {q.yeni && <span style={{fontSize:9, fontWeight:700, color:h.renk, background:h.renk+"18", padding:"1px 5px", borderRadius:4}}>YENi</span>}
                              </div>
                            </td>
                            <td style={{...tdSt, textAlign:"right"}}>{q.g!=null ? "$"+q.g.toFixed(1)+"B" : "-"}</td>
                            <td style={{...tdSt, textAlign:"right", fontWeight:600, color: q.nk!=null ? (q.nk>=0?"#10b981":"#ef4444") : mute}}>
                              {q.nk!=null ? ((q.nk>=0?"+":"") + "$"+Math.abs(q.nk).toFixed(2)+"B") : "-"}
                            </td>
                            <td style={{...tdSt, textAlign:"right"}}>{q.p!=null ? q.p.toFixed(1)+"M" : "-"}</td>
                            <td style={{...tdSt, textAlign:"right"}}>{q.lf!=null ? q.lf.toFixed(1)+"%" : "-"}</td>
                            <td style={tdSt}>
                              <a href={q.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11, color:"#6366f1", textDecoration:"none"}}>Kaynak</a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{fontSize:11, color:mute, marginTop:8}}>Emirates, Qatar ve Singapore Airlines çeyreklik rapor yayınlamaz.</div>
              </div>
            )}

            {/* Fark Analizi */}
            <div style={cardSt()}>
              <div style={{fontSize:16, fontWeight:700, marginBottom:4}}>THY Rakip Fark Analizi — 2025</div>
              <div style={{fontSize:12, color:mute, marginBottom:12}}>Yukan: THY önde · Asagi: Rakip önde · pp = yüzde puan</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                  <thead>
                    <tr>
                      <th style={thSt}>Rakip</th>
                      <th style={{...thSt, textAlign:"right"}}>Gelir</th>
                      <th style={{...thSt, textAlign:"right"}}>Net Kar</th>
                      <th style={{...thSt, textAlign:"right"}}>Isletme Marj</th>
                      <th style={{...thSt, textAlign:"right"}}>Yolcu</th>
                      <th style={{...thSt, textAlign:"right"}}>Doluluk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FIN.filter(function(h) { return h.id !== "thy"; }).map(function(h, i) {
                      var thyY = THY.yil["2025"];
                      var rakY = h.yil["2025"];
                      function df(key, isB) {
                        if (!thyY || !rakY || thyY[key]==null || rakY[key]==null) return "-";
                        var d = thyY[key] - rakY[key];
                        var c = d >= 0 ? "#10b981" : "#ef4444";
                        var sign = d >= 0 ? "+" : "-";
                        var val = isB ? ("$"+Math.abs(d).toFixed(1)+"B") : (Math.abs(d).toFixed(1)+"pp");
                        return React.createElement("span", {style:{color:c, fontWeight:600}}, sign + " " + val);
                      }
                      return (
                        <tr key={h.id} style={{background: i%2===0 ? "transparent" : (dk ? "#ffffff06" : "#f8fafc")}}>
                          <td style={tdSt}>
                            <div style={{display:"flex", alignItems:"center", gap:8}}>
                              <div style={{width:10, height:10, borderRadius:"50%", background:h.renk}}/>
                              {h.ad}
                            </div>
                          </td>
                          <td style={{...tdSt, textAlign:"right"}}>{df("g", true)}</td>
                          <td style={{...tdSt, textAlign:"right"}}>{df("nk", true)}</td>
                          <td style={{...tdSt, textAlign:"right"}}>{df("im", false)}</td>
                          <td style={{...tdSt, textAlign:"right"}}>{df("p", true)}</td>
                          <td style={{...tdSt, textAlign:"right"}}>{df("lf", false)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Veri Kaynakları */}
            <div style={{...cardSt(), background: dk ? "#0f172a" : "#f8fafc", padding:"16px 20px"}}>
              <div style={{fontSize:12, fontWeight:700, color:mute, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12}}>Veri Kaynakları</div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:8}}>
                {FIN.map(function(h) {
                  return (
                    <div key={h.id} style={{display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:card, borderRadius:8, border:"1px solid " + bord}}>
                      <div style={{width:8, height:8, borderRadius:"50%", background:h.renk, flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12, fontWeight:600, color:txt}}>{h.ad}</div>
                        <div style={{fontSize:11, color:mute}}>{h.ir_kaynak} · {h.mali} · {h.siklik}</div>
                        {h.not && <div style={{fontSize:10, color:"#f59e0b"}}>{h.not}</div>}
                      </div>
                      <a href={h.ir} target="_blank" rel="noopener noreferrer" style={{fontSize:11, color:"#6366f1", textDecoration:"none", flexShrink:0}}>IR</a>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:11, color:mute, marginTop:12, paddingTop:12, borderTop:"1px solid " + bord}}>
                Kur verisi: fawazahmed0/exchange-api (jsDelivr CDN) · EUR/USD ~1.08 · SGD/USD ~0.74 · Son güncelleme: {piyasa.ts || "—"}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CHAT BUTONU */}
      <button
        onClick={function() { setChatAcik(function(p) { return !p; }); }}
        style={{position:"fixed", bottom:24, right:24, width:50, height:50, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", border:"none", cursor:"pointer", fontSize:18, boxShadow:"0 4px 20px rgba(99,102,241,.4)", zIndex:200, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700}}
      >
        {chatAcik ? "X" : "AI"}
      </button>

      {chatAcik && (
        <div style={{position:"fixed", bottom:84, right:24, width:340, maxHeight:460, background:card, border:"1px solid " + bord, borderRadius:16, display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,.15)", zIndex:200, overflow:"hidden"}}>
          <div style={{padding:"12px 16px", borderBottom:"1px solid " + bord, display:"flex", justifyContent:"space-between", alignItems:"center", fontWeight:600, fontSize:13}}>
            <span>Analiz Asistanı</span>
            <button style={{background:"none", border:"none", cursor:"pointer", color:mute, fontSize:16}} onClick={function() { setChatAcik(false); }}>X</button>
          </div>
          <div style={{flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:8}}>
            {msgs.map(function(m, i) {
              return (
                <div key={i} style={{padding:"8px 11px", borderRadius: m.r==="u" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: m.r==="u" ? "#6366f1" : (dk ? "#0f172a" : "#f1f5f9"), color: m.r==="u" ? "#fff" : txt, fontSize:13, lineHeight:1.55, maxWidth:"90%", alignSelf: m.r==="u" ? "flex-end" : "flex-start"}}>
                  {m.t}
                </div>
              );
            })}
            {chatLoading && (
              <div style={{padding:"8px 11px", borderRadius:"12px 12px 12px 4px", background: dk ? "#0f172a" : "#f1f5f9", color:mute, fontSize:13}}>Yanit hazirlaniyor...</div>
            )}
            <div ref={chatEndRef}/>
          </div>
          <div style={{padding:"6px 10px", borderTop:"1px solid " + bord + "50", display:"flex", flexWrap:"wrap", gap:4}}>
            {["THY Q1 2026 degerlendirmesi","Rakiplere gore marj analizi","NDC dagitimi durumu"].map(function(q) {
              return (
                <button key={q} style={{padding:"3px 8px", borderRadius:10, border:"1px solid " + bord, background:"transparent", color:"#6366f1", fontSize:11, cursor:"pointer"}} onClick={function() { sendChat(q); }}>{q}</button>
              );
            })}
          </div>
          <div style={{padding:"10px 12px", borderTop:"1px solid " + bord, display:"flex", gap:8}}>
            <input
              style={{flex:1, padding:"7px 11px", borderRadius:8, border:"1px solid " + bord, background: dk ? "#0f172a" : "#f8fafc", color:txt, fontSize:13, outline:"none"}}
              placeholder="Soru sor..."
              value={chatIn}
              onChange={function(e) { setChatIn(e.target.value); }}
              onKeyDown={function(e) { if (e.key === "Enter") sendChat(); }}
            />
            <button style={{padding:"7px 13px", borderRadius:8, border:"none", background:"#6366f1", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600}} onClick={function() { sendChat(); }}>Gonder</button>
          </div>
        </div>
      )}
    </div>
  );
}
