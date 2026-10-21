# Registro da extração local

- Origem copiada: `figma-sd/dev-prototypes/sctec`.
- Inventário inicial: 48 arquivos com SHA-256 em `SOURCE-SHA256SUMS.txt`; comparação inicial confirmou igualdade integral antes dos ajustes de identidade/configuração.
- Identidade da integração independente: `sctec-portal-talentos-independent`; IDs de tela, jornada e etapa foram mantidos.
- Exceções intencionais: manifesto, README, servidor/configuração e arquivos de instrução/teste deste repositório.
- Correção de validação: foram removidos fragmentos JavaScript inline órfãos que causavam `Unexpected token '<'` e `Unexpected token '}'` nas cópias de `pages/admin-aluno-perfil.html` e `pages/admin-aluno-cadastro.html`. Essas duas diferenças são exclusivas desta cópia independente; o fixture do Design Hub e a fonte SCTEC original não foram modificados.
- Repositório Git local criado sem remote e sem commit. Publicação continua pendente de decisão futura.
