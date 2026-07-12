#!/usr/bin/env python3
"""
Fix the malformed table-width XML inside a generated .docx file.

The `docx` JS library v9.5.3 emits invalid XML for table widths when using
`WidthType.PERCENTAGE`:
  - `<w:tblW w:type="pct" w:w="100%"/>`    (should be w:w="5000")
  - `<w:tcW  w:type="pct" w:w="50%"/>`     (should be w:w="2500")
  - `<w:gridCol w:w="100"/>`               (100 twips ≈ 0.07" — collapses columns)

OOXML requires that when `w:type="pct"`, the `w:w` value be an integer
expressed in fiftieths of a percent (5000 = 100%, 2500 = 50%, etc.).

Word can't parse the malformed `"100%"` strings, so it falls back to
treating all columns as zero-width and stacks every cell into a single
vertical line. This script post-processes the .docx to fix it.
"""

import re
import shutil
import zipfile
from pathlib import Path

SRC = Path("/home/z/my-project/download/Verso_Developer_Agreement_Optimism_Engine.docx")
DST = Path("/home/z/my-project/download/Verso_Developer_Agreement_Optimism_Engine.docx")
WORK = Path("/home/z/my-project/workspace/agreement_fix")


def pct_to_fiftieths(pct_str: str) -> int:
    """'100' -> 5000, '50' -> 2500, '8' -> 400, etc."""
    return int(round(float(pct_str) * 50))


def fix_document_xml(xml: str) -> str:
    # 1. Fix table-level width: <w:tblW w:type="pct" w:w="100%"/>
    def fix_tblw(m):
        pct = m.group(1)
        return f'<w:tblW w:type="pct" w:w="{pct_to_fiftieths(pct)}"/>'
    xml = re.sub(r'<w:tblW w:type="pct" w:w="(\d+)%"/>', fix_tblw, xml)

    # 2. Fix cell-level width: <w:tcW w:type="pct" w:w="50%"/>
    def fix_tcw(m):
        pct = m.group(1)
        return f'<w:tcW w:type="pct" w:w="{pct_to_fiftieths(pct)}"/>'
    xml = re.sub(r'<w:tcW w:type="pct" w:w="(\d+)%"/>', fix_tcw, xml)

    # 3. Fix grid columns. The original script set every <w:gridCol w:w="100"/>
    #    (100 twips ≈ 0.07"), which collapses every column to near-zero width.
    #    We rebuild each table's tblGrid using the cell percentages from its
    #    first row, then convert those percentages to twips based on a 9000-twip
    #    usable width (A4 with standard margins ≈ 8788 twips).
    USABLE_TWIPS = 9000

    # Walk through each <w:tbl>...</w:tbl> block and rebuild its <w:tblGrid>.
    def rebuild_table(match: re.Match) -> str:
        table_xml = match.group(0)
        # Find the first <w:tr>...</w:tr> row, then collect the <w:tcW> values
        # of its cells — those define the column proportions for the table.
        first_row = re.search(r'<w:tr>.*?</w:tr>', table_xml, re.DOTALL)
        if not first_row:
            return table_xml

        # Collect each cell's width percentage in row order
        cell_pcts = []
        for tcw in re.finditer(
            r'<w:tcW w:type="pct" w:w="(\d+)"/>', first_row.group(0)
        ):
            cell_pcts.append(int(tcw.group(1)))

        if not cell_pcts:
            return table_xml

        total = sum(cell_pcts) or 1
        # Convert each percentage to twips (proportional share of USABLE_TWIPS)
        col_twips = [int(round(p / total * USABLE_TWIPS)) for p in cell_pcts]

        # Build the new <w:tblGrid>...</w:tblGrid>
        new_grid = '<w:tblGrid>' + ''.join(
            f'<w:gridCol w:w="{t}"/>' for t in col_twips
        ) + '</w:tblGrid>'

        # Replace the existing <w:tblGrid>...</w:tblGrid> (if any)
        new_table, n = re.subn(
            r'<w:tblGrid>.*?</w:tblGrid>',
            new_grid,
            table_xml,
            count=1,
            flags=re.DOTALL,
        )
        if n == 0:
            # No grid existed — insert one right after <w:tblPr>...</w:tblPr>
            new_table, n = re.subn(
                r'(</w:tblPr>)',
                r'\1' + new_grid,
                table_xml,
                count=1,
            )
        return new_table

    xml = re.sub(r'<w:tbl>.*?</w:tbl>', rebuild_table, xml, flags=re.DOTALL)
    return xml


def main():
    if WORK.exists():
        shutil.rmtree(WORK)
    WORK.mkdir(parents=True, exist_ok=True)

    # Unzip the source .docx
    with zipfile.ZipFile(SRC, 'r') as zin:
        zin.extractall(WORK)

    doc_xml_path = WORK / 'word' / 'document.xml'
    xml = doc_xml_path.read_text(encoding='utf-8')

    # Sanity check — count the malformed patterns before fixing
    before_pct = len(re.findall(r'w:w="\d+%"', xml))
    before_grid = len(re.findall(r'<w:gridCol w:w="100"/>', xml))
    print(f"Before: {before_pct} malformed pct widths, "
          f"{before_grid} collapsed gridCols")

    fixed = fix_document_xml(xml)

    after_pct = len(re.findall(r'w:w="\d+%"', fixed))
    after_collapsed = len(re.findall(r'<w:gridCol w:w="100"/>', fixed))
    print(f"After:  {after_pct} malformed pct widths, "
          f"{after_collapsed} collapsed gridCols")

    doc_xml_path.write_text(fixed, encoding='utf-8')

    # Re-zip into the destination .docx
    if DST.exists():
        DST.unlink()
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for f in WORK.rglob('*'):
            if f.is_file():
                arcname = f.relative_to(WORK).as_posix()
                zout.write(f, arcname)

    print(f"\nFixed document written to: {DST}")
    print(f"File size: {DST.stat().st_size:,} bytes")


if __name__ == '__main__':
    main()
