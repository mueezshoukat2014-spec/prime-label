import puppeteer from 'puppeteer';
const b = await puppeteer.launch({args:['--no-sandbox']});
const pg = await b.newPage();
await pg.setViewport({width:390, height:844, deviceScaleFactor:1.5, isMobile:true, hasTouch:true});
await pg.goto('http://localhost:3000', {waitUntil:'networkidle2', timeout:150000});
await new Promise(r=>setTimeout(r,6000));
const h = await pg.evaluate(()=>document.body.scrollHeight);
console.log('home height now:', h);
let i=0;
for(let y=0; y<h && i<14; y+=800, i++){
  await pg.evaluate(v=>window.scrollTo(0,v), y);
  await new Promise(r=>setTimeout(r,1000));
  await pg.screenshot({path:`/tmp/v_${String(i).padStart(2,'0')}.png`});
}
// contact
await pg.goto('http://localhost:3000/contact', {waitUntil:'networkidle2', timeout:150000});
await new Promise(r=>setTimeout(r,4000));
await pg.screenshot({path:'/tmp/v_contact.png'});
await b.close();
