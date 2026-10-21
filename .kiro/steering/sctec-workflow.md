---
inclusion: always
---

# SCTEC Portal de Talentos: regras de desenvolvimento

Complementam `AGENTS.md` e `prototype-constraints.md` (limites do repositório, manifesto e protocolo v1). Não repita o que já está lá.

1. **Leia antes de codar**: página, CSS, JS e teste da tela, e o doc da frente em `docs/`.
2. **Figma por tarefa**: consulte os nós da tarefa (`get_design_context`, `get_screenshot`, `get_metadata`) no arquivo `XFiHsQxBDhyWUulxgjZOHD`, sempre por `nodeId` (a listagem de páginas só mostra "THUMBNAIL"). Use o MCP nativo do Figma. Se faltar autenticação, relate o erro; não busque tokens nem outro método.
3. **Compare** o Figma com o HTML, CSS e JS existentes e liste as diferenças antes de editar.
4. **Implemente só as diferenças necessárias**, sem refatorar nem melhorar o que não foi pedido.
5. **Reutilize** o shell, `painel.css`, `admin-shell.js` e os padrões de diálogo e toast existentes.
6. **Prefira** ícones de `assets/admin-figma/`, fontes locais e tokens de `variables.css`. Crie novos só quando os existentes não servirem.
7. **Mantenha a CSP intacta**. Não altere o cabeçalho nem afrouxe a política (ver `tech.md`).
8. **Sem script inline nem `on*=`**: JavaScript em `js/*.js`. Em página legada, não adicione inline e migre só o que a tarefa exigir.
9. **Preserve a acessibilidade**: rótulos, `aria-*`, foco visível, teclado, `<dialog>`, contraste. Não declare conformidade WCAG sem auditoria manual.
10. **Teste no navegador** o que mudou: desktop 1440 e mobile 390, teclado, sem erros de JS nem violações de CSP. Use a suíte Playwright (ver `tech.md`) e ajuste o teste da frente quando o comportamento mudar.
11. **Nunca modifique outros repositórios**: Design Hub (`figma-sd`), CTM, SCTEC original em Downloads, `C:\Kiro Projeto`. Confirme que o cwd é a raiz deste repositório antes de gravar.
12. **Nunca faça commit, push, merge nem deploy** sem autorização explícita.
13. **Preserve alterações não commitadas**: não há commit-base. Não use `git reset`, `checkout`, `clean` nem `stash`, e não apague nem sobrescreva arquivos, fixtures ou capturas de `docs/` (rode os testes numa cópia).
14. **Não invente regras de negócio nem interações do Figma**. Sem evidência (nó, reação, texto), registre a dúvida em `docs/` e pergunte.
15. **Relatórios concisos em português do Brasil**: o que mudou, nós do Figma usados, testes executados e limites. Informe o `git status`; como tudo é não rastreado, `git diff` não compara.

Ao concluir uma frente, atualize o doc correspondente em `docs/` e o `sctec-progress.md` (status, pendências e nós do Figma).
