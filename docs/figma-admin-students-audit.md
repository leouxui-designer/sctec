# Auditoria Figma — Banco de Talentos e importação de estudantes por planilha

## 1. Cabeçalho
- Arquivo Figma: `XFiHsQxBDhyWUulxgjZOHD`. Data: 2026-10-16. Auditoria somente leitura: o Figma e o código do protótipo não foram alterados.
- Escopo: listagem do Banco de Talentos e fluxo "Via Planilha" (método, modelo, upload, arquivo selecionado, resultados), mais dois modais secundários (redefinir senha e inativar). Fora do escopo: cadastro manual (`pages/admin-aluno-cadastro.html`, nenhum nó fornecido), edição de aluno e telas de 390 px (nenhum quadro mobile fornecido).
- Método: Figma MCP somente leitura (`get_metadata`, `get_screenshot`, `get_design_context`, `get_variable_defs`, `get_motion_context`), sempre por `nodeId`. A implementação foi renderizada no Chrome (Playwright) nas páginas isoladas (`/pages/admin-alunos.html`) a 1440×960 e 390×844, com `getBoundingClientRect` e `getComputedStyle`. Cores e larguras de texto do Figma foram amostradas dos PNGs exportados. Cada divergência visual foi conferida olhando as capturas do Figma e da implementação (lado a lado nos diálogos; em sequência nas telas inteiras).
- Resumo: 25 divergências visuais (0 alta, 8 média, 17 baixa), 13 funcionais (2 alta, 7 média, 4 baixa) e 11 decisões em aberto.
- Limites: conexões de protótipo (reactions) não verificáveis e sem auditoria WCAG (seção 9).

## 2. Nós inspecionados
| Nó | Nome no Figma | Tamanho | Papel no fluxo | Implementação |
|---|---|---|---|---|
| `101118:11517` | Banco de Talentos - Admin | 1440×960 | Listagem de estudantes | `pages/admin-alunos.html`, `css/admin-alunos.css`, `js/admin-alunos.js` (`#student-*`) |
| `101239:17730` | Modal - Como você deseja cadastrar? | 420×264 | Escolha do método | `#student-registration-method`, painel `method` |
| `101242:18482` | Importar via Planilha - Baixar modelo | 400×302 | Etapa 1 | painel `template`, `#student-import-template-download` |
| `101242:18605` | Importar via Planilha - Upload de arquivo | 400×316 | Etapa 2, dropzone vazia | painel `upload`, `#student-import-dropzone` |
| `101242:18741` | Importar via Planilha - Enviar planilha | 400×316 | Etapa 2, arquivo selecionado | painel `upload` (`#student-import-file-summary`); o painel `review` não tem contraparte |
| `101248:19004` | Cadastrar Estudante - Dados importados - Todos | 1440×960 | Verificação dos dados | `#student-import-results` (dentro de `main`) |
| `101239:16938` (secundário) | Modal - Redefinir senha do usuário? | 308×248 | Confirmação na listagem | `#student-reset-dialog` |
| `101239:17060` (secundário) | Modal - Inativar usuário? | 308×272 | Confirmação na listagem | `#student-deactivate-dialog` |

## 3. Requisitos de design confirmados
Textos lidos do `get_design_context`, medidas do `get_metadata`, tokens do `get_variable_defs` (consultado em `101118:11517`, `101242:18741` e `101248:19004`; `schemes/primary` `#669e2e`, `outline` `#d4d4d4`, `background variant light` `#f8f9fb`, `on background` `#171717`, `on background variant light` `#737373`). Fontes: Montserrat Bold nos títulos de modal, Roboto no restante, Inter nos números das etapas e na dropzone. Botões primários: gradiente `#2ca942 → #55b13a → #52b934` (ângulo de 110° a 128°, calculado por botão).

Conexões do protótipo: **não verificáveis**. `get_metadata`, `get_design_context` e `get_variable_defs` não expõem `reactions`; `get_motion_context` não retornou animações em `101239:17730` (recursivo). A leitura por Plugin API (`use_figma`) é ferramenta de escrita e ficou vetada. O código de referência renderiza como `<a>` o "Manual" (`101239:17765`), o "Importar Estudante" (dentro de `101242:18741`) e a aba "Com erro" (dentro de `101250:20317`) e como `<button>` o "Via Planilha" (`101239:17751`) e a célula de erro (`101250:20120`); isso não identifica destinos e não foi tratado como evidência de navegação.

