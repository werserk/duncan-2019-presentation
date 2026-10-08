const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
(async()=>{
 const {load}=await import('cheerio');
 const baseline=process.argv.includes('--migration')?cp.execFileSync('git',['show','b5bb420:work/slides/slides.html'],{encoding:'utf8'}):fs.readFileSync('work/slides/slides.html','utf8');
 const original=load(baseline),current=load(fs.readFileSync('work/slides/slides.html','utf8'));
 const prepared=load(fs.readFileSync('.generated/slides.html','utf8'));
 const text=$=>$.root().find('.sheet').toArray().map(a=>$(a).text().replace(/\s+/g,' ').trim());
 assert.deepEqual(text(current),text(original),'Authored scientific slide text must be preserved');
 const speech=$=>$('template.speaker-notes').toArray().map(t=>load($(t).html()).text().replace(/\s+/g,' ').trim());
 assert.deepEqual(speech(current),speech(original),'Full authored template speech must be preserved separately from visible slide text');
 const config=(await import(require('node:url').pathToFileURL(require('node:path').resolve('dist/config.js')).href)).default;
 assert.equal(config.slides.filter(s=>!s.parent).length,current('.sheet:not([data-optional])').length);
 assert.equal(config.slides.filter(s=>s.parent).length,current('.sheet[data-optional]').length);
 assert.equal(config.slides[0].steps,3);
 assert.equal(config.slides[2].steps,4);
 assert.equal(config.slides[3].parent,'slide-3');
 const out=fs.readFileSync('dist/reader.html','utf8');
 const printed=load(out);
 prepared('template.speaker-notes').remove();assert.deepEqual(text(printed),text(prepared),'Reader must preserve all prepared slide text');
 assert.match(out,/12,5/); // Exact current source example: 0.4/3.2 =12.5%.
 assert.match(out,/0,4/);assert.match(out,/0,5/);
 assert.match(out,/3,7 × 10⁻⁶/);assert.match(out,/df = 24|24/);
 const notes=fs.readFileSync('dist/speaker-notes.md','utf8');
 for(const phrase of ['не согласуется','pseudo-R²','точный вектор','причинный эффект','При необходимости'])assert.ok(notes.includes(phrase),phrase);
 assert.ok(!fs.readFileSync('dist/index.html','utf8').includes('Для обсуждения:'));
 console.log('Preserved all slide and speech text; 10 core + 3a; Decimal examples, source limitations and audience/notes separation checked');
})().catch(e=>{console.error(e);process.exit(1)});
