---
inclusion: always
---

# SCTEC Portal de Talentos: produto

## Propósito
Protótipo de empregabilidade do programa SCTEC (Governo de SC, SCTI, SENAI) que aproxima empresas parceiras de alunos formados nas trilhas do programa. É conteúdo demonstrativo para validar fluxos e interface contra o Figma. Não é produto em produção.

## Perfis
- **Administrador**: gerencia o banco de talentos (alunos), as empresas parceiras e os usuários administradores. Entrada: `#/sctec/admin/students`.
- **Empresa**: busca talentos e mantém o perfil da empresa. Entrada: `#/sctec/company/candidates`.
- **Aluno**: busca empresas e mantém o próprio perfil. Entrada: `#/sctec/student/companies`.
- **ACATE**: consulta somente as empresas disponíveis em sua listagem e pode editar dados, redefinir senha de forma simulada, ativar/inativar e aprovar/recusar solicitações elegíveis. Entrada: `#/sctec/acate/companies`. Não cria empresas nem executa operações reais. Não confundir o perfil com o atributo administrativo "associada à ACATE".

A escolha de perfil no login é um modal "apenas para testes". Os papéis exibidos não representam autorização real.

## Fluxos principais
O manifesto tem 11 jornadas, todas iniciadas no login.
- Aluno: buscar empresas e ver o perfil público da empresa; editar o perfil e ver o perfil público do talento.
- Empresa: buscar talentos e ver o perfil público do talento; ver o perfil da empresa.
- ACATE: consultar empresas disponíveis, editar seus dados, redefinir senha/ativar/inativar de forma simulada e aprovar ou recusar solicitações elegíveis.
- Administrador, Banco de Talentos: listar e filtrar alunos, ativar/inativar, redefinir senha, cadastrar aluno (manual ou por planilha), editar perfil.
- Administrador, Gestão de Empresas: listar e filtrar, revisar solicitações de cadastro, cadastrar e editar empresa, ativar/inativar, redefinir senha.
- Administrador, Usuários: listar e cadastrar administrador.

## Limitações do protótipo
- Sem backend, autenticação real ou persistência. Os dados são fictícios e ficam em memória; recarregar restaura os exemplos.
- Nenhum e-mail, mensagem, conta ou arquivo é enviado ou criado. As telas avisam que é simulação. Uploads são lidos localmente (FileReader).
- Catálogos (segmentos, cidades, cursos) e regras de negócio só existem quando confirmados no Figma ou pelo usuário.
- Páginas institucionais (`index.html`, `empresas*.html`) e `pages/_deprecated/` ficam fora da navegação do shell.
- O manifesto não declara perfis globais nem capabilities. Só anuncie o que estiver implementado e testado.

## Objetivos de UX
- Fidelidade ao Figma: layout, componentes, textos em PT-BR e interações.
- Fluxos completos e simulados, com validação, confirmações, estados vazios e feedback (toast ou diálogo) claros.
- Uso por teclado: `<dialog>` nativo, foco contido e devolvido ao acionador, Escape, `aria-*`.
- Responsivo (desktop 1440 px, mobile 390 px) sem overflow horizontal.
