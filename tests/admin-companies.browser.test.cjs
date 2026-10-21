"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');
// Optional browser dependency supplied by the execution environment; never installed by this test.
const browserModule = process.env.SCTEC_PLAYWRIGHT_PATH;
test('Gestão de Empresas: filtros, ACATE, estado vazio, paginação, shell e rotas', { skip: !browserModule, timeout:60000 }, async () => {
  const { chromium } = require(browserModule);
  const port = 4199;
  const base = 'http://127.0.0.1:' + port;
  const server = spawn(process.execPath, ['server.cjs'], { cwd:path.resolve(__dirname,'..'), env:{...process.env,PORT:String(port)} });
  let browser;
  try {
    for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{} await new Promise(r=>setTimeout(r,100));}
    browser = await chromium.launch({headless:true, ...(process.env.SCTEC_CHROME_PATH?{executablePath:process.env.SCTEC_CHROME_PATH}:{})});
    const page = await browser.newPage({viewport:{width:1440,height:960}});
    const errors=[]; const violations=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.addInitScript(() => { document.addEventListener('securitypolicyviolation', e => { if (location.pathname.endsWith('/admin-empresas.html')) console.warn('CSP_TEST:' + e.blockedURI); }); });
    page.on('console', m=>{if(m.text().startsWith('CSP_TEST:'))violations.push(m.text());});
    await page.goto(base+'/viewer.html#/sctec/admin/companies');
    const f=page.frameLocator('#sctec-content');
    const rows=f.locator('#company-table-body tr');
    await rows.first().waitFor();
    assert.equal(await rows.count(),7);
    assert.equal(await f.locator('#company-empty').isVisible(),false,'regressão: empty state não pode aparecer com registros');
    assert.equal(await f.locator('.admin-company__request').first().innerText(),'Ver solicitação');
    await f.locator('#company-search').fill('empresa inexistente');
    assert.equal(await rows.count(),0);assert.equal(await f.locator('#company-empty').isVisible(),true);
    assert.equal(await f.locator('#company-pagination').isVisible(),false);
    assert.equal(await f.locator('#company-pagination button').count(),0);
    assert.equal(await f.locator('#company-result-count').isVisible(),false);
    await f.locator('#company-search').fill('');
    assert.equal(await f.locator('#company-empty').isVisible(),false);
    await f.locator('#company-acate').check();
    const acateCells=await rows.locator('td:nth-child(4)').allTextContents();
    assert.ok(acateCells.length>0);assert.ok(acateCells.every(t=>t==='Sim'));
    await f.locator('#company-status').selectOption('Aprovada');
    await f.locator('#company-size').selectOption('Grande');
    assert.ok((await rows.count())>0);
    await f.locator('#company-search').fill('SafeTech');
    assert.equal(await rows.count(),1);
    assert.ok((await rows.first().innerText()).includes('SafeTech Brasil'));
    await f.locator('#company-search').fill('');
    assert.ok((await rows.locator('td:nth-child(5)').allTextContents()).every(t=>t==='Ativa'));
    await f.locator('#company-search').fill('inexistente');
    assert.equal(await f.locator('#company-empty').isVisible(),true);
    await f.locator('#company-search').fill('');
    await f.locator('#company-status').selectOption('');await f.locator('#company-size').selectOption('');await f.locator('#company-acate').uncheck();
    await f.getByRole('button',{name:'Próxima página',exact:true}).click();
    assert.equal(await f.locator('[aria-current="page"]').innerText(),'2');
    assert.equal(await rows.count(),7);assert.equal(await f.locator('#company-empty').isVisible(),false);
    await f.locator('#company-search').fill('InovaTech');
    assert.equal(await rows.count(),1);assert.equal(await f.locator('[aria-current="page"]').innerText(),'1');
    await f.locator('#company-search').press('Enter');assert.equal(await rows.count(),1);
    await f.locator('#company-search').fill('');
    await f.locator('#avatar-toggle').click();assert.equal(await f.locator('#avatar-menu').isVisible(),true);
    await f.locator('#avatar-toggle').press('Escape');assert.equal(await f.locator('#avatar-menu').isVisible(),false);
    await f.getByRole('link',{name:'Cadastrar Empresa',exact:false}).click();await page.waitForURL('**/viewer.html#/sctec/admin/company-create');
    await f.locator('.sidebar__link').filter({hasText:'Gestão de Empresas'}).click();await page.waitForURL('**/viewer.html#/sctec/admin/companies');await rows.first().waitFor();
    await f.getByRole('link',{name:'Editar InovaTech SC',exact:true}).click();await page.waitForURL('**/viewer.html#/sctec/admin/company-edit');
    await page.goto(base+'/pages/admin-empresas.html');await page.locator('#company-table-body tr').first().waitFor();
    await page.setViewportSize({width:390,height:844});
    const mobile=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
    assert.ok(mobile.scroll<=mobile.width,'A página móvel deve conter o overflow somente na tabela');
    await page.locator('#company-acate').check();assert.equal(await page.locator('#company-empty').isVisible(),false);
    assert.deepEqual(errors,[]);assert.deepEqual(violations,[],'A tela deve carregar sem violações do CSP');
  } finally { await browser?.close();server.kill(); }
});

