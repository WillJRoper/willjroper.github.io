#!/usr/bin/env python3
"""
Script to generate publications.md from bib.tex file.
Reads BibTeX entries and creates a chronologically ordered publication list.
"""

import re
from datetime import datetime
from typing import Dict, List, Tuple


def parse_bibtex_file(filepath: str) -> List[Dict]:
    """Parse a BibTeX file and return a list of publication dictionaries."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into individual entries
    entries = re.findall(r'@\w+\{[^@]+\}', content, re.DOTALL)

    publications = []
    for entry in entries:
        pub = parse_bibtex_entry(entry)
        if pub:
            publications.append(pub)

    return publications


def parse_bibtex_entry(entry: str) -> Dict:
    """Parse a single BibTeX entry and extract relevant fields."""
    # Extract entry type and key
    match = re.match(r'@(\w+)\{([^,]+),', entry)
    if not match:
        return None

    entry_type = match.group(1)
    key = match.group(2).strip()

    pub = {
        'type': entry_type,
        'key': key,
    }

    # Extract fields using regex - handle nested braces, quotes, and multiline
    def extract_field(field_name, text):
        """Extract a field value, handling nested braces and quoted strings."""
        pattern = rf'{field_name}\s*=\s*'
        match = re.search(pattern, text)
        if not match:
            return None

        start = match.end()
        # Skip whitespace
        while start < len(text) and text[start] in ' \t\n\r':
            start += 1

        if start >= len(text):
            return None

        # Handle quoted strings
        if text[start] == '"':
            end = start + 1
            while end < len(text):
                if text[end] == '"' and text[end-1] != '\\':
                    return text[start+1:end]
                end += 1

        # Handle braced values
        elif text[start] == '{':
            brace_count = 0
            i = start
            while i < len(text):
                if text[i] == '{':
                    brace_count += 1
                elif text[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        return text[start+1:i]
                i += 1

        # Handle bare numbers (like year = 2020)
        else:
            match = re.match(r'(\d+)', text[start:])
            if match:
                return match.group(1)

        return None

    fields_to_extract = ['author', 'title', 'journal', 'school', 'year',
                         'month', 'volume', 'number', 'pages', 'doi',
                         'adsurl', 'eprint']

    for field in fields_to_extract:
        value = extract_field(field, entry)
        if value:
            pub[field] = value.strip()

    return pub


def format_authors(author_string: str) -> str:
    """Format author names from BibTeX format."""
    # Replace LaTeX accent commands - handle nested braces
    # First handle accents with braces
    author_string = re.sub(r"\\'\\{e\\}", 'é', author_string)
    author_string = re.sub(r"\\'\{e\}", 'é', author_string)
    author_string = re.sub(r"\\'{e}", 'é', author_string)
    author_string = re.sub(r"\\'e", 'é', author_string)

    author_string = re.sub(r"\\`\\{e\\}", 'è', author_string)
    author_string = re.sub(r"\\`\{e\}", 'è', author_string)
    author_string = re.sub(r"\\`{e}", 'è', author_string)
    author_string = re.sub(r"\\`e", 'è', author_string)

    author_string = re.sub(r'\\"\\{o\\}', 'ö', author_string)
    author_string = re.sub(r'\\"\{o\}', 'ö', author_string)
    author_string = re.sub(r'\\"{o}', 'ö', author_string)
    author_string = re.sub(r'\\"o', 'ö', author_string)

    author_string = re.sub(r"\\'\\{a\\}", 'á', author_string)
    author_string = re.sub(r"\\'\{a\}", 'á', author_string)
    author_string = re.sub(r"\\'{a}", 'á', author_string)
    author_string = re.sub(r"\\'a", 'á', author_string)

    author_string = re.sub(r'\\"\{\\i\}', 'í', author_string)
    author_string = re.sub(r'\\"\{i\}', 'í', author_string)
    author_string = re.sub(r'\\"\\i', 'í', author_string)

    author_string = re.sub(r'\\v\{s\}', 'š', author_string)
    author_string = re.sub(r'\\v\{c\}', 'č', author_string)

    # Remove remaining braces (handle multiple passes for nested braces)
    while '{' in author_string:
        old_string = author_string
        author_string = re.sub(r'\{([^{}]*)\}', r'\1', author_string)
        if old_string == author_string:  # No more changes
            break

    author_string = author_string.replace('~', ' ')
    # Clean up any backslashes left
    author_string = re.sub(r'\\(.)', r'\1', author_string)

    # Split authors
    authors = re.split(r'\s+and\s+', author_string)

    # Format each author (Last, First -> First Last)
    formatted_authors = []
    for author in authors:
        author = author.strip()
        # Handle "Last, First" format
        if ',' in author:
            parts = author.split(',', 1)
            author = f"{parts[1].strip()} {parts[0].strip()}"
        formatted_authors.append(author)

    # Join with commas
    if len(formatted_authors) > 2:
        return ', '.join(formatted_authors[:-1]) + f', & {formatted_authors[-1]}'
    elif len(formatted_authors) == 2:
        return f'{formatted_authors[0]} & {formatted_authors[1]}'
    else:
        return formatted_authors[0]


def format_title(title: str) -> str:
    """Clean up title formatting."""
    # Replace LaTeX special characters
    title = title.replace('\\textendash', '–')
    title = title.replace('\\ddot{\\mu}', 'μ̈')
    title = title.replace('\\Lambda', 'Λ')
    title = title.replace('LambdaCDM', 'ΛCDM')

    # Remove \ensuremath
    title = re.sub(r'\\ensuremath\{([^}]+)\}', r'\1', title)

    # Remove remaining braces
    title = title.replace('{', '').replace('}', '')

    return title


def format_journal(journal: str) -> str:
    """Expand journal abbreviations."""
    journal_map = {
        '\\mnras': 'MNRAS',
        '\\aap': 'A&A',
        '\\apj': 'ApJ',
    }

    for abbr, full in journal_map.items():
        journal = journal.replace(abbr, full)

    return journal


def month_to_number(month_str: str) -> int:
    """Convert month name to number."""
    months = {
        'jan': 1, 'january': 1,
        'feb': 2, 'february': 2,
        'mar': 3, 'march': 3,
        'apr': 4, 'april': 4,
        'may': 5,
        'jun': 6, 'june': 6,
        'jul': 7, 'july': 7,
        'aug': 8, 'august': 8,
        'sep': 9, 'september': 9,
        'oct': 10, 'october': 10,
        'nov': 11, 'november': 11,
        'dec': 12, 'december': 12,
    }
    return months.get(month_str.lower(), 6)  # Default to June if not found


def get_sort_key(pub: Dict) -> Tuple[int, int]:
    """Generate sort key for chronological ordering (newest first)."""
    year = int(pub.get('year', 0))
    month = month_to_number(pub.get('month', 'jan'))
    return (-year, -month)  # Negative for reverse chronological order


def format_publication(pub: Dict) -> str:
    """Format a publication entry as markdown."""
    lines = []

    # Title (bold)
    title = format_title(pub.get('title', 'Untitled'))
    lines.append(f"**{title}**")

    # Authors
    if 'author' in pub:
        authors = format_authors(pub['author'])
        lines.append(f"_{authors}_")

    # Publication details
    details = []

    if pub['type'] == 'PHDTHESIS':
        if 'school' in pub:
            details.append(f"PhD Thesis, {pub['school']}")
    else:
        if 'journal' in pub:
            journal = format_journal(pub['journal'])
            details.append(journal)

        if 'volume' in pub:
            vol_info = pub['volume']
            if 'number' in pub:
                vol_info += f"({pub['number']})"
            if 'pages' in pub:
                vol_info += f", {pub['pages']}"
            details.append(vol_info)

    # Year (month will be shown in the year grouping, so just year here)
    if 'year' in pub:
        details.append(pub['year'])

    if details:
        lines.append(', '.join(details))

    # Links
    links = []
    if 'doi' in pub:
        doi = pub['doi']
        links.append(f"[DOI](https://doi.org/{doi})")
    if 'adsurl' in pub:
        links.append(f"[ADS]({pub['adsurl']})")
    if 'eprint' in pub and 'doi' not in pub:
        arxiv = pub['eprint']
        links.append(f"[arXiv](https://arxiv.org/abs/{arxiv})")

    if links:
        lines.append(' | '.join(links))

    return '\n'.join(lines)


def generate_publications_page(publications: List[Dict], output_file: str):
    """Generate the publications.md file."""
    # Sort publications chronologically (newest first)
    publications.sort(key=get_sort_key)

    # Generate markdown content
    lines = [
        '---',
        'layout: default',
        'title: "Publications"',
        '---',
        '',
        '# Publications',
        '',
    ]

    # Group by year
    current_year = None
    for pub in publications:
        year = pub.get('year', 'Unknown')

        if year != current_year:
            if current_year is not None:
                lines.append('')  # Add space between years
            lines.append(f'## {year}')
            lines.append('')
            current_year = year

        # Add publication
        pub_text = format_publication(pub)
        lines.append(pub_text)
        lines.append('')  # Blank line between publications

    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"Generated {output_file} with {len(publications)} publications")


def main():
    """Main function."""
    # Parse BibTeX file
    publications = parse_bibtex_file('bib.tex')

    # Generate publications page
    generate_publications_page(publications, 'publications.md')


if __name__ == '__main__':
    main()
