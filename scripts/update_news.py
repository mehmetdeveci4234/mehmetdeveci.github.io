import os
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
# RSS kaynaklarından haber başlıklarını çek
RSS_FEEDS = [
   "https://www.phocuswire.com/rss",
   "https://simpleflying.com/feed/",
   "https://www.ch-aviation.com/portal/news/rss",
]
def rss_cek(url):
   basliklar = []
   try:
       req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
       with urllib.request.urlopen(req, timeout=10) as r:
           xml = r.read().decode("utf-8", errors="ignore")
       root = ET.fromstring(xml)
       for item in root.findall(".//item")[:5]:
           title = item.find("title")
           link  = item.find("link")
           desc  = item.find("description")
           if title is not None:
               basliklar.append({
                   "baslik": title.text or "",
                   "url":    link.text if link is not None else "",
                   "ozet":   (desc.text or "")[:200] if desc is not None else "",
               })
   except Exception as e:
       print(f"RSS hatasi {url}: {e}")
   return basliklar
# Tüm RSS'leri topla
tumHaberler = []
for feed in RSS_FEEDS:
   tumHaberler.extend(rss_cek(feed))
# Gemini API ile özetle ve JSON üret
from datetime import datetime
GEMINI_URL = (
   "https://generativelanguage.googleapis.com/v1beta/models/"
   "gemini-2.0-flash:generateContent?key=" + os.environ["GEMINI_API_KEY"]
)
haber_listesi = "\n".join([
   f"- {h['baslik']} | {h['url']}"
   for h in tumHaberler[:20]
])
tarih_bugun = datetime.now().strftime("%d %b %Y")
PROMPT = f"""
Aşağıdaki havacılık haber başlıklarından en önemli 12 tanesini seç.
Kategori kuralı:
- "dagitim" → GDS, NDC, ONE Order, dağıtım teknolojisi, yapay zeka
- "finans"   → gelir, kâr, yolcu sayısı, yeni hat, filo
- "yasal"    → regülasyon, IATA standartları, AB direktifi
Bugünün tarihi: {tarih_bugun}
Haber listesi:
{haber_listesi}
Çıktı formatı — SADECE geçerli JSON döndür, başka hiçbir şey yazma:
[
 {{
   "id": 1,
   "tarih": "{tarih_bugun}",
   "k": "dagitim",
   "hy": "Turkish Airlines",
   "b": "Kısa haber başlığı (Türkçe)",
   "o": "2-3 cümlelik Türkçe özet. Somut rakamlar ve bağlam içermeli.",
   "s": [{{"a": "Kaynak", "u": "https://gercek-url.com"}}],
   "az": true
 }}
]
"""
import urllib.parse
body = json.dumps({
   "contents": [{"parts": [{"text": PROMPT}]}],
   "generationConfig": {"temperature": 0.3, "maxOutputTokens": 4000}
}).encode("utf-8")
req = urllib.request.Request(
   GEMINI_URL,
   data=body,
   headers={"Content-Type": "application/json"},
   method="POST"
)
with urllib.request.urlopen(req, timeout=30) as r:
   resp = json.loads(r.read().decode("utf-8"))
raw = resp["candidates"][0]["content"]["parts"][0]["text"].strip()
raw = re.sub(r"^```json\s*", "", raw)
raw = re.sub(r"\s*```$", "", raw)
haberler = json.loads(raw)
with open("/tmp/new_haberler.json", "w", encoding="utf-8") as f:
   json.dump(haberler, f, ensure_ascii=False, indent=2)
print(f"Guncellendi: {len(haberler)} haber")
