import { useState, useEffect, useCallback } from "react";

const CDN = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api";
const ENERJI = { brent: 72.4, jet: 82.1 };

function dateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

async function fetchRates(tag) {
  const urls = [
    CDN + "@" + tag + "/v1/currencies/usd.json",
    "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
  ];
  for (let i = 0; i < urls.length; i++) {
    try {
      const r = await fetch(urls[i]);
      if (!r.ok) continue;
      const d = await r.json();
      if (d && d.usd) return { try_: d.usd.try || null, eur: d.usd.eur || null };
    } catch (_) {}
  }
  return null;
}

// ── VERİ ────────────────────────────────────────────────────────────────────
const FIN_DATA = [
  {
    id:"thy", ad:"Turkish Airlines", kod:"THYAO", bors:"BIST", renk:"#C8102E",
    siklik:"Çeyreklik", ir:"https://investor.turkishairlines.com", ir_ad:"THYAO IR",
    yil:{
      "2022":{g:16.8,ik:2.6, nk:2.4, p:71.4, lf:79.8, im:15.5, nm:14.3, f:411},
      "2023":{g:20.5,ik:3.6, nk:3.0, p:83.4, lf:82.3, im:17.6, nm:14.6, f:444},
      "2024":{g:22.7,ik:4.18,nk:3.42,p:90.2, lf:84.1, im:18.4, nm:15.1, f:492},
      "2025":{g:24.1,ik:3.65,nk:2.90,p:97.2, lf:84.8, im:15.1, nm:12.0, f:516},
    },
    q:[
      {d:"Q1 2026",g:5.9, nk:0.23, p:21.3,lf:83.8,url:"https://investor.turkishairlines.com",yeni:true},
      {d:"Q4 2025",g:5.2, nk:-0.1, p:22.4,lf:82.1,url:"https://investor.turkishairlines.com",yeni:false},
      {d:"Q3 2025",g:7.0, nk:0.23, p:26.1,lf:85.2,url:"https://investor.turkishairlines.com",yeni:false},
    ],
  },
  {
    id:"emirates", ad:"Emirates", kod:"EK", bors:"Halka açık değil", renk:"#CC0001",
    siklik:"Yıllık", ir:"https://www.emirates.com/media-centre/", ir_ad:"Emirates AR",
    not:"OP ayrıştırılmaz",
    yil:{
      "2022":{g:26.0,ik:null,nk:1.5, p:45.7,lf:72.0,im:null,nm:5.8, f:259},
      "2023":{g:32.6,ik:null,nk:4.7, p:51.9,lf:78.4,im:null,nm:14.4,f:260},
      "2024":{g:36.9,ik:null,nk:4.7, p:52.1,lf:79.9,im:null,nm:12.7,f:261},
      "2025":{g:39.6,ik:null,nk:5.19,p:53.7,lf:78.9,im:null,nm:14.9,f:270},
    },
    q:[{d:"H1 2025-26",g:21.4,nk:3.2,p:27.8,lf:79.5,url:"https://www.emirates.com/media-centre/",yeni:false}],
  },
  {
    id:"lufthansa", ad:"Lufthansa Group", kod:"LHA", bors:"XETRA", renk:"#05164D",
    siklik:"Çeyreklik", ir:"https://investor-relations.lufthansagroup.com", ir_ad:"Lufthansa IR",
    not:"EUR/USD ~1.08",
    yil:{
      "2022":{g:34.1,ik:1.5, nk:0.8, p:102.6,lf:78.4,im:4.4,nm:2.3, f:775},
      "2023":{g:38.8,ik:2.7, nk:1.7, p:123.0,lf:82.2,im:7.0,nm:4.4, f:783},
      "2024":{g:40.6,ik:1.78,nk:1.51,p:130.7,lf:83.1,im:4.4,nm:3.7, f:800},
      "2025":{g:42.7,ik:2.12,nk:1.40,p:135.0,lf:83.2,im:4.9,nm:3.3, f:821},
    },
    q:[
      {d:"Q1 2026",g:9.2, nk:0.31,p:33.2,lf:81.4,url:"https://investor-relations.lufthansagroup.com",yeni:true},
      {d:"Q4 2025",g:9.8, nk:0.18,p:31.1,lf:80.9,url:"https://investor-relations.lufthansagroup.com",yeni:false},
    ],
  },
  {
    id:"afklm", ad:"Air France-KLM", kod:"AF", bors:"Euronext", renk:"#002157",
    siklik:"Çeyreklik", ir:"https://www.airfranceklm.com/en/investors", ir_ad:"AF-KLM IR",
    not:"EUR/USD ~1.08",
    yil:{
      "2022":{g:28.9,ik:1.3, nk:0.7, p:88.1, lf:80.0,im:4.5,nm:2.4, f:522},
      "2023":{g:32.5,ik:1.7, nk:0.9, p:97.6, lf:86.4,im:5.2,nm:2.8, f:530},
      "2024":{g:33.8,ik:1.72,nk:1.06,p:98.0, lf:87.8,im:5.1,nm:3.1, f:541},
      "2025":{g:35.6,ik:2.16,nk:1.84,p:102.8,lf:87.2,im:6.1,nm:5.2, f:545},
    },
    q:[
      {d:"Q4 2025",g:8.1, nk:0.63,p:24.9,lf:85.1,url:"https://www.airfranceklm.com/en/investors",yeni:false},
      {d:"Q3 2025",g:9.8, nk:0.91,p:28.6,lf:88.4,url:"https://www.airfranceklm.com/en/investors",yeni:false},
    ],
  },
  {
    id:"iag", ad:"IAG", kod:"IAG", bors:"LSE/BME", renk:"#1B3A6B",
    siklik:"Çeyreklik", ir:"https://www.iairgroup.com/investors", ir_ad:"IAG IR",
    not:"EUR/USD ~1.08",
    yil:{
      "2022":{g:23.0,ik:1.5, nk:0.9, p:98.4, lf:82.0,im:6.5, nm:3.9, f:530},
      "2023":{g:29.3,ik:3.5, nk:2.7, p:116.0,lf:86.5,im:11.9,nm:9.2, f:540},
      "2024":{g:32.1,ik:4.05,nk:3.24,p:121.8,lf:86.8,im:12.6,nm:10.1,f:560},
      "2025":{g:34.5,ik:4.28,nk:3.56,p:127.5,lf:87.1,im:12.4,nm:10.3,f:571},
    },
    q:[
      {d:"Q1 2026",g:7.8, nk:0.61,p:30.2,lf:84.8,url:"https://www.iairgroup.com/investors",yeni:true},
      {d:"Q4 2025",g:8.1, nk:0.74,p:31.5,lf:85.2,url:"https://www.iairgroup.com/investors",yeni:false},
    ],
  },
  {
    id:"qatar", ad:"Qatar Airways", kod:"QR", bors:"Halka açık değil", renk:"#5C0632",
    siklik:"Yıllık", ir:"https://www.qatarairways.com/en/pressreleases.html", ir_ad:"QR Newsroom",
    not:"Çeyreklik yok",
    yil:{
      "2022":{g:17.7,ik:null,nk:1.5, p:34.2,lf:72.0,im:null,nm:8.5, f:237},
      "2023":{g:21.1,ik:null,nk:1.7, p:40.0,lf:83.0,im:null,nm:8.1, f:250},
      "2024":{g:22.2,ik:null,nk:2.15,p:43.1,lf:85.0,im:null,nm:9.7, f:261},
      "2025":{g:23.6,ik:null,nk:1.94,p:41.8,lf:84.0,im:null,nm:8.2, f:262},
    },
  },
  {
    id:"delta", ad:"Delta Air Lines", kod:"DAL", bors:"NYSE", renk:"#003366",
    siklik:"Çeyreklik", ir:"https://ir.delta.com", ir_ad:"Delta IR",
    yil:{
      "2022":{g:50.6,ik:3.7,nk:1.3, p:192.0,lf:83.0,im:7.3,nm:2.6, f:980},
      "2023":{g:58.0,ik:5.6,nk:4.6, p:200.0,lf:84.8,im:9.7,nm:7.9, f:1002},
      "2024":{g:61.6,ik:5.8,nk:3.5, p:204.0,lf:85.2,im:9.4,nm:5.7, f:1010},
      "2025":{g:62.9,ik:5.5,nk:3.2, p:205.0,lf:85.1,im:8.7,nm:5.1, f:1025},
    },
    q:[
      {d:"Q1 2026",g:14.0,nk:0.24,p:50.1,lf:83.2,url:"https://ir.delta.com",yeni:true},
      {d:"Q4 2025",g:15.6,nk:0.82,p:51.2,lf:84.1,url:"https://ir.delta.com",yeni:false},
    ],
  },
  {
    id:"singapore", ad:"Singapore Airlines", kod:"SIA", bors:"SGX", renk:"#004B87",
    siklik:"Yarıyıl", ir:"https://www.singaporeair.com/en_UK/us/about-us/investor-relations/", ir_ad:"SIA IR",
    not:"SGD/USD ~0.74",
    yil:{
      "2022":{g:10.5,ik:0.8, nk:0.9, p:22.4,lf:68.2,im:7.6, nm:8.6, f:180},
      "2023":{g:15.7,ik:2.1, nk:2.2, p:38.7,lf:85.1,im:13.4,nm:14.0,f:193},
      "2024":{g:17.0,ik:2.4, nk:2.0, p:41.5,lf:86.0,im:14.1,nm:11.8,f:201},
      "2025":{g:17.8,ik:2.3, nk:1.9, p:43.2,lf:86.4,im:12.9,nm:10.7,f:208},
    },
  },
];

