const fs=require('fs'),vm=require('vm'),assert=require('assert');
function rect(l,t,r,b){return {left:l,top:t,right:r,bottom:b,width:r-l,height:b-t};}
class Element{
 constructor(id){this.id=id;this.handlers={};this.style={setProperty:(k,v)=>{this.style[k]=v}};this.attrs={};this.classes=new Set();this.classList={toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.capture=new Set();this.paths=[];}
 addEventListener(n,f){(this.handlers[n]??=[]).push(f)}
 fire(n,e={}){e.target??=this;e.button??=0;e.pointerId??=1;e.preventDefault??=()=>{};for(const f of this.handlers[n]??[])f(e)}
 setAttribute(k,v){this.attrs[k]=v}
 setPointerCapture(id){this.capture.add(id)}hasPointerCapture(id){return this.capture.has(id)}releasePointerCapture(id){this.capture.delete(id)}focus(){this.fire('focus')}
 closest(s){return s==='.focus-area'&&this.area?this:s==='.resize-handle'&&this.dataset?this:this.parent?.closest(s)??null}
 querySelectorAll(s){return s==='.resize-handle'?this.handles??[]:s==='path'?this.paths:[]}
}
let callback;
const ids=Object.fromEntries(['slide','mask','dim','enabled','spot','spot-title','dim-value','reset'].map(id=>[id,new Element(id)]));
const slide=ids.slide;slide.clientWidth=1000;slide.clientHeight=520;slide.getBoundingClientRect=()=>rect(0,0,slide.clientWidth,slide.clientHeight);
const title={getBoundingClientRect:()=>rect(60,90,480,180)},graph={getBoundingClientRect:()=>rect(540,130,940,420),querySelectorAll:()=>[{getBoundingClientRect:()=>rect(540,420,940,450)}]};
slide.querySelector=s=>s==='h2'?title:graph;
for(const el of [ids.spot,ids['spot-title']]){el.area=true;el.handles=['nw','n','ne','e','se','s','sw','w'].map(mode=>{const h=new Element(mode);h.dataset={handle:mode};h.parent=el;if(mode.length===2)h.paths=[new Element('path'),new Element('path')];return h})}
const context={document:{getElementById:id=>ids[id]},ResizeObserver:class{constructor(cb){callback=cb}observe(){}},console};vm.createContext(context);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../site/demo.js'),'utf8'),context);
const inspect=()=>JSON.parse(vm.runInContext('JSON.stringify(areas.map(({x,y,w,h})=>({x,y,w,h})))',context));const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let [a,b]=inspect();assert(a.x<=.54&&a.x+a.w>=.94&&a.y+a.h>=450/520);assert(b.x+b.w<a.x);assert(ids.spot.classes.has('is-selected'));assert(!ids['spot-title'].classes.has('is-selected'));console.log('PASS initial graph/labels covered; no overlap; only selected frame visible');
function drag(el,mode,dx,dy,id=1){const target=mode==='move'?el:el.handles.find(h=>h.dataset.handle===mode);el.fire('pointerdown',{target,pointerId:id,clientX:500,clientY:300});el.fire('pointermove',{pointerId:id,clientX:500+dx,clientY:300+dy});el.fire('pointerup',{pointerId:id});assert(!el.capture.has(id));}
for(const mode of ['nw','n','ne','e','se','s','sw','w']){
 ids.reset.fire('click');const original=inspect()[0];drag(ids.spot,mode,mode.includes('w')?-20:20,mode.includes('n')?-15:15);const result=inspect()[0];
 if(mode.includes('w')){near(result.x,original.x-.02);near(result.x+result.w,original.x+original.w)}else near(result.x,original.x);
 if(mode.includes('e'))near(result.w,original.w+.02);
 if(mode.includes('n')){near(result.y,original.y-15/520);near(result.y+result.h,original.y+original.h)}else near(result.y,original.y);
 if(mode.includes('s'))near(result.h,original.h+15/520);
 console.log('PASS resize '+mode+' with opposite edge anchored');
}
ids.reset.fire('click');a=inspect()[0];drag(ids.spot,'move',30,-25);b=inspect()[0];near(b.x,a.x+.03);near(b.y,a.y-25/520);near(b.w,a.w);near(b.h,a.h);console.log('PASS drag moves without resizing');
ids.reset.fire('click');drag(ids.spot,'se',10000,10000);a=inspect()[0];near(a.x+a.w,1);near(a.y+a.h,1);drag(ids.spot,'se',-10000,-10000);a=inspect()[0];near(a.w,.048);near(a.h,48/520);console.log('PASS screen bounds and minimum size');
ids.reset.fire('click');ids['spot-title'].fire('focus');assert(!ids.spot.classes.has('is-selected')&&ids['spot-title'].classes.has('is-selected'));slide.fire('pointerdown',{target:slide});assert(!ids['spot-title'].classes.has('is-selected'));console.log('PASS focus selection and outside-click deselection');
ids.reset.fire('click');a=inspect()[0];ids.spot.fire('keydown',{key:'ArrowLeft'});b=inspect()[0];near(b.x,a.x-.01);near(b.w,a.w);ids.spot.fire('keydown',{key:'ArrowRight',altKey:true});a=inspect()[0];near(a.w,b.w+.01);near(a.x,b.x);console.log('PASS arrow-key movement and Alt+arrow resizing');
const before=inspect()[0];slide.clientWidth=700;slide.clientHeight=420;callback();near(inspect()[0].w,before.w);near(inspect()[0].x,before.x);console.log('PASS responsive resize preserves edited normalized geometry');
ids.reset.fire('click');const handle=ids.spot.handles.find(h=>h.dataset.handle==='se');ids.spot.fire('pointerdown',{target:handle,pointerId:9,clientX:500,clientY:300});ids.enabled.checked=false;ids.enabled.fire('change');assert(!ids.spot.capture.has(9)&&ids.spot.hidden);ids.enabled.checked=true;ids.enabled.fire('change');assert(!ids.spot.hidden);console.log('PASS hiding overlay releases capture; reopening restores areas');
ids.spot.fire('pointerdown',{target:handle,pointerId:10,clientX:500,clientY:300});ids.spot.fire('pointercancel',{pointerId:10});assert(!ids.spot.capture.has(10));console.log('PASS touch cancellation releases capture');
ids.reset.fire('click');assert(ids.dim.value===60&&ids.enabled.checked);console.log('PASS reset restores demo defaults');
