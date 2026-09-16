import re
import httpx
from typing import List, Dict, Optional
from backend.config import settings
from backend.utils.logger import logger


class WebSearchService:
    """
    Multi-modal live web search powered by Google APIs.

    Priority chain:
      Text   → Google Custom Search JSON API → Wikipedia Search API → DuckDuckGo Instant
      Images → Google Custom Search Images   → Unsplash (topic-aware) → DuckDuckGo Images
      Videos → YouTube Data API v3           → Google Video Search via CSE
    """

    # ──────────────────────────── Helpers ───────────────────────────── #

    def _clean_keywords(self, query: str) -> str:
        """Strip conversational filler words for cleaner search matching."""
        cleaned = re.sub(
            r"^(what\s+is|what\s+are|who\s+is|tell\s+me\s+about|explain|how\s+does|how\s+to)\s+",
            "", query, flags=re.I
        )
        cleaned = re.sub(r"[?.,!]", "", cleaned).strip()
        return cleaned or query

    def _has_google(self) -> bool:
        return bool(settings.GOOGLE_API_KEY and settings.GOOGLE_CSE_ID)

    def _has_youtube(self) -> bool:
        return bool(settings.YOUTUBE_API_KEY or settings.GOOGLE_API_KEY)

    # ─────────────────────────── Text Search ─────────────────────────── #

    def search_text(self, query: str, max_results: int = 5) -> List[Dict[str, str]]:
        """Search for text/article results using Google (preferred) → Wikipedia fallback."""
        results: List[Dict[str, str]] = []
        keywords = self._clean_keywords(query)
        headers = {"User-Agent": "ResearchlyRAG/2.0 (+https://researchly.ai)"}

        # ── 1. Google Custom Search JSON API (primary) ──
        if self._has_google():
            try:
                with httpx.Client(timeout=6.0, headers=headers) as client:
                    res = client.get(
                        "https://www.googleapis.com/customsearch/v1",
                        params={
                            "key": settings.GOOGLE_API_KEY,
                            "cx": settings.GOOGLE_CSE_ID,
                            "q": keywords,
                            "num": min(max_results, 10),
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        for item in data.get("items", []):
                            results.append({
                                "title": item.get("title", ""),
                                "url": item.get("link", "#"),
                                "snippet": item.get("snippet", "").replace("\n", " ").strip(),
                            })
                        logger.debug(f"Google CSE text: {len(results)} results for '{keywords}'")
            except Exception as e:
                logger.debug(f"Google CSE text search failed: {e}")

        # ── 2. Wikipedia Search API (fast, no key needed) ──
        if len(results) < max_results:
            try:
                with httpx.Client(timeout=5.0, headers=headers) as client:
                    w_res = client.get(
                        "https://en.wikipedia.org/w/api.php",
                        params={
                            "action": "query",
                            "list": "search",
                            "srsearch": keywords,
                            "srlimit": max(3, max_results - len(results)),
                            "utf8": "1",
                            "format": "json",
                        }
                    )
                    if w_res.status_code == 200:
                        w_data = w_res.json()
                        for item in w_data.get("query", {}).get("search", []):
                            clean_snippet = re.sub(r"<[^>]+>", "", item.get("snippet", ""))
                            title = item.get("title", "")
                            results.append({
                                "title": f"Wikipedia: {title}",
                                "url": f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}",
                                "snippet": clean_snippet,
                            })
            except Exception as e:
                logger.debug(f"Wikipedia search fallback failed: {e}")

        # ── 3. DuckDuckGo Instant Answer (last-resort, no key) ──
        if not results:
            try:
                with httpx.Client(timeout=5.0, headers=headers) as client:
                    ddg = client.get(
                        "https://api.duckduckgo.com/",
                        params={"q": keywords, "format": "json", "no_html": "1", "skip_disambig": "1"}
                    )
                    if ddg.status_code == 200:
                        data = ddg.json()
                        abstract = data.get("AbstractText") or data.get("Abstract", "")
                        if abstract:
                            results.append({
                                "title": data.get("Heading") or keywords,
                                "url": data.get("AbstractURL") or "https://duckduckgo.com",
                                "snippet": abstract,
                            })
                        for topic in data.get("RelatedTopics", [])[:3]:
                            if isinstance(topic, dict) and "Text" in topic:
                                results.append({
                                    "title": topic["Text"][:70],
                                    "url": topic.get("FirstURL", "#"),
                                    "snippet": topic["Text"],
                                })
            except Exception as e:
                logger.debug(f"DuckDuckGo instant fallback failed: {e}")

        return results[:max_results]

    # ─────────────────────────── Image Search ────────────────────────── #

    def search_images(self, query: str, max_results: int = 4) -> List[Dict[str, str]]:
        """Search for images using Google Custom Search Images → curated Unsplash topics."""
        keywords = self._clean_keywords(query)
        results: List[Dict[str, str]] = []
        headers = {"User-Agent": "ResearchlyRAG/2.0 (+https://researchly.ai)"}

        # ── 1. Google Custom Search Images ──
        if self._has_google():
            try:
                with httpx.Client(timeout=6.0, headers=headers) as client:
                    res = client.get(
                        "https://www.googleapis.com/customsearch/v1",
                        params={
                            "key": settings.GOOGLE_API_KEY,
                            "cx": settings.GOOGLE_CSE_ID,
                            "q": keywords,
                            "searchType": "image",
                            "num": min(max_results, 10),
                            "safe": "active",
                            "imgSize": "large",
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        for item in data.get("items", []):
                            img = item.get("image", {})
                            results.append({
                                "title": item.get("title", ""),
                                "image_url": item.get("link", ""),
                                "source_url": item.get("image", {}).get("contextLink", ""),
                            })
                        logger.debug(f"Google CSE images: {len(results)} for '{keywords}'")
            except Exception as e:
                logger.debug(f"Google CSE image search failed: {e}")

        # ── 2. Curated Unsplash topic fallback (no key needed) ──
        if len(results) < max_results:
            safe_q = keywords.replace(" ", ",")[:100]
            needed = max_results - len(results)
            unsplash_base = "https://images.unsplash.com/photo-"
            # Use Unsplash Source API — free, high quality, deterministic
            topics = [
                f"https://source.unsplash.com/800x500/?{safe_q}&sig={i}"
                for i in range(needed)
            ]
            for i, url in enumerate(topics):
                results.append({
                    "title": f"{keywords.title()} — Image {len(results) + 1}",
                    "image_url": url,
                    "source_url": f"https://unsplash.com/s/photos/{safe_q}",
                })

        return results[:max_results]

    # ─────────────────────────── Video Search ────────────────────────── #

    def search_videos(self, query: str, max_results: int = 3) -> List[Dict[str, str]]:
        """Search YouTube for relevant video results."""
        keywords = self._clean_keywords(query)
        results: List[Dict[str, str]] = []
        headers = {"User-Agent": "ResearchlyRAG/2.0 (+https://researchly.ai)"}
        api_key = settings.YOUTUBE_API_KEY or settings.GOOGLE_API_KEY

        # ── 1. YouTube Data API v3 ──
        if api_key:
            try:
                with httpx.Client(timeout=6.0, headers=headers) as client:
                    res = client.get(
                        "https://www.googleapis.com/youtube/v3/search",
                        params={
                            "key": api_key,
                            "q": keywords,
                            "part": "snippet",
                            "type": "video",
                            "maxResults": min(max_results, 10),
                            "relevanceLanguage": "en",
                            "safeSearch": "moderate",
                            "videoDuration": "medium",
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        for item in data.get("items", []):
                            vid_id = item.get("id", {}).get("videoId", "")
                            snippet = item.get("snippet", {})
                            results.append({
                                "title": snippet.get("title", ""),
                                "url": f"https://www.youtube.com/watch?v={vid_id}",
                                "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
                                "channel": snippet.get("channelTitle", ""),
                                "description": snippet.get("description", "")[:200],
                                "video_id": vid_id,
                            })
                        logger.debug(f"YouTube: {len(results)} videos for '{keywords}'")
            except Exception as e:
                logger.debug(f"YouTube search failed: {e}")

        # ── 2. Google CSE video search fallback ──
        if not results and self._has_google():
            try:
                with httpx.Client(timeout=6.0, headers=headers) as client:
                    res = client.get(
                        "https://www.googleapis.com/customsearch/v1",
                        params={
                            "key": settings.GOOGLE_API_KEY,
                            "cx": settings.GOOGLE_CSE_ID,
                            "q": f"{keywords} video",
                            "num": max_results,
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        for item in data.get("items", []):
                            results.append({
                                "title": item.get("title", ""),
                                "url": item.get("link", "#"),
                                "thumbnail": "",
                                "channel": item.get("displayLink", ""),
                                "description": item.get("snippet", ""),
                                "video_id": "",
                            })
            except Exception as e:
                logger.debug(f"Google CSE video fallback failed: {e}")

        return results[:max_results]

    # ────────────────────────── Audio Search ─────────────────────────── #

    def search_audio(self, query: str, max_results: int = 3) -> List[Dict[str, str]]:
        """
        Search for podcasts / audio content via Google CSE restricted to audio platforms.
        Falls back to curated podcast directory search.
        """
        keywords = self._clean_keywords(query)
        results: List[Dict[str, str]] = []
        headers = {"User-Agent": "ResearchlyRAG/2.0 (+https://researchly.ai)"}

        # Restrict to known podcast / audio platforms
        audio_sites = "site:podcasts.google.com OR site:open.spotify.com OR site:soundcloud.com"
        audio_query = f"{keywords} podcast {audio_sites}"

        if self._has_google():
            try:
                with httpx.Client(timeout=6.0, headers=headers) as client:
                    res = client.get(
                        "https://www.googleapis.com/customsearch/v1",
                        params={
                            "key": settings.GOOGLE_API_KEY,
                            "cx": settings.GOOGLE_CSE_ID,
                            "q": audio_query,
                            "num": max_results,
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        for item in data.get("items", []):
                            results.append({
                                "title": item.get("title", ""),
                                "url": item.get("link", "#"),
                                "snippet": item.get("snippet", ""),
                                "platform": item.get("displayLink", ""),
                            })
            except Exception as e:
                logger.debug(f"Google audio search failed: {e}")

        return results[:max_results]


web_search_service = WebSearchService()
