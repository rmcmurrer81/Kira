"""Offline regression checks for the owner-supplied playlist entry points."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
import unittest

ROOT = Path(__file__).resolve().parents[1] / 'docs'

class Tags(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
    handle_startendtag = handle_starttag

class ResearchVideos(unittest.TestCase):
    def setUp(self):
        self.text = (ROOT / 'research.html').read_text(encoding='utf-8')
        self.tags = Tags(self.text).tags

    def test_library_precedes_research_details(self):
        self.assertLess(self.text.index('id="watch-videos"'), self.text.index('id="healthspan-lab"'))

    def test_distinct_collections_and_valid_anchors(self):
        ids = [a['id'] for _, a in self.tags if 'id' in a]
        self.assertEqual(len(ids), len(set(ids)))
        for expected in ('watch-videos', 'medical-videos', 'digital-twin-videos'):
            self.assertIn(expected, ids)
        for tag, a in self.tags:
            href = a.get('href', '')
            if tag == 'a' and href.startswith('#'):
                self.assertIn(href[1:], ids)

    def test_supplied_destinations_are_preserved(self):
        expected = {'PLb9jDoJkzkPk', 'PLYTbQe_kCHYw'}
        previews = [a for t, a in self.tags if t == 'a' and 'data-playlist-preview' in a]
        self.assertEqual(len(previews), 2)
        actual = set()
        for a in previews:
            url = urlsplit(a['href'])
            self.assertEqual((url.scheme, url.netloc, url.path), ('https', 'www.youtube.com', '/playlist'))
            actual.add(parse_qs(url.query)['list'][0])
        self.assertEqual(actual, expected)

    def test_embeds_load_only_on_interaction(self):
        self.assertFalse(any(t == 'iframe' for t, _ in self.tags))
        js = (ROOT / 'research-videos.js').read_text(encoding='utf-8')
        self.assertIn('https://www.youtube-nocookie.com/embed', js)
        self.assertIn("'click'", js)
        self.assertIn("'strict-origin-when-cross-origin'", js)
        self.assertNotIn('innerHTML', js)

    def test_home_has_both_watch_routes(self):
        home = (ROOT / 'index.html').read_text(encoding='utf-8')
        for anchor in ('watch-videos', 'medical-videos', 'digital-twin-videos'):
            self.assertIn('research.html#' + anchor, home)

    def test_original_tracks_and_privacy_remain(self):
        for anchor in ('healthspan-lab', 'digital-twin', 'human-ai-wellbeing'):
            self.assertIn('id="' + anchor + '"', self.text)
        self.assertIn('privacy.html#healthspan-privacy', self.text)
        self.assertIn('not a Healthspan Lab feature', self.text)

if __name__ == '__main__':
    unittest.main()
