import os
import sys
import json
import requests
import feedparser
import re
import dateutil.parser
from urllib.parse import urlparse, urljoin
from datetime import datetime, timezone
from bs4 import BeautifulSoup, MarkupResemblesLocatorWarning
import warnings

# Suppress BeautifulSoup warnings
warnings.filterwarnings("ignore", category=MarkupResemblesLocatorWarning)

# Import all of Colorama
from colorama import init, Fore, Back, Style
init(autoreset=True)

# ---------------------------
# Utility Functions
# ---------------------------

def get_domain(url):
    """Extracts the domain name from a URL (excluding 'www.')."""
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.replace("www.", "")
    return domain

def fetch_favicon(domain):
    """
    Fetches the favicon URL from the website's HTML.
    Tries HTTPS first, then HTTP if needed.
    """
    base_url = f"https://{domain}"
    try:
        response = requests.get(base_url, timeout=10)
        response.raise_for_status()
    except Exception:
        base_url = f"http://{domain}"
        try:
            response = requests.get(base_url, timeout=10)
            response.raise_for_status()
        except Exception as e:
            print(f"❌ {Fore.RED}Could not fetch website for domain {domain} to get favicon: {e}")
            return None

    soup = BeautifulSoup(response.text, 'html.parser')
    icon_link = soup.find("link", rel=lambda x: x and "icon" in x.lower())
    if icon_link and icon_link.get("href"):
        favicon_url = urljoin(base_url, icon_link["href"])
        return favicon_url
    return None

def read_map_file(domain, map_dir):
    """
    Reads the domain-specific map JSON file and returns a set of processed URLs.
    """
    map_file = os.path.join(map_dir, f"{domain}.json")
    if os.path.exists(map_file):
        try:
            with open(map_file, "r", encoding="utf-8") as file:
                data = json.load(file)
                urls = set()
                for posts in data.get("dates", {}).values():
                    urls.update(posts)
                return urls
        except Exception as e:
            print(f"❌ {Fore.RED}Error reading map file for domain {domain}: {e}")
            return set()
    return set()

def update_map_file(domain, date_key, permalink, map_dir):
    """
    Updates the domain-specific map JSON file with the favicon (if not already fetched)
    and adds the processed post URL under the provided date.
    """
    map_file = os.path.join(map_dir, f"{domain}.json")
    if os.path.exists(map_file):
        try:
            with open(map_file, "r", encoding="utf-8") as file:
                map_data = json.load(file)
        except Exception as e:
            print(f"❌ Error reading map file for domain {domain}: {e}")
            map_data = {}
    else:
        map_data = {}

    if "favicon" not in map_data or not map_data["favicon"]:
        favicon = fetch_favicon(domain)
        map_data["favicon"] = favicon

    if "dates" not in map_data:
        map_data["dates"] = {}

    if date_key not in map_data["dates"]:
        map_data["dates"][date_key] = []
    if permalink not in map_data["dates"][date_key]:
        map_data["dates"][date_key].append(permalink)

    with open(map_file, "w", encoding="utf-8") as file:
        json.dump(map_data, file, indent=4, ensure_ascii=False)

