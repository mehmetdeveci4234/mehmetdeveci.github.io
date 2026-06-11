import { useState, useEffect, useRef, useCallback } from "react";
// ─────────────────────────────────────────────────────────────────────────────
// VERİ KATMANI — Canlı API'lar
// ─────────────────────────────────────────────────────────────────────────────
// Döviz : api.frankfurter.dev   (ECB kaynaklı, ücretsiz, key yok, CORS açık)
// Enerji: fred.libhack.so       (FRED proxy, ücretsiz, CORS açık)
//   Brent : DCOILBRENTEU  ($/barrel, günlük)
//   Jet   : DJFUELUSGULF  ($/gallon, günlük → 0.264172 gal/litre çevrimi)
// ─────────────────────────────────────────────────────────────────────────────
const FRED_PROXY = "https://fred.libhack.so";
const FX_API    = "https://api.frankfurter.dev";
const FX_API_2  = "https://open.er-api.com/v6/latest";
// Yıllık rapor verileri — her çeyrek sonunda güncellenir
const FINANSAL_DATA = {
 havayollari: [
   {
     id:"thy", ad:"Turkish Airlines", kod:"THYAO", bors:"BIST",
     renk:"#C8102E", mali_yil:"Ocak–Aralık",
     ir_url:"https://investor.turkishairlines.com",
     aciklama:"İstanbul merkezli 130+ ülkeye uçuş",
     yillar:{
       "2021":{gelir:10.8, isletme_kar:0.8,  net_kar:0.5,  yolcu:56.0,  doluluk:70.1, isletme_marj:7.4,  net_marj:4.6,  filo:374, ask_buyume:null},
       "2022":{gelir:16.8, isletme_kar:2.6,  net_kar:2.4,  yolcu:71.4,  doluluk:79.8, isletme_marj:15.5, net_marj:14.3, filo:411, ask_buyume:36.1},
       "2023":{gelir:20.5, isletme_kar:3.6,  net_kar:3.0,  yolcu:83.4,  doluluk:82.3, isletme_marj:17.6, net_marj:14.6, filo:444, ask_buyume:16.2},
       "2024":{gelir:22.7, isletme_kar:4.18, net_kar:3.42, yolcu:90.2,  doluluk:84.1, isletme_marj:18.4, net_marj:15.1, filo:492, ask_buyume:10.6},
       "2025":{gelir:24.1, isletme_kar:3.65, net_kar:2.90, yolcu:97.2,  doluluk:84.8, isletme_marj:15.1, net_marj:12.0, filo:516, ask_buyume:7.5},
     },
   },
   {
     id:"emirates", ad:"Emirates", kod:"EK (özel)", bors:"Halka açık değil",
     renk:"#CC0001", mali_yil:"Nisan–Mart",
     ir_url:"https://www.emirates.com/media-centre/",
     aciklama:"Dubai merkezli, dünyanın en büyük uzun hat havayolu",
     not:"Emirates OP'yi ayrıştırmaz; işletme kârı satırı N/A.",
     yillar:{
       "2021":{gelir:12.5, isletme_kar:null, net_kar:-3.8, yolcu:16.1, doluluk:56.8, isletme_marj:null, net_marj:null,  filo:259, ask_buyume:null},
       "2022":{gelir:26.0, isletme_kar:null, net_kar:1.5,  yolcu:45.7, doluluk:72.0, isletme_marj:null, net_marj:5.8,  filo:259, ask_buyume:55.0},
       "2023":{gelir:32.6, isletme_kar:null, net_kar:4.7,  yolcu:51.9, doluluk:78.4, isletme_marj:null, net_marj:14.4, filo:260, ask_buyume:16.0},
       "2024":{gelir:36.9, isletme_kar:null, net_kar:4.7,  yolcu:52.1, doluluk:79.9, isletme_marj:null, net_marj:12.7, filo:261, ask_buyume:5.5},
       "2025":{gelir:39.6, isletme_kar:null, net_kar:5.19, yolcu:53.7, doluluk:78.9, isletme_marj:null, net_marj:14.9, filo:270, ask_buyume:4.0},
     },
   },
   {
     id:"lufthansa", ad:"Lufthansa Group", kod:"LHA", bors:"XETRA",
     renk:"#05164D", mali_yil:"Ocak–Aralık",
     ir_url:"https://investor-relations.lufthansagroup.com",
     aciklama:"Lufthansa, SWISS, Austrian, Brussels, Eurowings, ITA dahil",
     not:"EUR/USD ≈1.08 dönüşümü uygulandı.",
     yillar:{
       "2021":{gelir:17.8, isletme_kar:-1.7, net_kar:-2.2, yolcu:70.1,  doluluk:65.1, isletme_marj:-9.6, net_marj:-12.4,filo:785, ask_buyume:null},
       "2022":{gelir:34.1, isletme_kar:1.5,  net_kar:0.8,  yolcu:102.6, doluluk:78.4, isletme_marj:4.4,  net_marj:2.3,  filo:775, ask_buyume:36.0},
       "2023":{gelir:38.8, isletme_kar:2.7,  net_kar:1.7,  yolcu:123.0, doluluk:82.2, isletme_marj:7.0,  net_marj:4.4,  filo:783, ask_buyume:18.2},
       "2024":{gelir:40.6, isletme_kar:1.78, net_kar:1.51, yolcu:130.7, doluluk:83.1, isletme_marj:4.4,  net_marj:3.7,  filo:800, ask_buyume:6.6},
       "2025":{gelir:42.7, isletme_kar:2.12, net_kar:1.40, yolcu:135.0, doluluk:83.2, isletme_marj:4.9,  net_marj:3.3,  filo:821, ask_buyume:4.0},
     },
   },
   {
     id:"afklm", ad:"Air France-KLM", kod:"AF", bors:"Euronext",
     renk:"#002157", mali_yil:"Ocak–Aralık",
     ir_url:"https://www.airfranceklm.com/en/investors",
     aciklama:"Air France, KLM ve Transavia markaları dahil",
     not:"EUR/USD ≈1.08 dönüşümü uygulandı.",
     yillar:{
       "2021":{gelir:15.5, isletme_kar:-0.5, net_kar:-0.9, yolcu:63.2,  doluluk:68.1, isletme_marj:-3.2, net_marj:-5.8, filo:510, ask_buyume:null},
       "2022":{gelir:28.9, isletme_kar:1.3,  net_kar:0.7,  yolcu:88.1,  doluluk:80.0, isletme_marj:4.5,  net_marj:2.4,  filo:522, ask_buyume:35.0},
       "2023":{gelir:32.5, isletme_kar:1.7,  net_kar:0.9,  yolcu:97.6,  doluluk:86.4, isletme_marj:5.2,  net_marj:2.8,  filo:530, ask_buyume:12.5},
       "2024":{gelir:33.8, isletme_kar:1.72, net_kar:1.06, yolcu:98.0,  doluluk:87.8, isletme_marj:5.1,  net_marj:3.1,  filo:541, ask_buyume:4.9},
       "2025":{gelir:35.6, isletme_kar:2.16, net_kar:1.84, yolcu:102.8, doluluk:87.2, isletme_marj:6.1,  net_marj:5.2,  filo:545, ask_buyume:4.9},
     },
   },
   {
     id:"qatar", ad:"Qatar Airways", kod:"QR (özel)", bors:"Halka açık değil",
     renk:"#5C0632", mali_yil:"Nisan–Mart",
     ir_url:"https://www.qatarairways.com/en/pressreleases.html",
     aciklama:"Doha merkezli, Skytrax 5 yıldızlı; premium uzun hat operatörü",
     not:"Çeyreklik rapor yayınlanmaz. QAR/USD ≈0.274.",
     yillar:{
       "2021":{gelir:7.4,  isletme_kar:null, net_kar:-1.9, yolcu:22.7, doluluk:53.3, isletme_marj:null, net_marj:null, filo:228, ask_buyume:null},
       "2022":{gelir:17.7, isletme_kar:null, net_kar:1.5,  yolcu:34.2, doluluk:72.0, isletme_marj:null, net_marj:8.5,  filo:237, ask_buyume:null},
       "2023":{gelir:21.1, isletme_kar:null, net_kar:1.7,  yolcu:40.0, doluluk:83.0, isletme_marj:null, net_marj:8.1,  filo:250, ask_buyume:null},
       "2024":{gelir:22.2, isletme_kar:null, net_kar:2.15, yolcu:43.1, doluluk:85.0, isletme_marj:null, net_marj:9.7,  filo:261, ask_buyume:4.0},
       "2025":{gelir:23.6, isletme_kar:null, net_kar:1.94, yolcu:41.8, doluluk:84.0, isletme_marj:null, net_marj:8.2,  filo:262, ask_buyume:null},
     },
   },
   {
     id:"iag", ad:"IAG", kod:"IAG", bors:"LSE / BME",
     renk:"#1B3A6B", mali_yil:"Ocak–Aralık",
     ir_url:"https://www.iairgroup.com/investors",
     aciklama:"British Airways, Iberia, Vueling, Aer Lingus dahil",
     not:"EUR/USD ≈1.08 dönüşümü uygulandı.",
     yillar:{
       "2021":{gelir:11.8, isletme_kar:-0.8, net_kar:-2.9, yolcu:59.3,  doluluk:66.3, isletme_marj:-6.8, net_marj:null,  filo:520, ask_buyume:null},
       "2022":{gelir:23.0, isletme_kar:1.5,  net_kar:0.9,  yolcu:98.4,  doluluk:82.0, isletme_marj:6.5,  net_marj:3.9,  filo:530, ask_buyume:40.5},
       "2023":{gelir:29.3, isletme_kar:3.5,  net_kar:2.7,  yolcu:116.0, doluluk:86.5, isletme_marj:11.9, net_marj:9.2,  filo:540, ask_buyume:14.0},
       "2024":{gelir:32.1, isletme_kar:4.05, net_kar:3.24, yolcu:121.8, doluluk:86.8, isletme_marj:12.6, net_marj:10.1, filo:560, ask_buyume:7.8},
       "2025":{gelir:34.5, isletme_kar:4.28, net_kar:3.56, yolcu:127.5, doluluk:87.1, isletme_marj:12.4, net_marj:10.3, filo:571, ask_buyume:5.1},
     },
   },
 ],
};
const MOCK_HABERLER = [
 {id:1, tarih:"2026-06-10", baslik:"Amadeus NDC içerik dağıtımında 500 milyon rezervasyon rekorunu kırdı", ozet:"Amadeus, NDC tabanlı rezervasyon hacminin 500 milyon sınırını geçtiğini açıkladı. Dağıtım gelirleri %18 artış gösterdi.", kategori:"gds_ndc", havayolu:"Amadeus", kaynaklar:[{ad:"Amadeus IR",url:"https://amadeus.com"},{ad:"The Beat",url:"https://thebeat.travel"}], analizli:true},
 {id:2, tarih:"2026-06-09", baslik:"Turkish Airlines, Sabre acentelerine NDC teşvik paketi açıkladı", ozet:"THY, Sabre üzerinden NDC rezervasyonlarına ek komisyon ve erken koltuk seçimi avantajı sunuyor. Uygulama Türkiye ve Avrupa'yı kapsıyor.", kategori:"gds_ndc", havayolu:"Turkish Airlines", kaynaklar:[{ad:"THY Newsroom",url:"https://turkishairlines.com"}], analizli:false},
 {id:3, tarih:"2026-06-08", baslik:"Lufthansa Group 2025'te €39,6 milyar rekor gelir açıkladı", ozet:"Düzeltilmiş EBIT %19 büyüyerek 2 milyar Euro'ya ulaştı. 135 milyon yolcu taşındı.", kategori:"finansal", havayolu:"Lufthansa", kaynaklar:[{ad:"Lufthansa AR 2025",url:"https://report.lufthansagroup.com/2025/annual-report/en/"}], analizli:true},
 {id:4, tarih:"2026-06-07", baslik:"IATA: Küresel RPK büyümesi Mayıs 2026'da %9,2 ile beklentileri aştı", ozet:"Asya-Pasifik %14,1 ile en hızlı büyüyen bölge oldu.", kategori:"finansal", havayolu:"Tümü", kaynaklar:[{ad:"IATA Market Analysis",url:"https://iata.org"}], analizli:true},
 {id:5, tarih:"2026-06-06", baslik:"Travelport yapay zeka arama motorunu tüm GDS müşterilerine açtı", ozet:"Smartpoint Cloud'a entegre motor işlem süresini %60 kısaltıyor.", kategori:"teknoloji", havayolu:"Travelport", kaynaklar:[{ad:"Travelport PR",url:"https://travelport.com"},{ad:"Skift",url:"https://skift.com"}], analizli:false},
 {id:6, tarih:"2026-06-05", baslik:"Emirates ile Amadeus arasındaki dağıtım anlaşması yenilendi", ozet:"NDC içeriğinin tam sunumu ve dinamik fiyatlama etkinleştirildi.", kategori:"ortaklik", havayolu:"Emirates", kaynaklar:[{ad:"Emirates Newsroom",url:"https://emirates.com"}], analizli:true},
 {id:7, tarih:"2026-06-04", baslik:"AB Havacılık Otoritesi GDS şeffaflık yönetmeliği taslağı yayımladı", ozet:"İçerik eşitliği ve ücret şeffaflığı zorunluluğu 2027'de yürürlüğe girecek.", kategori:"duzenleyici", havayolu:"Tümü", kaynaklar:[{ad:"EASA",url:"https://easa.europa.eu"}], analizli:false},
 {id:8, tarih:"2026-06-03", baslik:"Air France-KLM 2025'te 102,8 milyon yolcuyla rekor kırdı", ozet:"33 milyar Euro gelir ve 2 milyar Euro işletme kârıyla tüm zamanların en iyi sonucu.", kategori:"finansal", havayolu:"Air France-KLM", kaynaklar:[{ad:"AF-KLM FY2025",url:"https://airfranceklm.com"}], analizli:true},
 {id:9, tarih:"2026-06-02", baslik:"Air France-KLM Sabre NDC entegrasyonunu tamamladı", ozet:"430.000'den fazla Sabre acentesi tüm tarife seçeneklerine erişebilecek.", kategori:"gds_ndc", havayolu:"Air France-KLM", kaynaklar:[{ad:"AF-KLM Press",url:"https://airfranceklm.com"}], analizli:true},
 {id:10, tarih:"2026-06-01", baslik:"Ryanair B737 MAX 10 siparişiyle filosunu genişletiyor", ozet:"2028'e kadar 100 yeni uçak teslim alınacak.", kategori:"filo", havayolu:"Ryanair", kaynaklar:[{ad:"Ryanair IR",url:"https://ryanair.com"}], analizli:false},
 {id:11, tarih:"2026-05-31", baslik:"Singapore Airlines AI fiyatlama motorunu 12 pazara yaydı", ozet:"Dönüşüm oranında %31 artış raporlandı.", kategori:"teknoloji", havayolu:"Singapore Airlines", kaynaklar:[{ad:"SIA Media Hub",url:"https://singaporeair.com"}], analizli:true},
 {id:12, tarih:"2026-05-30", baslik:"Wizz Air IATA ONE Order'a geçen ilk Avrupa LCC'si oldu", ozet:"Tüm sipariş bileşenleri tek kayıt altında birleştirildi.", kategori:"teknoloji", havayolu:"Wizz Air", kaynaklar:[{ad:"Wizz Air",url:"https://wizzair.com"}], analizli:false},
];
const KATEGORILER = [
 {id:"tumu",label:"Tümü"},{id:"gds_ndc",label:"GDS & NDC"},
 {id:"teknoloji",label:"Teknoloji"},{id:"ortaklik",label:"Ortaklık"},
 {id:"filo",label:"Filo & Rota"},{id:"finansal",label:"Finansal"},
 {id:"duzenleyici",label:"Düzenleyici"},{id:"diger",label:"Diğer"},
];
// ─────────────────────────────────────────────────────────────────────────────
// YARDIMCI HOOK — Canlı piyasa verileri
// ─────────────────────────────────────────────────────────────────────────────
function usePiyasa() {
 const [veri, setVeri] = useState({
   usdtry:null, eurtry:null, usdeur:null,
   brent:null, jet:null,
   usdtry_prev:null, eurtry_prev:null, usdeur_prev:null,
   brent_prev:null, jet_prev:null,
   son_guncelleme:null, yukleniyor:true, hata:null,
 });
 const cek = useCallback(async () => {
   setVeri(p=>({...p, yukleniyor:true, hata:null}));
   try {
     // 1) Döviz — Frankfurter (key yok, CORS açık)
    let usdtry = null, usdeur = null;
try {
 const fxRes = await fetch(`${FX_API}/v2/rates?base=USD&quotes=TRY,EUR`);
 const fxData = await fxRes.json();
 usdtry = fxData?.rates?.TRY ?? null;
 usdeur = fxData?.rates?.EUR ?? null;
} catch {
 const fxRes2 = await fetch(`${FX_API_2}/USD`);
 const fxData2 = await fxRes2.json();
 usdtry = fxData2?.rates?.TRY ?? null;
 usdeur = fxData2?.rates?.EUR ?? null;
}
     const eurtry = usdtry && usdeur ? usdtry / usdeur : null;
     // Dünkü döviz
     const dun = new Date(); dun.setDate(dun.getDate()-1);
     const dunStr = dun.toISOString().split("T")[0];
     const fxPrevRes = await fetch(
       `${FX_API}/v2/rates?base=USD&quotes=TRY,EUR&date=${dunStr}`
     );
     const fxPrevData = await fxPrevRes.json();
     const usdtry_prev = fxPrevData?.rates?.TRY ?? null;
     const usdeur_prev = fxPrevData?.rates?.EUR ?? null;
     const eurtry_prev = usdtry_prev && usdeur_prev ? usdtry_prev / usdeur_prev : null;
     // 2) Brent petrol — FRED proxy (son 5 gün)
     const brentRes = await fetch(
       `${FRED_PROXY}/v0/observations?series_id=DCOILBRENTEU&observation_start=${getDateMinus(10)}`
     );
     const brentArr = await brentRes.json();
     const brentFiltered = brentArr.filter(x=>x.value!=="." && x.value!==null);
     const brent = brentFiltered.length>0 ? parseFloat(brentFiltered[brentFiltered.length-1].value) : null;
     const brent_prev = brentFiltered.length>1 ? parseFloat(brentFiltered[brentFiltered.length-2].value) : null;
     // 3) Jet yakıt — FRED proxy (son 10 gün, haftalık veri)
     const jetRes = await fetch(
       `${FRED_PROXY}/v0/observations?series_id=DJFUELUSGULF&observation_start=${getDateMinus(30)}`
     );
     const jetArr = await jetRes.json();
     const jetFiltered = jetArr.filter(x=>x.value!=="." && x.value!==null);
     // $/gallon → $/litre için 0.264172 bölücü; barrel için *42 gallon/barrel
     const jet_gal = jetFiltered.length>0 ? parseFloat(jetFiltered[jetFiltered.length-1].value) : null;
     const jet_gal_prev = jetFiltered.length>1 ? parseFloat(jetFiltered[jetFiltered.length-2].value) : null;
     const jet = jet_gal ? +(jet_gal * 42).toFixed(2) : null; // $/barrel equiv
     const jet_prev = jet_gal_prev ? +(jet_gal_prev * 42).toFixed(2) : null;
     setVeri({
       usdtry, eurtry, usdeur,
       usdtry_prev, eurtry_prev, usdeur_prev,
       brent, brent_prev, jet, jet_prev,
       son_guncelleme: new Date().toLocaleTimeString("tr-TR"),
       yukleniyor:false, hata:null,
     });
   } catch (e) {
     setVeri(p=>({...p, yukleniyor:false, hata:"Veri alınamadı — ağ veya API hatası"}));
   }
 }, []);
 useEffect(() => {
   cek();
   const iv = setInterval(cek, 5 * 60 * 1000); // 5 dk'da bir
   return () => clearInterval(iv);
 }, [cek]);
 return { ...veri, yenile: cek };
}
function getDateMinus(gun) {
 const d = new Date(); d.setDate(d.getDate()-gun);
 return d.toISOString().split("T")[0];
}
// ─────────────────────────────────────────────────────────────────────────────
// PİYASA TICKER BİLEŞENİ
// ─────────────────────────────────────────────────────────────────────────────
function PiyasaBanti({ piyasa, dk }) {
 const c = dk ? { bg:"#0f172a", card:"#1e293b", bord:"#334155", text:"#e2e8f0", muted:"#94a3b8" }
               : { bg:"#f8fafc", card:"#ffffff", bord:"#e2e8f0", text:"#1e293b", muted:"#475569" };
 const items = [
   { label:"USD/TRY",  val:piyasa.usdtry,  prev:piyasa.usdtry_prev,  fmt: v=>`₺${v.toFixed(2)}`,  aciklama:"Türk Lirası, günlük · ECB" },
   { label:"EUR/TRY",  val:piyasa.eurtry,  prev:piyasa.eurtry_prev,  fmt: v=>`₺${v.toFixed(2)}`,  aciklama:"Türk Lirası, günlük · ECB" },
   { label:"USD/EUR",  val:piyasa.usdeur,  prev:piyasa.usdeur_prev,  fmt: v=>`€${v.toFixed(4)}`,  aciklama:"Euro parity · ECB" },
   { label:"Brent Ham Petrol", val:piyasa.brent, prev:piyasa.brent_prev, fmt: v=>`$${v.toFixed(1)}/bbl`, aciklama:"$/varil · FRED/EIA" },
   { label:"Jet Yakıtı",       val:piyasa.jet,   prev:piyasa.jet_prev,  fmt: v=>`$${v.toFixed(1)}/bbl`, aciklama:"$/barrel equiv. · FRED/EIA" },
 ];
 return (
<div style={{background:c.card,borderBottom:`1px solid ${c.bord}`,padding:"0 20px"}}>
<div style={{maxWidth:1300,margin:"0 auto",display:"flex",flexWrap:"wrap",gap:0,alignItems:"stretch"}}>
       {piyasa.yukleniyor ? (
<div style={{padding:"10px 0",fontSize:12,color:c.muted,display:"flex",alignItems:"center",gap:6}}>
<span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span> Piyasa verileri yükleniyor…
</div>
       ) : piyasa.hata ? (
<div style={{padding:"10px 0",fontSize:12,color:"#ef4444",display:"flex",alignItems:"center",gap:8}}>
           ⚠ {piyasa.hata}
<button onClick={piyasa.yenile} style={{fontSize:11,background:"transparent",border:`1px solid #ef4444`,color:"#ef4444",padding:"2px 8px",borderRadius:6,cursor:"pointer"}}>Yenile</button>
</div>
       ) : (
         items.map((item,i) => {
           const val = item.val;
           const prev = item.prev;
           const degisim = (val && prev) ? ((val-prev)/Math.abs(prev))*100 : null;
           const yukari = degisim !== null && degisim > 0;
           const asagi = degisim !== null && degisim < 0;
           // Döviz için TL değeri yükselirse kötü (TL zayıfladı), petrol için yükseliş kötü
           const isAlert = (i < 2 && yukari) || (i >= 3 && yukari);
           return (
<div key={item.label} style={{
               padding:"8px 18px 8px 0", marginRight:18,
               borderRight: i < items.length-1 ? `1px solid ${c.bord}` : "none",
               display:"flex",flexDirection:"column",justifyContent:"center",
               minWidth:130,
             }}>
<div style={{fontSize:10,fontWeight:700,color:c.muted,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>{item.label}</div>
<div style={{display:"flex",alignItems:"baseline",gap:6}}>
<span style={{fontSize:16,fontWeight:800,letterSpacing:"-0.5px",color:c.text,fontVariantNumeric:"tabular-nums"}}>
                   {val !== null ? item.fmt(val) : "—"}
</span>
                 {degisim !== null && (
<span style={{fontSize:11,fontWeight:600,color:asagi?"#10b981":yukari?"#ef4444":"#94a3b8"}}>
                     {yukari?"↑":"↓"}{Math.abs(degisim).toFixed(2)}%
</span>
                 )}
</div>
<div style={{fontSize:10,color:c.muted,marginTop:1}}>{item.aciklama}</div>
</div>
           );
         })
       )}
       {!piyasa.yukleniyor && !piyasa.hata && (
<div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,fontSize:11,color:c.muted}}>
<span>⟳ {piyasa.son_guncelleme}</span>
<button onClick={piyasa.yenile} title="Yenile" style={{background:"transparent",border:`1px solid ${c.bord}`,color:c.muted,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11}}>Yenile</button>
</div>
       )}
</div>
</div>
 );
}
// ─────────────────────────────────────────────────────────────────────────────
// SPARKLINE
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ vals, renk, h=28, w=80 }) {
 const t = vals.filter(v=>v!==null&&v!==undefined);
 if (t.length < 2) return <span style={{color:"#94a3b8",fontSize:11}}>—</span>;
 const mn = Math.min(...t), mx = Math.max(...t), rng = mx-mn||1;
 const step = w/(t.length-1);
 const pts = t.map((v,i)=>`${(i*step).toFixed(1)},${(h-((v-mn)/rng)*h).toFixed(1)}`).join(" ");
 const lx = (t.length-1)*step, ly = h-((t[t.length-1]-mn)/rng)*h;
 return (
<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
<polyline points={pts} fill="none" stroke={renk} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
<circle cx={lx} cy={ly} r="2.5" fill={renk}/>
</svg>
 );
}
// ─────────────────────────────────────────────────────────────────────────────
// ANA UYGULAMA
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
 const [tema, setTema] = useState("acik");
 const [sekme, setSekme] = useState("haberler");
 const [kategori, setKategori] = useState("tumu");
 const [havayolu, setHavayolu] = useState("Tümü");
 const [arama, setArama] = useState("");
 const [analizliOnly, setAnalizliOnly] = useState(false);
 const [finMetrik, setFinMetrik] = useState("gelir");
 const [finYillar, setFinYillar] = useState(["2023","2024","2025"]);
 const [secilenHY, setSecilenHY] = useState(FINANSAL_DATA.havayollari.map(h=>h.id));
 const [chatAcik, setChatAcik] = useState(false);
 const [chatMesajlar, setChatMesajlar] = useState([
   {rol:"asistan",icerik:"Hava yolcu taşımacılığı ve sektörel finansallar konusunda sorularını yanıtlayabilirim. Ne öğrenmek istersin?"}
 ]);
 const [chatGiris, setChatGiris] = useState("");
 const [chatYukluyor, setChatYukluyor] = useState(false);
 const chatSonRef = useRef(null);
 const piyasa = usePiyasa();
 const dk = tema === "karanlik";
 const c = {
   bg:    dk?"#0f172a":"#f8fafc",
   card:  dk?"#1e293b":"#ffffff",
   bord:  dk?"#334155":"#e2e8f0",
   text:  dk?"#e2e8f0":"#1e293b",
   sub:   dk?"#94a3b8":"#475569",
   muted: "#94a3b8",
 };
 useEffect(() => { chatSonRef.current?.scrollIntoView({behavior:"smooth"}); }, [chatMesajlar]);
 async function chatGonder(soru) {
   const mesaj = soru||chatGiris.trim(); if(!mesaj) return;
   setChatGiris(""); setChatMesajlar(p=>[...p,{rol:"kullanici",icerik:mesaj}]); setChatYukluyor(true);
   const ctx = FINANSAL_DATA.havayollari.map(h=>`${h.ad} 2025: Gelir $${h.yillar["2025"].gelir}B, Net Kâr $${h.yillar["2025"].net_kar}B, Yolcu ${h.yillar["2025"].yolcu}M, Doluluk ${h.yillar["2025"].doluluk}%`).join("\n");
   const piyasaCtx = piyasa.usdtry ? `Güncel: USD/TRY=${piyasa.usdtry?.toFixed(2)}, EUR/TRY=${piyasa.eurtry?.toFixed(2)}, Brent=$${piyasa.brent}/bbl` : "";
   try {
     const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
       model:"claude-sonnet-4-20250514",max_tokens:800,
       system:`Sen THY üst yönetimine sunum yapan bir havacılık finansal analistisin. Kısa, öz, aksiyon odaklı Türkçe yanıt ver.\n\nFinansal veriler:\n${ctx}\n${piyasaCtx}`,
       messages:[{role:"user",content:mesaj}]
     })});
     const d = await res.json();
     setChatMesajlar(p=>[...p,{rol:"asistan",icerik:d.content?.[0]?.text||"Yanıt alınamadı."}]);
   } catch { setChatMesajlar(p=>[...p,{rol:"asistan",icerik:"Hata oluştu."}]); }
   finally { setChatYukluyor(false); }
 }
 const filtreli = MOCK_HABERLER.filter(h=>{
   if(kategori!=="tumu"&&h.kategori!==kategori) return false;
   if(havayolu!=="Tümü"&&h.havayolu!==havayolu) return false;
   if(analizliOnly&&!h.analizli) return false;
   if(arama){const q=arama.toLowerCase(); if(!h.baslik.toLowerCase().includes(q)&&!h.ozet.toLowerCase().includes(q)) return false;}
   return true;
 });
 const metrикler = {
   gelir:        {label:"Toplam Gelir (USD B)",    fmt:v=>v!=null?`$${v.toFixed(1)}B`:"—",  renk:"#6366f1"},
   net_kar:      {label:"Net Kâr (USD B)",         fmt:v=>v!=null?`$${v.toFixed(2)}B`:"—",  renk:"#10b981"},
   isletme_kar:  {label:"İşl. Kârı EBIT (USD B)", fmt:v=>v!=null?`$${v.toFixed(2)}B`:"—",  renk:"#0ea5e9"},
   isletme_marj: {label:"İşl. Marjı %",           fmt:v=>v!=null?`${v.toFixed(1)}%`:"—",   renk:"#f59e0b"},
   net_marj:     {label:"Net Marj %",             fmt:v=>v!=null?`${v.toFixed(1)}%`:"—",   renk:"#8b5cf6"},
   yolcu:        {label:"Yolcu (Milyon)",         fmt:v=>v!=null?`${v.toFixed(1)}M`:"—",   renk:"#ef4444"},
   doluluk:      {label:"Doluluk PLF %",          fmt:v=>v!=null?`${v.toFixed(1)}%`:"—",   renk:"#14b8a6"},
   filo:         {label:"Filo (uçak)",            fmt:v=>v!=null?`${v}`:"—",               renk:"#f97316"},
 };
 const aktifHY = FINANSAL_DATA.havayollari.filter(h=>secilenHY.includes(h.id));
 const thyObj  = FINANSAL_DATA.havayollari.find(h=>h.id==="thy");
 const katRenkler = {gds_ndc:"#6366f1",teknoloji:"#0ea5e9",ortaklik:"#10b981",filo:"#f59e0b",finansal:"#ef4444",duzenleyici:"#8b5cf6",diger:"#94a3b8"};
 const s = {
   app:  {minHeight:"100vh",background:c.bg,color:c.text,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",fontSize:14},
   hdr:  {background:c.card,borderBottom:`1px solid ${c.bord}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52,position:"sticky",top:0,zIndex:100},
   logo: {display:"flex",alignItems:"center",gap:10,fontWeight:700,fontSize:15,letterSpacing:"-0.3px"},
   nav:  {background:c.card,borderBottom:`1px solid ${c.bord}`,padding:"0 24px",display:"flex",gap:4,overflowX:"auto",position:"sticky",top:52,zIndex:99},
   tab:  a=>({padding:"10px 14px",cursor:"pointer",border:"none",background:"transparent",color:a?"#6366f1":c.muted,fontWeight:a?600:400,fontSize:13,borderBottom:a?"2px solid #6366f1":"2px solid transparent",whiteSpace:"nowrap"}),
   main: {maxWidth:1300,margin:"0 auto",padding:"24px 16px"},
   card: {background:c.card,border:`1px solid ${c.bord}`,borderRadius:12,padding:20,marginBottom:16},
   btn:  (a,r="#6366f1")=>({padding:"6px 13px",borderRadius:8,border:`1px solid ${a?r:c.bord}`,background:a?r:"transparent",color:a?"#fff":c.muted,fontSize:12,fontWeight:a?600:400,cursor:"pointer",transition:"all 0.12s"}),
   chip: a=>({padding:"5px 12px",borderRadius:20,border:`1px solid ${a?"#6366f1":c.bord}`,background:a?"#6366f1":"transparent",color:a?"#fff":c.muted,fontSize:12,fontWeight:a?600:400,cursor:"pointer"}),
   th:   {padding:"10px 14px",textAlign:"left",fontWeight:600,color:c.muted,fontSize:11,textTransform:"uppercase",letterSpacing:"0.4px",whiteSpace:"nowrap",borderBottom:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc"},
   td:   {padding:"11px 14px",borderBottom:`1px solid ${c.bord}50`,verticalAlign:"middle"},
   tag:  r=>({fontSize:11,fontWeight:600,color:r,background:r+"18",padding:"2px 8px",borderRadius:6}),
   h2:   {fontSize:17,fontWeight:700,marginBottom:16,letterSpacing:"-0.3px"},
   info: {background:dk?"#1e293b90":"#f0f9ff",border:`1px solid ${dk?"#334155":"#bae6fd"}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:dk?"#7dd3fc":"#0369a1",marginBottom:16},
 };
 return (
<div style={s.app}>
<style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
     {/* HEADER */}
<header style={s.hdr}>
<div style={s.logo}>
<div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✈️</div>
<span>Yolcu Taşımacılığı Bülteni</span>
<span style={{fontSize:10,fontWeight:700,background:"#6366f1",color:"#fff",padding:"2px 7px",borderRadius:10}}>BETA</span>
</div>
<button style={s.btn(false)} onClick={()=>setTema(dk?"acik":"karanlik")}>{dk?"☀️ Aydınlık":"🌙 Karanlık"}</button>
</header>
     {/* PİYASA BANTI */}
<PiyasaBanti piyasa={piyasa} dk={dk}/>
     {/* NAV */}
<nav style={s.nav}>
       {[
         {id:"haberler",    label:"📰 Haberler"},
         {id:"gostergeler", label:"📈 Göstergeler"},
         {id:"raporlar",    label:"📄 Raporlar"},
         {id:"finansallar", label:"📊 Sektörel Finansallar"},
       ].map(t=><button key={t.id} style={s.tab(sekme===t.id)} onClick={()=>setSekme(t.id)}>{t.label}</button>)}
</nav>
<main style={s.main}>
       {/* ══ HABERLER ══ */}
       {sekme==="haberler" && <>
<div style={{...s.card,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",padding:"14px 18px"}}>
<div style={{flex:"1 1 200px",position:"relative"}}>
<span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:c.muted}}>🔍</span>
<input style={{width:"100%",padding:"8px 12px 8px 34px",borderRadius:8,border:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc",color:c.text,fontSize:13,outline:"none",boxSizing:"border-box"}} placeholder="Haber ara…" value={arama} onChange={e=>setArama(e.target.value)}/>
</div>
<select style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc",color:c.text,fontSize:13,outline:"none"}} value={havayolu} onChange={e=>setHavayolu(e.target.value)}>
             {["Tümü","Turkish Airlines","Emirates","Lufthansa","Air France-KLM","Qatar Airways","Ryanair","Singapore Airlines","Wizz Air","Amadeus","Sabre","Travelport"].map(h=><option key={h}>{h}</option>)}
</select>
<label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}>
<input type="checkbox" checked={analizliOnly} onChange={e=>setAnalizliOnly(e.target.checked)} style={{accentColor:"#10b981"}}/>Yalnızca Analizli
</label>
           {(arama||havayolu!=="Tümü"||kategori!=="tumu"||analizliOnly)&&<button style={s.btn(false)} onClick={()=>{setArama("");setHavayolu("Tümü");setKategori("tumu");setAnalizliOnly(false);}}>✕ Temizle</button>}
</div>
<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:18}}>
           {KATEGORILER.map(k=><button key={k.id} style={s.chip(kategori===k.id)} onClick={()=>setKategori(k.id)}>{k.label}</button>)}
</div>
         {filtreli.length===0
           ? <div style={{textAlign:"center",padding:"60px 20px",color:c.muted}}><div style={{fontSize:32,marginBottom:8}}>🔍</div><div>Sonuç bulunamadı</div></div>
           : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:14}}>
               {filtreli.map(h=>(
<div key={h.id} style={s.card}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
<span style={s.tag(katRenkler[h.kategori]||"#94a3b8")}>{KATEGORILER.find(k=>k.id===h.kategori)?.label}</span>
<span style={{fontSize:11,color:c.muted}}>{new Date(h.tarih).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})}</span>
</div>
<div style={{fontWeight:600,fontSize:14,lineHeight:1.45,marginBottom:7}}>{h.baslik}</div>
<div style={{fontSize:12,lineHeight:1.6,color:c.sub,marginBottom:12}}>{h.ozet}</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                       {h.kaynaklar.map(k=><a key={k.ad} href={k.url} target="_blank" rel="noopener" style={{fontSize:11,color:"#6366f1",textDecoration:"none",background:"#6366f115",padding:"2px 8px",borderRadius:6}}>{k.ad}</a>)}
</div>
                     {h.analizli&&<span style={{fontSize:11,fontWeight:600,color:"#10b981",background:"#10b98115",padding:"2px 8px",borderRadius:6}}>✦ Analizli</span>}
</div>
</div>
               ))}
