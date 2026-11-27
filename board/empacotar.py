import re
import sys
from pathlib import Path

raiz = Path(__file__).resolve().parent
html = (raiz / "index.html").read_text(encoding="utf-8")


def estilo(achado):
    return "<style>\n" + (raiz / achado.group(1)).read_text(encoding="utf-8") + "</style>"


def codigo(achado):
    return "<script>\n" + (raiz / achado.group(1)).read_text(encoding="utf-8") + "</script>"


html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', estilo, html)
html = re.sub(r'<script src="(js/[^"]+)"></script>', codigo, html)
html = re.sub(
    r'<!doctype html>|</?html[^>]*>|</?head>|</?body>|<meta charset[^>]*>|<meta name="viewport"[^>]*>',
    "",
    html,
    flags=re.IGNORECASE,
)

destino = Path(sys.argv[1]) if len(sys.argv) > 1 else raiz / "dist" / "board.html"
destino.parent.mkdir(parents=True, exist_ok=True)
destino.write_text(html.strip() + "\n", encoding="utf-8")
print(destino)
