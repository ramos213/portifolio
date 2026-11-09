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

## Publicação na Vercel

O projeto inclui uma função serverless em `api/index.js`. Ela usa Neon Postgres para dados persistentes e Vercel Blob para imagens. A primeira solicitação cria automaticamente as tabelas necessárias.

1. Na Vercel, abra o projeto `portifolio` e vá para **Storage**.
2. Crie ou conecte um banco **Neon Postgres** ao projeto. Confirme que a integração disponibilizou `DATABASE_URL` nos ambientes **Production** e **Preview**.
3. Crie uma loja **Vercel Blob** com acesso **público** para as fotos do portfólio. Confirme que `BLOB_READ_WRITE_TOKEN` está disponível nos mesmos ambientes.
4. Em **Settings → Environment Variables**, adicione:
   - `ADMIN_EMAIL`: e-mail que você usará para entrar no painel.
   - `ADMIN_PASSWORD`: senha exclusiva, com pelo menos 14 caracteres.
   - `SESSION_SECRET`: segredo aleatório com pelo menos 32 caracteres. Gere um com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
   - `APP_ORIGIN`: URL exata do site publicado, como `https://portifolio-seven-gilt-76.vercel.app`, sem barra no final.
5. Selecione **Production** (e **Preview**, se desejar testar em prévias) para cada variável e salve. Não coloque esses segredos no GitHub nem os compartilhe.
6. Abra **Deployments** e faça **Redeploy** da implantação mais recente. Um novo deploy também inicia automaticamente depois que as alterações deste projeto forem enviadas ao GitHub.
7. Teste `https://seu-dominio.vercel.app/api/health` (deve responder `{"ok":true}`) e depois abra `https://seu-dominio.vercel.app/admin`.

Os uploads de imagem na Vercel têm limite de 4 MB por arquivo para respeitar os limites de solicitações das funções. As imagens aceitas são convertidas para WebP e armazenadas no Blob público.

## Publicação em um servidor Node.js próprio

Use Node.js 20.9 ou superior, configure `NODE_ENV=production`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` e `APP_ORIGIN`, e execute `npm.cmd run build` seguido de `npm.cmd start`. Nesse modo, o aplicativo pode usar o SQLite e o armazenamento local nas pastas `data/` e `uploads/`; escolha uma hospedagem com disco persistente e faça backups.

O formulário de contato salva as mensagens no banco de dados para consulta no painel administrativo; não envia e-mails automaticamente. Os níveis das habilidades começam em “Em aprendizado”, e projetos, instituições, cursos, certificações e experiências só aparecem após serem cadastrados no painel.

## Funcionalidades

- Interface responsiva em português e inglês, com preferência de idioma e tema preservada no navegador.
- Projetos, habilidades, formação, cursos, certificações e experiências editáveis e persistidos em SQLite.
- Upload de fotos otimizado, pré-visualização e ajuste do ponto de enquadramento.
- Painel autenticado com cookie `HttpOnly`, hash da sessão no banco, proteção `SameSite`, verificação de origem e limite persistente de tentativas de login.
- Mensagens de contato persistidas em Neon e administráveis pelo painel.