**`101118:11517` Listagem**
- Main `101166:3517`: x256 y80, 1184×880, fundo `#f8f9fb`, padding 32/40, gap 24. Navbar `101166:3724` e sidebar `101329:10828` são do shell compartilhado (fora do escopo).
- Título "Banco de Talentos" (Roboto Bold 30/30, tracking −0,75 px) e "Gerencie os estudantes com acesso ao Portal de Talentos" (Roboto 16/24, `#737373`). Botão "Cadastrar Estudante": 36 px, padding-x 10, gap 6, raio 10, ícone de 16 px.
- Filtros `101271:20286`: cartão branco (raio 22, padding 20, sombra de duas camadas `#0000001a`) com três gatilhos de 42 px (546/241/241 px, gap 16): "Buscar por nome ou e-mail" (lupa), "Todos os status", "Todas as cidades" (chevron 24 px); borda 1 px, raio 10, texto Roboto 14 `#737373`.
- Contagem `101166:3530`: "Exibindo **1.247** estudantes" (Roboto 14, `#6b7280`, número em negrito).
- Tabela `101203:11560` (1104×434): ESTUDANTE (com ícone de ordenação), CIDADE, STATUS, AÇÕES com 308,33/308,33/308,33/177 px; cabeçalho 42 px, linhas 65 px, padding-x 24. Cabeçalho em caixa alta, 12 px Bold, `#171717` (larguras de tinta na captura: ESTUDANTE ≈67 px, descontado o ícone, CIDADE 41, STATUS 45; 12 px/700 mede 68/42/44 e 14 px mediria 79/49/52; o código de referência diz 14 px, mas a captura prevalece).
- Linhas (nome/cidade/status): João Silva/Florianópolis/Ativo; Maria Luísa Fernandes/Joinville/Ativo; Pedro Rodrigues/Blumenau/Aguardando acesso; Ana Beatriz Costa/Chapecó/Ativo; Lucas Martins/Criciúma/Ativo; Camila de Souza/Florianópolis/Inativo. Nome Roboto Bold 14/14; e-mail Roboto 14/19,25 `#737373`.
- Badges (raio 26, padding 2/10, Roboto Medium 14): Ativo `#00a63e` sobre `#00a63e0d`; Aguardando acesso `#f54900` sobre `#ca35000d`; Inativo `#404040` sobre `#0000000a`.
- Ações (36×36, raio 10, ícones de 20 px, gap 4): lápis, cadeado, switch 40×22 (ON `#669e2e`, OFF `#f0f0f0`). A linha "Aguardando acesso" mostra o switch ligado (amostra `#669e2e`). O componente tem variante Hover com tooltip (`#303030`, raio 16, texto 13 px "Editar") e, na descrição, as variantes Editar, Resetar Senha, Inativar e Remover.
- Rodapé `101337:8546`: cartão 1100×76 (raio 22) com a Paginação `101337:8545`, itens 36×36 (raio 10, borda `#d4d4d4`, gap 4), ativo em gradiente, "de 5" `#737373`. "1.247 estudantes", 6 linhas e "de 5" não fecham entre si (5 páginas de 6 linhas ≠ 1.247); tratados como amostra.

**`101239:17730` Método (420×264)**
- Borda 1 px `#d4d4d4`, raio 14. Cabeçalho 52 px: "Como você deseja cadastrar?" (Montserrat Bold 16/24, tracking −0,4 px) e fechar 36×36.
- Conteúdo 212 px (padding 8/16/16, gap 12): dois cartões 188×188 (borda 1 px, raio 14, padding 20, gap 12), ícone 52×52 (raio 12, `#f8f9fb`, glifo de 16 px), título Roboto Bold 16/16, descrição Roboto 14/20 `#737373`, tudo centralizado.
- Textos: "Via Planilha" / "Importe vários estudantes de uma vez com uma planilha"; "Manual" / "Preencha os dados de um estudante individualmente".

**`101242:18482` Baixar modelo (400×302)**
- Título "Importar via Planilha". Etapas (linha de 28 px): ① 28×28 `#669e2e`, número Inter SemiBold 12 branco, "Baixar modelo" Roboto Medium 14 `#171717`; conector 2 px `#d4d4d4`; ② 28×28 `#f8f9fb`, número e "Enviar planilha" `#737373`.
- Action Item 368×122 (borda 1 px, raio 14, padding 20, gap 16): ícone de download 24 px em caixa 52×52, "Baixar Modelo de Importação" (Roboto Bold 16/16) e "Siga o formato sugerido para evitar erros e otimizar sua experiência de importação." (Roboto 14/20 `#737373`).
- Rodapé 60 px (padding 16, gap 16, à direita): "Voltar" (36 px, borda `#d4d4d4`, texto `#669e2e`) e "Já tenho o arquivo preenchido" (36 px, gradiente).

