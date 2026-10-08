"""Preserve source OOXML layout; strip sample personal data and change font family only."""
import base64, json, pathlib, re, sys, zipfile, io
from lxml import etree as ET
import openpyxl
from openpyxl.utils.cell import get_column_letter, range_boundaries

source=pathlib.Path(sys.argv[1]); root=pathlib.Path(__file__).resolve().parents[1]
w=openpyxl.load_workbook(source)
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
N='{'+ns['m']+'}'
specs={1:('speak1',6,14,16,20),2:('speak2',6,14,16,20),3:('write1',6,13,15,19),4:('write2',6,14,16,20),6:('book1',4,18,20,24),7:('book2',4,18,20,24),8:('observe',4,10,12,16)}
themes=['FFFFFF','000000','E7E6E6','44546A','4472C4','ED7D31','A5A5A5','FFC000','5B9BD5','70AD47','0563C1','954F72']
def color(c,default='000000'):
    if c is None:return '#'+default
    if c.type=='rgb':return '#'+c.rgb[-6:]
    if c.type=='theme':return '#'+themes[c.theme]
    if c.type=='indexed':
        from openpyxl.styles.colors import COLOR_INDEX
        return '#'+(COLOR_INDEX[c.indexed][-6:] if c.indexed<len(COLOR_INDEX) else default)
    return '#'+default
def css(cell):
    f,a,b=cell.font,cell.alignment,cell.border
    out={'fontSize':f.sz or 11,'bold':bool(f.b),'italic':bool(f.i),'color':color(f.color),'fill':color(cell.fill.fgColor,'FFFFFF') if cell.fill.patternType=='solid' else 'transparent','align':a.horizontal or ('right' if cell.data_type=='n' else 'left'),'vertical':a.vertical or 'bottom','rotate':a.textRotation or 0,'wrap':bool(a.wrapText),'borders':{}}
    for side in ['left','right','top','bottom']:
        v=getattr(b,side)
        if v and v.style:out['borders'][side]=[v.style,color(v.color)]
    return out
templates=[]; replacements={}
for si,s in enumerate(w):
    maxr,maxc=s.max_row,s.max_column
    # Source worksheet dimensions sometimes include a style-only extra column.
    print_range=str(s.print_area).split(chr(33))[-1] if s.print_area else None
    bounds=range_boundaries(str(print_range)) if print_range else (1,1,maxc,maxr)
    widths=[]
    for c in range(1,maxc+1):
        dim=next((d for d in s.column_dimensions.values() if d.min<=c<=d.max),None)
        width=(dim.width if dim else s.sheet_format.defaultColWidth or 8.43)
        widths.append(0 if dim and dim.hidden else (width*7+5))
    heights=[(s.row_dimensions[r].height or s.sheet_format.defaultRowHeight or 15)*4/3 for r in range(1,maxr+1)]
    cells=[]; repl={}
    for row in s:
        for c in row:
            if isinstance(c,openpyxl.cell.cell.MergedCell):continue
            value=c.value
            if si==0 and c.row>=4 and c.column in (3,4):value=None;repl[c.coordinate]=None
            if si in specs:
                key,start,total,date,teacher=specs[si]
                if c.column>=start and 3<=c.row<=total:value=None;repl[c.coordinate]=None
                if c.row==teacher and isinstance(value,str):value='{{teacher}}';repl[c.coordinate]=value
                if c.row==date and value is not None:value='{{date}}';repl[c.coordinate]=value
            elif si in [5,9,10]:
                if 4<=c.row<=43 and c.column>=3:value=None;repl[c.coordinate]=None
                if c.row==48 and isinstance(value,str):value='{{teacher}}';repl[c.coordinate]=value
                if c.row==45 and value is not None:value='{{date}}';repl[c.coordinate]=value
            if c.row==1 and isinstance(value,str):
                value=re.sub(r'2026-2027','{{year}}',value)
                value=re.sub(r'[.…]{2,}[ ]*ANADOLU LİSESİ',' {{school}}',value)
                value=re.sub(r'9/(?:ATP|A)\s+SINIFI','{{className}} SINIFI',value)
                if si in [6,7]:value=re.sub(r'(SEÇİLEN KİTABIN ADI:)\s*[.…]+',r'\1 {{'+('book1' if si==6 else 'book2')+'}}',value)
                repl[c.coordinate]=value
            cells.append({'numberFormat':c.number_format,'formula':c.value[1:] if c.data_type=='f' else None,'ref':c.coordinate,'row':c.row,'col':c.column,'value':value if not isinstance(value,str) or not value.startswith('=') else None,'style':css(c)})
    templates.append({'name':s.title,'index':si,'widths':widths,'heights':heights,'cells':cells,'merges':[str(m) for m in s.merged_cells],'bounds':bounds,'orientation':s.page_setup.orientation or 'portrait','scale':s.page_setup.scale or 100,'margins':dict(s.page_margins),'spec':specs.get(si)})
    replacements[si]=repl