</div>
         }
</>}
       {/* ══ GÖSTERGELER ══ */}
       {sekme==="gostergeler" && <>
<div style={s.h2}>IATA Pazar Göstergeleri</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14,marginBottom:24}}>
           {[
             {label:"IATA Küresel RPK",deger:"+9,2%",birim:"Mayıs 2026 · yıllık",renk:"#10b981",aciklama:"Revenue Passenger Km"},
             {label:"Küresel ASK",deger:"+7,4%",birim:"Mayıs 2026 · yıllık",renk:"#6366f1",aciklama:"Available Seat Km"},
             {label:"Doluluk (PLF)",deger:"83,7%",birim:"Mayıs 2026",renk:"#f59e0b",aciklama:"Passenger Load Factor"},
             {label:"NDC Penetrasyon",deger:"~34%",birim:"Tahmin 2026",renk:"#8b5cf6",aciklama:"Toplam bilet satışlarında NDC payı"},
           ].map(e=>(
<div key={e.label} style={{background:c.card,border:`1px solid ${c.bord}`,borderLeft:`3px solid ${e.renk}`,borderRadius:10,padding:"16px 18px"}}>
<div style={{fontSize:28,fontWeight:800,color:e.renk,letterSpacing:"-1px",lineHeight:1,marginBottom:4}}>{e.deger}</div>
<div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{e.label}</div>
<div style={{fontSize:11,color:c.muted,marginBottom:4}}>{e.birim}</div>
<div style={{fontSize:11,color:c.muted}}>{e.aciklama}</div>
</div>
           ))}
