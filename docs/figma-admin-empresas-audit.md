# Auditoria Figma — Gestão de Empresas (Admin)

## Escopo e referência

- Implementação: `pages/admin-empresas.html`, `css/painel.css`, `css/empresas.css`, `js/main.js` e `viewer.js`.
- URL local: `http://127.0.0.1:4185/viewer.html#/sctec/admin/companies`.
- Figma: arquivo `XFiHsQxBDhyWUulxgjZOHD`, node `101268:14282` — **Gestão de Empresas - Admin**.
- As conexões de protótipo estão acessíveis via Figma MCP e foram verificadas nas propriedades `reactions`.

## Avaliação da implementação atual

A tela já possui navbar, sidebar administrativa, título, busca, filtros, tabela, status, ações de linha, paginação, toast e rotas para cadastro/edição. Os estilos compartilhados de `painel.css` são reutilizáveis.

As diferenças principais são comportamentais e de estrutura de dados. O HTML atual usa status e segmento, enquanto o Figma usa busca, status, porte e associação ACATE. As ações atuais chamam `showToast(...)`; não há modais de solicitação, confirmações, seleção de responsável ou aplicação real de filtros/paginação.

## Inventário de interações

| Ação | Destino Figma | Node ID | Estado atual | Necessidade | Confiança |
|---|---|---|---|---|---|
| Cadastrar Empresa | Página de cadastro | `101118:11239` — Cadastrar Empresa - Admin - Vazio | Link para `admin-empresa-cadastro.html` | Reutilizar rota e alinhar formulário | Confirmada |
| Filtro de status | Dropdown/overlay | `101738:11982` — Select · Status | Select HTML com opções diferentes | Aprovada, Recusada, Inativada, Solicitação, Ressolicitação | Confirmada |
| Filtro de porte | Dropdown/overlay | `101747:11984` — Select · Porte | Ausente; há segmento | Microempresa, Pequena, Média, Grande, Limpar | Confirmada |
| Filtro ACATE | Switch “Apenas empresas ACATE” | Switch em `101271:20310` | Ausente | Definir regra antes de implementar; não há reação de clique confirmada | Pendente |
| Editar empresa | Página de edição | `101750:13795` — Editar Empresa - Admin | Link para `admin-empresa-editar.html` | Reutilizar rota e conferir campos | Confirmada |
| Ver solicitação | Modal de uma solicitação | `101513:9955` | Ausente; há toast de aprovar/rejeitar | Criar modal e fluxo | Confirmada |
| Ver solicitações | Modal múltiplo sem seleção | `101337:9077` | Ausente | Criar seleção de responsável | Confirmada |
| Selecionar responsável | Modal múltiplo com seleção | `101346:13905` | Ausente | Estado decorrente da seleção | Confirmada |
| Aprovar solicitação | Confirmação | `101981:24128` — Confirmar aprovação da empresa? | Toast | Substituir por confirmação | Confirmada |
| Recusar solicitação | Confirmação | `101981:24148` — Confirmar recusa da empresa? | Toast | Substituir por confirmação | Confirmada |
| Recusar múltiplas solicitações | Confirmação | `101982:24394` | Ausente | Fluxo específico para múltiplas solicitações | Confirmada |
| ACATE dentro do modal | Estado alternativo | `101981:23961` | Ausente | Preservar pergunta, Sim/Não e anotação | Confirmada visualmente; regra pendente |
| Fechar modal | Ação `CLOSE` | `101513:9956`, `101337:9078` | Ausente | Fechar e devolver foco | Confirmada |
| Resetar senha | Modal | `101239:16938` | Toast | Destino existe, mas está nomeado para usuário | Confirmada no protótipo; escopo ambíguo |
| Ativar/inativar | Modal | `101239:17060` | Toggle com toast | Não reutilizar sem esclarecer; destino é de usuário | Ambígua |

## Estrutura e estados do Figma

### Tela principal `101268:14282`

- Conteúdo de `1184 × 883`, iniciando em `x=256`, `y=80`, com padding de 40 px.
- Título: “Gestão de Empresas”. Descrição: “Gerencie empresas parceiras, aprove cadastros e cadastre novas empresas”.
- Busca: “Buscar por nome, CNPJ ou responsável...”.
- Filtros: status, porte e “Apenas empresas ACATE”.
- Colunas: Empresa, CNPJ, Responsável, ACATE, Status e Ações.
- Estados observados: Aprovada, Inativada, Solicitação, Ressolicitação e Recusada.
- Ações textuais: Ver solicitação, Ver solicitações, Rever solicitação e Ver detalhes.
- Paginação: 1, 2, 3, “de 5” e anterior/próximo.

### Modais

- `101513:9955`: uma solicitação, candidato, WhatsApp, e-mail, associação ACATE, anotações e Recusar/Aprovar.
- `101981:23961`: estado alternativo com ACATE “Sim” e “Enviar para aprovação”.
- `101337:9077`: duas solicitações, seleção do responsável, aviso de recusa dos demais e Recusar/Aprovar selecionado.
- `101346:13905`: estado com seleção feita.
- Confirmações: `101981:24148`, `101981:24128`, `101982:24394`.

## Componentes reutilizáveis

- Estrutura de painel, navbar, sidebar, tabela, status, toggle, paginação e toast de `css/painel.css`.
- Rotas já registradas: `#/sctec/admin/companies`, `#/sctec/admin/company-create` e `#/sctec/admin/company-edit`.
- Componentes Figma reutilizáveis: Select Trigger shadcn (`101271:20310`), Table Head/Cell, Button With Tooltip, Badge, Pagination e navbar/sidebar locais.
- Ícones do Figma podem continuar sendo SVG inline, sem nova dependência.

## Diferenças e ambiguidades

- **Reutilizar:** painel, navegação, tabela base, badges/status, botões, paginação e rotas.
- **Ajustar visualmente:** colunas, filtros, rótulos de status, textos, espaçamentos e estados da tabela.
- **Implementação ausente:** dropdowns de status/porte, modais de uma e múltiplas solicitações, seleção, textarea de anotações e confirmações.
- O Switch ACATE da tela principal não tem reação de clique confirmada.
- Não foi encontrada reação de ordenação nos cabeçalhos, apesar do ícone de ordenação.
- Os destinos de resetar senha/inativar (`101239:16938`/`101239:17060`) pertencem a uma seção de Banco de Talentos e são nomeados para usuário; não devem ser aplicados a empresas sem validação.
- O Figma menciona notificações por e-mail, mas o protótipo local não possui backend; o fluxo deve continuar simulado.
- O HTML atual usa segmento e conteúdo de empresas diferentes dos dados exibidos no Figma; decidir se isso é dado de protótipo ou requisito visual.

## Ordem recomendada para futura implementação

1. Alinhar tabela, rótulos e estados principais, preservando os componentes CSS existentes.
2. Implementar busca e dropdowns de status/porte como estados locais.
3. Adicionar os modais de solicitação, fechamento, foco e seleção.
4. Adicionar as três confirmações e substituir os toasts de aprovação/recusa.
5. Validar Switch ACATE, resetar senha, inativação e ordenação antes de alterar esses fluxos.
6. Testar as rotas do viewer e as páginas de cadastro/edição.

Nenhum HTML, CSS ou JavaScript foi alterado nesta auditoria.
