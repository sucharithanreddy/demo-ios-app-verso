import sys
try:
    from pypdf import PdfReader
except ImportError:
    from PyPDF2 import PdfReader

reader = PdfReader("/home/z/my-project/upload/Verso Wellbeing Map - Platform Overview.pdf")
print(f"=== TOTAL PAGES: {len(reader.pages)} ===\n")
for i, page in enumerate(reader.pages):
    print(f"\n========== PAGE {i+1} ==========")
    text = page.extract_text()
    print(text)