const THY = FIN_DATA.find(h => h.id === "thy") || FIN_DATA[0];

const METRLER = [
  {k:"g",  l:"Gelir (USD B)",    fmt: v => v != null ? "$"+v.toFixed(1)+"B" : "-", renk:"#6366f1"},
  {k:"nk", l:"Net Kar (USD B)",  fmt: v => v != null ? (v>=0?"+":"")+Math.abs(v).toFixed(2)+"B" : "-", renk:"#10b981"},
  {k:"ik", l:"EBIT (USD B)",     fmt: v => v != null ? "$"+v.toFixed(2)+"B" : "-", renk:"#0ea5e9"},
  {k:"im", l:"Isletme Marji %",  fmt: v => v != null ? v.toFixed(1)+"%" : "-", renk:"#f59e0b"},
  {k:"nm", l:"Net Marj %",       fmt: v => v != null ? v.toFixed(1)+"%" : "-", renk:"#8b5cf6"},
  {k:"p",  l:"Yolcu (M)",        fmt: v => v != null ? v.toFixed(1)+"M" : "-", renk:"#ef4444"},
  {k:"lf", l:"Doluluk %",        fmt: v => v != null ? v.toFixed(1)+"%" : "-", renk:"#14b8a6"},
  {k:"f",  l:"Filo (ucak)",      fmt: v => v != null ? String(v) : "-", renk:"#f97316"},
];

const HABERLER = [
  {id:1, tarih:"2026-06-11", k:"dagitim", hy:"Amadeus", b:"Amadeus NDC rezervasyonlari 500 milyon sinirini asti", o:"Amadeus, NDC tabanlı rezervasyon hacminin 500 milyon bandını gectigini acikladi. Dagitim gelirleri yuzde 18 artti.", s:[{a:"Amadeus IR",u:"https://ir.amadeus.com/en/financial-news-and-events/press-releases"}], az:true},
  {id:2, tarih:"2026-06-11", k:"dagitim", hy:"Turkish Airlines", b:"THY Sabre NDC tesvik paketini 40 pazara yayyacak", o:"THY, Sabre GDS uzerinden NDC rezervasyonlarina ek komisyon ve erisim avantajlari sunuyor. 3. ceyrekte 40 pazara yayilacak.", s:[{a:"THY Newsroom",u:"https://www.turkishairlines.com/en-int/press-room/news/"}], az:true},
  {id:3, tarih:"2026-06-10", k:"dagitim", hy:"Tumu", b:"IATA ONE Order sertifikasyonu 60 havayolunu gecti", o:"Wizz Air, Avrupa'da ONE Order'a gecen ilk LCC oldu. Finnair ve TAP da sureci tamamladi.", s:[{a:"IATA ONE Order",u:"https://www.iata.org/en/programs/ops-infra/one-order/"}], az:true},
  {id:4, tarih:"2026-06-10", k:"finans", hy:"Lufthansa", b:"Lufthansa Group 2025'te 39,6 milyar Euro rekor gelir", o:"Duzeltilmis EBIT yuzde 19 buyuyerek 2 milyar Euro'ya ulasti. 135 milyon yolcu tasinidi.", s:[{a:"Lufthansa AR 2025",u:"https://report.lufthansagroup.com/2025/annual-report/en/"}], az:true},
  {id:5, tarih:"2026-06-10", k:"finans", hy:"Turkish Airlines", b:"THY Q1 2026: 226 milyon dolar net kar, 21,3M yolcu", o:"THY 2026 ilk ceyreginde 5,9 milyar dolar gelir ve 226 milyon dolar net kar acikladi. Yolcu sayisi yuzde 12,7 artti.", s:[{a:"THY IR",u:"https://investor.turkishairlines.com"}], az:true},
  {id:6, tarih:"2026-06-09", k:"dagitim", hy:"Sabre", b:"Sabre SynXis Air NDC platformunu tum musterilere acti", o:"Yeni mimari, havayollarinin dinamik fiyat tekliflerini milisaniyede dagitmisina imkan taniyor.", s:[{a:"Sabre Newsroom",u:"https://www.sabre.com/insights/news/"}], az:false},
  {id:7, tarih:"2026-06-09", k:"finans", hy:"Tumu", b:"IATA Mayis 2026: Kuresel RPK buyumesi yuzde 9,2", o:"Asya-Pasifik yuzde 14,1 ile en hizli buyuyen bolge. Kuresel doluluk yuzde 83,7 ile 5 yilin zirvesinde.", s:[{a:"IATA Market",u:"https://www.iata.org/en/publications/economics/air-passenger-monthly-analysis/"}], az:true},
  {id:8, tarih:"2026-06-08", k:"yasal", hy:"Tumu", b:"AB Havayolu Otoritesi GDS seffaflik yonetmeligi taslagi", o:"EASA, icerik esitligi ve ucret seffafligini zorunlu kilacak taslak yayimladi. 2027 yururluk hedefleniyor.", s:[{a:"EC Transport",u:"https://transport.ec.europa.eu/transport-modes/air_en"}], az:true},
  {id:9, tarih:"2026-06-08", k:"finans", hy:"IAG", b:"IAG Q1 2026: Transatlantik talep kari 610M Euro'ya tasidi", o:"7,8 milyar Euro gelir ve 610 milyon Euro net kar. Ispanya-ABD hatlarinda doluluk yuzde 88'i asti.", s:[{a:"IAG IR Q1 2026",u:"https://www.iairgroup.com/investors/results-and-presentations"}], az:true},
  {id:10, tarih:"2026-06-07", k:"dagitim", hy:"Travelport", b:"Travelport AI arama motorunu tum GDS musterilerine acti", o:"Smartpoint Cloud'a entegre motor islem suresini yuzde 60 kisaltti.", s:[{a:"Travelport",u:"https://www.travelport.com/blog"}], az:false},
  {id:11, tarih:"2026-06-07", k:"yasal", hy:"Tumu", b:"IATA NDC standartinin 21.3 versiyonu yayimlandi", o:"Grup rezervasyonlari ve interline teklifler icin yeni sema tanimlari. 18 aylik gecis suresi.", s:[{a:"IATA NDC",u:"https://www.iata.org/en/programs/airline-distribution/ndc/ndc-news/"}], az:false},
  {id:12, tarih:"2026-06-06", k:"finans", hy:"Delta", b:"Delta Q1 2026: Gelir beklentilerin altinda kaldi", o:"14 milyar dolar gelir; tarife baskisi net kari yuzde 41 dusurdu. Sirket yillik yonlendirmesini korudu.", s:[{a:"Delta IR",u:"https://ir.delta.com/news-releases/news-release-details/delta-air-lines-announces-march-quarter-2026-financial-results"}], az:true},
];

