# RELATORIO_TASKS – Inventário do Painel Administrativo (viera-motos)

Este relatório lista os arquivos do painel administrativo encontrados no repositório, sugestões do que pode ser removido (duplicado/obsoleto) e os arquivos essenciais que devem ser preservados. Nenhuma remoção foi feita; isto é apenas documentação.

## 1) Arquivos do Painel Administrativo (pertencentes ao admin)

HTML (rotas do admin)
- admin/admin.html
- admin/login.html
- admin/dashboard.html (atual redireciona para admin.html)
- admin/catalog.html (standalone antigo)
- admin/banners.html (standalone antigo)
- admin/forms.html (standalone antigo de leads)
- admin/settings.html (standalone antigo)
- admin/audit.html (standalone antigo)

Estilos
- admin/admin.css

JS – Núcleo atual (usados pelo admin unificado)
- admin/js/app.js (orquestra as views no admin.html)
- admin/js/auth/guard.js (proteção de sessão + visibilidade por papel)
- admin/js/auth/login.js (fluxo de login)
- admin/js/auth/logout.js (logout)
- admin/js/modules/firebase.js (Firebase v9 modular: app, auth, db, storage)
- admin/js/modules/auth.js (login/logout/papéis; resolve roles)
- admin/js/modules/router.js (navegação entre views)
- admin/js/modules/catalog.js (CRUD de models dentro do admin)
- admin/js/modules/leads.js (abas + leitura de testRides/orderQueries)
- admin/js/modules/banners.js (config/offer – alerta da home)
- admin/js/modules/banners-collection.js (CRUD da coleção banners)
- admin/js/modules/settings-general.js (CRUD de settings/general)
- admin/js/modules/audit-logs.js (listagem da coleção audit)
- admin/js/utils/roles.js (roles/{uid} + tabela de permissões)

JS – Suporte/seed (opcional durante a demo)
- admin/js/seed.js (popular dados de exemplo)

JS – Legado/standalone (usados pelas páginas antigas)
- admin/js/catalog.js (para admin/catalog.html)
- admin/js/banners.js (para admin/banners.html)
- admin/js/settings.js (para admin/settings.html)
- admin/js/forms.js (para admin/forms.html)
- admin/js/audit.js (para admin/audit.html)
- admin/js/dashboard.js (para admin/dashboard.html)
- admin/js/admin-auth-guard.js (legado compat)
- admin/js/admin-panel.js (legado compat)
- admin/js/admin-enhancements.js (legado compat)
- admin/js/leads-inbox.js (legado compat)
- admin/js/auth.js (legado compat)
- admin/js/auth/guard.js.bak (backup gerado durante ajustes)

## 2) Arquivos que podem ser removidos (duplicados/obsoletos)

Como agora o admin foi unificado em uma página (admin.html) e os módulos montáveis são chamados via `admin/js/app.js`, as páginas/arquivos standalone antigos podem ser descontinuados. Recomendação de remoção futura (após validação):

Páginas standalone antigas
- admin/catalog.html
- admin/banners.html
- admin/forms.html
- admin/settings.html
- admin/audit.html
- admin/dashboard.html (mantida apenas como redirect; opcional remover quando não for mais usada)

Scripts legacy/standalone (substituídos por módulos dentro do admin.html)
- admin/js/catalog.js
- admin/js/banners.js
- admin/js/settings.js
- admin/js/forms.js
- admin/js/audit.js
- admin/js/dashboard.js
- admin/js/admin-auth-guard.js
- admin/js/admin-panel.js
- admin/js/admin-enhancements.js
- admin/js/leads-inbox.js
- admin/js/auth.js
- admin/js/auth/guard.js.bak (backup – pode remover)

Observação: não apague nada ainda em produção; agende a limpeza quando confirmar que admin/admin.html cobre todos os fluxos.

## 3) Arquivos essenciais a preservar

- Configuração Firebase (admin):
  - admin/js/modules/firebase.js (inicialização app/auth/firestore/storage – v9 modular)
- Configuração Firebase (público):
  - assets/js/firebase-init.js (compat; usado pelas páginas públicas)
- Config gêmea em src (placeholder):
  - src/config/firebaseConfig.js (módulo ESM com placeholders – útil para futuros builds)
- Orquestração do admin:
  - admin/js/app.js, admin/js/auth/guard.js, admin/js/auth/login.js, admin/js/auth/logout.js
  - admin/js/modules/*.js (auth, router, catalog, leads, banners, banners-collection, settings-general, audit-logs, utils/roles)
- HTML unificado do painel:
  - admin/admin.html
- Diretório público (essencial para o site):
  - assets/** (css, js, images, videos)
- Páginas públicas (não fazem parte do painel, mas são críticas):
  - index.html, modelo.html, test-drive.html, financiamento.html, servicos.html, sobre.html, consulta.html
- Deploy/infra:
  - netlify.toml (headers e cache)

## 4) Observações finais

- O admin unificado (admin/admin.html) já monta as features internamente e dispensa páginas standalone. Após validação em produção, é recomendada a limpeza dos arquivos listados na seção 2.
- Roles: confirmar leitura de `roles/{uid}` nas regras Firestore para que o painel aplique corretamente Owner/Admin/Editor/Viewer.
- Banners: removida a exigência de índice composto (ordenando apenas por `order`).

