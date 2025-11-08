# ARQUITETURA DO PROJETO – Viera Motos

Este documento descreve a estrutura de pastas/arquivos do projeto, separando o que pertence ao site público e ao painel admin. Também lista os módulos e fluxos principais.

## Visão Geral
- Stack: HTML, CSS, JavaScript (ES Modules para admin), Firebase Auth, Firestore e Storage.
- Site público: páginas estáticas que consomem dados do Firestore e usam Firebase compat (via tags <script>). 
- Admin: painel modular (ES Modules + Firebase v9 modular) para CRUD de catálogo, banners/alerta e leitura de leads, com controle de acesso por papéis.

## Estrutura de Pastas e Arquivos

Raiz do projeto:
- `index.html` (público)
- `modelo.html` (público)
- `test-drive.html` (público)
- `financiamento.html` (público)
- `servicos.html` (público)
- `sobre.html` (público)
- `consulta.html` (público)
- `netlify.toml` (deploy/headers)
- `README.md` (documentação do projeto)
- `RELATORIO.md` (relatórios técnicos por etapa)
- `.github/copilot-instructions.md` (meta)

Diretórios:
- `assets/` (público)
  - `css/`
    - `style.css`
    - `animations.css`
    - `responsive.css`
    - `models.css`
  - `js/`
    - `firebase-init.js` (config compat pública)
    - `home-dynamic.js` (carrega modelos na home)
    - `main.js` (efeitos globais)
    - `menu.js` (hambúrguer mobile)
    - `modelo-dynamic.js` (página de modelo)
    - `slider.js` (placeholder de slider)
    - `test-drive.js` (envio de test-ride)
  - `images/`
    - `placeholder-moto.svg`
    - `banners/hero-poster.svg`
    - `icons/icon-engine.svg`
    - `logo/logo-avelloz-placeholder.svg`
  - `videos/`
    - `az160.mp4`
- `components/` (público – snippets HTML)
  - `banner.html`
  - `footer.html`
  - `header.html`
  - `moto-card.html`
- `admin/` (admin)
  - `admin.html`
  - `admin.css`
  - `js/`
    - Compat (legado, mantidos para referência):
      - `admin-auth-guard.js`
      - `auth.js`
      - `leads-inbox.js`
      - `admin-panel.js`
      - `admin-enhancements.js`
    - App modular (novo, ES Modules):
      - `app.js` (bootstrap do painel)
      - `modules/`
        - `firebase.js` (init modular)
        - `auth.js` (login/logout/papéis)
        - `router.js` (navegação entre views)
        - `banners.js` (CRUD de alerta/config/offer)
        - `leads.js` (leitura de testRides e orderQueries)
        - `catalog.js` (CRUD de models com upload)
- `docs/` (documentação)
  - `ARQUITETURA.md` (este documento)

## Classificação: Público vs Admin
- Público:
  - Raiz: `index.html`, `modelo.html`, `test-drive.html`, `financiamento.html`, `servicos.html`, `sobre.html`, `consulta.html`
  - `assets/**`: CSS/JS/Images/Videos
  - `components/**`: HTML parciais
  - Config de deploy: `netlify.toml`
- Admin:
  - `admin/**`: `admin.html`, `admin.css` e todo `admin/js/**`
- Compartilhado/Meta:
  - `README.md`, `RELATORIO.md`, `.github/**`, `docs/**`

## Fluxos e Coleções (Firestore)
- `models` (site + admin)
  - Campos típicos: `name`, `price`, `tagline`, `colors[] { name, imageUrl, storagePath }`, `specs[] { name, value }`, `updatedAt`
  - Usado por: `assets/js/home-dynamic.js`, `assets/js/modelo-dynamic.js`, `admin/js/modules/catalog.js`
- `config/offer` (site + admin)
  - Campos: `text`, `active`, `updatedAt`
  - Usado por: `assets/js/home-dynamic.js`, `admin/js/modules/banners.js`
- `config/contact` (site público)
  - Campos: `whatsapp`, `email`
  - Usado por: `assets/js/test-drive.js`
- `config/admins` (admin)
  - Campos: `emails: string[]` (fallback para papel admin)
- `testRides` (público → admin)
  - Criado por `assets/js/test-drive.js`; lido por `admin/js/modules/leads.js`
- `orderQueries` (público → admin)
  - Criado por script inline em `consulta.html`; lido por `admin/js/modules/leads.js`

## Storage (Firebase Storage)
- `models/{modelId}/...` – imagens das cores (upload via `catalog.js`).

## Observações
- Site público usa Firebase compat (v9 compat) via `<script>`; admin usa Firebase v9 modular (ES Modules) e não altera o visual.
- `netlify.toml` define cache agressivo para `/assets/*` e `no-cache` para HTML.

