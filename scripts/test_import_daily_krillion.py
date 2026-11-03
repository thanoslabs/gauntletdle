import json
import pathlib
import tempfile
import unittest
from unittest.mock import patch
from scripts.import_daily_krillion import import_reveal

class FakeResponse:
    status = 200
    def __enter__(self): return self
    def __exit__(self, *_): return False
    def read(self, *_): return b'{"date":"2026-11-03","answer":"example"}'

class KrillionImporterTests(unittest.TestCase):
    def test_import_and_idempotency(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            with patch("urllib.request.urlopen", return_value=FakeResponse()) as fetch:
                path = import_reveal("2026-11-03", root)
                data = json.loads(path.read_text())
                self.assertEqual(data["gameId"], "krillion")
                self.assertEqual(data["date"], "2026-11-03")
                self.assertEqual(data["reveal"]["answer"], "example")
                import_reveal("2026-11-03", root)
                self.assertEqual(fetch.call_count, 1)

    def test_rejects_wrong_response_date(self):
        class WrongResponse(FakeResponse):
            def read(self, *_): return b'{"date":"2026-11-02"}'
        with tempfile.TemporaryDirectory() as directory:
            with patch("urllib.request.urlopen", return_value=WrongResponse()):
                with self.assertRaises(ValueError):
                    import_reveal("2026-11-03", pathlib.Path(directory))

if __name__ == "__main__":
    unittest.main()
