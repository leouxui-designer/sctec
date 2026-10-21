---
inclusion: auto
name: sctec-progress
description: Estado verificado de implementação, pendências, limitações conhecidas, nós do Figma mapeados e próxima tarefa recomendada do SCTEC Portal de Talentos. Ative ao retomar o trabalho, planejar a próxima tarefa, perguntar sobre status ou pendências, ou procurar nós do Figma já mapeados.
---

# SCTEC Portal de Talentos: progresso

Última verificação: 2026-10-19 (edição compartilhada de empresa para Admin e ACATE). Legenda: ✅ verificado nesta data (código e teste de navegador passando), 🟡 reportado em docs ou pelo Codex e não reverificado, ⏳ pendente.

## Evidências desta verificação
- `npm run check` e `npm run build`: ✅ manifesto com 19 telas, 11 jornadas e 32 etapas.
- Suíte completa com Playwright e Chrome (variáveis definidas), em cópia temporária, `--test-concurrency=1`: 16 testes, 15 passaram, 1 falhou, 0 em skip. A falha é `company-search-talents.browser.test.cjs`, de outra frente em andamento (criada por outra sessão durante este trabalho; `pages/painel-candidatos.html` ainda carrega Google Fonts, violação de CSP). Nada da frente de alunos falhou.
- Testes de alunos (`admin-student-import`, `admin-student-registration`, `admin-students`) em 3 rodadas, cada uma numa cópia nova: 9 de 9 passaram, 0 em skip.
- Servidor já ativo na porta 4185: ✅ serve arquivos idênticos aos do repositório (SHA-256 de 9 arquivos da importação e do viewer).
- Tela de resultados contra o Figma: ✅ larguras das 14 colunas, alturas (cabeçalho 42, linha 65), abas, títulos, ícone de erro e rodapé conferidos por medição e captura. Acessibilidade: ✅ árvore do navegador (grid, columnheader, rowheader, gridcell, `aria-invalid`) e teclado testados; 🟡 sem auditoria WCAG manual.
- Perfil ACATE: ✅ fluxo Login → listagem → detalhe/edição → voltar, busca, status, porte, vazio e paginação; empresas aprovadas/inativas usam Editar, Redefinir senha e Switch; pendências preservam revisão; aprovação/recusa e alterações de status são locais. Verificado em Chrome a 1440×960 e 390×844 sem `pageerror` nem violação CSP.

## Frentes
| Frente | Status | Evidência e observações |
|---|---|---|
| Shell admin compartilhado (header, sidebar, fontes e ícones locais, logo por perfil, navegação no viewer, JS externo) | ✅ | `admin-shell.js`, `profile-navigation.js`, `painel.css`. Testes de empresas e alunos sem `pageerror` nem violação de CSP. |
| Gestão de Empresas: listagem, busca, filtros de status e porte, switch ACATE, paginação, estado vazio | ✅ | Testes `admin-companies` e `admin-company-refinements`. Doc: `figma-admin-empresas-audit.md`. 🟡 A auditoria deixou a regra do switch ACATE como pendente; a regra implementada depois não está documentada. |
| Gestão de Empresas: ativar/inativar e confirmação de redefinição de senha | ✅ | Teste `admin-company-actions`. 🟡 A auditoria marcava como ambíguos (nós nomeados para "usuário"); a decisão posterior não está documentada. |
| Solicitações de empresas (única e múltipla, responsável, aprovar e recusar, feedback simulado) | ✅ | Teste `admin-company-requests`. Doc: `admin-company-requests-implementation.md`. "Aprovar selecionado" reutiliza a confirmação 101981:24128 (adaptação local, não é conexão do Figma). |
| Cadastrar Nova Empresa (validação, canais condicionais, logo, notas flutuantes, WhatsApp, descarte, sucesso) | ✅ | Testes `admin-company-registration` e `admin-company-registration-interactions`. Docs: `figma-admin-company-registration.md` e `company-registration-interactions.md`. |
| Banco de Talentos (listagem, busca, filtros de status e cidade, paginação, estado vazio, redefinir senha, inativar e reativar, mobile) | ✅ | Teste `admin-students`. Auditoria em `figma-admin-students-audit.md`: divergências visuais da listagem (V01 a V07) seguem abertas. |
| Cadastro de estudante manual (validação, Ciclo e Turma como texto, cursos, sucesso simulado) | ✅ | Teste `admin-student-registration`. Regra implementada: menor de 18 anos só com ciclo "Jovem Aprendiz". 🟡 Origem dessa regra no Figma não verificada. Sem nó do Figma. |
| Importação por planilha (método, modelo, arquivo, remover, revisão, resultados editáveis, confirmação simulada) | ✅ com dados fictícios | Testes `admin-student-import` (novo) e `admin-student-registration`. Tabela de 14 colunas do Figma com **toda célula de dado editável no local** (texto, CPF com máscara, e-mail, data, link, selects de Trilha e Curso): clique, Enter ou F2 abrem; Enter confirma, Esc cancela, sair da célula confirma; setas, Home, End e Ctrl+Home/End navegam. Cada edição revalida o registro (inclusive Trilha → Curso), atualiza erros, contadores e "Confirmar importação", que abre um diálogo de sucesso simulado. Código: `admin-student-import-results.*` (novo) e `admin-student-registration-method.*`. |
| Perfil ACATE (empresas, edição e decisões) | ✅ | Login e rotas preservados. Empresas aprovadas/inativas exibem lápis, cadeado e switch iguais ao Admin; pendências simples exibem Ver/Rever solicitação; recusadas exibem Ver detalhes. Edição, reset, ativação/inativação e decisões são simulados em memória. Doc: `figma-acate-profile.md`. |