**`101242:18605` Upload (400×316)**
- Etapas: ① círculo `#669e2e` com "✓" branco e rótulo `#669e2e`; conector `#669e2e`; ② círculo `#669e2e` com "2" branco e rótulo `#171717`.
- Dropzone vazia 368×136: borda 2 px tracejada `#d4d4d4`, raio 14, padding 24, gap 12; cloud-upload 32 px verde; "Clique ou arraste o arquivo" (Inter SemiBold 14) e "Formatos aceitos: .xlsx, .xls, .csv" (Inter 12 `#737373`). A documentação do componente (`101242:18510`) lista Empty, Hover, Processing e Done; só Empty e Done foram fornecidos.
- Rodapé: "Voltar" (36 px) e "Importar Estudantes" com opacidade 50% e 32 px de altura.

**`101242:18741` Arquivo selecionado (400×316)**
- Etapas: ✓ e ✓ (conector e rótulos `#669e2e`).
- Cartão 368×136 (borda 1,5 px `#d4d4d4`, raio 14, padding 24): linha em negrito "modelo_estudantes.xlsx · 24 KB" (Roboto Bold 14/20), abaixo "24 KB" (Roboto 12/16 `#737373`) e botão lixeira 32×32 com ícone verde `#669e2e`.
- Rodapé: "Voltar" e "Importar Estudante" (singular, 36 px, gradiente).

**`101248:19004` Dados importados — Todos (1440×960)**
- Main `101248:19005`: x255 y84, 1185×876, **fundo branco**, padding 32/40, gap 24 (a listagem está em x256 y80; provável desalinhamento do arquivo, não replicar). O PNG exportado saiu com 1498×989, maior que o quadro (causa não investigada).
- "Voltar para Banco de Talentos" `101248:19006` (230×32, ícone de retorno de 16 px, Roboto Medium 14 `#669e2e`); "Verificar Dados Importados" `101271:19381` (Roboto Bold 30/30, −0,75 px); 24 px entre os blocos.
- Seção `101250:20158` (borda 1 px, raio 14): cabeçalho de 80 px com "Dados Importados" (Roboto Bold 20/28, tracking −0,6 px, preto) e Error Tab `101250:20317` (226×48, fundo `#f8f9fb`, padding 4, raio 10): "Todos" ativo (branco, raio 8, sombra de duas camadas) com badge "8" (`#0000000a`, texto `#404040`) e "Com erro" com badge "1" (`#e62c2d` sobre `#e62c2d0d`); rótulos Roboto SemiBold 14/20, badges Roboto Medium 14.
- Tabela `101949:25355` (1103×432; cabeçalho 42, linhas 65, padding-x 24) com **14 colunas**, em px: Nome 190 (ordenação), CPF 144, E-mail 235 (ordenação), Data de Nascimento 170, Link do Termo de Aceite 188, Ciclo 166, Turma 118, Trilha 228, Curso 228, Trilha 228, Curso 228, Trilha 228, Curso 228, Ações 92 (soma 2671). Só as seis primeiras cabem no quadro; as demais estão além do recorte do nó (x 1093–2671). Cabeçalhos em caixa alta, ≈12 px Bold `#171717` (NOME: 33 px de tinta; 12 px/700 mede 34).
- Exemplo: 6 linhas visíveis (as mesmas seis pessoas da listagem), "Todos 8". Ciclo "2024 - 2º Semestre"; Turma "Carreira Tech"; Trilha/Curso: Desenvolvimento de Software/Desenvolvedor Back-End Node, Análise de Dados/Visualização de Dados e Business Intelligence, Inteligência Artificial/Machine Learning e Visão Computacional (iguais nas seis linhas e idênticos ao catálogo do cadastro manual implementado). Só a linha 2 tem Link do Termo. Único erro: e-mail "pedro.rodriguesemail.com" (célula `Type=error`: fundo `#e62c2d0d`, texto `#e62c2d` regular, ícone warning-circle de 20 px depois do texto). O mesmo CPF aparece nas linhas 2 e 3 sem sinalização.
- Coluna Ações: um botão visível por linha, o mesmo componente (`101211:4389`) do lápis "Editar" da listagem; as outras duas instâncias do slot estão ocultas.
- Paginação `101771:27589` ("1 2 3 de 5", mesmo componente da listagem) e CardFooter `101268:14255` (1105×60): "Cancelar" (36 px, borda `#d4d4d4`) e "Confirmar importação" (36 px, gradiente, **opacidade 50%**).

**Secundários.** `101239:16938`: "Redefinir senha do usuário?", corpo "Uma nova senha temporária será gerada e enviada para o e-mail de [Nome do usuário]. O acesso atual será invalidado imediatamente.", botões "Cancelar" e "Redefinir senha" (36 px, gradiente). `101239:17060`: "Inativar usuário?", corpo "[Nome do usuário] perderá o acesso à plataforma imediatamente. Os dados e histórico serão mantidos. Você poderá reativar o usuário a qualquer momento.", botões "Cancelar" e "Inativar usuário" (32 px, contorno e texto `#e62c2d`). Largura 308 px; corpo Roboto 16/24 `#737373`, padding 8/16/32.

