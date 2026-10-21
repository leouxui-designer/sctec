# Auditoria Figma — Empresa / Buscar Talentos

## Escopo

- Arquivo Figma: `XFiHsQxBDhyWUulxgjZOHD`
- Tela principal: `101118:12480`
- Rota local: `/sctec/company/candidates`
- Implementação: `pages/painel-candidatos.html`

## Estrutura confirmada

A tela usa o cabeçalho administrativo e a navegação lateral do perfil Empresa. O conteúdo é dividido em uma faixa branca de busca e filtros e uma área cinza-clara de resultados. A lista fica em um contêiner branco com cantos arredondados e linhas separadas por bordas.

Cada talento apresenta avatar, nome, indicadores contextuais, trilha SCTEC, competências, resumo, cidade e nível de inglês. A paginação aparece abaixo da lista. O card inteiro abre o perfil detalhado em um painel lateral, preservando a busca atual.

## Filtros e estados

| Elemento | Nó Figma | Conteúdo/decisão |
| --- | --- | --- |
| Conjunto de filtros | `101704:17451` | Busca, Trilha SCTEC, Competências Técnicas, Região, Cidade, Nível de Inglês e Apenas PcD |
| Cidade | `101337:12962` | Busca interna, seis cidades e ação Limpar |
| Trilha | `101704:19724` | Desenvolvimento de Software, Análise de Dados e Inteligência Artificial |
| Competências | `101575:28916` | Busca interna, lista rolável e ação Limpar |
| Região | `101720:34118` | Seis regiões de Santa Catarina e ação Limpar |
| Nível de inglês | `101569:28695` | Básico, Intermediário, Avançado e Fluente |
| Filtros aplicados | `101713:11414` | Chips removíveis e ação Limpar todos |
| Sem resultados | `101793:14033` | Mensagem, orientação e botão Limpar Filtros |

Os popovers não apresentam ações Aplicar ou Cancelar. A seleção é imediata, aceita múltiplos valores e pode ser removida pelo próprio popover ou pelos chips. Clique fora e Escape fecham o popover sem alterar outros filtros.

## Regras implementadas

- A busca combina nome, cidade, região, trilha e competência.
- Categorias diferentes são combinadas por interseção.
- Valores da mesma categoria são combinados por alternativa, exceto competências, que exigem que o talento possua todas as selecionadas.
- O filtro PcD é combinado com os demais filtros.
- Toda alteração reinicia a paginação na primeira página.
- A contagem, a lista, a paginação e o estado vazio derivam do mesmo conjunto filtrado.
- A ação Limpar todos também limpa busca e PcD.
- Os dados permanecem locais e demonstrativos.

## Ordenação

O nó `101955:29963` confirma um menu com três opções, nesta ordem: **Mais relevantes**, **Nome (A–Z)** e **Nome (Z–A)**. A relevância preserva a ordem original do conjunto demonstrativo. As opções alfabéticas usam comparação `pt-BR`, sem alterar filtros ativos, e reiniciam a paginação na primeira página. O menu pode ser operado por mouse ou teclado e fecha com Escape ou clique externo.

## Perfil lateral do talento

O nó `101382:13746` define um painel modal alinhado à direita, com cabeçalho fixo e conteúdo rolável. Foram confirmadas as seções Sobre, Competências Técnicas, Vídeo de apresentação, Experiência profissional, Formações e Certificados e Idiomas. O vídeo aparece apenas quando o registro indica apresentação disponível.

Os dez perfis são gerados por uma função determinística a partir do registro selecionado. Nome, cidade, nível de inglês, trilha, competências, condição de menor de idade e disponibilidade de vídeo vêm do mesmo registro da lista. Experiências, formações e descrições complementares usam conteúdo local coerente e estável, sem aleatoriedade e sem dados externos. Os contatos exibem feedback demonstrativo, pois a referência não fornece destinos pessoais verificáveis.

## Cabeçalho de Empresa

As rotas `/sctec/company/candidates` e `/sctec/company/profile` compartilham a mesma estrutura visual: marca em duas linhas, nome da empresa e avatar de 48 px. A marca conduz à busca de talentos e o menu do avatar preserva navegação por teclado, Escape e clique externo.

## Limitações preservadas

- A referência exibe 576 talentos e cinco páginas. O protótipo calcula a contagem e as páginas sobre os dez registros locais, evitando números incompatíveis com a demonstração.
- A conexão exata do switch PcD não está documentada no protótipo do Figma. A implementação aplica o filtro aos registros demonstrativos marcados como PcD, sem criar regra de negócio externa.
- A página de perfil da empresa ainda contém controles legados baseados em scripts inline. A padronização desta etapa se limita ao cabeçalho, sem migrar funcionalidades fora do escopo.
