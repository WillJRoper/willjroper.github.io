"""A script for making name badges for a conference with text wrapping."""

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# Load CSV data
csv_file = "/Users/willroper/Downloads/Virgo 2025 (Responses) - Form responses 1.csv"
df = pd.read_csv(csv_file)

# PDF settings
output_pdf = "styled_name_badges_hack.pdf"
page_width, page_height = letter
badge_width, badge_height = 3.5 * inch, 2.0 * inch  # Standard badge size
margin_x, margin_y = 0.5 * inch, 0.5 * inch
cols, rows = 2, 4  # 2 badges per row, 4 per page
gap_x, gap_y = 0.5 * inch, 0.5 * inch

# Logo Settings
logo_path = "/Users/willroper/Downloads/virgo-logo.png"
logo_height = 0.3 * inch
logo_size = (3.6 * logo_height, logo_height)  # Maintain aspect ratio

# Register Hack Mono Font
hack_font_path = "Hack-Regular.ttf"  # Path to Hack font file
pdfmetrics.registerFont(TTFont("HackMono", hack_font_path))

# Calculate positioning
start_x = margin_x
start_y = page_height - margin_y - badge_height  # Start from top


def wrap_text(text, font_name, font_size, max_width):
    """
    Wraps text into multiple lines so it fits within max_width.
    """
    wrapped_lines = simpleSplit(text, font_name, font_size, max_width)
    return wrapped_lines


def create_pdf(data):
    """Create a PDF with name badges that handle text wrapping."""
    c = canvas.Canvas(output_pdf, pagesize=letter)

    x, y = start_x, start_y
    badge_count = 0

    for index, row in data.iterrows():
        name = row.get("Name", "").strip()
        institution = row.get("Institution", "").strip()

        # Draw badge background with color
        c.setFillColor(colors.whitesmoke)
        c.rect(x, y, badge_width, badge_height, fill=1, stroke=0)

        # Add a border
        c.setStrokeColor(colors.black)
        c.setLineWidth(2)
        c.rect(x, y, badge_width, badge_height, fill=0, stroke=1)

        # Draw logo (if available)
        try:
            c.drawImage(
                logo_path,
                x + 0.2 * inch,
                y + badge_height - 0.5 * inch,
                width=logo_size[0],
                height=logo_size[1],
                mask="auto",
            )
        except Exception:
            pass  # Skip if logo file is missing

        # Set text properties
        name_font_size = 16
        institution_font_size = 12
        max_text_width = badge_width - 0.4 * inch  # Leave some margin

        # Wrap text for names
        wrapped_name = wrap_text(name, "HackMono", name_font_size, max_text_width)
        wrapped_institution = wrap_text(
            institution, "HackMono", institution_font_size, max_text_width
        )

        # Draw wrapped name text
        c.setFont("HackMono", name_font_size)
        c.setFillColor(colors.black)
        name_y = y + badge_height - 1.0 * inch
        for line in wrapped_name:
            c.drawCentredString(x + badge_width / 2, name_y, line)
            name_y -= 0.2 * inch  # Adjust spacing for each line

        # Draw wrapped institution text
        c.setFont("HackMono", institution_font_size)
        c.setFillColor(colors.darkblue)
        inst_y = name_y - 0.2 * inch  # Leave space between name and institution
        for line in wrapped_institution:
            c.drawCentredString(x + badge_width / 2, inst_y, line)
            inst_y -= 0.15 * inch  # Adjust spacing for each line

        # Move to next position
        badge_count += 1
        x += badge_width + gap_x
        if badge_count % cols == 0:  # Move to next row
            x = start_x
            y -= badge_height + gap_y

        if badge_count % (cols * rows) == 0:  # New page
            c.showPage()
            x, y = start_x, start_y

    c.save()


# Generate PDF
create_pdf(df)
print(f"Styled PDF with Hack font and text wrapping saved as {output_pdf}")