</div>
<div style={s.card}>
<div style={{fontWeight:600,marginBottom:14}}>Bölgesel RPK Büyümesi — Mayıs 2026</div>
           {[{b:"Asya-Pasifik",v:14.1,r:"#0ea5e9"},{b:"Orta Doğu",v:11.3,r:"#8b5cf6"},{b:"Latin Amerika",v:9.8,r:"#10b981"},{b:"Kuzey Amerika",v:8.1,r:"#f59e0b"},{b:"Avrupa",v:7.4,r:"#6366f1"},{b:"Afrika",v:6.9,r:"#ef4444"}].map(x=>(
<div key={x.b} style={{marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
<span style={{fontSize:13}}>{x.b}</span><span style={{fontSize:13,fontWeight:700,color:x.r}}>+{x.v}%</span>
</div>
<div style={{height:6,background:dk?"#0f172a":"#f1f5f9",borderRadius:4,overflow:"hidden"}}>
<div style={{height:"100%",width:`${(x.v/15)*100}%`,background:x.r,borderRadius:4}}/>
</div>
</div>
           ))}
<div style={{fontSize:11,color:c.muted,marginTop:8}}>Kaynak: IATA Air Passenger Market Analysis · Mayıs 2026</div>
</div>
</>}
       {/* ══ RAPORLAR ══ */}
       {sekme==="raporlar" && <>
<div style={s.h2}>Yayınlar & Raporlar</div>
         {[
           {id:1,baslik:"IATA Aylık Yolcu Analizi — Mayıs 2026",tarih:"Haziran 2026",ozet:"Küresel RPK büyümesi beklentileri aştı. Asya-Pasifik öncülüğünde güçlü seyahat talebi devam ediyor.",url:"https://iata.org",etiket:"IATA"},
           {id:2,baslik:"Amadeus Dağıtım Endeksi Q1 2026",tarih:"Nisan 2026",ozet:"NDC içerik büyümesi ivmelendi. GDS NDC rezervasyonları %42 arttı.",url:"https://amadeus.com",etiket:"Amadeus"},
           {id:3,baslik:"Phocuswright: Havacılık Dağıtım Panosu 2026",tarih:"Mayıs 2026",ozet:"Havayollarının doğrudan gelir payı %51'i aştı.",url:"https://phocuswright.com",etiket:"Phocuswright"},
         ].map(r=>(
<div key={r.id} style={{...s.card,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}>
<div>
<div style={{display:"flex",gap:8,marginBottom:6}}><span style={s.tag("#6366f1")}>{r.etiket}</span><span style={{fontSize:11,color:c.muted}}>{r.tarih}</span></div>
<div style={{fontWeight:600,fontSize:14,marginBottom:6}}>{r.baslik}</div>
<div style={{fontSize:13,color:c.sub,lineHeight:1.55}}>{r.ozet}</div>
</div>
<a href={r.url} target="_blank" rel="noopener" style={{padding:"8px 16px",background:"#6366f1",color:"#fff",borderRadius:8,fontSize:12,fontWeight:600,textDecoration:"none",flexShrink:0}}>Aç →</a>
</div>
         ))}
</>}
       {/* ══ SEKTÖREL FİNANSALLAR ══ */}
       {sekme==="finansallar" && <>
         {/* Bilgi notu */}
<div style={s.info}>
           ℹ️ Veriler ilgili havayollarının <b>resmi yıllık raporları ve IR duyurularından</b> derlenmiştir. USD cinsinden gösterilir (EUR/USD≈1.08). Emirates ve Qatar halka açık olmadığından işletme kârı ayrıştırılmamaktadır. Piyasa verileri otomatik olarak güncellenmektedir.
</div>
         {/* THY SNAPSHOT */}
<div style={{...s.card,borderLeft:`4px solid #C8102E`}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:8}}>
<div>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
<span style={{fontSize:16,fontWeight:800,color:"#C8102E"}}>⭐ Turkish Airlines — 2025 Özeti</span>
<span style={s.tag("#C8102E")}>THYAO · BIST</span>
</div>
<div style={{fontSize:12,color:c.muted}}>{thyObj.aciklama}</div>
</div>
<a href={thyObj.ir_url} target="_blank" rel="noopener" style={{fontSize:12,color:"#6366f1",textDecoration:"none"}}>IR sayfası →</a>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:12}}>
             {[
               {label:"Toplam Gelir",val:`$${thyObj.yillar["2025"].gelir}B`,   renk:"#6366f1"},
               {label:"Net Kâr",     val:`$${thyObj.yillar["2025"].net_kar}B`, renk:"#10b981"},
               {label:"İşl. Kârı",  val:`$${thyObj.yillar["2025"].isletme_kar}B`,renk:"#0ea5e9"},
               {label:"İşl. Marjı", val:`${thyObj.yillar["2025"].isletme_marj}%`,renk:"#f59e0b"},
               {label:"Yolcu",      val:`${thyObj.yillar["2025"].yolcu}M`,      renk:"#ef4444"},
               {label:"Doluluk",    val:`${thyObj.yillar["2025"].doluluk}%`,    renk:"#14b8a6"},
               {label:"Filo",       val:`${thyObj.yillar["2025"].filo} uçak`,   renk:"#f97316"},
               {label:"ASK Büyüme", val:`+${thyObj.yillar["2025"].ask_buyume}%`,renk:"#8b5cf6"},
             ].map(({label,val,renk})=>(
<div key={label} style={{background:dk?"#0f172a":"#f8fafc",borderRadius:8,padding:"12px 14px"}}>
<div style={{fontSize:11,color:c.muted,marginBottom:3}}>{label}</div>
<div style={{fontSize:19,fontWeight:800,color:renk,letterSpacing:"-0.5px"}}>{val}</div>
</div>
             ))}
