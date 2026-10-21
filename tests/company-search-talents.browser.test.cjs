"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');

const browserModule = process.env.SCTEC_PLAYWRIGHT_PATH;

test('Empresa: busca, filtros, ordenação, perfil lateral e cabeçalho compartilhado', { skip: !browserModule, timeout: 60000 }, async () => {
  const { chromium } = require(browserModule);
  const port = 4205;
  const base = 'http://127.0.0.1:' + port;
  const server = spawn(process.execPath, ['server.cjs'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: String(port) }
  });
  let browser;
  try {
    for (let index = 0; index < 50; index += 1) {
      try { if ((await fetch(base)).ok) break; } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({
      headless: true,
      ...(process.env.SCTEC_CHROME_PATH ? { executablePath: process.env.SCTEC_CHROME_PATH } : {})
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    const errors = [];
    const violations = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => document.addEventListener('securitypolicyviolation', (event) => console.warn('CSP_TEST:' + event.blockedURI)));
    page.on('console', (message) => { if (message.text().startsWith('CSP_TEST:')) violations.push(message.text()); });

    await page.goto(base + '/viewer.html#/sctec/company/candidates');
    const frame = page.frameLocator('#sctec-content');
    const cards = frame.locator('.company-candidate');
    await cards.first().waitFor();
    assert.equal(await cards.count(), 5);
    assert.equal(await frame.locator('#company-results-summary').innerText(), 'Exibindo 10 de 10 talentos');
    assert.equal(await frame.locator('[aria-current="page"]').innerText(), '1');

    await frame.getByRole('button', { name: 'Trilha SCTEC' }).click();
    await frame.getByLabel('Desenvolvimento de Software', { exact: true }).check();
    await frame.getByRole('button', { name: 'Nível de Inglês' }).click();
    await frame.getByLabel('Avançado', { exact: true }).check();
    assert.equal(await frame.locator('#company-results-summary').innerText(), 'Exibindo 1 de 10 talentos');
    assert.ok((await cards.first().innerText()).includes('Rafael Gomes'));

    await frame.locator('#company-talent-search').fill('resultado inexistente');
    assert.equal(await frame.getByRole('heading', { name: 'Nenhum resultado encontrado' }).isVisible(), true);
    assert.equal(await frame.locator('#company-talent-pagination').isVisible(), false);
    await frame.getByRole('button', { name: 'Limpar Filtros' }).click();
    assert.equal(await frame.locator('#company-talent-search').inputValue(), '');
    assert.equal(await frame.locator('#company-results-summary').innerText(), 'Exibindo 10 de 10 talentos');

    const sortTrigger = frame.locator('#company-sort-trigger');
    await sortTrigger.click();
    assert.equal(await frame.getByRole('menuitemradio').allTextContents().then((items) => items.join('|')), 'Mais relevantes|Nome (A–Z)|Nome (Z–A)');
    await frame.getByRole('menuitemradio', { name: 'Nome (A–Z)' }).click();
    assert.ok((await cards.first().innerText()).includes('Alice Silveira Santos'));
    assert.equal(await frame.locator('#company-sort-label').innerText(), 'Nome (A–Z)');

    await frame.getByRole('button', { name: 'Cidade' }).click();
    await frame.getByLabel('Florianópolis', { exact: true }).check();
    await page.keyboard.press('Escape');
    await sortTrigger.click();
    await frame.getByRole('menuitemradio', { name: 'Nome (Z–A)' }).click();
    assert.ok((await cards.first().innerText()).includes('Rafael Gomes'));
    assert.equal(await frame.getByLabel('Florianópolis', { exact: true }).isChecked(), true);

    await sortTrigger.click();
    await frame.getByRole('menuitemradio', { name: 'Mais relevantes' }).click();
    await frame.getByRole('button', { name: 'Limpar todos' }).click();

    await frame.getByRole('button', { name: 'Próxima página' }).click();
    assert.equal(await frame.locator('[aria-current="page"]').innerText(), '2');
    await frame.locator('#company-talent-search').fill('João');
    assert.equal(await frame.locator('[aria-current="page"]').count(), 0);
    assert.ok((await cards.first().innerText()).includes('João Silva'));

    const joaoCard = cards.first();
    await joaoCard.click();
    const dialog = frame.locator('#candidate-profile-dialog');
    assert.equal(await dialog.isVisible(), true);
    assert.equal(await frame.locator('#candidate-profile-title').innerText(), 'João Silva');
    assert.equal(await dialog.getByRole('heading', { name: 'Competências Técnicas' }).isVisible(), true);
    assert.equal(await dialog.getByRole('heading', { name: 'Vídeo de apresentação' }).isVisible(), true);
    assert.ok((await dialog.innerText()).includes('Java'));
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(), false);
    assert.equal(await joaoCard.evaluate((element) => element === document.activeElement), true);

    await frame.locator('#company-talent-search').fill('Diana');
    await cards.first().click();
    assert.equal(await frame.locator('#candidate-profile-title').innerText(), 'Diana Santos');
    assert.ok((await dialog.innerText()).includes('Analista de Dados'));
    assert.equal(await dialog.getByRole('heading', { name: 'Vídeo de apresentação' }).count(), 0);
    await frame.getByRole('button', { name: 'Fechar perfil do talento' }).click();

    await page.setViewportSize({ width: 390, height: 844 });
    const layout = await frame.locator('.company-search').evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth
    }));
    assert.ok(layout.document <= layout.viewport);
    await cards.first().click();
    const modalLayout = await dialog.evaluate((element) => ({
      width: element.getBoundingClientRect().width,
      viewport: document.documentElement.clientWidth,
      scrollWidth: element.scrollWidth
    }));
    assert.ok(modalLayout.width <= modalLayout.viewport);
    assert.ok(modalLayout.scrollWidth <= modalLayout.viewport);
    await page.keyboard.press('Escape');

    assert.deepEqual(errors, []);
    assert.deepEqual(violations, []);

    await page.goto(base + '/viewer.html#/sctec/company/profile');
    const profileFrame = page.frameLocator('#sctec-content');
    await profileFrame.locator('.company-header').waitFor();
    assert.equal(await profileFrame.locator('.company-header__brand strong').innerText(), 'SCTEC');
    assert.equal(await profileFrame.locator('.company-header__brand span').innerText(), 'Portal de Talentos');
    assert.equal(await profileFrame.locator('.navbar-painel__company-name').innerText(), 'TechCorp Soluções Ltda.');
    assert.equal(await profileFrame.locator('#avatar-toggle').innerText(), 'TC');
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    server.kill();
  }
});
