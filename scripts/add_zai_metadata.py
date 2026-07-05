#!/usr/bin/env python3
import sys
import os
from pypdf import PdfReader, PdfWriter

def add_metadata(input_path, output_path=None, title=None):
    if output_path is None:
        output_path = input_path
    
    if title is None:
        title = os.path.splitext(os.path.basename(input_path))[0]
    
    reader = PdfReader(input_path)
    writer = PdfWriter()
    
    for page in reader.pages:
        writer.add_page(page)
    
    writer.add_metadata({
        '/Title': title,
        '/Author': 'Z.ai',
        '/Subject': 'Technical Support Resume',
        '/Creator': 'Z.ai'
    })
    
    with open(output_path, 'wb') as f:
        writer.write(f)
    
    print(f"Metadata added to: {output_path}")

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('input', help='Input PDF file')
    parser.add_argument('-o', '--output', help='Output PDF file')
    parser.add_argument('-t', '--title', help='Title for metadata')
    args = parser.parse_args()
    
    add_metadata(args.input, args.output, args.title)
