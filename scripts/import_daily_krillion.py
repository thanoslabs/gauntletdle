#!/usr/bin/env python3
"""Fetch a dated Krillion reveal without assuming an undocumented response schema."""
import argparse
import datetime as dt
import json
import pathlib
import urllib.request
from zoneinfo import ZoneInfo

def import_reveal(date: str, root: pathlib.Path) -> pathlib.Path:
    dt.date.fromisoformat(date)
    output = root / "games" / "krillion" / "daily" / f"{date}.json"
    if output.exists():
        print(f"Already exists: {output}; leaving unchanged")
        return output
    url = f"https://krillion.io/api/reveal?date={date}"
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "GauntletdleDailyImporter/1.0"})
    with urllib.request.urlopen(request, timeout=20) as response:
        if response.status != 200:
            raise ValueError(f"Unexpected HTTP status: {response.status}")
        payload = json.load(response)
    if not isinstance(payload, (dict, list)) or not payload:
        raise ValueError("Krillion reveal must be a nonempty JSON object or array")
    if isinstance(payload, dict):
        for key in ("date", "puzzle_date", "puzzleDate"):
            if key in payload and payload[key] != date:
                raise ValueError(f"Krillion response {key} does not match requested date")
    output.parent.mkdir(parents=True, exist_ok=True)
    result = {"schemaVersion": 1, "gameId": "krillion", "date": date, "source": "external", "reveal": payload}
    output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Created {output}")
    return output

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="YYYY-MM-DD (defaults to Eastern date)")
    parser.add_argument("--root", type=pathlib.Path, default=pathlib.Path("."))
    args = parser.parse_args()
    import_reveal(args.date or dt.datetime.now(ZoneInfo("America/New_York")).date().isoformat(), args.root)