</div>
<div style={{fontSize:11,color:c.muted,marginTop:12}}>Kaynak: THYAO 2025 Yıllık Rapor · aerotime.aero (Mart 2026)</div>
</div>
         {/* KONTROL PANELİ */}
<div style={{...s.card,padding:"16px 20px"}}>
<div style={{display:"flex",flexWrap:"wrap",gap:16,alignItems:"flex-start"}}>
<div>
<div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Metrik</div>
<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                 {Object.entries(metrикler).map(([k,v])=>(
<button key={k} style={s.btn(finMetrik===k,v.renk)} onClick={()=>setFinMetrik(k)}>{v.label.split("(")[0].trim()}</button>
                 ))}
</div>
</div>
<div>
<div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Yıllar</div>
<div style={{display:"flex",gap:5}}>
                 {["2021","2022","2023","2024","2025"].map(y=>(
<button key={y} style={s.btn(finYillar.includes(y))} onClick={()=>setFinYillar(p=>p.includes(y)?p.filter(x=>x!==y):[...p,y].sort())}>{y}</button>
                 ))}
</div>
</div>
<div>
<div style={{fontSize:11,fontWeight:600,color:c.muted,marginBottom:6,textTransform:"uppercase"}}>Havayolları</div>
<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
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
         {/* ANA TABLO */}