## 4. Implementação atual
- Arquivos: `pages/admin-alunos.html` (listagem, `<dialog id="student-registration-method">` com painéis `data-import-panel` `method`, `template`, `upload`, `review`, e a seção `#student-import-results`), `css/admin-alunos.css`, `css/admin-alunos-a11y.css`, `css/admin-student-registration-method.css` (breakpoints 460 e 600 px; a listagem usa 900 e 600 px), `js/admin-alunos.js`, `js/admin-student-registration-method.js`.
- Listagem: 14 estudantes fictícios (6 por página, 3 páginas; os seis primeiros repetem o exemplo do Figma), busca por nome/e-mail, filtros de status (Ativo, Aguardando acesso, Inativo) e cidade (6 opções), contagem, estado vazio. Lápis → `admin-aluno-perfil.html`; cadeado → `#student-reset-dialog`; switch → `#student-deactivate-dialog` ao desligar, reativação direta com toast ao ligar; switch desabilitado em "Aguardando acesso".
- Importação: CTA → método → "Via Planilha" → modelo → upload (clique ou arraste; `.xlsx`, `.xls`, `.csv`) → revisão (nota de demonstração) → resultados (banner de demonstração, 8 linhas fixas, 6 por página, abas Todos 8 / Com erro 1). "Voltar" e "Cancelar" fecham os resultados e devolvem o foco ao CTA. "Confirmar importação" nunca habilita (`title`: "Corrija os registros com erro antes de confirmar"); o toast de sucesso existe no código, mas a interface não o alcança (clique forçado não faz nada).
- Dados: `mockImportRows` é constante e independe do arquivo (verificado com a fixture CSV e com um `.xlsx` de 24 KB: mesmas linhas). As linhas 7 e 8 (Rafael Nunes, Beatriz Lima) não aparecem no Figma, que mostra só 6 linhas.
- Validação do arquivo (verificada em execução): `.txt` recusado ("Selecione um arquivo .xlsx, .xls ou .csv."); arquivo vazio recusado; CSV exige cabeçalho com 2+ colunas, 1+ registro e o mesmo número de campos por linha ("A linha 3 possui 2 campos; eram esperados 3."); nomes de coluna não são conferidos; `.xls`/`.xlsx` só pela extensão (texto qualquer em `.xlsx` e um arquivo de 30 MB foram aceitos).
- Modelo: botão com `aria-disabled="true"`; a mensagem "Modelo oficial indisponível neste protótipo." existe só para leitor de tela (`sr-only`); o clique não faz nada e o hover ainda realça a borda (`#669e2e`) apesar do cursor `not-allowed`.
- Testes: `tests/admin-student-registration.browser.test.cjs` percorre método → modelo → upload (inválido, CSV inline, remover) → revisão → resultados → "Com erro" → Cancelar, mais Manual, Escape e clique fora; a 390 px só confere que a caixa do diálogo de método cabe. `tests/admin-students.browser.test.cjs` cobre filtros, vazio, reset e inativar/reativar; a 390 px só a caixa do diálogo. Não cobrem a página 2 dos resultados, o painel de revisão a 390 px, XLSX, arraste nem fidelidade visual. A fixture `tests/fixtures/admin-students-import.csv` (`Nome,CPF,E-mail,Ciclo,Turma`) não é usada por nenhum teste; o teste usa CSV inline com `Nome,CPF,E-mail`.
- Confere com o Figma: os textos dos seis nós, salvo "Importar Estudante" (V15), o "+" do CTA (V05), o "←" do "Voltar" (V18) e a caixa dos cabeçalhos (V20); cartões do método (ícone 52, raio 14); etapas (28 px, conector 2 px); Action Item; rodapés (botões de 36 px, raio 10); dropzone (borda tracejada 2 px, ícone 32 px); cartão de arquivo de 136 px e lixeira 32×32; resultados (cartão 1104×514, cabeçalho de seção 80 px, cabeçalho de tabela 42 px, linhas 65 px, raio 14); listagem (título, nome/e-mail, ações 36×36, switch 40×22, paginação 36×36).

