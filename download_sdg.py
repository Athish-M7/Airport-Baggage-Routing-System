import urllib.request
import re
import os

files = {
    'sdg9.png': 'Sustainable_Development_Goal_9.png',
    'sdg11.png': 'Sustainable_Development_Goal_11.png',
    'sdg12.png': 'Sustainable_Development_Goal_12.png',
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

for out_name, wiki_file in files.items():
    page_url = f'https://commons.wikimedia.org/wiki/File:{wiki_file}'
    try:
        req = urllib.request.Request(page_url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Look for the full image download link: <div class="fullImageLink" id="file"><a href="...">
            match = re.search(r'class="fullImageLink"[^>]*><a href="([^"]+)"', html)
            if not match:
                # or <a class="internal" href="...">
                match = re.search(r'<a class="internal" href="([^"]+)"', html)
            
            if match:
                img_url = match.group(1)
                if not img_url.startswith('http'):
                    img_url = 'https:' + img_url
                print(f"Found {out_name} -> {img_url}")
                img_req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(img_req) as img_resp, open(out_name, 'wb') as f:
                    f.write(img_resp.read())
                print(f"Downloaded {out_name} ({os.path.getsize(out_name)} bytes)")
            else:
                print(f"No match in page for {wiki_file}")
    except Exception as e:
        print(f"Error {wiki_file}: {e}")
