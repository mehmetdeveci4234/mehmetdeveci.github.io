import { useState, useEffect, useRef, useCallback } from "react";

// ─── KUR API: exchangerate.host — CORS açık, key yok, TRY dahil ──────────────
const FX_API = "https://open.er-api.com/v6/latest/USD";

// ─── ENERJİ: sabit değerler (API sorunlu olduğunda fallback) ─────────────────
const ENERJI_FALLBACK = { brent: 72.4, jet: 82.1 };

// ─── FİNANSAL VERİLER ────────────────────────────────────────────────────────
const FINANSAL_DATA = {
  havayollari: [
    {
      id:"thy", ad:"Turkish Airlines", kod:"THYAO", bors:"BIST",
      renk:"#C8102E", mali_yil:"Ocak–Aralık", rapor_siklik:"Çeyreklik",
      ir_url:"https://investor.turkishairlines.com",
      aciklama:"İstanbul merkezli, 130+ ülkeye uçuş",
      yillar:{
        "2021":{gelir:10.8,isletme_kar:0.8, net_kar:0.5, yolcu:56.0,doluluk:70.1,isletme_marj:7.4, net_marj:4.6, filo:374,ask_buyume:null},
        "2022":{gelir:16.8,isletme_kar:2.6, net_kar:2.4, yolcu:71.4,doluluk:79.8,isletme_marj:15.5,net_marj:14.3,filo:411,ask_buyume:36.1},
        "2023":{gelir:20.5,isletme_kar:3.6, net_kar:3.0, yolcu:83.4,doluluk:82.3,isletme_marj:17.6,net_marj:14.6,filo:444,ask_buyume:16.2},
        "2024":{gelir:22.7,isletme_kar:4.18,net_kar:3.42,yolcu:90.2,doluluk:84.1,isletme_marj:18.4,net_marj:15.1,filo:492,ask_buyume:10.6},
        "2025":{gelir:24.1,isletme_kar:3.65,net_kar:2.90,yolcu:97.2,doluluk:84.8,isletme_marj:15.1,net_marj:12.0,filo:516,ask_buyume:7.5},
      },
      ceyrekler:{
        "Q3 2025":{gelir:7.0, net_kar:0.23,yolcu:26.1,doluluk:85.2},
        "Q2 2025":{gelir:6.3, net_kar:0.88,yolcu:24.8,doluluk:84.9},
        "Q1 2025":{gelir:4.8, net_kar:-0.1,yolcu:19.8,doluluk:82.1},
      },
    },
    {
      id:"emirates", ad:"Emirates", kod:"EK", bors:"Halka açık değil",
      renk:"#CC0001", mali_yil:"Nisan–Mart", rapor_siklik:"Yıllık/Yarıyıl",
      ir_url:"https://www.emirates.com/media-centre/",
      aciklama:"Dubai merkezli, en büyük uzun hat havayolu",
      not:"OP ayrıştırılmaz.",
      yillar:{
        "2021":{gelir:12.5,isletme_kar:null,net_kar:-3.8,yolcu:16.1,doluluk:56.8,isletme_marj:null,net_marj:null, filo:259,ask_buyume:null},
        "2022":{gelir:26.0,isletme_kar:null,net_kar:1.5, yolcu:45.7,doluluk:72.0,isletme_marj:null,net_marj:5.8, filo:259,ask_buyume:55.0},
        "2023":{gelir:32.6,isletme_kar:null,net_kar:4.7, yolcu:51.9,doluluk:78.4,isletme_marj:null,net_marj:14.4,filo:260,ask_buyume:16.0},
        "2024":{gelir:36.9,isletme_kar:null,net_kar:4.7, yolcu:52.1,doluluk:79.9,isletme_marj:null,net_marj:12.7,filo:261,ask_buyume:5.5},
        "2025":{gelir:39.6,isletme_kar:null,net_kar:5.19,yolcu:53.7,doluluk:78.9,isletme_marj:null,net_marj:14.9,filo:270,ask_buyume:4.0},
      },
    },
    {
      id:"lufthansa", ad:"Lufthansa Group", kod:"LHA", bors:"XETRA",
      renk:"#05164D", mali_yil:"Ocak–Aralık", rapor_siklik:"Çeyreklik",
      ir_url:"https://investor-relations.lufthansagroup.com",
      aciklama:"Lufthansa, SWISS, Austrian, Brussels, Eurowings, ITA",
      not:"EUR/USD≈1.08",
      yillar:{
        "2021":{gelir:17.8,isletme_kar:-1.7,net_kar:-2.2,yolcu:70.1, doluluk:65.1,isletme_marj:-9.6,net_marj:-12.4,filo:785,ask_buyume:null},
        "2022":{gelir:34.1,isletme_kar:1.5, net_kar:0.8, yolcu:102.6,doluluk:78.4,isletme_marj:4.4, net_marj:2.3, filo:775,ask_buyume:36.0},
        "2023":{gelir:38.8,isletme_kar:2.7, net_kar:1.7, yolcu:123.0,doluluk:82.2,isletme_marj:7.0, net_marj:4.4, filo:783,ask_buyume:18.2},
        "2024":{gelir:40.6,isletme_kar:1.78,net_kar:1.51,yolcu:130.7,doluluk:83.1,isletme_marj:4.4, net_marj:3.7, filo:800,ask_buyume:6.6},
        "2025":{gelir:42.7,isletme_kar:2.12,net_kar:1.40,yolcu:135.0,doluluk:83.2,isletme_marj:4.9, net_marj:3.3, filo:821,ask_buyume:4.0},
      },
      ceyrekler:{
        "Q1 2026":{gelir:9.2, net_kar:0.31,yolcu:33.2,doluluk:81.4},
        "Q4 2025":{gelir:9.8, net_kar:0.18,yolcu:31.1,doluluk:80.9},
        "Q3 2025":{gelir:12.1,net_kar:0.72,yolcu:38.4,doluluk:86.3},
      },
    },
    {
      id:"afklm", ad:"Air France-KLM", kod:"AF", bors:"Euronext",
      renk:"#002157", mali_yil:"Ocak–Aralık", rapor_siklik:"Çeyreklik",
      ir_url:"https://www.airfranceklm.com/en/investors",
      aciklama:"Air France, KLM ve Transavia",
      not:"EUR/USD≈1.08",
      yillar:{
        "2021":{gelir:15.5,isletme_kar:-0.5,net_kar:-0.9,yolcu:63.2, doluluk:68.1,isletme_marj:-3.2,net_marj:-5.8,filo:510,ask_buyume:null},
        "2022":{gelir:28.9,isletme_kar:1.3, net_kar:0.7, yolcu:88.1, doluluk:80.0,isletme_marj:4.5, net_marj:2.4, filo:522,ask_buyume:35.0},
        "2023":{gelir:32.5,isletme_kar:1.7, net_kar:0.9, yolcu:97.6, doluluk:86.4,isletme_marj:5.2, net_marj:2.8, filo:530,ask_buyume:12.5},
        "2024":{gelir:33.8,isletme_kar:1.72,net_kar:1.06,yolcu:98.0, doluluk:87.8,isletme_marj:5.1, net_marj:3.1, filo:541,ask_buyume:4.9},
        "2025":{gelir:35.6,isletme_kar:2.16,net_kar:1.84,yolcu:102.8,doluluk:87.2,isletme_marj:6.1, net_marj:5.2, filo:545,ask_buyume:4.9},
      },
      ceyrekler:{
        "Q4 2025":{gelir:8.1, net_kar:0.63,yolcu:24.9,doluluk:85.1},
        "Q3 2025":{gelir:9.8, net_kar:0.91,yolcu:28.6,doluluk:88.4},
        "Q2 2025":{gelir:8.4, net_kar:0.54,yolcu:26.1,doluluk:87.2},
      },
    },
    {
      id:"iag", ad:"IAG", kod:"IAG", bors:"LSE/BME",
      renk:"#1B3A6B", mali_yil:"Ocak–Aralık", rapor_siklik:"Çeyreklik",
      ir_url:"https://www.iairgroup.com/investors",
      aciklama:"British Airways, Iberia, Vueling, Aer Lingus",
      not:"EUR/USD≈1.08",
      yillar:{
        "2021":{gelir:11.8,isletme_kar:-0.8,net_kar:-2.9,yolcu:59.3, doluluk:66.3,isletme_marj:-6.8,net_marj:null, filo:520,ask_buyume:null},
        "2022":{gelir:23.0,isletme_kar:1.5, net_kar:0.9, yolcu:98.4, doluluk:82.0,isletme_marj:6.5, net_marj:3.9, filo:530,ask_buyume:40.5},
        "2023":{gelir:29.3,isletme_kar:3.5, net_kar:2.7, yolcu:116.0,doluluk:86.5,isletme_marj:11.9,net_marj:9.2, filo:540,ask_buyume:14.0},
        "2024":{gelir:32.1,isletme_kar:4.05,net_kar:3.24,yolcu:121.8,doluluk:86.8,isletme_marj:12.6,net_marj:10.1,filo:560,ask_buyume:7.8},
        "2025":{gelir:34.5,isletme_kar:4.28,net_kar:3.56,yolcu:127.5,doluluk:87.1,isletme_marj:12.4,net_marj:10.3,filo:571,ask_buyume:5.1},
      },
      ceyrekler:{
        "Q1 2026":{gelir:7.8, net_kar:0.61,yolcu:30.2,doluluk:84.8},
        "Q4 2025":{gelir:8.1, net_kar:0.74,yolcu:31.5,doluluk:85.2},
        "Q3 2025":{gelir:10.2,net_kar:1.42,yolcu:36.1,doluluk:88.1},
      },
    },
    {
      id:"qatar", ad:"Qatar Airways", kod:"QR", bors:"Halka açık değil",
      renk:"#5C0632", mali_yil:"Nisan–Mart", rapor_siklik:"Yıllık",
      ir_url:"https://www.qatarairways.com/en/pressreleases.html",
      aciklama:"Doha merkezli, Skytrax 5 yıldızlı",
      not:"Çeyreklik rapor yok.",
      yillar:{
        "2021":{gelir:7.4, isletme_kar:null,net_kar:-1.9,yolcu:22.7,doluluk:53.3,isletme_marj:null,net_marj:null,filo:228,ask_buyume:null},
        "2022":{gelir:17.7,isletme_kar:null,net_kar:1.5, yolcu:34.2,doluluk:72.0,isletme_marj:null,net_marj:8.5, filo:237,ask_buyume:null},
        "2023":{gelir:21.1,isletme_kar:null,net_kar:1.7, yolcu:40.0,doluluk:83.0,isletme_marj:null,net_marj:8.1, filo:250,ask_buyume:null},
        "2024":{gelir:22.2,isletme_kar:null,net_kar:2.15,yolcu:43.1,doluluk:85.0,isletme_marj:null,net_marj:9.7, filo:261,ask_buyume:4.0},
        "2025":{gelir:23.6,isletme_kar:null,net_kar:1.94,yolcu:41.8,doluluk:84.0,isletme_marj:null,net_marj:8.2, filo:262,ask_buyume:null},
      },
    },
    {
      id:"delta", ad:"Delta Air Lines", kod:"DAL", bors:"NYSE",
      renk:"#003366", mali_yil:"Ocak–Aralık", rapor_siklik:"Çeyreklik",
      ir_url:"https://ir.delta.com",
      aciklama:"ABD'nin en büyük havayolu grubu, Atlanta hub",
      yillar:{
        "2021":{gelir:29.9,isletme_kar:1.0, net_kar:-0.3,yolcu:164.0,doluluk:78.0,isletme_marj:3.3, net_marj:-1.0,filo:950,ask_buyume:null},
        "2022":{gelir:50.6,isletme_kar:3.7, net_kar:1.3, yolcu:192.0,doluluk:83.0,isletme_marj:7.3, net_marj:2.6, filo:980,ask_buyume:null},
        "2023":{gelir:58.0,isletme_kar:5.6, net_kar:4.6, yolcu:200.0,doluluk:84.8,isletme_marj:9.7, net_marj:7.9, filo:1002,ask_buyume:null},
        "2024":{gelir:61.6,isletme_kar:5.8, net_kar:3.5, yolcu:204.0,doluluk:85.2,isletme_marj:9.4, net_marj:5.7, filo:1010,ask_buyume:null},
        "2025":{gelir:62.9,isletme_kar:5.5, net_kar:3.2, yolcu:205.0,doluluk:85.1,isletme_marj:8.7, net_marj:5.1, filo:1025,ask_buyume:null},
      },
      ceyrekler:{
        "Q1 2026":{gelir:14.0,net_kar:0.24,yolcu:50.1,doluluk:83.2},
        "Q4 2025":{gelir:15.6,net_kar:0.82,yolcu:51.2,doluluk:84.1},
        "Q3 2025":{gelir:16.7,net_kar:1.28,yolcu:54.8,doluluk:86.4},
      },
    },
    {
      id:"united", ad:"United Airlines", kod:"UAL", bors:"NASDAQ",
      renk:"#0066CC", mali_yil:"Ocak–Aralık", rapor_siklik:"Çeyreklik",
      ir_url:"https://ir.united.com",
      aciklama:"Chicago O'Hare ve Newark hub'lı global taşıyıcı",
      yillar:{
        "2022":{gelir:44.9,isletme_kar:3.4, net_kar:0.7, yolcu:165.0,doluluk:82.8,isletme_marj:7.6, net_marj:1.6, filo:921,ask_buyume:null},
        "2023":{gelir:53.7,isletme_kar:5.2, net_kar:2.6, yolcu:173.0,doluluk:83.7,isletme_marj:9.7, net_marj:4.8, filo:941,ask_buyume:null},
        "2024":{gelir:57.1,isletme_kar:4.8, net_kar:3.2, yolcu:177.0,doluluk:84.4,isletme_marj:8.4, net_marj:5.6, filo:962,ask_buyume:null},
        "2025":{gelir:59.4,isletme_kar:5.1, net_kar:3.8, yolcu:180.0,doluluk:84.8,isletme_marj:8.6, net_marj:6.4, filo:978,ask_buyume:null},
      },
      ceyrekler:{
        "Q1 2026":{gelir:13.2,net_kar:0.33,yolcu:42.8,doluluk:82.9},
        "Q4 2025":{gelir:14.7,net_kar:0.89,yolcu:44.1,doluluk:83.6},
        "Q3 2025":{gelir:16.8,net_kar:1.51,yolcu:50.2,doluluk:86.1},
      },
    },
    {
      id:"singapore", ad:"Singapore Airlines", kod:"SIA", bors:"SGX",
      renk:"#004B87", mali_yil:"Nisan–Mart", rapor_siklik:"Yarıyıl",
      ir_url:"https://www.singaporeair.com/en_UK/us/about-us/investor-relations/",
      aciklama:"Changi merkezli premium taşıyıcı; SilkAir ve Scoot dahil",
      not:"SGD/USD≈0.74",
      yillar:{
        "2022":{gelir:10.5,isletme_kar:0.8, net_kar:0.9, yolcu:22.4,doluluk:68.2,isletme_marj:7.6, net_marj:8.6, filo:180,ask_buyume:null},
        "2023":{gelir:15.7,isletme_kar:2.1, net_kar:2.2, yolcu:38.7,doluluk:85.1,isletme_marj:13.4,net_marj:14.0,filo:193,ask_buyume:null},
        "2024":{gelir:17.0,isletme_kar:2.4, net_kar:2.0, yolcu:41.5,doluluk:86.0,isletme_marj:14.1,net_marj:11.8,filo:201,ask_buyume:null},
        "2025":{gelir:17.8,isletme_kar:2.3, net_kar:1.9, yolcu:43.2,doluluk:86.4,isletme_marj:12.9,net_marj:10.7,filo:208,ask_buyume:null},
      },
    },
  ],
};

