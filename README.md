# Samuel Ramos — Portfolio

Portfolio personalizável com React, API Express e SQLite (sql.js/WASM). O site público é acessível em `/`; o painel separado fica em `/admin`.

## Requisitos

- Node.js 20.9 ou superior
- npm

## Desenvolvimento local

1. Instale as dependências:

   ```powershell
   npm.cmd install
   ```

2. Crie seu arquivo de ambiente a partir do exemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `SESSION_SECRET` em `.env`. Use uma senha longa e exclusiva; em produção, configure também a URL pública exata em `APP_ORIGIN`. O servidor lê as credenciais ao iniciar: sempre pare e inicie novamente `npm.cmd run dev` depois de alterar o `.env`.
4. Inicie o site e a API:

   ```powershell
   npm.cmd run dev
   ```

   Abra `http://localhost:5173` e acesse `/admin` para entrar no painel. O administrador é configurado pelo ambiente do servidor; não há senha padrão.

## Publicação

Execute `npm.cmd run build` e inicie com `npm.cmd start` no PowerShell do Windows, usando Node.js 20.9+. Configure `NODE_ENV=production`, `ADMIN_EMAIL`, uma senha `ADMIN_PASSWORD` com pelo menos 14 caracteres, `SESSION_SECRET` com pelo menos 32 caracteres, e `APP_ORIGIN` como a origem HTTPS do site. A aplicação serve os arquivos de `dist` e a API pelo mesmo servidor.

O arquivo `vercel.json` encaminha `/admin` à aplicação React para que a rota do painel não retorne um 404 da Vercel. Isso resolve apenas a navegação da interface. A API Express deste projeto foi preparada para rodar como servidor Node contínuo, e o banco SQLite e as imagens dependem de arquivos persistentes; uma publicação Vite estática na Vercel não executa esse servidor nem preserva esses arquivos. Para habilitar login, gerenciamento de conteúdo, envio de mensagens e imagens nesse provedor, é necessário hospedar a API em um serviço com armazenamento persistente ou adaptá-la a funções/serverless e a serviços gerenciados de banco e armazenamento.

SQLite e imagens ficam em `data/` e `uploads/`, ou nos caminhos absolutos informados por `DATA_DIR` e `UPLOAD_DIR`. O ambiente de hospedagem precisa oferecer armazenamento persistente para esses diretórios; volumes efêmeros ou plataformas serverless sem volume persistente não preservam os dados entre reinicializações. Faça backups regulares de ambos. Fotos de perfil e projetos são convertidas para WebP e limitadas a 8 MB no envio.

O formulário de contato salva as mensagens no banco de dados para consulta no painel administrativo; não envia e-mails automaticamente. Os níveis das habilidades começam em “Em aprendizado”, e projetos, instituições, cursos, certificações e experiências só aparecem após serem cadastrados no painel.

## Funcionalidades

- Interface responsiva em português e inglês, com preferência de idioma e tema preservada no navegador.
- Projetos, habilidades, formação, cursos, certificações e experiências editáveis e persistidos em SQLite.
- Upload de fotos otimizado, pré-visualização e ajuste do ponto de enquadramento.
- Painel autenticado com cookie `HttpOnly`, hash da sessão no banco, proteção `SameSite`, verificação de origem e limite de tentativas de login.
- Mensagens de contato persistidas e administráveis pelo painel.
