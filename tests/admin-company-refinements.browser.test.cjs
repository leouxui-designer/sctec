"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {spawn}=require('node:child_process');
const browserModule=process.env.SCTEC_PLAYWRIGHT_PATH;

test('Empresas: sincronização de status e refinamentos da busca em desktop/mobile', {skip:!browserModule,timeout:60000},async()=>{
  const {chromium}=require(browserModule);
  const port=4201,base='http://127.0.0.1:'+port;
  const server=spawn(process.execPath,['server.cjs'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port)}});
  let browser;
  try{
    for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
    browser=await chromium.launch({headless:true,...(process.env.SCTEC_CHROME_PATH?{executablePath:process.env.SCTEC_CHROME_PATH}:{})});
    const page=await browser.newPage({viewport:{width:1440,height:960}});
    const errors=[],violations=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>document.addEventListener('securitypolicyviolation',event=>console.warn('CSP_TEST:'+event.blockedURI)));
    page.on('console',message=>{if(message.text().startsWith('CSP_TEST:'))violations.push(message.text());});
    await page.goto(base+'/viewer.html#/sctec/admin/companies');
    const f=page.frameLocator('#sctec-content');
    const row=id=>f.locator('[data-company-row="'+id+'"]');
    const toggle=id=>f.locator('[data-company-toggle="'+id+'"]');
    const input=f.locator('#company-search');
    const clear=f.getByRole('button',{name:'Limpar busca',exact:true});
    const icon=f.locator('.admin-companies__search-icon');
    const badge=id=>row(id).locator('.admin-company__status');
    await row('inovatech').waitFor();
    const frame=page.frames().find(frame=>frame.url().endsWith('/admin-empresas.html'));
    const state=id=>frame.evaluate(id=>JSON.parse(JSON.stringify(companies.find(company=>company.id===id))),id);
    const initial=await frame.evaluate(()=>JSON.parse(JSON.stringify(companies)));
    assert.equal(await toggle('inovatech').isChecked(),true);
    await toggle('inovatech').click();
    assert.equal(await f.locator('#company-deactivate-dialog').isVisible(),true);
    await f.locator('#company-deactivate-submit').click();
    assert.equal(await badge('inovatech').innerText(),'Inativa');
    assert.equal(await badge('inovatech').getAttribute('class'),'admin-company__status admin-company__status--inactive');
    assert.equal(await toggle('inovatech').isChecked(),false);
    assert.equal(await toggle('inovatech').evaluate(el=>el===document.activeElement),true);
    await toggle('inovatech').check();
    assert.equal(await badge('inovatech').innerText(),'Ativa');
    assert.equal(await badge('inovatech').getAttribute('class'),'admin-company__status admin-company__status--approved');
    await f.locator('#company-status').selectOption('Aprovada');
    await toggle('inovatech').click();
    await f.locator('#company-deactivate-submit').click();
    assert.equal(await row('inovatech').count(),0,'A empresa sai imediatamente do filtro Aprovada');
    assert.equal(await f.locator('#company-status').inputValue(),'Aprovada');
    assert.equal(await f.locator('#company-result-count').evaluate(el=>el===document.activeElement),true);
    await f.locator('#company-status').selectOption('Inativada');
    assert.equal(await toggle('inovatech').isChecked(),false);
    assert.equal(await badge('inovatech').innerText(),'Inativa');
    await f.locator('#company-status').selectOption('');
    await f.getByRole('button',{name:'Próxima página',exact:true}).click();
    await toggle('safetech').click();
    await f.locator('#company-deactivate-submit').click();
    assert.equal(await f.locator('[aria-current="page"]').innerText(),'2');
    await input.fill('SafeTech');
    assert.equal(await badge('safetech').innerText(),'Inativa');
    assert.equal(await toggle('safetech').isChecked(),false);
    await toggle('safetech').focus();await page.keyboard.press('Space');
    assert.equal(await toggle('safetech').isChecked(),true);
    assert.equal(await badge('safetech').innerText(),'Ativa');
    await input.fill('');
    // Pending, rejected and ACATE-related states and unrelated company fields stay intact.
    const current=await frame.evaluate(()=>JSON.parse(JSON.stringify(companies)));
    for(const before of initial){
      const after=current.find(company=>company.id===before.id);
      if(!['inovatech','safetech'].includes(before.id))assert.deepEqual(after,before);
      else {
        const {status:oldStatus,statusLabel:oldLabel,...originalFields}=before;
        const {status:newStatus,statusLabel:newLabel,...unchangedFields}=after;
        assert.deepEqual(unchangedFields,originalFields);
      }
    }
    for(const id of ['techcorp','datasoft','finansc','cloudsc','oldtech'])assert.equal(await toggle(id).count(),0);
    assert.equal((await state('oldtech')).status,'Recusada');

    async function verifySearchAlignment(){
      const box=await input.boundingBox();
      const ph=await f.locator('.admin-companies__search-placeholder').boundingBox();
      const image=await icon.boundingBox();
      assert.equal(box.height,46);
      assert.ok(Math.abs((ph.y+ph.height/2)-(box.y+box.height/2))<1);
      assert.ok(Math.abs((image.y+image.height/2)-(box.y+box.height/2))<1);
      const style=await input.evaluate(el=>{const s=getComputedStyle(el);return {top:s.paddingTop,bottom:s.paddingBottom,lineHeight:s.lineHeight};});
      assert.equal(style.top,style.bottom);assert.equal(style.lineHeight,'20px');
      return image;
    }
    assert.equal(await icon.isVisible(),true);assert.equal(await clear.isVisible(),false);
    const searchIconBox=await verifySearchAlignment();
    await input.fill('no matching company');
    assert.equal(await icon.isVisible(),false);assert.equal(await clear.isVisible(),true);
    assert.equal(await input.evaluate(el=>el===document.activeElement),true);
    const clearBox=await clear.boundingBox();
    assert.deepEqual(clearBox,searchIconBox,'O botão X ocupa exatamente a posição e o tamanho da lupa');
    assert.equal(await f.locator('#company-empty').isVisible(),true);
    await clear.click();
    assert.equal(await input.inputValue(),'');assert.equal(await input.evaluate(el=>el===document.activeElement),true);
    assert.equal(await icon.isVisible(),true);assert.equal(await clear.isVisible(),false);
    assert.equal(await f.locator('#company-empty').isVisible(),false);
    assert.equal(await f.locator('#company-table-body tr').count(),7);
    assert.equal(await f.locator('.pagination__info').innerText(),'de 2');
    await f.locator('#company-status').selectOption('Inativada');
    await input.fill('InovaTech');await input.press('Tab');
    assert.equal(await clear.evaluate(el=>el===document.activeElement),true);
    await clear.press('Enter');
    assert.equal(await input.inputValue(),'');assert.equal(await input.evaluate(el=>el===document.activeElement),true);
    assert.equal(await f.locator('#company-status').inputValue(),'Inativada','Limpar busca preserva os outros filtros');
    await f.locator('#company-status').selectOption('');
    await input.fill(' ');assert.equal(await clear.isVisible(),true);await clear.click();
    await page.setViewportSize({width:390,height:844});
    await verifySearchAlignment();await input.fill('Tech');
    assert.equal(await clear.isVisible(),true);await clear.click();
    assert.equal(await input.inputValue(),'');assert.equal(await icon.isVisible(),true);
    const overflow=await frame.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    assert.equal(overflow,false);
    assert.deepEqual(errors,[]);assert.deepEqual(violations,[]);
  }finally{await browser?.close();server.kill();}
});

