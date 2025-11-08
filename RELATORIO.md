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

# RELATÓRIO TÉCNICO – Banners (Etapa adicional)

Entregas:
- `admin/banners.html`: página dedicada ao CRUD de banners, com preview de imagem.
- `admin/js/banners.js`: CRUD em `banners` com campos `title`, `imageUrl`, `ctaText`, `ctaUrl`, `order`, `published` e `updatedAt`.
  - Lista em tempo real (onSnapshot) ordenada por `order` e `updatedAt`.
  - Permissões: Owner/Admin/Editor podem salvar; apenas Owner/Admin excluem.
- Integração na home pública:
  - `assets/js/home-dynamic.js`: busca banners publicados e cria/injeta um container `#home-banners` logo após o hero, renderizando cards simples (sem alterar o CSS global). Caso `#home-banners` já exista, renderiza nele.

Validações:
- Criação/edição/exclusão de banners reflete na home sem recarregar a configuração do site (após reload de página pública).
- Respeito a papéis para proteger ações.

# RELATÓRIO TÉCNICO – Leads/Formulários (Etapa adicional)

Entregas:
- Site público:
  - `assets/js/leads.js`: expõe `window.addLead(data)` para envio de leads ao Firestore (testRides) com campos: name, phone, email, model, message, createdAt.
  - `test-drive.html`: inclui `assets/js/leads.js` após `firebase-init.js`.
  - `assets/js/test-drive.js`: passa a usar `addLead()` quando disponível, mantendo fallback para `firestore.collection('testRides').add(...)`.
- Admin:
  - `admin/forms.html`: página para listagem de leads (testRides) com total e botão "Exportar CSV".
  - `admin/js/forms.js`: assinatura em tempo real (`onSnapshot`) da coleção `testRides`, renderiza tabela e exporta CSV com cabeçalhos: Nome, Telefone, Email, Modelo, Mensagem, Data.

Validações/Requisitos atendidos:
- Integração do formulário de test-drive com Firestore via função `addLead()`.
- Listagem administrativa em tempo real e exportação CSV.

# RELATÓRIO TÉCNICO – Configurações Gerais (Settings)

Entregas:
- `admin/settings.html`: página para editar configurações gerais, mantendo o layout existente do admin.
- `admin/js/settings.js`: CRUD do documento único `settings/general` no Firestore com campos:
  - `title`, `description`
  - `social { instagram, facebook, youtube, tiktok }`
  - `contacts { email, phone, address, whatsapp }`
  - `brand { primary, secondary, dark, light }`
- Permissões: Owner/Admin/Editor podem editar; Viewer somente leitura (botões/campos desabilitados).

Validações:
- Carregamento e salvamento com `merge: true`, preservando campos não editados.
- Cores normalizadas em hex (#RRGGBB).
