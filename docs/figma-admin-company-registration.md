# Cadastro administrativo de empresa — implementação local

Referências: arquivo XFiHsQxBDhyWUulxgjZOHD; vazio 101118:11239, parcial 101704:26966 e erros 101750:26291. Overlays confirmados: responsável 101795:17347, canal 101795:15057, opções de canal 101795:15174 e cidades 101797:14503.

## Implementação
A página existente mantém o shell administrativo e as rotas. CSS e JavaScript externos exclusivos implementam seções, campos, tags, upload local, overlays e feedback. O formulário inicia vazio; dados digitados permanecem após validação. Não existe persistência ou envio de credenciais.

Obrigatórios: nome fantasia, razão social, CNPJ, segmento, porte, cidade, associação à ACATE, nome/cargo/e-mail/telefone do responsável. CNPJ verifica 14 dígitos e duplicidade somente nos identificadores demonstrativos existentes; não valida registro oficial nem dígitos verificadores. E-mail verifica sintaxe e duplicidade demonstrativa. Telefone aceita 10 ou 11 dígitos. Logo opcional aceita JPEG/PNG até 5 MiB. Sobre, notas, competências e canais permanecem opcionais no cadastro; a exigência de canal se refere à publicação, fora desta etapa.

Erros aparecem após tentativa, usam aria-invalid/aria-describedby, mantêm dados e focam o primeiro campo inválido. Overlays usam dialog nativo, foco contido, Escape e retorno ao acionador.

## Notas flutuantes
Desktop acima de 1200 px: fixed no viewport do iframe, largura 344 px, direita 40 px, topo min(250px,26.05vh), altura limitada ao viewport e rolagem própria. O formulário reserva 368 px para impedir sobreposição. Até 1200 px: painel estático após os contatos. A ordem DOM preserva navegação por teclado.

Na porta 4185, viewport 1440x960: antes/depois de scrollY=650, painel x=1056,y=250,width=344,height=322, sem deslocamento. Capturas docs/company-registration-before-scroll.png e docs/company-registration-after-scroll.png. Outras capturas: errors, partial e mobile no mesmo diretório.

## Decisões e pontos para validação
- O parcial duplica Anotações: mantido um painel, conforme requisito explícito de flutuação.
- O frame de erro omite seções opcionais: mantidas para não apagar conteúdo preenchido.
- Valores de exemplo do Figma não são dados iniciais nem geram erro automaticamente.
- Segmento tem somente Tecnologia / SaaS confirmado; cidades usam as opções verificadas. Catálogos completos precisam ser fornecidos/confirmados.
- Porte reutiliza os quatro tamanhos existentes. Associação não cria campos condicionais sem evidência.
- Canal implementa o tipo confirmado; URL e campos dependentes não foram inventados. Suporte apresenta aviso local, pois destino não foi confirmado.
- Duplicidade usa snapshot dos 14 registros demonstrativos; não é validação cadastral real.
- Selects nativos preservam teclado, com aparência fechada alinhada; menus abertos variam conforme navegador/SO.
- Botão primário usa verde escuro com texto branco para contraste, diferindo do gradiente claro da referência.
- A landing carregada transitoriamente pelo viewer pode registrar bloqueio CSP preexistente do Google Fonts. A tela de cadastro não solicita essa fonte e passou na checagem de CSP própria; nenhuma política foi alterada.

## Validação
npm test: 10/10 passaram, sem skips, incluindo Chrome/Playwright. Cadastro testado no viewer e standalone, desktop/mobile, obrigatório/correção/duplicidade, dados preservados, opcionais, notas fixas, ausência de overflow horizontal, logo, overlays, Escape, salvar/cancelar e navegação. Nenhum erro JavaScript ou violação CSP na tela alterada.
npm run check e npm run build passaram; node --check js/admin-empresa-cadastro.js passou.
Revisão visual das capturas desktop/mobile realizada; não constitui auditoria WCAG completa nem equivalência pixel a pixel.

## Arquivos desta etapa
pages/admin-empresa-cadastro.html
css/admin-empresa-cadastro.css
js/admin-empresa-cadastro.js
assets/admin-figma/RegistrationLogoPlaceholder.png
assets/admin-figma/RegistrationBack.svg
tests/admin-company-registration.browser.test.cjs
docs/figma-admin-company-registration.md
docs/company-registration-{before-scroll,after-scroll,errors,partial,mobile}.png

Sem alterações no shell compartilhado, manifesto, configuração, backend ou outras telas. Sem commit/push/deploy. O repositório já estava com arquivos não rastreados; git diff não fornece comparação com uma base versionada.
