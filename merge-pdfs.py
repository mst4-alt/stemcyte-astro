#!/usr/bin/env python3
"""Merge outside and inside strip PDFs into a single 2-page editable PDF."""

from PyPDF2 import PdfMerger
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, 'pregnancy-guide-brochure-editable.pdf')

merger = PdfMerger()
merger.append('/tmp/outside-strip.pdf')
merger.append('/tmp/inside-strip.pdf')
merger.write(output_path)
merger.close()

print(f'Merged PDF saved to {output_path}')
