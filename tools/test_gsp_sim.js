// Regression test cho mo-phong-gsp: chạy engine mô phỏng trong Node với DOM giả lập.
// Chạy: node tools/test_gsp_sim.js   (yêu cầu PASS ở dòng cuối)
const fs=require('fs');
const path=require('path');
const HTML=path.join(__dirname,'..','选修课','web程序设计','mo-phong-gsp','index.html');
let src=fs.readFileSync(HTML,'utf8');
let js=src.match(/<script>([\s\S]*)<\/script>/)[1];
const els={};
const mk=()=>({textContent:'',style:{},className:'',classList:{toggle(){},add(){},remove(){}},setAttribute(){},addEventListener(){},getContext:()=>({fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},setLineDash(){},fillText(){}}),innerHTML:'',scrollTop:0,scrollHeight:0,checked:false,value:99,parentNode:{parentNode:{style:{}}},onchange:null,oninput:null,onclick:null});
global.document={getElementById:(i)=>els[i]||(els[i]=mk()),querySelector:()=>mk(),querySelectorAll:()=>[],addEventListener(){}};
global.requestAnimationFrame=()=>{};global.performance={now:()=>0};
js += `
;(function(){
let fails=0; const ok=(c,m)=>{console.log((c?'PASS':'FAIL')+' — '+m); if(!c)fails++;};
function startup(useAvr){ reset(); S.local=true; fcrClose();
  if(useAvr){S.avr=true;} else flash();
  for(let g=0; g<900; g++){ S.inc=(S.w*50<49.98); S.dec=(S.w*50>50.02); step(0.01);
    if(g>80 && S.Ug>0.97 && Math.abs(S.w*50-50)<0.03) break; }
  S.inc=S.dec=false; }
function syncClose(){ setLocal(false); if(!S.net)$('hNet').onclick();
  // người vận hành để tay ga ~52% → trượt +0.1Hz cho đèn trôi, rơ-le bắt điểm
  for(let g=0; g<120; g++){ S.inc=(S.pos<0.52); S.dec=(S.pos>0.52); step(0.01); }
  S.inc=S.dec=false;
  for(let g=0; g<1500 && !S.GCB; g++){ step(0.01); if(!S.GCB&&!S.syncPend)closeGCB(); }
  S.inc=S.dec=false; return S.GCB; }
/* T1 sequence chuẩn (manual + flash) */
startup(false);
ok(S.Ug>0.97&&Math.abs(S.w*50-50)<0.05,'build-up & dinh toc: Ug='+S.Ug.toFixed(2)+' f='+(S.w*50).toFixed(2));
ok(!S.buFail,'khong BUILD UP FAILURE');
setLocal(false);
closeGCB(); ok(!S.GCB,'chua NETWORK MODE -> chan');
$('hNet').onclick();
ok(syncClose(),'sync dat -> dong GCB ('+S.log.slice(-1)[0].msg.slice(0,40)+')');
for(let k=0;k<20;k++)step(0.01);
ok(Math.abs(S.P)<0.05,'hoa non tai P='+S.P.toFixed(3));
S.inc=true;for(let k=0;k<300;k++)step(0.01);S.inc=false;
ok(S.P>0.55,'mang tai P='+S.P.toFixed(2)+' Q='+S.Q.toFixed(2));
ok(S.ocT===0&&S.rpT===0&&S.leT===0,'khong bao ve tac dong');
S.dec=true;while(S.pos>0.495)step(0.01);S.dec=false;
openGCB(); ok(!S.GCB,'cat GCB sau khi P~0');
/* T2 mat tu du */
reset(); S.local=true; S.noRem=true; S.If=0;S.Ug=0;
fcrClose(); for(let k=0;k<1600;k++)step(0.01);
ok(S.buFail&&!S.FCB,'mat tu du -> BUILD UP FAILURE + trip FCR');
S.noRem=false; alarmReset(); fcrClose(); flash();
for(let g=0;g<2000;g++){ S.inc=(S.w*50<49.96); step(0.01); if(S.Ug>0.97&&S.w>0.985)break; } S.inc=false;
ok(S.Ug>0.97,'khoi phuc: tu kich + toc dinh muc -> dung ap (Ug='+S.Ug.toFixed(2)+')');
/* T3 AVR */
startup(true);
ok(S.Ug>0.96&&S.Ug<1.02,'AVR giu Ug~Uset ('+S.Ug.toFixed(3)+')');
/* T4 mat kich tu khi dang hoa */
syncClose(); S.inc=true;for(let k=0;k<300;k++)step(0.01);S.inc=false;
ok(S.GCB&&S.P>0.4,'hoa + tai bang AVR (P='+S.P.toFixed(2)+')');
S.fieldLost=true; for(let k=0;k<250;k++)step(0.01);
ok(!S.GCB&&!S.FCB&&S.alarm,'mat kich tu -> QRP cat + de-excite');
/* T5 bypass hoa au */
startup(false);
setLocal(false); S.bypass=true; S.th=2.5;
closeGCB();
ok(S.GCB&&S.shock>1.5,'dong au sinh xung '+S.shock.toFixed(1)+'pu');
for(let k=0;k<300&&!S.alarm;k++)step(0.01);
ok(!S.GCB,'QRP qua dong cat GCB');
/* T6 interlocks */
reset(); setLocal(false); fcrClose(); ok(!S.FCB,'nut cabinet bi khoa khi REMOTE');
startup(true); setLocal(true); fcrOpen(); ok(!S.FCB,'cabinet mo FCR duoc khi GCB ho');
startup(true); ok(syncClose(),'da hoa de test chan'); setLocal(true);
fcrOpen(); ok(S.FCB&&S.GCB,'DE-EXCITATE bi chan khi GCB dang dong');
/* T7 debounce */
reset(); S.local=true; fcrClose();
for(let k=0;k<80;k++)step(0.01); ok(S.dFcb>0.7&&S.dFcb<1,'debounce dem '+S.dFcb.toFixed(2)+'s');
for(let k=0;k<40;k++)step(0.01); ok(S.dFcb>1,'>1s -> DI FCR CLOSED');
/* T8 HMI flash bi khoa khi LOCAL */
reset(); S.local=true; S.FCB=true;
const l0=S.log.length;
$('hFlash').onclick();
ok(S.log.length===l0+1&&/\u0111ang b\u1ecb kh\u00f3a/.test(S.log[l0].msg),'HMI FIELD FLASHING bi khoa khi LOCAL');
console.log(fails?('FAILED '+fails):'ALL GROUPS PASS');
process.exit(fails?1:0);
})();
`;
eval(js);
