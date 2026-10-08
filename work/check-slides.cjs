const assert=require('node:assert/strict');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const file=require('node:path').resolve('outputs/duncan-2019-slides.html');
fs.mkdirSync('checks/route',{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || undefined});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith('data:')&&r.url()!==pathToFileURL(file).href) requests.push(r.url());});
 try {
  await page.goto(pathToFileURL(file).href); await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.sheet').count(),11); assert.equal(await page.locator('.sheet:not([data-optional])').count(),10);
  await page.locator('#notes').click();
  await page.locator('.toc a[href="#slide-3"]').click();
  assert.match(await page.locator('#notes-body').innerText(),/нормиров/);
  await page.locator('#slide-3 [data-slide-link]').click();
  await page.waitForFunction(()=>document.querySelector('#notes-title').textContent.startsWith('3a'));
  assert.equal(await page.locator('.sheet.active').getAttribute('id'),'slide-3a');
  const rows=await page.locator('#slide-3a tbody tr').allTextContents();
  assert.equal(rows.length,3); assert.match(rows[2],/−0,05/);
  assert.match(await page.locator('#slide-3a .result').innerText(),/0,4/);
  assert.match(await page.locator('#slide-3a .input-change').innerText(),/0,4 → 0,5/);
  assert.match(await page.locator('#notes-body').innerText(),/0,4/);
  await page.locator('#slide-3a a[href="#slide-4"]').click();
  await page.waitForFunction(()=>document.querySelector('#notes-title').textContent.startsWith('04'));
  assert.match(await page.locator('#notes-body').innerText(),/767/);
  await page.goBack(); assert.equal(await page.locator('.sheet.active').getAttribute('id'),'slide-3a');
  await page.locator('#slide-3a a[href="#slide-3"]').click();
  await page.locator('.viewport').focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.sheet.active').getAttribute('id'),'slide-4');
  for(const id of ['slide-4','slide-5']) {
   await page.locator(`.toc a[href="#${id}"]`).click();
   await page.locator(`#${id} .figure-open`).click();
   assert(await page.locator('#figure-dialog').isVisible());
   assert(await page.locator('#figure-dialog img').evaluate(img=>img.complete&&img.naturalWidth===1505));
   await page.locator('#figure-dialog').focus(); await page.keyboard.press('ArrowRight');
   assert.equal(await page.locator('.sheet.active').getAttribute('id'),id);
   await page.keyboard.press('Escape');
   assert.equal(await page.evaluate(()=>document.activeElement.closest('article').id),id);
  }
  assert.equal(await page.locator('#next').isDisabled(),false);
  await page.locator('.viewport').focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.sheet.active').getAttribute('id'),'slide-6');
  for (const [id,dialog,width] of [['slide-8','figure-2-dialog',1771],['slide-10','figure-3-dialog',1819]]) {
   await page.locator(`.toc a[href="#${id}"]`).click();
   await page.locator(`#${id} .figure-open`).click();
   assert(await page.locator(`#${dialog}`).isVisible());
   assert(await page.locator(`#${dialog} img`).evaluate((img,n)=>img.complete&&img.naturalWidth===n,width));
   await page.locator(`#${dialog}`).focus(); await page.keyboard.press('ArrowLeft');
   assert.equal(await page.locator('.sheet.active').getAttribute('id'),id);
   await page.locator(`#${dialog} .figure-close`).click();
   assert.equal(await page.evaluate(()=>document.activeElement.closest('article').id),id);
  }
  assert.equal(await page.locator('#next').isDisabled(),true);
  await page.locator('#notes').click();
  await page.screenshot({path:'checks/route/slide-5-full.png'});
  await page.goto(pathToFileURL(file).href+'#slide-3a');
  assert.equal(await page.locator('.sheet.active').getAttribute('id'),'slide-3a');
  await page.locator('#notes').click();
  assert.match(await page.locator('#notes-title').innerText(),/^3a/);
  await page.screenshot({path:'checks/route/notes-example.png'});
  await page.setViewportSize({width:400,height:900});
  await page.screenshot({path:'checks/route/notes-mobile.png'});
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.sheet:visible').count(),11); assert(!(await page.locator('#speaker-notes').isVisible()));
  const notes=fs.readFileSync('outputs/duncan-2019-speaker-notes.md','utf8');
  assert.match(notes,/## 3a\./); assert.match(notes,/767/); assert.match(notes,/0,5/); assert(!notes.includes('EXAMPLE_'));
  assert.deepEqual(errors,[]); assert.deepEqual(requests,[]);
  fs.writeFileSync('checks/route/custom.json',JSON.stringify({core:10,optional:1,branch:true,notes:true,figureTriggers:4,history:true,directHash:true,print:11,errors,requests},null,2));
  console.log('PASS: 10 core + optional3a; example/return/continue/history/hash; notes; 4 figure triggers; 11 print pages; offline');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
