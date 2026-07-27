import puppeteer from 'puppeteer';
import fs from 'fs';

const B = 'http://localhost:4500';
const token = fs.readFileSync('/tmp/tokg.txt', 'utf8').trim();
const b = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 1200 });

const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 120)));
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });

await p.setCookie({ name: 'pl_admin', value: token, domain: 'localhost', path: '/' });
await p.goto(B + '/admin', { waitUntil: 'networkidle2', timeout: 120000 });
await new Promise(r => setTimeout(r, 2000));

await p.evaluate(() => [...document.querySelectorAll('button')].find(x => x.innerText.trim() === 'Products')?.click());
await new Promise(r => setTimeout(r, 2500));

// open the edit form of a product that already has many images
await p.evaluate(() => {
  const rows = [...document.querySelectorAll('div')].filter(d => d.textContent?.includes('woven-labels'));
  const btns = [...document.querySelectorAll('button')].filter(x => x.innerText.trim() === 'Edit');
  btns[0]?.click();
});
await new Promise(r => setTimeout(r, 2500));

console.log('EDIT FORM');
console.log('   gallery section present :', await p.evaluate(() => /Gallery images/i.test(document.body.innerText)));

const thumbs = await p.evaluate(() =>
  document.querySelectorAll('button[aria-label="Remove this image"]').length);
console.log('   existing thumbnails     :', thumbs, '(woven-labels has 8 total => 7 extras)');

const hint = await p.evaluate(() =>
  document.body.innerText.match(/\d+ gallery images?[^\n]*/i)?.[0] || 'none');
console.log('   hint text               :', hint);

await p.screenshot({ path: '/home/user/shots/g1-editor.png' });

// add two files via the multi-upload input
const inputs = await p.$$('input[type=file]');
console.log('   file inputs (main+gal)  :', inputs.length);
await inputs[1].uploadFile('/home/user/gi/g1.png', '/home/user/gi/g2.png');
await new Promise(r => setTimeout(r, 1500));

const after = await p.evaluate(() =>
  document.querySelectorAll('button[aria-label="Remove this image"]').length);
console.log('   thumbnails after adding :', after, `(expected ${thumbs + 2})`);
console.log('   "New" badges shown      :', await p.evaluate(() =>
  [...document.querySelectorAll('span')].filter(s => s.innerText.trim() === 'New').length));
console.log('   pending uploads listed  :', await p.evaluate(() => /Pending uploads/i.test(document.body.innerText)));

await p.screenshot({ path: '/home/user/shots/g2-added.png' });

// remove one via the X button
await p.evaluate(() => document.querySelector('button[aria-label="Remove this image"]')?.click());
await new Promise(r => setTimeout(r, 900));
const removed = await p.evaluate(() =>
  document.querySelectorAll('button[aria-label="Remove this image"]').length);
console.log('   after clicking one X    :', removed, `(expected ${after - 1})`);

// reorder check
const canReorder = await p.evaluate(() =>
  document.querySelectorAll('button[aria-label="Move later"]').length > 0);
console.log('   reorder buttons present :', canReorder);

console.log('\nconsole errors:', errs.length);
errs.slice(0, 3).forEach(e => console.log('   ', e));
await b.close();
