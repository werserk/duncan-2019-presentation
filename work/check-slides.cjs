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
  assert.equal(await page.locator('.sheet').count(),26); assert.equal(await page.locator('.sheet:not([data-optional])').count(),21);
  assert.deepEqual(await page.locator('.toc a').evaluateAll(items=>items.map(a=>a.hash)),Array.from({length:21},(_,i)=>`#slide-${i+1}`));
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
  for (const [id,dialog,width] of [['slide-8','figure-2-dialog',1771],['slide-10','figure-3-dialog',1819],['slide-13','figure-3-dialog',1819],['slide-14','figure-3-dialog',1819],['slide-15','figure-supp4-dialog',2200],['slide-16','figure-4-dialog',1541],['slide-18','figure-4-dialog',1541]]) {
   await page.locator(`.toc a[href="#${id}"]`).click();
   await page.locator(`#${id} .figure-open`).click();
   assert(await page.locator(`#${dialog}`).isVisible());
   assert(await page.locator(`#${dialog} img`).evaluate((img,n)=>img.complete&&img.naturalWidth===n,width));
   await page.locator(`#${dialog}`).focus(); await page.keyboard.press('ArrowLeft');
   assert.equal(await page.locator('.sheet.active').getAttribute('id'),id);
   await page.locator(`#${dialog} .figure-close`).click();
   assert.equal(await page.evaluate(()=>document.activeElement.closest('article').id),id);
  }
  await page.locator('.toc a[href="#slide-21"]').click();
  assert.equal(await page.locator('#next').isDisabled(),true);
  for (const [id,parent,next] of [['slide-12a','slide-12','slide-13'],['slide-12b','slide-12','slide-13'],['slide-15a','slide-15','slide-16'],['slide-17a','slide-17','slide-18']]) {
   await page.locator(`.toc a[href="#${parent}"]`).click();
   await page.locator(`#${parent} a[href="#${id}"]`).click();
   await page.waitForFunction(wanted=>document.querySelector('.sheet.active').id===wanted,id);
   assert.match(await page.locator('#notes-title').innerText(),new RegExp('^'+id.replace('slide-','')));
   assert.match(await page.locator('#notes-body').innerText(),/условн/);
   assert.equal(await page.locator('#next').isDisabled(),!next);
   if (next) {
    await page.locator('#next').click();
    assert.equal(await page.locator('.sheet.active').getAttribute('id'),next);
    await page.goBack();
    assert.equal(await page.locator('.sheet.active').getAttribute('id'),id);
   }
   await page.locator('#previous').click();
   assert.equal(await page.locator('.sheet.active').getAttribute('id'),parent);
   await page.goto(pathToFileURL(file).href+'#'+id);
   assert.equal(await page.locator('.sheet.active').getAttribute('id'),id);
   await page.locator('.viewport').focus(); await page.keyboard.press('ArrowLeft');
   assert.equal(await page.locator('.sheet.active').getAttribute('id'),parent);
   await page.locator('.viewport').focus(); await page.keyboard.press('ArrowRight');
   assert.equal(await page.locator('.sheet.active').getAttribute('id'),next||parent);
  }
  assert.deepEqual(await page.locator('#slide-12a .selection-results tbody tr').allTextContents(),['X0,80,2A, C0,3','Y0,10,2A, B, C0,4','Y0,10,05A, C0,3']);
  assert.deepEqual(await page.locator('#slide-12b .threshold-results tbody tr strong').allTextContents(),['0,4','0,5','0,4']);
  assert.deepEqual(await page.locator('#slide-15a .confounding-models strong').allTextContents(),['β = 10','β = 0']);
  await page.locator('.toc a[href="#slide-21"]').click();
  await page.locator('#notes').click();
  await page.screenshot({path:'checks/route/last-main-slide.png'});
  await page.goto(pathToFileURL(file).href+'#slide-3a');
  assert.equal(await page.locator('.sheet.active').getAttribute('id'),'slide-3a');
  await page.locator('#notes').click();
  assert.match(await page.locator('#notes-title').innerText(),/^3a/);
  await page.screenshot({path:'checks/route/notes-example.png'});
  await page.setViewportSize({width:400,height:900});
  await page.screenshot({path:'checks/route/notes-mobile.png'});
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.sheet:visible').count(),26); assert(!(await page.locator('#speaker-notes').isVisible()));
  const notes=fs.readFileSync('outputs/duncan-2019-speaker-notes.md','utf8');
  assert.match(notes,/## 3a\./); assert.match(notes,/## 12a\./); assert.match(notes,/## 12b\./); assert.match(notes,/## 15a\./); assert.match(notes,/## 17a\./);
  assert.match(notes,/767/); assert.match(notes,/0,5/); assert(!/EXAMPLE_|TEACH_|DATA_/.test(notes));
  assert.deepEqual(await page.locator('#slide-17a .correlation-results strong').allTextContents(),['r = 1','r = 0']);
  assert.match(notes,/1940/); assert.match(notes,/0,67/);
  assert.deepEqual(errors,[]); assert.deepEqual(requests,[]);
  fs.writeFileSync('checks/route/custom.json',JSON.stringify({core:21,optional:5,branch:true,notes:true,figureTriggers:9,history:true,directHash:true,print:26,errors,requests},null,2));
  console.log('PASS: 21 core + 5 optional; all branches/return/continue/history/hash; computed examples; notes; 9 figure triggers; 26 print pages; offline');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