<div style={s.card}>
<div style={{marginBottom:14}}>
<div style={s.h2}>{metrикler[finMetrik].label}</div>
<div style={{fontSize:12,color:c.muted}}>{finYillar.join(", ")} karşılaştırması · Tüm değerler USD</div>
</div>
<div style={{overflowX:"auto"}}>
<table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
<thead>
<tr>
<th style={s.th}>Havayolu</th>
                   {finYillar.map(y=><th key={y} style={{...s.th,textAlign:"right"}}>{y}</th>)}
<th style={{...s.th,textAlign:"right"}}>YoY '25</th>
<th style={{...s.th,textAlign:"center"}}>Trend</th>
<th style={s.th}>IR</th>
</tr>
</thead>
<tbody>
                 {aktifHY.map((h,i)=>{
                   const vals = finYillar.map(y=>h.yillar[y]?.[finMetrik]??null);
                   const s25 = h.yillar["2025"]?.[finMetrik]??null;
                   const s24 = h.yillar["2024"]?.[finMetrik]??null;
                   const yoy = s25!==null&&s24!==null&&s24!==0 ? ((s25-s24)/Math.abs(s24))*100 : null;
                   const olumlu = yoy!==null&&yoy>0;
                   const trendVals = ["2021","2022","2023","2024","2025"].map(y=>h.yillar[y]?.[finMetrik]??null);
                   const isTHY = h.id==="thy";
                   return (
<tr key={h.id} style={{background:i%2===0?"transparent":dk?"#ffffff06":"#f8fafc",outline:isTHY?`1px solid ${h.renk}30`:"none"}}>
<td style={s.td}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{width:3,height:34,borderRadius:2,background:h.renk,flexShrink:0}}/>
<div>
<div style={{fontWeight:isTHY?800:500,display:"flex",alignItems:"center",gap:5}}>
                               {isTHY&&<span>⭐</span>}{h.ad}
</div>
<div style={{fontSize:11,color:c.muted}}>{h.kod} · {h.bors}</div>
</div>
</div>
</td>
                       {vals.map((v,vi)=>(
<td key={vi} style={{...s.td,textAlign:"right",fontVariantNumeric:"tabular-nums",color:v!==null?c.text:c.muted}}>
                           {metrикler[finMetrik].fmt(v)}
</td>
                       ))}
<td style={{...s.td,textAlign:"right",fontWeight:600,color:yoy===null?c.muted:olumlu?"#10b981":"#ef4444"}}>
                         {yoy===null?"—":`${yoy>0?"+":""}${yoy.toFixed(1)}%`}
</td>
<td style={{...s.td,textAlign:"center"}}>
<Sparkline vals={trendVals} renk={h.renk}/>
</td>
<td style={s.td}>
<a href={h.ir_url} target="_blank" rel="noopener" style={{fontSize:11,color:"#6366f1",textDecoration:"none"}}>IR →</a>
</td>
</tr>
                   );
                 })}
