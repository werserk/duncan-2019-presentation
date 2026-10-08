const assert = require('node:assert/strict');
const fs = require('node:fs');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || undefined});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:900}});
    const url = pathToFileURL(path.resolve('outputs/duncan-2019-slides.html')).href;
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    fs.mkdirSync('checks/consistency',{recursive:true});
    const ids = await page.locator('.sheet').evaluateAll(items => items.map(el => el.id));
    const route = await page.locator('.sheet').evaluateAll(items => items.map(el => ({id:el.id,parent:el.dataset.parent || el.id,optional:el.hasAttribute('data-optional')})));
    const main = route.filter(item=>!item.optional);
    assert.deepEqual(main.map(item=>item.id),Array.from({length:21},(_,i)=>`slide-${i+1}`));
    assert.deepEqual(route.filter(item=>item.optional).map(item=>item.id),['slide-3a','slide-12a','slide-12b','slide-15a','slide-17a']);
    const measurements = [];
    for (const theme of ['light','dark']) {
      await page.evaluate(t => document.documentElement.dataset.theme = t,theme);
      for (const id of ids) {
        await page.goto(url + '#' + id);
        const slide = page.locator('#' + id);
        const measure = await slide.evaluate(el => {
          const r = el.getBoundingClientRect(), h = el.querySelector('h1'), q = h.getBoundingClientRect();
          const scale = r.width / 1280;
          const overflow = [...el.querySelectorAll('p,h1,h2,h3,table,a,figure,svg')].filter(n => !n.closest('template')).filter(n => {
            const b = n.getBoundingClientRect();
            return b.bottom > r.bottom - 23 * scale || b.right > r.right + 1 || b.left < r.left - 1;
          }).map(n => n.className || n.tagName);
          const collapsed = [...el.querySelectorAll('p,h1,h2,h3,table,a,figure,svg')].filter(n=>!n.closest('template')).filter(n=>n.getBoundingClientRect().height===0).map(n=>n.className||n.tagName);
          return {id:el.id,theme:document.documentElement.dataset.theme,font:getComputedStyle(h).fontSize,
            left:Math.round((q.left-r.left)/scale),top:Math.round((q.top-r.top)/scale),overflow,collapsed,
            counter:el.querySelector('.page-counter').textContent,progress:parseFloat(el.querySelector('.page-progress').style.width)};
        });
        assert.equal(measure.font,'44px');
        assert.equal(measure.left,48); assert.equal(measure.top,48);
        assert.deepEqual(measure.overflow,[],id);
        assert.deepEqual(measure.collapsed,[],`${id}: collapsed content`);
        const position=main.findIndex(item=>item.id===route.find(item=>item.id===id).parent)+1;
        assert.equal(measure.counter,`${String(position).padStart(2,'0')}/${String(main.length).padStart(2,'0')}`);
        // CSSOM serializes percentages with rounded precision; 0.001% is below a pixel here.
        assert(Math.abs(measure.progress-position/main.length*100)<0.001,`${id}: required-route progress`);
        for (const media of await slide.locator('[role="img"]').all()) {
          assert(await media.evaluate(el => el.getBoundingClientRect().height > 0),`${id}: collapsed figure or legend`);
        }
        measurements.push(measure);
        await slide.screenshot({path:`checks/consistency/${theme}-${id}.png`});
      }
    }
    await page.goto(url+'#slide-1'); await page.locator('#notes').click();
    assert.match(await page.locator('#notes-body').innerText(),/Это числовая оценка, которая/);
    await page.setViewportSize({width:400,height:900});
    await page.screenshot({path:'checks/consistency/notes-narrow.png'});
    await page.locator('#zoom').click();
    assert.equal(await page.locator('#zoom').innerText(),'Вписать');
    assert(await page.locator('.viewport').evaluate(el => el.scrollWidth > el.clientWidth));
    await page.locator('#zoom').click();
    assert.equal(await page.locator('#zoom').innerText(),'100%');
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.sheet:visible').count(),26);
    await page.evaluate(()=>document.documentElement.dataset.theme='light');
    await page.pdf({path:'checks/consistency/presentation.pdf',preferCSSPageSize:true,printBackground:true});
    const notes = fs.readFileSync('outputs/duncan-2019-speaker-notes.md','utf8');
    assert(!/балл|предсказательн/iu.test(notes));
    for (const token of ['733','26','67','19','3,8','460','17','767','0,4','0,5','3,2','12,5','42','60','95','5,97','10⁻⁶','2577','PC1–4','PC7 и PC12','β=0']) assert(notes.includes(token),token);
    fs.writeFileSync('checks/consistency/measurements.json',JSON.stringify(measurements,null,2));
    console.log(`PASS: ${measurements.length} slide/theme views; shared headings/geometry; glossary; core/optional counters and progress; notes/zoom; full light PDF.`);
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
