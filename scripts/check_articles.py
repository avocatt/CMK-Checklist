#!/usr/bin/env python3
import json
import sys


def check_articles():
    # Load the parsed data
    with open('../src/data/html_content_parsed.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Check if all articles have content
    empty_articles = []
    for article_key, article_data in data.items():
        if not article_data['content'].strip():
            empty_articles.append(article_key)

    if empty_articles:
        print(
            f"WARNING: Found {len(empty_articles)} articles with empty content:")
        for key in empty_articles:
            print(f"  - {key}")
    else:
        print("✓ All articles have content")

    # Check article content statistics
    content_lengths = {k: len(v['content']) for k, v in data.items()}

    # Sort by content length to identify any potential outliers
    sorted_by_length = sorted(content_lengths.items(), key=lambda x: x[1])

    # Show the shortest articles (might indicate parsing issues)
    print("\nShortest articles:")
    for key, length in sorted_by_length[:5]:
        print(
            f"  - {key}: {length} chars, content: '{data[key]['content'][:50]}...'")

    # Show the longest articles (sanity check)
    print("\nLongest articles:")
    for key, length in sorted_by_length[-5:]:
        print(f"  - {key}: {length} chars")

    # Find articles that might have been cut off (end with a word without punctuation)
    potentially_truncated = []
    for key, content in [(k, v['content']) for k, v in data.items()]:
        if content and not content[-1] in '.,:;?!)]"\'':
            potentially_truncated.append(key)

    if potentially_truncated:
        print(
            f"\nWARNING: Found {len(potentially_truncated)} articles that might be truncated:")
        for key in potentially_truncated[:5]:  # Show first 5 only
            print(f"  - {key}: '...{data[key]['content'][-50:]}'")
        if len(potentially_truncated) > 5:
            print(f"  - ... and {len(potentially_truncated) - 5} more")

    # Verify sub-articles (format: main/sub)
    sub_articles = [k for k in data.keys() if '/' in k.split(' ')[1]]
    print(f"\nFound {len(sub_articles)} sub-articles (format: main/sub)")

    # Group articles by law code
    by_code = {}
    for key in data.keys():
        code = key.split(' ')[0]
        if code not in by_code:
            by_code[code] = []
        by_code[code].append(key)

    print("\nArticles by law code:")
    for code, articles in by_code.items():
        print(f"  - {code}: {len(articles)} articles")

    print(f"\nSUMMARY: Total articles: {len(data)}")


if __name__ == "__main__":
    check_articles()
