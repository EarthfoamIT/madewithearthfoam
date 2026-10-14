#!/usr/bin/env python3
"""Same-origin mirror crawler for madewith.earthfoam.com.

Usage: crawl.py <cafile> <outdir> <manifest.json>
Parses HTML, CSS, JS, VTT, XML for references and downloads every
same-origin resource, preserving URL paths. Records every fetch
(status, type, size, headers) and every external reference.
"""
import json, re, ssl, sys, os, hashlib, time
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, urlunsplit, unquote, quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE = "https://madewith.earthfoam.com/"
HOST = urlsplit(BASE).netloc
cafile, outdir, manifest_path = sys.argv[1:4]
ctx = ssl.create_default_context(cafile=cafile)
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"

SEEDS = ["/", "/robots.txt", "/sitemap.xml", "/404.html",
         "/strengthening-the-community", "/improving-productivity-and-working-conditions",
         "/increasing-access-to-healthcare", "/half-height-pillow",
         "/stylesheet.css", "/js/main.js"]

URL_ATTRS = {"src", "href", "poster", "data-src", "data-href", "action", "content",
             "data-poster", "data-bg", "data-background", "xlink:href"}


class RefParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs, self.inline_css, self.inline_js = [], [], []
        self._in = None

    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if v is None:
                continue
            if k in ("srcset", "imagesrcset", "data-srcset"):
                for part in v.split(","):
                    p = part.strip().split()
                    if p:
                        self.refs.append(p[0])
            elif k == "style":
                self.inline_css.append(v)
            elif k in URL_ATTRS:
                if k == "content" and not re.match(r"^(https?:|/)", v.strip()):
                    continue
                self.refs.append(v.strip())
            elif k.startswith("on"):
                self.inline_js.append(v)
        if tag in ("style", "script"):
            self._in = tag

    def handle_endtag(self, tag):
        if tag in ("style", "script"):
            self._in = None

    def handle_data(self, data):
        if self._in == "style":
            self.inline_css.append(data)
        elif self._in == "script":
            self.inline_js.append(data)


CSS_URL = re.compile(r"""url\(\s*['"]?([^'")]+?)['"]?\s*\)""")
CSS_IMPORT = re.compile(r"""@import\s+['"]([^'"]+)['"]""")
JS_IMPORT = re.compile(r"""(?:import|export)\s*(?:[\w*{}\s,]+from\s*)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)""")
JS_STR_PATH = re.compile(r"""['"`](/(?:assets|graphics|js|fonts|images|img|css)/[^'"`\s]+)['"`]""")
JS_ABS = re.compile(r"""['"`](https?://[^'"`\s]+)['"`]""")
XML_LOC = re.compile(r"<loc>([^<]+)</loc>")


def refs_css(text):
    return CSS_URL.findall(text) + CSS_IMPORT.findall(text)


def refs_js(text):
    out = []
    for a, b in JS_IMPORT.findall(text):
        out.append(a or b)
    out += JS_STR_PATH.findall(text) + JS_ABS.findall(text)
    return out


def norm(url):
    s = urlsplit(url)
    # canonical percent-encoding: decode then re-encode so "a b" and "a%20b" match
    path = quote(unquote(s.path or "/"), safe="/:@!$&'()*+,;=-._~")
    return urlunsplit((s.scheme, s.netloc, path, s.query, ""))


def is_page(ctype, url):
    p = urlsplit(url).path
    return any(t in ctype for t in ("html", "css", "javascript", "xml", "svg", "text/")) or p.endswith((".js", ".css"))


def local_path(url):
    s = urlsplit(url)
    path = unquote(s.path)
    if path.endswith("/"):
        path += "index.html"
    rel = path.lstrip("/")
    # extensionless pages are HTML -> save as dir/index.html
    if "." not in os.path.basename(rel):
        rel = rel + "/index.html"
    return os.path.join(outdir, rel)


queue = [urljoin(BASE, s) for s in SEEDS]
seen, records, external = set(), {}, {}

while queue:
    url = norm(queue.pop(0))
    if url in seen:
        continue
    seen.add(url)
    lp_existing = local_path(url)
    try:
        if os.path.exists(lp_existing) and os.path.splitext(lp_existing)[1].lower() in (
                ".mp4", ".webm", ".pdf", ".webp", ".jpg", ".jpeg", ".png", ".gif", ".woff", ".woff2", ".ttf", ".otf"):
            resp = urlopen(Request(url, headers={"User-Agent": UA}, method="HEAD"), context=ctx, timeout=60)
            status, hdrs = resp.status, dict(resp.headers)
            body = open(lp_existing, "rb").read()
            if int(hdrs.get("Content-Length", -1)) != len(body):
                resp = urlopen(Request(url, headers={"User-Agent": UA}), context=ctx, timeout=300)
                status, body, hdrs = resp.status, resp.read(), dict(resp.headers)
        else:
            resp = urlopen(Request(url, headers={"User-Agent": UA}), context=ctx, timeout=300)
            status, body, hdrs = resp.status, resp.read(), dict(resp.headers)
    except HTTPError as e:
        status, body, hdrs = e.code, e.read(), dict(e.headers)
    except Exception as e:
        records[url] = {"error": str(e)}
        print("ERR", url, e, flush=True)
        continue
    ctype = hdrs.get("Content-Type", "")
    rec = {"status": status, "content_type": ctype, "bytes": len(body),
           "sha256": hashlib.sha256(body).hexdigest(),
           "last_modified": hdrs.get("Last-Modified"), "etag": hdrs.get("ETag"),
           "cache_control": hdrs.get("Cache-Control"), "server": hdrs.get("Server")}
    records[url] = rec
    print(status, len(body), url, flush=True)
    if status != 200 and not url.endswith("/404.html"):
        continue
    lp = local_path(url)
    os.makedirs(os.path.dirname(lp), exist_ok=True)
    with open(lp, "wb") as f:
        f.write(body)
    rec["saved_as"] = os.path.relpath(lp, outdir)

    found = []
    path = urlsplit(url).path
    if "html" in ctype:
        text = body.decode("utf-8", "replace")
        p = RefParser()
        p.feed(text)
        found += p.refs
        for c in p.inline_css:
            found += refs_css(c)
        for j in p.inline_js:
            found += refs_js(j)
    elif "css" in ctype or path.endswith(".css"):
        found += refs_css(body.decode("utf-8", "replace"))
    elif "javascript" in ctype or path.endswith(".js"):
        found += refs_js(body.decode("utf-8", "replace"))
    elif "xml" in ctype or "svg" in ctype:
        text = body.decode("utf-8", "replace")
        found += [l.replace(":///", "/") for l in XML_LOC.findall(text)]
        found += re.findall(r"""(?:href|xlink:href)=["']([^"'#][^"']*)["']""", text)
    elif path.endswith(".vtt"):
        pass

    for r in found:
        r = r.strip()
        if not r or r.startswith(("data:", "mailto:", "tel:", "javascript:", "#", "blob:")):
            continue
        absu = urljoin(url, r)
        s = urlsplit(absu)
        if s.scheme not in ("http", "https"):
            continue
        if s.netloc == HOST:
            if norm(absu) not in seen:
                queue.append(absu)
        else:
            external.setdefault(norm(absu), set()).add(urlsplit(url).path)
    time.sleep(0.05)

with open(manifest_path, "w") as f:
    json.dump({"base": BASE, "crawled_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "resources": records,
               "external_references": {k: sorted(v) for k, v in sorted(external.items())}},
              f, indent=2)
print("DONE", len(records), "resources;", len(external), "external refs")
