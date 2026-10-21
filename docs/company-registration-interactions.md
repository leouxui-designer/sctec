# Cadastro de empresa — interações completas

Esta etapa complementa docs/figma-admin-company-registration.md e substitui suas limitações anteriores sobre suporte, canais, logo e feedback de sucesso.

## Referências verificadas no Figma
Arquivo XFiHsQxBDhyWUulxgjZOHD, somente leitura:
- 101795:15174: seis opções, menu 368x236.
- 101795:15274: LinkedIn com Link obrigatório, modal 400x384.
- 101795:15204: Outro com Nome de canal, contador 0/50 e Link, modal 400x462.
- 101750:12854: confirmação Você realmente deseja sair?, 308x224, Voltar e Confirmar Cancelamento.
- 101750:12881: sucesso, 475x260, ícone checkmark-circle-02, Voltar para Gestão de Empresas e Cadastrar outra empresa.
Contexto de design, screenshots e reações foram consultados. Os botões dos dois últimos nós não possuem destinos de protótipo configurados. Retornar à listagem e iniciar outro cadastro são interpretações dos rótulos, preservando a rota existente. Escape no sucesso retorna à listagem; Escape no descarte mantém o rascunho.

## Interações
Suporte abre https://wa.me/554832395845 com a mensagem integral solicitada codificada por encodeURIComponent, em nova aba com noopener,noreferrer. Não envia mensagem. Teste intercepta esse endereço localmente, sem acionar o serviço real.

Adicionar canal sempre abre vazio. Tipo selecionado revela Link, obrigatório com URL HTTPS; Outro revela também Nome de canal, obrigatório até 50 caracteres e contador. Campos ocultos são desabilitados e não entram nos dados salvos. Durante a sessão aberta, trocar tipos preserva os valores para retorno, limpando erros antigos. Salvar fica desabilitado até os dados serem válidos. Canais são acumulados em memória com rótulo e link seguro; duplicação de mesmo rótulo e URL normalizada é impedida. Não havia controles de edição/remoção na implementação anterior; nenhum fluxo adicional foi inventado.

Logo usa FileReader/data URL, sem upload remoto ou object URLs. Aceita a validação JPEG/PNG até 5 MiB existente. Após selecionar: Alterar e Remover. Remover limpa input/prévia/erro e restaura placeholder. A versão da leitura evita que um FileReader antigo substitua uma imagem mais recente/removida.

A confirmação compara valores significativos com o estado inicial: campos, notas, logo aceita, canais salvos, responsáveis adicionais e tags selecionadas. Busca de tags e tentativas inválidas não sujam o formulário. Reverter as alterações restaura o estado limpo. Links internos usam captura antes do shell compartilhado; cancelar preserva dados e descartar permite a navegação. O viewer verifica um callback opcional do documento de mesma origem antes de substituir o iframe. Validações de rotas, origens, protocolo v1 e respostas permanecem; solicitações canceladas retornam FAILED ao host autorizado. Nenhum outro componente do shell foi alterado.

Mudanças de hash/rota usam o modal personalizado. Travessia de histórico que restaura documento do iframe, recarregamento, fechamento e saída externa dependem de beforeunload nativo; o navegador decide a apresentação e o texto, condicionado a interação prévia. Não existe garantia de modal customizado em toda navegação do browser. Alterações no histórico canceladas por hash são restauradas à rota atual por replaceState; não há reconstrução completa da pilha de histórico.

Submissão preserva validações e valores; quando válida, desabilita novo envio e abre sucesso, sem temporizador de redirecionamento. Texto Figma é acompanhado de aviso explícito de simulação: nenhuma empresa criada/e-mail enviado. Esse aviso aumenta a altura do modal em relação aos 260 px da referência. Voltar retorna à listagem; Cadastrar outra empresa recarrega somente o documento do cadastro, em branco.

## Acessibilidade e apresentação
Dialog nativo bloqueia interação de fundo, com título/descrição, foco inicial, contenção de Tab/Shift+Tab, Escape e retorno ao acionador quando permanece na tela. Mobile adapta largura/ações. Verde escuro de botões e menus nativos de select preservam decisões da etapa anterior; não equivalem pixel a pixel ao gradiente/menu Figma. Nenhuma política CSP foi alterada; sem script/handler inline, eval, dependência nova ou backend.

## Testes e evidências
- npm run check e npm run build: aprovados.
- node --check js/admin-empresa-cadastro.js: aprovado.
- Testes Playwright específicos do cadastro: aprovados.
- npm test padrão paralelo: apresentou falhas intermitentes em testes anteriores da listagem/solicitações, por CSP da landing transitória (Google Fonts e componentes), não na tela alterada. Não foram removidas as verificações nem modificada a landing.
- npm test -- --test-concurrency=1: 11/11 aprovados, sem skips.
- Chrome desktop/mobile: URL WhatsApp completa e opener nulo, seis tipos, campos condicionais, contador/limite, HTTP/javascript inválidos, múltiplos canais, duplicidade, troca de tipo, rascunho limpo/sujo, continuar/descartar, rota do viewer, aviso nativo de reload/back, erros/submissão, logo trocar/remover, teclado e foco, ausência de overflow. Sem erros JavaScript ou violações CSP no cadastro.
- Porta exata 4185: notas x1056,y250,w344,h322 antes/depois de rolar 650 px; ícone de sucesso carregado e renderizado 32x32; modal mobile x16,w358 em viewport390; Escape retorna à listagem.
- Capturas em docs/company-registration-channel-{initial,linkedin,other,mobile}.png, company-registration-leave.png, company-registration-success.png e company-registration-success-mobile.png. Capturas anteriores de rolagem/estados foram atualizadas pelo teste de regressão. Revisão visual realizada; não é certificação WCAG completa.

## Arquivos desta etapa
- pages/admin-empresa-cadastro.html
- css/admin-empresa-cadastro.css
- js/admin-empresa-cadastro.js
- viewer.js (callback opcional antes de substituir iframe)
- assets/admin-figma/RegistrationSuccess.svg (asset do Figma, 1086 bytes)
- tests/admin-company-registration.browser.test.cjs (adaptado aos novos fluxos)
- tests/admin-company-registration-interactions.browser.test.cjs
- docs/company-registration-interactions.md e capturas citadas.

Git status/diff revisados: checkout já estava com arquivos não rastreados, sem base versionada útil para diff. Nenhum arquivo existente foi apagado. Sem alterações no Design Hub, original SCTEC, backend, CSP, manifesto ou configuração. Sem commit, push, merge ou deploy.

URL: http://127.0.0.1:4185/viewer.html#/sctec/admin/company-create