const KATEGORILER = [
  {id:"tumu",label:"Tümü"},{id:"gds_ndc",label:"GDS & NDC"},
  {id:"one_order",label:"ONE Order"},{id:"teknoloji",label:"Teknoloji"},
  {id:"yeni_hat",label:"Yeni Hat"},{id:"ortaklik",label:"Ortaklık"},
  {id:"finansal",label:"Finansal"},{id:"duzenleyici",label:"Düzenleyici"},
  {id:"diger",label:"Diğer"},
];

const HABERLER = [
  {id:1,  tarih:"2026-06-10", baslik:"Amadeus NDC rezervasyonları 500 milyon sınırını aştı", ozet:"Amadeus, NDC tabanlı rezervasyon hacminin 500 milyon bandını geçtiğini açıkladı. Havayolu ortaklarıyla imzalanan içerik anlaşmaları dağıtım gelirlerini %18 artırdı. Şirket, 2027 sonuna kadar NDC oranını %50'ye taşımayı hedefliyor.", kategori:"gds_ndc", havayolu:"Amadeus", kaynaklar:[{ad:"Amadeus IR",url:"https://amadeus.com"},{ad:"PhocusWire",url:"https://phocuswire.com"}], analizli:true},
  {id:2,  tarih:"2026-06-09", baslik:"Turkish Airlines Sabre acentelerine NDC teşvik paketi başlattı", ozet:"THY, Sabre GDS üzerinden yapılan NDC rezervasyonlarına ek komisyon, erken koltuk seçimi ve öncelikli check-in hakkı tanıdı. Program Türkiye ve 14 Avrupa pazarında geçerli.", kategori:"gds_ndc", havayolu:"Turkish Airlines", kaynaklar:[{ad:"THY Newsroom",url:"https://turkishairlines.com"},{ad:"Travel Weekly",url:"https://travelweekly.com"}], analizli:true},
  {id:3,  tarih:"2026-06-09", baslik:"IATA ONE Order standardına geçen havayolu sayısı 60'ı aştı", ozet:"IATA, ONE Order sertifikasyonunu tamamlayan havayolu sayısının 60'a ulaştığını duyurdu. Wizz Air, Avrupa'da ONE Order'a geçen ilk LCC olurken Finnair ve TAP da sertifikasyon sürecini tamamladı.", kategori:"one_order", havayolu:"Tümü", kaynaklar:[{ad:"IATA",url:"https://iata.org"},{ad:"PhocusWire",url:"https://phocuswire.com"}], analizli:true},
  {id:4,  tarih:"2026-06-08", baslik:"Lufthansa Group 2025'te €39,6 milyar rekor gelir açıkladı", ozet:"Lufthansa Group'un düzeltilmiş EBIT'i %19 büyüyerek 2 milyar Euro'ya ulaştı. 135 milyon yolcu taşındı. Öte yandan çekirdek Lufthansa markasının marjı %0,9 ile neredeyse başa baş kapandı.", kategori:"finansal", havayolu:"Lufthansa", kaynaklar:[{ad:"Lufthansa AR 2025",url:"https://report.lufthansagroup.com/2025/annual-report/en/"},{ad:"Aviation Week",url:"https://aviationweek.com"}], analizli:true},
  {id:5,  tarih:"2026-06-08", baslik:"Sabre NDC içerik platformunu yeniden yapılandırdı", ozet:"Sabre, SynXis Air platformunu tüm GDS müşterilerine açtı. Yeni mimari, havayollarının dinamik fiyat tekliflerini milisaniye içinde dağıtmasına imkân tanıyor. Travelport ile rekabet kızışıyor.", kategori:"gds_ndc", havayolu:"Sabre", kaynaklar:[{ad:"Sabre Newsroom",url:"https://sabre.com"},{ad:"The Beat",url:"https://thebeat.travel"}], analizli:false},
  {id:6,  tarih:"2026-06-07", baslik:"IATA Mayıs 2026: Küresel RPK büyümesi %9,2 ile beklentileri aştı", ozet:"IATA verilerine göre Mayıs 2026 küresel yolcu talebi yıllık %9,2 arttı. Asya-Pasifik %14,1 ile en hızlı büyüyen bölge. Küresel doluluk oranı %83,7 ile son 5 yılın zirvesinde.", kategori:"finansal", havayolu:"Tümü", kaynaklar:[{ad:"IATA Market Analysis",url:"https://iata.org"}], analizli:true},
  {id:7,  tarih:"2026-06-07", baslik:"Emirates–Amadeus çok yıllı NDC dağıtım anlaşması yenilendi", ozet:"Emirates, Amadeus platformu üzerinden tam NDC içerik paritesi ve dinamik paket fiyatlaması için yeni çok yıllı anlaşma imzaladı. Anlaşma premium sınıf tekliflerini de kapsıyor.", kategori:"ortaklik", havayolu:"Emirates", kaynaklar:[{ad:"Emirates Newsroom",url:"https://emirates.com"},{ad:"Amadeus Newsroom",url:"https://amadeus.com"}], analizli:true},
  {id:8,  tarih:"2026-06-06", baslik:"Travelport yapay zeka arama motorunu tüm GDS müşterilerine açtı", ozet:"Travelport'un Smartpoint Cloud platformuna entegre AI destekli arama ve fiyatlama motoru, işlem süresini %60 kısalttı. Motor, çok değişkenli tarife karşılaştırmasını gerçek zamanlı yapıyor.", kategori:"teknoloji", havayolu:"Travelport", kaynaklar:[{ad:"Travelport PR",url:"https://travelport.com"},{ad:"Skift",url:"https://skift.com"}], analizli:false},
  {id:9,  tarih:"2026-06-06", baslik:"Turkish Airlines İstanbul–Bogotá direkt seferini başlattı", ozet:"THY, İstanbul'dan Bogotá'ya haftada 4 sefer olarak başlattığı direkt uçuşla Latin Amerika ağını genişletti. Bu hat, Türkiye ile Kolombiya arasındaki ilk direkt bağlantı.", kategori:"yeni_hat", havayolu:"Turkish Airlines", kaynaklar:[{ad:"THY Newsroom",url:"https://turkishairlines.com"},{ad:"Simple Flying",url:"https://simpleflying.com"}], analizli:false},
  {id:10, tarih:"2026-06-05", baslik:"AB Havacılık Otoritesi GDS şeffaflık yönetmeliği taslağını yayımladı", ozet:"EASA, havayolu–GDS dağıtım anlaşmalarında içerik eşitliği ve ücret şeffaflığını zorunlu kılacak taslak yönetmeliği yayımladı. 2027 yürürlük tarihi hedefleniyor. Sabre ve Amadeus lobi faaliyetleri başlattı.", kategori:"duzenleyici", havayolu:"Tümü", kaynaklar:[{ad:"EASA",url:"https://easa.europa.eu"},{ad:"PhocusWire",url:"https://phocuswire.com"}], analizli:true},
  {id:11, tarih:"2026-06-05", baslik:"Air France-KLM 2025'te 102,8 milyon yolcuyla COVID sonrası rekor kırdı", ozet:"Grup 2025 yılında €33 milyar rekor gelir ve €2 milyar işletme kârı açıkladı. Transavia ise %15 kapasite büyümesine karşın zarar etti.", kategori:"finansal", havayolu:"Air France-KLM", kaynaklar:[{ad:"AF-KLM FY2025 PR",url:"https://airfranceklm.com"},{ad:"The Engine Cowl",url:"https://enginecowl.com"}], analizli:true},
  {id:12, tarih:"2026-06-04", baslik:"Air France-KLM Sabre NDC tam entegrasyonunu tamamladı", ozet:"AF-KLM, Sabre GDS üzerinden sunulan NDC içeriğinin tam içerik paritesine ulaştığını açıkladı. 430.000'den fazla Sabre acentesi tüm tarife ve ürün seçeneklerine erişebilecek.", kategori:"gds_ndc", havayolu:"Air France-KLM", kaynaklar:[{ad:"AF-KLM Press",url:"https://airfranceklm.com"},{ad:"Sabre News",url:"https://sabre.com"}], analizli:true},
  {id:13, tarih:"2026-06-04", baslik:"Lufthansa Grubu Frankfurt–Kuala Lumpur direkt seferini yeniden başlatıyor", ozet:"Lufthansa, pandemi döneminde durdurulan Frankfurt–KUL hattını Ekim 2026'dan itibaren haftada 5 sefer olarak yeniden açıyor. Yeni sefer A350-900 ile işletilecek.", kategori:"yeni_hat", havayolu:"Lufthansa", kaynaklar:[{ad:"Lufthansa PR",url:"https://lufthansa.com"},{ad:"Simple Flying",url:"https://simpleflying.com"}], analizli:false},
  {id:14, tarih:"2026-06-03", baslik:"IATA NDC standardının versiyon 21.3 güncellemesi yayımlandı", ozet:"IATA, NDC standardının 21.3 sürümünü yayımladı. Güncelleme, grup rezervasyonları ve interline teklifler için yeni şema tanımları içeriyor. Havayollarına geçiş için 18 aylık süre tanındı.", kategori:"one_order", havayolu:"Tümü", kaynaklar:[{ad:"IATA NDC",url:"https://iata.org"},{ad:"PhocusWire",url:"https://phocuswire.com"}], analizli:false},
  {id:15, tarih:"2026-06-03", baslik:"Singapore Airlines AI fiyatlama motorunu 12 pazara yaydı", ozet:"Singapore Airlines, bireysel yolcu profiline göre dinamik teklif sunan AI fiyatlama motorunu 12 pazarda devreye aldı. İlk sonuçlar dönüşüm oranında %31 artış gösteriyor. Motor Amadeus NDC altyapısı üzerinde çalışıyor.", kategori:"teknoloji", havayolu:"Singapore Airlines", kaynaklar:[{ad:"SIA Media Hub",url:"https://singaporeair.com"},{ad:"Skift",url:"https://skift.com"}], analizli:true},
  {id:16, tarih:"2026-06-02", baslik:"Delta Air Lines Q1 2026 sonuçları: Gelir beklentilerin altında kaldı", ozet:"Delta, Q1 2026'da 14 milyar dolar gelir açıkladı, ancak tarife baskısı net kârı geçen yılın aynı dönemine göre %41 düşürdü. Şirket tüm yıl yönlendirmesini korudu.", kategori:"finansal", havayolu:"Delta", kaynaklar:[{ad:"Delta IR",url:"https://ir.delta.com"},{ad:"Aviation Week",url:"https://aviationweek.com"}], analizli:true},
  {id:17, tarih:"2026-06-02", baslik:"Ryanair B737 MAX 10 siparişiyle filosunu 100 uçak daha genişletiyor", ozet:"Ryanair, Boeing ile imzalanan ek sipariş anlaşmasıyla 2028'e kadar 100 yeni uçak teslim alacak. Yeni uçaklar %20 daha az yakıt tüketiyor.", kategori:"diger", havayolu:"Ryanair", kaynaklar:[{ad:"Ryanair IR",url:"https://ryanair.com"},{ad:"Simple Flying",url:"https://simpleflying.com"}], analizli:false},
  {id:18, tarih:"2026-06-01", baslik:"Amadeus ve IATA ONE Order entegrasyonunu tamamladı", ozet:"Amadeus, ONE Order standardının tüm GDS müşterileri için kullanıma açıldığını duyurdu. Bilet, otel, transfer ve sigorta tek sipariş kaydında birleştirilebiliyor.", kategori:"one_order", havayolu:"Amadeus", kaynaklar:[{ad:"Amadeus Newsroom",url:"https://amadeus.com"},{ad:"IATA",url:"https://iata.org"}], analizli:true},
  {id:19, tarih:"2026-05-31", baslik:"United Airlines İstanbul–Newark hattında kapasite artışına gidiyor", ozet:"United Airlines, İstanbul–Newark hattındaki sefer sayısını günlük 1'den haftada 10'a çıkarıyor. Bu karar, THY ile rekabetin kızıştığına işaret ediyor.", kategori:"yeni_hat", havayolu:"United Airlines", kaynaklar:[{ad:"United IR",url:"https://ir.united.com"},{ad:"The Points Guy",url:"https://thepointsguy.com"}], analizli:false},
  {id:20, tarih:"2026-05-30", baslik:"AB Komisyonu havacılık dijital tek pazar direktifini yayımladı", ozet:"Avrupa Komisyonu, havacılık dağıtımında API standardizasyonu ve veri taşınabilirliğini zorunlu kılacak direktifi yayımladı. Direktif, GDS ve havayolu rezervasyon sistemlerini etkiliyor.", kategori:"duzenleyici", havayolu:"Tümü", kaynaklar:[{ad:"EC Transport",url:"https://ec.europa.eu"},{ad:"PhocusWire",url:"https://phocuswire.com"}], analizli:true},
  {id:21, tarih:"2026-05-29", baslik:"Travelport–Etihad NDC anlaşması: Kişiselleştirilmiş teklifler devrede", ozet:"Etihad Airways ve Travelport, kişiselleştirilmiş dinamik paket tekliflerini mümkün kılan NDC anlaşmasını devreye aldı. İlk aşamada 3 pazar pilot olarak seçildi.", kategori:"ortaklik", havayolu:"Etihad", kaynaklar:[{ad:"Travelport PR",url:"https://travelport.com"},{ad:"Travel Weekly",url:"https://travelweekly.com"}], analizli:false},
  {id:22, tarih:"2026-05-28", baslik:"IAG Q1 2026: Güçlü transatlantik talep kârlılığı destekledi", ozet:"IAG, Q1 2026'da €7,8 milyar gelir ve €610 milyon net kâr açıkladı. İspanya–ABD transatlantik hatlarında doluluk %88'i aştı. British Airways premium cabin dolulukları rekor kırdı.", kategori:"finansal", havayolu:"IAG", kaynaklar:[{ad:"IAG IR",url:"https://iairgroup.com"},{ad:"The Engine Cowl",url:"https://enginecowl.com"}], analizli:true},
];