## 5. Divergências visuais
| ID | Nó | Elemento | Figma | Implementação | Gravidade |
|---|---|---|---|---|---|
| V01 | `101271:20286` | Filtros | Gatilhos de 42 px (cartão 82 px), 546/241/241 px; sombra de 2 camadas | 46 px (cartão 86 px), 516/258/258 px (grid 2fr/1fr/1fr); sombra de 1 camada | baixa |
| V02 | `101203:11562` | Cabeçalho da tabela | Caixa alta 12 px Bold, sem tracking, `#171717` | 12 px/600, tracking 0,5 px, `#6b7280` | média |
| V03 | `101203:11560` | Larguras das colunas | 308,3/308,3/308,3/177 px | 441/220/220/220 px (40/20/20/20 %) | média |
| V04 | `101203:11578` | Badges de status | Roboto Medium; `#00a63e`/`#00a63e0d`, `#f54900`/`#ca35000d`, `#404040`/`#0000000a` | Peso 400; `#00a63e`/`#effaf3`, `#ff5a00`/`#fff4ee`, `#454545`/`#f3f3f3` | baixa |
| V05 | `I101171:11090;101261:6991` | Botão "Cadastrar Estudante" | Ícone de 16 px, gap 6, padding-x 10 | Caractere "+" no texto, gap 8, padding-x 12 (163 px) | baixa |
| V06 | `101166:3530` | Contagem | "Exibindo **1.247** estudantes" (número em negrito) | "Exibindo 14 estudantes" sem negrito | baixa |
| V07 | `101211:4249` | Tooltip das ações | Variante Hover: `#303030`, raio 16, texto 13 px | `title` nativo do navegador | baixa |
| V08 | `101239:17730` | Altura do diálogo de método | 264 px; cartões 188×188 | 272 px; cartões 187×194 (3 linhas de descrição + padding 20) | baixa |
| V09 | `101242:18482`, `18605`, `18741` | Altura e rodapé dos diálogos | 302/316/316 px; rodapé 60; Action Item 122; dropzone vazia 136 | 314/337/326 px; rodapé 68 (16+36+16); Action Item 124; dropzone vazia 147 | baixa |
| V10 | `101242:18577`, `101237:95` | Tipografia Inter | Inter SemiBold 12 nos números; Inter 14/12 na dropzone | `Inter` pedida só nos números (peso 700), sem `@font-face`: o Chrome desta máquina usou Roboto (CDP); dropzone em Roboto 700/400 | baixa |
| V11 | `101242:18605`, `18741` | Primário desabilitado | 32 px e opacidade 50% (habilitado em `18741`: 36 px) | 36 px nos dois estados | baixa |
| V12 | `101242:18619` | Dropzone ao entrar no painel | Sem anel de foco | Anel de 3 px `#7ab934` (`:focus-within`, foco programático no input), também após clique do mouse | baixa |
| V13 | `101242:18784` | Etapa 2 com arquivo selecionado | "✓" concluída, rótulo `#669e2e` | "2" em andamento, rótulo `#171717`; "✓" só no painel de revisão | média |
| V14 | `101242:18755` | Cartão do arquivo | "nome · 24 KB" em negrito e "24 KB" abaixo; lixeira `#669e2e` | Nome em negrito e "24 KB" abaixo; lixeira `#171717` (stroke fixo em `LucideIconsTrash2.svg`) | baixa |
| V15 | `101242:18741` | Rótulo do primário | "Importar Estudante" (singular); no vazio, "Importar Estudantes" | Plural nos dois (o HTML do painel de revisão tem singular, o JS troca para plural) | baixa |
| V16 | `101248:19005` | Fundo da página de resultados | `#ffffff` | `#f8f9fb` (herdado de `.admin-students__main`) | baixa |
| V17 | `101271:19381`, `101248:19796` | Títulos dos resultados | h1 Roboto Bold 30/30, 24 px até o cartão; h2 Roboto Bold 20/28, tracking −0,6 px | h1 Montserrat 30/36, margem 12 px; h2 Montserrat 20/28 sem tracking | média |
| V18 | `101248:19006` | Botão "Voltar para Banco de Talentos" | 32 px, ícone de 16 px, padding-x 10 | Link de texto com "←", 29 px, padding 6/8 | baixa |
| V19 | `101250:20317` | Abas Todos / Com erro | 226×48; badges Roboto Medium 14 (px 8); erro `#e62c2d` sobre `#e62c2d0d`; "Todos" `#0000000a` | 218×42; badges 12 px/600 (px 7); erro `#9f1f20` sobre `#ffe5e5`; "Todos" `#eee` | baixa |
| V20 | `101949:25355` | Cabeçalho da tabela de resultados | Caixa alta ≈12 px Bold `#171717`, padding-x 24, ícones de ordenação em Nome e E-mail | Caixa mista 14 px/700, padding-x 16, sem ícones | média |
| V21 | `101949:25355` | Larguras e quebras | 190/144/235/170/188/166 px, texto quebra em 2–3 linhas | `nowrap`; tabela de 1111 px em contêiner de 1102 px: rolagem horizontal de 9 px a 1440 | média |
| V22 | `101250:20120` | Célula com erro | `#e62c2d` regular sobre `#e62c2d0d` (≈`#fef4f4`); warning-circle de 20 px depois do texto | `#9f1f20` peso 500 sobre `#fff0f0`; glifo "⚠" antes do texto | média |
| V23 | `101771:27589` | Paginação dos resultados | Itens 36×36 com borda, ativo em gradiente, chevrons 16 px, gap 4, texto 14 px | Sem borda, ativo `#669e2e` chapado, "‹ ›" em texto, gap 8, texto 16/600 `#525252`; destoa da paginação da listagem na mesma página | média |
| V24 | `101248:19004` | Altura da página | Cabe em 960 px | Página com 972 px (inclui o banner de demonstração de 56 px): rolagem vertical de 12 px a 1440×960 | baixa |
| V25 | `101239:16938`, `17060` | Diálogos de redefinir e inativar (secundário) | 308×248 e 308×272 | 420×234 e 420×258 (textos e botões iguais) | baixa |