## Telas legadas (⏳ não alinhadas ao Figma atual)
Scripts e handlers inline são bloqueados pela CSP do servidor. Não verifiquei em navegador o efeito real.
- Admin: `admin-aluno-perfil` (6 handlers).
- Empresa e aluno: `painel-candidatos`, `painel-perfil`, `aluno-empresas`, `aluno-perfil`, `aluno-perfil-publico`, `empresa-perfil-publico`. Todas com script e handlers inline e Google Fonts. (`painel-candidatos` está sendo migrado por outra sessão: `company-search-talents.*`.)
- Institucionais: `index`, `empresas` e `empresas-obrigado` usam Google Fonts (bloqueado). O login usa apenas recursos locais e funciona.

## Limitações conhecidas
- ACATE: todos os dados e ações são fictícios e ficam em memória. Editar, resetar senha, ativar/inativar e aprovar/recusar afetam somente a sessão; recarregar restaura os exemplos. A solicitação múltipla da DataSoft continua sem fluxo de seleção confirmado e abre apenas detalhes. Nenhum e-mail é enviado. `reactions` não foram expostas pelo MCP. Mobile é adaptação dos frames desktop.
- Importação: os 8 registros são fictícios e fixos, não vêm do arquivo (o CSV só passa por validação estrutural e XLSX/XLS não são lidos). Edições ficam em memória e se perdem ao sair; cada nova importação recomeça do cenário inicial (1 e-mail inválido). O download do modelo segue indisponível (`aria-disabled`): o clique explica que nenhum arquivo foi baixado. O lápis da coluna Ações abre a edição da primeira célula da linha (efeito no Figma não verificável). O estado pós-confirmação não existe no Figma: usei o padrão do diálogo de sucesso do cadastro manual.
- Validação da importação (mesmas regras do cadastro manual): obrigatórios (nome, CPF, e-mail, nascimento, ciclo, turma), nome com 3+ caracteres, CPF com 11 dígitos (sem dígito verificador), e-mail pela validação nativa, data válida e não futura, pelo menos um curso, e cada Curso precisa pertencer à Trilha da dupla. Link do termo: opcional e, se preenchido, http(s) (validação de formato que adicionei; confirmar). **Não aplicada**: menor de 18 anos só com "Jovem Aprendiz" (todos os exemplos do Figma são menores com "2024 - 2º Semestre"; origem da regra no Figma não verificada). CPF repetido (linhas 2 e 3 do Figma) não é sinalizado.
- Contraste: o verde do Figma (#669e2e como texto sobre branco, cerca de 3,2:1; texto branco sobre o gradiente primário, cerca de 3,1:1) fica abaixo de 4,5:1 e foi mantido por fidelidade. Os erros usam vermelho mais escuro que o Figma (texto #b91c1c em vez de #e62c2d) para passar de 4,5:1.
- Sem commit-base: todo o repositório é não rastreado. `git diff` não compara e há risco de perda.
- Os testes de navegador dependem de variáveis externas (ver `tech.md`). Dois deles sobrescrevem PNGs de `docs/` se rodados na raiz. Os testes `admin-company-actions` e `company-search-talents` usam a mesma porta (4205).
- O viewer não carrega mais `/index.html` antes da rota inicial (`viewer.html` sem `src` no iframe e `viewer.js` com o `else` para a landing). Isso veio de um workflow interrompido, sem revisão independente; sem hash ou com hash inválido continua abrindo a landing. Com a mudança, o teste de cadastro de estudantes, que falhava em 2 de 5 execuções por violação de CSP do Google Fonts, passou nas 3 rodadas a frio. As notas desse workflow ficaram em `.agents/tasks/` (não versionadas).
- "Ver detalhes" de empresa recusada é só um toast. 🟡 Segundo os docs: catálogos incompletos (segmento só "Tecnologia / SaaS"; cidades), ordenação por cabeçalho sem reação confirmada no Figma, selects nativos com menu aberto variável e botão primário em verde mais escuro que o Figma por contraste.

## Nós do Figma (arquivo `XFiHsQxBDhyWUulxgjZOHD`)
Existência confirmada pelo MCP em 2026-10-16: 101981:24128, 101239:16938, 101239:17060, todos os nós de Banco de Talentos/importação e os nós ACATE abaixo. Os demais vêm dos docs (🟡).
- Gestão de Empresas: 101268:14282. Filtros: 101738:11982 (status), 101747:11984 (porte). Switch ACATE em 101271:20310.
- Solicitações: 101513:9955, 101981:23961 (ACATE Sim), 101337:9077, 101346:13905. Confirmações: 101981:24128 (aprovar), 101981:24148 (recusar), 101982:24394 (recusar todas), 101981:24168 (enviar à ACATE).
- Cadastro de empresa: 101118:11239 (vazio), 101704:26966 (parcial), 101750:26291 (erros). Overlays: 101795:17347 (responsável), 101795:15057 (canal), 101795:15174 (opções), 101795:15274 (LinkedIn), 101795:15204 (Outro), 101797:14503 (cidades). Diálogos: 101750:12854 (descartar), 101750:12881 (sucesso).
- Editar empresa: formulário compartilhado entre Admin e ACATE baseado em 101704:26966; `admin-empresa-editar.html` e `acate-empresa-editar.html`, com dados por `?company=<id>`, notas, logo, contatos, competências, canais e sucesso simulado.
- ACATE (✅ screenshot/contexto): seção 101935:18026; listagem 101935:18038; Status 101935:18248; Porte 101935:18254; detalhe 101935:18262; vazio 101935:18286; revisão 101982:24783; confirmações 101982:25185/25190; feedbacks 101982:25197/25208. O perfil da empresa segue somente leitura; somente as decisões de solicitações elegíveis são mutáveis em memória.
- Banco de Talentos e importação (✅ inspecionados com screenshot e contexto de design): listagem 101118:11517; método 101239:17730; baixar modelo 101242:18482; upload 101242:18605; arquivo selecionado 101242:18741; resultados 101248:19004, com tabela 101949:25355, abas 101250:20317, célula de erro 101250:20120, rodapé 101268:14255 e botão voltar 101248:19006. Modais: 101239:16938 (Redefinir senha do usuário?) e 101239:17060 (Inativar usuário?). Shell admin: 101268:14338 e 101268:14339. Sem nó para o cadastro manual nem para o estado pós-confirmação da importação.

## Próxima tarefa recomendada
1. Decisão do usuário: criar um commit-base local para proteger o trabalho. Só com autorização explícita.
2. Decisões abertas da importação (`docs/figma-admin-students-audit.md`, seção 8): formato do modelo oficial e leitura real de CSV/XLSX; regra de menor de 18 anos × Ciclo; obrigatoriedade e formato do Link do termo; efeito do lápis; estado pós-confirmação; leitura somente leitura de `reactions` via Plugin API (exige autorização).
3. Depois: fechar as divergências visuais da listagem do Banco de Talentos (V01 a V07) e migrar a tela admin legada Editar aluno para o shell e o JS externo.
