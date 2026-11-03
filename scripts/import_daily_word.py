#!/usr/bin/env python3
"""Import a daily NYT-compatible Wordle response into Gauntletdle's puzzle schema."""
import argparse
import datetime as dt
import json
import os
import pathlib
import re
import urllib.error
import urllib.request
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/New_York")

def import_puzzle(date: str, root: pathlib.Path) -> pathlib.Path:
    dt.date.fromisoformat(date)
    url = f"https://www.nytimes.com/svc/wordle/v2/{date}.json"
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "GauntletdleDailyImporter/1.0"})
    with urllib.request.urlopen(request, timeout=20) as response:
        payload = json.load(response)
    if not isinstance(payload, dict):
        raise ValueError("Expected a JSON object")
    answer = payload.get("solution")
    response_date = payload.get("print_date")
    if response_date != date:
        raise ValueError(f"API date mismatch: expected {date}, got {response_date!r}")
    if not isinstance(answer, str) or not re.fullmatch(r"[a-zA-Z]{5}", answer):
        raise ValueError("Invalid five-letter solution")
    puzzle_number = payload.get("days_since_launch")
    if not isinstance(puzzle_number, int) or puzzle_number < 0:
        raise ValueError("Missing or invalid puzzle number")
    output = root / "games" / "wordle" / "daily" / f"{date}.json"
    if output.exists():
        print(f"Already exists: {output}; leaving unchanged")
        return output
    result = {
        "schemaVersion": 1,
        "gameId": "wordle",
        "date": date,
        "puzzleId": f"nyt-wordle-{puzzle_number}",
        "source": "external",
        "puzzle": {"answer": answer.upper(), "maxGuesses": 6},
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"Created {output}")
    return output

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="Puzzle date YYYY-MM-DD (defaults to current Eastern date)")
    parser.add_argument("--root", type=pathlib.Path, default=pathlib.Path("."))
    args = parser.parse_args()
    day = args.date or dt.datetime.now(TZ).date().isoformat()
    import_puzzle(day, args.root)