with zipfile.ZipFile(source) as z:
    strings=ET.fromstring(z.read('xl/sharedStrings.xml'))
    strings=[''.join(e.itertext()) for e in strings]
    output=io.BytesIO()
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as out:
        for name in z.namelist():
            data=z.read(name)
            if name=='xl/sharedStrings.xml':
                # All cells below are converted to inline strings. No unused personal data.
                data=f'<sst xmlns="{ns["m"]}" count="0" uniqueCount="0"/>'.encode()
            elif re.match(r'xl/worksheets/sheet\d+\.xml$',name):
                si=int(re.search(r'sheet(\d+)',name).group(1))-1
                doc=ET.fromstring(data)
                for c in doc.findall('.//m:sheetData/m:row/m:c',ns):
                    ref=c.get('r');v=c.find('m:v',ns)
                    if c.get('t')=='s' and v is not None:
                        text=strings[int(v.text)];c.remove(v);c.set('t','inlineStr');ET.SubElement(ET.SubElement(c,N+'is'),N+'t').text=text
                    if ref in replacements[si]:
                        value=replacements[si][ref]
                        for child in list(c):c.remove(child)
                        c.attrib.pop('t',None)
                        if value is not None:c.set('t','inlineStr');ET.SubElement(ET.SubElement(c,N+'is'),N+'t').text=str(value)
                    elif c.find('m:f',ns) is not None:
                        v=c.find('m:v',ns)
                        if v is not None:c.remove(v)
                data=ET.tostring(doc,encoding='utf-8',xml_declaration=True)
            elif name=='xl/styles.xml':
                doc=ET.fromstring(data)
                for font in doc.findall('m:fonts/m:font',ns):
                    font.find('m:name',ns).set('val','Arial')
                    scheme=font.find('m:scheme',ns)
                    if scheme is not None:font.remove(scheme)
                data=ET.tostring(doc,encoding='utf-8',xml_declaration=True)
            elif name.startswith('docProps/'):
                # Remove source author identities without touching workbook layout.
                data=re.sub(rb'(<(?:\w+:)?(?:creator|lastModifiedBy|Company)[^>]*>).*?(</[^>]+>)',rb'\1\2',data)
            elif name=='xl/calcChain.xml':continue
            elif name.endswith('.rels') or name=='[Content_Types].xml':
                data=re.sub(rb'<(?:Relationship|Override)\b[^>]*(?:calcChain)[^>]*/>',b'',data)
            out.writestr(name,data)
    binary=base64.b64encode(output.getvalue()).decode()
root.joinpath('template.js').write_text('export const TEMPLATE_XLSX = '+json.dumps(binary)+';\nexport const TEMPLATE_SHEETS = '+json.dumps(templates,ensure_ascii=False,separators=(',',':'))+';\n')
print('Sanitized original template and all 11 sheet layouts saved.')
