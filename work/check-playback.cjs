const assert=require('node:assert/strict');
(async()=>{
 const {chromium}=await import('playwright');
 const {serve}=await import('werserk-presentation/tools/server.js');
 const {pathToFileURL}=require('node:url');
 const c=(await import(pathToFileURL(require('node:path').resolve('dist/config.js')).href)).default;
 const {server,url}=await serve('dist');let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/google-chrome-stable'});
  const context=await browser.newContext({viewport:{width:1616,height:871}}),page=await context.newPage();
  const failures=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'/?session=acceptance');await page.waitForFunction(()=>window.presentation);
  for(const theme of ['light','dark']){
   await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   for(const s of c.slides){
    await page.evaluate(s=>{window.presentation.command('goto',s.id);for(let i=0;i<s.steps;i++)window.presentation.command('next');},s);
    await page.evaluate(()=>document.fonts.ready);
    const bad=await page.evaluate(()=>{
     const sheet=window.presentation.reveal.getCurrentSlide().querySelector('.sheet');const box=sheet.getBoundingClientRect();
     const walk=document.createTreeWalker(sheet,NodeFilter.SHOW_TEXT);let node,overflow=[];
     while(node=walk.nextNode()){
      if(!node.textContent.trim()||node.parentElement.closest('template,dialog,[hidden],[inert],.fragment:not(.visible)'))continue;
      const style=getComputedStyle(node.parentElement);if(style.visibility==='hidden'||style.display==='none')continue;
      const range=document.createRange();range.selectNodeContents(node);const r=range.getBoundingClientRect();
      if(r.width>0&&r.height>0&&(r.left<box.left-2||r.right>box.right+2||r.top<box.top-2||r.bottom>box.bottom+2))overflow.push(node.textContent.trim());
     }return overflow;
    });if(bad.length)failures.push({theme,id:s.id,text:bad});
   }
  }
  assert.deepEqual(failures,[],'Text overflow in fully revealed slides');
  for(const s of c.slides.filter(s=>s.parent)){
   const p=c.slides.find(p=>p.id===s.parent),step=Math.min(2,p.steps);
   await page.evaluate(({p,step,s})=>{window.presentation.command('goto',p.id);for(let i=0;i<step;i++)window.presentation.command('next');window.presentation.command('optional',s.id);}, {p,step,s});
   const counter=await page.locator('#core-counter').innerText();assert.ok(counter.includes('21'));
   await page.evaluate(()=>window.presentation.command('return'));const state=await page.evaluate(()=>window.presentation.state());
   assert.equal(state.id,p.id);assert.equal(state.step,step);
  }
  for(const [slideId,dialogId] of [['slide-4','figure-dialog'],['slide-8','figure-2-dialog'],['slide-10','figure-3-dialog'],['slide-15','figure-supp4-dialog'],['slide-16','figure-4-dialog']]){
   const s=c.slides.find(s=>s.id===slideId);await page.evaluate(s=>{window.presentation.command('goto',s.id);for(let i=0;i<s.steps;i++)window.presentation.command('next');},s);
   const selector=dialogId==='figure-dialog'?'.sheet.active .figure-open:not([data-figure])':'.sheet.active .figure-open[data-figure="'+dialogId+'"]';
   await page.locator(selector).first().click();await page.locator('#'+dialogId+'[open]').waitFor();
   const before=await page.evaluate(()=>window.presentation.state());await page.evaluate(()=>window.presentation.command('next'));assert.deepEqual(await page.evaluate(()=>window.presentation.state()),before);
   await page.keyboard.press('Escape');await page.locator('#'+dialogId+'[open]').waitFor({state:'hidden'});
  }
  const speaker=await context.newPage();await speaker.goto(url+'/presenter.html?session=acceptance');
  await speaker.waitForFunction(()=>document.querySelector('#connection').textContent.includes('установлена'));
  await page.evaluate(()=>window.presentation.command('goto','slide-21'));
  await speaker.waitForFunction(()=>document.querySelector('#slide-title').textContent.includes('Ограничения'));
  await speaker.locator('[data-command="next"]').click();
  await page.waitForFunction(()=>window.presentation.state().id==='slide-21'&&window.presentation.state().step===1);
  await speaker.waitForFunction(()=>document.querySelector('#step-notes').textContent.includes('устойчивость'));
  assert.equal(await speaker.locator('#full-script').getAttribute('open'),null);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({geometryViews:52,optionalReturns:5,figureDialogs:5,presenterSlide21:'pass',currentSpeech:'pass'}));
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1)});
