# Perfil ACATE — implementação local

Referência: arquivo `XFiHsQxBDhyWUulxgjZOHD`, seção `101935:18026`.

## Nós usados
- `101935:18038`: Consulta de Empresas (1440×960), shell, filtros, tabela e paginação.
- `101935:18248`: opções do filtro Status.
- `101935:18254`: filtro multiseleção Porte.
- `101935:18262`: detalhe da empresa em página separada.
- `101935:18286`: estado sem resultados.
- `101982:24783`: revisão de uma solicitação.
- `101982:25185` e `101982:25190`: confirmação de aprovação e recusa.
- `101982:25197` e `101982:25208`: feedback de empresa aprovada e recusada.

## Implementação
- Login habilita ACATE e abre `#/sctec/acate/companies`.
- Listagem: 10 empresas fictícias associadas; busca por nome/CNPJ/responsável, status, portes, vazio e paginação de 7 itens.
- O detalhe `company-profile` permanece somente leitura. A edição acontece em `#/sctec/acate/company-edit`, usando o formulário compartilhado com o Admin e dados específicos da empresa selecionada.
- Solicitações elegíveis exibem “Ver/Rever solicitação”; ACATE pode aprovar ou recusar, com confirmação, feedback e atualização local do status.
- Shell próprio reaproveita `painel.css`, fontes e ícones locais. Nenhum arquivo Company foi alterado.
- Contrato: 19 telas, 11 jornadas e 32 etapas; `profiles` e `capabilities` continuam vazios.

## Adaptações e limites
- O frame de detalhe original é editorial, mas `company-profile` mantém a visualização sem formulário. Por regra explícita posterior, a nova rota `company-edit` reutiliza o layout de cadastro `101704:26966` e permite edição local sem persistência.
- A coluna Ações segue `101935:18038`: empresas aprovadas/inativas exibem Editar, Redefinir senha e Switch; pendências simples exibem Ver/Rever solicitação; recusadas exibem Ver detalhes. Todas as mutações são locais e simuladas.
- Dados são locais, determinísticos e não persistem. A lista contém somente registros marcados como associados.
- As ferramentas MCP somente leitura não expuseram `reactions`; as transições entre os estados foram implementadas a partir dos cinco frames fornecidos e da regra explícita do usuário. Solicitações múltiplas não têm fluxo ACATE confirmado e permanecem apenas consultáveis.
- Mobile é adaptação responsiva; o Figma fornecido é desktop. Não houve auditoria WCAG manual.

## Validação
- Chrome/Playwright: fluxo Login → ACATE → busca/filtros/paginação → edição, reset simulado, inativação com confirmação, reativação imediata e revisão de solicitações; desktop 1440×960 e mobile 390×844, sem `pageerror`, console error ou violação CSP.
- `npm run check` e `npm run build`: aprovados com 19/11/32.
