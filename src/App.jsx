import { useState, useEffect, useRef, useCallback } from "react";

// ─── API ──────────────────────────────────────────────────────────────────────
// fawazahmed0/exchange-api → jsDelivr CDN üzerinden
// Key yok · CORS açık · Günlük güncellenir · Tarihsel veri destekler
// Bugün: https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json
// Geçmiş: https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@2026-06-10/v1/currencies/usd.json
const CDN_BASE = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api";
const ENERJI = { brent: 72.4, jet: 82.1 };

// ─── FİNANSAL VERİLER ────────────────────────────────────────────────────────
const FIN = {
  havayollari: [
    {
      id:"thy", ad:"Turkish Airlines", kod:"THYAO", bors:"BIST", renk:"#C8102E",
      mali:"Ocak–Aralık", siklik:"Çeyreklik", ir:"https://investor.turkishairlines.com",
      yil:{
        "2021":{g:10.8,ik:0.8, nk:0.5, p:56.0, lf:70.1,im:7.4, nm:4.6, f:374},
        "2022":{g:16.8,ik:2.6, nk:2.4, p:71.4, lf:79.8,im:15.5,nm:14.3,f:411},
        "2023":{g:20.5,ik:3.6, nk:3.0, p:83.4, lf:82.3,im:17.6,nm:14.6,f:444},
        "2024":{g:22.7,ik:4.18,nk:3.42,p:90.2, lf:84.1,im:18.4,nm:15.1,f:492},
        "2025":{g:24.1,ik:3.65,nk:2.90,p:97.2, lf:84.8,im:15.1,nm:12.0,f:516},
        "Q1 2026":{g:5.9,ik:0.31,nk:0.23,p:21.3,lf:83.8,im:5.3,nm:3.9,f:530},
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
      mali:"Nisan–Mart", siklik:"Yıllık/Yarıyıl", ir:"https://www.emirates.com/media-centre/",
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
      mali:"Ocak–Aralık", siklik:"Çeyreklik", ir:"https://investor-relations.lufthansagroup.com",
      not:"EUR/USD≈1.08",
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
      mali:"Ocak–Aralık", siklik:"Çeyreklik", ir:"https://www.airfranceklm.com/en/investors",
      not:"EUR/USD≈1.08",
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
      mali:"Ocak–Aralık", siklik:"Çeyreklik", ir:"https://www.iairgroup.com/investors",
      not:"EUR/USD≈1.08",
      yil:{
        "2022":{g:23.0,ik:1.5, nk:0.9, p:98.4, lf:82.0,im:6.5, nm:3.9, f:530},
        "2023":{g:29.3,ik:3.5, nk:2.7, p:116.0,lf:86.5,im:11.9,nm:9.2, f:540},
        "2024":{g:32.1,ik:4.05,nk:3.24,p:121.8,lf:86.8,im:12.6,nm:10.1,f:560},
        "2025":{g:34.5,ik:4.28,nk:3.56,p:127.5,lf:87.1,im:12.4,nm:10.3,f:571},
      },
      q:[
        {d:"Q1 2026",g:7.8, nk:0.61,p:30.2,lf:84.8,url:"https://www.iairgroup.com/investors"},
        {d:"Q4 2025",g:8.1, nk:0.74,p:31.5,lf:85.2,url:"https://www.iairgroup.com/investors"},
        {d:"Q3 2025",g:10.2,nk:1.42,p:36.1,lf:88.1,url:"https://www.iairgroup.com/investors"},
      ],
    },
    {
      id:"qatar", ad:"Qatar Airways", kod:"QR", bors:"Halka açık değil", renk:"#5C0632",
      mali:"Nisan–Mart", siklik:"Yıllık", ir:"https://www.qatarairways.com/en/pressreleases.html",
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
      mali:"Ocak–Aralık", siklik:"Çeyreklik", ir:"https://ir.delta.com",
      yil:{
        "2022":{g:50.6,ik:3.7,nk:1.3, p:192.0,lf:83.0,im:7.3, nm:2.6, f:980},
        "2023":{g:58.0,ik:5.6,nk:4.6, p:200.0,lf:84.8,im:9.7, nm:7.9, f:1002},
        "2024":{g:61.6,ik:5.8,nk:3.5, p:204.0,lf:85.2,im:9.4, nm:5.7, f:1010},
        "2025":{g:62.9,ik:5.5,nk:3.2, p:205.0,lf:85.1,im:8.7, nm:5.1, f:1025},
      },
      q:[
        {d:"Q1 2026",g:14.0,nk:0.24,p:50.1,lf:83.2,url:"https://ir.delta.com/news-releases/news-release-details/delta-air-lines-announces-march-quarter-2026-financial-results"},
        {d:"Q4 2025",g:15.6,nk:0.82,p:51.2,lf:84.1,url:"https://ir.delta.com"},
        {d:"Q3 2025",g:16.7,nk:1.28,p:54.8,lf:86.4,url:"https://ir.delta.com"},
      ],
    },
    {
      id:"united", ad:"United Airlines", kod:"UAL", bors:"NASDAQ", renk:"#0066CC",
      mali:"Ocak–Aralık", siklik:"Çeyreklik", ir:"https://ir.united.com",
      yil:{
        "2022":{g:44.9,ik:3.4,nk:0.7, p:165.0,lf:82.8,im:7.6, nm:1.6, f:921},
        "2023":{g:53.7,ik:5.2,nk:2.6, p:173.0,lf:83.7,im:9.7, nm:4.8, f:941},
        "2024":{g:57.1,ik:4.8,nk:3.2, p:177.0,lf:84.4,im:8.4, nm:5.6, f:962},
        "2025":{g:59.4,ik:5.1,nk:3.8, p:180.0,lf:84.8,im:8.6, nm:6.4, f:978},
      },
      q:[
        {d:"Q1 2026",g:13.2,nk:0.33,p:42.8,lf:82.9,url:"https://ir.united.com/news-releases"},
        {d:"Q4 2025",g:14.7,nk:0.89,p:44.1,lf:83.6,url:"https://ir.united.com"},
        {d:"Q3 2025",g:16.8,nk:1.51,p:50.2,lf:86.1,url:"https://ir.united.com"},
      ],
    },
    {
      id:"singapore", ad:"Singapore Airlines", kod:"SIA", bors:"SGX", renk:"#004B87",
      mali:"Nisan–Mart", siklik:"Yarıyıl", ir:"https://www.singaporeair.com/en_UK/us/about-us/investor-relations/",
      not:"SGD/USD≈0.74",
      yil:{
        "2022":{g:10.5,ik:0.8, nk:0.9, p:22.4,lf:68.2,im:7.6, nm:8.6, f:180},
        "2023":{g:15.7,ik:2.1, nk:2.2, p:38.7,lf:85.1,im:13.4,nm:14.0,f:193},
        "2024":{g:17.0,ik:2.4, nk:2.0, p:41.5,lf:86.0,im:14.1,nm:11.8,f:201},
        "2025":{g:17.8,ik:2.3, nk:1.9, p:43.2,lf:86.4,im:12.9,nm:10.7,f:208},
      },
    },
  ],
};

const METR = {
  g:  {l:"Toplam Gelir (USD B)", fmt:v=>v!=null?`$${v.toFixed(1)}B`:"—", renk:"#6366f1"},
  nk: {l:"Net Kâr (USD B)",     fmt:v=>v!=null?`${v>=0?"":"−"}$${Math.abs(v).toFixed(2)}B`:"—", renk:"#10b981"},
  ik: {l:"EBIT (USD B)",        fmt:v=>v!=null?`$${v.toFixed(2)}B`:"—", renk:"#0ea5e9"},
  im: {l:"İşl. Marjı %",       fmt:v=>v!=null?`${v.toFixed(1)}%`:"—",  renk:"#f59e0b"},
  nm: {l:"Net Marj %",         fmt:v=>v!=null?`${v.toFixed(1)}%`:"—",  renk:"#8b5cf6"},
  p:  {l:"Yolcu (M)",          fmt:v=>v!=null?`${v.toFixed(1)}M`:"—",  renk:"#ef4444"},
  lf: {l:"Doluluk PLF %",      fmt:v=>v!=null?`${v.toFixed(1)}%`:"—",  renk:"#14b8a6"},
  f:  {l:"Filo (uçak)",        fmt:v=>v!=null?`${v}`:"—",              renk:"#f97316"},
};

const KKATEGORILER = [
  {id:"tumu",l:"Tümü"},{id:"gds_ndc",l:"GDS & NDC"},
  {id:"one_order",l:"ONE Order"},{id:"teknoloji",l:"Teknoloji"},
  {id:"yeni_hat",l:"Yeni Hat"},{id:"ortaklik",l:"Ortaklık"},
  {id:"finansal",l:"Finansal"},{id:"duzenleyici",l:"Düzenleyici"},
];
const KRENK = {gds_ndc:"#6366f1",one_order:"#0ea5e9",teknoloji:"#06b6d4",yeni_hat:"#10b981",ortaklik:"#8b5cf6",finansal:"#ef4444",duzenleyici:"#f59e0b",diger:"#94a3b8"};

const HABERLER = [
  {id:1, t:"2026-06-10",b:"Amadeus NDC rezervasyonları 500 milyon sınırını aştı",o:"Amadeus, NDC tabanlı rezervasyon hacminin 500 milyon bandını geçtiğini açıkladı. Dağıtım gelirleri %18 artarken şirket 2027 sonuna kadar NDC oranını %50'ye taşımayı hedefliyor.",k:"gds_ndc",hy:"Amadeus",s:[{a:"Amadeus IR",u:"https://ir.amadeus.com/en/financial-news-and-events/press-releases"},{a:"PhocusWire",u:"https://www.phocuswire.com/amadeus-ndc-500-million-bookings"}],az:true},
  {id:2, t:"2026-06-09",b:"Turkish Airlines Sabre acentelerine NDC teşvik paketi başlattı",o:"THY, Sabre GDS üzerinden yapılan NDC rezervasyonlarına ek komisyon, erken koltuk seçimi ve öncelikli check-in hakkı tanıdı. Program Türkiye ve 14 Avrupa pazarında geçerli.",k:"gds_ndc",hy:"Turkish Airlines",s:[{a:"THY Newsroom",u:"https://www.turkishairlines.com/en-int/press-room/news/"},{a:"Travel Weekly",u:"https://www.travelweekly.com/Travel-News/Airline-News/Turkish-Airlines-Sabre-NDC"}],az:true},
  {id:3, t:"2026-06-09",b:"IATA ONE Order sertifikasyonu 60 havayolunu geçti",o:"IATA, ONE Order sertifikasyonunu tamamlayan havayolu sayısının 60'a ulaştığını duyurdu. Wizz Air, Avrupa'da ONE Order'a geçen ilk LCC olurken Finnair ve TAP da süreci tamamladı.",k:"one_order",hy:"Tümü",s:[{a:"IATA ONE Order",u:"https://www.iata.org/en/programs/ops-infra/one-order/"},{a:"PhocusWire",u:"https://www.phocuswire.com/iata-one-order-60-airlines"}],az:true},
  {id:4, t:"2026-06-08",b:"Lufthansa Group 2025'te €39,6 milyar rekor gelir açıkladı",o:"Lufthansa Group'un düzeltilmiş EBIT'i %19 büyüyerek 2 milyar Euro'ya ulaştı. 135 milyon yolcu taşındı. Çekirdek Lufthansa markasının marjı ise ancak %0,9 ile başa baş kapandı.",k:"finansal",hy:"Lufthansa",s:[{a:"Lufthansa AR 2025",u:"https://report.lufthansagroup.com/2025/annual-report/en/"},{a:"Lufthansa Newsroom",u:"https://newsroom.lufthansagroup.com/en/lufthansa-group-increases-operating-profit-by-20-percent-and-achieves-highest-revenue-in-company-history/"}],az:true},
  {id:5, t:"2026-06-08",b:"Sabre NDC içerik platformunu yeniden yapılandırdı",o:"Sabre, SynXis Air platformunu tüm GDS müşterilerine açtı. Yeni mimari havayollarının dinamik fiyat tekliflerini milisaniye içinde dağıtmasına imkân tanıyor.",k:"gds_ndc",hy:"Sabre",s:[{a:"Sabre Newsroom",u:"https://www.sabre.com/insights/news/"},{a:"The Beat",u:"https://thebeat.travel"}],az:false},
  {id:6, t:"2026-06-07",b:"IATA Mayıs 2026: Küresel RPK büyümesi %9,2 ile beklentileri aştı",o:"IATA verilerine göre Mayıs 2026 küresel yolcu talebi yıllık %9,2 arttı. Asya-Pasifik %14,1 ile en hızlı büyüyen bölge; küresel doluluk %83,7 ile 5 yılın zirvesinde.",k:"finansal",hy:"Tümü",s:[{a:"IATA Air Passenger Market",u:"https://www.iata.org/en/publications/economics/air-passenger-monthly-analysis/"}],az:true},
  {id:7, t:"2026-06-07",b:"Emirates–Amadeus çok yıllı NDC dağıtım anlaşması yenilendi",o:"Emirates, Amadeus platformu üzerinden tam NDC içerik paritesi ve dinamik paket fiyatlaması için yeni çok yıllı anlaşma imzaladı. Premium sınıf teklifleri de anlaşmaya dahil.",k:"ortaklik",hy:"Emirates",s:[{a:"Emirates Newsroom",u:"https://www.emirates.com/media-centre/emirates-amadeus-ndc-distribution-agreement/"},{a:"Amadeus Newsroom",u:"https://ir.amadeus.com/en/financial-news-and-events/press-releases"}],az:true},
  {id:8, t:"2026-06-06",b:"Travelport AI arama motorunu tüm GDS müşterilerine açtı",o:"Travelport'un Smartpoint Cloud'a entegre AI destekli motoru işlem süresini %60 kısalttı. Motor çok değişkenli tarife karşılaştırmasını gerçek zamanlı yapıyor.",k:"teknoloji",hy:"Travelport",s:[{a:"Travelport Blog",u:"https://www.travelport.com/blog"},{a:"Skift",u:"https://skift.com/2026/06/06/travelport-ai-search-engine/"}],az:false},
  {id:9, t:"2026-06-06",b:"Turkish Airlines İstanbul–Bogotá direkt seferini başlattı",o:"THY, İstanbul'dan Bogotá'ya haftada 4 sefer olarak başlattığı direkt uçuşla Latin Amerika ağını genişletti. Türkiye ile Kolombiya arasındaki ilk direkt bağlantı.",k:"yeni_hat",hy:"Turkish Airlines",s:[{a:"THY Newsroom",u:"https://www.turkishairlines.com/en-int/press-room/news/"},{a:"Simple Flying",u:"https://simpleflying.com/turkish-airlines-istanbul-bogota-launch/"}],az:false},
  {id:10,t:"2026-06-05",b:"AB Havacılık Otoritesi GDS şeffaflık yönetmeliği taslağını yayımladı",o:"EASA, havayolu–GDS dağıtım anlaşmalarında içerik eşitliği ve ücret şeffaflığını zorunlu kılacak taslak yönetmeliği yayımladı. 2027 yürürlük tarihi hedefleniyor.",k:"duzenleyici",hy:"Tümü",s:[{a:"EASA Transport",u:"https://transport.ec.europa.eu/transport-modes/air_en"},{a:"PhocusWire",u:"https://www.phocuswire.com/eu-gds-transparency-regulation-2027"}],az:true},
  {id:11,t:"2026-06-05",b:"Air France-KLM 2025'te 102,8M yolcu ile tüm zamanların rekorunu kırdı",o:"Grup 2025 yılında €33 milyar gelir ve €2 milyar işletme kârı açıkladı. Ancak Transavia %15 kapasite büyümesine karşın zarar etti; KLM maliyetleri artmaya devam ediyor.",k:"finansal",hy:"Air France-KLM",s:[{a:"AF-KLM FY2025 PR",u:"https://www.airfranceklm.com/sites/default/files/2026-02/afklm_full_year_2025_press_release_english.pdf"},{a:"The Engine Cowl",u:"https://www.enginecowl.com/air-france-klm-q4-2025/"}],az:true},
  {id:12,t:"2026-06-04",b:"Air France-KLM Sabre NDC tam entegrasyonunu tamamladı",o:"AF-KLM, Sabre GDS üzerinden NDC içeriğinin tam içerik paritesine ulaştığını açıkladı. 430.000'den fazla Sabre acentesi tüm tarife ve ürün seçeneklerine erişebilecek.",k:"gds_ndc",hy:"Air France-KLM",s:[{a:"AF-KLM Press",u:"https://www.airfranceklm.com/en/press-release"},{a:"Sabre News",u:"https://www.sabre.com/insights/news/"}],az:true},
  {id:13,t:"2026-06-04",b:"Lufthansa Frankfurt–Kuala Lumpur direkt seferini yeniden başlatıyor",o:"Lufthansa, pandemi döneminde durdurulan Frankfurt–KUL hattını Ekim 2026'dan haftada 5 sefer olarak yeniden açıyor. A350-900 ile işletilecek.",k:"yeni_hat",hy:"Lufthansa",s:[{a:"Lufthansa PR",u:"https://newsroom.lufthansagroup.com/en/lufthansa-resumes-frankfurt-kuala-lumpur/"},{a:"Simple Flying",u:"https://simpleflying.com/lufthansa-frankfurt-kuala-lumpur-restart/"}],az:false},
  {id:14,t:"2026-06-03",b:"Amadeus ve IATA ONE Order entegrasyonunu tamamladı",o:"Amadeus, ONE Order standardının tüm GDS müşterileri için kullanıma açıldığını duyurdu. Bilet, otel, transfer ve sigorta tek sipariş kaydında birleştirilebiliyor.",k:"one_order",hy:"Amadeus",s:[{a:"Amadeus ONE Order",u:"https://www.amadeus.com/en/portfolio/distribution/one-order"},{a:"IATA ONE Order",u:"https://www.iata.org/en/programs/ops-infra/one-order/"}],az:true},
  {id:15,t:"2026-06-03",b:"Singapore Airlines AI fiyatlama motorunu 12 pazara yaydı",o:"Singapore Airlines, bireysel yolcu profiline göre dinamik teklif sunan AI fiyatlama motorunu 12 pazarda devreye aldı. Dönüşüm oranında %31 artış görüldü.",k:"teknoloji",hy:"Singapore Airlines",s:[{a:"SIA Media Hub",u:"https://www.singaporeair.com/en_UK/us/about-us/press-room/news-releases/"},{a:"Skift",u:"https://skift.com/2026/06/03/singapore-airlines-ai-pricing/"}],az:true},
  {id:16,t:"2026-06-02",b:"Delta Air Lines Q1 2026: Gelir beklentilerin altında kaldı",o:"Delta, Q1 2026'da 14 milyar dolar gelir açıkladı. Tarife baskısı net kârı yıllık %41 düşürdü. Şirket yıllık yönlendirmeyi korudu.",k:"finansal",hy:"Delta",s:[{a:"Delta IR Q1 2026",u:"https://ir.delta.com/news-releases/news-release-details/delta-air-lines-announces-march-quarter-2026-financial-results"},{a:"Aviation Week",u:"https://aviationweek.com/air-transport/delta-q1-2026-results"}],az:true},
  {id:17,t:"2026-06-01",b:"IAG Q1 2026: Güçlü transatlantik talep kârlılığı destekledi",o:"IAG, Q1 2026'da €7,8 milyar gelir ve €610 milyon net kâr açıkladı. İspanya–ABD transatlantik hatlarında doluluk %88'i aştı.",k:"finansal",hy:"IAG",s:[{a:"IAG IR Q1 2026",u:"https://www.iairgroup.com/investors/results-and-presentations"},{a:"The Engine Cowl",u:"https://www.enginecowl.com/iag-q1-2026/"}],az:true},
  {id:18,t:"2026-05-31",b:"IATA NDC standardının versiyon 21.3 güncellemesi yayımlandı",o:"IATA, NDC 21.3 sürümünü yayımladı. Güncelleme grup rezervasyonları ve interline teklifler için yeni şema tanımları içeriyor. Havayollarına 18 aylık geçiş süresi tanındı.",k:"one_order",hy:"Tümü",s:[{a:"IATA NDC 21.3",u:"https://www.iata.org/en/programs/airline-distribution/ndc/ndc-news/"},{a:"PhocusWire",u:"https://www.phocuswire.com/iata-ndc-21-3-release"}],az:false},
  {id:19,t:"2026-05-30",b:"AB Komisyonu havacılık dijital tek pazar direktifini yayımladı",o:"Avrupa Komisyonu, havacılık dağıtımında API standardizasyonu ve veri taşınabilirliğini zorunlu kılacak direktifi yayımladı. GDS ve rezervasyon sistemlerini etkiliyor.",k:"duzenleyici",hy:"Tümü",s:[{a:"EC Transport",u:"https://transport.ec.europa.eu/transport-modes/air_en"},{a:"PhocusWire",u:"https://www.phocuswire.com/eu-aviation-digital-single-market-directive"}],az:true},
  {id:20,t:"2026-05-29",b:"Travelport–Etihad NDC anlaşması: Kişiselleştirilmiş teklifler devrede",o:"Etihad Airways ve Travelport, kişiselleştirilmiş dinamik paket tekliflerini mümkün kılan NDC anlaşmasını devreye aldı. İlk aşamada 3 pazar pilot olarak seçildi.",k:"ortaklik",hy:"Etihad",s:[{a:"Travelport PR",u:"https://www.travelport.com/blog"},{a:"Travel Weekly",u:"https://www.travelweekly.com/Travel-News/Airline-News/Travelport-Etihad-NDC"}],az:false},
];

// Gündem kategorileri: turkiye | dunya | ispanya | spor | smalltalk
const GUNDEM = [
  // ── TÜRKİYE GÜNDEMİ ──
  {id:1,  kat:"turkiye", etiket:"🇹🇷 Türkiye", tarih:"11 Haz", onemli:true,
   b:"TCMB faiz kararı bugün saat 14:00'te açıklanacak",
   o:"Merkez Bankası Haziran 2026 PPK toplantısı bugün yapılıyor. Ekonomistlerin büyük çoğunluğu politika faizinin %37'de sabit kalmasını bekliyor. Faiz kararı THY maliyetlerini ve döviz kurunu doğrudan etkiliyor.",
   url:"https://bigpara.hurriyet.com.tr/ekonomi-haberleri/galeri-merkez-bankasi-faiz-karari-haziran-2026-tarihi_ID100913099/"},
  {id:2,  kat:"turkiye", etiket:"🇹🇷 Türkiye", tarih:"10 Haz", onemli:false,
   b:"Türkiye'nin turizm geliri 2026'da 62 milyar dolara ulaştı",
   o:"Kültür ve Turizm Bakanlığı verilerine göre Ocak–Mayıs döneminde 18,4 milyon yabancı turist geldi. Avrupalı ve Körfezli turist sayısındaki artış havacılık talebini besliyor.",
   url:"https://www.hurriyet.com.tr/ekonomi/turizm-geliri-2026"},
  {id:3,  kat:"turkiye", etiket:"🇹🇷 Türkiye", tarih:"9 Haz", onemli:false,
   b:"İstanbul Havalimanı Avrupa'nın en yoğun havalimanı olmayı sürdürüyor",
   o:"ACI Europe verilerine göre İstanbul Havalimanı Mayıs 2026'da 9,1 milyon yolcuyla Paris CDG'yi geride bıraktı. THY'nin hub stratejisinin bu sıralamadaki belirleyici rolü dikkat çekiyor.",
   url:"https://www.dhmi.gov.tr/haberler"},
  {id:4,  kat:"turkiye", etiket:"🇹🇷 Türkiye", tarih:"8 Haz", onemli:false,
   b:"Türkiye büyüme verileri: Q1 2026'da yüzde 4,2",
   o:"TÜİK açıkladı: Türkiye ekonomisi 2026 ilk çeyreğinde yüzde 4,2 büyüdü. İhracat ve hizmet sektörü büyümenin temel itici güçleri oldu. Enflasyon ise yüzde 38'e geriledi.",
   url:"https://www.tuik.gov.tr"},

  // ── DÜNYA GÜNDEMİ ──
  {id:5,  kat:"dunya", etiket:"🌍 Dünya", tarih:"11 Haz", onemli:true,
   b:"2026 FIFA Dünya Kupası Kuzey Amerika'da başlıyor",
   o:"48 takımlı genişletilmiş format ABD, Kanada ve Meksika'da 11 Haziran–19 Temmuz arasında düzenleniyor. Açılış maçı Meksika–Güney Afrika. 104 maç oynanacak, final New York'ta.",
   url:"https://spor.haber7.com/dunya-kupasi/haber/3634351-2026-dunya-kupasi-basliyor-iste-fikstur-turkiyenin-maclari-ne-zaman"},
  {id:6,  kat:"dunya", etiket:"🌍 Dünya", tarih:"10 Haz", onemli:false,
   b:"Fed faiz kararı: Politika faizi sabit, enflasyon baskısı sürüyor",
   o:"ABD Merkez Bankası Haziran toplantısında politika faizini değiştirmedi. Jet yakıtı ve nakliye maliyetleri üzerindeki baskı sürüyor; havacılık sektörü zor maliyet ortamında.",
   url:"https://www.reuters.com/markets/rates-bonds/fed-holds-rates-steady/"},
  {id:7,  kat:"dunya", etiket:"🌍 Dünya", tarih:"9 Haz", onemli:false,
   b:"Orta Doğu gerilimi: Hava hatları güzergahlarını yeniden çizdi",
   o:"Bölgedeki jeopolitik gelişmeler nedeniyle birçok Avrupa havayolu güzergahlarını değiştirdi. THY Orta Doğu kapasitesini yüzde 9,3 kısarken Asya bağlantılarını güçlendirdi.",
   url:"https://www.airwaysmag.com/new-post/qatar-airways-strong-full-year-profit"},
  {id:8,  kat:"dunya", etiket:"🌍 Dünya", tarih:"8 Haz", onemli:false,
   b:"IATA: Küresel havacılık kârı 2026'da 36 milyar dolara ulaşacak",
   o:"IATA Haziran 2026 tahmininde sektörün net kârını 36 milyar dolar olarak revize etti. Yolcu talebi güçlü seyrederken yakıt maliyetleri ve personel giderleri baskı oluşturuyor.",
   url:"https://www.iata.org/en/pressroom/2026-releases/"},

  // ── İSPANYA GÜNDEMİ ──
  {id:9,  kat:"ispanya", etiket:"🇪🇸 İspanya", tarih:"11 Haz", onemli:true,
   b:"İspanya Dünya Kupası'nda favori: B Grubu'nda mücadele edecek",
   o:"Mevcut Avrupa ve Dünya şampiyonu İspanya, Dünya Kupası'nda en güçlü aday gösteriliyor. Yamanın takımı Pedri, Gavi ve Yamal'la güçlü kadrosuyla B Grubu'nda mücadele edecek.",
   url:"https://www.marca.com/futbol/seleccion/2026/06/11/espana-mundial-2026.html"},
  {id:10, kat:"ispanya", etiket:"🇪🇸 İspanya", tarih:"10 Haz", onemli:false,
   b:"Real Madrid Arda Güler'in satışına sıcak bakmıyor",
   o:"Real Madrid yönetimi, Dünya Kupası öncesinde Arda Güler'in transferine kapıyı kapattı. Florentino Pérez, genç oyuncuyu uzun vadeli projenin parçası olarak görüyor.",
   url:"https://www.marca.com/futbol/real-madrid/"},
  {id:11, kat:"ispanya", etiket:"🇪🇸 İspanya", tarih:"9 Haz", onemli:false,
   b:"İspanya ekonomisi 2026'da yüzde 2,8 büyüdü — AB'nin en hızlısı",
   o:"İspanya, turizm ve ihracat gelirlerindeki güçlü seyir sayesinde AB ortalamasının üzerinde büyüme kaydetti. Madrid ve Barselona havalimanları rekor yolcu sayılarına ulaştı.",
   url:"https://www.reuters.com/markets/europe/spain-economy-2026/"},
  {id:12, kat:"ispanya", etiket:"🇪🇸 İspanya", tarih:"8 Haz", onemli:false,
   b:"IAG'ın İspanya kolu Iberia rekor yolcu sayısına ulaştı",
   o:"Iberia, 2026'nın ilk beş ayında 16,8 milyon yolcu taşıdığını açıkladı. Latin Amerika hatlarındaki güçlü talep ve transatlantik premium kabindeki doluluk performansı öne çıkıyor.",
   url:"https://www.iairgroup.com/investors"},

  // ── SPOR GÜNDEMİ ──
  {id:13, kat:"spor", etiket:"⚽ Spor", tarih:"14 Haz", onemli:true,
   b:"🔴 Türkiye – Avustralya | Dünya Kupası D Grubu — 14 Haz 07:00 TRT 1",
   o:"Türkiye'nin 24 yıl aradan sonra Dünya Kupası'ndaki ilk maçı. BC Place, Vancouver. Teknik direktör Montella'nın 26 kişilik kadrosu: Arda Güler, Kenan Yıldız, Hakan Çalhanoğlu, Barış Alper, Ferdi Kadıoğlu.",
   url:"https://www.milliyet.com.tr/galeri/milli-mac-ne-zaman-avustralya-turkiye-2026-fifa-dunya-kupasi-maci-ne-zaman-saat-kacta-hangi-kanalda-a-milli-takim-grupta-ilk-7603344"},
  {id:14, kat:"spor", etiket:"⚽ Spor", tarih:"20 Haz", onemli:false,
   b:"Türkiye – Paraguay | Dünya Kupası 2. maç — 20 Haz 06:00 TRT 1",
   o:"San Francisco Bay Area Stadyumu'nda oynanacak. Galibiyetle son 16'ya adım atma şansı. Paraguay özellikle kontra atak oyunuyla dikkat çekiyor.",
   url:"https://spor.haber7.com/dunya-kupasi/haber/3634351"},
  {id:15, kat:"spor", etiket:"⚽ Spor", tarih:"Haziran", onemli:false,
   b:"Galatasaray 4. şampiyonluğunun ardından transfere odaklandı",
   o:"Süper Lig'i üst üste 4. kez kazanan Galatasaray, Şampiyonlar Ligi kadrosunu güçlendiriyor. Osimhen'in alternatifi aranıyor. PSG'nin yıldızı gündemde.",
   url:"https://www.fanatik.com.tr/takim/galatasaray/futbol/"},
  {id:16, kat:"spor", etiket:"⚽ Spor", tarih:"Haziran", onemli:false,
   b:"Fenerbahçe'de Aziz Yıldırım başkanlığa döndü, Lewandowski transferi ilan edildi",
   o:"Fenerbahçe kongresinde Aziz Yıldırım yeniden seçildi. Canlı yayında Lewandowski ve Guirassy transferlerini duyurdu. Teknik direktörlük için isimler değerlendiriliyor.",
   url:"https://www.fanatik.com.tr/takim/fenerbahce/futbol/"},
  {id:17, kat:"spor", etiket:"⚽ Spor", tarih:"Haziran", onemli:false,
   b:"Beşiktaş'ta Vincenzo Italiano dönemi başlıyor",
   o:"Beşiktaş, eski Fiorentina teknik direktörü Vincenzo Italiano ile resmi sözleşme imzaladı. İtalyan çalıştırıcı kanat oyunculuğuna önem veriyor; transfer bütçesi 30 milyon Euro.",
   url:"https://www.fanatik.com.tr/takim/besiktas/futbol/"},
  {id:18, kat:"spor", etiket:"⚽ Spor", tarih:"Haziran", onemli:false,
   b:"Arda Güler ve Kenan Yıldız Golden Boy finalinde",
   o:"Real Madrid'in yıldızı Arda Güler ve Juventus'un genç oyuncusu Kenan Yıldız, Avrupa'nın en prestijli genç oyuncu ödülü Golden Boy'da finale kaldı. İki Türk aday aynı anda.",
   url:"https://www.mynet.com/spor/2026-dunya-kupasi"},

  // ── SMALL TALK ──
  {id:19, kat:"smalltalk", etiket:"💡 Small Talk", tarih:"11 Haz", onemli:false,
   b:"İstanbul'da konut fiyatları yüzde 12 geriledi — alıcılar beklemede",
   o:"Emlakjet verilerine göre İstanbul genelinde ortalama konut fiyatları son 6 ayda yüzde 12 düştü. Kadıköy ve Beşiktaş'ta düşüş daha sınırlı kalırken Anadolu yakası daha fazla etkilendi.",
   url:"https://www.emlakjet.com/haberler/istanbul-konut-fiyatlari-2026"},
  {id:20, kat:"smalltalk", etiket:"💡 Small Talk", tarih:"10 Haz", onemli:false,
   b:"Metrobüs'te yeni düzenleme: Ayrık hat Söğütlüçeşme'ye uzuyor",
   o:"İBB Metrobüs hattının Söğütlüçeşme'ye kadar uzatılması için ihalesi tamamlandı. Proje 2027'de hayata geçecek. Sabah yoğun saatlerinde doluluk oranı yüzde 180'i geçiyor.",
   url:"https://www.ibb.istanbul/haberler"},
  {id:21, kat:"smalltalk", etiket:"💡 Small Talk", tarih:"9 Haz", onemli:false,
   b:"Netflix Türkiye'nin yeni dizisi 'Miras' global listede 3. oldu",
   o:"Netflix'in Türk yapımı Miras dizisi yayına girdikten 3 gün içinde küresel listede 3. sıraya yükseldi. 60 ülkede izleniyor; Avrupa ve Latin Amerika'da rekor kırıyor.",
   url:"https://www.hurriyet.com.tr/kelebek/magazin/"},
  {id:22, kat:"smalltalk", etiket:"💡 Small Talk", tarih:"8 Haz", onemli:false,
   b:"Kapadokya'da balon turu talebi rekora koşuyor — erken rezervasyon şart",
   o:"Turizm Bakanlığı verilerine göre Kapadokya'da sıcak hava balonu rezervasyonları 3 ay öncesinden dolmaya başladı. Yaz sezonu için %40 artış bekleniyor.",
   url:"https://www.kulturportali.gov.tr"},
  {id:23, kat:"smalltalk", etiket:"💡 Small Talk", tarih:"7 Haz", onemli:false,
   b:"İstanbul trafiği yapay zeka ile yönetiliyor: TomTom sıralamasında 3 basamak geriledi",
   o:"İBB'nin AI destekli trafik yönetim sisteminin devreye girmesinin ardından TomTom'un yıllık raporunda İstanbul 3 basamak geriledi. Hâlâ dünyanın en kötü 5 trafiği arasında.",
   url:"https://www.ibb.istanbul/haberler"},
];

// ─── KUR HOOK — fawazahmed0/exchange-api (jsDelivr CDN) ─────────────────────
// Bugün + dün verisi çekerek değişim hesaplar
function dateStr(offsetGun=0) {
  const d=new Date(); d.setDate(d.getDate()+offsetGun);
  return d.toISOString().split("T")[0]; // "2026-06-11"
}
async function fetchRates(tarih) {
  // Önce CDN'i dene, sonra Cloudflare fallback
  const cdnUrl=`${CDN_BASE}@${tarih}/v1/currencies/usd.json`;
  const cfUrl=`https://${tarih}.currency-api.pages.dev/v1/currencies/usd.json`;
  for(const url of [cdnUrl,cfUrl]) {
    try {
      const r=await fetch(url);
      if(!r.ok) continue;
      const d=await r.json();
      // Yanıt: { date:"2026-06-11", usd: { try: 46.1, eur: 0.866, ... } }
      const rates=d?.usd;
      if(!rates) continue;
      return { try: rates.try??null, eur: rates.eur??null };
    } catch { continue; }
  }
  return null;
}
function usePiyasa() {
  const [v,setV]=useState({
    usdtry:null,eurtry:null,usdeur:null,
    usdtry_d:null,eurtry_d:null,usdeur_d:null, // dünkü değerler
    brent:ENERJI.brent,jet:ENERJI.jet,
    guncelleme:null,yukleniyor:true,hata:null
  });
  const cek=useCallback(async()=>{
    setV(p=>({...p,yukleniyor:true,hata:null}));
    try {
      // Bugün ve dün paralel çek
      const [bugun,dun]=await Promise.all([
        fetchRates("latest"),
        fetchRates(dateStr(-1)),
      ]);
      if(!bugun) throw new Error("Veri alınamadı");
      const usdtry=bugun.try, usdeur=bugun.eur;
      const eurtry=usdtry&&usdeur?usdtry/usdeur:null;
      const usdtry_d=dun?.try??null, usdeur_d=dun?.eur??null;
      const eurtry_d=usdtry_d&&usdeur_d?usdtry_d/usdeur_d:null;
      setV({usdtry,eurtry,usdeur,usdtry_d,eurtry_d,usdeur_d,
        brent:ENERJI.brent,jet:ENERJI.jet,
        guncelleme:new Date().toLocaleTimeString("tr-TR"),
        yukleniyor:false,hata:null});
    } catch(e) {
      setV(p=>({...p,yukleniyor:false,hata:"Kur verisi alınamadı"}));
    }
  },[]);
  useEffect(()=>{ cek(); const iv=setInterval(cek,10*60*1000); return()=>clearInterval(iv); },[cek]);
  return {...v,yenile:cek};
}

// ─── AKAN KUR ŞERİDİ ─────────────────────────────────────────────────────────
function KurSeridi({p,dk}) {
  const bord=dk?"#334155":"#e2e8f0";
  const cardBg=dk?"#1e293b":"#ffffff";
  const textC=dk?"#e2e8f0":"#1e293b";
  const muted="#94a3b8";

  // değişim yüzdesi hesapla
  function deg(simdiki, onceki) {
    if(simdiki==null||onceki==null||onceki===0) return null;
    return ((simdiki-onceki)/Math.abs(onceki))*100;
  }
  // TL için yukarı = kötü (TL değer kaybı), petrol için yukarı = kötü
  function renk(d, tersSigne=false) {
    if(d==null) return muted;
    const yukari=d>0;
    return tersSigne ? (yukari?"#ef4444":"#10b981") : (yukari?"#10b981":"#ef4444");
  }

  const items = [
    { l:"USD/TRY", v:p.usdtry, vd:p.usdtry_d, f:v=>`₺${v.toFixed(2)}`, ters:true },
    { l:"EUR/TRY", v:p.eurtry, vd:p.eurtry_d, f:v=>`₺${v.toFixed(2)}`, ters:true },
    { l:"USD/EUR", v:p.usdeur, vd:p.usdeur_d, f:v=>`€${v.toFixed(4)}`, ters:false },
    { l:"Brent",   v:p.brent,  vd:null,        f:v=>`$${v.toFixed(1)}`, ters:true, birim:"/bbl" },
    { l:"Jet Yakıtı", v:p.jet, vd:null,        f:v=>`$${v.toFixed(1)}`, ters:true, birim:"/bbl" },
  ];

  return (
    <div style={{
      background: dk?"#0f172a":"#f1f5f9",
      borderBottom:`1px solid ${bord}`,
      overflowX:"auto",
      whiteSpace:"nowrap",
      fontSize:12,
      userSelect:"none",
    }}>
      <div style={{
        display:"inline-flex",
        alignItems:"center",
        gap:0,
        minWidth:"100%",
        padding:"0 16px",
      }}>
        {/* Sol etiket */}
        <div style={{
          display:"flex",alignItems:"center",gap:6,
          padding:"6px 14px 6px 0",
          borderRight:`1px solid ${bord}`,
          marginRight:14,
          flexShrink:0,
        }}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#10b981",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:10,fontWeight:700,color:muted,letterSpacing:"0.5px",textTransform:"uppercase"}}>Canlı</span>
        </div>

        {p.yukleniyor && (
          <span style={{color:muted,padding:"6px 0",fontSize:11}}>Kur verileri yükleniyor…</span>
        )}
        {p.hata && (
          <span style={{color:"#ef4444",padding:"6px 0",fontSize:11,display:"flex",alignItems:"center",gap:8}}>
            ⚠ {p.hata}
            <button onClick={p.yenile} style={{fontSize:10,border:"1px solid #ef4444",background:"transparent",color:"#ef4444",padding:"1px 6px",borderRadius:4,cursor:"pointer"}}>↺</button>
          </span>
        )}
        {!p.yukleniyor && !p.hata && items.map((item,i)=>{
          const d=deg(item.v, item.vd);
          const r=renk(d, item.ters);
          const yukari=d!=null&&d>0;
          return (
            <div key={item.l} style={{
              display:"inline-flex",alignItems:"center",gap:8,
              padding:"7px 14px",
              borderRight: i<items.length-1 ? `1px solid ${bord}` : "none",
              flexShrink:0,
            }}>
              <span style={{fontSize:10,fontWeight:700,color:muted,letterSpacing:"0.3px"}}>{item.l}</span>
              <span style={{fontSize:13,fontWeight:800,color:textC,letterSpacing:"-0.3px",fontVariantNumeric:"tabular-nums"}}>
                {item.v!=null ? item.f(item.v)+(item.birim||"") : "—"}
              </span>
              {d!=null && (
                <span style={{
                  fontSize:10,fontWeight:700,color:r,
                  background:r+"15",
                  padding:"1px 5px",borderRadius:4,
                  display:"flex",alignItems:"center",gap:2,
                }}>
                  {yukari?"▲":"▼"}{Math.abs(d).toFixed(2)}%
                </span>
              )}
              {d==null && item.vd==null && item.v!=null && (
                <span style={{fontSize:10,color:muted}}>EIA</span>
              )}
            </div>
          );
        })}

        {/* Son güncelleme */}
        {!p.yukleniyor && !p.hata && (
          <div style={{marginLeft:"auto",flexShrink:0,display:"flex",alignItems:"center",gap:8,paddingLeft:14,borderLeft:`1px solid ${bord}`}}>
            <span style={{fontSize:10,color:muted}}>⟳ {p.guncelleme}</span>
            <button onClick={p.yenile} style={{fontSize:10,background:"transparent",border:`1px solid ${bord}`,color:muted,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>Yenile</button>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
function Sparkline({vals,renk,h=28,w=80}) {
  const t=vals.filter(v=>v!=null);
  if(t.length<2) return <span style={{color:"#94a3b8",fontSize:11}}>—</span>;
  const mn=Math.min(...t),mx=Math.max(...t),rng=mx-mn||1;
  const step=w/(t.length-1);
  const pts=t.map((v,i)=>`${(i*step).toFixed(1)},${(h-((v-mn)/rng)*h).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={renk} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={(t.length-1)*step} cy={h-((t[t.length-1]-mn)/rng)*h} r="2.5" fill={renk}/>
    </svg>
  );
}

// ─── BAR GRAFİK (gelir karşılaştırma) ───────────────────────────────────────
function BarChart({data,metrik,dk}) {
  const max=Math.max(...data.map(d=>Math.abs(d.val||0)),1);
  const c=dk?"#e2e8f0":"#1e293b";
  const bg=dk?"#0f172a":"#f8fafc";
  const bord=dk?"#334155":"#e2e8f0";
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {data.map(d=>(
        <div key={d.id} style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:130,fontSize:12,fontWeight:d.id==="thy"?700:400,color:c,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {d.id==="thy"?"⭐ ":""}{d.ad}
          </div>
          <div style={{flex:1,height:22,background:bg,borderRadius:4,overflow:"hidden",border:`1px solid ${bord}`}}>
            {d.val!=null && (
              <div style={{height:"100%",width:`${(Math.abs(d.val)/max)*100}%`,background:d.val<0?"#ef4444":d.renk,borderRadius:4,display:"flex",alignItems:"center",paddingLeft:6,transition:"width 0.6s ease"}}>
                <span style={{fontSize:11,fontWeight:700,color:"#fff",whiteSpace:"nowrap"}}>{METR[metrik].fmt(d.val)}</span>
              </div>
            )}
            {d.val==null && <span style={{fontSize:11,color:"#94a3b8",paddingLeft:6}}>—</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function App() {
  const [tema,setTema]=useState("acik");
  const [sekme,setSekme]=useState("haberler");
  const [hKat,setHKat]=useState("tumu");
  const [hHY,setHHY]=useState("Tümü");
  const [hArama,setHArama]=useState("");
  const [hAz,setHAz]=useState(false);
  const [fMetrik,setFMetrik]=useState("g");
  const [fYillar,setFYillar]=useState(["2023","2024","2025","Q1 2026"]);
  const [fHY,setFHY]=useState(FIN.havayollari.map(h=>h.id));
  const [fGor,setFGor]=useState("grafik");
  const [chatAcik,setChatAcik]=useState(false);
  const [chatM,setChatM]=useState([{r:"a",t:"Ticari Takip Portalı Asistanına hoş geldiniz. Havacılık finansalları, NDC/GDS veya gündem hakkında soru sorabilirsiniz."}]);
  const [chatG,setChatG]=useState("");
  const [chatYuk,setChatYuk]=useState(false);
  const chatRef=useRef(null);
  const piyasa=usePiyasa();
  const dk=tema==="karanlik";

  const c={bg:dk?"#0f172a":"#f8fafc",card:dk?"#1e293b":"#ffffff",bord:dk?"#334155":"#e2e8f0",text:dk?"#e2e8f0":"#1e293b",sub:dk?"#94a3b8":"#475569",muted:"#94a3b8"};

  useEffect(()=>{ chatRef.current?.scrollIntoView({behavior:"smooth"}); },[chatM]);

  async function chatGonder(s) {
    const m=s||chatG.trim(); if(!m) return;
    setChatG(""); setChatM(p=>[...p,{r:"u",t:m}]); setChatYuk(true);
    const ctx=FIN.havayollari.slice(0,5).map(h=>`${h.ad} 2025: $${h.yil["2025"]?.g}B gelir, $${h.yil["2025"]?.nk}B net kâr, ${h.yil["2025"]?.p}M yolcu`).join("\n");
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:500,
        system:`Sen THY üst yönetimine sunum yapan kıdemli havacılık analistisin. Kısa, öz, aksiyon odaklı Türkçe yanıt ver.\n${ctx}`,
        messages:[{role:"user",content:m}]
      })});
      const d=await res.json();
      setChatM(p=>[...p,{r:"a",t:d.content?.[0]?.text||"Yanıt alınamadı."}]);
    } catch { setChatM(p=>[...p,{r:"a",t:"Hata oluştu."}]); }
    finally { setChatYuk(false); }
  }

  const filtreli=HABERLER.filter(h=>{
    if(hKat!=="tumu"&&h.k!==hKat) return false;
    if(hHY!=="Tümü"&&h.hy!==hHY) return false;
    if(hAz&&!h.az) return false;
    if(hArama){const q=hArama.toLowerCase();if(!h.b.toLowerCase().includes(q)&&!h.o.toLowerCase().includes(q)) return false;}
    return true;
  });

  const aktifHY=FIN.havayollari.filter(h=>fHY.includes(h.id));
  const thyObj=FIN.havayollari.find(h=>h.id==="thy");

  const tumYillar=["2021","2022","2023","2024","2025","Q1 2026"];

  const grafik_data = aktifHY.map(h=>({
    id:h.id, ad:h.ad, renk:h.renk,
    val: fYillar.length>0
      ? (h.yil[fYillar[fYillar.length-1]]?.[fMetrik]??null)
      : null
  })).sort((a,b)=>(b.val||0)-(a.val||0));

  const s={
    app:{minHeight:"100vh",background:c.bg,color:c.text,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",fontSize:14},
    hdr:{background:c.card,borderBottom:`1px solid ${c.bord}`,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,position:"sticky",top:0,zIndex:100},
    nav:{background:c.card,borderBottom:`1px solid ${c.bord}`,padding:"0 20px",display:"flex",gap:4,overflowX:"auto",position:"sticky",top:86,zIndex:99},
    tab:a=>({padding:"10px 14px",cursor:"pointer",border:"none",background:"transparent",color:a?"#6366f1":c.muted,fontWeight:a?600:400,fontSize:13,borderBottom:a?"2px solid #6366f1":"2px solid transparent",whiteSpace:"nowrap"}),
    main:{maxWidth:1300,margin:"0 auto",padding:"20px 16px"},
    card:{background:c.card,border:`1px solid ${c.bord}`,borderRadius:12,padding:20,marginBottom:14},
    btn:(a,r="#6366f1")=>({padding:"5px 12px",borderRadius:8,border:`1px solid ${a?r:c.bord}`,background:a?r:"transparent",color:a?"#fff":c.muted,fontSize:12,fontWeight:a?600:400,cursor:"pointer"}),
    chip:a=>({padding:"5px 12px",borderRadius:20,border:`1px solid ${a?"#6366f1":c.bord}`,background:a?"#6366f1":"transparent",color:a?"#fff":c.muted,fontSize:12,cursor:"pointer"}),
    th:{padding:"9px 12px",textAlign:"left",fontWeight:600,color:c.muted,fontSize:11,textTransform:"uppercase",letterSpacing:"0.4px",whiteSpace:"nowrap",borderBottom:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc"},
    td:{padding:"10px 12px",borderBottom:`1px solid ${c.bord}50`,verticalAlign:"middle"},
    tag:r=>({fontSize:11,fontWeight:600,color:r,background:r+"18",padding:"2px 8px",borderRadius:6,whiteSpace:"nowrap"}),
    h2:{fontSize:16,fontWeight:700,marginBottom:14,letterSpacing:"-0.3px"},
  };

  const [gKat,setGKat]=useState("turkiye"); // gündem aktif kategori

  const GKAT_LIST=[
    {id:"turkiye",  l:"🇹🇷 Türkiye",  r:"#ef4444"},
    {id:"dunya",    l:"🌍 Dünya",      r:"#0ea5e9"},
    {id:"ispanya",  l:"🇪🇸 İspanya",  r:"#f59e0b"},
    {id:"spor",     l:"⚽ Spor",       r:"#10b981"},
    {id:"smalltalk",l:"💡 Small Talk", r:"#8b5cf6"},
  ];
  const gKatRenk = Object.fromEntries(GKAT_LIST.map(k=>[k.id,k.r]));
  const gFiltreli = GUNDEM.filter(g=>g.kat===gKat);
  const gOnemli   = GUNDEM.filter(g=>g.onemli);

  const TUMU_HY=["Tümü",...new Set(HABERLER.map(h=>h.hy))];

      {/* HEADER */}
      <header style={s.hdr}>
        <div style={{display:"flex",alignItems:"center",gap:10,fontWeight:700,fontSize:15}}>
          <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✈️</div>
          <span>Ticari Takip Portalı</span>
          <span style={{fontSize:10,fontWeight:700,background:"#6366f1",color:"#fff",padding:"2px 7px",borderRadius:10}}>BETA</span>
        </div>
        <button style={s.btn(false)} onClick={()=>setTema(dk?"acik":"karanlik")}>{dk?"☀️":"🌙"}</button>
      </header>

      {/* KUR ŞERİDİ — tüm sayfalarda görünür */}
      <KurSeridi p={piyasa} dk={dk}/>

      {/* NAV */}
      <nav style={s.nav}>
        {[
          {id:"haberler",   l:"📰 Haberler"},
          {id:"gundem",     l:"🗞️ Gündelik Gündem"},
          {id:"gostergeler",l:"📈 Göstergeler"},
          {id:"finansallar",l:"📊 Sektörel Finansallar"},
        ].map(t=><button key={t.id} style={s.tab(sekme===t.id)} onClick={()=>setSekme(t.id)}>{t.l}</button>)}
      </nav>

      <main style={s.main}>

        {/* ══ HABERLER ══ */}
        {sekme==="haberler" && <>
          <div style={{...s.card,display:"flex",flexWrap:"wrap",gap:10,alignItems:"center",padding:"14px 16px"}}>
            <div style={{flex:"1 1 180px",position:"relative"}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:c.muted}}>🔍</span>
              <input style={{width:"100%",padding:"8px 12px 8px 32px",borderRadius:8,border:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc",color:c.text,fontSize:13,outline:"none",boxSizing:"border-box"}} placeholder="Haber ara…" value={hArama} onChange={e=>setHArama(e.target.value)}/>
            </div>
            <select style={{padding:"7px 10px",borderRadius:8,border:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc",color:c.text,fontSize:13,outline:"none"}} value={hHY} onChange={e=>setHHY(e.target.value)}>
              {TUMU_HY.map(h=><option key={h}>{h}</option>)}
            </select>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}>
              <input type="checkbox" checked={hAz} onChange={e=>setHAz(e.target.checked)} style={{accentColor:"#10b981"}}/>Analizli
            </label>
            {(hArama||hHY!=="Tümü"||hKat!=="tumu"||hAz)&&<button style={s.btn(false)} onClick={()=>{setHArama("");setHHY("Tümü");setHKat("tumu");setHAz(false);}}>✕</button>}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {KKATEGORILER.map(k=><button key={k.id} style={s.chip(hKat===k.id)} onClick={()=>setHKat(k.id)}>{k.l}</button>)}
          </div>
          {filtreli.length===0
            ? <div style={{textAlign:"center",padding:"60px 20px",color:c.muted}}><div style={{fontSize:32,marginBottom:8}}>🔍</div>Sonuç bulunamadı</div>
            : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:12}}>
                {filtreli.map(h=>(
                  <div key={h.id} style={s.card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <span style={s.tag(KRENK[h.k]||"#94a3b8")}>{KKATEGORILER.find(k=>k.id===h.k)?.l||h.k}</span>
                      <span style={{fontSize:11,color:c.muted}}>{new Date(h.t).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})}</span>
                    </div>
                    <div style={{fontWeight:600,fontSize:14,lineHeight:1.45,marginBottom:7}}>{h.b}</div>
                    <div style={{fontSize:12,lineHeight:1.6,color:c.sub,marginBottom:12}}>{h.o}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {h.s.map(k=>(
                          <a key={k.a} href={k.u} target="_blank" rel="noopener" style={{fontSize:11,color:"#6366f1",textDecoration:"none",background:"#6366f115",padding:"2px 8px",borderRadius:6}}>{k.a} ↗</a>
                        ))}
                      </div>
                      {h.az&&<span style={s.tag("#10b981")}>✦ Analizli</span>}
                    </div>
                  </div>
                ))}
              </div>
          }
        </>}

        {/* ══ GÜNDELİK GÜNDEM ══ */}
        {sekme==="gundem" && <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <div style={s.h2}>🗞️ Gündelik Gündem — {new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})}</div>
            <div style={{fontSize:12,color:c.muted,marginBottom:14}}>Türkiye · Dünya · İspanya · Spor · Small Talk</div>
          </div>

          {/* KATEGORİ SEÇİCİ */}
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
            {GKAT_LIST.map(k=>(
              <button key={k.id} style={{
                padding:"8px 16px",borderRadius:20,cursor:"pointer",
                border:`1px solid ${gKat===k.id?k.r:c.bord}`,
                background:gKat===k.id?k.r:"transparent",
                color:gKat===k.id?"#fff":c.muted,
                fontSize:13,fontWeight:gKat===k.id?700:400,
              }} onClick={()=>setGKat(k.id)}>{k.l}</button>
            )}
          </div>

          {/* ÖNE ÇIKANLAR — her kategoride görünür */}
          {gOnemli.length>0 && gKat==="turkiye" && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12,marginBottom:20}}>
              {gOnemli.map(g=>(
                <a key={g.id} href={g.url} target="_blank" rel="noopener" style={{textDecoration:"none"}}>
                  <div style={{...s.card,borderLeft:`4px solid ${gKatRenk[g.kat]||"#ef4444"}`,cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={s.tag(gKatRenk[g.kat]||"#ef4444")}>{GKAT_LIST.find(k=>k.id===g.kat)?.l} · ÖNEMLI</span>
                      <span style={{fontSize:11,color:c.muted}}>{g.tarih}</span>
                    </div>
                    <div style={{fontWeight:700,fontSize:14,lineHeight:1.4,marginBottom:6,color:c.text}}>{g.b}</div>
                    <div style={{fontSize:12,lineHeight:1.55,color:c.sub}}>{g.o}</div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* SPOR sekmesinde Dünya Kupası fikstürü */}
          {gKat==="spor" && (
            <div style={{...s.card,marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>🏆 Türkiye — 2026 Dünya Kupası D Grubu</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[
                  {t:"14 Haz · 07:00",m:"🇦🇺 Avustralya – Türkiye 🇹🇷",s:"BC Place, Vancouver",durum:"YAKLAŞIYOR",r:"#ef4444",y:"https://www.milliyet.com.tr/galeri/milli-mac-ne-zaman-avustralya-turkiye-2026-fifa-dunya-kupasi-maci-ne-zaman-saat-kacta-hangi-kanalda-a-milli-takim-grupta-ilk-7603344"},
                  {t:"20 Haz · 06:00",m:"🇹🇷 Türkiye – Paraguay 🇵🇾",s:"Bay Area Stadium, San Francisco",durum:"GRUPTA",r:"#6366f1",y:"https://spor.haber7.com/dunya-kupasi/haber/3634351"},
                  {t:"26 Haz · 05:00",m:"🇹🇷 Türkiye – ABD 🇺🇸",s:"Los Angeles Stadium",durum:"GRUPTA",r:"#6366f1",y:"https://spor.haber7.com/dunya-kupasi/haber/3634351"},
                ].map((mac,i)=>(
                  <a key={i} href={mac.y} target="_blank" rel="noopener" style={{textDecoration:"none"}}>
                    <div style={{background:dk?"#0f172a":"#f8fafc",borderRadius:10,padding:"11px 14px",display:"flex",flexWrap:"wrap",gap:10,alignItems:"center",border:`1px solid ${i===0?mac.r:c.bord}`}}>
                      <span style={{...s.tag(mac.r),fontSize:10}}>{mac.durum}</span>
                      <span style={{fontSize:11,color:c.muted,minWidth:100}}>{mac.t}</span>
                      <span style={{fontWeight:700,fontSize:13,color:c.text,flex:1}}>{mac.m}</span>
                      <span style={{fontSize:11,color:c.muted}}>{mac.s}</span>
                      <span style={{...s.tag("#10b981"),fontSize:10}}>TRT 1</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* KATEGORİ HABERLERİ */}
          {gFiltreli.length===0
            ? <div style={{textAlign:"center",padding:"40px 20px",color:c.muted}}>Bu kategoride haber yok</div>
            : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
                {gFiltreli.map(g=>(
                  <a key={g.id} href={g.url} target="_blank" rel="noopener" style={{textDecoration:"none"}}>
                    <div style={{...s.card,cursor:"pointer",borderLeft:g.onemli?`3px solid ${gKatRenk[g.kat]||"#6366f1"}`:"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={s.tag(gKatRenk[g.kat]||"#6366f1")}>{g.etiket}</span>
                          {g.onemli && <span style={{fontSize:9,fontWeight:700,color:"#ef4444",background:"#ef444415",padding:"1px 5px",borderRadius:4}}>ÖNE ÇIKAN</span>}
                        </div>
                        <span style={{fontSize:11,color:c.muted}}>{g.tarih}</span>
                      </div>
                      <div style={{fontWeight:g.onemli?700:600,fontSize:13,lineHeight:1.45,marginBottom:6,color:c.text}}>{g.b}</div>
                      <div style={{fontSize:12,lineHeight:1.55,color:c.sub}}>{g.o}</div>
                    </div>
                  </a>
                ))}
              </div>
          }
        </>}

        {/* ══ GÖSTERGELER ══ */}
        {sekme==="gostergeler" && <>
          <div style={s.h2}>IATA Pazar Göstergeleri</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:20}}>
            {[
              {l:"IATA Küresel RPK",d:"+9,2%",b:"Mayıs 2026 · yıllık",r:"#10b981",a:"Revenue Passenger Km"},
              {l:"Küresel ASK",d:"+7,4%",b:"Mayıs 2026 · yıllık",r:"#6366f1",a:"Available Seat Km"},
              {l:"Küresel Doluluk",d:"83,7%",b:"PLF · Mayıs 2026",r:"#f59e0b",a:"Passenger Load Factor"},
              {l:"NDC Penetrasyon",d:"~34%",b:"Tahmin · 2026",r:"#8b5cf6",a:"Toplam bilet satışlarında"},
            ].map(e=>(
              <div key={e.l} style={{background:c.card,border:`1px solid ${c.bord}`,borderLeft:`3px solid ${e.r}`,borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:26,fontWeight:800,color:e.r,letterSpacing:"-1px",lineHeight:1,marginBottom:4}}>{e.d}</div>
                <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{e.l}</div>
                <div style={{fontSize:11,color:c.muted,marginBottom:2}}>{e.b}</div>
                <div style={{fontSize:11,color:c.muted}}>{e.a}</div>
              </div>
            ))}
          </div>
          <div style={s.card}>
            <div style={{fontWeight:600,marginBottom:14}}>Bölgesel RPK Büyümesi — Mayıs 2026</div>
            {[{b:"Asya-Pasifik",v:14.1,r:"#0ea5e9"},{b:"Orta Doğu",v:11.3,r:"#8b5cf6"},{b:"Latin Amerika",v:9.8,r:"#10b981"},{b:"Kuzey Amerika",v:8.1,r:"#f59e0b"},{b:"Avrupa",v:7.4,r:"#6366f1"},{b:"Afrika",v:6.9,r:"#ef4444"}].map(x=>(
              <div key={x.b} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:13}}>{x.b}</span>
                  <span style={{fontSize:13,fontWeight:700,color:x.r}}>+{x.v}%</span>
                </div>
                <div style={{height:6,background:dk?"#0f172a":"#f1f5f9",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(x.v/15)*100}%`,background:x.r,borderRadius:4}}/>
                </div>
              </div>
            ))}
            <div style={{fontSize:11,color:c.muted,marginTop:8}}>Kaynak: <a href="https://www.iata.org/en/publications/economics/air-passenger-monthly-analysis/" target="_blank" rel="noopener" style={{color:"#6366f1"}}>IATA Air Passenger Market Analysis ↗</a> · Mayıs 2026</div>
          </div>
          <div style={s.h2}>Yayınlar & Raporlar</div>
          {[
            {b:"IATA Aylık Yolcu Analizi — Mayıs 2026",t:"Haziran 2026",o:"Küresel RPK büyümesi beklentileri aştı. Asya-Pasifik %14,1 ile öncü.",et:"IATA",u:"https://www.iata.org/en/publications/economics/air-passenger-monthly-analysis/"},
            {b:"Amadeus Dağıtım Endeksi Q1 2026",t:"Nisan 2026",o:"GDS NDC rezervasyonları %42 arttı. NDC içerik büyümesi ivmelendi.",et:"Amadeus",u:"https://ir.amadeus.com/en/financial-news-and-events/press-releases"},
            {b:"IATA ONE Order Durum Raporu H1 2026",t:"Haziran 2026",o:"60 havayolu ONE Order sertifikasyonunu tamamladı. 2027 hedefi 120.",et:"IATA",u:"https://www.iata.org/en/programs/ops-infra/one-order/"},
            {b:"Phocuswright: Havacılık Dağıtım Panosu 2026",t:"Mayıs 2026",o:"Havayollarının doğrudan gelir payı %51'i aştı.",et:"Phocuswright",u:"https://www.phocuswright.com/Research/Travel-Technology"},
            {b:"Skift: NDC'nin 5 Yılı 2021–2026",t:"Mayıs 2026",o:"NDC'nin dağıtım yapısını nasıl değiştirdiğinin analizi.",et:"Skift",u:"https://research.skift.com"},
          ].map((r,i)=>(
            <div key={i} style={{...s.card,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}>
              <div>
                <div style={{display:"flex",gap:8,marginBottom:6}}><span style={s.tag("#6366f1")}>{r.et}</span><span style={{fontSize:11,color:c.muted}}>{r.t}</span></div>
                <div style={{fontWeight:600,fontSize:14,marginBottom:6}}>{r.b}</div>
                <div style={{fontSize:13,color:c.sub}}>{r.o}</div>
              </div>
              <a href={r.u} target="_blank" rel="noopener" style={{padding:"7px 14px",background:"#6366f1",color:"#fff",borderRadius:8,fontSize:12,fontWeight:600,textDecoration:"none",flexShrink:0}}>Aç ↗</a>
            </div>
          ))}
        </>}

        {/* ══ SEKTÖREL FİNANSALLAR ══ */}
        {sekme==="finansallar" && <>
          {/* THY SNAPSHOT */}
          <div style={{...s.card,borderLeft:"4px solid #C8102E"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:15,fontWeight:800,color:"#C8102E"}}>⭐ Turkish Airlines — Son Dönem</span>
                  <span style={s.tag("#C8102E")}>THYAO · BIST</span>
                </div>
                <div style={{fontSize:12,color:c.muted}}>İstanbul merkezli, 130+ ülkeye uçuş · Q1 2026 sonuçları açıklandı</div>
              </div>
              <a href={thyObj.ir} target="_blank" rel="noopener" style={{fontSize:12,color:"#6366f1",textDecoration:"none"}}>IR Sayfası ↗</a>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
              {[
                {l:"2025 Gelir",  v:`$${thyObj.yil["2025"].g}B`,      r:"#6366f1"},
                {l:"2025 Net Kâr",v:`$${thyObj.yil["2025"].nk}B`,     r:"#10b981"},
                {l:"Q1 2026 Gelir",v:"$5,9B",                         r:"#0ea5e9",yeni:true},
                {l:"Q1 2026 Net Kâr",v:"$226M ↑",                     r:"#10b981",yeni:true},
                {l:"Q1 2026 Yolcu",v:"21,3M (+12,7%)",                r:"#ef4444",yeni:true},
                {l:"2025 Doluluk",v:`${thyObj.yil["2025"].lf}%`,      r:"#14b8a6"},
                {l:"2025 Filo",   v:`${thyObj.yil["2025"].f} uçak`,   r:"#f97316"},
                {l:"2025 İşl.Marj",v:`${thyObj.yil["2025"].im}%`,     r:"#f59e0b"},
              ].map(({l,v,r,yeni})=>(
                <div key={l} style={{background:dk?"#0f172a":"#f8fafc",borderRadius:8,padding:"10px 12px",border:yeni?`1px solid ${r}40`:"none"}}>
                  <div style={{fontSize:10,color:c.muted,marginBottom:3,display:"flex",alignItems:"center",gap:4}}>
                    {yeni&&<span style={{fontSize:9,fontWeight:700,color:r,background:r+"18",padding:"1px 5px",borderRadius:4}}>YENİ</span>}{l}
                  </div>
                  <div style={{fontSize:17,fontWeight:800,color:r,letterSpacing:"-0.5px"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:c.muted,marginTop:10}}>
              Q1 2026 kaynağı: <a href="https://www.rustourismnews.com/2026/05/06/turkish-airlines-returns-to-strong-profit-despite-rising-operating-costs/" target="_blank" rel="noopener" style={{color:"#6366f1"}}>rustourismnews.com ↗</a> · 2025: THYAO Yıllık Rapor
            </div>
          </div>

          {/* KONTROLLER */}
          <div style={{...s.card,padding:"14px 16px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Görünüm</div>
                <div style={{display:"flex",gap:5}}>
                  <button style={s.btn(fGor==="grafik")} onClick={()=>setFGor("grafik")}>📊 Grafik</button>
                  <button style={s.btn(fGor==="tablo")} onClick={()=>setFGor("tablo")}>📋 Tablo</button>
                  <button style={s.btn(fGor==="ceyrek")} onClick={()=>setFGor("ceyrek")}>📅 Çeyreklik</button>
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Metrik</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {Object.entries(METR).map(([k,v])=>(
                    <button key={k} style={s.btn(fMetrik===k,v.renk)} onClick={()=>setFMetrik(k)}>{v.l.split(" (")[0]}</button>
                  ))}
                </div>
              </div>
              {fGor!=="ceyrek" && <div>
                <div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Dönem</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {tumYillar.map(y=>(
                    <button key={y} style={{...s.btn(fYillar.includes(y)),fontSize:11}} onClick={()=>setFYillar(p=>p.includes(y)?p.filter(x=>x!==y):[...p,y])}>
                      {y==="Q1 2026"?<span style={{color:fYillar.includes(y)?"#fff":"#10b981",fontWeight:700}}>{y}★</span>:y}
                    </button>
                  ))}
                </div>
              </div>}
              <div>
                <div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Havayolları</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {FIN.havayollari.map(h=>(
                    <button key={h.id} style={s.btn(fHY.includes(h.id),h.renk)} onClick={()=>setFHY(p=>p.includes(h.id)?p.filter(x=>x!==h.id):[...p,h.id])}>
                      {h.id==="thy"?"⭐ ":""}{h.ad}
                    </button>
                  ))}
                  <button style={s.btn(false)} onClick={()=>setFHY(FIN.havayollari.map(h=>h.id))}>Tümü</button>
                </div>
              </div>
            </div>
          </div>

          {/* GRAFİK GÖRÜNÜM */}
          {fGor==="grafik" && (
            <div style={s.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={s.h2}>{METR[fMetrik].l}</div>
                  <div style={{fontSize:12,color:c.muted}}>Dönem: {fYillar[fYillar.length-1]||"—"}</div>
                </div>
              </div>
              <BarChart data={grafik_data} metrik={fMetrik} dk={dk}/>
              {fYillar.length>1 && (
                <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${c.bord}`}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:12,color:c.muted}}>TREND — {aktifHY.slice(0,4).map(h=>h.ad).join(" · ")}</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                    {aktifHY.slice(0,6).map(h=>{
                      const trendV=fYillar.map(y=>h.yil[y]?.[fMetrik]??null);
                      const son=trendV.filter(v=>v!=null).slice(-1)[0];
                      const ilk=trendV.filter(v=>v!=null)[0];
                      const deg=son&&ilk&&ilk!==0?((son-ilk)/Math.abs(ilk))*100:null;
                      return (
                        <div key={h.id} style={{background:dk?"#0f172a":"#f8fafc",borderRadius:8,padding:"12px 14px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                            <span style={{fontSize:12,fontWeight:h.id==="thy"?700:400}}>{h.id==="thy"?"⭐ ":""}{h.ad}</span>
                            {deg!=null&&<span style={{fontSize:11,fontWeight:600,color:deg>=0?"#10b981":"#ef4444"}}>{deg>=0?"+":""}{deg.toFixed(1)}%</span>}
                          </div>
                          <Sparkline vals={trendV} renk={h.renk}/>
                          <div style={{fontSize:11,color:c.muted,marginTop:4}}>{METR[fMetrik].fmt(son)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TABLO GÖRÜNÜM */}
          {fGor==="tablo" && <div style={s.card}>
            <div style={{marginBottom:12}}>
              <div style={s.h2}>{METR[fMetrik].l}</div>
              <div style={{fontSize:12,color:c.muted}}>Seçili dönemler · USD</div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>
                    <th style={s.th}>Havayolu</th>
                    {fYillar.map(y=><th key={y} style={{...s.th,textAlign:"right"}}>{y}</th>)}
                    <th style={{...s.th,textAlign:"right"}}>Δ Son</th>
                    <th style={{...s.th,textAlign:"center"}}>Trend</th>
                    <th style={s.th}>IR</th>
                  </tr>
                </thead>
                <tbody>
                  {aktifHY.map((h,i)=>{
                    const vals=fYillar.map(y=>h.yil[y]?.[fMetrik]??null);
                    const sonlar=vals.filter(v=>v!=null);
                    const yoy=sonlar.length>=2?((sonlar[sonlar.length-1]-sonlar[sonlar.length-2])/Math.abs(sonlar[sonlar.length-2]||1))*100:null;
                    const trendV=tumYillar.map(y=>h.yil[y]?.[fMetrik]??null);
                    const isTHY=h.id==="thy";
                    return (
                      <tr key={h.id} style={{background:i%2===0?"transparent":dk?"#ffffff06":"#f8fafc"}}>
                        <td style={s.td}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:3,height:32,borderRadius:2,background:h.renk,flexShrink:0}}/>
                            <div>
                              <div style={{fontWeight:isTHY?800:500}}>{isTHY?"⭐ ":""}{h.ad}</div>
                              <div style={{fontSize:10,color:c.muted}}>{h.kod} · {h.siklik}</div>
                            </div>
                          </div>
                        </td>
                        {vals.map((v,vi)=>(
                          <td key={vi} style={{...s.td,textAlign:"right",color:v!=null?c.text:c.muted,fontVariantNumeric:"tabular-nums"}}>
                            {METR[fMetrik].fmt(v)}
                          </td>
                        ))}
                        <td style={{...s.td,textAlign:"right",fontWeight:600,color:yoy==null?c.muted:yoy>0?"#10b981":"#ef4444"}}>
                          {yoy==null?"—":`${yoy>0?"+":""}${yoy.toFixed(1)}%`}
                        </td>
                        <td style={{...s.td,textAlign:"center"}}><Sparkline vals={trendV} renk={h.renk}/></td>
                        <td style={s.td}><a href={h.ir} target="_blank" rel="noopener" style={{fontSize:11,color:"#6366f1",textDecoration:"none"}}>IR ↗</a></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>}

          {/* ÇEYREK GÖRÜNÜM */}
          {fGor==="ceyrek" && <div style={s.card}>
            <div style={{marginBottom:12}}>
              <div style={s.h2}>Çeyreklik & Yarıyıl Sonuçlar</div>
              <div style={{fontSize:12,color:c.muted}}>Rapor yayınlayan havayolları · En güncel veriler</div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>
                    <th style={s.th}>Havayolu</th>
                    <th style={s.th}>Dönem</th>
                    <th style={{...s.th,textAlign:"right"}}>Gelir</th>
                    <th style={{...s.th,textAlign:"right"}}>Net Kâr</th>
                    <th style={{...s.th,textAlign:"right"}}>Yolcu</th>
                    <th style={{...s.th,textAlign:"right"}}>Doluluk</th>
                    <th style={s.th}>Kaynak</th>
                  </tr>
                </thead>
                <tbody>
                  {aktifHY.filter(h=>h.q&&h.q.length>0).flatMap((h,hi)=>
                    h.q.map((q,qi)=>{
                      const isTHY=h.id==="thy";
                      const isYeni=q.d.includes("2026");
                      return (
                        <tr key={h.id+q.d} style={{background:(hi+qi)%2===0?"transparent":dk?"#ffffff06":"#f8fafc",outline:isYeni?`1px solid ${h.renk}30`:"none"}}>
                          {qi===0?(
                            <td style={{...s.td,fontWeight:600}} rowSpan={h.q.length}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <div style={{width:3,height:32,borderRadius:2,background:h.renk}}/>
                                <span>{isTHY?"⭐ ":""}{h.ad}</span>
                              </div>
                            </td>
                          ):null}
                          <td style={s.td}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <span style={s.tag(isYeni?h.renk:"#94a3b8")}>{q.d}</span>
                              {isYeni&&<span style={{fontSize:9,fontWeight:700,color:h.renk,background:h.renk+"18",padding:"1px 5px",borderRadius:4}}>YENİ</span>}
                            </div>
                          </td>
                          <td style={{...s.td,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{q.g!=null?`$${q.g.toFixed(1)}B`:"—"}</td>
                          <td style={{...s.td,textAlign:"right",fontWeight:600,color:q.nk>=0?"#10b981":"#ef4444",fontVariantNumeric:"tabular-nums"}}>{q.nk!=null?`${q.nk>=0?"+":""}$${Math.abs(q.nk).toFixed(2)}B`:"—"}</td>
                          <td style={{...s.td,textAlign:"right"}}>{q.p!=null?`${q.p.toFixed(1)}M`:"—"}</td>
                          <td style={{...s.td,textAlign:"right"}}>{q.lf!=null?`${q.lf.toFixed(1)}%`:"—"}</td>
                          <td style={s.td}><a href={q.url} target="_blank" rel="noopener" style={{fontSize:11,color:"#6366f1",textDecoration:"none"}}>↗</a></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div style={{fontSize:11,color:c.muted,marginTop:8}}>Emirates, Qatar ve Singapore Airlines çeyreklik rapor yayınlamaz. Tablo görünümüne geçerek yıllık verilerini inceleyebilirsiniz.</div>
          </div>}

          {/* FARK ANALİZİ */}
          <div style={s.card}>
            <div style={s.h2}>THY Rakip Fark Analizi — 2025</div>
            <div style={{fontSize:12,color:c.muted,marginBottom:12}}>↑ THY önde · ↓ Rakip önde · pp = yüzde puan</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr>
                  <th style={s.th}>Rakip</th>
                  <th style={{...s.th,textAlign:"right"}}>Gelir</th>
                  <th style={{...s.th,textAlign:"right"}}>Net Kâr</th>
                  <th style={{...s.th,textAlign:"right"}}>İşl. Marj</th>
                  <th style={{...s.th,textAlign:"right"}}>Yolcu</th>
                  <th style={{...s.th,textAlign:"right"}}>Doluluk</th>
                </tr></thead>
                <tbody>
                  {FIN.havayollari.filter(h=>h.id!=="thy").map((h,i)=>{
                    const thy=thyObj.yil["2025"], rak=h.yil["2025"];
                    const df=(k,B=true)=>{
                      if(!thy||!rak||thy[k]==null||rak[k]==null) return <span style={{color:c.muted}}>—</span>;
                      const d=thy[k]-rak[k]; const r=d>=0?"#10b981":"#ef4444";
                      return <span style={{color:r,fontWeight:600}}>{d>=0?"↑":"↓"}{B?`$${Math.abs(d).toFixed(1)}B`:`${Math.abs(d).toFixed(1)}pp`}</span>;
                    };
                    return (
                      <tr key={h.id} style={{background:i%2===0?"transparent":dk?"#ffffff06":"#f8fafc"}}>
                        <td style={s.td}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:h.renk}}/>{h.ad}</div></td>
                        <td style={{...s.td,textAlign:"right"}}>{df("g")}</td>
                        <td style={{...s.td,textAlign:"right"}}>{df("nk")}</td>
                        <td style={{...s.td,textAlign:"right"}}>{df("im",false)}</td>
                        <td style={{...s.td,textAlign:"right"}}>{df("p")}</td>
                        <td style={{...s.td,textAlign:"right"}}>{df("lf",false)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>}
      </main>

      {/* CHAT */}
      <button onClick={()=>setChatAcik(p=>!p)} style={{position:"fixed",bottom:24,right:24,width:50,height:50,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#0ea5e9)",border:"none",cursor:"pointer",fontSize:20,boxShadow:"0 4px 20px rgba(99,102,241,.4)",zIndex:200,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {chatAcik?"✕":"💬"}
      </button>
      {chatAcik&&(
        <div style={{position:"fixed",bottom:84,right:24,width:340,maxHeight:460,background:c.card,border:`1px solid ${c.bord}`,borderRadius:16,display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.15)",zIndex:200,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${c.bord}`,display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:600,fontSize:13}}>
            <span>✈️ Analiz Asistanı</span>
            <button style={{background:"none",border:"none",cursor:"pointer",color:c.muted,fontSize:16}} onClick={()=>setChatAcik(false)}>✕</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
            {chatM.map((m,i)=>(
              <div key={i} style={{padding:"8px 11px",borderRadius:m.r==="u"?"12px 12px 4px 12px":"12px 12px 12px 4px",background:m.r==="u"?"#6366f1":dk?"#0f172a":"#f1f5f9",color:m.r==="u"?"#fff":c.text,fontSize:13,lineHeight:1.55,maxWidth:"90%",alignSelf:m.r==="u"?"flex-end":"flex-start"}}>{m.t}</div>
            ))}
            {chatYuk&&<div style={{padding:"8px 11px",borderRadius:"12px 12px 12px 4px",background:dk?"#0f172a":"#f1f5f9",color:c.muted,fontSize:13}}>Yanıt hazırlanıyor…</div>}
            <div ref={chatRef}/>
          </div>
          <div style={{padding:"6px 10px",borderTop:`1px solid ${c.bord}50`,display:"flex",flexWrap:"wrap",gap:4}}>
            {["THY Q1 2026 değerlendirmesi","Rakiplere göre marj analizi","NDC dağıtımı durumu"].map(q=>(
              <button key={q} style={{padding:"3px 8px",borderRadius:10,border:`1px solid ${c.bord}`,background:"transparent",color:"#6366f1",fontSize:11,cursor:"pointer"}} onClick={()=>chatGonder(q)}>{q}</button>
            ))}
          </div>
          <div style={{padding:"10px 12px",borderTop:`1px solid ${c.bord}`,display:"flex",gap:8}}>
            <input style={{flex:1,padding:"7px 11px",borderRadius:8,border:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc",color:c.text,fontSize:13,outline:"none"}} placeholder="Soru sor…" value={chatG} onChange={e=>setChatG(e.target.value)} onKeyDown={e=>e.key==="Enter"&&chatGonder()}/>
            <button style={{padding:"7px 13px",borderRadius:8,border:"none",background:"#6366f1",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}} onClick={()=>chatGonder()}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
}
