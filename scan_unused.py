import os, re, pathlib
root = pathlib.Path('src').resolve()
files = [p for p in root.rglob('*') if p.suffix in {'.js', '.jsx'}]
all_text = {}
for p in files:
    try:
        all_text[p] = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        all_text[p] = ''
unused = []
for p in files:
    rel = str(p.relative_to(root)).replace('\\', '/')
    if rel.lower().endswith(('index.js', 'index.jsx')):
        search_key = str(p.parent.relative_to(root)).replace('\\', '/')
        if search_key == '.':
            search_key = 'index'
    else:
        search_key = re.sub(r'\\.jsx?$', '', rel, flags=re.I)
    patterns = [
        rf"from ['\"]{re.escape(search_key)}['\"]",
        rf"require\(['\"]{re.escape(search_key)}['\"]\)",
        rf"import ['\"]{re.escape(search_key)}['\"]"
    ]
    matched = False
    for text in all_text.values():
        if any(re.search(p, text) for p in patterns):
            matched = True
            break
    if not matched:
        unused.append(rel)
for u in sorted(unused):
    print(u)
