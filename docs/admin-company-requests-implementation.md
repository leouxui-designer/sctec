# Solicitações de empresas — implementação local

## Referências confirmadas

- Revisão única: 101513:9955; alternativa ACATE Sim: 101981:23961.
- Múltiplas solicitações: 101337:9077 sem seleção e 101346:13905 com seleção.
- Confirmações: 101981:24128 aprovação; 101981:24148 recusa; 101982:24394 recusa de todas as solicitações.
- Referência adicional seguida a partir da conexão do estado alternativo: 101981:24168, Enviar empresa para aprovação da ACATE?.
- Os painéis de revisão têm 400 px no desktop; confirmações têm 308 px. No mobile há rolagem interna com ações acessíveis.

## Comportamento

- Ações da linha abrem a revisão correspondente. Datas e rótulos distinguem solicitação e ressolicitação.
- Solicitação múltipla é um cenário explícito da DataSoft já mostrado na tabela; não há agrupamento automático por CNPJ.
- Os contatos fictícios Juliana Martins e Patrícia Mendes, seus cargos, telefone e e-mail vêm dos frames confirmados. O nome da empresa e o CNPJ vêm da linha clicada, não dos exemplos divergentes do canvas.
- A associação inicial respeita o valor existente na demonstração (Sim ou não confirmado como Sim). A pergunta continua editável; mudar o switch só altera a classificação da tabela após confirmar uma decisão. Sem edição explícita, Não informado é preservado.
- Não há responsável selecionado automaticamente na revisão múltipla. Aprovar selecionado só é habilitado depois da escolha.
- Cancelar confirmação ou pressionar Escape nela retorna à revisão e conserva seleção, associação e anotações. Fechar o painel descarta o rascunho não confirmado.
- Aprovação/recusa/encaminhamento só modificam a demonstração após confirmação. Aprovar selecionado aprova um contato e recusa os demais no estado local; recusa múltipla recusa todos.
- Os filtros, o switch ACATE e a paginação permanecem selecionados. Quando uma decisão remove a linha dos filtros atuais, o foco volta à contagem de resultados; quando há ação na linha, o foco retorna a ela.
- Dados e decisões existem apenas em memória. Recarregar a página restaura os exemplos. Nenhum e-mail é realmente enviado. O resultado usa o toast já existente, conforme o escopo solicitado.

## Adaptações e incertezas

- O Figma não liga Aprovar selecionado a um destino final. O protótipo reutiliza a confirmação de aprovação 101981:24128 para cumprir o fluxo solicitado; esta ligação é uma adaptação local, não uma conexão confirmada do Figma.
- A alternativa ACATE e a confirmação de encaminhamento têm conexão confirmada para uma solicitação única. Não foram inventados telas ACATE, justificativas obrigatórias ou regras adicionais para múltiplas solicitações.
- Ver detalhes de empresa já recusada continua como placeholder: não há referência confirmada suficiente para criar uma tela de histórico.
- Botões primários/destrutivos usam cores um pouco mais escuras que o canvas para contraste de texto. A rolagem permite acessar as anotações que aparecem cortadas no frame múltiplo original.

## Validação

- Playwright com Chrome instalado: revisão única, alternativa ACATE, ressolicitação, revisão múltipla, seleção de ambos os contatos, confirmação/cancelamento de aprovação e recusa, recusa de todos, atualização de status e responsável, filtros/paginação, notas, Escape, clique externo, Tab/Shift+Tab, foco de retorno e mobile.
- Suíte completa: 7 testes passaram, incluindo os dois testes de navegador, sem skips. Sem erros JavaScript ou violações de CSP na tela de empresas.
- npm run check e npm run build passaram.
- Comparação visual com capturas: company-request-single.png, company-request-multiple.png, company-request-selected.png, company-request-confirmation.png e company-request-mobile.png neste diretório.

URL: http://127.0.0.1:4185/viewer.html#/sctec/admin/companies