def map_fields(entry):
    """
    Maps RSS entry fields to the standard output format.
    - Extracts the permalink, title, date, and tags.
    - Converts HTML summary to plain text and truncates it at the first dot.
    - If the summary is missing, attempts to fetch the article page for a fallback summary.
    - Extracts an embedded image URL if available.
    """
    permalink = getattr(entry, "link", None)
    title = getattr(entry, "title", None)

    raw_summary = getattr(entry, "summary", None) or getattr(entry, "description", None)
    if not raw_summary and hasattr(entry, "content") and entry.content:
        raw_summary = entry.content[0].get("value", None)

    summary = None
    if raw_summary:
        text_summary = BeautifulSoup(raw_summary, "html.parser").get_text().strip()
        dot_index = text_summary.find('.')
        summary = text_summary[:dot_index + 1] if dot_index != -1 else text_summary

    # Fallback: if no summary, attempt to fetch from the article page.
    if not summary and permalink:
        try:
            response = requests.get(permalink, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc and meta_desc.get("content"):
                text_summary = meta_desc["content"].strip()
            else:
                first_p = soup.find("p")
                text_summary = first_p.get_text().strip() if first_p else ""
            dot_index = text_summary.find('.')
            summary = text_summary[:dot_index + 1] if dot_index != -1 else text_summary
        except Exception as e:
            print(f"❌ {e}")
            summary = ""

    date_str = getattr(entry, "published", None)
    tags = [tag.term for tag in getattr(entry, "tags", [])]

    return {
        "title": title,
        "date": date_str,
        "permalink": permalink,
        "image": entry.media_content[0].get("url") if hasattr(entry, "media_content") and entry.media_content else None,
        "summary": summary,
        "category": category,  # category is set per feed file.
        "tags": tags
    }

def extract_urls(json_file, key="url"):
    """
    Extracts feed URLs from the provided JSON file and excludes those already processed.
    """
    try:
        with open(json_file, 'r', encoding='utf-8') as file:
            data = json.load(file)
    except json.JSONDecodeError:
        print("❌ Error: Invalid JSON file format.")
        return []
    
    urls = [item[key] for item in data.get("feeds", []) if isinstance(item, dict) and key in item]
    new_urls = []

    for url in urls:
        domain = get_domain(url)
        existing_urls = read_map_file(domain, MAP_DIR)
        if url not in existing_urls:
            new_urls.append(url)
    
    print(f"✅ Extracted {len(new_urls)} new URLs from {json_file}.")
    return new_urls

def fetch_feed(url, existing_urls, silent=False, error_dict=None):
    """
    Fetches and parses an RSS feed from the given URL.
    Only returns posts whose permalinks have not yet been processed.
    
    If silent is True, suppresses informational messages.
    Any error (e.g., HTTP 403, connection errors) is stored in error_dict if provided.
    """
    try:
        if not silent:
            print(f"\n📡 Fetching feed: {Fore.CYAN}{url}")
        response = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        feed = feedparser.parse(response.content)
        posts = [map_fields(entry) for entry in feed.entries] if feed.entries else []
        total_posts = len(posts)
        new_posts = [post for post in posts if post["permalink"] not in existing_urls]
        already_added = total_posts - len(new_posts)
        if not silent:
            if len(new_posts) == 0:
                print(f"{Fore.GREEN}✅ No new posts found.")
            else:
                print(f"✅{Fore.YELLOW} Retrieved {total_posts} posts, {already_added} already added, adding {len(new_posts)}.")
        return new_posts
    except requests.exceptions.RequestException as e:
        error_msg = f"{Fore.RED}{e}"
        if error_dict is not None:
            error_dict.setdefault(url, []).append(error_msg)
        if not silent:
            print(f"❌ {error_msg}")
        return []

def save_to_json(data, base_path):
    """
    Saves parsed posts into a JSON file grouped by date.
    Creates the folder structure under a parent folder called 'data'
    (i.e. base_path/data/YYYY/MM/DD/<category>.json).
    Also updates the corresponding domain map file.
    """
    for post in data:
        if not post.get("permalink"):
            continue

        domain = get_domain(post["permalink"])
        existing_urls = read_map_file(domain, MAP_DIR)
        if post["permalink"] not in existing_urls:
            # Parse the date to determine the folder structure.
            if "date" in post and post["date"]:
                try:
                    dt = dateutil.parser.parse(post["date"])
                    date_key = dt.strftime("%Y-%m-%d")
                    post_path = os.path.join(base_path, "data", dt.strftime("%Y"), dt.strftime("%m"), dt.strftime("%d"))
                except Exception as e:
                    print(f"❌ {Fore.RED}Error parsing date for post {post['permalink']}: {e}")
                    date_key = "unknown"
                    post_path = os.path.join(base_path, "data", "unknown")
            else:
                date_key = "unknown"
                post_path = os.path.join(base_path, "data", "unknown")
            os.makedirs(post_path, exist_ok=True)
            # Use the derived category as the filename.
            output_file = os.path.join(post_path, f"{category}.json")
            if os.path.exists(output_file):
                with open(output_file, "r", encoding="utf-8") as file:
                    existing_data = json.load(file)
                existing_data.append(post)
            else:
                existing_data = [post]
            with open(output_file, "w", encoding="utf-8") as file:
                json.dump(existing_data, file, indent=4, ensure_ascii=False)
            # Update the domain's map file.
            update_map_file(domain, date_key, post["permalink"], MAP_DIR)

# ---------------------------
# Main Processing Functions
# ---------------------------

def process_feed_file(feed_file):
    """
    Processes a single JSON feed file.
    The output directory is fixed to 'Local'.
    The category is derived from the JSON feed file's name (without extension).
    After processing, it re-checks every feed that added posts to ensure that
    no new posts are found. If a feed still returns the same number of new posts,
    an error message is recorded.
    Returns:
      (valid_posts_count, error_feeds) - the number of posts considered valid and a dictionary of errors.
    """
    global MAP_DIR, category
    # Set category based on the JSON feed file name.
    category = os.path.splitext(os.path.basename(feed_file))[0]
    
    # Fix 1: OUTPUT_DIR is now fixed to 'Local'
    OUTPUT_DIR = 'local'
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    # Create a map directory within the output directory.
    MAP_DIR = os.path.join(OUTPUT_DIR, "map")
    os.makedirs(MAP_DIR, exist_ok=True)

    print(f"\n🚀 Processing {Fore.MAGENTA}{category.capitalize()}{Style.RESET_ALL} feed file.. ")

    # Dictionary to store any error messages keyed by feed URL.
    error_feeds = {}
    
    urls = extract_urls(feed_file)
    if not urls:
        print("❌ No new URLs to process in", feed_file)
        return 0, error_feeds
    
    all_posts = []
    # Dictionary to track how many new posts each feed URL returned initially.
    new_posts_by_feed = {}
    for url in urls:
        domain = get_domain(url)
        existing_urls = read_map_file(domain, MAP_DIR)
        new_posts = fetch_feed(url, existing_urls, error_dict=error_feeds)
        new_posts_by_feed[url] = len(new_posts)
        all_posts.extend(new_posts)
    
    if all_posts:
        save_to_json(all_posts, OUTPUT_DIR)
    
    # Re-check each feed that had new posts.
    print(f"\n✅ Performing validation check..\n")
    valid_posts_count = 0
    for feed_url, original_count in new_posts_by_feed.items():
        # Only perform recheck if the feed originally returned > 0 posts.
        if original_count > 0:
            domain = get_domain(feed_url)
            updated_existing_urls = read_map_file(domain, MAP_DIR)
            recheck_posts = fetch_feed(feed_url, updated_existing_urls, silent=True, error_dict=error_feeds)
            if len(recheck_posts) == original_count:
                error_msg = f"Feed {feed_url} still returned {original_count} new posts upon recheck."
                error_feeds.setdefault(feed_url, []).append(error_msg)
            else:
                valid_posts_count += original_count

    print(f"✅ Feed processing complete for {feed_file}.")
    return valid_posts_count, error_feeds

def main():
    if len(sys.argv) > 1:
        search_path = sys.argv[1]
    else:
        search_path = os.getcwd()

    json_files = [os.path.join(search_path, f) for f in os.listdir(search_path) if f.endswith('.json')]
    if not json_files:
        print("❌ {Fore.RED}No JSON feed files found in", search_path)
        return

    total_valid_posts = 0
    total_errors = {}
    for feed_file in json_files:
        valid_posts_count, error_feeds = process_feed_file(feed_file)
        total_valid_posts += valid_posts_count
        # Merge errors from each feed file.
        for url, errors in error_feeds.items():
            if url in total_errors:
                total_errors[url].extend(errors)
            else:
                total_errors[url] = errors

    # Compute the total number of errors.
    error_count = sum(len(err_list) for err_list in total_errors.values())
    
    print("\nSummary:\n")
    if total_valid_posts == 0:
        print(f"✅ {Fore.GREEN}0 new posts found.")
    else:
        print(f"✅ {Fore.GREEN}{total_valid_posts} new posts added.")
    if error_count > 0:
        print(f"❌ {Fore.RED}{error_count} errors encountered:{Style.RESET_ALL}")
        for url, errors in total_errors.items():
            for err in errors:
                print(f"   - {Fore.YELLOW}{err}")
        print(f"\n   Please check the validity of the above feeds, if the issues persist, consider removing them.")

if __name__ == "__main__":
    main()
