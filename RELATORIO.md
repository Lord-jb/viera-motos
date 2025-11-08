# RELATÓRIO TÉCNICO – Estado Inicial do Projeto

Projeto: Viera Motos
Data: 2025-11-08

Resumo técnico inicial do estado atual:
- Site público responsivo em HTML/CSS/JS, usando Firebase compat (v9 compat via `<script>`) e Firestore para dados dinâmicos.
- Páginas principais: `index.html`, `modelo.html`, `test-drive.html`, `financiamento.html`, `servicos.html`, `sobre.html`, `consulta.html`.
- Dados/coleções em uso: `models`, `config/offer`, `config/contact`, `testRides`, `orderQueries`.
- Deploy: `netlify.toml` com cache agressivo para assets e no-cache para HTML.
- Pontos de atenção: padronizar UTF-8 e acentuação nos HTML públicos; garantir regras do Firestore/Storage para leitura/escrita durante a demo.

# RELATÓRIO TÉCNICO – Admin Modular (Etapa 1)

Projeto: Viera Motos
Data: 2025-11-08

## Objetivo da Etapa
- Iniciar o modo “Principal Software Architect” para o painel admin.
- Migrar o admin para arquitetura modular com ES Modules (Firebase v9 modular).
- Conectar autenticação e papéis, e habilitar CRUD de banners, catálogo e leitura de leads.
- Manter o design/visual existente (sem alterações de layout).

## Entregáveis desta Etapa
- Estrutura modular criada em `admin/js/`:
  - `modules/firebase.js`: inicialização (app, auth, db, storage) com Firebase v9 modular.
  - `modules/auth.js`: login/logout, observador de auth e resolução de papéis (`users/{uid}.role` com fallback `config/admins.emails`).
  - `modules/router.js`: roteador simples de views (`.view` + menu lateral `data-view`).
  - `modules/banners.js`: CRUD de alerta da Home em `config/offer` (texto + ativo).
  - `modules/leads.js`: leitura de `testRides` e `orderQueries` com tabs.
  - `modules/catalog.js`: CRUD dos modelos (id/nome/preço/tagline/cores/specs) com upload para Storage.
  - `app.js`: bootstrap do painel (auth + papéis + montagem das features), carregado com `type="module"`.

- `admin/admin.html` atualizado apenas no que diz respeito a scripts (sem mudar layout):
  - Mantido o markup e CSS existentes.
  - Habilitado login (seção já presente) e painel `#admin-panel` por trás do auth.
  - Scripts antigos substituídos por um único `type="module" src="js/app.js"`.

## Controle de Acesso
- Papéis previstos: `admin`, `editor`, `viewer`.
  - `admin`: catálogo completo, banners, exclusão, futuras configurações.
  - `editor`: catálogo e banners (sem exclusão crítica adicional além de modelos), leitura de leads.
  - `viewer`: apenas leitura de leads.
- Resolução de papel em `modules/auth.js`:
  1. Lê `users/{uid}.role` (se definido, usa).
  2. Fallback: se email em `config/admins.emails`, concede `admin`.
  3. Caso contrário, `viewer`.

## Decisões de Arquitetura
- ES Modules no admin para isolamento e legibilidade: cada recurso tem seu módulo.
- Firebase v9 modular com imports de CDN. O site público permanece em compat; o admin é independente.
- Sem alteração de layout: UI injetada dentro das `<div class="view">` existentes, reusando classes do CSS.

## Testes e Validações (planejado em ambiente real)
1. Login/logout com usuário válido.
2. Verificar papel resolvido e visibilidade de menus/views (admin/editor/viewer).
3. Banners: salvar/ler `config/offer` e confirmar efeito na home (banner injetado pelo JS público).
4. Catálogo: criar modelo, adicionar cores (upload Storage) e specs; editar e excluir (admin).
5. Leads: listar `testRides` e `orderQueries` em ordem de `createdAt desc`.

Observação: no ambiente local com rede restrita, não é possível validar chamadas ao Firebase. Em produção, as ações dependem das regras do Firestore/Storage.

## Próximos Passos (Etapa 2)
- Configurações: módulo para `config/contact` (whatsapp/email) e gerenciamento de admins.
- Refino de mensagens/feedback e estados de carregamento.
- Guarda adicional de navegação por papel (esconder links não permitidos no menu).
- Scripts de smoke test automatizados (sem rede) para validação de DOM e eventos.
