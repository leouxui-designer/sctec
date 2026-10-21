# Instruções para agentes — SCTEC Portal de Talentos

Este repositório é responsável somente pelo protótipo SCTEC aqui contido. O Design Hub é uma plataforma externa. Não edite o Design Hub, CTM, SCTEC original ou outros repositórios.

- Preserve os IDs estáveis de telas, jornadas e etapas no manifesto.
- Preserve o protocolo v1, o handshake, as allowlists de origem e a navegação standalone.
- Só anuncie capacidades implementadas e testadas; não invente perfis, rotas, capacidades nem regras de negócio.
- Não conecte serviços remotos, Supabase ou credenciais. Os dados são demonstração.
- Preserve o comportamento HTML/CSS/JavaScript multipágina; não introduza React, roteador ou framework sem necessidade aprovada.
- Este projeto é apenas um protótipo para testes de usabilidade, validado visualmente pelo responsável: priorize aparência convincente e economia de tokens, não funcionamento real.
- Não execute testes, builds, capturas de tela nem verificações no navegador por conta própria; rode npm test, npm run check e npm run build, além da validação E2E documentada no Design Hub, somente quando solicitado ou quando houver mudança de integração/manifesto.
- Revise git status e git diff antes de relatar; não faça commit, push ou publicação sem pedido explícito.

Instruções e repositórios separados reduzem erros organizacionais, mas não restringem o acesso ao filesystem. Use um workspace de raiz única e permissões do sistema operacional ou da ferramenta para limitar escrita.
