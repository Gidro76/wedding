import json
import csv

# ⚙️ Настройка — измени, если нужно
BASE_URL = "https://gidro76.github.io/wedding/"

with open("guests.json", "r", encoding="utf-8") as f:
    data = json.load(f)

rows = []
for guest in data["guests"]:
    link = f"{BASE_URL}?id={guest['id']}"
    rows.append({
        "id": guest["id"],
        "name": guest["name"],
        "link": link,
    })
    print(f"  {guest['name']:30} →  {link}")

# Сохраняем в CSV (utf-8-sig — чтобы Excel не ломал кириллицу)
with open("links.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["id", "name", "link"])
    writer.writeheader()
    writer.writerows(rows)

print(f"\n✅ Готово! Создан файл links.csv — {len(rows)} гостей.")