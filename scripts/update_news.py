import os, json, re, urllib.request, urllib.parse
from datetime import datetime, timezone
NEWS_KEY  = os.environ["NEWS_API_KEY"]
GROQ_KEY  = os.environ["GROQ_API_KEY"]
BUGUN     = datetime.now(timezone.utc).strftime("%Y-%m-%d")
BUGUN_TR  = datetime.now(timezone.utc).strftime("%d %b %Y")
# NewsAPI ile haber cek
SORGU = "NDC OR GDS OR airline distribution OR IATA OR aviation OR Turkish Airlines"
URL = (
   "https://newsapi.org/v2/everything"
   "?q=" + urllib.parse.quote(SORGU) +
   "&language=en&sortBy=publishedAt&pageSize=20&apiKey=" + NEWS_KEY
)
req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=15) as r:
   data = json.loads(r.read().decode("utf-8"))
articles = data.get("articles", [])
print(f"Cekilen haber: {len(articles)}")
haber_listesi = "\n".join([
   f"- {a['title']} | {a['url']} | {(a.get('description') or '')[:120]}"
   for a in articles[:15] if a.get('title')
])
# Groq ile ozetle (ucretsiz, llama-3.3-70b)
PROMPT = f"""Asagidaki havacılık haber listesinden en onemli 10 tanesini sec ve Turkce ozetle.
Kategori kurali:
- "dagitim" = GDS, NDC, ONE Order, dagitim teknolojisi, yapay zeka
- "finans"   = gelir, kar, yolcu sayisi, yeni hat, filo
- "yasal"    = regulasyon, IATA standartlari, AB direktifi
Bugunun tarihi: {BUGUN}
Haberler:
{haber_listesi}
SADECE gecerli JSON dondur, baska hicbir sey yazma:
[
 {{
   "id": 1,
   "tarih": "{BUGUN}",
   "k": "dagitim",
   "hy": "Amadeus",
   "b": "Turkce haber basligi",
   "o": "2-3 cumlelik Turkce ozet. Somut rakamlar icermeli.",
   "s": [{{"a": "Kaynak adi", "u": "https://gercek-url.com"}}],
   "az": true
 }}
]"""
body = json.dumps({
   "model": "llama-3.3-70b-versatile",
   "messages": [{"role": "user", "content": PROMPT}],
   "temperature": 0.3,
   "max_tokens": 4000,
}).encode("utf-8")
req2 = urllib.request.Request(
   "https://api.groq.com/openai/v1/chat/completions",
   data=body,
   headers={"Content-Type": "application/json", "Authorization": "Bearer " + GROQ_KEY},
   method="POST"
)
with urllib.request.urlopen(req2, timeout=30) as r:
   resp = json.loads(r.read().decode("utf-8"))
raw = resp["choices"][0]["message"]["content"].strip()
raw = re.sub(r"^```json\s*", "", raw)
raw = re.sub(r"\s*```$", "", raw)
haberler = json.loads(raw)
print(f"Uretilen haber: {len(haberler)}")
with open("/tmp/new_haberler.json", "w", encoding="utf-8") as f:
   json.dump(haberler, f, ensure_ascii=False, indent=2)
print("Tamamlandi")
