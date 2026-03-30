#!/usr/bin/env python3
"""Convert the two SVG files to a single 2-page PDF using CairoSVG."""

import cairosvg
import os
import sys

# Try to use PyPDF2 or pdf-lib equivalent for merging
# If not available, we'll output individual PDFs

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

svg_files = [
    os.path.join(BASE_DIR, 'pregnancy-guide-outside.svg'),
    os.path.join(BASE_DIR, 'pregnancy-guide-inside.svg'),
]

pdf_files = []
for svg_path in svg_files:
    pdf_path = svg_path.replace('.svg', '.pdf')
    print(f'Converting {os.path.basename(svg_path)}...')
    cairosvg.svg2pdf(
        url=svg_path,
        write_to=pdf_path,
        output_width=1904,
        output_height=704,
    )
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f'  -> {os.path.basename(pdf_path)} ({size_kb:.0f} KB)')
    pdf_files.append(pdf_path)

# Merge PDFs
try:
    from PyPDF2 import PdfMerger
    merger = PdfMerger()
    for pdf_path in pdf_files:
        merger.append(pdf_path)
    output_path = os.path.join(BASE_DIR, 'pregnancy-guide-brochure-editable-new.pdf')
    merger.write(output_path)
    merger.close()
    size_kb = os.path.getsize(output_path) / 1024
    print(f'Merged PDF: {os.path.basename(output_path)} ({size_kb:.0f} KB)')
    # Clean up individual PDFs
    for pdf_path in pdf_files:
        os.remove(pdf_path)
except ImportError:
    print('PyPDF2 not available. Using reportlab for merging...')
    try:
        from reportlab.lib.pagesizes import landscape
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch
        import io

        # Read individual PDFs and merge with reportlab
        # Actually, let's just use a simple page-by-page copy
        # Better approach: use pdfrw
        raise ImportError("Try pdfrw")
    except ImportError:
        print('Trying pdfrw...')
        try:
            import pdfrw
            writer = pdfrw.PdfWriter()
            for pdf_path in pdf_files:
                reader = pdfrw.PdfReader(pdf_path)
                writer.addpages(reader.pages)
            output_path = os.path.join(BASE_DIR, 'pregnancy-guide-brochure-editable-new.pdf')
            writer.write(output_path)
            size_kb = os.path.getsize(output_path) / 1024
            print(f'Merged PDF: {os.path.basename(output_path)} ({size_kb:.0f} KB)')
            for pdf_path in pdf_files:
                os.remove(pdf_path)
        except ImportError:
            print('No PDF merging library available.')
            print(f'Individual PDFs saved:')
            for p in pdf_files:
                print(f'  {p}')
            # Copy first PDF as the output (single page)
            import shutil
            output_path = os.path.join(BASE_DIR, 'pregnancy-guide-brochure-editable-new.pdf')
            shutil.copy(pdf_files[0], output_path)
            print(f'Copied outside as main PDF. Inside is separate.')

print('Done!')
