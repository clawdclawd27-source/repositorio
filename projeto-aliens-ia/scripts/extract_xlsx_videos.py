import csv, zipfile, xml.etree.ElementTree as ET
from pathlib import Path

root=Path(__file__).resolve().parents[1]
xlsx=root/'data/raw/Publicações.xlsx'
out=root/'data/processed/videos.csv'
ns={'a':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}

with zipfile.ZipFile(xlsx) as z:
    shared=[]
    if 'xl/sharedStrings.xml' in z.namelist():
        sroot=ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in sroot.findall('a:si',ns):
            shared.append(''.join((t.text or '') for t in si.findall('.//a:t',ns)))

    wb=ET.fromstring(z.read('xl/workbook.xml'))
    rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    relmap={rel.attrib['Id']:rel.attrib['Target'] for rel in rels}

    target=None
    for sh in wb.findall('a:sheets/a:sheet',ns):
        if sh.attrib.get('name','').lower()=='videos':
            rid=sh.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
            target='xl/'+relmap[rid]
            break
    if not target:
        raise SystemExit('Sheet videos não encontrada')

    ws=ET.fromstring(z.read(target))
    rows=[]
    for row in ws.findall('a:sheetData/a:row',ns):
        vals=[]
        for c in row.findall('a:c',ns):
            t=c.attrib.get('t')
            v=c.find('a:v',ns)
            text=''
            if v is not None and v.text is not None:
                text=v.text
                if t=='s' and text.isdigit() and int(text)<len(shared):
                    text=shared[int(text)]
            vals.append(text)
        rows.append(vals)

    if not rows:
        raise SystemExit('Sem linhas')

    header=rows[0]
    data=[r for r in rows[1:] if any((x or '').strip() for x in r)]
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open('w', newline='', encoding='utf-8') as f:
        w=csv.writer(f)
        w.writerow(header)
        w.writerows(data)

print(f'OK: {out} ({len(data)} linhas)')
