const slide=document.getElementById('slide'),mask=document.getElementById('mask'),dim=document.getElementById('dim'),enabled=document.getElementById('enabled');
const chart=document.getElementById('spot'),heading=document.getElementById('spot-title');
const handleNames=new Set(['nw','n','ne','e','se','s','sw','w']);
let areas=[],drag=null,selected=chart;
const modified=new Set();
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function initialAreas(){
 const s=slide.getBoundingClientRect(),t=slide.querySelector('h2').getBoundingClientRect();
 const graph=slide.querySelector('.slide-chart');
 const parts=[graph,...graph.querySelectorAll('span')].map(e=>e.getBoundingClientRect());
 const g={left:Math.min(...parts.map(r=>r.left)),top:Math.min(...parts.map(r=>r.top)),right:Math.max(...parts.map(r=>r.right)),bottom:Math.max(...parts.map(r=>r.bottom))};
 const gap=8,pad=12,innerPad=Math.min(pad,Math.max(0,(g.left-t.right-gap)/2));
 function area(element,left,top,right,bottom){left=Math.max(s.left,left);top=Math.max(s.top,top);right=Math.min(s.right,right);bottom=Math.min(s.bottom,bottom);return {element,x:(left-s.left)/s.width,y:(top-s.top)/s.height,w:(right-left)/s.width,h:(bottom-top)/s.height};}
 return [area(chart,g.left-innerPad,g.top-pad,g.right+pad,g.bottom+pad),area(heading,t.left-pad,t.top-pad,t.right+innerPad,t.bottom+pad)];
}
// All movement uses normalized slide coordinates, so layouts survive responsive resizing.
function transformArea(original,mode,dx,dy,width,height){
 if(mode==='move')return {...original,x:clamp(original.x+dx,0,1-original.w),y:clamp(original.y+dy,0,1-original.h)};
 let l=original.x,t=original.y,r=l+original.w,b=t+original.h;
 const minW=Math.min(48/width,original.w),minH=Math.min(48/height,original.h);
 if(mode.includes('w'))l=clamp(l+dx,0,r-minW);
 if(mode.includes('e'))r=clamp(r+dx,l+minW,1);
 if(mode.includes('n'))t=clamp(t+dy,0,b-minH);
 if(mode.includes('s'))b=clamp(b+dy,t+minH,1);
 return {...original,x:l,y:t,w:r-l,h:b-t};
}
function endDrag(){
 const current=drag;drag=null;
 if(current&&current.element.hasPointerCapture(current.id))current.element.releasePointerCapture(current.id);
}
function select(element){selected=element;paint();}
function reset(){endDrag();areas=initialAreas();modified.clear();selected=chart;dim.value=60;enabled.checked=true;paint();}
function paint(){
 for(const a of areas){
  const element=a.element,isSelected=element===selected;
  element.style.left=a.x*100+'%';element.style.top=a.y*100+'%';element.style.width=a.w*100+'%';element.style.height=a.h*100+'%';element.hidden=!enabled.checked;
  element.classList.toggle('is-selected',isSelected);element.setAttribute('aria-pressed',String(isSelected));element.style.zIndex=isSelected?'3':'2';
  const width=a.w*slide.clientWidth,height=a.h*slide.clientHeight;
  element.style.setProperty('--hit-x',Math.min(64,width/2)+'px');element.style.setProperty('--hit-y',Math.min(64,height/2)+'px');
  for(const handle of element.querySelectorAll('.resize-handle')){
   const mode=handle.dataset.handle;
   handle.hidden=(mode==='n'||mode==='s')?width<128:(mode==='e'||mode==='w')?height<128:false;
   if(mode.length===2){const length=Math.min(28,width/3,height/3);for(const path of handle.querySelectorAll('path'))path.setAttribute('d',`M${length} 0H0V${length}`);}
  }
 }
 mask.style.background=`rgba(20,18,16,${enabled.checked?Number(dim.value)/100:0})`;
 // Subtract the union of the holes: overlapping focus areas always remain clear.
 const holes=areas.map(a=>`<rect x="${a.x*1000}" y="${a.y*1000}" width="${a.w*1000}" height="${a.h*1000}" fill="black"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none"><defs><mask id="focus" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000" style="mask-type:luminance"><rect width="1000" height="1000" fill="white"/>${holes}</mask></defs><rect width="1000" height="1000" fill="white" mask="url(#focus)"/></svg>`;
 const image=`url("data:image/svg+xml,${encodeURIComponent(svg)}")`;mask.style.maskImage=image;mask.style.webkitMaskImage=image;mask.style.maskSize='100% 100%';mask.style.webkitMaskSize='100% 100%';mask.style.maskRepeat='no-repeat';mask.style.webkitMaskRepeat='no-repeat';document.getElementById('dim-value').value=dim.value+'%';
}
for(const element of [chart,heading]){
 element.addEventListener('focus',()=>select(element));
 element.addEventListener('pointerdown',e=>{
  if(e.button!==0||drag||!enabled.checked)return;
  const handle=e.target.closest('.resize-handle'),mode=handleNames.has(handle?.dataset.handle)?handle.dataset.handle:'move';
  const a=areas.find(a=>a.element===element),rect=slide.getBoundingClientRect();
  drag={id:e.pointerId,element,mode,px:e.clientX,py:e.clientY,width:rect.width,height:rect.height,original:{...a}};
  select(element);element.focus({preventScroll:true});element.setPointerCapture(e.pointerId);e.preventDefault();
 });
 element.addEventListener('pointermove',e=>{
  if(!drag||drag.element!==element||drag.id!==e.pointerId)return;
  const a=areas.find(a=>a.element===element);
  Object.assign(a,transformArea(drag.original,drag.mode,(e.clientX-drag.px)/drag.width,(e.clientY-drag.py)/drag.height,drag.width,drag.height));
  modified.add(element);paint();e.preventDefault();
 });
 for(const name of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(name,e=>{if(drag?.element===element&&drag.id===e.pointerId)endDrag();});
 element.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||!enabled.checked)return;
  e.preventDefault();select(element);
  const a=areas.find(a=>a.element===element),step=e.shiftKey?.04:.01;
  const dx=e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0,dy=e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0;
  Object.assign(a,transformArea(a,e.altKey?(dx?'e':'s'):'move',dx,dy,slide.clientWidth,slide.clientHeight));modified.add(element);paint();
 });
}
slide.addEventListener('pointerdown',e=>{if(!e.target.closest('.focus-area'))select(null);});
dim.addEventListener('input',paint);enabled.addEventListener('change',()=>{endDrag();paint();});document.getElementById('reset').addEventListener('click',reset);
reset();new ResizeObserver(()=>{endDrag();const initial=initialAreas();for(let i=0;i<areas.length;i++)if(!modified.has(areas[i].element))areas[i]=initial[i];paint();}).observe(slide);
