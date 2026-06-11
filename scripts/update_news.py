import os, json, re, urllib.request
from datetime import datetime, timezone
NEWS_KEY   = os.environ["NEWS_API_KEY"]
GEMINI_KEY = os.environ["GEMINI_API_KEY"]
BUGUN      = datetime.now(timezone.utc).strftime("%d %b %Y")
# NewsAPI — havacılık haberleri
SORGU = "NDC OR GDS OR airline distribution OR IATA OR aviation"
URL = (
   "https://newsapi.org/v2/everything"
   "?q=" + urllib.parse.quote(SORGU) +
   "&language=en&sortBy=publishedAt&pageSize=20"
   "&apiKey=" + NEWS_KEY
)
import urllib.parse
req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=15) as r:
   data = json.loads(r.read().decode("utf-8"))
articles = data.get("articles", [])
haber_listesi = "\n".join([
   f"- {a['title']} | {a['url']} | {(a.get('description') or '')[:150]}"
   for a in articles[:15]
])
# Gemini ile özetle
PROMPT = f"""
Aşağıdaki havacılık haber listesinden en önemli 10 tanesini seç ve Türkçe özetle.
Kategori kuralı:
- "dagitim" = GDS, NDC, ONE Order, dağıtım teknolojisi, yapay zeka
- "finans"   = gelir, kâr, yolcu sayısı, yeni hat, filo sipariş
- "yasal"    = regülasyon, IATA standartları, AB direktifi
Bugünün tarihi: {BUGUN}
Haberler:
{haber_listesi}
SADECE geçerli JSON döndür, başka hiçbir şey yazma:
[
 {{
   "id": 1,
   "tarih": "{BUGUN}",
   "k": "dagitim",
   "hy": "Amadeus",
   "b": "Türkçe haber başlığı",
   "o": "2-3 cümlelik Türkçe özet. Somut rakamlar ve bağlam içermeli.",
   "s": [{{"a": "Kaynak adı", "u": "https://gercek-url.com"}}],
   "az": true
 }}
]
"""
body = json.dumps({
   "contents": [{"parts": [{"text": PROMPT}]}],
   "generationConfig": {"temperature": 0.3, "maxOutputTokens": 4000}
}).encode("utf-8")
GEMINI_URL = (
   "https://generativelanguage.googleapis.com/v1beta/models/"
   "gemini-2.0-flash:generateContent?key=" + GEMINI_KEY
)
req2 = urllib.request.Request(
   GEMINI_URL, data=body,
   headers={"Content-Type": "application/json"}, method="POST"
)
with urllib.request.urlopen(req2, timeout=30) as r:
   resp = json.loads(r.read().decode("utf-8"))
raw = resp["candidates"][0]["content"]["parts"][0]["text"].strip()
raw = re.sub(r"^```json\s*", "", raw)
raw = re.sub(r"\s*```$", "", raw)
haberler = json.loads(raw)
with open("/tmp/new_haberler.json", "w", encoding="utf-8") as f:
   json.dump(haberler, f, ensure_ascii=False, indent=2)
print(f"Tamamlandi: {len(haberler)} haber")
