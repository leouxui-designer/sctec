"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {spawn} = require('node:child_process');
const browserModule = process.env.SCTEC_PLAYWRIGHT_PATH;
test('Solicitações de empresas: revisão, seleção, cancelamento, decisões, teclado, mobile e CSP', {skip:!browserModule,timeout:60000}, async () => {
  const {chromium} = require(browserModule);
  const port=4200, base='http://127.0.0.1:'+port;
  const server=spawn(process.execPath,['server.cjs'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port)}});
  let browser;
  try {
    for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
    browser=await chromium.launch({headless:true,...(process.env.SCTEC_CHROME_PATH?{executablePath:process.env.SCTEC_CHROME_PATH}:{})});
    const page=await browser.newPage({viewport:{width:1440,height:960}});
    const errors=[],violations=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>document.addEventListener('securitypolicyviolation',event=>console.warn('CSP_TEST:'+event.blockedURI)));
    page.on('console',message=>{if(message.text().startsWith('CSP_TEST:'))violations.push(message.text());});
    const f=page.frameLocator('#sctec-content');
    const review=f.locator('#company-review'), confirmation=f.locator('#company-confirm');
    const company=id=>f.locator('[data-company-row="'+id+'"]');
    const open=async id=>{await company(id).locator('.admin-company__request').click();assert.equal(await review.isVisible(),true);};
    const reset=async()=>{await page.goto(base+'/viewer.html#/sctec/admin/companies');await page.reload();await company('techcorp').waitFor();};
    const noAcate=async()=>{await f.locator('#company-review-acate').uncheck();};
    const notes=f.locator('#company-review-notes');
    const state=async id=>page.frames().find(frame=>frame.url().endsWith('/admin-empresas.html')).evaluate(id=>JSON.parse(JSON.stringify(companies.find(c=>c.id===id))),id);
    await reset();

    // Single review and close: no table mutations, focus returns to the originating action.
    await open('techcorp');assert.ok((await review.innerText()).includes('TechCorp Soluções'));
    await noAcate();assert.equal(await review.getAttribute('data-figma-node'),'101513:9955');
    await notes.fill('Rascunho não confirmado');
    assert.equal(await review.evaluate(el=>el.contains(document.activeElement)),true);
    await review.getByRole('button',{name:'Fechar revisão de solicitações',exact:true}).click();
    assert.equal(await review.isVisible(),false);assert.ok((await company('techcorp').innerText()).includes('Solicitado em 28/09/26'));
    assert.equal(await company('techcorp').locator('button').evaluate(el=>el===document.activeElement),true);
    assert.equal((await state('techcorp')).review,undefined);

    // Alternative ACATE state and Escape, including a resubmission.
    await open('cloudsc');assert.equal(await review.getAttribute('data-figma-node'),'101981:23961');
    assert.ok((await review.innerText()).includes('Ressolicitado em 28/09/26'));
    await review.getByRole('button',{name:'Enviar para aprovação',exact:true}).click();
    assert.equal(await confirmation.getAttribute('data-figma-node'),'101981:24168');
    await confirmation.getByRole('button',{name:'Cancelar',exact:true}).click();assert.equal(await review.isVisible(),true);
    await review.getByRole('button',{name:'Enviar para aprovação',exact:true}).click();
    await confirmation.getByRole('button',{name:'Enviar para aprovação',exact:true}).click();
    assert.equal(await review.isVisible(),false);assert.ok((await company('cloudsc').innerText()).includes('Aguardando aprovação da ACATE'));
    assert.ok((await f.locator('#toast').innerText()).includes('Envio simulado'));
    await reset();
    await open('techcorp');
    await page.mouse.click(20,300);
    assert.equal(await review.isVisible(),false);
    assert.equal((await state('techcorp')).status,'Solicitação');

    // Approval and cancellation preserve draft notes, then commit exactly once.
    await open('techcorp');await noAcate();await notes.fill('Cadastro conferido');
    await review.getByRole('button',{name:'Aprovar',exact:true}).click();
    assert.equal(await confirmation.getAttribute('data-figma-node'),'101981:24128');
    await confirmation.getByRole('button',{name:'Cancelar',exact:true}).click();
    assert.equal(await notes.inputValue(),'Cadastro conferido');assert.equal(await review.isVisible(),true);
    assert.equal((await state('techcorp')).status,'Solicitação');
    await review.getByRole('button',{name:'Aprovar',exact:true}).click();
    await confirmation.getByRole('button',{name:'Confirmar aprovação',exact:true}).click();
    assert.equal(await review.isVisible(),false);assert.equal((await state('techcorp')).status,'Aprovada');
    assert.equal((await state('techcorp')).review.notes,'Cadastro conferido');
    assert.equal((await state('techcorp')).acate,'Não');
    assert.ok((await f.locator('#toast').innerText()).includes('Empresa aprovada'));
    await reset();

    // Single rejection: cancel and confirm are distinct.
    await open('techcorp');await noAcate();await notes.fill('Conferência da solicitação');
    await review.getByRole('button',{name:'Recusar',exact:true}).click();
    assert.equal(await confirmation.getAttribute('data-figma-node'),'101981:24148');
    await confirmation.getByRole('button',{name:'Cancelar',exact:true}).click();assert.equal((await state('techcorp')).status,'Solicitação');
    await review.getByRole('button',{name:'Recusar',exact:true}).click();
    await confirmation.getByRole('button',{name:'Confirmar recusa',exact:true}).click();
    assert.equal((await state('techcorp')).status,'Recusada');assert.ok((await company('techcorp').innerText()).includes('Recusada'));
    assert.ok((await f.locator('#toast').innerText()).includes('Empresa recusada'));
    await reset();

    // Explicit multiple-request sample: no default choice; either person can be chosen.
    await open('datasoft');assert.equal(await review.getAttribute('data-figma-node'),'101337:9077');
    assert.equal(await review.locator('input[type=radio]').count(),2);assert.equal(await review.locator('input[type=radio]:checked').count(),0);
    assert.equal(await review.getByRole('button',{name:'Aprovar selecionado',exact:true}).isDisabled(),true);
    await notes.fill('Escolha preservada durante a confirmação');
    await review.getByRole('radio',{name:'Selecionar Juliana Martins',exact:true}).check();
    assert.equal(await review.getAttribute('data-figma-node'),'101346:13905');assert.equal(await review.locator('.company-request-card--selected').count(),1);
    await review.getByRole('radio',{name:'Selecionar Patrícia Mendes',exact:true}).check();
    await review.getByRole('button',{name:'Aprovar selecionado',exact:true}).click();
    await page.keyboard.press('Escape');assert.equal(await confirmation.isVisible(),false);assert.equal(await review.isVisible(),true);
    assert.equal(await review.getByRole('radio',{name:'Selecionar Patrícia Mendes',exact:true}).isChecked(),true);assert.equal(await notes.inputValue(),'Escolha preservada durante a confirmação');
    await review.getByRole('button',{name:'Aprovar selecionado',exact:true}).click();
    await confirmation.getByRole('button',{name:'Confirmar aprovação',exact:true}).click();
    assert.equal((await state('datasoft')).responsible,'Patrícia Mendes');
    assert.deepEqual((await state('datasoft')).review.requests.map(r=>r.decision),['Recusada','Aprovada']);
    await reset();

    // Reject all without choosing a person: use the multiple-request confirmation.
    await open('datasoft');await review.getByRole('button',{name:'Recusar',exact:true}).click();
    assert.equal(await confirmation.getAttribute('data-figma-node'),'101982:24394');
    assert.ok((await confirmation.innerText()).includes('todas as solicitações serão recusadas'));
    await confirmation.getByRole('button',{name:'Cancelar',exact:true}).click();assert.equal(await review.locator('input:checked').count(),0);
    await review.getByRole('button',{name:'Recusar',exact:true}).click();
    await confirmation.getByRole('button',{name:'Confirmar recusa',exact:true}).click();
    assert.deepEqual((await state('datasoft')).review.requests.map(r=>r.decision),['Recusada','Recusada']);
    await reset();

    // Filtering after a confirmed decision removes the row without showing false empty state.
    await f.locator('#company-status').selectOption('Solicitação');await open('datasoft');
    await review.getByRole('radio',{name:'Selecionar Juliana Martins',exact:true}).check();
    await review.getByRole('button',{name:'Aprovar selecionado',exact:true}).click();
    await confirmation.getByRole('button',{name:'Confirmar aprovação',exact:true}).click();
    assert.equal(await company('datasoft').count(),0);assert.equal(await f.locator('#company-status').inputValue(),'Solicitação');
    assert.equal(await f.locator('#company-empty').isVisible(),false);
    await f.locator('#company-status').selectOption('');await f.getByRole('button',{name:'Próxima página',exact:true}).click();
    assert.equal(await f.locator('[aria-current=page]').innerText(),'2');
    await reset();

    // Native dialog focus containment and mobile reachability.
    await open('datasoft');
    await review.getByRole('button',{name:'Fechar revisão de solicitações',exact:true}).focus();
    await page.keyboard.press('Shift+Tab');assert.equal(await review.evaluate(el=>el.contains(document.activeElement)),true);
    for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.equal(await review.evaluate(el=>el.contains(document.activeElement)),true);}
    await page.keyboard.press('Escape');assert.equal(await review.isVisible(),false);
    await page.setViewportSize({width:390,height:844});await open('datasoft');
    const bounds=await review.boundingBox();assert.ok(bounds.width<=390&&bounds.height<=844);
    await notes.fill('Teste móvel');await notes.scrollIntoViewIfNeeded();
    await review.getByRole('radio',{name:'Selecionar Juliana Martins',exact:true}).check();
    await review.getByRole('button',{name:'Aprovar selecionado',exact:true}).click();
    const cb=await confirmation.boundingBox();assert.ok(cb.x>=0&&cb.x+cb.width<=390);
    await confirmation.getByRole('button',{name:'Cancelar',exact:true}).click();
    await page.keyboard.press('Escape');assert.equal(await review.isVisible(),false);
    assert.deepEqual(errors,[]);assert.deepEqual(violations,[]);
  } finally {await browser?.close();server.kill();}
});