const RAPORLAR = [
  {id:1, baslik:"IATA Aylık Yolcu Analizi — Mayıs 2026", tarih:"Haziran 2026", ozet:"Küresel RPK büyümesi beklentileri aştı. Asya-Pasifik %14,1 ile en hızlı büyüyen bölge.", url:"https://iata.org", etiket:"IATA"},
  {id:2, baslik:"Amadeus Dağıtım Endeksi Q1 2026", tarih:"Nisan 2026", ozet:"NDC içerik büyümesi ivmelendi. GDS NDC rezervasyonları %42 arttı.", url:"https://amadeus.com", etiket:"Amadeus"},
  {id:3, baslik:"Phocuswright: Havacılık Dağıtım Panosu 2026", tarih:"Mayıs 2026", ozet:"Havayollarının doğrudan gelir payı %51'i aştı. NDC penetrasyon ~%34.", url:"https://phocuswright.com", etiket:"Phocuswright"},
  {id:4, baslik:"IATA ONE Order Durum Raporu H1 2026", tarih:"Haziran 2026", ozet:"60 havayolu ONE Order sertifikasyonunu tamamladı. 2027 hedefi 120.", url:"https://iata.org", etiket:"IATA"},
  {id:5, baslik:"Skift Megatrend: NDC'nin 5 Yılı", tarih:"Mayıs 2026", ozet:"2021–2026 arasında NDC'nin dağıtım yapısını nasıl değiştirdiğinin analizi.", url:"https://skift.com", etiket:"Skift"},
];

