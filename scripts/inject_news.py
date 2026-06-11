import json, re
with open("/tmp/new_haberler.json", "r", encoding="utf-8") as f:
   haberler = json.load(f)
with open("src/App.jsx", "r", encoding="utf-8") as f:
   content = f.read()
yeni = "const HABERLER = " + json.dumps(haberler, ensure_ascii=False, indent=2) + ";"
content = re.sub(
   r"const HABERLER = \[.*?\];",
   yeni,
   content,
   flags=re.DOTALL
)
with open("src/App.jsx", "w", encoding="utf-8") as f:
   f.write(content)
print("App.jsx guncellendi")