## 6. Divergências funcionais
| ID | Nó | Elemento | Figma | Implementação | Gravidade |
|---|---|---|---|---|---|
| F01 | `101949:25355` | Colunas dos resultados | 14 colunas (Nome, CPF, E-mail, Data de Nascimento, Link do Termo de Aceite, Ciclo, Turma, Trilha/Curso ×3, Ações); seis cabem no quadro | 6 colunas; Turma, Trilha, Curso e Ações ausentes | alta |
| F02 | `101949:25355` | Ações por linha e célula de erro | Coluna Ações (92 px) com lápis; célula de erro renderizada como botão; efeito não verificável | Nenhum botão ou link nas linhas; clicar na célula de erro não faz nada | média |
| F03 | `101268:14255` | "Confirmar importação" | Opacidade 50% com 1 erro; estado sem erros e feedback não fornecidos | Sempre desabilitado (constante com 1 erro); toast de sucesso inalcançável | alta |
| F04 | `101248:19004` | Conteúdo importado | 8 registros de exemplo | 8 linhas fixas, independentes do arquivo (a 7ª e a 8ª não aparecem no Figma, que mostra 6 linhas) | média |
| F05 | `101242:18605` | Validação do arquivo | Não especificada | CSV só estrutural; colunas erradas e XLSX inválido aceitos; sem limite de tamanho | média |
| F06 | `101242:18712` | Baixar modelo | Ação com aparência normal | `aria-disabled`, sem arquivo e sem mensagem visível; hover realça a borda mesmo desabilitado | média |
| F07 | `101242:18741` | Passo após selecionar o arquivo | "Importar Estudante" (destino não verificável) | Painel extra "Arquivo selecionado" com nota de demonstração antes dos resultados (2 cliques) | média |
| F08 | `101250:20317` | Aba "Com erro" | Aba presente; o quadro termina em "- Todos" e nenhuma variante foi fornecida | Filtro local: 1 linha, sem paginação | baixa |
| F09 | `I101203:11585;101211:4391` | Switch de "Aguardando acesso" | Ligado, `#669e2e`, sem regra | Desabilitado com 50% de opacidade (só Ativo/Inativo alternam) | média |
| F10 | `I101271:20286;101166:3037;101271:20304` | Filtro de cidades | Dropdown aberto não fornecido; linhas mostram Florianópolis, Joinville, Blumenau, Chapecó, Criciúma | 6 opções (as mesmas do select de cidades do cadastro de empresa); Joinville, Blumenau, Chapecó e Criciúma existem nos dados e não são filtráveis | média |
| F11 | `I101271:20286;101166:3037;101271:20303` | Filtro de status | Dropdown aberto não fornecido; rótulos vistos nas linhas | Ativo, Aguardando acesso, Inativo (derivados das linhas) | baixa |
| F12 | `101118:11517` | Lápis, CTA e ordenação | Destinos não verificáveis; ícone de ordenação em Estudante, Nome e E-mail | Lápis abre `admin-aluno-perfil.html` (tela legada); sem ordenação | baixa |
| F13 | `101242:18510` | Dropzone | Documenta Empty, Hover, Processing e Done; só Empty e Done fornecidos | Empty, Done e realce ao arrastar; sem Processing | baixa |

## 7. Adaptações sem evidência e itens do Figma ausentes
**Implementado sem evidência no Figma (adaptações do protótipo)**
- Resultados: banner de demonstração; painel `review` e sua nota; linhas 7 e 8; mensagem "Nenhum registro demonstrativo com erro." e toast de confirmação (ambos inalcançáveis); `title` do botão desabilitado.
- Arquivo: mensagens de erro de extensão, arquivo vazio e CSV; validação estrutural de CSV; `aria-disabled` no modelo com texto só para leitor de tela.
- Listagem: 8 estudantes além dos seis do Figma (14 no total); catálogos de status e cidade; tamanho de página 6; estado vazio ("Nenhum resultado encontrado", "Limpar filtros"); botão de limpar busca; reativação sem modal; switch desabilitado em "Aguardando acesso"; nome real do estudante nos diálogos de 420 px.
- Responsivo (listagem 900/600 px; importação 460/600 px) sem quadros mobile; foco programático, contenção de Tab, Escape e clique no backdrop.