const GUNDEM_KKAT = [
  {id:"turkiye",   l:"Turkiye",    renk:"#ef4444"},
  {id:"dunya",     l:"Dunya",      renk:"#0ea5e9"},
  {id:"ispanya",   l:"Ispanya",    renk:"#f59e0b"},
  {id:"spor",      l:"Spor",       renk:"#10b981"},
  {id:"smalltalk", l:"Small Talk", renk:"#8b5cf6"},
];

const GUNDEM = [
  {id:1,  kat:"turkiye", onemli:true,  tarih:"11 Haz", b:"TCMB faiz karari bugun saat 14:00", o:"Politika faizinin yuzde 37'de sabit kalmasi bekleniyor. THY maliyetleri ve döviz acısından sektor yakindan izliyor.", url:"https://www.bloomberght.com"},
  {id:2,  kat:"turkiye", onemli:false, tarih:"10 Haz", b:"Turkiye turizm geliri 2026'da 62 milyar dolara ulasti", o:"Ocak-Mayis doneminde 18,4 milyon yabanci turist. Havacılık talebi guclu seyrediyor.", url:"https://www.kultur.gov.tr"},
  {id:3,  kat:"turkiye", onemli:false, tarih:"9 Haz",  b:"Istanbul Havalimani Mayis'ta Avrupa'nin en yogun havalimani", o:"9,1 milyon yolcuyla Paris CDG'yi geride birakti.", url:"https://www.dhmi.gov.tr/haberler"},
  {id:4,  kat:"dunya",   onemli:true,  tarih:"11 Haz", b:"2026 FIFA Dunya Kupasi Kuzey Amerika'da basladi", o:"48 takim, 11 Haziran - 19 Temmuz. Acilis macı Meksika-Guney Afrika.", url:"https://spor.haber7.com/dunya-kupasi/haber/3634351"},
  {id:5,  kat:"dunya",   onemli:false, tarih:"10 Haz", b:"Fed faiz kararı: Politika faizi sabit", o:"Yuksek enflasyon ortaminda ABD Merkez Bankasi faizi degistirmedi.", url:"https://www.reuters.com/markets/rates-bonds/fed-holds-rates-steady/"},
  {id:6,  kat:"dunya",   onemli:false, tarih:"9 Haz",  b:"IATA: Kuresel havacılık kari 2026'da 36 milyar dolar", o:"Yolcu talebi guclu; yakit maliyetleri ve personel giderleri baski olusturuyor.", url:"https://www.iata.org/en/pressroom/2026-releases/"},
  {id:7,  kat:"ispanya", onemli:true,  tarih:"10 Haz", b:"agenttravel.es: 14 havayolunu daha NDC programina ekleme hedefi", o:"Amadeus Ispanya Direktoru Maite Anorga, NDC partner programina 2026'da 14 yeni havayolunun eklenegini acikladi.", url:"https://www.agenttravel.es"},
  {id:8,  kat:"ispanya", onemli:false, tarih:"9 Haz",  b:"AB, Ispanya'ya yolcu veri kaydi ihlali davasi acti", o:"EU direktiflerine aykiri veri tabani uygulamasi gerekce gosterildi. 2 ay icerisinde uyum saglanmasi gerekiyor.", url:"https://www.agenttravel.es"},
  {id:9,  kat:"ispanya", onemli:false, tarih:"8 Haz",  b:"Catalan News: Barselona 2027'den itibaren turist kotası uyguluyor", o:"Gunluk maksimum turist kotasi asiri kalabalik sorununa cozum olarak geliyor.", url:"https://www.catalannews.com/tourism"},
  {id:10, kat:"spor",    onemli:true,  tarih:"14 Haz", b:"TURKIYE - AVUSTRALYA | Dunya Kupasi D Grubu — 14 Haz 07:00 | TRT 1", o:"24 yil aradan sonra Dunya Kupasi. BC Place Vancouver. Arda Guler, Kenan Yildiz, Hakan Calhanoglu.", url:"https://www.milliyet.com.tr/galeri/milli-mac-ne-zaman-avustralya-turkiye-2026"},
  {id:11, kat:"spor",    onemli:false, tarih:"Haz",    b:"Galatasaray Sampiyonlar Ligi icin transfer sezonunu acti", o:"Osimhen alternatifi aranıyor. Teknik direktor Okan Buruk ile sozlesme 2027'ye uzatildi.", url:"https://www.fanatik.com.tr/takim/galatasaray/"},
  {id:12, kat:"spor",    onemli:false, tarih:"Haz",    b:"Fenerbahce'de Aziz Yildirim baskanligi aldi — Lewandowski transferi ilan edildi", o:"Kongrede secilir secilmez Lewandowski ve Guirassy transferlerini duyurdu.", url:"https://www.fanatik.com.tr/takim/fenerbahce/"},
  {id:13, kat:"smalltalk",onemli:false,tarih:"11 Haz", b:"Istanbul konut fiyatlari 6 ayda yuzde 12 geriledi", o:"Kadikoy ve Besiktas'ta dusuş sinirli; Anadolu yakasi daha fazla etkilendi.", url:"https://www.emlakjet.com/haberler/"},
  {id:14, kat:"smalltalk",onemli:false,tarih:"10 Haz", b:"Netflix Turkiye'nin 'Miras' dizisi global listede 3. oldu", o:"3 gun icerisinde 60 ulkede izleniyor. Avrupa ve Latin Amerika'da rekor kiriyor.", url:"https://www.hurriyet.com.tr/kelebek/magazin/"},
  {id:15, kat:"smalltalk",onemli:false,tarih:"8 Haz",  b:"Kapadokya balon turu rezervasyonlari 3 ay onceden doluyor", o:"Yaz sezonu icin yuzde 40 artis bekleniyor. Erken rezervasyon sart.", url:"https://www.kulturportali.gov.tr"},
];

// ── KUR HOOK ────────────────────────────────────────────────────────────────
function usePiyasa() {
  const [v, setV] = useState({
    usdtry:null, eurtry:null, eurusd:null,
    usdtry_prev:null, eurtry_prev:null, eurusd_prev:null,
    brent:ENERJI.brent, jet:ENERJI.jet,
    ts:null, loading:true, err:null,
  });
  const load = useCallback(async function() {
    setV(p => Object.assign({}, p, {loading:true, err:null}));
    try {
      const res = await Promise.all([fetchRates("latest"), fetchRates(dateStr(-1))]);
      const today = res[0], yesterday = res[1];
      if (!today) throw new Error("veri alinamadi");
      const usdtry = today.try_;
      const eur    = today.eur;
      const eurtry = (usdtry && eur) ? usdtry / eur : null;
      const eurusd = eur ? (1 / eur) : null;
      const usdtry_prev = yesterday ? yesterday.try_ : null;
      const eur_prev    = yesterday ? yesterday.eur : null;
      const eurtry_prev = (usdtry_prev && eur_prev) ? usdtry_prev / eur_prev : null;
      const eurusd_prev = eur_prev ? (1 / eur_prev) : null;
      setV({usdtry, eurtry, eurusd, usdtry_prev, eurtry_prev, eurusd_prev,
        brent:ENERJI.brent, jet:ENERJI.jet,
        ts: new Date().toLocaleTimeString("tr-TR"), loading:false, err:null});
    } catch(_) {
      setV(p => Object.assign({}, p, {loading:false, err:"Kur verisi alinamadi"}));
    }
  }, []);
  useEffect(function() {
    load();
    const iv = setInterval(load, 10*60*1000);
    return function() { clearInterval(iv); };
  }, [load]);
  return Object.assign({}, v, {refresh: load});
}

