#!/usr/bin/env python3
import os
import re
import json
from bs4 import BeautifulSoup
import argparse

# Define the target articles list
TARGET_ARTICLES = [
    "2863SK 67", "2863SK 68", "6136SK 12", "6136SK 13", "6713SK 7/2",
    "6713SK 8/4", "CMK 117/1", "CMK 119/1", "CMK 12", "CMK 120/2",
    "CMK 120/3", "CMK 121/1", "CMK 122", "CMK 122/1", "CMK 122/2",
    "CMK 123/1", "CMK 126", "CMK 127/1", "CMK 127/3", "CMK 129/1",
    "CMK 129/2", "CMK 129/3", "CMK 129/4", "CMK 130/1", "CMK 130/3",
    "CMK 134", "CMK 134/1", "CMK 134/2", "CMK 134/3", "CMK 134/4",
    "CMK 134/5", "CMK 147", "CMK 148", "CMK 148/1", "CMK 153/1",
    "CMK 153/2", "CMK 154", "CMK 154/1", "CMK 154/2", "CMK 158",
    "CMK 161", "CMK 161/3", "CMK 169", "CMK 171/2", "CMK 217/1",
    "CMK 223", "CMK 250", "CMK 250/1", "CMK 250/10", "CMK 250/11",
    "CMK 251", "CMK 251/2", "CMK 252/3", "CMK 253", "CMK 45", "CMK 46",
    "CMK 85", "CMK 90/1", "CMK 90/2", "CMK 90/4", "CMK 91/4", "CMK 91/5",
    "CMK 93", "CMK 98/1", "PVSK 16", "PVSK 9", "PVSK EK 6", "TCK 174",
    "TCK 188", "TCK 73", "TCK 75"
]
TARGET_ARTICLES_SET = set(TARGET_ARTICLES)


def extract_law_code(filename):
    """Extract the law code from the filename."""
    return os.path.basename(filename).replace('.html', '')


def clean_text(text):
    """Clean up text by removing extra whitespace."""
    # Replace multiple spaces, newlines, and tabs with a single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def is_title_or_section(text):
    """Check if text is a title or section header."""
    section_keywords = ["BÖLÜM", "KISIM", "KİTAP",
                        "BAŞLANGIÇ", "SON HÜKÜMLER", "YÜRÜRLÜK", "YÜRÜTME"]
    # Convert text to uppercase for case-insensitive matching
    text_upper = text.upper()
    if any(keyword in text_upper for keyword in section_keywords):
        # Further check: if it's a very short line, more likely a header
        if len(text.split()) < 5:
            return True

    # Check if it's a short line with no punctuation (likely a title)
    if len(text) < 60 and not any(p in text for p in [',', '.', ';', ':', '(', ')']):
        return True

    # Check for typical section headers (often all caps, few words)
    if text.isupper() and len(text.split()) <= 5 and not any(char.isdigit() for char in text):
        return True

    return False


def normalize_article_num(article_num_str):
    """Normalize article numbers to a consistent format."""
    # Handle cases like "7-2" -> "7/2", "4-A" -> "4/A"
    # Preserve existing slashes and "EK" or "Geçici" prefixes
    article_num_str = re.sub(r'(?<=\w)-(?=\w)', '/', article_num_str)
    return article_num_str.strip()


