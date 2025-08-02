import hashlib, os, json

DEDUP_FILE = "dedup_cache.json"

def load_dedup_cache():
    if not os.path.exists(DEDUP_FILE): return set()
    with open(DEDUP_FILE) as f: return set(json.load(f))

def save_dedup_cache(cache):
    with open(DEDUP_FILE, "w") as f: json.dump(list(cache), f)

def article_hash(text):
    return hashlib.md5(text.strip().lower().encode()).hexdigest()

def is_duplicate(text, cache): return article_hash(text) in cache
def mark_as_sent(text, cache):
    cache.add(article_hash(text))
    save_dedup_cache(cache)x