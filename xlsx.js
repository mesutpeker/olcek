import { studentsFromRows, validScores, validShape, calculate, format, rubricsFor } from './core.js';
import { DEFAULT_LEVEL } from './levels.js';
import { TEMPLATE_XLSX } from './template.js';
import { reportModels, columnName } from './layout.js';
export const colName=columnName;
const NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
// Column widths are counted in digits of the workbook's default font (Arial 11: 8 px).
const MAX_DIGIT_WIDTH=8;
const REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const parse=text=>new DOMParser().parseFromString(text,'application/xml');
const serialize=doc=>new XMLSerializer().serializeToString(doc);
function reportLayout(doc,model){
  const oldNodes=new Map([...doc.getElementsByTagNameNS(NS,'c')].map(c=>[c.getAttribute('r'),c]));
  const data=doc.getElementsByTagNameNS(NS,'sheetData')[0];data.replaceChildren();
  model.heights.forEach((height,i)=>{
    const row=doc.createElementNS(NS,'row');row.setAttribute('r',i+1);if(!model.autoRows?.includes(i+1)){row.setAttribute('ht',height*3/4);row.setAttribute('customHeight','1');}
    for(const cell of model.cells.filter(c=>c.row===i+1)){
      const node=((model.fresh?null:oldNodes.get(cell.sourceRef||cell.ref))||doc.createElementNS(NS,'c')).cloneNode(true);node.setAttribute('r',cell.ref);row.appendChild(node);
    }
    data.appendChild(row);
  });
  const cols=doc.getElementsByTagNameNS(NS,'cols')[0];cols.replaceChildren();
  model.widths.forEach((width,i)=>{const col=doc.createElementNS(NS,'col');col.setAttribute('min',i+1);col.setAttribute('max',i+1);col.setAttribute('width',Math.max(0,(width-5)/MAX_DIGIT_WIDTH));if(!width)col.setAttribute('hidden','1');col.setAttribute('customWidth','1');cols.appendChild(col);});
  const merges=doc.getElementsByTagNameNS(NS,'mergeCells')[0];merges.replaceChildren();merges.setAttribute('count',model.merges.length);
  for(const ref of model.merges){const merge=doc.createElementNS(NS,'mergeCell');merge.setAttribute('ref',ref);merges.appendChild(merge);}
  doc.getElementsByTagNameNS(NS,'dimension')[0].setAttribute('ref',`A1:${columnName(model.widths.length-1)}${model.heights.length}`);
  const setup=doc.getElementsByTagNameNS(NS,'pageSetup')[0];setup.setAttribute('paperSize','9');setup.setAttribute('orientation','landscape');setup.setAttribute('fitToWidth','1');setup.setAttribute('fitToHeight','1');setup.removeAttribute('scale');
  let properties=doc.getElementsByTagNameNS(NS,'sheetPr')[0];
  if(!properties){properties=doc.createElementNS(NS,'sheetPr');doc.documentElement.insertBefore(properties,doc.documentElement.firstChild);}
  let fit=properties.getElementsByTagNameNS(NS,'pageSetUpPr')[0];if(!fit){fit=doc.createElementNS(NS,'pageSetUpPr');properties.appendChild(fit);}fit.setAttribute('fitToPage','1');
  const margins=doc.getElementsByTagNameNS(NS,'pageMargins')[0];for(const [key,value] of Object.entries(model.margins))margins.setAttribute(key,value);
  let print=doc.getElementsByTagNameNS(NS,'printOptions')[0];if(!print){print=doc.createElementNS(NS,'printOptions');doc.documentElement.insertBefore(print,margins);}print.setAttribute('horizontalCentered','1');print.setAttribute('verticalCentered','0');
  for(const tag of ['rowBreaks','colBreaks'])for(const node of [...doc.getElementsByTagNameNS(NS,tag)])node.remove();
}
// Safeguards for teachers who edit the downloaded workbook: only the legal levels
// can be typed into criterion cells, and formula cells are locked (no password).
function guardSheet(doc,model){
  const root=doc.documentElement,child=name=>doc.getElementsByTagNameNS(NS,name)[0];
  for(const tag of ['sheetProtection','dataValidations'])for(const node of [...doc.getElementsByTagNameNS(NS,tag)])node.remove();
  const protection=doc.createElementNS(NS,'sheetProtection');
  for(const [k,v] of Object.entries({sheet:1,objects:1,scenarios:1,formatCells:0,formatColumns:0,formatRows:0}))protection.setAttribute(k,v);
  (child('sheetCalcPr')||child('sheetData')).after(protection);
  if(!model.validations?.length)return;
  const list=doc.createElementNS(NS,'dataValidations');list.setAttribute('count',model.validations.length);
  for(const rule of model.validations){
    // Fixed levels become a drop-down list; a range of points accepts any whole number in it.
    const range=rule.points===undefined,v=doc.createElementNS(NS,'dataValidation');
    const kind=range?{type:'whole',operator:'between'}:{type:'list'};
    const error=range?`Bu kriter için yalnızca ${rule.min}–${rule.max} arası tam sayı girilebilir.`:`Bu kriter için yalnızca ${rule.points.replaceAll(',',', ')} girilebilir.`;
    for(const [k,value] of Object.entries({...kind,allowBlank:1,showInputMessage:1,showErrorMessage:1,errorStyle:'stop',errorTitle:'Geçersiz puan',error,sqref:rule.sqref}))v.setAttribute(k,value);
    const formulas=range?[rule.min,rule.max]:[`"${rule.points}"`];
    formulas.forEach((text,i)=>{const f=doc.createElementNS(NS,`formula${i+1}`);f.textContent=text;v.appendChild(f);});
    list.appendChild(v);
  }
  const before=['hyperlinks','printOptions','pageMargins','pageSetup','headerFooter'].map(child).find(Boolean);
  root.insertBefore(list,before||null);
}
function reportStyles(doc){
  const fonts=doc.getElementsByTagNameNS(NS,'fonts')[0],borders=doc.getElementsByTagNameNS(NS,'borders')[0],fills=doc.getElementsByTagNameNS(NS,'fills')[0],xfs=doc.getElementsByTagNameNS(NS,'cellXfs')[0];
  const cache=new Map(),fontCache=new Map(),borderCache=new Map(),fillCache=new Map();
  const setting=(node,name,value)=>{let n=node.getElementsByTagNameNS(NS,name)[0];if(!n){n=doc.createElementNS(NS,name);node.appendChild(n);}n.setAttribute('val',value);};
  return (id,style,unlocked=false)=>{
    const key=JSON.stringify([id,style,unlocked]);if(cache.has(key))return cache.get(key);
    const xf=xfs.children[Number(id)].cloneNode(true),fontId=xf.getAttribute('fontId');
    const fk=JSON.stringify([fontId,style.fontSize,style.bold]);
    if(!fontCache.has(fk)){
      const font=fonts.children[Number(fontId)].cloneNode(true);setting(font,'name','Arial');setting(font,'sz',style.fontSize);setting(font,'b',style.bold?'1':'0');
      fontCache.set(fk,fonts.children.length);fonts.appendChild(font);fonts.setAttribute('count',fonts.children.length);
    }
    xf.setAttribute('fontId',fontCache.get(fk));xf.setAttribute('applyFont','1');
    const bk=JSON.stringify(style.borders);
    if(!borderCache.has(bk)){
      const border=doc.createElementNS(NS,'border');
      for(const side of ['left','right','top','bottom','diagonal']){
        const node=doc.createElementNS(NS,side);if(style.borders[side]){const [type,color]=style.borders[side];node.setAttribute('style',type);const c=doc.createElementNS(NS,'color');c.setAttribute('rgb','FF'+color.slice(1));node.appendChild(c);}border.appendChild(node);
      }
      borderCache.set(bk,borders.children.length);borders.appendChild(border);borders.setAttribute('count',borders.children.length);
    }
    xf.setAttribute('borderId',borderCache.get(bk));xf.setAttribute('applyBorder','1');
    if(style.fill&&style.fill!=='transparent'){
      if(!fillCache.has(style.fill)){
        const f=doc.createElementNS(NS,'fill'),pattern=doc.createElementNS(NS,'patternFill'),fg=doc.createElementNS(NS,'fgColor'),bg=doc.createElementNS(NS,'bgColor');
        pattern.setAttribute('patternType','solid');fg.setAttribute('rgb','FF'+style.fill.slice(1));bg.setAttribute('indexed','64');pattern.append(fg,bg);f.appendChild(pattern);
        fillCache.set(style.fill,fills.children.length);fills.appendChild(f);fills.setAttribute('count',fills.children.length);
      }
      xf.setAttribute('fillId',fillCache.get(style.fill));xf.setAttribute('applyFill','1');
    }else if(style.fresh){xf.setAttribute('fillId','0');}
    if(style.numFmt!==undefined){xf.setAttribute('numFmtId',style.numFmt);xf.setAttribute('applyNumberFormat','1');}
    for(const node of [...xf.getElementsByTagNameNS(NS,'protection')])node.remove();
    let alignment=xf.getElementsByTagNameNS(NS,'alignment')[0];if(!alignment){alignment=doc.createElementNS(NS,'alignment');xf.appendChild(alignment);}
    alignment.setAttribute('vertical',style.vertical);alignment.setAttribute('horizontal',style.align);alignment.setAttribute('wrapText',style.wrap?'1':'0');alignment.setAttribute('textRotation',style.rotate);if(style.shrink)alignment.setAttribute('shrinkToFit','1');else alignment.removeAttribute('shrinkToFit');xf.setAttribute('applyAlignment','1');
    // Score and roster cells stay editable when the sheet is protected.
    if(unlocked){const protection=doc.createElementNS(NS,'protection');protection.setAttribute('locked','0');alignment.after(protection);}
    xf.setAttribute('applyProtection','1');
    const next=xfs.children.length;xfs.appendChild(xf);xfs.setAttribute('count',xfs.children.length);cache.set(key,next);return next;
  };
}
export async function createWorkbook(state,evaluations){
  const zip=await window.JSZip.loadAsync(TEMPLATE_XLSX,{base64:true});
  const models=reportModels(state,evaluations,{target:'excel'});
  const styles=parse(await zip.file('xl/styles.xml').async('string'));
  const styleFor=reportStyles(styles);
  const originals=await Promise.all(Array.from({length:11},(_,i)=>zip.file(`xl/worksheets/sheet${i+1}.xml`).async('string')));
  const sheetRels=await Promise.all(Array.from({length:11},(_,i)=>zip.file(`xl/worksheets/_rels/sheet${i+1}.xml.rels`)?.async('string')));
  for(const path of Object.keys(zip.files))if(/^xl\/worksheets\/(sheet\d+\.xml|_rels\/sheet\d+\.xml.rels)$/.test(path))zip.remove(path);
  for(let i=0;i<models.length;i++){
    const model=models[i],doc=parse(originals[model.index]);
    reportLayout(doc,model);
    const nodes=new Map([...doc.getElementsByTagNameNS(NS,'c')].map(c=>[c.getAttribute('r'),c]));
    for(const cell of model.cells){
      const node=nodes.get(cell.ref);if(!node)continue;
      node.setAttribute('s',styleFor(node.getAttribute('s')||'0',model.fresh?{...cell.style,fresh:true,numFmt:cell.numberFormat==='0'?1:0}:cell.style,Boolean(cell.unlocked)));
      while(node.firstChild)node.removeChild(node.firstChild);node.removeAttribute('t');
      const append=(name,text)=>{const child=doc.createElementNS(NS,name);child.textContent=String(text);node.appendChild(child);return child;};
      if(cell.value===null||cell.value===undefined)continue;
      if(cell.formula){append('f',cell.formula);if(typeof cell.value==='string')node.setAttribute('t','str');append('v',cell.value);}
      else if(typeof cell.value==='number')append('v',cell.value);
      else{node.setAttribute('t','inlineStr');const text=doc.createElementNS(NS,'t');text.setAttributeNS('http://www.w3.org/XML/1998/namespace','xml:space','preserve');text.textContent=cell.value;const is=doc.createElementNS(NS,'is');is.appendChild(text);node.appendChild(is);}
    }
    guardSheet(doc,model);
    zip.file(`xl/worksheets/sheet${i+1}.xml`,serialize(doc));
    if(sheetRels[model.index])zip.file(`xl/worksheets/_rels/sheet${i+1}.xml.rels`,sheetRels[model.index]);
  }
  const workbook=parse(await zip.file('xl/workbook.xml').async('string'));
  const sheets=workbook.getElementsByTagNameNS(NS,'sheets')[0];
  const oldNames=[...sheets.children].map(s=>s.getAttribute('name'));
  sheets.replaceChildren();
  const rels=parse(await zip.file('xl/_rels/workbook.xml.rels').async('string'));
  [...rels.documentElement.children].filter(r=>r.getAttribute('Type')?.endsWith('/worksheet')).forEach(r=>r.remove());
  const types=parse(await zip.file('[Content_Types].xml').async('string'));
  [...types.documentElement.children].filter(r=>/^\/xl\/worksheets\/sheet\d+\.xml$/.test(r.getAttribute('PartName')||'')).forEach(r=>r.remove());
  models.forEach((model,i)=>{
    const sheet=workbook.createElementNS(NS,'sheet');sheet.setAttribute('name',model.name);sheet.setAttribute('sheetId',i+1);sheet.setAttributeNS(REL,'r:id',`templateSheet${i+1}`);sheets.appendChild(sheet);
    const rel=rels.createElementNS(rels.documentElement.namespaceURI,'Relationship');rel.setAttribute('Id',`templateSheet${i+1}`);rel.setAttribute('Type',REL+'/worksheet');rel.setAttribute('Target',`worksheets/sheet${i+1}.xml`);rels.documentElement.appendChild(rel);
    const type=types.createElementNS(types.documentElement.namespaceURI,'Override');type.setAttribute('PartName',`/xl/worksheets/sheet${i+1}.xml`);type.setAttribute('ContentType','application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml');types.documentElement.appendChild(type);
  });
  // Recalculate every formula when the file is opened.
  let calc=workbook.getElementsByTagNameNS(NS,'calcPr')[0];
  if(!calc){calc=workbook.createElementNS(NS,'calcPr');const after=workbook.getElementsByTagNameNS(NS,'definedNames')[0]||sheets;after.after(calc);}
  calc.setAttribute('fullCalcOnLoad','1');
  const defined=workbook.getElementsByTagNameNS(NS,'definedNames')[0];
  if(defined){
    const originals=[...defined.children].map(n=>n.cloneNode(true));defined.replaceChildren();
    models.forEach((model,i)=>{
      for(const original of originals.filter(n=>n.hasAttribute('localSheetId')&&Number(n.getAttribute('localSheetId'))===model.index)){
        const n=original.cloneNode(true);n.setAttribute('localSheetId',i);
        n.textContent=n.getAttribute('name')==='_xlnm.Print_Area'?`'${model.name}'!$${columnName(model.bounds[0]-1)}$1:$${columnName(model.bounds[2]-1)}$${model.bounds[3]}`:n.textContent.replaceAll(`'${oldNames[model.index]}'!`,`'${model.name}'!`);
        defined.appendChild(n);
      }
    });
  }
  // Keep input grades as document metadata, without adding visible output columns.
  const properties=parse('<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"/>');
  const property=properties.createElementNS(properties.documentElement.namespaceURI,'property');property.setAttribute('fmtid','{D5CDD505-2E9C-101B-9397-08002B2CF9AE}');property.setAttribute('pid','2');property.setAttribute('name','OlcekInputs');
  const value=properties.createElementNS('http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes','vt:lpwstr');value.textContent=JSON.stringify(state.students.filter(s=>s.name.trim()).map(s=>[s.no,s.name,s.p1,s.p2]));property.appendChild(value);properties.documentElement.appendChild(property);
  // Criterion scores typed by the teacher, so the workbook can be imported again without loss.
  const scores=properties.createElementNS(properties.documentElement.namespaceURI,'property');scores.setAttribute('fmtid','{D5CDD505-2E9C-101B-9397-08002B2CF9AE}');scores.setAttribute('pid','3');scores.setAttribute('name','OlcekScores');
  const scoreValue=properties.createElementNS('http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes','vt:lpwstr');scoreValue.textContent=JSON.stringify(state.students.filter(s=>s.name.trim()).map(s=>[s.manual1||null,s.manual2||null]));scores.appendChild(scoreValue);properties.documentElement.appendChild(scores);zip.file('docProps/custom.xml',serialize(properties));
  const rootRels=parse(await zip.file('_rels/.rels').async('string'));const customRel=rootRels.createElementNS(rootRels.documentElement.namespaceURI,'Relationship');customRel.setAttribute('Id','olcekInputs');customRel.setAttribute('Type',REL+'/custom-properties');customRel.setAttribute('Target','docProps/custom.xml');rootRels.documentElement.appendChild(customRel);zip.file('_rels/.rels',serialize(rootRels));
  const customType=types.createElementNS(types.documentElement.namespaceURI,'Override');customType.setAttribute('PartName','/docProps/custom.xml');customType.setAttribute('ContentType','application/vnd.openxmlformats-officedocument.custom-properties+xml');types.documentElement.appendChild(customType);
  zip.file('xl/workbook.xml',serialize(workbook));zip.file('xl/_rels/workbook.xml.rels',serialize(rels));zip.file('[Content_Types].xml',serialize(types));
  // Optional source tab inventory is stale after the report sheets are combined.
  if(zip.file('docProps/app.xml')){
    const app=parse(await zip.file('docProps/app.xml').async('string'));
    for(const tag of ['HeadingPairs','TitlesOfParts'])for(const node of [...app.getElementsByTagNameNS('*',tag)])node.remove();
    zip.file('docProps/app.xml',serialize(app));
  }
  zip.file('xl/styles.xml',serialize(styles));
  return zip.generateAsync({type:'blob',compression:'DEFLATE',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
// Source workbook layout: sheet and first student column of each scale (9th grade
// here; the other grades keep theirs with the scale).
const SCORE_SHEETS={speak1:['1. Tema Konuşma',6],speak2:['2. Tema Konuşma',6],write1:['1. Tema Yazma',6],write2:['2. Tema Yazma',6],book1:['1. Tema Kitap Okuma',4],book2:['2. Tema Kitap Okuma',4],observe:['Ders İçi Gözlem',4]};
const scoreSheet=r=>r.source?[r.source.sheet,r.source.col]:SCORE_SHEETS[r.id];
const sameName=(a,b)=>String(a).trim().toLocaleLowerCase('tr-TR')===String(b).trim().toLocaleLowerCase('tr-TR');
const position=ref=>{const m=ref?.match(/^([A-Z]+)(\d+)$/);return m?[[...m[1]].reduce((n,l)=>n*26+l.charCodeAt(0)-64,0),Number(m[2])]:null;};
export async function importWorkbook(file,{withScores=false,level=DEFAULT_LEVEL}={}){
  if(file.size>10*1024*1024)throw new Error('Excel dosyası 10 MB sınırını aşıyor.');
  const zip=await window.JSZip.loadAsync(file);
  const read=async path=>{const entry=zip.file(path);if(!entry)throw new Error('Excel dosyasının yapısı okunamadı.');const text=await entry.async('string');if(text.length>15e6)throw new Error('Excel çalışma sayfası çok büyük.');const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw new Error('Excel XML içeriği geçersiz.');return doc;};
  if(zip.file('docProps/custom.xml')){const props=await read('docProps/custom.xml');const input=[...props.getElementsByTagNameNS('*','property')].find(p=>p.getAttribute('name')==='OlcekInputs');if(input){
    const rows=JSON.parse(input.textContent);if(!Array.isArray(rows)||rows.some(r=>!Array.isArray(r)))throw new Error('Excel giriş bilgileri okunamadı.');
    const list=studentsFromRows(rows),saved=[...props.getElementsByTagNameNS('*','property')].find(p=>p.getAttribute('name')==='OlcekScores');
    const manual=saved?JSON.parse(saved.textContent):[];
    if(Array.isArray(manual)&&manual.length===list.length)list.forEach((s,i)=>{for(const p of [1,2])if(validShape(manual[i]?.[p-1],p,level))s[`manual${p}`]=manual[i][p-1];});
    return list;
  }}
  const texts=el=>[...el.getElementsByTagName('t')].map(n=>n.textContent).join('');
  const strings=zip.file('xl/sharedStrings.xml')?[...(await read('xl/sharedStrings.xml')).getElementsByTagName('si')].map(texts):[];
  const workbook=await read('xl/workbook.xml'),rels=await read('xl/_rels/workbook.xml.rels');
  const sheets=[...workbook.getElementsByTagName('sheet')];
  const sheetCells=async sheet=>{
    const relation=[...rels.getElementsByTagName('Relationship')].find(r=>r.getAttribute('Id')===sheet.getAttribute('r:id'));
    const target=relation?.getAttribute('Target')||'';
    const doc=await read(target.startsWith('/')?target.slice(1):'xl/'+target.replace(/^\.\//,''));
    const cells=new Map();
    for(const c of doc.getElementsByTagName('c')){
      const at=position(c.getAttribute('r'));if(!at||at[0]>101)continue;
      const value=c.getElementsByTagName('v')[0]?.textContent||'';
      cells.set(`${at[0]},${at[1]}`,c.getAttribute('t')==='s'?(strings[Number(value)]||''):c.getAttribute('t')==='inlineStr'?texts(c):value);
    }
    return cells;
  };
  const chosen=sheets.find(s=>s.getAttribute('name')==='Öğrenci Bilgileri')||sheets[0];
  if(!chosen)throw new Error('Excel dosyasında sayfa bulunamadı.');
  const cells=await sheetCells(chosen);
  const maxRow=Math.max(0,...[...cells.keys()].map(k=>Number(k.split(',')[1])));
  const rows=Array.from({length:maxRow},(_,r)=>Array.from({length:101},(_,c)=>cells.get(`${c+1},${r+1}`)));
  const students=studentsFromRows(rows.map(r=>{const last=r.findLastIndex(v=>v!==undefined);return r.slice(0,last+1);}));
  if(!withScores||chosen.getAttribute('name')!=='Öğrenci Bilgileri')return students;
  // Student n in the roster (row 4+n) is column start+n on every scale sheet.
  const rosterRows=rows.map((r,i)=>({name:String(r[3]??'').trim(),row:i+1})).filter(r=>r.row>=4&&r.name);
  const scale={};
  for(const r of [...rubricsFor(1,level),...rubricsFor(2,level)]){const sheet=sheets.find(s=>sameName(s.getAttribute('name'),scoreSheet(r)[0]));if(sheet)scale[r.id]=await sheetCells(sheet);}
  return students.map(student=>{
    const roster=rosterRows.find(r=>r.name===student.name);if(!roster)return student;
    const offset=roster.row-4,result={...student};
    for(const p of [1,2]){
      const scores={};
      for(const r of rubricsFor(p,level)){
        const col=scoreSheet(r)[1]+offset,sheet=scale[r.id];
        scores[r.id]=r.criteria.map(c=>sheet?Number(sheet.get(`${col},${c.sourceRow}`)):NaN);
      }
      if(validScores(scores,p,level)){result[`manual${p}`]=scores;result[`p${p}`]=format(calculate(scores,p,level).result);}
    }
    return result;
  });
}