def parse_html_file(file_path):
    """Parse the HTML file and extract article information using a two-pass approach."""
    with open(file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    law_code = extract_law_code(file_path)

    paragraphs = soup.find_all('p')

    # Pattern for main articles: "Madde X", "Ek Madde X", "Geçici Madde X"
    main_article_pattern = re.compile(
        r'^(Madde|Ek Madde|Geçici Madde)\s+([\w\d\/\-]+)\s*[–-]?\s*(.*)',
        re.IGNORECASE | re.UNICODE
    )

    # Pattern for sub-article numbers at start of paragraph
    sub_article_item_pattern = re.compile(
        r'^\s*\(?\s*(\d+|[a-zçğıöşü]+)\s*\)?\s*(.*)',
        re.IGNORECASE | re.UNICODE
    )

    # Pattern for modification notes, to be excluded from direct content or title
    modification_note_pattern = re.compile(
        r'^\s*\((\s*(Değişik|Ek|Mülga|Yeniden Düzenleme|İptal)[^)]*)\)\s*$',
        re.IGNORECASE | re.UNICODE
    )

    # Store parsed main articles with their raw content paragraphs
    main_articles_parsed = {}
    current_main_article_num = None
    current_sub_article_num = None

    # Pass 1: Collect content for all main articles, and their associated titles
    for i, p_tag in enumerate(paragraphs):
        raw_text = p_tag.get_text()
        cleaned_text = clean_text(raw_text)

        if not cleaned_text:
            continue

        # Skip modification notes early
        if modification_note_pattern.match(cleaned_text):
            continue

        main_article_match = main_article_pattern.match(cleaned_text)

        if main_article_match:
            current_sub_article_num = None
            prefix_raw = main_article_match.group(1).strip()
            num_part_raw = main_article_match.group(2).strip().rstrip('-')
            content_after_declaration = main_article_match.group(3).strip()

            normalized_num_part = normalize_article_num(num_part_raw)
            if prefix_raw.upper().startswith("EK"):
                current_main_article_num = f"EK {normalized_num_part}"
            elif prefix_raw.upper().startswith("GEÇİCİ"):
                current_main_article_num = f"Geçici {normalized_num_part}"
            else:
                current_main_article_num = normalized_num_part

            # Extract title from previous paragraph(s)
            current_main_article_title = ""
            for k in range(i - 1, -1, -1):
                prev_p_tag_for_title = paragraphs[k]
                prev_text_for_title = clean_text(
                    prev_p_tag_for_title.get_text())
                if not prev_text_for_title:
                    continue
                if modification_note_pattern.match(prev_text_for_title):
                    continue
                if main_article_pattern.match(prev_text_for_title) or is_title_or_section(prev_text_for_title):
                    break
                current_main_article_title = prev_text_for_title.rstrip(
                    ':').strip()
                break

            # Initialize content storage for the new article
            main_articles_parsed[current_main_article_num] = {
                'title': current_main_article_title,
                'content_paragraphs': [],
                'sub_articles': {}
            }

            # Special handling for content after article declaration
            if content_after_declaration:
                # Check if content starts with "(1)" or similar
                sub_on_main_line_match = sub_article_item_pattern.match(
                    content_after_declaration)

                if sub_on_main_line_match:
                    sub_num = sub_on_main_line_match.group(1).strip()
                    sub_content = sub_on_main_line_match.group(2).strip()
                    current_sub_article_num = sub_num
                    main_articles_parsed[current_main_article_num]['sub_articles'][sub_num] = [
                        sub_content]
                else:
                    # If content doesn't start with a sub-article marker but exists,
                    # treat it as sub-article 1 content
                    main_articles_parsed[current_main_article_num]['sub_articles']['1'] = [
                        content_after_declaration]
                    current_sub_article_num = '1'

                main_articles_parsed[current_main_article_num]['content_paragraphs'].append(
                    content_after_declaration)

        elif current_main_article_num:
            if is_title_or_section(cleaned_text):
                current_main_article_num = None
                current_sub_article_num = None
                continue

            main_articles_parsed[current_main_article_num]['content_paragraphs'].append(
                cleaned_text)

            # Check for explicit sub-article markers
            sub_match = sub_article_item_pattern.match(cleaned_text)
            if sub_match:
                sub_num = sub_match.group(1).strip()
                sub_content = sub_match.group(2).strip()

                current_sub_article_num = sub_num
                if sub_num not in main_articles_parsed[current_main_article_num]['sub_articles']:
                    main_articles_parsed[current_main_article_num]['sub_articles'][sub_num] = [
                    ]
                main_articles_parsed[current_main_article_num]['sub_articles'][sub_num].append(
                    sub_content)
            elif current_sub_article_num:
                # Continue adding to current sub-article if no new marker
                main_articles_parsed[current_main_article_num]['sub_articles'][current_sub_article_num].append(
                    cleaned_text)
            elif not any(cleaned_text.startswith(f"({num})") for num in range(2, 10)):
                # If this is content without a sub-article marker and not starting with (2)-(9),
                # append it to sub-article 1 if it exists
                if '1' not in main_articles_parsed[current_main_article_num]['sub_articles']:
                    main_articles_parsed[current_main_article_num]['sub_articles']['1'] = [
                    ]
                main_articles_parsed[current_main_article_num]['sub_articles']['1'].append(
                    cleaned_text)

    # Pass 2: Extract specific target articles
    final_results = []

    for target_article_key in TARGET_ARTICLES_SET:
        target_parts = target_article_key.split(' ', 1)
        if len(target_parts) != 2:
            continue

        target_law_code, target_article_id = target_parts

        if target_law_code != law_code:
            continue

        # Handle main articles without sub-parts
        if '/' not in target_article_id and target_article_id in main_articles_parsed:
            article_data = main_articles_parsed[target_article_id]
            full_content = "\n".join(
                [line for line in article_data['content_paragraphs'] if line.strip()]).strip()

            final_results.append({
                'code': law_code,
                'article': target_article_id,
                'title': article_data['title'],
                'content': full_content
            })
            continue

        # Handle sub-articles
        parts = target_article_id.split('/')
        if len(parts) == 2:
            main_num = parts[0]
            sub_num_target = parts[1]

            if main_num in main_articles_parsed:
                main_article_data = main_articles_parsed[main_num]

                # First try to get content from structured sub_articles
                if sub_num_target in main_article_data['sub_articles']:
                    sub_content = "\n".join(
                        filter(None, main_article_data['sub_articles'][sub_num_target])).strip()
                    if sub_content:
                        final_results.append({
                            'code': law_code,
                            'article': target_article_id,
                            'title': main_article_data['title'],
                            'content': sub_content
                        })
                        continue

                # If not found in structured sub_articles, try to extract from main content
                content_lines = main_article_data['content_paragraphs']
                if content_lines:
                    # For sub-article 1, if it's not explicitly marked, use the first paragraph
                    if sub_num_target == '1' and not any(line.strip().startswith('(1)') for line in content_lines):
                        first_content = content_lines[0].strip()
                        if first_content:
                            final_results.append({
                                'code': law_code,
                                'article': target_article_id,
                                'title': main_article_data['title'],
                                'content': first_content
                            })

    return final_results


def process_all_files(directory, output_file):
    """Process all HTML files in the directory and generate a single JSON file."""
    result = {}

    for filename in os.listdir(directory):
        if filename.endswith('.html'):
            file_path = os.path.join(directory, filename)
            print(f"Processing {file_path}...")

            articles = parse_html_file(file_path)

            # Add to the result dictionary
            for article in articles:
                key = f"{article['code']} {article['article']}"
                result[key] = article

    # Special handling for any missing articles, particularly CMK with "/1" sub-articles
    missing_articles = []
    for target in TARGET_ARTICLES:
        if target not in result:
            missing_articles.append(target)
            law_code = target.split(' ')[0]

            # For CMK articles with sub-article 1
            if law_code == "CMK" and target.endswith("/1"):
                main_article_num = target.split(' ')[1].split('/')[0]
                html_file = os.path.join(directory, f"{law_code}.html")

                if os.path.exists(html_file):
                    print(f"Special extraction for {target}...")

                    with open(html_file, 'r', encoding='utf-8') as file:
                        html_content = file.read()

                    soup = BeautifulSoup(html_content, 'html.parser')
                    paragraphs = soup.find_all('p')

                    # Pattern to find the article declaration
                    article_pattern = re.compile(
                        r'Madde\s+' + re.escape(main_article_num) + r'\s*[–-]',
                        re.IGNORECASE
                    )

                    # Find the paragraph containing this article
                    article_p = None
                    article_title = ""

                    for i, p in enumerate(paragraphs):
                        text = p.get_text().strip()
                        if article_pattern.search(text):
                            article_p = p
                            # Get title from previous paragraph
                            if i > 0:
                                prev_text = paragraphs[i-1].get_text().strip()
                                if prev_text and not prev_text.lower().startswith("madde"):
                                    article_title = clean_text(prev_text)
                            break

                    if article_p:
                        # Extract sub-article 1 content
                        article_text = clean_text(article_p.get_text())
                        sub_match = re.search(
                            r'\(\s*1\s*\)\s*(.*)', article_text)

                        if sub_match:
                            sub_content = sub_match.group(1).strip()

                            # Check for continuation paragraphs until sub-article 2 or new main article
                            idx = paragraphs.index(article_p) + 1
                            continue_collecting = True

                            while idx < len(paragraphs) and continue_collecting:
                                next_p = paragraphs[idx]
                                next_text = clean_text(next_p.get_text())

                                # Stop if we hit sub-article 2 or new main article
                                if re.match(r'^\s*\(\s*2\s*\)', next_text) or re.match(r'^Madde\s+\d+', next_text):
                                    continue_collecting = False
                                elif next_text and not next_text.startswith("("):
                                    # Only add paragraphs that don't start new sub-articles
                                    sub_content += "\n" + next_text

                                idx += 1

                            # Add to results
                            article_id = target.split(' ')[1]
                            result[target] = {
                                'code': law_code,
                                'article': article_id,
                                'title': article_title,
                                'content': sub_content
                            }
                            print(f"  Successfully extracted {target}")

    # Write the result to a single JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    # Print summary
    print(
        f"Processed {len(result)} articles out of {len(TARGET_ARTICLES)} target articles")
    if missing_articles:
        print(
            f"Missing {len(missing_articles)} articles: {', '.join(missing_articles)}")
    print(f"Saved to {output_file}")

    return result


def main():
    parser = argparse.ArgumentParser(
        description='Parse law HTML files and generate JSON')
    parser.add_argument('--input-dir', default='../src/data/laws_content',
                        help='Directory containing HTML files')
    parser.add_argument(
        '--output-file', default='../src/data/html_content_parsed.json', help='Output JSON file')
    args = parser.parse_args()

    # Process all HTML files and output to a single file
    process_all_files(args.input_dir, args.output_file)


if __name__ == "__main__":
    main()
