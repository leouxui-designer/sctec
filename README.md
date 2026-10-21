# SCTEC — Portal de Talentos (viewer independente)

Este repositório contém uma cópia independente do protótipo SCTEC e a ponte mínima para o shell do Design Hub. A fonte original em Downloads é somente referência e não foi alterada.

## O que está incluído

- 19 telas e 11 jornadas verificadas do Portal de Talentos.
- IDs de telas e etapas preservados; o identificador desta integração local é sctec-portal-talentos-independent, separado da fixture mantida no Design Hub.
- Navegação standalone HTML/CSS/JavaScript e a ponte viewer.html/viewer.js.
- Navegação bidirecional com mensagens aditivas do protocolo v1.
- Nenhum perfil global nem capability opcional declarado.
- Páginas institucionais e conteúdo em pages/_deprecated permanecem fora da navegação do shell.

O site continua sendo conteúdo demonstrativo. Os nomes de papéis nas telas não representam autorização real.

## Executar e validar standalone

Requer Node.js. Não há dependências npm de runtime ou desenvolvimento; portanto não é necessário npm install nem lockfile.

~~~powershell
Set-Location 'C:\Users\leonardo.meirelles\Documents\prototypes\sctec-portal-talentos'
npm run dev
~~~

Abra http://127.0.0.1:4185/. Rotas verificadas incluem /pages/login.html, /pages/empresas.html e páginas mapeadas do Portal.

~~~powershell
npm test
npm run check
npm run build
~~~

## Configuração de staging

O servidor e o build estático usam `SCTEC_ENV=staging`, `SCTEC_VIEWER_ORIGIN` e `DESIGN_HUB_ORIGINS`. Staging exige HTTPS, origens exatas sem caminhos e nenhum valor padrão local. Para gerar artefatos: `SCTEC_ENV=staging SCTEC_VIEWER_ORIGIN=https://viewer.exemplo DESIGN_HUB_ORIGINS=https://design-hub.exemplo npm run build:staging`. O diretório `dist` é descartável e não deve ser versionado.

npm run build valida sintaxe, inventário de rotas, manifesto e referências locais; este site estático não precisa de bundler.

## Integrar localmente ao Design Hub

1. Inicie este viewer em http://127.0.0.1:4185.
2. Inicie Design Hub em http://127.0.0.1:5173 para uso manual.
3. Abra http://127.0.0.1:5173/__prototypes/sctec-portal-talentos-independent.

A rota de desenvolvimento carrega prototype-manifest.json como JSON pela origem loopback explicitamente configurada no Design Hub. O viewer não é importado nem executado na origem do shell. A leitura cross-origin do manifesto permite apenas as origens locais configuradas pelo servidor; o canal de mensagens valida origem, janela pai, versão e payload.

Para E2E, a configuração local usa o shell de teste em http://127.0.0.1:5186 e o viewer em http://127.0.0.1:4185:

~~~powershell
Set-Location 'C:\Users\leonardo.meirelles\Documents\figma-sd'
npm run prototype:sctec-independent:e2e
~~~

Pare os servidores nessas portas antes de rodar a suíte. A fixture antiga continua disponível em http://127.0.0.1:5173/__prototypes/sctec-public-site e não é redirecionada.

## Manifesto, protocolo e identidade

O manifesto neste repositório é a fonte de configuração do viewer. IDs de telas, jornadas e etapas são estáveis e devem ser preservados depois de compartilhados. Mudanças de rótulos não devem alterar IDs. A mudança do prototypeId distingue esta integração de desenvolvimento da fixture antiga; os IDs de tela e jornada foram mantidos.

A origem confiável não é definida pelo manifesto. A configuração controlada pelo Design Hub aponta para este viewer e para a origem loopback aprovada. O viewer permite a origem do shell de desenvolvimento por allowlist local. Mensagens nunca transportam credenciais, URLs arbitrárias ou dados de sessão Supabase.

## Proveniência, integridade e rollback

O conteúdo foi copiado da fixture atual em figma-sd/dev-prototypes/sctec; não foi movido. SOURCE-SHA256SUMS.txt registra hashes SHA-256 dos 48 arquivos da cópia de origem antes das alterações intencionais de identidade do manifesto e documentação deste repositório. A conferência inicial confirmou hash idêntico para todos os 48 arquivos copiados. Durante a validação, dois scripts inline já malformados no fixture (`pages/admin-aluno-perfil.html` e `pages/admin-aluno-cadastro.html`) foram corrigidos apenas nesta cópia independente para permitir o carregamento das telas; o fixture e a fonte SCTEC original continuam inalterados.

A origem de referência é C:\Users\leonardo.meirelles\Downloads\scte-para_empresas-v3 (4)\prototype; ela não foi modificada. O diretório da fixture do Design Hub também permanece intacto para comparação e rollback.

## Instruções para agentes

Leia AGENTS.md e .kiro/steering/prototype-constraints.md antes de editar. Esta pasta possui seu próprio Git, mas isso é isolamento de histórico, não uma sandbox de filesystem. Abra Codex/Kiro diretamente neste repositório, sem workspace multi-root gravável, e use permissões do sistema operacional/ferramenta para restringir escrita às pastas desta tarefa.