// ── KUR SERİDİ ──────────────────────────────────────────────────────────────
function KurSeridi(props) {
  const p = props.piyasa, dk = props.dk;
  const bg = "#1e293b", bord = "#334155", txt = "#f1f5f9", mute = "#94a3b8";
  function pct(a, b) {
    if (a == null || b == null || b === 0) return null;
    return (a - b) / Math.abs(b) * 100;
  }
  const items = [
    {l:"USD/TRY", v:p.usdtry, prev:p.usdtry_prev, f:v=>"₺"+v.toFixed(2), ters:true},
    {l:"EUR/TRY", v:p.eurtry, prev:p.eurtry_prev, f:v=>"₺"+v.toFixed(2), ters:true},
    {l:"EUR/USD", v:p.eurusd, prev:p.eurusd_prev, f:v=>"$"+v.toFixed(4), ters:false},
    {l:"Brent",   v:p.brent,  prev:null,           f:v=>"$"+v.toFixed(1)+"/bbl", ters:true},
    {l:"Jet",     v:p.jet,    prev:null,            f:v=>"$"+v.toFixed(1)+"/bbl", ters:true},
  ];
  return (
    <div style={{background:bg, borderBottom:"1px solid "+bord, overflowX:"auto", whiteSpace:"nowrap"}}>
      <div style={{display:"inline-flex", alignItems:"center", padding:"0 16px", minWidth:"100%", height:36}}>
        <div style={{display:"flex", alignItems:"center", gap:6, paddingRight:12, marginRight:12, borderRight:"1px solid "+bord, flexShrink:0}}>
          <div style={{width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:10, fontWeight:700, color:mute, textTransform:"uppercase", letterSpacing:"0.5px"}}>Canli</span>
        </div>
        {p.loading && <span style={{color:mute, fontSize:11}}>Yukleniyor...</span>}
        {p.err && <span style={{color:"#ef4444", fontSize:11}}>{p.err} <button onClick={p.refresh} style={{marginLeft:6, fontSize:10, border:"1px solid #ef4444", background:"transparent", color:"#ef4444", padding:"1px 6px", borderRadius:4, cursor:"pointer"}}>Yenile</button></span>}
        {!p.loading && !p.err && items.map(function(item, i) {
          const d = pct(item.v, item.prev);
          const up = d != null && d > 0;
          const clr = d == null ? mute : (item.ters ? (up?"#ef4444":"#10b981") : (up?"#10b981":"#ef4444"));
          return (
            <div key={item.l} style={{display:"inline-flex", alignItems:"center", gap:7, paddingRight:14, marginRight:12, borderRight:i<items.length-1?"1px solid "+bord:"none", flexShrink:0}}>
              <span style={{fontSize:10, fontWeight:700, color:mute}}>{item.l}</span>
              <span style={{fontSize:13, fontWeight:800, color:txt}}>{item.v!=null?item.f(item.v):"—"}</span>
              {d!=null && <span style={{fontSize:10, fontWeight:700, color:clr, background:clr+"20", padding:"1px 5px", borderRadius:4}}>{up?"▲":"▼"}{Math.abs(d).toFixed(2)}%</span>}
              {d==null && item.prev==null && item.v!=null && <span style={{fontSize:10, color:mute}}>EIA</span>}
            </div>
          );
        })}
        {!p.loading && !p.err && (
          <div style={{marginLeft:"auto", flexShrink:0, display:"flex", alignItems:"center", gap:8, paddingLeft:12, borderLeft:"1px solid "+bord}}>
            <span style={{fontSize:10, color:mute}}>son: {p.ts}</span>
            <button onClick={p.refresh} style={{fontSize:10, background:"transparent", border:"1px solid "+bord, color:mute, borderRadius:4, padding:"2px 6px", cursor:"pointer"}}>↺</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline(props) {
  const vals = (props.vals || []).filter(v => v != null);
  if (vals.length < 2) return null;
  const h = 28, w = 80;
  const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), rng = mx-mn||1;
  const step = w / (vals.length-1);
  const pts = vals.map((v,i) => (i*step).toFixed(1)+","+(h-((v-mn)/rng*h)).toFixed(1)).join(" ");
  const lx = (vals.length-1)*step, ly = h-((vals[vals.length-1]-mn)/rng*h);
  return (
    <svg width={w} height={h} viewBox={"0 0 "+w+" "+h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={props.color||"#6366f1"} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={lx} cy={ly} r="2.5" fill={props.color||"#6366f1"}/>
    </svg>
  );
}

// ── BAR CHART ────────────────────────────────────────────────────────────────
function BarChart(props) {
  const {data, metr, dk} = props;
  if (!data || data.length === 0) return <div style={{color:"#94a3b8", fontSize:13, padding:20}}>Veri yok</div>;
  const max = Math.max.apply(null, data.map(d => Math.abs(d.val||0)));
  if (max === 0) return <div style={{color:"#94a3b8", fontSize:13, padding:20}}>Veri yok</div>;
  const bg = dk?"#0f172a":"#f8fafc", bord = dk?"#334155":"#e2e8f0", txt = dk?"#e2e8f0":"#1e293b";
  return (
    <div style={{display:"flex", flexDirection:"column", gap:10}}>
      {data.map(function(d) {
        const pct = Math.abs(d.val||0)/max*100;
        const barC = (d.val!=null&&d.val<0)?"#ef4444":d.renk;
        return (
          <div key={d.id} style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:150, fontSize:12, fontWeight:d.id==="thy"?700:400, color:txt, flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
              {d.id==="thy"?"* ":""}{d.ad}
            </div>
            <div style={{flex:1, height:26, background:bg, borderRadius:4, overflow:"hidden", border:"1px solid "+bord, position:"relative"}}>
              {d.val!=null ? (
                <div style={{height:"100%", width:pct+"%", background:barC, borderRadius:4, display:"flex", alignItems:"center", paddingLeft:6, transition:"width 0.6s ease", minWidth:d.val!=null?40:0}}>
                  <span style={{fontSize:11, fontWeight:700, color:"#fff", whiteSpace:"nowrap"}}>{metr.fmt(d.val)}</span>
                </div>
              ) : (
                <span style={{fontSize:11, color:"#94a3b8", paddingLeft:8, lineHeight:"26px"}}>N/A</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function App() {
  const [tema,   setTema]   = useState("acik");
  const [sekme,  setSekme]  = useState("haberler");
  const [hKat,   setHKat]   = useState("tumu");
  const [hHY,    setHHY]    = useState("Tumu");
  const [hArama, setHArama] = useState("");
  const [gKat,   setGKat]   = useState("turkiye");
  const [fMetrik,setFMetrik]= useState("g");
  const [fYillar,setFYillar]= useState(["2023","2024","2025"]);
  const [fHY,    setFHY]    = useState(FIN_DATA.map(h=>h.id));
  const [fGor,   setFGor]   = useState("grafik");
  const piyasa = usePiyasa();
  const dk = tema === "karanlik";

  const bg   = dk?"#0f172a":"#f8fafc";
  const card = dk?"#1e293b":"#ffffff";
  const bord = dk?"#334155":"#e2e8f0";
  const txt  = dk?"#e2e8f0":"#1e293b";
  const sub  = dk?"#94a3b8":"#475569";
  const mute = "#94a3b8";
  const thbg = dk?"#0f172a":"#f8fafc";

  const aktifHY = FIN_DATA.filter(h=>fHY.includes(h.id));
  const tumYillar = ["2022","2023","2024","2025"];
  const metr = METRLER.find(m=>m.k===fMetrik)||METRLER[0];

  const grafData = aktifHY.map(function(h) {
    const lastY = fYillar.length>0?fYillar[fYillar.length-1]:null;
    const ydata = lastY&&h.yil&&h.yil[lastY]?h.yil[lastY]:null;
    const val = ydata?(ydata[fMetrik]!=null?ydata[fMetrik]:null):null;
    return {id:h.id, ad:h.ad, renk:h.renk, val:val};
  }).sort((a,b)=>(b.val||0)-(a.val||0));

  // Haberleri tarihe göre grupla
  const KKAT_LIST = [
    {id:"tumu",    l:"Tumu"},
    {id:"dagitim", l:"Dagitim & Teknoloji"},
    {id:"finans",  l:"Finans"},
    {id:"yasal",   l:"Yasal"},
  ];
  const KRENK = {dagitim:"#6366f1", finans:"#10b981", yasal:"#f59e0b"};
  const TUMU_HY = ["Tumu"].concat(Array.from(new Set(HABERLER.map(h=>h.hy))));

  const filtreli = HABERLER.filter(function(h) {
    if (hKat!=="tumu"&&h.k!==hKat) return false;
    if (hHY!=="Tumu"&&h.hy!==hHY) return false;
    if (hArama) {
      const q=hArama.toLowerCase();
      if (h.b.toLowerCase().indexOf(q)===-1&&h.o.toLowerCase().indexOf(q)===-1) return false;
    }
    return true;
  });

  // Günlere göre grupla
  const gruplar = {};
  filtreli.forEach(function(h) {
    if (!gruplar[h.tarih]) gruplar[h.tarih] = [];
    gruplar[h.tarih].push(h);
  });
  const gunler = Object.keys(gruplar).sort().reverse();

  function tarihFmt(t) {
    try {
      return new Date(t).toLocaleDateString("tr-TR", {weekday:"long", day:"numeric", month:"long", year:"numeric"});
    } catch(_) { return t; }
  }

  const gFiltreli = GUNDEM.filter(g=>g.kat===gKat);

  function cSt(extra) {
    return Object.assign({background:card, border:"1px solid "+bord, borderRadius:12, padding:20, marginBottom:14}, extra||{});
  }
  function tabSt(a) {
    return {padding:"10px 14px", cursor:"pointer", border:"none", background:"transparent",
      color:a?"#6366f1":mute, fontWeight:a?600:400, fontSize:13,
      borderBottom:a?"2px solid #6366f1":"2px solid transparent", whiteSpace:"nowrap"};
  }
  function btnSt(a, c) {
    const col=c||"#6366f1";
    return {padding:"5px 12px", borderRadius:8, border:"1px solid "+(a?col:bord),
      background:a?col:"transparent", color:a?"#fff":mute, fontSize:12, fontWeight:a?600:400, cursor:"pointer"};
  }
  function chipSt(a) {
    return {padding:"5px 12px", borderRadius:20, border:"1px solid "+(a?"#6366f1":bord),
      background:a?"#6366f1":"transparent", color:a?"#fff":mute, fontSize:12, cursor:"pointer"};
  }
  function tagSt(c) {
    return {fontSize:11, fontWeight:600, color:c, background:c+"18", padding:"2px 8px", borderRadius:6, whiteSpace:"nowrap"};
  }
  const thSt = {padding:"9px 12px", textAlign:"left", fontWeight:600, color:mute, fontSize:11,
    textTransform:"uppercase", letterSpacing:"0.4px", whiteSpace:"nowrap",
    borderBottom:"1px solid "+bord, background:thbg};
  const tdSt = {padding:"10px 12px", borderBottom:"1px solid "+bord+"50", verticalAlign:"middle"};

  return (
    <div style={{minHeight:"100vh", background:bg, color:txt, fontFamily:"Inter, Segoe UI, sans-serif", fontSize:14}}>
      <style>{".puls{animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}"}</style>

      {/* HEADER */}
      <header style={{background:card, borderBottom:"1px solid "+bord, padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:50, position:"sticky", top:0, zIndex:100}}>
        <div style={{display:"flex", alignItems:"center", gap:10, fontWeight:700, fontSize:15}}>
          <div style={{width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:800}}>T</div>
          <span>Ticari Takip Portali</span>
          <span style={{fontSize:10, fontWeight:700, background:"#6366f1", color:"#fff", padding:"2px 7px", borderRadius:10}}>BETA</span>
        </div>
        <button style={btnSt(false)} onClick={function(){setTema(dk?"acik":"karanlik");}}>
          {dk?"Aydinlik":"Karanlik"}
        </button>
      </header>

      {/* KUR SERİDİ */}
      <div style={{position:"sticky", top:50, zIndex:99}}>
        <KurSeridi piyasa={piyasa} dk={dk}/>
      </div>

      {/* NAV */}
      <nav style={{background:card, borderBottom:"1px solid "+bord, padding:"0 20px", display:"flex", gap:4, overflowX:"auto", position:"sticky", top:86, zIndex:98}}>
        {[
          {id:"haberler",    l:"Haberler"},
          {id:"gundem",      l:"Gundelik Gundem"},
          {id:"gostergeler", l:"Gostergeler"},
          {id:"finansallar", l:"Sektörel Finansallar"},
        ].map(t=>(
          <button key={t.id} style={tabSt(sekme===t.id)} onClick={function(){setSekme(t.id);}}>{t.l}</button>
        ))}
      </nav>

      <main style={{maxWidth:1300, margin:"0 auto", padding:"20px 16px"}}>

        {/* ════ HABERLER ════════════════════════════════════════════════════ */}
        {sekme==="haberler" && (
          <div>
            {/* Filtreler */}
            <div style={Object.assign(cSt(), {display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", padding:"14px 16px"})}>
              <div style={{flex:"1 1 180px", position:"relative"}}>
                <span style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:mute, fontSize:13}}>O</span>
                <input
                  style={{width:"100%", padding:"8px 12px 8px 30px", borderRadius:8, border:"1px solid "+bord, background:dk?"#0f172a":"#f8fafc", color:txt, fontSize:13, outline:"none", boxSizing:"border-box"}}
                  placeholder="Haber ara..."
                  value={hArama}
                  onChange={function(e){setHArama(e.target.value);}}
                />
              </div>
              <select style={{padding:"7px 10px", borderRadius:8, border:"1px solid "+bord, background:dk?"#0f172a":"#f8fafc", color:txt, fontSize:13, outline:"none"}} value={hHY} onChange={function(e){setHHY(e.target.value);}}>
                {TUMU_HY.map(h=><option key={h}>{h}</option>)}
              </select>
              {(hArama||hHY!=="Tumu"||hKat!=="tumu")&&(
                <button style={btnSt(false)} onClick={function(){setHArama("");setHHY("Tumu");setHKat("tumu");}}>Temizle</button>
              )}
            </div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:16}}>
              {KKAT_LIST.map(k=>(
                <button key={k.id} style={chipSt(hKat===k.id)} onClick={function(){setHKat(k.id);}}>{k.l}</button>
              ))}
            </div>

            {/* Günlere göre gruplandırılmış haberler */}
            {gunler.length===0 ? (
              <div style={{textAlign:"center", padding:"60px 20px", color:mute}}>Sonuc bulunamadi</div>
            ) : (
              gunler.map(function(gun) {
                return (
                  <div key={gun} style={{marginBottom:28}}>
                    {/* Gün başlığı */}
                    <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:14}}>
                      <div style={{height:1, flex:1, background:bord}}/>
                      <span style={{fontSize:12, fontWeight:700, color:mute, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap", padding:"3px 12px", background:card, border:"1px solid "+bord, borderRadius:20}}>
                        {tarihFmt(gun)}
                      </span>
                      <div style={{height:1, flex:1, background:bord}}/>
                    </div>
                    {/* Kare grid */}
                    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12}}>
                      {gruplar[gun].map(function(h) {
                        const catRenk = KRENK[h.k]||mute;
                        const catLabel = KKAT_LIST.find(k=>k.id===h.k);
                        return (
                          <div key={h.id} style={{background:card, border:"1px solid "+bord, borderRadius:12, padding:18, borderLeft:"3px solid "+catRenk, display:"flex", flexDirection:"column", gap:8, minHeight:160}}>
                            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                              <span style={tagSt(catRenk)}>{catLabel?catLabel.l:h.k}</span>
                              {h.az && <span style={tagSt("#10b981")}>Analizli</span>}
                            </div>
                            <div style={{fontWeight:700, fontSize:13, lineHeight:1.45, color:txt, flex:1}}>{h.b}</div>
                            <div style={{fontSize:12, lineHeight:1.6, color:sub}}>{h.o}</div>
                            <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
                              {h.s.map(k=>(
                                <a key={k.a} href={k.u} target="_blank" rel="noopener noreferrer"
                                  style={{fontSize:11, color:"#6366f1", textDecoration:"none", background:"#6366f115", padding:"2px 8px", borderRadius:6}}>
                                  {k.a}
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ════ GÜNDEM ══════════════════════════════════════════════════════ */}
        {sekme==="gundem" && (
          <div>
            <div style={{fontSize:16, fontWeight:700, marginBottom:14}}>
              Gundelik Gundem — {new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})}
            </div>
            <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:18}}>
              {GUNDEM_KKAT.map(k=>(
                <button key={k.id} style={{padding:"8px 18px", borderRadius:20, cursor:"pointer",
                  border:"1px solid "+(gKat===k.id?k.renk:bord),
                  background:gKat===k.id?k.renk:"transparent",
                  color:gKat===k.id?"#fff":mute, fontSize:13, fontWeight:gKat===k.id?700:400}}
                  onClick={function(){setGKat(k.id);}}>
                  {k.l}
                </button>
              ))}
            </div>
            {gKat==="spor" && (
              <div style={Object.assign(cSt(), {marginBottom:16})}>
                <div style={{fontWeight:700, fontSize:15, marginBottom:12}}>Turkiye — 2026 Dunya Kupasi D Grubu</div>
                {[
                  {t:"14 Haz 07:00",m:"Avustralya - Turkiye",s:"BC Place, Vancouver",r:"#ef4444",durum:"YAKLASMA",url:"https://www.milliyet.com.tr/galeri/milli-mac-ne-zaman-avustralya-turkiye-2026"},
                  {t:"20 Haz 06:00",m:"Turkiye - Paraguay",s:"Bay Area Stadium",r:"#6366f1",durum:"GRUPTA",url:"https://spor.haber7.com/dunya-kupasi/haber/3634351"},
                  {t:"26 Haz 05:00",m:"Turkiye - ABD",s:"Los Angeles Stadium",r:"#6366f1",durum:"GRUPTA",url:"https://spor.haber7.com/dunya-kupasi/haber/3634351"},
                ].map(function(mac,i) {
                  return (
                    <a key={i} href={mac.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                      <div style={{background:dk?"#0f172a":"#f8fafc", borderRadius:10, padding:"10px 14px", display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", border:"1px solid "+(i===0?mac.r:bord), marginBottom:8}}>
                        <span style={tagSt(mac.r)}>{mac.durum}</span>
                        <span style={{fontSize:11, color:mute, minWidth:100}}>{mac.t} TSI</span>
                        <span style={{fontWeight:700, fontSize:13, color:txt, flex:1}}>{mac.m}</span>
                        <span style={{fontSize:11, color:mute}}>{mac.s}</span>
                        <span style={tagSt("#10b981")}>TRT 1</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
            {gFiltreli.length===0
              ? <div style={{textAlign:"center", padding:"40px 20px", color:mute}}>Bu kategoride haber yok</div>
              : <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:12}}>
                  {gFiltreli.map(function(g) {
                    const gk = GUNDEM_KKAT.find(k=>k.id===g.kat);
                    const r = gk?gk.renk:"#6366f1";
                    return (
                      <a key={g.id} href={g.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                        <div style={{background:card, border:"1px solid "+bord, borderRadius:12, padding:16, borderLeft:g.onemli?"3px solid "+r:"none", cursor:"pointer", minHeight:120, display:"flex", flexDirection:"column", gap:6}}>
                          <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:4}}>
                            <div style={{display:"flex", alignItems:"center", gap:6}}>
                              <span style={tagSt(r)}>{gk?gk.l:g.kat}</span>
                              {g.onemli&&<span style={{fontSize:9, fontWeight:700, color:"#ef4444", background:"#ef444415", padding:"1px 5px", borderRadius:4}}>ONE CIKAN</span>}
                            </div>
                            <span style={{fontSize:11, color:mute}}>{g.tarih}</span>
                          </div>
                          <div style={{fontWeight:g.onemli?700:600, fontSize:13, lineHeight:1.45, color:txt, flex:1}}>{g.b}</div>
                          <div style={{fontSize:12, lineHeight:1.55, color:sub}}>{g.o}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
            }
          </div>
        )}

        {/* ════ GÖSTERGELER ═════════════════════════════════════════════════ */}
        {sekme==="gostergeler" && (
          <div>
            <div style={{fontSize:16, fontWeight:700, marginBottom:14}}>IATA Pazar Gostergeleri</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12, marginBottom:20}}>
              {[
                {l:"IATA Kuresel RPK",d:"+9,2%",b:"Mayis 2026 yillik",r:"#10b981",a:"Revenue Passenger Km"},
                {l:"Kuresel ASK",     d:"+7,4%",b:"Mayis 2026 yillik",r:"#6366f1",a:"Available Seat Km"},
                {l:"Kuresel Doluluk",d:"83,7%", b:"PLF Mayis 2026",  r:"#f59e0b",a:"Passenger Load Factor"},
                {l:"NDC Penetrasyon",d:"~34%",  b:"Tahmin 2026",     r:"#8b5cf6",a:"Toplam bilet satislarinda"},
              ].map(e=>(
                <div key={e.l} style={{background:card, border:"1px solid "+bord, borderLeft:"3px solid "+e.r, borderRadius:10, padding:"14px 16px"}}>
                  <div style={{fontSize:26, fontWeight:800, color:e.r, letterSpacing:"-1px", lineHeight:1, marginBottom:4}}>{e.d}</div>
                  <div style={{fontWeight:600, fontSize:13, marginBottom:2}}>{e.l}</div>
                  <div style={{fontSize:11, color:mute, marginBottom:2}}>{e.b}</div>
                  <div style={{fontSize:11, color:mute}}>{e.a}</div>
                </div>
              ))}
            </div>
            <div style={cSt()}>
              <div style={{fontWeight:600, marginBottom:14}}>Bolgesel RPK Buyumesi — Mayis 2026</div>
              {[
                {b:"Asya-Pasifik",  v:14.1,r:"#0ea5e9"},{b:"Orta Dogu",    v:11.3,r:"#8b5cf6"},
                {b:"Latin Amerika", v:9.8, r:"#10b981"},{b:"Kuzey Amerika",v:8.1, r:"#f59e0b"},
                {b:"Avrupa",        v:7.4, r:"#6366f1"},{b:"Afrika",       v:6.9, r:"#ef4444"},
              ].map(x=>(
                <div key={x.b} style={{marginBottom:10}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
                    <span style={{fontSize:13}}>{x.b}</span>
                    <span style={{fontSize:13, fontWeight:700, color:x.r}}>+{x.v}%</span>
                  </div>
                  <div style={{height:6, background:dk?"#0f172a":"#f1f5f9", borderRadius:4, overflow:"hidden"}}>
                    <div style={{height:"100%", width:(x.v/15*100)+"%", background:x.r, borderRadius:4}}/>
                  </div>
                </div>
              ))}
              <div style={{fontSize:11, color:mute, marginTop:8}}>Kaynak: IATA Air Passenger Market Analysis Mayis 2026</div>
            </div>
          </div>
        )}

        {/* ════ SEKTÖREL FİNANSALLAR ══════════════════════════════════════ */}
        {sekme==="finansallar" && (
          <div>
            {/* THY Snapshot */}
            <div style={Object.assign(cSt(), {borderLeft:"4px solid #C8102E"})}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:8}}>
                <div>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                    <span style={{fontSize:15, fontWeight:800, color:"#C8102E"}}>* Turkish Airlines — Son Donem</span>
                    <span style={tagSt("#C8102E")}>THYAO BIST</span>
                  </div>
                  <div style={{fontSize:12, color:mute}}>Istanbul merkezli, 130+ ulkeye ucus. Q1 2026 sonuclari aciklandi.</div>
                </div>
                <a href={THY.ir} target="_blank" rel="noopener noreferrer" style={{fontSize:12, color:"#6366f1", textDecoration:"none"}}>IR Sayfasi</a>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10}}>
                {[
                  {l:"2025 Gelir",    v:"$24.1B", r:"#6366f1"},
                  {l:"2025 Net Kar",  v:"$2.90B", r:"#10b981"},
                  {l:"Q1 2026 Gelir", v:"$5.9B",  r:"#0ea5e9",  yeni:true},
                  {l:"Q1 2026 Net",   v:"+$226M", r:"#10b981",  yeni:true},
                  {l:"Q1 2026 Yolcu", v:"21.3M",  r:"#ef4444",  yeni:true},
                  {l:"2025 Doluluk",  v:"84.8%",  r:"#14b8a6"},
                  {l:"2025 Filo",     v:"516",     r:"#f97316"},
                  {l:"2025 Isletme",  v:"15.1%",  r:"#f59e0b"},
                ].map(function(item) {
                  return (
                    <div key={item.l} style={{background:dk?"#0f172a":"#f8fafc", borderRadius:8, padding:"10px 12px", border:item.yeni?"1px solid "+item.r+"40":"none"}}>
                      <div style={{fontSize:10, color:mute, marginBottom:3, display:"flex", alignItems:"center", gap:4}}>
                        {item.yeni&&<span style={{fontSize:9, fontWeight:700, color:item.r, background:item.r+"18", padding:"1px 4px", borderRadius:3}}>YENi</span>}
                        {item.l}
                      </div>
                      <div style={{fontSize:17, fontWeight:800, color:item.r, letterSpacing:"-0.5px"}}>{item.v}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kontroller */}
            <div style={Object.assign(cSt(), {padding:"14px 16px"})}>
              <div style={{display:"flex", flexWrap:"wrap", gap:14, alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase"}}>Gorunum</div>
                  <div style={{display:"flex", gap:5}}>
                    <button style={btnSt(fGor==="grafik")} onClick={function(){setFGor("grafik");}}>Grafik</button>
                    <button style={btnSt(fGor==="tablo")} onClick={function(){setFGor("tablo");}}>Tablo</button>
                    <button style={btnSt(fGor==="ceyrek")} onClick={function(){setFGor("ceyrek");}}>Ceyreklik</button>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase"}}>Metrik</div>
                  <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                    {METRLER.map(m=>(
                      <button key={m.k} style={btnSt(fMetrik===m.k, m.renk)} onClick={function(){setFMetrik(m.k);}}>{m.l.split(" (")[0]}</button>
                    ))}
                  </div>
                </div>
                {fGor!=="ceyrek" && (
                  <div>
                    <div style={{fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase"}}>Donem</div>
                    <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                      {tumYillar.map(y=>(
                        <button key={y} style={btnSt(fYillar.includes(y))} onClick={function(){
                          setFYillar(function(p){return p.includes(y)?p.filter(x=>x!==y):p.concat([y]).sort();});
                        }}>{y}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{fontSize:11, fontWeight:600, color:mute, marginBottom:6, textTransform:"uppercase"}}>Havayollari</div>
                  <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                    {FIN_DATA.map(h=>(
                      <button key={h.id} style={btnSt(fHY.includes(h.id), h.renk)} onClick={function(){
                        setFHY(function(p){return p.includes(h.id)?p.filter(x=>x!==h.id):p.concat([h.id]);});
                      }}>{h.id==="thy"?"* ":""}{h.ad}</button>
                    ))}
                    <button style={btnSt(false)} onClick={function(){setFHY(FIN_DATA.map(h=>h.id));}}>Tumu</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grafik */}
            {fGor==="grafik" && (
              <div style={cSt()}>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:16, fontWeight:700, marginBottom:4}}>{metr.l}</div>
                  <div style={{fontSize:12, color:mute}}>Donem: {fYillar.length>0?fYillar[fYillar.length-1]:"—"} | Tum havayollari karsilastirmasi</div>
                </div>
                <BarChart data={grafData} metr={metr} dk={dk}/>
                {fYillar.length>1 && (
                  <div style={{marginTop:24, paddingTop:20, borderTop:"1px solid "+bord}}>
                    <div style={{fontSize:13, fontWeight:600, marginBottom:12, color:mute}}>TREND — {metr.l}</div>
                    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12}}>
                      {aktifHY.map(function(h) {
                        const tVals = fYillar.map(function(y){
                          const d=h.yil&&h.yil[y]?h.yil[y]:null;
                          return d?(d[fMetrik]!=null?d[fMetrik]:null):null;
                        });
                        const fil = tVals.filter(v=>v!=null);
                        const son = fil.length>0?fil[fil.length-1]:null;
                        const ilk = fil.length>0?fil[0]:null;
                        const deg = (son!=null&&ilk!=null&&ilk!==0)?((son-ilk)/Math.abs(ilk)*100):null;
                        return (
                          <div key={h.id} style={{background:dk?"#0f172a":"#f8fafc", borderRadius:8, padding:"12px 14px"}}>
                            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                              <span style={{fontSize:12, fontWeight:h.id==="thy"?700:400}}>{h.id==="thy"?"* ":""}{h.ad}</span>
                              {deg!=null&&<span style={{fontSize:11, fontWeight:600, color:deg>=0?"#10b981":"#ef4444"}}>{deg>=0?"+":""}{deg.toFixed(1)}%</span>}
                            </div>
                            <Sparkline vals={tVals} color={h.renk}/>
                            <div style={{fontSize:11, color:mute, marginTop:4}}>{metr.fmt(son)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tablo */}
            {fGor==="tablo" && (
              <div style={cSt()}>
                <div style={{fontSize:16, fontWeight:700, marginBottom:14}}>{metr.l} — Tablo Karsilastirma</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                    <thead>
                      <tr>
                        <th style={thSt}>Havayolu</th>
                        {fYillar.map(y=><th key={y} style={Object.assign({},thSt,{textAlign:"right"})}>{y}</th>)}
                        <th style={Object.assign({},thSt,{textAlign:"right"})}>YoY</th>
                        <th style={Object.assign({},thSt,{textAlign:"center"})}>Trend</th>
                        <th style={thSt}>IR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aktifHY.map(function(h,i) {
                        const vals = fYillar.map(function(y){
                          const d=h.yil&&h.yil[y]?h.yil[y]:null;
                          return d?(d[fMetrik]!=null?d[fMetrik]:null):null;
                        });
                        const fil=vals.filter(v=>v!=null);
                        const son=fil.length>0?fil[fil.length-1]:null;
                        const onc=fil.length>1?fil[fil.length-2]:null;
                        const yoy=(son!=null&&onc!=null&&onc!==0)?((son-onc)/Math.abs(onc)*100):null;
                        const tVals=tumYillar.map(function(y){const d=h.yil&&h.yil[y]?h.yil[y]:null;return d?(d[fMetrik]!=null?d[fMetrik]:null):null;});
                        return (
                          <tr key={h.id} style={{background:i%2===0?"transparent":(dk?"#ffffff06":"#f8fafc")}}>
                            <td style={tdSt}>
                              <div style={{display:"flex", alignItems:"center", gap:8}}>
                                <div style={{width:3, height:32, borderRadius:2, background:h.renk, flexShrink:0}}/>
                                <div>
                                  <div style={{fontWeight:h.id==="thy"?800:500}}>{h.id==="thy"?"* ":""}{h.ad}</div>
                                  <div style={{fontSize:10, color:mute}}>{h.kod} {h.siklik}</div>
                                </div>
                              </div>
                            </td>
                            {vals.map((v,vi)=>(
                              <td key={vi} style={Object.assign({},tdSt,{textAlign:"right", color:v!=null?txt:mute})}>{metr.fmt(v)}</td>
                            ))}
                            <td style={Object.assign({},tdSt,{textAlign:"right", fontWeight:600, color:yoy==null?mute:(yoy>0?"#10b981":"#ef4444")})}>
                              {yoy==null?"-":((yoy>0?"+":"")+yoy.toFixed(1)+"%")}
                            </td>
                            <td style={Object.assign({},tdSt,{textAlign:"center"})}><Sparkline vals={tVals} color={h.renk}/></td>
                            <td style={tdSt}><a href={h.ir} target="_blank" rel="noopener noreferrer" style={{fontSize:11, color:"#6366f1", textDecoration:"none"}}>IR</a></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Çeyreklik */}
            {fGor==="ceyrek" && (
              <div style={cSt()}>
                <div style={{fontSize:16, fontWeight:700, marginBottom:4}}>Ceyreklik ve Yariyil Sonuclar</div>
                <div style={{fontSize:12, color:mute, marginBottom:14}}>Rapor yayinlayan havayollari en guncel veriler</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                    <thead>
                      <tr>
                        <th style={thSt}>Havayolu</th>
                        <th style={thSt}>Donem</th>
                        <th style={Object.assign({},thSt,{textAlign:"right"})}>Gelir</th>
                        <th style={Object.assign({},thSt,{textAlign:"right"})}>Net Kar</th>
                        <th style={Object.assign({},thSt,{textAlign:"right"})}>Yolcu</th>
                        <th style={Object.assign({},thSt,{textAlign:"right"})}>Doluluk</th>
                        <th style={thSt}>Kaynak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aktifHY.filter(h=>h.q&&h.q.length>0).reduce(function(acc,h,hi){
                        h.q.forEach(function(q,qi){acc.push({h,q,hi,qi,total:h.q.length});});
                        return acc;
                      },[]).map(function(row,i){
                        const h=row.h,q=row.q;
                        return (
                          <tr key={h.id+q.d} style={{background:i%2===0?"transparent":(dk?"#ffffff06":"#f8fafc")}}>
                            {row.qi===0?(
                              <td style={Object.assign({},tdSt,{fontWeight:600})} rowSpan={row.total}>
                                <div style={{display:"flex", alignItems:"center", gap:6}}>
                                  <div style={{width:3, height:32, borderRadius:2, background:h.renk}}/>
                                  <span>{h.id==="thy"?"* ":""}{h.ad}</span>
                                </div>
                              </td>
                            ):null}
                            <td style={tdSt}>
                              <div style={{display:"flex", alignItems:"center", gap:6}}>
                                <span style={tagSt(q.yeni?h.renk:mute)}>{q.d}</span>
                                {q.yeni&&<span style={{fontSize:9,fontWeight:700,color:h.renk,background:h.renk+"18",padding:"1px 4px",borderRadius:3}}>YENi</span>}
                              </div>
                            </td>
                            <td style={Object.assign({},tdSt,{textAlign:"right"})}>{q.g!=null?"$"+q.g.toFixed(1)+"B":"-"}</td>
                            <td style={Object.assign({},tdSt,{textAlign:"right", fontWeight:600, color:q.nk!=null?(q.nk>=0?"#10b981":"#ef4444"):mute})}>
                              {q.nk!=null?((q.nk>=0?"+":"")+Math.abs(q.nk).toFixed(2)+"B"):"-"}
                            </td>
                            <td style={Object.assign({},tdSt,{textAlign:"right"})}>{q.p!=null?q.p.toFixed(1)+"M":"-"}</td>
                            <td style={Object.assign({},tdSt,{textAlign:"right"})}>{q.lf!=null?q.lf.toFixed(1)+"%":"-"}</td>
                            <td style={tdSt}><a href={q.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#6366f1",textDecoration:"none"}}>Kaynak</a></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{fontSize:11,color:mute,marginTop:8}}>Emirates, Qatar ve Singapore Airlines ceyreklik rapor yayinlamaz.</div>
              </div>
            )}

            {/* Fark Analizi */}
            <div style={cSt()}>
              <div style={{fontSize:16, fontWeight:700, marginBottom:4}}>THY Rakip Fark Analizi — 2025</div>
              <div style={{fontSize:12, color:mute, marginBottom:12}}>+ THY onde, - Rakip onde, pp = yuzde puan</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                  <thead>
                    <tr>
                      <th style={thSt}>Rakip</th>
                      <th style={Object.assign({},thSt,{textAlign:"right"})}>Gelir</th>
                      <th style={Object.assign({},thSt,{textAlign:"right"})}>Net Kar</th>
                      <th style={Object.assign({},thSt,{textAlign:"right"})}>Isletme Marj</th>
                      <th style={Object.assign({},thSt,{textAlign:"right"})}>Yolcu</th>
                      <th style={Object.assign({},thSt,{textAlign:"right"})}>Doluluk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FIN_DATA.filter(h=>h.id!=="thy").map(function(h,i){
                      const thyY = THY&&THY.yil&&THY.yil["2025"]?THY.yil["2025"]:null;
                      const rakY = h.yil&&h.yil["2025"]?h.yil["2025"]:null;
                      function df(key, isB) {
                        if (!thyY||!rakY||thyY[key]==null||rakY[key]==null) return "-";
                        const d=thyY[key]-rakY[key];
                        const c=d>=0?"#10b981":"#ef4444";
                        const sign=d>=0?"+":"-";
                        const val=isB?"$"+Math.abs(d).toFixed(1)+"B":Math.abs(d).toFixed(1)+"pp";
                        return <span style={{color:c,fontWeight:600}}>{sign}{val}</span>;
                      }
                      return (
                        <tr key={h.id} style={{background:i%2===0?"transparent":(dk?"#ffffff06":"#f8fafc")}}>
                          <td style={tdSt}>
                            <div style={{display:"flex", alignItems:"center", gap:8}}>
                              <div style={{width:10, height:10, borderRadius:"50%", background:h.renk}}/>
                              {h.ad}
                            </div>
                          </td>
                          <td style={Object.assign({},tdSt,{textAlign:"right"})}>{df("g",true)}</td>
                          <td style={Object.assign({},tdSt,{textAlign:"right"})}>{df("nk",true)}</td>
                          <td style={Object.assign({},tdSt,{textAlign:"right"})}>{df("im",false)}</td>
                          <td style={Object.assign({},tdSt,{textAlign:"right"})}>{df("p",true)}</td>
                          <td style={Object.assign({},tdSt,{textAlign:"right"})}>{df("lf",false)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Veri Kaynakları */}
            <div style={Object.assign(cSt(), {background:dk?"#0f172a":"#f8fafc", padding:"16px 20px"})}>
              <div style={{fontSize:12, fontWeight:700, color:mute, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12}}>Veri Kaynaklari</div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:8}}>
                {FIN_DATA.map(function(h){
                  return (
                    <div key={h.id} style={{display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:card, borderRadius:8, border:"1px solid "+bord}}>
                      <div style={{width:8, height:8, borderRadius:"50%", background:h.renk, flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12, fontWeight:600, color:txt}}>{h.ad}</div>
                        <div style={{fontSize:11, color:mute}}>{h.ir_ad} — {h.siklik}{h.not?" — "+h.not:""}</div>
                      </div>
                      <a href={h.ir} target="_blank" rel="noopener noreferrer" style={{fontSize:11, color:"#6366f1", textDecoration:"none", flexShrink:0}}>IR</a>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:11, color:mute, marginTop:10, paddingTop:10, borderTop:"1px solid "+bord}}>
                Kur: fawazahmed0/exchange-api (jsDelivr CDN) — EUR/USD ~1.08 — SGD/USD ~0.74 — Son: {piyasa.ts||"—"}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