**Itens do Figma ausentes na implementação**
- Resultados: colunas Turma, Trilha/Curso (×3) e Ações; ícones de ordenação em Nome e E-mail; lápis por linha; ícone warning-circle; fundo branco.
- Ícone "+" do CTA, ícone de retorno do "Voltar", tooltip customizado, etapa 2 concluída com arquivo selecionado, lixeira verde, "Importar Estudante" (singular).
- Estados Hover e Processing da dropzone (documentados no componente, não fornecidos).

## 8. Decisões em aberto
1. **Efeito de "Confirmar importação" e estado sem erros.** Evidência: `101268:14255` está a 50% com 1 erro; nada define o estado habilitado nem o feedback. Opções: manter sempre desabilitado; abrir um caminho sem erros com toast simulado; permitir corrigir ou remover linhas. Recomendação: manter desabilitado e pedir o quadro do estado sem erros e do feedback; não anunciar importação concluída.
2. **Colunas e ações dos resultados.** Evidência: 14 colunas em `101949:25355`; as colunas Trilha/Curso trazem os mesmos nomes do catálogo do cadastro manual e Ciclo/Turma existem nele; lápis e célula de erro-botão sem destino verificável. Opções: manter 6 colunas; acrescentar as demais com rolagem horizontal; acrescentar ações por linha. Recomendação: confirmar com o designer que Turma/Trilha/Curso fazem parte do modelo e qual é o efeito do lápis; só então alterar a tabela.
3. **Formato e entrega do modelo.** Evidência: `101242:18482` não define colunas nem extensão; a fixture tem `Nome,CPF,E-mail,Ciclo,Turma`, diferente do quadro de resultados. Opções: manter indisponível e deixar isso visível; gerar um modelo fictício. Recomendação: o usuário fornece o modelo oficial ou autoriza um fictício com as colunas do quadro de resultados; hoje o usuário vidente não recebe nenhuma explicação.
4. **Leitura real de CSV/XLSX e erros por linha.** Evidência: o exemplo marca só o e-mail (sem "@"); o mesmo CPF aparece em duas linhas sem erro; os nascidos entre 2010 e 2015 são menores de 18 anos em 2026-10-16 com ciclo "2024 - 2º Semestre", enquanto o cadastro manual exige "Jovem Aprendiz" para menores. Opções: manter linhas fixas; ler CSV e validar campos que o usuário definir; suportar XLSX (exige parser, ou seja, dependência vetada sem aprovação). Recomendação: manter as linhas fixas e o aviso até existirem regras escritas.
5. **Passo "Arquivo selecionado" e etapa 2 concluída.** Evidência: `101242:18741` tem "Importar Estudante" direto e as duas etapas concluídas; o código traz um painel `review` extra, coberto pelo teste (`#student-import-review-note`, `#student-import-submit`). Opções: remover o painel; manter como adaptação. Recomendação: manter até verificar a conexão do botão; marcar a etapa 2 como concluída no upload só com essa confirmação.
6. **Textos e tamanhos que o Figma repete ou contradiz.** Evidência: "Importar Estudantes" (vazio) vs "Importar Estudante" (selecionado); "nome · 24 KB" mais "24 KB"; primário de 32 px no desabilitado e 36 px no habilitado. Opções: seguir o Figma literalmente; padronizar (plural, tamanho uma vez, 36 px). Recomendação: perguntar ao designer; hoje vale a padronização.
7. **Catálogos do filtro.** Evidência: dropdowns abertos não fornecidos; as 6 cidades são as mesmas do select do cadastro de empresa (`pages/admin-empresa-cadastro.html`, que `docs/figma-admin-company-registration.md` associa ao overlay `101797:14503`, não reverificado aqui) e 4 das 10 cidades dos dados ficam fora; página de 6 itens inferida das 6 linhas. Opções: pedir os nós; derivar a lista dos dados. Recomendação: pedir os nós e, até lá, tratar o catálogo como adaptação.
8. **Switch de "Aguardando acesso" e reativação.** Evidência: Figma mostra o switch ligado; só existe o modal "Inativar usuário?". Opções: habilitar com a confirmação existente; manter desabilitado; reativar com modal. Recomendação: confirmar a regra com o usuário antes de mudar.
9. **Nós ausentes.** Cadastro manual (destino de "Manual"), variante "Com erro" e quadros posteriores à confirmação, estados vazio e de erro da listagem, dropdowns, Dropzone Hover/Processing e quadros de 390 px. Opções: o usuário fornece os nós; seguir sem eles. Recomendação: fornecer os nós; até lá, tudo isso segue como adaptação documentada.
10. **Conexões do protótipo.** Não verificáveis com as ferramentas permitidas (CTA, "Via Planilha", "Manual", "Voltar", aba "Com erro", lixeira, "Importar Estudante", lápis, ordenação). Opções: autorizar uma leitura explícita de `reactions` via Plugin API (somente leitura); fornecer gravação ou descrição do protótipo; aceitar as adaptações. Recomendação: autorizar a leitura se a fidelidade do fluxo for requisito.
11. **Fonte Inter.** Evidência: o Figma usa Inter nos números das etapas e na dropzone; a fonte não é distribuída (`assets/admin-fonts/` só tem Montserrat e Roboto). Opções: aceitar Roboto como substituto; aprovar um asset local de Inter. Recomendação: aceitar Roboto, a diferença é mínima.

