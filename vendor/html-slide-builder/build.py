#!/usr/bin/env python3
"""Inline an authored HTML page's local CSS, JS, fonts and images for offline use."""
import argparse
import base64
from html import escape
from html.parser import HTMLParser
import mimetypes
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


def local(base, url):
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc:
        raise ValueError(f"Offline build requires a local resource: {url}")
    target = (base / unquote(parsed.path)).resolve()
    if not target.is_file():
        raise ValueError(f"Missing local resource: {target}")
    return target


def data_url(base, url):
    if url.startswith(("data:", "#")):
        return url
    target = local(base, url)
    mime = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(target.read_bytes()).decode()


def inline_css(text, base):
    """Resolve the same loading surface in linked, inline and attribute CSS."""
    if re.search(r"@import\b", text):
        raise ValueError("Use explicit local stylesheet links instead of CSS @import")
    text = re.sub(r"url\(\s*(['\"]?)(.*?)\1\s*\)",
                  lambda m: "url('" + data_url(base, m[2]) + "')", text)
    return text.replace("</style", "<\\/style")


class Packager(HTMLParser):
    def __init__(self, base):
        super().__init__(convert_charrefs=False)
        self.base = base
        self.output = []
        self.external_script = False
        self.inline_style = False

    def handle_starttag(self, tag, attrs, self_closing=False):
        values = dict(attrs)
        attrs = [(k, inline_css(v, self.base) if k == "style" and v is not None else v) for k, v in attrs]
        if tag == "link" and values.get("rel") == "stylesheet":
            source = local(self.base, values["href"])
            self.output.append("<style>\n" + inline_css(source.read_text(encoding="utf-8"), source.parent) + "\n</style>")
            return
        if tag == "script" and values.get("type", "").strip().lower() == "module":
            raise ValueError("Bundle module imports before this standalone packager")
        if tag == "script" and "src" in values:
            if "defer" in values or "async" in values:
                raise ValueError("Place classic scripts after their DOM content before packaging")
            body = local(self.base, values["src"]).read_text(encoding="utf-8")
            self.output.append("<script>\n" + body.replace("</script", "<\\/script") + "\n</script>")
            self.external_script = not self_closing
            return
        if tag == "style":
            self.inline_style = not self_closing
        if tag in {"img", "source", "video", "audio"}:
            if "srcset" in values:
                raise ValueError("Choose an explicit source before standalone packaging")
            attrs = [(k, data_url(self.base, v) if k in {"src", "poster"} else v) for k, v in attrs]
        if tag == "link" and "href" in values:
            raise ValueError("Resolve non-stylesheet links explicitly before offline packaging")
        if tag == "iframe":
            raise ValueError("Replace embedded frames with local substantive content for offline/PDF use")
        self.output.append("<" + tag + "".join(" " + k if v is None else " " + k + '="' + escape(v, quote=True) + '"' for k, v in attrs) + ("/>" if self_closing else ">"))

    def handle_endtag(self, tag):
        if tag == "style":
            self.inline_style = False
        if tag == "script" and self.external_script:
            self.external_script = False
        else:
            self.output.append(f"</{tag}>")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs, self_closing=True)

    def handle_data(self, data):
        if not self.external_script:
            self.output.append(inline_css(data, self.base) if self.inline_style else data)

    def handle_entityref(self, name):
        self.output.append(f"&{name};")

    def handle_charref(self, name):
        self.output.append(f"&#{name};")

    def handle_comment(self, data):
        self.output.append("<!--" + data + "-->")

    def handle_decl(self, decl):
        self.output.append("<!" + decl + ">")


def build(source):
    source = source.resolve()
    parser = Packager(source.parent)
    parser.feed(source.read_text(encoding="utf-8"))
    parser.close()
    result = "".join(parser.output)
    # Runtime loading is checked at the browser boundary, not in reader prose.
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = build(args.source)
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + "\n")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(result, encoding="utf-8")
    print(f"Wrote standalone HTML: {args.out}")


if __name__ == "__main__":
    main()