test('Estado vazio Figma: filtros, ausência completa de paginação, limpeza e restauração', {skip:!browserModule,timeout:60000}, async()=>{
  const {chromium}=require(browserModule);
  const port=4202,base='http://127.0.0.1:'+port;
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
    const empty=f.locator('#company-empty'),pagination=f.locator('#company-pagination');
    const clear=f.getByRole('button',{name:'Limpar Filtros',exact:true});
    const search=f.locator('#company-search'),status=f.locator('#company-status'),size=f.locator('#company-size'),acate=f.locator('#company-acate');
    await f.locator('#company-table-body tr').first().waitFor();
    async function assertEmpty(){
      assert.equal(await empty.isVisible(),true);
      assert.equal(await f.getByRole('heading',{name:'Nenhum resultado encontrado',exact:true}).isVisible(),true);
      assert.ok((await empty.innerText()).includes('Tente ajustar os filtros ou limpar o termo de busca.'));
      assert.equal(await f.locator('.admin-companies__table-wrap').isVisible(),false);
      assert.equal(await f.getByRole('table').count(),0);
      assert.equal(await f.locator('#company-result-count').isVisible(),false);
      assert.equal(await pagination.isVisible(),false);
      assert.equal(await pagination.locator('button').count(),0);
      assert.equal(await f.getByRole('navigation',{name:'Paginação de empresas',exact:true}).count(),0);
      const layout=await pagination.evaluate(el=>({rects:el.getClientRects().length,height:el.offsetHeight,display:getComputedStyle(el).display}));
      assert.deepEqual(layout,{rects:0,height:0,display:'none'});
      assert.equal(await pagination.evaluate(el=>el.contains(document.activeElement)),false);
    }
    async function assertRestored(){
      assert.equal(await empty.isVisible(),false);
      assert.equal(await f.locator('.admin-companies__table-wrap').isVisible(),true);
      assert.equal(await f.locator('#company-table-body tr').count(),7);
      assert.equal(await pagination.isVisible(),true);
      assert.equal(await pagination.locator('[aria-current="page"]').innerText(),'1');
      assert.equal(await f.locator('.pagination__info').innerText(),'de 2');
      assert.equal(await f.locator('#company-result-count').innerText(),'Exibindo 14 empresas');
      assert.equal(await search.inputValue(),'');assert.equal(await status.inputValue(),'');assert.equal(await size.inputValue(),'');assert.equal(await acate.isChecked(),false);
      assert.equal(await f.locator('.admin-companies__search-icon').isVisible(),true);
      assert.equal(await f.getByRole('button',{name:'Limpar busca',exact:true}).isVisible(),false);
    }
    await assertRestored();
    await f.getByRole('button',{name:'Próxima página',exact:true}).click();
    await search.fill('nenhuma-correspondencia');await assertEmpty();
    assert.equal(await search.inputValue(),'nenhuma-correspondencia');
    assert.equal(await search.evaluate(el=>el===document.activeElement),true);
    await clear.click();await assertRestored();
    assert.equal(await search.evaluate(el=>el===document.activeElement),true);

    // Isolate status and size contributions using combinations absent from the fixed demo data.
    await size.selectOption('Grande');await status.selectOption('Recusada');await assertEmpty();
    assert.equal(await status.inputValue(),'Recusada');assert.equal(await size.inputValue(),'Grande');
    await clear.click();await assertRestored();
    await status.selectOption('Solicitação');await size.selectOption('Microempresa');await assertEmpty();
    await clear.click();await assertRestored();
    await status.selectOption('Inativada');await acate.check();await assertEmpty();
    await clear.click();await assertRestored();

    await search.fill('zzzz');await status.selectOption('Recusada');await size.selectOption('Grande');await acate.check();await assertEmpty();
    await acate.focus();await page.keyboard.press('Tab');
    assert.equal(await clear.evaluate(el=>el===document.activeElement),true,'Nenhum controle oculto da tabela/paginação deve entrar na ordem de Tab');
    assert.ok(await clear.evaluate(el=>getComputedStyle(el).outlineStyle!=='none'));
    await clear.press('Enter');await assertRestored();
    // Resume filtering and return naturally to results without using the clear-all button.
    await search.fill('InovaTech');assert.equal(await f.locator('#company-table-body tr').count(),1);
    assert.equal(await f.locator('.pagination__info').innerText(),'de 1');
    await search.fill('inexistente');await assertEmpty();
    await search.fill('InovaTech');assert.equal(await empty.isVisible(),false);assert.equal(await pagination.isVisible(),true);
    // A status decision can remove the only filtered row; focus must land on a visible control.
    await status.selectOption('Aprovada');await f.locator('[data-company-toggle="inovatech"]').click();await f.locator('#company-deactivate-submit').click();await assertEmpty();
    assert.equal(await clear.evaluate(el=>el===document.activeElement),true);
    await clear.click();await assertRestored();

    await page.setViewportSize({width:390,height:844});await search.fill('nenhuma-correspondencia');await assertEmpty();
    const bounds=await empty.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390);
    assert.equal(await empty.locator('img').evaluate(el=>el.complete&&el.naturalWidth>0),true);
    await clear.click();await assertRestored();
    assert.deepEqual(errors,[]);assert.deepEqual(violations,[]);
  }finally{await browser?.close();server.kill();}
});

