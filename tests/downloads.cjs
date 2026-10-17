const fs = require('fs'), vm = require('vm'), assert = require('assert');
const script = fs.readFileSync('site/downloads.js', 'utf8');
async function run(response, lang='sv') {
 const status={textContent:'fallback'}, small={textContent:''};
 const links=['mac','windows'].map(platform=>({dataset:{download:platform},href:'fallback',closest:()=>({querySelector:()=>small})}));
 const document={documentElement:{lang},getElementById:()=>status,querySelectorAll:()=>links};
 await vm.runInNewContext(script,{document,fetch:async()=>response,AbortSignal});
 return {status,links,small};
}
(async()=>{
 const base='https://github.com/kodenaab/foka.kodena.se/releases/download/v0.2.31/';
 const release={tag_name:'v0.2.31',assets:['Foka-0.2.31-osx-arm64.dmg','Foka-0.2.31-win-x64.zip'].map(name=>({name,browser_download_url:base+name}))};
 let r=await run({ok:true,json:async()=>release});assert(r.links.every(x=>x.href.startsWith(base)));
 r=await run({status:404});assert(r.status.textContent.includes('förbereds'));assert(r.links.every(x=>x.href==='fallback'));
 r=await run({ok:false,status:403});assert(r.links.every(x=>x.href==='fallback'));
 release.assets[0].browser_download_url='https://example.com/untrusted.dmg';
 r=await run({ok:true,json:async()=>release});assert.equal(r.links[0].href,'fallback');
 console.log('PASS release downloads, unpublished release, API failure and asset URL validation');
})().catch(e=>{console.error(e);process.exitCode=1});
