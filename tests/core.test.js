import test from 'node:test';
import assert from 'node:assert/strict';
import { RUBRICS } from '../rubrics.js';
import { allocate, calculate, distribute, parseGrade, isAccepted, parseDelimited, studentsFromRows, sum, evaluateStudent, gradeStatus, validScores } from '../core.js';
import { reportIssues, buildReportHTML } from '../reports.js';
import { reportModels, PAGE, nameLines } from '../layout.js';

test('Reference has seven unchanged scales and correct bounds',()=>{
  assert.deepEqual(RUBRICS.map(r=>r.criteria.length),[10,10,9,10,14,14,6]);
  assert.deepEqual(RUBRICS.map(r=>r.max),[100,100,100,100,42,42,18]);
  assert.deepEqual(RUBRICS[2].criteria.at(-1).points,[8,12,16,20]);
});
test('Every valid raw total is allocated using only legal levels',()=>{
  for(const r of RUBRICS)for(let total=r.min;total<=r.max;total+=r.performance===1?2:1){
    const points=allocate(r,total,'test-student');assert.equal(sum(points),total);
    points.forEach((p,i)=>assert.ok(r.criteria[i].points.includes(p)));
  }
});
test('Every integer first performance from 40 to 100 is exact',()=>{
  for(let target=40;target<=100;target++){const d=distribute(target,1,'42');assert.equal(d.result,target);assert.ok(d.exact);assert.deepEqual(calculate(d.scores,1).result,target);}
});
test('Second performance selects globally nearest legal score for all integer targets',()=>{
  const possible=[];
  for(let a=14;a<=42;a++)for(let b=14;b<=42;b++)for(let c=6;c<=18;c++)possible.push(Math.round(a/42*100)*33+Math.round(b/42*100)*33+Math.round(c/18*100)*34);
  for(let target=0;target<=100;target++){
    const d=distribute(target,2,'52');const min=Math.min(...possible.map(c=>Math.abs(c-target*100)));
    assert.equal(Math.abs(Math.round(d.result*100)-target*100),min);assert.equal(calculate(d.scores,2).result,d.result);
  }
});
test('Excel rounds individual contributions and normalized grades, not final second total',()=>{
  const scores=Object.fromEntries(RUBRICS.map(r=>[r.id,r.criteria.map(c=>c.points[1])]));
  assert.equal(calculate(scores,1).result,60);
  assert.equal(calculate(scores,2).result,67);
  const d=distribute(85,2);assert.ok(!d.exact);assert.equal(d.result,84.98);
  assert.equal(isAccepted({},d,2,'exact'),false);assert.equal(isAccepted({accepted2:d.result},d,2,'exact'),true);
  // Excel shows the second performance with number format "0": 84,98 appears as 85.
  assert.equal(isAccepted({},d,2),true);assert.equal(isAccepted({},distribute(30,1),1),false);
  assert.equal(distribute(0,1).result,40);assert.equal(distribute(0,2).result,33);
});
test('Blank, zero, decimal and invalid inputs are distinguished',()=>{
  assert.equal(parseGrade(''),null);assert.equal(parseGrade(' '),null);assert.equal(parseGrade('0'),0);assert.equal(parseGrade('84,84'),84.84);
  for(const v of ['100.01','-1','80x','NaN','Infinity','1e2','84.845'])assert.throws(()=>parseGrade(v));
});
test('Import handles Turkish headers, original blank first column, quotes and decimal comma',()=>{
  const rows=parseDelimited('No;Ad Soyad;1. Performans;2. Performans\n101;"Ada; Örnek";80;84,84');
  assert.equal(studentsFromRows(rows)[0].p2,'84,84');
  const original=[['','Başlık'],['','SIRA NO','ÖĞRENCİ NO','ÖĞRENCİNİN ADI VE SOYADI'],['',1,58,'Örnek'],['',2]];
  assert.equal(studentsFromRows(original)[0].no,'58');
  assert.equal(studentsFromRows(original).length,1);
  assert.throws(()=>studentsFromRows([['1','A'],['1','B']]));
});
test('Unaccepted approximation blocks reports, accepted differences retain target and actual',()=>{
  const d=distribute(85,2);const s={id:'1',name:'<script>x</script>',no:'1',p1:'',p2:'85'};
  const state={students:[s],meta:{},policy:'exact'};const evaluations=[[{data:null,error:null},{data:d,error:null}]];
  assert.ok(reportIssues(state,evaluations).length);assert.equal(reportIssues({...state,policy:'rounded'},evaluations).length,0);s.accepted2=d.result;assert.equal(reportIssues(state,evaluations).length,0);
  const models=reportModels(state,evaluations);assert.equal(models[0].cells.find(c=>c.ref==='L3').value,84.98);
  for(const col of ['D','E','F','G','H']){const cell=models[0].cells.find(c=>c.ref===`${col}3`);assert.equal(cell.value,null);assert.equal(cell.formula,null);}
  const html=buildReportHTML(state,evaluations);assert.ok(!html.includes('<script>'));assert.equal((html.match(/class="report-sheet /g)||[]).length,8);
});
test('Sheets have one column per student, fit the page and split large classes evenly',()=>{
  const at=ref=>{const [,l,r]=ref.match(/^([A-Z]+)(\d+)$/);return [[...l].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0),Number(r)];};
  const expected={1:1,7:1,25:1,26:2,41:2,50:2,51:3};
  for(const count of [1,7,25,26,41,50,51]){
    const students=Array.from({length:count},(_,i)=>({id:String(i),no:String(i+1),name:i%3?`Örnek Öğrenci ${i+1}`:`Ada Nur Demirtaş ${i+1}`,p1:'80',p2:'100'}));
    const evaluations=students.map(s=>[{data:distribute(s.p1,1,s.id)},{data:distribute(s.p2,2,s.id)}]);
    const models=reportModels({students,meta:{}},evaluations),byName=new Map(models.map(m=>[m.name,m]));
    assert.equal(byName.size,models.length);
    for(const model of models){
      assert.ok(model.widths.reduce((a,b)=>a+b,0)<=PAGE.width+1,`${model.name} width`);
      assert.ok(model.heights.reduce((a,b)=>a+b,0)<=PAGE.height+1,`${model.name} height`);
    }
    for(const r of RUBRICS){
      const pages=models.filter(m=>m.rubric===r.id),sizes=pages.map(m=>m.widths.length-m.start+1);
      assert.equal(pages.length,expected[count],`${r.name}: ${count} öğrenci`);
      assert.equal(sizes.reduce((a,b)=>a+b,0),count);
      assert.ok(Math.max(...sizes)-Math.min(...sizes)<=1,'balanced pages');
      for(const m of pages)for(let i=0;i<m.widths.length-m.start+1;i++){
        const name=m.cells.find(c=>c.row===3&&c.col===m.start+i).value;assert.ok(name);
        assert.equal(m.cells.find(c=>c.row===m.totalRow&&c.col===m.start+i).formula?.startsWith('SUM('),true);
      }
    }
    const summaries=models.filter(m=>!m.spec);
    assert.equal(summaries.reduce((a,m)=>a+m.cells.filter(c=>c.col===2&&c.row>=3&&c.value).length,0),count);
    // Every summary formula points at the total cell of the same student on the right page.
    for(const m of summaries)for(const cell of m.cells.filter(c=>c.formula&&c.formula.includes('!'))){
      const [,sheet,target]=cell.formula.match(/'([^']+)'!([A-Z]+\d+)/);const scale=byName.get(sheet);assert.ok(scale,sheet);
      const [col,row]=at(target);assert.equal(row,scale.totalRow);
      const student=m.cells.find(c=>c.row===cell.row&&c.col===3).value,header=scale.cells.find(c=>c.row===3&&c.col===col).value;
      assert.equal(header.replace(/\n/g," "),student.replace(/\n/g," "));
    }
  }
  assert.deepEqual(nameLines('Ali Veli'),['Ali Veli']);
  assert.equal(nameLines('Ada Nur Demirtaş').length,2);
  assert.equal(nameLines('Muhammed Mustafa Abdullah Karadenizlioğlu').join(' '),'Muhammed Mustafa Abdullah Karadenizlioğlu');
});
test('Manual criterion scores are scored like the source sheets and validated',()=>{
  const manual=Object.fromEntries(RUBRICS.filter(r=>r.performance===2).map(r=>[r.id,r.criteria.map(()=>2)]));
  manual.observe=[3,3,3,3,3,3];
  const [,e2]=evaluateStudent({id:'m',p1:'',p2:'',manual2:manual});
  // book: 28/42 -> 67, observe: 18/18 -> 100; 67*.33+67*.33+100*.34 = 78.22
  assert.equal(e2.data.result,78.22);assert.ok(e2.data.manual);
  assert.equal(gradeStatus({},e2,2).kind,'manual');
  assert.equal(validScores({...manual,observe:[3,3,3,3,3,4]},2),false);
  assert.equal(validScores({...manual,observe:[3,3,3]},2),false);
  const [e1]=evaluateStudent({id:'x',p1:'30',p2:''});
  assert.equal(gradeStatus({},e1,1).kind,'pending');assert.ok(gradeStatus({},e1,1).belowMin);
  assert.equal(gradeStatus({},evaluateStudent({id:'y',p1:'',p2:'85'})[1],2).kind,'rounded');
});

test('Workbook models never contain overlapping merged cells (Excel refuses to open them)',()=>{
  const students=Array.from({length:3},(_,i)=>({id:String(i),no:String(i+1),name:`Örnek ${i+1}`,p1:'80',p2:'90'}));
  const evaluations=students.map(s=>[{data:distribute(s.p1,1,s.id)},{data:distribute(s.p2,2,s.id)}]);
  const at=ref=>{const [,l,r]=ref.match(/^([A-Z]+)(\d+)$/);return [[...l].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0),Number(r)];};
  for(const model of reportModels({students,meta:{}},evaluations)){
    const boxes=model.merges.map(m=>{const [a,b]=m.split(':').map(at);return [...a,...b];});
    boxes.forEach((a,i)=>boxes.slice(i+1).forEach(b=>assert.ok(a[2]<b[0]||b[2]<a[0]||a[3]<b[1]||b[3]<a[1],`${model.name}: ${model.merges[i]}`)));
  }
});
test('e-Okul copy and partial criterion entry',async()=>{
  const { parseEokul, criterionValue, emptyScores } = await import('../core.js');
  const t='41\tÖRNEK BİR ÖĞRENCİ\t\n100\t\t\t\t\t\t\t\t100\tÖğrenci Not Bilgisi\n346\tÖRNEK İKİ\t\n\t \tÖğrenci Not Bilgisi\n1651\tÖRNEK ÜÇ ÖĞRENCİ\t\n100';
  const parsed=parseEokul(t);
  assert.deepEqual(parsed.students.map(s=>[s.no,s.name,s.grades[0]||'']),[['41','ÖRNEK BİR ÖĞRENCİ','100'],['346','ÖRNEK İKİ',''],['1651','ÖRNEK ÜÇ ÖĞRENCİ','100']]);
  assert.equal(parsed.students[0].grades[8],'100');
  assert.throws(()=>parseEokul('41\tA\n41\tB'));
  const r=RUBRICS[2];
  assert.deepEqual(criterionValue(r,8,'16'),{value:16});assert.ok(criterionValue(r,8,'10').error);assert.ok(criterionValue(r,0,'5').error);
  const manual=emptyScores(1);manual.speak1[0]=8;
  const [e1]=evaluateStudent({id:'z',p1:'',p2:'',manual1:manual});
  assert.equal(e1.data,null);assert.equal(e1.incomplete.count,38);assert.equal(gradeStatus({},e1,1).kind,'incomplete');
  const state={students:[{id:'z',no:'1',name:'A',p1:'',p2:'',manual1:manual}],meta:{}};
  assert.ok(reportIssues(state,[[e1,{data:null,error:null}]]).some(t=>t.includes('boş')));
});
test('Shared points move to level headers; differing points stay in the cell',()=>{
  const students=[{id:'a',no:'1',name:'Ali Veli',p1:'80',p2:'90'}];
  const evaluations=students.map(s=>[{data:distribute(s.p1,1,s.id)},{data:distribute(s.p2,2,s.id)}]);
  const write1=reportModels({students,meta:{}},evaluations).find(m=>m.rubric==='write1');
  assert.equal(write1.cells.find(c=>c.ref==='B3').value,'Başlangıç Düzeyinde');
  assert.match(write1.cells.find(c=>c.ref==='B12').value,/\(8 puan\)$/);
  const speak1=reportModels({students,meta:{}},evaluations).find(m=>m.rubric==='speak1');
  assert.equal(speak1.cells.find(c=>c.ref==='B3').value,'Başlangıç Düzeyinde\n(4 puan)');
  assert.doesNotMatch(speak1.cells.find(c=>c.ref==='B4').value,/puan\)?$/);
});