## 9. Validação e limites
**Verificado**
- Seis nós lidos por metadata, captura e contexto de design (variáveis em três deles); os dois secundários, só por metadata e contexto de design, sem captura. Cores e larguras de texto do Figma foram amostradas dos PNGs; onde a captura e o código de referência divergem (caixa e tamanho dos cabeçalhos), prevaleceu a captura.
- Implementação renderizada a 1440×960 (DPR 1 e 2) e 390×844: listagem (padrão, filtros, vazio), diálogos de redefinir e inativar, método, modelo, upload (vazio, inválido, selecionado), revisão e resultados (todos, "Com erro", página 2).
- Nos três percursos: nenhum `pageerror`, violação de CSP, requisição externa ou falha de requisição. Sem overflow horizontal da página a 1440 e 390 px; a 390 px os diálogos ocupam x16–374; as tabelas rolam internamente (listagem 820 px, resultados 1111 px).
- Comportamentos de arquivo, modelo, resultados e foco confirmados em execução (seção 4).

**Não verificado**
- `reactions` do protótipo (seção 3 e decisão 10); estados hover, foco e pressionado do Figma; menus nativos abertos de `select`; tooltip real.
- Dados reais, leitura de XLSX, navegação completa por teclado e leitores de tela. Nada aqui é auditoria ou declaração de conformidade WCAG: a validação completa exige teste manual com tecnologias assistivas.
- Esta tarefa não executou `npm test`, `npm run check` nem `npm run build` (somente leitura, nenhum código alterado).

**Observações**
- O servidor da porta 4185 já estava ativo; foram feitas apenas requisições GET.
- As capturas e os scripts ficaram numa pasta temporária fora do repositório e foram removidos; nenhum PNG foi gravado em `docs/`.
- O Figma não foi alterado.

## 10. Atualização de implementação (2026-10-16, tarde)
Esta auditoria descreve o estado anterior; o código manda. A tela de resultados foi reescrita em `pages/admin-alunos.html`, `css/admin-student-import-results.css` e `js/admin-student-import-results.js` (teste `tests/admin-student-import.browser.test.cjs`), com o diálogo em `admin-student-registration-method.*`.
- **Resolvidos**: F01 (as 14 colunas, com Turma, Trilha/Curso e Ações, e rolagem horizontal só dentro do cartão), F02 (coluna Ações com lápis; adaptação: o lápis edita a primeira célula da linha, efeito no Figma não verificável), F03 (sem erros, "Confirmar importação" habilita e abre um diálogo de sucesso simulado, sem quadro no Figma) e V16 a V23 (fundo branco, títulos, botão Voltar com ícone, abas, cabeçalho em caixa alta com ícones, larguras e quebras, célula de erro com ícone, paginação igual à da listagem).
- **Parciais**: F04 (os 8 registros continuam fictícios e fixos, agora todos editáveis; edições ficam em memória) e F06 (cartão do modelo com hover verde, cursor e foco; o modelo segue indisponível e o clique informa que nada foi baixado).
- **Novo**: toda célula de dado é editável no local, com revalidação do registro a cada edição (Trilha → Curso inclusive), contadores e "Confirmar" atualizados na hora. Regras e limites estão em `.kiro/steering/sctec-progress.md`; a regra de menor de 18 anos × Ciclo não foi aplicada (decisão 4 segue aberta). Texto de erro usa #b91c1c (Figma #e62c2d) por contraste.
- **Sem alteração**: V01 a V15, V24 e V25; F05, F07 e F09 a F13; decisões 1 a 11 seguem abertas, com as notas acima sobre as decisões 1 e 2.
