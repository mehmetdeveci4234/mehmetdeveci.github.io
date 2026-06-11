import { useState, useEffect, useRef, useCallback } from "react";

/* ── API ─────────────────────────────────────────────────────────────────────
   fawazahmed0/exchange-api  →  jsDelivr CDN
   Key yok · CORS açık · Günlük güncellenir · Tarihsel veri desteği var
   Bugün  : cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json
   Geçmiş : cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@YYYY-MM-DD/v1/currencies/usd.json
────────────────────────────────────────────────────────────────────────────── */
const CDN = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api";
const CF  = "https://latest.currency-api.pages.dev"; // Cloudflare fallback
const ENERJI = { brent: 72.4, jet: 82.1 };

function dateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

async function fetchRates(tag) {
  const urls = [
    `${CDN}@${tag}/v1/currencies/usd.json`,
    `${CF}/v1/currencies/usd.json`,
  ];
  for (const url of urls) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const d = await r.json();
      const rates = d && d.usd;
      if (!rates) continue;
      return { try: rates.try ?? null, eur: rates.eur ?? null };
    } catch (_) { continue; }
  }
  return null;
}

/* ── FİNANSAL VERİLER ────────────────────────────────────────────────────── */
const FIN = [
  {
    id:"thy", ad:"Turkish Airlines", kod:"THYAO", bors:"BIST", renk:"#C8102E",
    mali:"Ocak–Aralık", siklik:"Çeyreklik",
    ir:"https://investor.turkishairlines.com",
    yil:{
      "2022":{g:16.8,ik:2.6, nk:2.4, p:71.4, lf:79.8, im:15.5, nm:14.3, f:411},
      "2023":{g:20.5,ik:3.6, nk:3.0, p:83.4, lf:82.3, im:17.6, nm:14.6, f:444},
      "2024":{g:22.7,ik:4.18,nk:3.42,p:90.2, lf:84.1, im:18.4, nm:15.1, f:492},
      "2025":{g:24.1,ik:3.65,nk:2.90,p:97.2, lf:84.8, im:15.1, nm:12.0, f:516},
    },
    q:[
      {d:"Q1 2026",g:5.9, nk:0.23,p:21.3,lf:83.8,url:"https://www.rustourismnews.com/2026/05/06/turkish-airlines-returns-to-strong-profit-despite-rising-operating-costs/"},
      {d:"Q4 2025",g:5.2, nk:-0.1,p:22.4,lf:82.1,url:"https://investor.turkishairlines.com"},
      {d:"Q3 2025",g:7.0, nk:0.23,p:26.1,lf:85.2,url:"https://investor.turkishairlines.com"},
      {d:"Q2 2025",g:6.3, nk:0.88,p:24.8,lf:84.9,url:"https://investor.turkishairlines.com"},
    ],
  },
  {
    id:"emirates", ad:"Emirates", kod:"EK", bors:"Halka açık değil", renk:"#CC0001",
    mali:"Nisan–Mart", siklik:"Yıllık/Yarıyıl",
    ir:"https://www.emirates.com/media-centre/",
    not:"OP ayrıştırılmaz.",
    yil:{
      "2022":{g:26.0,ik:null,nk:1.5, p:45.7,lf:72.0,im:null,nm:5.8, f:259},
      "2023":{g:32.6,ik:null,nk:4.7, p:51.9,lf:78.4,im:null,nm:14.4,f:260},
      "2024":{g:36.9,ik:null,nk:4.7, p:52.1,lf:79.9,im:null,nm:12.7,f:261},
      "2025":{g:39.6,ik:null,nk:5.19,p:53.7,lf:78.9,im:null,nm:14.9,f:270},
    },
    q:[{d:"H1 2025-26",g:21.4,nk:3.2,p:27.8,lf:79.5,url:"https://www.emirates.com/media-centre/emirates-group-hits-new-half-year-profit-record-for-2025-26/"}],
  },
  {
    id:"lufthansa", ad:"Lufthansa Group", kod:"LHA", bors:"XETRA", renk:"#05164D",
    mali:"Ocak–Aralık", siklik:"Çeyreklik",
    ir:"https://investor-relations.lufthansagroup.com",
    not:"EUR/USD ~1.08",
    yil:{
      "2022":{g:34.1,ik:1.5, nk:0.8, p:102.6,lf:78.4,im:4.4,nm:2.3, f:775},
      "2023":{g:38.8,ik:2.7, nk:1.7, p:123.0,lf:82.2,im:7.0,nm:4.4, f:783},
      "2024":{g:40.6,ik:1.78,nk:1.51,p:130.7,lf:83.1,im:4.4,nm:3.7, f:800},
      "2025":{g:42.7,ik:2.12,nk:1.40,p:135.0,lf:83.2,im:4.9,nm:3.3, f:821},
    },
    q:[
      {d:"Q1 2026",g:9.2, nk:0.31,p:33.2,lf:81.4,url:"https://investor-relations.lufthansagroup.com/en/financial-reports-publications.html"},
      {d:"Q4 2025",g:9.8, nk:0.18,p:31.1,lf:80.9,url:"https://investor-relations.lufthansagroup.com"},
      {d:"Q3 2025",g:12.1,nk:0.72,p:38.4,lf:86.3,url:"https://investor-relations.lufthansagroup.com"},
    ],
  },
  {
    id:"afklm", ad:"Air France-KLM", kod:"AF", bors:"Euronext", renk:"#002157",
    mali:"Ocak–Aralık", siklik:"Çeyreklik",
    ir:"https://www.airfranceklm.com/en/investors",
    not:"EUR/USD ~1.08",
    yil:{
      "2022":{g:28.9,ik:1.3, nk:0.7, p:88.1, lf:80.0,im:4.5,nm:2.4, f:522},
      "2023":{g:32.5,ik:1.7, nk:0.9, p:97.6, lf:86.4,im:5.2,nm:2.8, f:530},
      "2024":{g:33.8,ik:1.72,nk:1.06,p:98.0, lf:87.8,im:5.1,nm:3.1, f:541},
      "2025":{g:35.6,ik:2.16,nk:1.84,p:102.8,lf:87.2,im:6.1,nm:5.2, f:545},
    },
    q:[
      {d:"Q4 2025",g:8.1, nk:0.63,p:24.9,lf:85.1,url:"https://www.airfranceklm.com/sites/default/files/2026-02/afklm_full_year_2025_press_release_english.pdf"},
      {d:"Q3 2025",g:9.8, nk:0.91,p:28.6,lf:88.4,url:"https://www.airfranceklm.com/en/investors"},
      {d:"Q2 2025",g:8.4, nk:0.54,p:26.1,lf:87.2,url:"https://www.airfranceklm.com/en/investors"},
    ],
  },
  {
    id:"iag", ad:"IAG", kod:"IAG", bors:"LSE/BME", renk:"#1B3A6B",
    mali:"Ocak–Aralık", siklik:"Çeyreklik",
    ir:"https://www.iairgroup.com/investors",
    not:"EUR/USD ~1.08",
    yil:{
      "2022":{g:23.0,ik:1.5, nk:0.9, p:98.4, lf:82.0,im:6.5, nm:3.9, f:530},
      "2023":{g:29.3,ik:3.5, nk:2.7, p:116.0,lf:86.5,im:11.9,nm:9.2, f:540},
      "2024":{g:32.1,ik:4.05,nk:3.24,p:121.8,lf:86.8,im:12.6,nm:10.1,f:560},
      "2025":{g:34.5,ik:4.28,nk:3.56,p:127.5,lf:87.1,im:12.4,nm:10.3,f:571},
    },
    q:[
      {d:"Q1 2026",g:7.8, nk:0.61,p:30.2,lf:84.8,url:"https://www.iairgroup.com/investors/results-and-presentations"},
      {d:"Q4 2025",g:8.1, nk:0.74,p:31.5,lf:85.2,url:"https://www.iairgroup.com/investors"},
      {d:"Q3 2025",g:10.2,nk:1.42,p:36.1,lf:88.1,url:"https://www.iairgroup.com/investors"},
    ],
  },
  {
    id:"qatar", ad:"Qatar Airways", kod:"QR", bors:"Halka açık değil", renk:"#5C0632",
    mali:"Nisan–Mart", siklik:"Yıllık",
    ir:"https://www.qatarairways.com/en/pressreleases.html",
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
    mali:"Ocak–Aralık", siklik:"Çeyreklik",
    ir:"https://ir.delta.com",
    yil:{
      "2022":{g:50.6,ik:3.7,nk:1.3, p:192.0,lf:83.0,im:7.3,nm:2.6, f:980},
      "2023":{g:58.0,ik:5.6,nk:4.6, p:200.0,lf:84.8,im:9.7,nm:7.9, f:1002},
      "2024":{g:61.6,ik:5.8,nk:3.5, p:204.0,lf:85.2,im:9.4,nm:5.7, f:1010},
      "2025":{g:62.9,ik:5.5,nk:3.2, p:205.0,lf:85.1,im:8.7,nm:5.1, f:1025},
    },
    q:[
      {d:"Q1 2026",g:14.0,nk:0.24,p:50.1,lf:83.2,url:"https://ir.delta.com/news-releases/news-release-details/delta-air-lines-announces-march-quarter-2026-financial-results"},
      {d:"Q4 2025",g:15.6,nk:0.82,p:51.2,lf:84.1,url:"https://ir.delta.com"},
    ],
  },
  {
    id:"singapore", ad:"Singapore Airlines", kod:"SIA", bors:"SGX", renk:"#004B87",
    mali:"Nisan–Mart", siklik:"Yarıyıl",
    ir:"https://www.singaporeair.com/en_UK/us/about-us/investor-relations/",
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

const METR = {
  g:  { l:"Gelir (USD B)",    fmt: v => v != null ? "$" + v.toFixed(1) + "B" : "—", renk:"#6366f1" },
  nk: { l:"Net Kar (USD B)",  fmt: v => v != null ? (v >= 0 ? "+" : "") + "$" + Math.abs(v).toFixed(2) + "B" : "—", renk:"#10b981" },
  ik: { l:"EBIT (USD B)",     fmt: v => v != null ? "$" + v.toFixed(2) + "B" : "—", renk:"#0ea5e9" },
  im: { l:"Isletme Marji %",  fmt: v => v != null ? v.toFixed(1) + "%" : "—", renk:"#f59e0b" },
  nm: { l:"Net Marj %",       fmt: v => v != null ? v.toFixed(1) + "%" : "—", renk:"#8b5cf6" },
  p:  { l:"Yolcu (M)",        fmt: v => v != null ? v.toFixed(1) + "M" : "—", renk:"#ef4444" },
  lf: { l:"Doluluk %",        fmt: v => v != null ? v.toFixed(1) + "%" : "—", renk:"#14b8a6" },
  f:  { l:"Filo (ucak)",      fmt: v => v != null ? String(v) : "—", renk:"#f97316" },
};

const KKAT = [
  {id:"tumu",l:"Tümü"},{id:"gds_ndc",l:"GDS & NDC"},{id:"one_order",l:"ONE Order"},
  {id:"teknoloji",l:"Teknoloji"},{id:"yeni_hat",l:"Yeni Hat"},
  {id:"ortaklik",l:"Ortaklık"},{id:"finansal",l:"Finansal"},{id:"duzenleyici",l:"Düzenleyici"},
];
const KRENK = {
  gds_ndc:"#6366f1", one_order:"#0ea5e9", teknoloji:"#06b6d4",
  yeni_hat:"#10b981", ortaklik:"#8b5cf6", finansal:"#ef4444", duzenleyici:"#f59e0b",
};

const HABERLER = [
  {id:1, t:"2026-06-10",b:"Amadeus NDC rezervasyonları 500 milyon sınırını aştı",o:"Amadeus, NDC tabanlı rezervasyon hacminin 500 milyon bandını geçtiğini açıkladı. Dağıtım gelirleri %18 artarken şirket 2027 sonuna kadar NDC oranını %50'ye taşımayı hedefliyor.",k:"gds_ndc",hy:"Amadeus",s:[{a:"Amadeus IR",u:"https://ir.amadeus.com/en/financial-news-and-events/press-releases"},{a:"PhocusWire",u:"https://www.phocuswire.com/amadeus-ndc-500-million-bookings"}],az:true},
  {id:2, t:"2026-06-09",b:"Turkish Airlines Sabre acentelerine NDC teşvik paketi başlattı",o:"THY, Sabre üzerinden NDC rezervasyonlarına ek komisyon ve erken koltuk seçimi avantajı sunuyor.",k:"gds_ndc",hy:"Turkish Airlines",s:[{a:"THY Newsroom",u:"https://www.turkishairlines.com/en-int/press-room/news/"},{a:"Travel Weekly",u:"https://www.travelweekly.com/Travel-News/Airline-News/Turkish-Airlines-Sabre-NDC"}],az:true},
  {id:3, t:"2026-06-09",b:"IATA ONE Order sertifikasyonu 60 havayolunu geçti",o:"Wizz Air Avrupa'da ONE Order'a geçen ilk LCC olurken Finnair ve TAP da süreci tamamladı.",k:"one_order",hy:"Tümü",s:[{a:"IATA ONE Order",u:"https://www.iata.org/en/programs/ops-infra/one-order/"},{a:"PhocusWire",u:"https://www.phocuswire.com/iata-one-order-60-airlines"}],az:true},
  {id:4, t:"2026-06-08",b:"Lufthansa Group 2025'te 39,6 milyar Euro rekor gelir açıkladı",o:"Düzeltilmiş EBIT %19 büyüyerek 2 milyar Euro'ya ulaştı. 135 milyon yolcu taşındı.",k:"finansal",hy:"Lufthansa",s:[{a:"Lufthansa AR 2025",u:"https://report.lufthansagroup.com/2025/annual-report/en/"},{a:"Lufthansa Newsroom",u:"https://newsroom.lufthansagroup.com/en/lufthansa-group-increases-operating-profit-by-20-percent-and-achieves-highest-revenue-in-company-history/"}],az:true},
  {id:5, t:"2026-06-08",b:"Sabre NDC içerik platformunu yeniden yapılandırdı",o:"Sabre, SynXis Air platformunu tüm GDS müşterilerine açtı. Yeni mimari dinamik fiyatlamaları milisaniyede dağıtıyor.",k:"gds_ndc",hy:"Sabre",s:[{a:"Sabre Newsroom",u:"https://www.sabre.com/insights/news/"}],az:false},
  {id:6, t:"2026-06-07",b:"IATA Mayıs 2026: Küresel RPK büyümesi %9,2 ile beklentileri aştı",o:"Asya-Pasifik %14,1 ile en hızlı büyüyen bölge; küresel doluluk %83,7 ile 5 yılın zirvesinde.",k:"finansal",hy:"Tümü",s:[{a:"IATA Air Passenger Market",u:"https://www.iata.org/en/publications/economics/air-passenger-monthly-analysis/"}],az:true},
  {id:7, t:"2026-06-07",b:"Emirates ile Amadeus çok yıllı NDC dağıtım anlaşmasını yeniledi",o:"Tam içerik paritesi ve dinamik paket fiyatlaması anlaşmaya dahil.",k:"ortaklik",hy:"Emirates",s:[{a:"Emirates Newsroom",u:"https://www.emirates.com/media-centre/"},{a:"Amadeus Newsroom",u:"https://ir.amadeus.com/en/financial-news-and-events/press-releases"}],az:true},
  {id:8, t:"2026-06-06",b:"Travelport AI arama motorunu tüm GDS müşterilerine açtı",o:"Smartpoint Cloud'a entegre motor işlem süresini %60 kısalttı.",k:"teknoloji",hy:"Travelport",s:[{a:"Travelport Blog",u:"https://www.travelport.com/blog"},{a:"Skift",u:"https://skift.com/2026/06/06/travelport-ai-search-engine/"}],az:false},
  {id:9, t:"2026-06-06",b:"Turkish Airlines Istanbul-Bogota direkt seferini başlattı",o:"THY haftada 4 sefer olarak başlattığı direkt uçuşla Latin Amerika ağını genişletti.",k:"yeni_hat",hy:"Turkish Airlines",s:[{a:"THY Newsroom",u:"https://www.turkishairlines.com/en-int/press-room/news/"},{a:"Simple Flying",u:"https://simpleflying.com/turkish-airlines-istanbul-bogota-launch/"}],az:false},
  {id:10,t:"2026-06-05",b:"AB Havacılık Otoritesi GDS şeffaflık yönetmeliği taslağını yayımladı",o:"2027 yürürlük hedefiyle içerik eşitliği ve ücret şeffaflığı zorunluluğu geliyor.",k:"duzenleyici",hy:"Tümü",s:[{a:"EC Transport",u:"https://transport.ec.europa.eu/transport-modes/air_en"},{a:"PhocusWire",u:"https://www.phocuswire.com/eu-gds-transparency-regulation-2027"}],az:true},
  {id:11,t:"2026-06-05",b:"Air France-KLM 2025'te 102,8M yolcu ile rekor kırdı",o:"33 milyar Euro gelir ve 2 milyar Euro işletme kari ile tüm zamanların en iyi sonucu.",k:"finansal",hy:"Air France-KLM",s:[{a:"AF-KLM FY2025 PR",u:"https://www.airfranceklm.com/sites/default/files/2026-02/afklm_full_year_2025_press_release_english.pdf"}],az:true},
  {id:12,t:"2026-06-04",b:"Air France-KLM Sabre NDC tam entegrasyonunu tamamladı",o:"430.000+ Sabre acentesi tüm tarife ve ürün seçeneklerine erişebilecek.",k:"gds_ndc",hy:"Air France-KLM",s:[{a:"AF-KLM Press",u:"https://www.airfranceklm.com/en/press-release"},{a:"Sabre News",u:"https://www.sabre.com/insights/news/"}],az:true},
  {id:13,t:"2026-06-04",b:"Lufthansa Frankfurt-Kuala Lumpur seferini Ekim 2026'da yeniden başlatıyor",o:"A350-900 ile haftada 5 sefer. Pandemi döneminde durdurulmuştu.",k:"yeni_hat",hy:"Lufthansa",s:[{a:"Lufthansa PR",u:"https://newsroom.lufthansagroup.com/en/lufthansa-resumes-frankfurt-kuala-lumpur/"},{a:"Simple Flying",u:"https://simpleflying.com/lufthansa-frankfurt-kuala-lumpur-restart/"}],az:false},
  {id:14,t:"2026-06-03",b:"Amadeus ve IATA ONE Order entegrasyonunu tamamladı",o:"Bilet, otel, transfer ve sigorta artık tek sipariş kaydında birleştirilebiliyor.",k:"one_order",hy:"Amadeus",s:[{a:"Amadeus ONE Order",u:"https://www.amadeus.com/en/portfolio/distribution/one-order"},{a:"IATA ONE Order",u:"https://www.iata.org/en/programs/ops-infra/one-order/"}],az:true},
  {id:15,t:"2026-06-03",b:"Singapore Airlines AI fiyatlama motorunu 12 pazara yaydı",o:"Kişiselleştirilmiş dinamik tekliflerle dönüşüm oranında %31 artış görüldü.",k:"teknoloji",hy:"Singapore Airlines",s:[{a:"SIA Media Hub",u:"https://www.singaporeair.com/en_UK/us/about-us/press-room/news-releases/"},{a:"Skift",u:"https://skift.com/2026/06/03/singapore-airlines-ai-pricing/"}],az:true},
  {id:16,t:"2026-06-02",b:"Delta Air Lines Q1 2026: Gelir beklentilerin altında kaldı",o:"14 milyar dolar gelir açıklandı; tarife baskısı net kari yillik %41 dusurdu.",k:"finansal",hy:"Delta",s:[{a:"Delta IR Q1 2026",u:"https://ir.delta.com/news-releases/news-release-details/delta-air-lines-announces-march-quarter-2026-financial-results"}],az:true},
  {id:17,t:"2026-06-01",b:"IAG Q1 2026: Transatlantik talep karlilik destekledi",o:"7,8 milyar Euro gelir, 610 milyon Euro net kar. Transatlantik doluluk %88'i asti.",k:"finansal",hy:"IAG",s:[{a:"IAG IR Q1 2026",u:"https://www.iairgroup.com/investors/results-and-presentations"}],az:true},
  {id:18,t:"2026-05-31",b:"IATA NDC standardinin 21.3 versiyonu yayimlandi",o:"Grup rezervasyonlari ve interline teklifler icin yeni sema tanimlari. 18 aylik gecis suresi.",k:"one_order",hy:"Tümü",s:[{a:"IATA NDC 21.3",u:"https://www.iata.org/en/programs/airline-distribution/ndc/ndc-news/"}],az:false},
  {id:19,t:"2026-05-30",b:"AB Komisyonu havacilık dijital tek pazar direktifini yayimladi",o:"API standardizasyonu ve veri tasınabilirligini zorunlu kılan direktif GDS sistemlerini etkiliyor.",k:"duzenleyici",hy:"Tümü",s:[{a:"EC Transport",u:"https://transport.ec.europa.eu/transport-modes/air_en"},{a:"PhocusWire",u:"https://www.phocuswire.com/eu-aviation-digital-single-market-directive"}],az:true},
  {id:20,t:"2026-05-29",b:"Travelport ve Etihad NDC anlasmasi: Kisisellestirilen teklifler devrede",o:"Kisisellestirilen dinamik paket tekliflerini mumkun kilan anlaşma 3 pilot pazarda aktif.",k:"ortaklik",hy:"Etihad",s:[{a:"Travelport Blog",u:"https://www.travelport.com/blog"},{a:"Travel Weekly",u:"https://www.travelweekly.com/Travel-News/Airline-News/Travelport-Etihad-NDC"}],az:false},
];

const GUNDEM_KKAT = [
  { id:"turkiye",   l:"Türkiye",   emoji:"🇹🇷", renk:"#ef4444" },
  { id:"dunya",     l:"Dünya",     emoji:"🌍", renk:"#0ea5e9" },
  { id:"ispanya",   l:"İspanya",   emoji:"🇪🇸", renk:"#f59e0b" },
  { id:"spor",      l:"Spor",      emoji:"⚽", renk:"#10b981" },
  { id:"smalltalk", l:"Small Talk",emoji:"💡", renk:"#8b5cf6" },
];

const GUNDEM = [
  { id:1, kat:"turkiye", onemli:true, tarih:"11 Haz",
    b:"TCMB faiz kararı bugün saat 14:00'te açıklanacak",
    o:"Merkez Bankası Haziran 2026 PPK toplantısı bugün. Ekonomistlerin büyük çoğunluğu politika faizinin %37'de sabit kalmasını bekliyor.",
    url:"https://bigpara.hurriyet.com.tr/ekonomi-haberleri/galeri-merkez-bankasi-faiz-karari-haziran-2026-tarihi_ID100913099/" },
  { id:2, kat:"turkiye", onemli:false, tarih:"10 Haz",
    b:"Türkiye turizm geliri 2026'da 62 milyar dolara ulaştı",
    o:"Ocak-Mayıs döneminde 18,4 milyon yabancı turist. Avrupalı ve Körfezli turist artışı havacılık talebini besliyor.",
    url:"https://www.hurriyet.com.tr/ekonomi/turizm-geliri-2026" },
  { id:3, kat:"turkiye", onemli:false, tarih:"9 Haz",
    b:"İstanbul Havalimanı Avrupa'nın en yoğun havalimanı",
    o:"ACI Europe: İstanbul Havalimanı Mayıs 2026'da 9,1 milyon yolcuyla Paris CDG'yi geride bıraktı.",
    url:"https://www.dhmi.gov.tr/haberler" },
  { id:4, kat:"turkiye", onemli:false, tarih:"8 Haz",
    b:"Türkiye Q1 2026 büyümesi %4,2",
    o:"TÜİK: İhracat ve hizmet sektörü öncülüğünde büyüme. Enflasyon %38'e geriledi.",
    url:"https://www.tuik.gov.tr" },
  { id:5, kat:"dunya", onemli:true, tarih:"11 Haz",
    b:"2026 FIFA Dünya Kupası Kuzey Amerika'da başlıyor",
    o:"48 takım, 11 Haziran - 19 Temmuz. ABD, Kanada, Meksika. Açılış: Meksika - Güney Afrika.",
    url:"https://spor.haber7.com/dunya-kupasi/haber/3634351-2026-dunya-kupasi-basliyor-iste-fikstur-turkiyenin-maclari-ne-zaman" },
  { id:6, kat:"dunya", onemli:false, tarih:"10 Haz",
    b:"Fed politika faizini sabit tuttu",
    o:"Yüksek enflasyon ortamında ABD Merkez Bankası faizi değiştirmedi. Jet yakıtı baskısı sürüyor.",
    url:"https://www.reuters.com/markets/rates-bonds/fed-holds-rates-steady/" },
  { id:7, kat:"dunya", onemli:false, tarih:"9 Haz",
    b:"Orta Doğu gerilimi: Hava hatları güzergah değiştirdi",
    o:"Jeopolitik gelişmeler nedeniyle birçok Avrupa havayolu güzergahlarını revize etti. THY Orta Doğu kapasitesini %9,3 kıstı.",
    url:"https://www.airwaysmag.com/new-post/qatar-airways-strong-full-year-profit" },
  { id:8, kat:"dunya", onemli:false, tarih:"8 Haz",
    b:"IATA: Küresel havacılık karı 2026'da 36 milyar dolar",
    o:"Yolcu talebi güçlü; yakıt maliyetleri ve personel giderleri baskı oluşturuyor.",
    url:"https://www.iata.org/en/pressroom/2026-releases/" },
  { id:9, kat:"ispanya", onemli:true, tarih:"11 Haz",
    b:"İspanya Dünya Kupası'nda favori — B Grubu'nda mücadele ediyor",
    o:"Mevcut Avrupa ve Dünya şampiyonu İspanya, Pedri ve Yamal ile en güçlü aday görülüyor.",
    url:"https://www.marca.com/futbol/seleccion/2026/06/11/espana-mundial-2026.html" },
  { id:10, kat:"ispanya", onemli:false, tarih:"10 Haz",
    b:"Real Madrid Arda Güler'i satmıyor",
    o:"Florentino Perez, Dünya Kupası öncesinde Arda Güler transferine kapıyı kapattı.",
    url:"https://www.marca.com/futbol/real-madrid/" },
  { id:11, kat:"ispanya", onemli:false, tarih:"9 Haz",
    b:"İspanya ekonomisi AB'nin en hızlısı: %2,8 büyüme",
    o:"Turizm ve ihracat gelirlerindeki güçlü seyir AB ortalamasının üzerinde büyüme sağladı.",
    url:"https://www.reuters.com/markets/europe/spain-economy-2026/" },
  { id:12, kat:"ispanya", onemli:false, tarih:"8 Haz",
    b:"IAG kolu Iberia rekor 16,8M yolcu taşıdı",
    o:"2026 ilk 5 ayda 16,8 milyon yolcu. Latin Amerika hatlarında güçlü talep.",
    url:"https://www.iairgroup.com/investors" },
  { id:13, kat:"spor", onemli:true, tarih:"14 Haz",
    b:"TÜRKIYE - AVUSTRALYA | Dünya Kupası D Grubu — 14 Haz 07:00 TRT 1",
    o:"24 yıl aradan sonra Dünya Kupası. BC Place Vancouver. Arda Güler, Kenan Yıldız, Hakan Çalhanoğlu, Ferdi Kadıoğlu.",
    url:"https://www.milliyet.com.tr/galeri/milli-mac-ne-zaman-avustralya-turkiye-2026-fifa-dunya-kupasi-maci-ne-zaman-saat-kacta-hangi-kanalda-a-milli-takim-grupta-ilk-7603344" },
  { id:14, kat:"spor", onemli:false, tarih:"20 Haz",
    b:"Türkiye - Paraguay | 2. Maç — 20 Haz 06:00 TRT 1",
    o:"San Francisco Bay Area Stadyumu. Galip gelen takım son 16'ya büyük adım atar.",
    url:"https://spor.haber7.com/dunya-kupasi/haber/3634351" },
  { id:15, kat:"spor", onemli:false, tarih:"26 Haz",
    b:"Türkiye - ABD | 3. Maç — 26 Haz 05:00 TRT 1",
    o:"Los Angeles Stadium. Grup liderliği ve eleme hesapları bu maçta netleşecek.",
    url:"https://spor.haber7.com/dunya-kupasi/haber/3634351" },
  { id:16, kat:"spor", onemli:false, tarih:"Haziran",
    b:"Galatasaray 4. şampiyonluk sonrası transfer sezonunu açtı",
    o:"Şampiyonlar Ligi için kadro güçlendiriliyor. Osimhen alternatifi aranıyor.",
    url:"https://www.fanatik.com.tr/takim/galatasaray/futbol/" },
  { id:17, kat:"spor", onemli:false, tarih:"Haziran",
    b:"Fenerbahçe'de Aziz Yıldırım yeniden başkan, Lewandowski transferi ilan edildi",
    o:"Kongrede seçilir seçilmez Lewandowski ve Guirassy transferlerini duyurdu.",
    url:"https://www.fanatik.com.tr/takim/fenerbahce/futbol/" },
  { id:18, kat:"spor", onemli:false, tarih:"Haziran",
    b:"Beşiktaş'ta Vincenzo Italiano dönemi başlıyor",
    o:"Eski Fiorentina teknik direktörü ile sözleşme imzalandı. Transfer bütçesi 30M Euro.",
    url:"https://www.fanatik.com.tr/takim/besiktas/futbol/" },
  { id:19, kat:"smalltalk", onemli:false, tarih:"11 Haz",
    b:"İstanbul konut fiyatları 6 ayda %12 geriledi",
    o:"Emlakjet: Kadıköy ve Beşiktaş'ta düşüş sınırlı, Anadolu yakası daha fazla etkilendi.",
    url:"https://www.emlakjet.com/haberler/" },
  { id:20, kat:"smalltalk", onemli:false, tarih:"10 Haz",
    b:"Netflix Türkiye'nin yeni dizisi 'Miras' global listede 3. oldu",
    o:"Yayına girdikten 3 gün içinde 60 ülkede izleniyor. Avrupa'da rekor kırıyor.",
    url:"https://www.hurriyet.com.tr/kelebek/magazin/" },
  { id:21, kat:"smalltalk", onemli:false, tarih:"9 Haz",
    b:"Arda Güler ve Kenan Yıldız Golden Boy finalinde",
    o:"Real Madrid ve Juventus'taki iki Türk yıldız Avrupa'nın en prestijli genç oyuncu ödülünde finalde.",
    url:"https://www.mynet.com/spor/2026-dunya-kupasi" },
  { id:22, kat:"smalltalk", onemli:false, tarih:"8 Haz",
    b:"Kapadokya balon turu rezervasyonları 3 ay önceden dolmaya başladı",
    o:"Turizm Bakanlığı: Yaz sezonu için %40 artış bekleniyor. Erken rezervasyon şart.",
    url:"https://www.kulturportali.gov.tr" },
  { id:23, kat:"smalltalk", onemli:false, tarih:"7 Haz",
    b:"İstanbul trafiği AI ile yönetiliyor: TomTom sıralamasında 3 basamak geriledi",
    o:"Hâlâ dünyanın en kötü 5 trafiği arasında ama AI destekli sistem fark yaratıyor.",
    url:"https://www.ibb.istanbul/haberler" },
];

/* ── KUR HOOK ─────────────────────────────────────────────────────────────── */
function usePiyasa() {
  const init = {
    usdtry:null, eurtry:null, usdeur:null,
    usdtry_prev:null, eurtry_prev:null, usdeur_prev:null,
    brent:ENERJI.brent, jet:ENERJI.jet,
    ts:null, loading:true, err:null,
  };
  const [v, setV] = useState(init);

  const fetch_ = useCallback(async () => {
    setV(p => ({ ...p, loading:true, err:null }));
    try {
      const [today, yesterday] = await Promise.all([
        fetchRates("latest"),
        fetchRates(dateStr(-1)),
      ]);
      if (!today) throw new Error("veri alinamadi");
      const usdtry = today.try;
      const usdeur = today.eur;
      const eurtry = (usdtry && usdeur) ? usdtry / usdeur : null;
      const usdtry_prev = yesterday ? yesterday.try : null;
      const usdeur_prev = yesterday ? yesterday.eur : null;
      const eurtry_prev = (usdtry_prev && usdeur_prev) ? usdtry_prev / usdeur_prev : null;
      setV({
        usdtry, eurtry, usdeur,
        usdtry_prev, eurtry_prev, usdeur_prev,
        brent: ENERJI.brent, jet: ENERJI.jet,
        ts: new Date().toLocaleTimeString("tr-TR"),
        loading: false, err: null,
      });
    } catch (e) {
      setV(p => ({ ...p, loading:false, err:"Kur verisi alinamadi" }));
    }
  }, []);

  useEffect(() => {
    fetch_();
    const iv = setInterval(fetch_, 10 * 60 * 1000);
    return () => clearInterval(iv);
  }, [fetch_]);

  return { ...v, refresh: fetch_ };
}

/* ── SPARKLINE ──────────────────────────────────────────────────────────────*/
function Sparkline({ vals, color, h=28, w=80 }) {
  const t = vals.filter(v => v != null);
  if (t.length < 2) return null;
  const mn = Math.min(...t), mx = Math.max(...t), rng = mx - mn || 1;
  const step = w / (t.length - 1);
  const pts = t.map((v,i) =>
    (i * step).toFixed(1) + "," + (h - ((v - mn) / rng) * h).toFixed(1)
  ).join(" ");
  const lx = (t.length - 1) * step;
  const ly = h - ((t[t.length - 1] - mn) / rng) * h;
  return (
    <svg width={w} height={h} viewBox={"0 0 " + w + " " + h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={lx} cy={ly} r="2.5" fill={color}/>
    </svg>
  );
}

/* ── KUR ŞERİDİ ─────────────────────────────────────────────────────────────*/
function KurSeridi({ piyasa, dk }) {
  const bg   = dk ? "#0f172a" : "#f1f5f9";
  const bord = dk ? "#334155" : "#e2e8f0";
  const txt  = dk ? "#e2e8f0" : "#1e293b";
  const mute = "#94a3b8";

  function pct(cur, prev) {
    if (cur == null || prev == null || prev === 0) return null;
    return ((cur - prev) / Math.abs(prev)) * 100;
  }

  const items = [
    { label:"USD/TRY", val:piyasa.usdtry, prev:piyasa.usdtry_prev, fmt:v => "₺" + v.toFixed(2), ters:true },
    { label:"EUR/TRY", val:piyasa.eurtry, prev:piyasa.eurtry_prev, fmt:v => "₺" + v.toFixed(2), ters:true },
    { label:"USD/EUR", val:piyasa.usdeur, prev:piyasa.usdeur_prev, fmt:v => "€" + v.toFixed(4), ters:false },
    { label:"Brent",   val:piyasa.brent,  prev:null,                fmt:v => "$" + v.toFixed(1) + "/bbl", ters:true },
    { label:"Jet",     val:piyasa.jet,    prev:null,                fmt:v => "$" + v.toFixed(1) + "/bbl", ters:true },
  ];

  const rowStyle = {
    padding: "7px 14px 7px 0",
    marginRight: 12,
    borderRight: "1px solid " + bord,
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center",
    flexShrink: 0,
  };

  return (
    <div style={{ background:bg, borderBottom:"1px solid " + bord, overflowX:"auto", whiteSpace:"nowrap" }}>
      <div style={{ display:"inline-flex", alignItems:"center", padding:"0 16px", minWidth:"100%" }}>
        <div style={{ padding:"6px 12px 6px 0", marginRight:12, borderRight:"1px solid " + bord, display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:10, fontWeight:700, color:mute, textTransform:"uppercase", letterSpacing:"0.5px" }}>Canli</span>
        </div>

        {piyasa.loading && (
          <span style={{ color:mute, padding:"8px 0", fontSize:11 }}>Yukleniyor...</span>
        )}
        {piyasa.err && (
          <span style={{ color:"#ef4444", padding:"8px 0", fontSize:11 }}>
            {piyasa.err}
            <button onClick={piyasa.refresh} style={{ marginLeft:8, fontSize:10, border:"1px solid #ef4444", background:"transparent", color:"#ef4444", padding:"1px 6px", borderRadius:4, cursor:"pointer" }}>Yenile</button>
          </span>
        )}

        {!piyasa.loading && !piyasa.err && items.map((item, i) => {
          const d = pct(item.val, item.prev);
          const up = d != null && d > 0;
          const clr = d == null ? mute : item.ters ? (up ? "#ef4444" : "#10b981") : (up ? "#10b981" : "#ef4444");
          return (
            <div key={item.label} style={{ ...rowStyle, borderRight: i < items.length - 1 ? "1px solid " + bord : "none" }}>
              <span style={{ fontSize:10, fontWeight:700, color:mute, letterSpacing:"0.3px", marginBottom:1 }}>{item.label}</span>
              <span style={{ fontSize:13, fontWeight:800, color:txt, letterSpacing:"-0.3px" }}>
                {item.val != null ? item.fmt(item.val) : "—"}
              </span>
              {d != null && (
                <span style={{ fontSize:10, fontWeight:700, color:clr }}>
                  {up ? "▲" : "▼"} {Math.abs(d).toFixed(2)}%
                </span>
              )}
              {d == null && item.prev == null && (
                <span style={{ fontSize:10, color:mute }}>EIA est.</span>
              )}
            </div>
          );
        })}

        {!piyasa.loading && !piyasa.err && (
          <div style={{ marginLeft:"auto", flexShrink:0, display:"flex", alignItems:"center", gap:8, paddingLeft:12, borderLeft:"1px solid " + bord }}>
            <span style={{ fontSize:10, color:mute }}>son: {piyasa.ts}</span>
            <button onClick={piyasa.refresh} style={{ fontSize:10, background:"transparent", border:"1px solid " + bord, color:mute, borderRadius:4, padding:"2px 6px", cursor:"pointer" }}>↺</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── BAR CHART ──────────────────────────────────────────────────────────────*/
function BarChart({ data, metrik, dk }) {
  const max = Math.max(...data.map(d => Math.abs(d.val || 0)), 1);
  const bg   = dk ? "#0f172a" : "#f8fafc";
  const bord = dk ? "#334155" : "#e2e8f0";
  const txt  = dk ? "#e2e8f0" : "#1e293b";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {data.map(d => (
        <div key={d.id} style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:130, fontSize:12, fontWeight: d.id==="thy" ? 700 : 400, color:txt, flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {d.id==="thy" ? "⭐ " : ""}{d.ad}
          </div>
          <div style={{ flex:1, height:24, background:bg, borderRadius:4, overflow:"hidden", border:"1px solid " + bord }}>
            {d.val != null ? (
              <div style={{ height:"100%", width: (Math.abs(d.val) / max * 100) + "%", background: d.val < 0 ? "#ef4444" : d.renk, borderRadius:4, display:"flex", alignItems:"center", paddingLeft:6, transition:"width 0.6s ease" }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#fff", whiteSpace:"nowrap" }}>{METR[metrik].fmt(d.val)}</span>
              </div>
            ) : (
              <span style={{ fontSize:11, color:"#94a3b8", paddingLeft:6, lineHeight:"24px" }}>—</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── ANA UYGULAMA ─────────────────────────────────────────────────────────── */
export default function App() {
  const [tema,  setTema]  = useState("acik");
  const [sekme, setSekme] = useState("haberler");

  // Haberler state
  const [hKat,  setHKat]  = useState("tumu");
  const [hHY,   setHHY]   = useState("Tümü");
  const [hArama,setHArama]= useState("");
  const [hAz,   setHAz]   = useState(false);

  // Gündem state
  const [gKat, setGKat] = useState("turkiye");

  // Finansallar state
  const [fMetrik, setFMetrik] = useState("g");
  const [fYillar, setFYillar] = useState(["2023","2024","2025"]);
  const [fHY,     setFHY]     = useState(FIN.map(h => h.id));
  const [fGor,    setFGor]    = useState("grafik");

  // Chat state
  const [chatAcik, setChatAcik] = useState(false);
  const [msgs, setMsgs] = useState([{r:"a", t:"Ticari Takip Portalı Asistanına hoş geldiniz. Havacılık finansalları, NDC/GDS veya gündem hakkında soru sorabilirsiniz."}]);
  const [chatIn, setChatIn] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const piyasa = usePiyasa();
  const dk = tema === "karanlik";

  useEffect(() => { chatEndRef.current && chatEndRef.current.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  async function sendChat(q) {
    const m = q || chatIn.trim();
    if (!m) return;
    setChatIn("");
    setMsgs(p => [...p, { r:"u", t:m }]);
    setChatLoading(true);
    const ctx = FIN.slice(0,5).map(h => h.ad + " 2025: $" + h.yil["2025"].g + "B gelir").join(", ");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:500,
          system:"Sen THY üst yönetimine sunum yapan kıdemli havacılık analistisin. Kısa, öz Türkçe yanıt ver.\n" + ctx,
          messages:[{ role:"user", content:m }],
        }),
      });
      const d = await res.json();
      setMsgs(p => [...p, { r:"a", t: d.content && d.content[0] ? d.content[0].text : "Yanıt alınamadı." }]);
    } catch (_) {
      setMsgs(p => [...p, { r:"a", t:"Hata oluştu." }]);
    } finally {
      setChatLoading(false);
    }
  }

  // Renk objesi
  const bg   = dk ? "#0f172a" : "#f8fafc";
  const card = dk ? "#1e293b" : "#ffffff";
  const bord = dk ? "#334155" : "#e2e8f0";
  const txt  = dk ? "#e2e8f0" : "#1e293b";
  const sub  = dk ? "#94a3b8" : "#475569";
  const mute = "#94a3b8";
  const tblH = dk ? "#0f172a" : "#f8fafc";

  // Filtreler
  const filtreli = HABERLER.filter(h => {
    if (hKat !== "tumu" && h.k !== hKat) return false;
    if (hHY !== "Tümü" && h.hy !== hHY) return false;
    if (hAz && !h.az) return false;
    if (hArama) {
      const q = hArama.toLowerCase();
      if (!h.b.toLowerCase().includes(q) && !h.o.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const aktifHY = FIN.filter(h => fHY.includes(h.id));
  const tumYillar = ["2022","2023","2024","2025"];
  const grafik_data = aktifHY.map(h => ({
    id:h.id, ad:h.ad, renk:h.renk,
    val: fYillar.length > 0 ? (h.yil[fYillar[fYillar.length-1]] || {})[fMetrik] ?? null : null,
  })).sort((a,b) => (b.val||0) - (a.val||0));

  const gFiltreli = GUNDEM.filter(g => g.kat === gKat);

  const TUMU_HY = ["Tümü", ...new Set(HABERLER.map(h => h.hy))];

  // Yardımcı stiller
  function cardStyle(extra) {
    return Object.assign({ background:card, border:"1px solid " + bord, borderRadius:12, padding:20, marginBottom:14 }, extra || {});
  }
  function tabStyle(active) {
    return { padding:"10px 14px", cursor:"pointer", border:"none", background:"transparent", color: active ? "#6366f1" : mute, fontWeight: active ? 600 : 400, fontSize:13, borderBottom: active ? "2px solid #6366f1" : "2px solid transparent", whiteSpace:"nowrap" };
  }
  function btnStyle(active, color) {
    const c = color || "#6366f1";
    return { padding:"5px 12px", borderRadius:8, border:"1px solid " + (active ? c : bord), background: active ? c : "transparent", color: active ? "#fff" : mute, fontSize:12, fontWeight: active ? 600 : 400, cursor:"pointer" };
  }
  function chipStyle(active) {
    return { padding:"5px 12px", borderRadius:20, border:"1px solid " + (active ? "#6366f1" : bord), background: active ? "#6366f1" : "transparent", color: active ? "#fff" : mute, fontSize:12, cursor:"pointer" };
  }
  function tagStyle(color) {
    return { fontSize:11, fontWeight:600, color:color, background:color+"18", padding:"2px 8px", borderRadius:6, whiteSpace:"nowrap" };
  }
  const thStyle = { padding:"9px 12px", textAlign:"left", fontWeight:600, color:mute, fontSize:11, textTransform:"uppercase", letterSpacing:"0.4px", whiteSpace:"nowrap", borderBottom:"1px solid " + bord, background:tblH };
  const tdStyle = { padding:"10px 12px", borderBottom:"1px solid " + bord + "50", verticalAlign:"middle" };

  return (
    <div style={{ minHeight:"100vh", background:bg, color:txt, fontFamily:"Inter, Segoe UI, sans-serif", fontSize:14 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* HEADER */}
      <header style={{ background:card, borderBottom:"1px solid " + bord, padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:50, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, fontWeight:700, fontSize:15 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✈️</div>
          <span>Ticari Takip Portali</span>
          <span style={{ fontSize:10, fontWeight:700, background:"#6366f1", color:"#fff", padding:"2px 7px", borderRadius:10 }}>BETA</span>
        </div>
        <button style={btnStyle(false)} onClick={() => setTema(dk ? "acik" : "karanlik")}>{dk ? "☀️" : "🌙"}</button>
      </header>

      {/* KUR ŞERİDİ */}
      <KurSeridi piyasa={piyasa} dk={dk}/>

      {/* NAV */}
      <nav style={{ background:card, borderBottom:"1px solid " + bord, padding:"0 20px", display:"flex", gap:4, overflowX:"auto", position:"sticky", top:86, zIndex:99 }}>
        {[
          { id:"haberler",    l:"📰 Haberler" },
          { id:"gundem",      l:"🗞️ Gündelik Gündem" },
          { id:"gostergeler", l:"📈 Göstergeler" },
          { id:"finansallar", l:"📊 Sektörel Finansallar" },
        ].map(t => (
          <button key={t.id} style={tabStyle(sekme === t.id)} onClick={() => setSekme(t.id)}>{t.l}</button>
        ))}
      </nav>

      <main style={{ maxWidth:1300, margin:"0 auto", padding:"20px 16px" }}>

        {/* ═══ HABERLER ══════════════════════════════════════════════════════ */}
        {sekme === "haberler" && (
          <>
            <div style={{ ...cardStyle(), display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", padding:"14px 16px" }}>
              <div style={{ flex:"1 1 180px", position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:mute }}>🔍</span>
                <input
                  style={{ width:"100%", padding:"8px 12px 8px 32px", borderRadius:8, border:"1px solid " + bord, background: dk ? "#0f172a" : "#f8fafc", color:txt, fontSize:13, outline:"none", boxSizing:"border-box" }}
                  placeholder="Haber ara…"
                  value={hArama}
                  onChange={e => setHArama(e.target.value)}
                />
              </div>
              <select style={{ padding:"7px 10px", borderRadius:8, border:"1px solid " + bord, background: dk ? "#0f172a" : "#f8fafc", color:txt, fontSize:13, outline:"none" }} value={hHY} onChange={e => setHHY(e.target.value)}>
                {TUMU_HY.map(h => <option key={h}>{h}</option>)}
              </select>
              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, cursor:"pointer" }}>
                <input type="checkbox" checked={hAz} onChange={e => setHAz(e.target.checked)} style={{ accentColor:"#10b981" }}/> Analizli
              </label>
              {(hArama || hHY !== "Tümü" || hKat !== "tumu" || hAz) && (
                <button style={btnStyle(false)} onClick={() => { setHArama(""); setHHY("Tümü"); setHKat("tumu"); setHAz(false); }}>✕</button>
              )}
            </div>

            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
              {KKAT.map(k => <button key={k.id} style={chipStyle(hKat === k.id)} onClick={() => setHKat(k.id)}>{k.l}</button>)}
            </div>

            {filtreli.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:mute }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                Sonuç bulunamadı
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:12 }}>
                {filtreli.map(h => (
                  <div key={h.id} style={cardStyle()}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <span style={tagStyle(KRENK[h.k] || mute)}>{KKAT.find(k => k.id === h.k) ? KKAT.find(k => k.id === h.k).l : h.k}</span>
                      <span style={{ fontSize:11, color:mute }}>{new Date(h.t).toLocaleDateString("tr-TR", { day:"numeric", month:"long" })}</span>
                    </div>
                    <div style={{ fontWeight:600, fontSize:14, lineHeight:1.45, marginBottom:7 }}>{h.b}</div>
                    <div style={{ fontSize:12, lineHeight:1.6, color:sub, marginBottom:12 }}>{h.o}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:4 }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                        {h.s.map(k => (
                          <a key={k.a} href={k.u} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:"#6366f1", textDecoration:"none", background:"#6366f115", padding:"2px 8px", borderRadius:6 }}>{k.a} ↗</a>
                        ))}
                      </div>
                      {h.az && <span style={tagStyle("#10b981")}>✦ Analizli</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ GÜNDELİK GÜNDEM ═══════════════════════════════════════════════ */}
        {sekme === "gundem" && (
          <>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>
                Gündelik Gündem — {new Date().toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" })}
              </div>
            </div>

            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18 }}>
              {GUNDEM_KKAT.map(k => (
                <button key={k.id} style={{ padding:"8px 16px", borderRadius:20, cursor:"pointer", border:"1px solid " + (gKat===k.id ? k.renk : bord), background: gKat===k.id ? k.renk : "transparent", color: gKat===k.id ? "#fff" : mute, fontSize:13, fontWeight: gKat===k.id ? 700 : 400 }} onClick={() => setGKat(k.id)}>
                  {k.emoji} {k.l}
                </button>
              ))}
            </div>

            {/* Spor sekmesinde Dünya Kupası fikstürü */}
            {gKat === "spor" && (
              <div style={{ ...cardStyle(), marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>🏆 Türkiye — 2026 Dünya Kupası D Grubu</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { t:"14 Haz 07:00", m:"🇦🇺 Avustralya – Türkiye 🇹🇷", s:"BC Place, Vancouver", durum:"YAKLAŞIYOR", r:"#ef4444", url:"https://www.milliyet.com.tr/galeri/milli-mac-ne-zaman-avustralya-turkiye-2026-fifa-dunya-kupasi-maci-ne-zaman-saat-kacta-hangi-kanalda-a-milli-takim-grupta-ilk-7603344" },
                    { t:"20 Haz 06:00", m:"🇹🇷 Türkiye – Paraguay 🇵🇾", s:"Bay Area Stadium, San Francisco", durum:"GRUPTA", r:"#6366f1", url:"https://spor.haber7.com/dunya-kupasi/haber/3634351" },
                    { t:"26 Haz 05:00", m:"🇹🇷 Türkiye – ABD 🇺🇸", s:"Los Angeles Stadium", durum:"GRUPTA", r:"#6366f1", url:"https://spor.haber7.com/dunya-kupasi/haber/3634351" },
                  ].map((mac, i) => (
                    <a key={i} href={mac.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background: dk ? "#0f172a" : "#f8fafc", borderRadius:10, padding:"11px 14px", display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", border:"1px solid " + (i===0 ? mac.r : bord) }}>
                        <span style={tagStyle(mac.r)}>{mac.durum}</span>
                        <span style={{ fontSize:11, color:mute, minWidth:100 }}>{mac.t}</span>
                        <span style={{ fontWeight:700, fontSize:13, color:txt, flex:1 }}>{mac.m}</span>
                        <span style={{ fontSize:11, color:mute }}>{mac.s}</span>
                        <span style={tagStyle("#10b981")}>TRT 1</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {gFiltreli.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:mute }}>Bu kategoride haber yok</div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
                {gFiltreli.map(g => {
                  const kRenk = GUNDEM_KKAT.find(k => k.id === g.kat);
                  const r = kRenk ? kRenk.renk : "#6366f1";
                  return (
                    <a key={g.id} href={g.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ ...cardStyle(), borderLeft: g.onemli ? "3px solid " + r : "none", cursor:"pointer" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={tagStyle(r)}>{kRenk ? kRenk.emoji + " " + kRenk.l : g.kat}</span>
                            {g.onemli && <span style={{ fontSize:9, fontWeight:700, color:"#ef4444", background:"#ef444415", padding:"1px 5px", borderRadius:4 }}>ÖNE ÇIKAN</span>}
                          </div>
                          <span style={{ fontSize:11, color:mute }}>{g.tarih}</span>
                        </div>
                        <div style={{ fontWeight: g.onemli ? 700 : 600, fontSize:13, lineHeight:1.45, marginBottom:6, color:txt }}>{g.b}</div>
                        <div style={{ fontSize:12, lineHeight:1.55, color:sub }}>{g.o}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ═══ GÖSTERGELER ══════════════════════════════════════════════════ */}
        {sekme === "gostergeler" && (
          <>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>IATA Pazar Göstergeleri</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12, marginBottom:20 }}>
              {[
                { l:"IATA Küresel RPK", d:"+9,2%", b:"Mayıs 2026 · yıllık", r:"#10b981", a:"Revenue Passenger Km" },
                { l:"Küresel ASK",      d:"+7,4%", b:"Mayıs 2026 · yıllık", r:"#6366f1", a:"Available Seat Km" },
                { l:"Küresel Doluluk", d:"83,7%",  b:"PLF · Mayıs 2026",    r:"#f59e0b", a:"Passenger Load Factor" },
                { l:"NDC Penetrasyon", d:"~34%",   b:"Tahmin · 2026",       r:"#8b5cf6", a:"Toplam bilet satışlarında" },
              ].map(e => (
                <div key={e.l} style={{ background:card, border:"1px solid " + bord, borderLeft:"3px solid " + e.r, borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ fontSize:26, fontWeight:800, color:e.r, letterSpacing:"-1px", lineHeight:1, marginBottom:4 }}>{e.d}</div>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>{e.l}</div>
                  <div style={{ fontSize:11, color:mute, marginBottom:2 }}>{e.b}</div>
                  <div style={{ fontSize:11, color:mute }}>{e.a}</div>
                </div>
              ))}
            </div>
            <div style={cardStyle()}>
              <div style={{ fontWeight:600, marginBottom:14 }}>Bölgesel RPK Büyümesi — Mayıs 2026</div>
              {[
                {b:"Asya-Pasifik",   v:14.1, r:"#0ea5e9"},
                {b:"Orta Dogu",      v:11.3, r:"#8b5cf6"},
                {b:"Latin Amerika",  v:9.8,  r:"#10b981"},
                {b:"Kuzey Amerika",  v:8.1,  r:"#f59e0b"},
                {b:"Avrupa",         v:7.4,  r:"#6366f1"},
                {b:"Afrika",         v:6.9,  r:"#ef4444"},
              ].map(x => (
                <div key={x.b} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:13 }}>{x.b}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:x.r }}>+{x.v}%</span>
                  </div>
                  <div style={{ height:6, background: dk ? "#0f172a" : "#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width: (x.v/15*100) + "%", background:x.r, borderRadius:4 }}/>
                  </div>
                </div>
              ))}
              <div style={{ fontSize:11, color:mute, marginTop:8 }}>
                Kaynak: <a href="https://www.iata.org/en/publications/economics/air-passenger-monthly-analysis/" target="_blank" rel="noopener noreferrer" style={{ color:"#6366f1" }}>IATA Air Passenger Market Analysis ↗</a>
              </div>
            </div>

            <div style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>Yayınlar ve Raporlar</div>
            {[
              {b:"IATA Aylık Yolcu Analizi — Mayıs 2026",t:"Haziran 2026",o:"Küresel RPK beklentileri aştı. Asya-Pasifik %14,1 ile öncü.",et:"IATA",u:"https://www.iata.org/en/publications/economics/air-passenger-monthly-analysis/"},
              {b:"Amadeus Dağıtım Endeksi Q1 2026",t:"Nisan 2026",o:"GDS NDC rezervasyonları %42 arttı.",et:"Amadeus",u:"https://ir.amadeus.com/en/financial-news-and-events/press-releases"},
              {b:"IATA ONE Order Durum Raporu H1 2026",t:"Haziran 2026",o:"60 havayolu ONE Order sertifikasyonunu tamamladı.",et:"IATA",u:"https://www.iata.org/en/programs/ops-infra/one-order/"},
              {b:"Phocuswright: Havacılık Dağıtım Panosu 2026",t:"Mayıs 2026",o:"Havayollarının doğrudan gelir payı %51'i aştı.",et:"Phocuswright",u:"https://www.phocuswright.com/Research/Travel-Technology"},
            ].map((r,i) => (
              <div key={i} style={{ ...cardStyle(), display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
                <div>
                  <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                    <span style={tagStyle("#6366f1")}>{r.et}</span>
                    <span style={{ fontSize:11, color:mute }}>{r.t}</span>
                  </div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:6 }}>{r.b}</div>
                  <div style={{ fontSize:13, color:sub }}>{r.o}</div>
                </div>
                <a href={r.u} target="_blank" rel="noopener noreferrer" style={{ padding:"7px 14px", background:"#6366f1", color:"#fff", borderRadius:8, fontSize:12, fontWeight:600, textDecoration:"none", flexShrink:0 }}>Aç ↗</a>
              </div>
            ))}
          </>
        )}

        {/* ═══ SEKTÖREL FİNANSALLAR ═══════════════════════════════════════ */}
        {sekme === "finansallar" && (
          <>
            {/* THY Snapshot */}
            <div style={{ ...cardStyle(), borderLeft:"4px solid #C8102E" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:8 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:15, fontWeight:800, color:"#C8102E" }}>⭐ Turkish Airlines — Son Dönem</span>
                    <span style={tagStyle("#C8102E")}>THYAO · BIST</span>
                  </div>
                  <div style={{ fontSize:12, color:mute }}>Istanbul merkezli, 130+ ülkeye uçuş · Q1 2026 sonuçları açıklandı</div>
                </div>
                <a href={THY.ir} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:"#6366f1", textDecoration:"none" }}>IR Sayfası ↗</a>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10 }}>
                {[
                  {l:"2025 Gelir",    v:"$" + THY.yil["2025"].g + "B",    r:"#6366f1"},
                  {l:"2025 Net Kar",  v:"$" + THY.yil["2025"].nk + "B",   r:"#10b981"},
                  {l:"Q1 2026 Gelir", v:"$5,9B",  r:"#0ea5e9", yeni:true},
                  {l:"Q1 2026 Net",   v:"$226M",  r:"#10b981", yeni:true},
                  {l:"Q1 2026 Yolcu", v:"21,3M",  r:"#ef4444", yeni:true},
                  {l:"2025 Doluluk",  v:THY.yil["2025"].lf + "%", r:"#14b8a6"},
                  {l:"2025 Filo",     v:THY.yil["2025"].f + " ucak", r:"#f97316"},
                  {l:"2025 Isletme",  v:THY.yil["2025"].im + "%",   r:"#f59e0b"},
                ].map(item => (
                  <div key={item.l} style={{ background: dk ? "#0f172a" : "#f8fafc", borderRadius:8, padding:"10px 12px", border: item.yeni ? "1px solid " + item.r + "40" : "none" }}>
                    <div style={{ fontSize:10, color:mute, marginBottom:3, display:"flex", alignItems:"center", gap:4 }}>
                      {item.yeni && <span style={{ fontSize:9, fontWeight:700, color:item.r, background:item.r+"18", padding:"1px 5px", borderRadius:4 }}>YENİ</span>}
                      {item.l}
                    </div>
                    <div style={{ fontSize:17, fontWeight:800, color:item.r, letterSpacing:"-0.5px" }}>{item.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, color:mute, marginTop:10 }}>
                Q1 2026: <a href="https://www.rustourismnews.com/2026/05/06/turkish-airlines-returns-to-strong-profit-despite-rising-operating-costs/" target="_blank" rel="noopener noreferrer" style={{ color:"#6366f1" }}>rustourismnews.com ↗</a>
              </div>
            </div>

            {/* Kontroller */}
            <div style={{ ...cardStyle(), padding:"14px 16px" }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:14, alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase" }}>Görünüm</div>
                  <div style={{ display:"flex", gap:5 }}>
                    <button style={btnStyle(fGor==="grafik")} onClick={() => setFGor("grafik")}>📊 Grafik</button>
                    <button style={btnStyle(fGor==="tablo")} onClick={() => setFGor("tablo")}>📋 Tablo</button>
                    <button style={btnStyle(fGor==="ceyrek")} onClick={() => setFGor("ceyrek")}>📅 Çeyreklik</button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase" }}>Metrik</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {Object.entries(METR).map(([k,v]) => (
                      <button key={k} style={btnStyle(fMetrik===k, v.renk)} onClick={() => setFMetrik(k)}>{v.l.split(" (")[0]}</button>
                    ))}
                  </div>
                </div>
                {fGor !== "ceyrek" && (
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase" }}>Dönem</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {tumYillar.map(y => (
                        <button key={y} style={btnStyle(fYillar.includes(y))} onClick={() => setFYillar(p => p.includes(y) ? p.filter(x => x!==y) : [...p, y].sort())}>
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase" }}>Havayolları</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {FIN.map(h => (
                      <button key={h.id} style={btnStyle(fHY.includes(h.id), h.renk)} onClick={() => setFHY(p => p.includes(h.id) ? p.filter(x => x!==h.id) : [...p, h.id])}>
                        {h.id==="thy" ? "⭐ " : ""}{h.ad}
                      </button>
                    ))}
                    <button style={btnStyle(false)} onClick={() => setFHY(FIN.map(h => h.id))}>Tümü</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grafik */}
            {fGor === "grafik" && (
              <div style={cardStyle()}>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{METR[fMetrik].l}</div>
                  <div style={{ fontSize:12, color:mute }}>Dönem: {fYillar[fYillar.length-1] || "—"}</div>
                </div>
                <BarChart data={grafik_data} metrik={fMetrik} dk={dk}/>

                {fYillar.length > 1 && (
                  <div style={{ marginTop:24, paddingTop:20, borderTop:"1px solid " + bord }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:12, color:mute }}>TREND</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
                      {aktifHY.slice(0,6).map(h => {
                        const tVals = fYillar.map(y => (h.yil[y] || {})[fMetrik] ?? null);
                        const filtered = tVals.filter(v => v != null);
                        const son = filtered[filtered.length-1];
                        const ilk = filtered[0];
                        const deg = (son != null && ilk != null && ilk !== 0) ? ((son-ilk)/Math.abs(ilk)*100) : null;
                        return (
                          <div key={h.id} style={{ background: dk ? "#0f172a" : "#f8fafc", borderRadius:8, padding:"12px 14px" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                              <span style={{ fontSize:12, fontWeight: h.id==="thy" ? 700 : 400 }}>{h.id==="thy" ? "⭐ " : ""}{h.ad}</span>
                              {deg != null && (
                                <span style={{ fontSize:11, fontWeight:600, color: deg>=0 ? "#10b981" : "#ef4444" }}>
                                  {deg>=0 ? "+" : ""}{deg.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <Sparkline vals={tVals} color={h.renk}/>
                            <div style={{ fontSize:11, color:mute, marginTop:4 }}>{METR[fMetrik].fmt(son)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tablo */}
            {fGor === "tablo" && (
              <div style={cardStyle()}>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>{METR[fMetrik].l}</div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Havayolu</th>
                        {fYillar.map(y => <th key={y} style={{ ...thStyle, textAlign:"right" }}>{y}</th>)}
                        <th style={{ ...thStyle, textAlign:"right" }}>YoY Son</th>
                        <th style={{ ...thStyle, textAlign:"center" }}>Trend</th>
                        <th style={thStyle}>IR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aktifHY.map((h,i) => {
                        const vals = fYillar.map(y => (h.yil[y] || {})[fMetrik] ?? null);
                        const filtered = vals.filter(v => v != null);
                        const son = filtered[filtered.length-1];
                        const onceki = filtered[filtered.length-2];
                        const yoy = (son != null && onceki != null && onceki !== 0) ? ((son-onceki)/Math.abs(onceki)*100) : null;
                        const tVals = tumYillar.map(y => (h.yil[y] || {})[fMetrik] ?? null);
                        return (
                          <tr key={h.id} style={{ background: i%2===0 ? "transparent" : (dk ? "#ffffff06" : "#f8fafc") }}>
                            <td style={tdStyle}>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <div style={{ width:3, height:32, borderRadius:2, background:h.renk, flexShrink:0 }}/>
                                <div>
                                  <div style={{ fontWeight: h.id==="thy" ? 800 : 500 }}>{h.id==="thy" ? "⭐ " : ""}{h.ad}</div>
                                  <div style={{ fontSize:10, color:mute }}>{h.kod} · {h.siklik}</div>
                                </div>
                              </div>
                            </td>
                            {vals.map((v,vi) => (
                              <td key={vi} style={{ ...tdStyle, textAlign:"right", color: v!=null ? txt : mute }}>{METR[fMetrik].fmt(v)}</td>
                            ))}
                            <td style={{ ...tdStyle, textAlign:"right", fontWeight:600, color: yoy==null ? mute : (yoy>0 ? "#10b981" : "#ef4444") }}>
                              {yoy==null ? "—" : (yoy>0?"+":"") + yoy.toFixed(1) + "%"}
                            </td>
                            <td style={{ ...tdStyle, textAlign:"center" }}>
                              <Sparkline vals={tVals} color={h.renk}/>
                            </td>
                            <td style={tdStyle}>
                              <a href={h.ir} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:"#6366f1", textDecoration:"none" }}>IR ↗</a>
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
              <div style={cardStyle()}>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>Çeyreklik ve Yarıyıl Sonuçlar</div>
                <div style={{ fontSize:12, color:mute, marginBottom:14 }}>Rapor yayınlayan havayolları</div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Havayolu</th>
                        <th style={thStyle}>Dönem</th>
                        <th style={{ ...thStyle, textAlign:"right" }}>Gelir</th>
                        <th style={{ ...thStyle, textAlign:"right" }}>Net Kar</th>
                        <th style={{ ...thStyle, textAlign:"right" }}>Yolcu</th>
                        <th style={{ ...thStyle, textAlign:"right" }}>Doluluk</th>
                        <th style={thStyle}>Kaynak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aktifHY.filter(h => h.q && h.q.length > 0).flatMap((h,hi) =>
                        h.q.map((q,qi) => {
                          const isNew = q.d.includes("2026");
                          return (
                            <tr key={h.id + q.d} style={{ background: (hi+qi)%2===0 ? "transparent" : (dk?"#ffffff06":"#f8fafc") }}>
                              {qi === 0 ? (
                                <td style={{ ...tdStyle, fontWeight:600 }} rowSpan={h.q.length}>
                                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                    <div style={{ width:3, height:32, borderRadius:2, background:h.renk }}/>
                                    <span>{h.id==="thy" ? "⭐ " : ""}{h.ad}</span>
                                  </div>
                                </td>
                              ) : null}
                              <td style={tdStyle}>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  <span style={tagStyle(isNew ? h.renk : mute)}>{q.d}</span>
                                  {isNew && <span style={{ fontSize:9, fontWeight:700, color:h.renk, background:h.renk+"18", padding:"1px 5px", borderRadius:4 }}>YENİ</span>}
                                </div>
                              </td>
                              <td style={{ ...tdStyle, textAlign:"right" }}>{q.g!=null ? "$"+q.g.toFixed(1)+"B" : "—"}</td>
                              <td style={{ ...tdStyle, textAlign:"right", fontWeight:600, color: q.nk>=0 ? "#10b981" : "#ef4444" }}>{q.nk!=null ? (q.nk>=0?"+":"") + "$"+Math.abs(q.nk).toFixed(2)+"B" : "—"}</td>
                              <td style={{ ...tdStyle, textAlign:"right" }}>{q.p!=null ? q.p.toFixed(1)+"M" : "—"}</td>
                              <td style={{ ...tdStyle, textAlign:"right" }}>{q.lf!=null ? q.lf.toFixed(1)+"%" : "—"}</td>
                              <td style={tdStyle}><a href={q.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:"#6366f1", textDecoration:"none" }}>↗</a></td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize:11, color:mute, marginTop:8 }}>Emirates, Qatar ve Singapore Airlines çeyreklik rapor yayınlamaz.</div>
              </div>
            )}

            {/* Fark Analizi */}
            <div style={cardStyle()}>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>THY Rakip Fark Analizi — 2025</div>
              <div style={{ fontSize:12, color:mute, marginBottom:12 }}>↑ THY önde · ↓ Rakip önde · pp = yüzde puan</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Rakip</th>
                      <th style={{ ...thStyle, textAlign:"right" }}>Gelir</th>
                      <th style={{ ...thStyle, textAlign:"right" }}>Net Kar</th>
                      <th style={{ ...thStyle, textAlign:"right" }}>Isletme Marj</th>
                      <th style={{ ...thStyle, textAlign:"right" }}>Yolcu</th>
                      <th style={{ ...thStyle, textAlign:"right" }}>Doluluk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FIN.filter(h => h.id !== "thy").map((h,i) => {
                      const thy = THY.yil["2025"];
                      const rak = h.yil["2025"];
                      function df(key, isB) {
                        if (!thy || !rak || thy[key]==null || rak[key]==null) return "—";
                        const d = thy[key] - rak[key];
                        const c = d >= 0 ? "#10b981" : "#ef4444";
                        const sign = d >= 0 ? "↑" : "↓";
                        const val = isB ? ("$"+Math.abs(d).toFixed(1)+"B") : (Math.abs(d).toFixed(1)+"pp");
                        return <span style={{ color:c, fontWeight:600 }}>{sign} {val}</span>;
                      }
                      return (
                        <tr key={h.id} style={{ background: i%2===0 ? "transparent" : (dk?"#ffffff06":"#f8fafc") }}>
                          <td style={tdStyle}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <div style={{ width:10, height:10, borderRadius:"50%", background:h.renk }}/>
                              {h.ad}
                            </div>
                          </td>
                          <td style={{ ...tdStyle, textAlign:"right" }}>{df("g", true)}</td>
                          <td style={{ ...tdStyle, textAlign:"right" }}>{df("nk", true)}</td>
                          <td style={{ ...tdStyle, textAlign:"right" }}>{df("im", false)}</td>
                          <td style={{ ...tdStyle, textAlign:"right" }}>{df("p", true)}</td>
                          <td style={{ ...tdStyle, textAlign:"right" }}>{df("lf", false)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* CHAT BUTONU */}
      <button
        onClick={() => setChatAcik(p => !p)}
        style={{ position:"fixed", bottom:24, right:24, width:50, height:50, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", border:"none", cursor:"pointer", fontSize:20, boxShadow:"0 4px 20px rgba(99,102,241,.4)", zIndex:200, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}
      >
        {chatAcik ? "✕" : "💬"}
      </button>

      {chatAcik && (
        <div style={{ position:"fixed", bottom:84, right:24, width:340, maxHeight:460, background:card, border:"1px solid " + bord, borderRadius:16, display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,.15)", zIndex:200, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid " + bord, display:"flex", justifyContent:"space-between", alignItems:"center", fontWeight:600, fontSize:13 }}>
            <span>✈️ Analiz Asistanı</span>
            <button style={{ background:"none", border:"none", cursor:"pointer", color:mute, fontSize:16 }} onClick={() => setChatAcik(false)}>✕</button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ padding:"8px 11px", borderRadius: m.r==="u" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: m.r==="u" ? "#6366f1" : (dk ? "#0f172a" : "#f1f5f9"), color: m.r==="u" ? "#fff" : txt, fontSize:13, lineHeight:1.55, maxWidth:"90%", alignSelf: m.r==="u" ? "flex-end" : "flex-start" }}>
                {m.t}
              </div>
            ))}
            {chatLoading && (
              <div style={{ padding:"8px 11px", borderRadius:"12px 12px 12px 4px", background: dk ? "#0f172a" : "#f1f5f9", color:mute, fontSize:13 }}>Yanıt hazırlanıyor…</div>
            )}
            <div ref={chatEndRef}/>
          </div>
          <div style={{ padding:"6px 10px", borderTop:"1px solid " + bord + "50", display:"flex", flexWrap:"wrap", gap:4 }}>
            {["THY Q1 2026 değerlendirmesi","Rakiplere göre marj analizi","NDC dağıtımı durumu"].map(q => (
              <button key={q} style={{ padding:"3px 8px", borderRadius:10, border:"1px solid " + bord, background:"transparent", color:"#6366f1", fontSize:11, cursor:"pointer" }} onClick={() => sendChat(q)}>{q}</button>
            ))}
          </div>
          <div style={{ padding:"10px 12px", borderTop:"1px solid " + bord, display:"flex", gap:8 }}>
            <input
              style={{ flex:1, padding:"7px 11px", borderRadius:8, border:"1px solid " + bord, background: dk ? "#0f172a" : "#f8fafc", color:txt, fontSize:13, outline:"none" }}
              placeholder="Soru sor…"
              value={chatIn}
              onChange={e => setChatIn(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
            />
            <button style={{ padding:"7px 13px", borderRadius:8, border:"none", background:"#6366f1", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }} onClick={() => sendChat()}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
}