const ENDEKSLER = [
  {label:"IATA Küresel RPK",deger:"+9,2%",birim:"Mayıs 2026 · yıllık",renk:"#10b981",aciklama:"Revenue Passenger Kilometers"},
  {label:"Küresel ASK",deger:"+7,4%",birim:"Mayıs 2026 · yıllık",renk:"#6366f1",aciklama:"Available Seat Kilometers"},
  {label:"Küresel Doluluk",deger:"83,7%",birim:"PLF · Mayıs 2026",renk:"#f59e0b",aciklama:"Passenger Load Factor"},
  {label:"NDC Penetrasyon",deger:"~34%",birim:"Tahmin · 2026",renk:"#8b5cf6",aciklama:"Toplam bilet satışlarında NDC payı"},
];

// ─── CANLÖ KUR HOOK ───────────────────────────────────────────────────────────
function usePiyasa() {
  const [veri, setVeri] = useState({
    usdtry:null,eurtry:null,usdeur:null,
    brent:ENERJI_FALLBACK.brent,jet:ENERJI_FALLBACK.jet,
    usdtry_prev:null,eurtry_prev:null,usdeur_prev:null,
    son_guncelleme:null,yukleniyor:true,hata:null,
  });

  const cek = useCallback(async () => {
    setVeri(p=>({...p,yukleniyor:true,hata:null}));
    try {
      const res = await fetch(FX_API);
      if (!res.ok) throw new Error("HTTP "+res.status);
      const d = await res.json();
      if (d.result !== "success") throw new Error("API error");
      const r = d.rates;
      const usdtry = r.TRY ?? null;
      const usdeur = r.EUR ?? null;
      const eurtry = (usdtry && usdeur) ? usdtry / usdeur : null;
      setVeri({
        usdtry, eurtry, usdeur,
        usdtry_prev:null, eurtry_prev:null, usdeur_prev:null,
        brent: ENERJI_FALLBACK.brent,
        jet:   ENERJI_FALLBACK.jet,
        son_guncelleme: new Date().toLocaleTimeString("tr-TR"),
        yukleniyor:false, hata:null,
      });
    } catch(e) {
      setVeri(p=>({...p,yukleniyor:false,hata:"Kur verisi alınamadı"}));
    }
  }, []);

  useEffect(()=>{
    cek();
    const iv = setInterval(cek, 5*60*1000);
    return ()=>clearInterval(iv);
  },[cek]);

  return {...veri, yenile:cek};
}

