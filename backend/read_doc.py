import docx
doc = docx.Document(r'c:\Users\Rome Dominic Rillera\OneDrive\Desktop\DAR-SYSTEM\frontend\src\documents\RESO for SVP.docx')
with open('reso_svp.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join([p.text for p in doc.paragraphs]))
