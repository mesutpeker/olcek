import { format, isAccepted } from './core.js';
import { reportModels } from './layout.js';
export const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeHTML;
export function reportIssues(state, evaluations) {
  const issues=[]; let grades=0;const numbers=new Set();
  state.students.forEach((s,i)=>{
    if(![s.no,s.name,s.p1,s.p2].some(v=>String(v).trim()))return;
    if(!s.name.trim())issues.push(`${i+1}. satırda öğrenci adı eksik.`);
    if(s.no.trim()){if(numbers.has(s.no.trim()))issues.push(`${s.no} öğrenci numarası birden fazla kullanılmış.`);numbers.add(s.no.trim());}
    evaluations[i].forEach((entry,j)=>{if(entry.incomplete)issues.push(`${s.name||i+1}: ${j+1}. performans için ${entry.incomplete.count} kriter puanı boş.`);else if(entry.error)issues.push(`${s.name||i+1}: ${j+1}. performans notu geçersiz.`);else if(entry.data){grades++;if(!isAccepted(s,entry.data,j+1,state.policy||'rounded'))issues.push(`${s.name}: ${j+1}. performans için ${format(entry.data.target)} girildi, Excel ${format(entry.data.result)} hesaplayacak. Onaylayın veya notu değiştirin.`);}});
  });
  if(!grades)issues.unshift('Rapor almak için en az bir öğrenci adı ve geçerli performans notu girin.');
  return issues;
}
export function activeRecords(state,evaluations){return state.students.map((student,i)=>({student,results:evaluations[i].map(e=>e.data)})).filter(r=>r.student.name.trim());}
const cellPosition=ref=>{const [,letters,row]=ref.match(/^([A-Z]+)(\d+)$/);return [[...letters].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0),Number(row)];};
const borderStyles={thin:'.5px solid',medium:'2px solid',thick:'3px solid',double:'3px double',dashed:'1px dashed',dotted:'1px dotted',hair:'.5px solid'};
export function buildReportHTML(state,evaluations,scope='all'){
  return reportModels(state,evaluations).filter(s=>scope==='all'||(scope==='scales'?Boolean(s.spec):!s.spec)).map(s=>{
    const [left,top,right,bottom]=s.bounds;
    const x=[0],y=[0];s.widths.forEach(w=>x.push(x.at(-1)+w));s.heights.forEach(h=>y.push(y.at(-1)+h));
    const merges=s.merges.map(ref=>{const [a,b]=ref.split(':');return [...cellPosition(a),...cellPosition(b)];});
    const w=x[right]-x[left-1],h=y[bottom]-y[top-1];
    const landscape=s.orientation==='landscape',paperW=landscape?297:210,paperH=landscape?210:297;
    const margin={left:s.margins.left*25.4,right:s.margins.right*25.4,top:s.margins.top*25.4,bottom:s.margins.bottom*25.4};
    const factor=Math.min(s.scale/100,(paperW-margin.left-margin.right)*96/25.4/w,(paperH-margin.top-margin.bottom-1)*96/25.4/h);
    const cells=s.cells.filter(c=>c.col>=left&&c.col<=right&&c.row>=top&&c.row<=bottom).map(c=>{
      const merge=merges.find(([a,b,d,f])=>c.col>=a&&c.col<=d&&c.row>=b&&c.row<=f);
      if(merge&&(c.col!==merge[0]||c.row!==merge[1]))return '';
      const r=merge?.[2]||c.col,b=merge?.[3]||c.row,width=x[r]-x[c.col-1],height=y[b]-y[c.row-1];
      if(!width||!height)return '';
      const a=c.style;
      const style=[`left:${(x[c.col-1]-x[left-1])*factor}px`,`top:${(y[c.row-1]-y[top-1])*factor}px`,`width:${width*factor}px`,`height:${height*factor}px`,`padding:${(c.padding??1)*factor}px`,`font-size:${a.fontSize*4/3*factor}px`,`font-weight:${a.bold?700:400}`,`font-style:${a.italic?'italic':'normal'}`,`color:${a.color}`,`background:${a.fill}`,`text-align:${a.align==='general'?'left':a.align}`,`align-items:${a.vertical==='center'?'center':a.vertical==='top'?'flex-start':'flex-end'}`];
      for(const [side,[type,color]] of Object.entries(a.borders))style.push(`border-${side}:${(borderStyles[type]||'1px solid').replace(/([\d.]+)px/,(_,n)=>`${Number(n)*factor}px`)} ${color}`);
      const value=typeof c.value==='number'?format(c.numberFormat==='0'?Math.round(c.value):c.value):c.value??'';
      const text=String(value).replace(/[ \t]{12,}/g,'\n');
      const rotated=a.rotate===90||a.rotate===180;
      if(!a.wrap&&!rotated)style.push('overflow:visible');
      return `<div class="excel-cell ${rotated?'excel-rotated':''}" style="${style.join(';')}"><span style="white-space:${a.wrap?'pre-wrap':'pre'};${rotated?`width:${(height-4)*factor}px;max-width:none;transform:translate(-50%,-50%) rotate(-90deg);left:50%;top:50%;position:absolute;text-align:${a.vertical==='bottom'?'left':a.vertical==='top'?'right':'center'};`:''}">${e(text)}</span></div>`;
    }).join('');
    return `<section class="report-sheet excel-sheet ${landscape?'excel-landscape':'excel-portrait'}" aria-label="${e(s.name)}" style="width:${paperW}mm;height:${paperH}mm;padding:${margin.top}mm ${margin.right}mm ${margin.bottom}mm ${margin.left}mm"><div class="excel-stage" style="margin:0 auto;width:${w*factor}px;height:${h*factor}px"><div class="excel-canvas" style="width:${w*factor}px;height:${h*factor}px">${cells}</div></div></section>`;
  }).join('');
}