// ─── PİYASA BANTI ─────────────────────────────────────────────────────────────
function PiyasaBanti({p,dk}) {
  const bord = dk?"#334155":"#e2e8f0";
  const muted = "#94a3b8";
  const text = dk?"#e2e8f0":"#1e293b";
  const cardBg = dk?"#1e293b":"#ffffff";

  const items = [
    {label:"USD/TRY", val:p.usdtry,  fmt:v=>`₺${v.toFixed(2)}`, aciklama:"Günlük · ER-API"},
    {label:"EUR/TRY", val:p.eurtry,  fmt:v=>`₺${v.toFixed(2)}`, aciklama:"Hesaplanan"},
    {label:"USD/EUR", val:p.usdeur,  fmt:v=>`€${v.toFixed(4)}`, aciklama:"Günlük · ECB"},
    {label:"Brent",   val:p.brent,   fmt:v=>`$${v.toFixed(1)}/bbl`, aciklama:"$/varil · EIA est."},
    {label:"Jet Yakıtı", val:p.jet,  fmt:v=>`$${v.toFixed(1)}/bbl`, aciklama:"$/bbl equiv. · EIA est."},
  ];

  return (
    <div style={{background:cardBg,borderBottom:`1px solid ${bord}`,padding:"0 20px"}}>
      <div style={{maxWidth:1300,margin:"0 auto",display:"flex",flexWrap:"wrap",alignItems:"stretch",gap:0}}>
        {p.yukleniyor ? (
          <div style={{padding:"10px 0",fontSize:12,color:muted}}>⟳ Yükleniyor…</div>
        ) : p.hata ? (
          <div style={{padding:"10px 0",fontSize:12,color:"#ef4444",display:"flex",alignItems:"center",gap:8}}>
            ⚠ {p.hata}
            <button onClick={p.yenile} style={{fontSize:11,background:"transparent",border:"1px solid #ef4444",color:"#ef4444",padding:"2px 8px",borderRadius:6,cursor:"pointer"}}>Yenile</button>
          </div>
        ) : (
          items.map((item,i)=>(
            <div key={item.label} style={{padding:"8px 16px 8px 0",marginRight:16,borderRight:i<items.length-1?`1px solid ${bord}`:"none",display:"flex",flexDirection:"column",justifyContent:"center",minWidth:110}}>
              <div style={{fontSize:10,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>{item.label}</div>
              <div style={{fontSize:15,fontWeight:800,color:text,letterSpacing:"-0.5px",fontVariantNumeric:"tabular-nums"}}>
                {item.val!=null ? item.fmt(item.val) : "—"}
              </div>
              <div style={{fontSize:10,color:muted}}>{item.aciklama}</div>
            </div>
          ))
        )}
        {!p.yukleniyor&&!p.hata&&(
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,fontSize:11,color:muted}}>
            <span>⟳ {p.son_guncelleme}</span>
            <button onClick={p.yenile} style={{background:"transparent",border:`1px solid ${bord}`,color:muted,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11}}>Yenile</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({vals,renk,h=28,w=80}) {
  const t=vals.filter(v=>v!=null&&v!==undefined);
  if(t.length<2) return <span style={{color:"#94a3b8",fontSize:11}}>—</span>;
  const mn=Math.min(...t),mx=Math.max(...t),rng=mx-mn||1;
  const step=w/(t.length-1);
  const pts=t.map((v,i)=>`${(i*step).toFixed(1)},${(h-((v-mn)/rng)*h).toFixed(1)}`).join(" ");
  const lx=(t.length-1)*step,ly=h-((t[t.length-1]-mn)/rng)*h;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={renk} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={lx} cy={ly} r="2.5" fill={renk}/>
    </svg>
  );
}

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function App() {
  const [tema,setTema]=useState("acik");
  const [sekme,setSekme]=useState("haberler");
  const [kategori,setKategori]=useState("tumu");
  const [havayolu,setHavayolu]=useState("Tümü");
  const [arama,setArama]=useState("");
  const [analizliOnly,setAnalizliOnly]=useState(false);
  const [finMetrik,setFinMetrik]=useState("gelir");
  const [finYillar,setFinYillar]=useState(["2023","2024","2025"]);
  const [secilenHY,setSecilenHY]=useState(FINANSAL_DATA.havayollari.map(h=>h.id));
  const [finGoster,setFinGoster]=useState("yillik");
  const [chatAcik,setChatAcik]=useState(false);
  const [chatMsj,setChatMsj]=useState([{rol:"asistan",icerik:"Ticari takip portalına hoş geldiniz. Havacılık finansalları, GDS/NDC gelişmeleri veya sektör haberleri hakkında soru sorabilirsiniz."}]);
  const [chatGiris,setChatGiris]=useState("");
  const [chatYuk,setChatYuk]=useState(false);
  const chatRef=useRef(null);
  const piyasa=usePiyasa();
  const dk=tema==="karanlik";

  const c={bg:dk?"#0f172a":"#f8fafc",card:dk?"#1e293b":"#ffffff",bord:dk?"#334155":"#e2e8f0",text:dk?"#e2e8f0":"#1e293b",sub:dk?"#94a3b8":"#475569",muted:"#94a3b8"};

  useEffect(()=>{chatRef.current?.scrollIntoView({behavior:"smooth"});},[chatMsj]);

  async function chatGonder(soru) {
    const m=soru||chatGiris.trim(); if(!m) return;
    setChatGiris(""); setChatMsj(p=>[...p,{rol:"kullanici",icerik:m}]); setChatYuk(true);
    const ctx=FINANSAL_DATA.havayollari.map(h=>`${h.ad} 2025: Gelir $${h.yillar["2025"]?.gelir}B, NetKâr $${h.yillar["2025"]?.net_kar}B, Yolcu ${h.yillar["2025"]?.yolcu}M`).join("\n");
    const px=piyasa.usdtry?`USD/TRY=${piyasa.usdtry?.toFixed(2)}, EUR/TRY=${piyasa.eurtry?.toFixed(2)}`:"";;
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:600,
        system:`Sen THY üst yönetimine sunum yapan havacılık analistisin. Kısa, öz Türkçe yanıt ver.\nFinansallar:\n${ctx}\nPiyasa: ${px}`,
        messages:[{role:"user",content:m}]
      })});
      const d=await res.json();
      setChatMsj(p=>[...p,{rol:"asistan",icerik:d.content?.[0]?.text||"Yanıt alınamadı."}]);
    } catch { setChatMsj(p=>[...p,{rol:"asistan",icerik:"Hata oluştu."}]); }
    finally { setChatYuk(false); }
  }

  const filtreli=HABERLER.filter(h=>{
    if(kategori!=="tumu"&&h.kategori!==kategori) return false;
    if(havayolu!=="Tümü"&&h.havayolu!==havayolu) return false;
    if(analizliOnly&&!h.analizli) return false;
    if(arama){const q=arama.toLowerCase();if(!h.baslik.toLowerCase().includes(q)&&!h.ozet.toLowerCase().includes(q)) return false;}
    return true;
  });

  const metrикler={
    gelir:       {label:"Toplam Gelir (USD B)",  fmt:v=>v!=null?`$${v.toFixed(1)}B`:"—",  renk:"#6366f1"},
    net_kar:     {label:"Net Kâr (USD B)",       fmt:v=>v!=null?`$${v.toFixed(2)}B`:"—",  renk:"#10b981"},
    isletme_kar: {label:"EBIT (USD B)",          fmt:v=>v!=null?`$${v.toFixed(2)}B`:"—",  renk:"#0ea5e9"},
    isletme_marj:{label:"İşl. Marjı %",         fmt:v=>v!=null?`${v.toFixed(1)}%`:"—",   renk:"#f59e0b"},
    net_marj:    {label:"Net Marj %",           fmt:v=>v!=null?`${v.toFixed(1)}%`:"—",   renk:"#8b5cf6"},
    yolcu:       {label:"Yolcu (M)",            fmt:v=>v!=null?`${v.toFixed(1)}M`:"—",   renk:"#ef4444"},
    doluluk:     {label:"Doluluk PLF %",        fmt:v=>v!=null?`${v.toFixed(1)}%`:"—",   renk:"#14b8a6"},
    filo:        {label:"Filo (uçak)",          fmt:v=>v!=null?`${v}`:"—",               renk:"#f97316"},
  };

  const aktifHY=FINANSAL_DATA.havayollari.filter(h=>secilenHY.includes(h.id));
  const thyObj=FINANSAL_DATA.havayollari.find(h=>h.id==="thy");
  const katRenk={gds_ndc:"#6366f1",one_order:"#0ea5e9",teknoloji:"#06b6d4",yeni_hat:"#10b981",ortaklik:"#8b5cf6",finansal:"#ef4444",duzenleyici:"#f59e0b",diger:"#94a3b8"};

  const s={
    app:{minHeight:"100vh",background:c.bg,color:c.text,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",fontSize:14},
    hdr:{background:c.card,borderBottom:`1px solid ${c.bord}`,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,position:"sticky",top:0,zIndex:100},
    nav:{background:c.card,borderBottom:`1px solid ${c.bord}`,padding:"0 20px",display:"flex",gap:4,overflowX:"auto",position:"sticky",top:50,zIndex:99},
    tab:a=>({padding:"10px 14px",cursor:"pointer",border:"none",background:"transparent",color:a?"#6366f1":c.muted,fontWeight:a?600:400,fontSize:13,borderBottom:a?"2px solid #6366f1":"2px solid transparent",whiteSpace:"nowrap"}),
    main:{maxWidth:1300,margin:"0 auto",padding:"20px 16px"},
    card:{background:c.card,border:`1px solid ${c.bord}`,borderRadius:12,padding:20,marginBottom:14},
    btn:(a,r="#6366f1")=>({padding:"5px 12px",borderRadius:8,border:`1px solid ${a?r:c.bord}`,background:a?r:"transparent",color:a?"#fff":c.muted,fontSize:12,fontWeight:a?600:400,cursor:"pointer"}),
    chip:a=>({padding:"5px 12px",borderRadius:20,border:`1px solid ${a?"#6366f1":c.bord}`,background:a?"#6366f1":"transparent",color:a?"#fff":c.muted,fontSize:12,fontWeight:a?600:400,cursor:"pointer"}),
    th:{padding:"9px 12px",textAlign:"left",fontWeight:600,color:c.muted,fontSize:11,textTransform:"uppercase",letterSpacing:"0.4px",whiteSpace:"nowrap",borderBottom:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc"},
    td:{padding:"10px 12px",borderBottom:`1px solid ${c.bord}50`,verticalAlign:"middle"},
    tag:r=>({fontSize:11,fontWeight:600,color:r,background:r+"18",padding:"2px 8px",borderRadius:6,whiteSpace:"nowrap"}),
    h2:{fontSize:16,fontWeight:700,marginBottom:14,letterSpacing:"-0.3px"},
    info:{background:dk?"#1e293b90":"#f0f9ff",border:`1px solid ${dk?"#334155":"#bae6fd"}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:dk?"#7dd3fc":"#0369a1",marginBottom:14},
  };

  const TUMU_HY=["Tümü",...new Set(HABERLER.map(h=>h.havayolu))].filter(Boolean);

  return (
    <div style={s.app}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <header style={s.hdr}>
        <div style={{display:"flex",alignItems:"center",gap:10,fontWeight:700,fontSize:15,letterSpacing:"-0.3px"}}>
          <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✈️</div>
          <span>Ticari Takip Portalı</span>
          <span style={{fontSize:10,fontWeight:700,background:"#6366f1",color:"#fff",padding:"2px 7px",borderRadius:10}}>BETA</span>
        </div>
        <button style={s.btn(false)} onClick={()=>setTema(dk?"acik":"karanlik")}>{dk?"☀️":"🌙"}</button>
      </header>

      {/* PİYASA BANTI */}
      <PiyasaBanti p={piyasa} dk={dk}/>

      {/* NAV */}
      <nav style={s.nav}>
        {[
          {id:"haberler",    label:"📰 Haberler"},
          {id:"gostergeler", label:"📈 Göstergeler & Raporlar"},
          {id:"finansallar", label:"📊 Sektörel Finansallar"},
        ].map(t=><button key={t.id} style={s.tab(sekme===t.id)} onClick={()=>setSekme(t.id)}>{t.label}</button>)}
      </nav>

      <main style={s.main}>

        {/* ══ HABERLER ══ */}
        {sekme==="haberler" && <>
          <div style={{...s.card,display:"flex",flexWrap:"wrap",gap:10,alignItems:"center",padding:"14px 16px"}}>
            <div style={{flex:"1 1 180px",position:"relative"}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:c.muted,fontSize:13}}>🔍</span>
              <input style={{width:"100%",padding:"8px 12px 8px 32px",borderRadius:8,border:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc",color:c.text,fontSize:13,outline:"none",boxSizing:"border-box"}} placeholder="Haber ara…" value={arama} onChange={e=>setArama(e.target.value)}/>
            </div>
            <select style={{padding:"7px 10px",borderRadius:8,border:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc",color:c.text,fontSize:13,outline:"none"}} value={havayolu} onChange={e=>setHavayolu(e.target.value)}>
              {TUMU_HY.map(h=><option key={h}>{h}</option>)}
            </select>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}>
              <input type="checkbox" checked={analizliOnly} onChange={e=>setAnalizliOnly(e.target.checked)} style={{accentColor:"#10b981"}}/>Analizli
            </label>
            {(arama||havayolu!=="Tümü"||kategori!=="tumu"||analizliOnly)&&
              <button style={s.btn(false)} onClick={()=>{setArama("");setHavayolu("Tümü");setKategori("tumu");setAnalizliOnly(false);}}>✕</button>}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {KATEGORILER.map(k=><button key={k.id} style={s.chip(kategori===k.id)} onClick={()=>setKategori(k.id)}>{k.label}</button>)}
          </div>
          {filtreli.length===0
            ? <div style={{textAlign:"center",padding:"60px 20px",color:c.muted}}><div style={{fontSize:32,marginBottom:8}}>🔍</div>Sonuç bulunamadı</div>
            : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:12}}>
                {filtreli.map(h=>(
                  <div key={h.id} style={s.card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <span style={s.tag(katRenk[h.kategori]||"#94a3b8")}>{KATEGORILER.find(k=>k.id===h.kategori)?.label}</span>
                      <span style={{fontSize:11,color:c.muted}}>{new Date(h.tarih).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})}</span>
                    </div>
                    <div style={{fontWeight:600,fontSize:14,lineHeight:1.45,marginBottom:7}}>{h.baslik}</div>
                    <div style={{fontSize:12,lineHeight:1.6,color:c.sub,marginBottom:12}}>{h.ozet}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {h.kaynaklar.map(k=><a key={k.ad} href={k.url} target="_blank" rel="noopener" style={{fontSize:11,color:"#6366f1",textDecoration:"none",background:"#6366f115",padding:"2px 8px",borderRadius:6}}>{k.ad}</a>)}
                      </div>
                      {h.analizli&&<span style={s.tag("#10b981")}>✦ Analizli</span>}
                    </div>
                  </div>
                ))}
              </div>
          }
          <div style={{marginTop:14,padding:"10px 14px",background:dk?"#1e293b":"#f1f5f9",borderRadius:8,display:"flex",gap:20,fontSize:12,color:c.muted,flexWrap:"wrap"}}>
            <span><b style={{color:c.text}}>{filtreli.length}</b> haber</span>
            <span><b style={{color:"#10b981"}}>{filtreli.filter(h=>h.analizli).length}</b> analizli</span>
            <span><b style={{color:"#6366f1"}}>{new Set(filtreli.map(h=>h.kategori)).size}</b> kategori</span>
          </div>
        </>}

        {/* ══ GÖSTERGELER & RAPORLAR ══ */}
        {sekme==="gostergeler" && <>
          <div style={s.h2}>IATA Pazar Göstergeleri</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:20}}>
            {ENDEKSLER.map(e=>(
              <div key={e.label} style={{background:c.card,border:`1px solid ${c.bord}`,borderLeft:`3px solid ${e.renk}`,borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:26,fontWeight:800,color:e.renk,letterSpacing:"-1px",lineHeight:1,marginBottom:4}}>{e.deger}</div>
                <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{e.label}</div>
                <div style={{fontSize:11,color:c.muted,marginBottom:2}}>{e.birim}</div>
                <div style={{fontSize:11,color:c.muted}}>{e.aciklama}</div>
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
            <div style={{fontSize:11,color:c.muted,marginTop:8}}>Kaynak: IATA Air Passenger Market Analysis · Mayıs 2026</div>
          </div>

          <div style={s.h2}>Yayınlar & Raporlar</div>
          {RAPORLAR.map(r=>(
            <div key={r.id} style={{...s.card,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}>
              <div>
                <div style={{display:"flex",gap:8,marginBottom:6}}>
                  <span style={s.tag("#6366f1")}>{r.etiket}</span>
                  <span style={{fontSize:11,color:c.muted}}>{r.tarih}</span>
                </div>
                <div style={{fontWeight:600,fontSize:14,marginBottom:6}}>{r.baslik}</div>
                <div style={{fontSize:13,color:c.sub,lineHeight:1.55}}>{r.ozet}</div>
              </div>
              <a href={r.url} target="_blank" rel="noopener" style={{padding:"7px 14px",background:"#6366f1",color:"#fff",borderRadius:8,fontSize:12,fontWeight:600,textDecoration:"none",flexShrink:0}}>Aç →</a>
            </div>
          ))}
        </>}

        {/* ══ SEKTÖREL FİNANSALLAR ══ */}
        {sekme==="finansallar" && <>
          <div style={s.info}>
            ℹ️ Veriler resmi yıllık raporlar ve IR duyurularından derlenir. USD cinsinden gösterilir. Çeyreklik veriler mevcut havayolları için ayrıca listelenir. Piyasa verileri 5 dakikada bir güncellenir.
          </div>

          {/* THY SNAPSHOT */}
          <div style={{...s.card,borderLeft:"4px solid #C8102E",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:15,fontWeight:800,color:"#C8102E"}}>⭐ Turkish Airlines — 2025</span>
                  <span style={s.tag("#C8102E")}>THYAO · BIST</span>
                </div>
                <div style={{fontSize:12,color:c.muted}}>{thyObj.aciklama}</div>
              </div>
              <a href={thyObj.ir_url} target="_blank" rel="noopener" style={{fontSize:12,color:"#6366f1",textDecoration:"none"}}>IR →</a>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
              {[
                {label:"Toplam Gelir",val:`$${thyObj.yillar["2025"].gelir}B`,renk:"#6366f1"},
                {label:"Net Kâr",    val:`$${thyObj.yillar["2025"].net_kar}B`,renk:"#10b981"},
                {label:"İşl. Kârı", val:`$${thyObj.yillar["2025"].isletme_kar}B`,renk:"#0ea5e9"},
                {label:"İşl. Marjı",val:`${thyObj.yillar["2025"].isletme_marj}%`,renk:"#f59e0b"},
                {label:"Yolcu",     val:`${thyObj.yillar["2025"].yolcu}M`,renk:"#ef4444"},
                {label:"Doluluk",   val:`${thyObj.yillar["2025"].doluluk}%`,renk:"#14b8a6"},
                {label:"Filo",      val:`${thyObj.yillar["2025"].filo}`,renk:"#f97316"},
                {label:"ASK Büyüme",val:`+${thyObj.yillar["2025"].ask_buyume}%`,renk:"#8b5cf6"},
              ].map(({label,val,renk})=>(
                <div key={label} style={{background:dk?"#0f172a":"#f8fafc",borderRadius:8,padding:"10px 12px"}}>
                  <div style={{fontSize:11,color:c.muted,marginBottom:3}}>{label}</div>
                  <div style={{fontSize:18,fontWeight:800,color:renk,letterSpacing:"-0.5px"}}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* YIL/ÇEYREK SEÇİMİ */}
          <div style={{...s.card,padding:"14px 16px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Görünüm</div>
                <div style={{display:"flex",gap:5}}>
                  <button style={s.btn(finGoster==="yillik")} onClick={()=>setFinGoster("yillik")}>Yıllık</button>
                  <button style={s.btn(finGoster==="ceyrek")} onClick={()=>setFinGoster("ceyrek")}>Çeyreklik</button>
                </div>
              </div>
              {finGoster==="yillik" && <div>
                <div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Yıllar</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {["2021","2022","2023","2024","2025"].map(y=>(
                    <button key={y} style={s.btn(finYillar.includes(y))} onClick={()=>setFinYillar(p=>p.includes(y)?p.filter(x=>x!==y):[...p,y].sort())}>{y}</button>
                  ))}
                </div>
              </div>}
              <div>
                <div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Metrik</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {Object.entries(metrикler).map(([k,v])=>(
                    <button key={k} style={s.btn(finMetrik===k,v.renk)} onClick={()=>setFinMetrik(k)}>{v.label.split("(")[0].trim()}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Havayolları</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {FINANSAL_DATA.havayollari.map(h=>(
                    <button key={h.id} style={s.btn(secilenHY.includes(h.id),h.renk)} onClick={()=>setSecilenHY(p=>p.includes(h.id)?p.filter(x=>x!==h.id):[...p,h.id])}>
                      {h.id==="thy"?"⭐ ":""}{h.ad}
                    </button>
                  ))}
                  <button style={s.btn(false)} onClick={()=>setSecilenHY(FINANSAL_DATA.havayollari.map(h=>h.id))}>Tümü</button>
                </div>
              </div>
            </div>
          </div>

          {/* YILLIK TABLO */}
          {finGoster==="yillik" && <div style={s.card}>
            <div style={{marginBottom:12}}>
              <div style={s.h2}>{metrикler[finMetrik].label}</div>
              <div style={{fontSize:12,color:c.muted}}>{finYillar.join(", ")} · USD</div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>
                    <th style={s.th}>Havayolu</th>
                    {finYillar.map(y=><th key={y} style={{...s.th,textAlign:"right"}}>{y}</th>)}
                    <th style={{...s.th,textAlign:"right"}}>YoY '25</th>
                    <th style={{...s.th,textAlign:"center"}}>Trend</th>
                    <th style={{...s.th}}>Rapor</th>
                  </tr>
                </thead>
                <tbody>
                  {aktifHY.map((h,i)=>{
                    const vals=finYillar.map(y=>h.yillar[y]?.[finMetrik]??null);
                    const s25=h.yillar["2025"]?.[finMetrik]??null;
                    const s24=h.yillar["2024"]?.[finMetrik]??null;
                    const yoy=s25!=null&&s24!=null&&s24!==0?((s25-s24)/Math.abs(s24))*100:null;
                    const olumlu=yoy!=null&&yoy>0;
                    const trendV=["2021","2022","2023","2024","2025"].map(y=>h.yillar[y]?.[finMetrik]??null);
                    const isTHY=h.id==="thy";
                    return (
                      <tr key={h.id} style={{background:i%2===0?"transparent":dk?"#ffffff06":"#f8fafc"}}>
                        <td style={s.td}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:3,height:32,borderRadius:2,background:h.renk,flexShrink:0}}/>
                            <div>
                              <div style={{fontWeight:isTHY?800:500,display:"flex",alignItems:"center",gap:4}}>
                                {isTHY&&"⭐ "}{h.ad}
                              </div>
                              <div style={{fontSize:10,color:c.muted}}>{h.kod} · {h.rapor_siklik}</div>
                            </div>
                          </div>
                        </td>
                        {vals.map((v,vi)=>(
                          <td key={vi} style={{...s.td,textAlign:"right",fontVariantNumeric:"tabular-nums",color:v!=null?c.text:c.muted}}>
                            {metrикler[finMetrik].fmt(v)}
                          </td>
                        ))}
                        <td style={{...s.td,textAlign:"right",fontWeight:600,color:yoy==null?c.muted:olumlu?"#10b981":"#ef4444"}}>
                          {yoy==null?"—":`${yoy>0?"+":""}${yoy.toFixed(1)}%`}
                        </td>
                        <td style={{...s.td,textAlign:"center"}}><Sparkline vals={trendV} renk={h.renk}/></td>
                        <td style={s.td}><a href={h.ir_url} target="_blank" rel="noopener" style={{fontSize:11,color:"#6366f1",textDecoration:"none"}}>IR →</a></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>}

          {/* ÇEYREKLIK TABLO */}
          {finGoster==="ceyrek" && <div style={s.card}>
            <div style={{marginBottom:12}}>
              <div style={s.h2}>Çeyreklik Sonuçlar</div>
              <div style={{fontSize:12,color:c.muted}}>Son 3 çeyrek · Çeyreklik rapor yayınlayan havayolları</div>
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
                  </tr>
                </thead>
                <tbody>
                  {aktifHY.filter(h=>h.ceyrekler).flatMap((h,hi)=>
                    Object.entries(h.ceyrekler).map(([donem,v],di)=>(
                      <tr key={h.id+donem} style={{background:(hi+di)%2===0?"transparent":dk?"#ffffff06":"#f8fafc"}}>
                        {di===0 ? (
                          <td style={{...s.td,fontWeight:600}} rowSpan={Object.keys(h.ceyrekler).length}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <div style={{width:3,height:32,borderRadius:2,background:h.renk}}/>
                              <span>{h.id==="thy"?"⭐ ":""}{h.ad}</span>
                            </div>
                          </td>
                        ) : null}
                        <td style={s.td}><span style={s.tag(h.renk)}>{donem}</span></td>
                        <td style={{...s.td,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{v.gelir!=null?`$${v.gelir.toFixed(1)}B`:"—"}</td>
                        <td style={{...s.td,textAlign:"right",fontVariantNumeric:"tabular-nums",color:v.net_kar>=0?"#10b981":"#ef4444",fontWeight:600}}>{v.net_kar!=null?`${v.net_kar>=0?"+":""}$${v.net_kar.toFixed(2)}B`:"—"}</td>
                        <td style={{...s.td,textAlign:"right"}}>{v.yolcu!=null?`${v.yolcu.toFixed(1)}M`:"—"}</td>
                        <td style={{...s.td,textAlign:"right"}}>{v.doluluk!=null?`${v.doluluk.toFixed(1)}%`:"—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{fontSize:11,color:c.muted,marginTop:8}}>Emirates, Qatar Airways ve Singapore Airlines çeyreklik rapor yayınlamaz — yıllık/yarıyıl tabloda gösterilir.</div>
          </div>}

          {/* FARK ANALİZİ */}
          <div style={s.card}>
            <div style={s.h2}>THY Rakip Fark Analizi — 2025</div>
            <div style={{fontSize:12,color:c.muted,marginBottom:12}}>↑ THY önde · ↓ Rakip önde · pp = yüzde puan</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>
                    <th style={s.th}>Rakip</th>
                    <th style={{...s.th,textAlign:"right"}}>Gelir</th>
                    <th style={{...s.th,textAlign:"right"}}>Net Kâr</th>
                    <th style={{...s.th,textAlign:"right"}}>İşl. Marj</th>
                    <th style={{...s.th,textAlign:"right"}}>Yolcu</th>
                    <th style={{...s.th,textAlign:"right"}}>Doluluk</th>
                  </tr>
                </thead>
                <tbody>
                  {FINANSAL_DATA.havayollari.filter(h=>h.id!=="thy").map((h,i)=>{
                    const thy=thyObj.yillar["2025"],rak=h.yillar["2025"];
                    const df=(key,B=true)=>{
                      if(thy[key]==null||rak[key]==null) return <span style={{color:c.muted}}>—</span>;
                      const d=thy[key]-rak[key];
                      const r=d>=0?"#10b981":"#ef4444";
                      return <span style={{color:r,fontWeight:600}}>{d>=0?"↑":"↓"}{B?`$${Math.abs(d).toFixed(1)}B`:`${Math.abs(d).toFixed(1)}pp`}</span>;
                    };
                    return (
                      <tr key={h.id} style={{background:i%2===0?"transparent":dk?"#ffffff06":"#f8fafc"}}>
                        <td style={s.td}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:10,height:10,borderRadius:"50%",background:h.renk}}/>{h.ad}
                            <span style={{fontSize:10,color:c.muted}}>{h.rapor_siklik}</span>
                          </div>
                        </td>
                        <td style={{...s.td,textAlign:"right"}}>{df("gelir")}</td>
                        <td style={{...s.td,textAlign:"right"}}>{df("net_kar")}</td>
                        <td style={{...s.td,textAlign:"right"}}>{df("isletme_marj",false)}</td>
                        <td style={{...s.td,textAlign:"right"}}>{df("yolcu")}</td>
                        <td style={{...s.td,textAlign:"right"}}>{df("doluluk",false)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kaynaklar */}
          <div style={{...s.card,background:dk?"#0f172a":"#f8fafc",padding:"12px 16px"}}>
            <div style={{fontWeight:600,fontSize:11,marginBottom:8,color:c.muted,textTransform:"uppercase"}}>Veri Kaynakları</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:6}}>
              {FINANSAL_DATA.havayollari.map(h=>(
                <a key={h.id} href={h.ir_url} target="_blank" rel="noopener" style={{fontSize:11,color:"#6366f1",textDecoration:"none",background:"#6366f115",padding:"2px 8px",borderRadius:6}}>{h.ad} →</a>
              ))}
            </div>
            <div style={{fontSize:11,color:c.muted}}>
              Kur verisi: open.er-api.com · Güncelleme: {piyasa.son_guncelleme||"—"} · EUR/USD≈1.08 · SGD/USD≈0.74
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
            {chatMsj.map((m,i)=>(
              <div key={i} style={{padding:"8px 11px",borderRadius:m.rol==="kullanici"?"12px 12px 4px 12px":"12px 12px 12px 4px",background:m.rol==="kullanici"?"#6366f1":dk?"#0f172a":"#f1f5f9",color:m.rol==="kullanici"?"#fff":c.text,fontSize:13,lineHeight:1.55,maxWidth:"90%",alignSelf:m.rol==="kullanici"?"flex-end":"flex-start"}}>{m.icerik}</div>
            ))}
            {chatYuk&&<div style={{padding:"8px 11px",borderRadius:"12px 12px 12px 4px",background:dk?"#0f172a":"#f1f5f9",color:c.muted,fontSize:13}}>Yanıt hazırlanıyor…</div>}
            <div ref={chatRef}/>
          </div>
          <div style={{padding:"6px 10px",borderTop:`1px solid ${c.bord}50`,display:"flex",flexWrap:"wrap",gap:4}}>
            {["THY vs rakipler","En yüksek marj kim?","NDC penetrasyon analizi"].map(q=>(
              <button key={q} style={{padding:"3px 8px",borderRadius:10,border:`1px solid ${c.bord}`,background:"transparent",color:"#6366f1",fontSize:11,cursor:"pointer"}} onClick={()=>chatGonder(q)}>{q}</button>
            ))}
          </div>
          <div style={{padding:"10px 12px",borderTop:`1px solid ${c.bord}`,display:"flex",gap:8}}>
            <input style={{flex:1,padding:"7px 11px",borderRadius:8,border:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc",color:c.text,fontSize:13,outline:"none"}} placeholder="Soru sor…" value={chatGiris} onChange={e=>setChatGiris(e.target.value)} onKeyDown={e=>e.key==="Enter"&&chatGonder()}/>
            <button style={{padding:"7px 13px",borderRadius:8,border:"none",background:"#6366f1",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}} onClick={()=>chatGonder()}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
}