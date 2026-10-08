import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '/Users/mctherockstar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const report=[]; const check=(name,result,detail='')=>{report.push({name,pass:!!result,detail});console.log(`${result?'PASS':'FAIL'} ${name}${detail?' · '+detail:''}`);if(!result)throw new Error(name);};
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,250));});
await page.addInitScript(()=>{if(window!==window.top)return;if(location.protocol==='file:'){sessionStorage.setItem('rp7d.boot','new');localStorage.removeItem('rp7d.n3000.saves.RP1.v1');}window.__testPad=null;Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>window.__testPad?[window.__testPad]:[]});});
try{
await page.goto(pathToFileURL(path.join(root,'dist/RP7D_Malezor_Playtest.html')).href,{waitUntil:'load',timeout:120000});
await page.waitForFunction(()=>window.__rp7d?.homeInterior&&document.querySelector('#intro')?.classList.contains('hidden'),{timeout:120000});
await page.waitForFunction(()=>window.__rp7d.rizer.actor?.root || window.__rp7d.rizer.actor,{timeout:60000});
// Approach the actual upstairs interaction point, then use E (not a direct host-open call).
await page.evaluate(()=>{const g=__rp7d,p=g.homeInterior.root.userData.stations.find(s=>s.id==='n3000');g.rizer.position.set(p.x,4.25,p.z);g.rizer.vel.set(0,0,0);g.rizer.flying=false;g.rizer.onGround=true;});
await page.waitForTimeout(500);await page.keyboard.press('e');await page.waitForFunction(()=>__rp7d.n3000.isOpen,{timeout:10000});
check('Physical console interaction opens home',await page.locator('.n3000-home').count()===1);
const snapshot=await page.evaluate(()=>({pos:__rp7d.rizer.position.toArray(),health:__rp7d.rizer.health,inventory:JSON.stringify(__rp7d.inventory),hour:__rp7d.hour,elapsed:__rp7d.elapsed,camera:__rp7d.camera.position.toArray()}));
await page.locator('[data-action="library"]').click();check('Nine manifest-driven titles',await page.locator('.n3000-card').count()===9);
await page.locator('[data-id="RP2"]').click();check('Unenabled title is explicit and safe',await page.locator('[data-action="play"]').isDisabled());await page.locator('[data-action="library"]').click();
async function launch(){await page.locator('[data-id="RP1"]').click();await page.locator('[data-action="play"]').click();await page.waitForFunction(()=>__rp7d.n3000.state==='running',{timeout:20000});return page.frames().find(f=>f.parentFrame());}
let guest=await launch();check('Actual RP1 entry loaded',await guest.locator('#intro-start').count()===1);check('Opaque guest cannot access host',await guest.evaluate(()=>{try{return parent.document===document;}catch{return true;}}));
await guest.locator('#endless-start').click();await page.waitForTimeout(400);await guest.locator('#game-canvas').click();await page.keyboard.down('ArrowRight');await page.waitForTimeout(350);await page.keyboard.up('ArrowRight');check('Native keyboard reached RP1',await guest.locator('#touch-hint').textContent().then(t=>t.includes('Keyboard')));
await page.keyboard.press('Space');await page.waitForTimeout(100);check('Included guest audio decodes',await guest.evaluate(()=>Promise.all([...document.querySelectorAll('audio')].map(a=>a.id==='rp1-bgm'?true:a.error===null)).then(a=>a.every(Boolean))));
await page.evaluate(()=>{window.__testPad={id:'Test standard controller',index:0,connected:true,mapping:'standard',axes:[-.8,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0}))};});
await page.waitForTimeout(400);check('Native RP1 controller gets forwarded axes',await guest.evaluate(()=>navigator.getGamepads()[0]?.axes[0]===-.8));
await guest.evaluate(()=>localStorage.setItem('aov-rp1-lastname','N3000 TEST'));await page.waitForTimeout(100);check('RP1 saves stay in its namespace',await page.evaluate(()=>JSON.parse(localStorage.getItem('rp7d.n3000.saves.RP1.v1'))['aov-rp1-lastname']==='N3000 TEST'&&localStorage.getItem('aov-rp1-lastname')===null));
check('RP7D is completely paused',await page.evaluate(s=>JSON.stringify(__rp7d.rizer.position.toArray())===JSON.stringify(s.pos)&&__rp7d.hour===s.hour&&__rp7d.elapsed===s.elapsed&&JSON.stringify(__rp7d.inventory)===s.inventory&&__rp7d.sfx.getState().ctx==='suspended'&&!__rp7d.music.getState().playing,snapshot));
await page.screenshot({path:path.join(root,'reports/n3000-rp1-playtest.png')});
// Hold Options: the guest never sees the reserved system button.
await page.evaluate(()=>__testPad.buttons[9]={pressed:true,touched:true,value:1});await page.waitForFunction(()=>document.querySelector('.n3000-modal'),{timeout:6000});await page.evaluate(()=>__testPad.buttons[9]={pressed:false,touched:false,value:0});
check('Universal controller exit pauses guest',await page.locator('.n3000-modal').count()===1);
const guestTime=await guest.evaluate(()=>performance.now());await page.waitForTimeout(300);check('Paused guest has frozen virtual time',Math.abs(await guest.evaluate(()=>performance.now())-guestTime)<2);
await page.locator('[data-action="resume"]').click();await page.waitForTimeout(100);await page.keyboard.press('F10');await page.locator('[data-action="leave"]').click();await page.waitForFunction(()=>__rp7d.n3000.state==='library');check('Guest destroyed on return',await page.locator('iframe.n3000-guest').count()===0);
guest=await launch();check('Saved guest preferences survive relaunch',await guest.evaluate(()=>localStorage.getItem('aov-rp1-lastname')==='N3000 TEST'));
await page.evaluate(()=>window.__testPad=null);await page.waitForTimeout(200);check('Controller disconnect recovers to keyboard',await page.locator('.n3000-status').textContent().then(t=>t.includes('disconnected')));
await page.locator('[data-action="exit"]').click();await page.locator('[data-action="leave"]').click();await page.waitForFunction(()=>__rp7d.n3000.state==='library');await page.locator('[data-action="home"]').click();await page.locator('[data-action="close"]').first().click();
check('Closing console preserves position and world state',await page.evaluate(s=>JSON.stringify(__rp7d.rizer.position.toArray())===JSON.stringify(s.pos)&&JSON.stringify(__rp7d.inventory)===s.inventory,snapshot));await page.waitForTimeout(500);check('World simulation resumes',await page.evaluate(s=>__rp7d.elapsed>s.elapsed&&__rp7d.hour>s.hour,snapshot));check('No game runtime error',await page.evaluate(()=>!__rp7d.lastError));
await page.screenshot({path:path.join(root,'reports/n3000-console-playtest.png')});
}catch(e){console.log('TEST ERROR',e.message);console.log('HOST STATE',await page.evaluate(()=>({state:__rp7d?.n3000?.state,modal:document.querySelector('.n3000-modal')?.textContent})));await page.screenshot({path:path.join(root,'reports/n3000-test-failure.png')}).catch(()=>{});process.exitCode=1;}finally{fs.writeFileSync(path.join(root,'reports/n3000-playtest.json'),JSON.stringify({report,errors},null,2));await browser.close();}