</tbody>
</table>
</div>
</div>
         {/* THY RAKIP FARK ANALİZİ */}
<div style={s.card}>
<div style={s.h2}>THY Rakip Fark Analizi — 2025</div>
<div style={{fontSize:12,color:c.muted,marginBottom:14}}>↑ THY önde · ↓ Rakip önde · pp = yüzde puan</div>
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
                   const thy=thyObj.yillar["2025"], rak=h.yillar["2025"];
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
         {/* Görsel karşılaştırma */}
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginBottom:16}}>
           {[{label:"Yolcu (Milyon)",key:"yolcu",max:145},{label:"Doluluk PLF %",key:"doluluk",max:95}].map(({label,key,max})=>(
<div key={key} style={s.card}>
<div style={{fontWeight:600,marginBottom:14}}>{label} — 2025</div>
               {aktifHY.sort((a,b)=>(b.yillar["2025"][key]||0)-(a.yillar["2025"][key]||0)).map(h=>{
                 const v=h.yillar["2025"][key];
                 return (
<div key={h.id} style={{marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
<span style={{fontSize:12,fontWeight:h.id==="thy"?700:400}}>{h.id==="thy"?"⭐ ":""}{h.ad}</span>
<span style={{fontSize:13,fontWeight:700,color:h.renk}}>{v?`${key==="yolcu"?v.toFixed(1)+"M":v+"%"}`:"—"}</span>
</div>
<div style={{height:7,background:dk?"#0f172a":"#f1f5f9",borderRadius:4,overflow:"hidden"}}>
<div style={{height:"100%",width:`${((v||0)/max)*100}%`,background:h.renk,borderRadius:4}}/>
</div>
</div>
                 );
               })}
</div>
           ))}
</div>
         {/* Kaynaklar */}
<div style={{...s.card,background:dk?"#0f172a":"#f8fafc",padding:"14px 18px"}}>
<div style={{fontWeight:600,fontSize:12,marginBottom:8,color:c.muted,textTransform:"uppercase",letterSpacing:"0.5px"}}>Veri Kaynakları</div>
<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
             {FINANSAL_DATA.havayollari.map(h=>(
<a key={h.id} href={h.ir_url} target="_blank" rel="noopener" style={{fontSize:11,color:"#6366f1",textDecoration:"none",background:"#6366f115",padding:"3px 10px",borderRadius:6}}>{h.ad} IR →</a>
             ))}
</div>
<div style={{display:"flex",flexWrap:"wrap",gap:8}}>
<a href="https://api.frankfurter.dev" target="_blank" rel="noopener" style={{fontSize:11,color:"#10b981",textDecoration:"none",background:"#10b98115",padding:"3px 10px",borderRadius:6}}>Frankfurter (ECB) — Döviz →</a>
<a href="https://fred.stlouisfed.org" target="_blank" rel="noopener" style={{fontSize:11,color:"#f59e0b",textDecoration:"none",background:"#f59e0b15",padding:"3px 10px",borderRadius:6}}>FRED/EIA — Enerji →</a>
</div>
<div style={{fontSize:11,color:c.muted,marginTop:10}}>Finansal veriler resmi yıllık raporlardan derlenir. EUR/USD≈1.08. Döviz ve enerji fiyatları canlı API'dan 5 dk'da bir otomatik güncellenir. Son güncelleme: {piyasa.son_guncelleme||"—"}</div>
</div>
</>}
</main>
     {/* CHAT */}
<button onClick={()=>setChatAcik(p=>!p)} style={{position:"fixed",bottom:24,right:24,width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#0ea5e9)",border:"none",cursor:"pointer",fontSize:22,boxShadow:"0 4px 20px rgba(99,102,241,.4)",zIndex:200,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
       {chatAcik?"✕":"💬"}
</button>
     {chatAcik&&(
<div style={{position:"fixed",bottom:88,right:24,width:360,maxHeight:480,background:c.card,border:`1px solid ${c.bord}`,borderRadius:16,display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.15)",zIndex:200,overflow:"hidden"}}>
<div style={{padding:"13px 18px",borderBottom:`1px solid ${c.bord}`,display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:600,fontSize:13}}>
<span>✈️ Finansal Asistan</span>
<button style={{background:"none",border:"none",cursor:"pointer",color:c.muted,fontSize:16}} onClick={()=>setChatAcik(false)}>✕</button>
</div>
<div style={{flex:1,overflowY:"auto",padding:"13px 15px",display:"flex",flexDirection:"column",gap:9}}>
           {chatMesajlar.map((m,i)=>(
<div key={i} style={{padding:"9px 12px",borderRadius:m.rol==="kullanici"?"12px 12px 4px 12px":"12px 12px 12px 4px",background:m.rol==="kullanici"?"#6366f1":dk?"#0f172a":"#f1f5f9",color:m.rol==="kullanici"?"#fff":c.text,fontSize:13,lineHeight:1.55,maxWidth:"90%",alignSelf:m.rol==="kullanici"?"flex-end":"flex-start"}}>{m.icerik}</div>
           ))}
           {chatYukluyor&&<div style={{padding:"9px 12px",borderRadius:"12px 12px 12px 4px",background:dk?"#0f172a":"#f1f5f9",color:c.muted,fontSize:13}}>Yanıt hazırlanıyor…</div>}
<div ref={chatSonRef}/>
</div>
<div style={{padding:"6px 12px",borderTop:`1px solid ${c.bord}50`,display:"flex",flexWrap:"wrap",gap:4}}>
           {["THY rakiplere kıyasla?","Net marj analizi","Doluluk oranı değerlendirmesi"].map(q=>(
<button key={q} style={{padding:"4px 9px",borderRadius:10,border:`1px solid ${c.bord}`,background:"transparent",color:"#6366f1",fontSize:11,cursor:"pointer"}} onClick={()=>chatGonder(q)}>{q}</button>
           ))}
</div>
<div style={{padding:"10px 14px",borderTop:`1px solid ${c.bord}`,display:"flex",gap:8}}>
<input style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1px solid ${c.bord}`,background:dk?"#0f172a":"#f8fafc",color:c.text,fontSize:13,outline:"none"}} placeholder="Soru sor…" value={chatGiris} onChange={e=>setChatGiris(e.target.value)} onKeyDown={e=>e.key==="Enter"&&chatGonder()}/>
<button style={{padding:"8px 14px",borderRadius:8,border:"none",background:"#6366f1",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}} onClick={()=>chatGonder()}>Gönder</button>
</div>
</div>
     )}
</div>
 );
}
