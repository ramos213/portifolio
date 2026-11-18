import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import sharp from "sharp";
import { neon } from "@neondatabase/serverless";
import { del as deleteBlob, put as putBlob } from "@vercel/blob";
import initSqlJs from "sql.js";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(root, "..");
dotenv.config({ path: path.join(projectRoot, ".env") });
const dataDir = path.resolve(process.env.DATA_DIR || path.join(projectRoot, "data"));
const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(projectRoot, "uploads"));
const isVercel = process.env.VERCEL === "1";
const postgres = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
if (isVercel && (!postgres || !process.env.BLOB_READ_WRITE_TOKEN)) {
  throw new Error("Conecte um banco Neon e uma loja Vercel Blob ao projeto antes de usar a API na Vercel.");
}
let sqlite;
let persistDatabase = () => {};
if (!postgres) {
  await mkdir(dataDir, { recursive: true });
  if (!isVercel) await mkdir(uploadDir, { recursive: true });
  const databaseFile = path.join(dataDir, "portfolio.db");
  const require = createRequire(import.meta.url);
  const SQL = await initSqlJs({ locateFile: (file) => path.join(path.dirname(require.resolve("sql.js")), file) });
  sqlite = existsSync(databaseFile) ? new SQL.Database(new Uint8Array(readFileSync(databaseFile))) : new SQL.Database();
  persistDatabase = () => writeFileSync(databaseFile, Buffer.from(sqlite.export()));
}

const db = {
  async exec(statement) {
    if (postgres) {
      for (const command of statement.split(";").map((part) => part.trim()).filter(Boolean)) await postgres.query(command);
    } else {
      sqlite.run(statement);
      persistDatabase();
    }
  },
  prepare(statement) {
    let placeholder = 0;
    const query = async (method, params) => {
      if (postgres) {
        placeholder = 0;
        let command = statement.replace(/\?/g, () => `$${++placeholder}`);
        const mutating = /^\s*(INSERT|UPDATE|DELETE)\b/i.test(command);
        if (mutating && !/\bRETURNING\b/i.test(command)) {
          const table = command.match(/^\s*(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+"?([a-z_]+)"?/i)?.[1];
          command += ["projects", "skills", "timeline", "messages"].includes(table) ? " RETURNING id" : " RETURNING 1 AS __changed";
        }
        const rows = await postgres.query(command, params);
        if (method === "all") return rows;
        if (method === "get") return rows[0];
        return { changes: rows.length, lastInsertRowid: rows[0]?.id };
      }

      if (method === "run") {
        sqlite.run(statement, params);
        const result = { changes: sqlite.getRowsModified(), lastInsertRowid: sqlite.exec("SELECT last_insert_rowid() AS id")[0]?.values[0]?.[0] };
        persistDatabase();
        return result;
      }
      const prepared = sqlite.prepare(statement);
      prepared.bind(params);
      try {
        if (method === "get") return prepared.step() ? prepared.getAsObject() : undefined;
        const result = [];
        while (prepared.step()) result.push(prepared.getAsObject());
        return result;
      } finally { prepared.free(); }
    };
    return {
      get: (...params) => query("get", params),
      all: (...params) => query("all", params),
      run: (...params) => query("run", params),
    };
  },
};

const schema = postgres ? `
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, description_pt TEXT NOT NULL DEFAULT '',
    description_en TEXT NOT NULL DEFAULT '', category_pt TEXT NOT NULL DEFAULT '',
    category_en TEXT NOT NULL DEFAULT '', technologies TEXT NOT NULL DEFAULT '[]',
    github TEXT NOT NULL DEFAULT '', demo TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
    description_pt TEXT NOT NULL DEFAULT '', description_en TEXT NOT NULL DEFAULT '',
    level TEXT NOT NULL DEFAULT 'Em aprendizado', icon TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS timeline (
    id SERIAL PRIMARY KEY, type TEXT NOT NULL DEFAULT 'education',
    title_pt TEXT NOT NULL, title_en TEXT NOT NULL DEFAULT '', organization TEXT NOT NULL DEFAULT '',
    description_pt TEXT NOT NULL DEFAULT '', description_en TEXT NOT NULL DEFAULT '',
    period TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
    message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY, expires_at BIGINT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    attempt_key TEXT PRIMARY KEY, window_start BIGINT NOT NULL, attempts INTEGER NOT NULL
  );
` : `
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description_pt TEXT NOT NULL DEFAULT '',
    description_en TEXT NOT NULL DEFAULT '', category_pt TEXT NOT NULL DEFAULT '',
    category_en TEXT NOT NULL DEFAULT '', technologies TEXT NOT NULL DEFAULT '[]',
    github TEXT NOT NULL DEFAULT '', demo TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL,
    description_pt TEXT NOT NULL DEFAULT '', description_en TEXT NOT NULL DEFAULT '',
    level TEXT NOT NULL DEFAULT 'Em aprendizado', icon TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL DEFAULT 'education',
    title_pt TEXT NOT NULL, title_en TEXT NOT NULL DEFAULT '', organization TEXT NOT NULL DEFAULT '',
    description_pt TEXT NOT NULL DEFAULT '', description_en TEXT NOT NULL DEFAULT '',
    period TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
    message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    attempt_key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, attempts INTEGER NOT NULL
  );
`;
await db.exec(schema);

const setting = async (key, fallback) => {
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row ? JSON.parse(row.value) : fallback;
};
const saveSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
const saveJson = (key, value) => saveSetting.run(key, JSON.stringify(value));

const defaultProfile = {
  name: "Samuel Ramos",
  title_pt: "Desenvolvedor em formação | Estudante de Análise e Desenvolvimento de Sistemas",
  title_en: "Developer in training | Systems Analysis and Development student",
  about_pt: "Sou estudante de Análise e Desenvolvimento de Sistemas, construindo minha trajetória em tecnologia com curiosidade, consistência e vontade de aprender. Tenho interesse em desenvolvimento de software, inteligência artificial e arquitetura de sistemas. Busco uma oportunidade de estágio em TI para contribuir, aprender com projetos reais e evoluir junto com uma equipe.",
  about_en: "I am a Systems Analysis and Development student, building my career in technology with curiosity, consistency, and a desire to learn. I am interested in software development, artificial intelligence, and systems architecture. I am looking for an IT internship where I can contribute, learn from real-world projects, and grow with a team.",
  email: "", github: "", linkedin: "", whatsapp: "", photo: "", photoPosition: "50% 50%",
};
if (!(await setting("profile", null))) await saveJson("profile", defaultProfile);

const initialSkills = [
  ["HTML5", "Front-end", "Estruturação semântica de páginas web.", "Semantic structure for web pages.", "Em aprendizado", "html5"],
  ["CSS3", "Front-end", "Estilização e construção de layouts responsivos.", "Styling and building responsive layouts.", "Em aprendizado", "css3"],
  ["JavaScript", "Front-end", "Fundamentos de programação e interatividade.", "Programming fundamentals and interactivity.", "Em aprendizado", "javascript"],
  ["React.js", "Front-end", "Interfaces desenvolvidas com componentes reutilizáveis.", "Interfaces built with reusable components.", "Em aprendizado", "react"],
  ["Node.js", "Back-end", "Fundamentos de JavaScript no servidor.", "JavaScript fundamentals on the server.", "Em aprendizado", "nodedotjs"],
  ["TypeScript", "Back-end", "JavaScript com tipagem estática.", "JavaScript with static typing.", "Em aprendizado", "typescript"],
  ["SQL", "Banco de dados", "Consultas e fundamentos de bancos relacionais.", "Queries and relational database fundamentals.", "Em aprendizado", "postgresql"],
  ["Git", "Ferramentas", "Versionamento e acompanhamento de alterações.", "Version control and change tracking.", "Em aprendizado", "git"],
  ["GitHub", "Ferramentas", "Hospedagem e colaboração em projetos de código.", "Code hosting and project collaboration.", "Em aprendizado", "github"],
  ["Visual Studio Code", "Ferramentas", "Editor de código e ambiente de desenvolvimento.", "Code editor and development environment.", "Em aprendizado", "visualstudiocode"],
  ["Inteligência Artificial", "Outros", "Interesse em aplicações e conceitos de IA.", "Interest in AI concepts and applications.", "Em aprendizado", "openai"],
  ["Lógica de programação", "Outros", "Resolução estruturada de problemas.", "Structured problem solving.", "Em aprendizado", "code"],
  ["Análise de sistemas", "Outros", "Compreensão de requisitos e soluções de software.", "Understanding software requirements and solutions.", "Em aprendizado", "system"],
];
if ((await db.prepare("SELECT COUNT(*) AS count FROM skills").get()).count === 0) {
  const insert = db.prepare("INSERT INTO skills (name, category, description_pt, description_en, level, icon) VALUES (?, ?, ?, ?, ?, ?)");
  for (const skill of initialSkills) await insert.run(...skill);
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: isVercel ? "4mb" : "100kb" }));
if (!isVercel) app.use("/uploads", express.static(uploadDir, { fallthrough: false, maxAge: "1d" }));
const isProduction = process.env.NODE_ENV === "production" || isVercel;
const password = process.env.ADMIN_PASSWORD || "";
const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const sessionSecret = process.env.SESSION_SECRET || "";
if (isProduction && (!adminEmail || password.length < 14 || sessionSecret.length < 32)) {
  throw new Error("Configure ADMIN_EMAIL, ADMIN_PASSWORD (14+ caracteres) e SESSION_SECRET (32+ caracteres) para produção.");
}
const passwordSalt = sessionSecret || "local-development-only-salt";
const passwordHash = password ? scryptSync(password, passwordSalt, 64) : null;
const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const cookieName = isProduction ? "__Host-portfolio_session" : "portfolio_session";
const getCookie = (header, name) => header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
const clearCookie = (res) => res.clearCookie(cookieName, { httpOnly: true, secure: isProduction, sameSite: "strict", path: "/" });
const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

async function removeUnusedUpload(image) {
  if (!image) return;
  const profile = await setting("profile", defaultProfile);
  if (profile.photo === image || (await db.prepare("SELECT COUNT(*) AS count FROM projects WHERE image = ?").get(image))?.count) return;
  if (isVercel) {
    const hostname = new URL(image).hostname;
    if (hostname.endsWith(".public.blob.vercel-storage.com")) await deleteBlob(image);
    return;
  }
  if (!image.startsWith("/uploads/")) return;
  try { await unlink(path.join(uploadDir, path.basename(image))); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
}

const requireAdmin = asyncHandler(async (req, res, next) => {
  const token = getCookie(req.headers.cookie, cookieName);
  if (!token) return res.status(401).json({ error: "Autenticação necessária." });
  const session = await db.prepare("SELECT expires_at FROM sessions WHERE token_hash = ?").get(hashToken(token));
  if (!session || session.expires_at < Date.now()) {
    if (session) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
    clearCookie(res);
    return res.status(401).json({ error: "Sessão expirada. Entre novamente." });
  }
  next();
});
function sameOrigin(req, res, next) {
  let origin;
  try { origin = new URL(req.get("origin")).origin; }
  catch { return res.status(403).json({ error: "Origem da solicitação não autorizada." }); }

  const allowed = new Set([`${req.protocol}://${req.get("host")}`]);
  if (process.env.APP_ORIGIN) {
    try { allowed.add(new URL(process.env.APP_ORIGIN).origin); }
    catch { return res.status(500).json({ error: "APP_ORIGIN deve ser uma URL válida." }); }
  }
  if (!isProduction) {
    allowed.add("http://localhost:5173");
    allowed.add("http://127.0.0.1:5173");
    if (origin.startsWith("http://") && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname)) allowed.add(origin);
  }
  if (!allowed.has(origin)) return res.status(403).json({ error: "Origem da solicitação não autorizada." });
  next();
}
const loginWindowMs = 15 * 60 * 1000;
const loginLimit = 8;
const loginLimiter = asyncHandler(async (req, res, next) => {
  const now = Date.now();
  const resetBefore = now - loginWindowMs;
  await db.prepare("DELETE FROM login_attempts WHERE window_start < ?").run(now - 24 * 60 * 60 * 1000);
  const record = await db.prepare(`
    INSERT INTO login_attempts (attempt_key, window_start, attempts) VALUES (?, ?, 1)
    ON CONFLICT(attempt_key) DO UPDATE SET
      attempts = CASE WHEN login_attempts.window_start <= ? THEN 1 ELSE login_attempts.attempts + 1 END,
      window_start = CASE WHEN login_attempts.window_start <= ? THEN ? ELSE login_attempts.window_start END
    RETURNING attempts, window_start
  `).get(hashToken(req.ip || "unknown"), now, resetBefore, resetBefore, now);
  if (record.attempts > loginLimit) {
    res.set("Retry-After", String(Math.ceil((Number(record.window_start) + loginWindowMs - now) / 1000)));
    return res.status(429).json({ error: "Muitas tentativas de login. Aguarde 15 minutos." });
  }
  next();
});
const rows = (table) => db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
const validateText = (value, max, field, optional = false) => {
  if (typeof value !== "string" || (!optional && !value.trim()) || value.length > max) throw new Error(`${field} inválido.`);
  return value.trim();
};
const validateWebUrl = (value, field) => {
  const url = validateText(value || "", 500, field, true);
  if (!url) return "";
  try {
    if (!["http:", "https:"].includes(new URL(url).protocol)) throw new Error();
  } catch {
    throw new Error(`${field} deve ser um endereço HTTP ou HTTPS válido.`);
  }
  return url;
};
const parseProject = (body) => ({
  name: validateText(body.name, 120, "Nome do projeto"),
  description_pt: validateText(body.description_pt || "", 3000, "Descrição PT", true),
  description_en: validateText(body.description_en || "", 3000, "Descrição EN", true),
  category_pt: validateText(body.category_pt || "", 80, "Categoria PT", true),
  category_en: validateText(body.category_en || "", 80, "Categoria EN", true),
  technologies: JSON.stringify(Array.isArray(body.technologies) ? body.technologies.slice(0, 20).map((value) => validateText(value, 40, "Tecnologia")) : []),
  github: validateWebUrl(body.github, "GitHub"),
  demo: validateWebUrl(body.demo, "Demonstração"),
  image: body.image?.startsWith("/uploads/") ? validateText(body.image, 500, "Imagem", true) : validateWebUrl(body.image, "Imagem"),
  featured: body.featured ? 1 : 0,
});
const collections = {
  projects: { table: "projects", fields: ["name", "description_pt", "description_en", "category_pt", "category_en", "technologies", "github", "demo", "image", "featured"], parse: parseProject },
  skills: {
    table: "skills", fields: ["name", "category", "description_pt", "description_en", "level", "icon"],
    parse: (b) => ({
      name: validateText(b.name, 80, "Nome"), category: validateText(b.category, 80, "Categoria"),
      description_pt: validateText(b.description_pt || "", 500, "Descrição PT", true),
      description_en: validateText(b.description_en || "", 500, "Descrição EN", true),
      level: validateText(b.level || "Em aprendizado", 60, "Nível"),
      icon: validateText(b.icon || "", 80, "Ícone", true),
    }),
  },
  timeline: {
    table: "timeline", fields: ["type", "title_pt", "title_en", "organization", "description_pt", "description_en", "period"],
    parse: (b) => ({
      type: ["education", "course", "certification", "experience"].includes(b.type) ? b.type : "education",
      title_pt: validateText(b.title_pt, 160, "Título PT"), title_en: validateText(b.title_en || "", 160, "Título EN", true),
      organization: validateText(b.organization || "", 160, "Instituição", true),
      description_pt: validateText(b.description_pt || "", 1200, "Descrição PT", true),
      description_en: validateText(b.description_en || "", 1200, "Descrição EN", true),
      period: validateText(b.period || "", 100, "Período", true),
    }),
  },
};

app.get("/api/health", asyncHandler(async (_req, res) => {
  if (postgres) await postgres`SELECT 1`;
  res.json({ ok: true });
}));
app.get("/api/portfolio", asyncHandler(async (_req, res) => res.json({
  profile: await setting("profile", defaultProfile),
  projects: await rows("projects"),
  skills: await rows("skills"),
  timeline: await rows("timeline"),
})));
app.post("/api/contact", sameOrigin, rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), asyncHandler(async (req, res) => {
  let name;
  let email;
  let message;
  try {
    name = validateText(req.body.name, 100, "Nome");
    email = validateText(req.body.email, 254, "E-mail");
    message = validateText(req.body.message, 3000, "Mensagem");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Informe um e-mail válido." });
  } catch (error) { res.status(400).json({ error: error.message }); }
  await db.prepare("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)").run(name, email, message);
  res.status(201).json({ ok: true });
}));
app.post("/api/admin/login", sameOrigin, loginLimiter, asyncHandler(async (req, res) => {
  if (!passwordHash || !adminEmail) return res.status(503).json({ error: "Configure as credenciais do administrador no servidor." });
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const supplied = typeof req.body.password === "string" ? req.body.password : "";
  const candidate = scryptSync(supplied, passwordSalt, 64);
  if (email !== adminEmail || !timingSafeEqual(candidate, passwordHash)) return res.status(401).json({ error: "E-mail ou senha incorretos." });
  await db.prepare("DELETE FROM login_attempts WHERE attempt_key = ?").run(hashToken(req.ip || "unknown"));
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  await db.prepare("INSERT INTO sessions (token_hash, expires_at) VALUES (?, ?)").run(hashToken(token), expiresAt);
  res.cookie(cookieName, token, { httpOnly: true, secure: isProduction, sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 * 1000 });
  res.json({ ok: true });
}));
app.get("/api/admin/me", requireAdmin, (_req, res) => res.json({ ok: true }));
app.post("/api/admin/logout", sameOrigin, requireAdmin, asyncHandler(async (req, res) => {
  const token = getCookie(req.headers.cookie, cookieName);
  await db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  clearCookie(res);
  res.json({ ok: true });
}));
app.put("/api/admin/profile", sameOrigin, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const current = await setting("profile", defaultProfile);
    const keys = ["name", "title_pt", "title_en", "about_pt", "about_en", "email", "github", "linkedin", "whatsapp"];
    const next = { ...current };
    for (const key of keys) {
      if (key in req.body) {
        next[key] = ["github", "linkedin"].includes(key)
          ? validateWebUrl(req.body[key], key)
          : validateText(req.body[key], key.startsWith("about") ? 5000 : 500, key, ["email", "whatsapp"].includes(key));
      }
    }
    if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) return res.status(400).json({ error: "Informe um e-mail válido." });
    await saveJson("profile", next);
    res.json(next);
  } catch (error) { res.status(400).json({ error: error.message }); }
}));
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: isVercel ? 4 * 1024 * 1024 : 8 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.mimetype)) {
    const error = new Error("Envie uma imagem JPG, PNG, WebP ou AVIF.");
    error.status = 400;
    return cb(error);
  }
  cb(null, true);
} });
const optimizeUpload = async (buffer, filename, width, height, quality) => {
  try {
    const optimized = await sharp(buffer).rotate().resize(width, height, { fit: "inside", withoutEnlargement: true }).webp({ quality }).toBuffer();
    if (isVercel) {
      const blob = await putBlob(filename, optimized, { access: "public", contentType: "image/webp", addRandomSuffix: false });
      return blob.url;
    }
    writeFileSync(path.join(uploadDir, filename), optimized);
    return `/uploads/${filename}`;
  }
  catch (error) {
    if (/corrupt|read error|Input buffer|unsupported image|Vips|png|jpeg|webp|avif/i.test(error.message)) {
      error.status = 400;
      error.message = "A imagem não pôde ser lida. Escolha um arquivo válido.";
    }
    throw error;
  }
};
app.post("/api/admin/photo", sameOrigin, requireAdmin, imageUpload.single("photo"), asyncHandler(async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Selecione uma imagem." });
    const filename = `${randomBytes(18).toString("hex")}.webp`;
    const photo = await optimizeUpload(req.file.buffer, filename, 1200, 1200, 82);
    const profile = await setting("profile", defaultProfile);
    const previousPhoto = profile.photo;
    profile.photo = photo;
    profile.photoPosition = typeof req.body.position === "string" ? req.body.position : "50% 50%";
    await saveJson("profile", profile);
    await removeUnusedUpload(previousPhoto);
    res.json(profile);
  } catch (error) { throw error; }
}));
app.post("/api/admin/project-image", sameOrigin, requireAdmin, imageUpload.single("photo"), asyncHandler(async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Selecione uma imagem." });
    const filename = `${randomBytes(18).toString("hex")}.webp`;
    const image = await optimizeUpload(req.file.buffer, filename, 1400, 1000, 80);
    res.json({ image });
  } catch (error) { throw error; }
}));
app.delete("/api/admin/photo", sameOrigin, requireAdmin, asyncHandler(async (_req, res) => {
  try {
    const profile = await setting("profile", defaultProfile);
    const previousPhoto = profile.photo;
    profile.photo = "";
    await saveJson("profile", profile);
    await removeUnusedUpload(previousPhoto);
    res.json(profile);
  } catch (error) { throw error; }
}));
app.put("/api/admin/photo-position", sameOrigin, requireAdmin, asyncHandler(async (req, res) => {
  const position = typeof req.body.position === "string" && /^(100|[1-9]?\d)%\s+(100|[1-9]?\d)%$/.test(req.body.position) ? req.body.position : null;
  if (!position) return res.status(400).json({ error: "Enquadramento inválido." });
  const profile = await setting("profile", defaultProfile);
  profile.photoPosition = position;
  await saveJson("profile", profile);
  res.json(profile);
}));
app.get("/api/admin/messages", requireAdmin, asyncHandler(async (_req, res) => res.json(await db.prepare("SELECT id, name, email, message, created_at FROM messages ORDER BY id DESC LIMIT 100").all())));
app.delete("/api/admin/messages/:id", sameOrigin, requireAdmin, asyncHandler(async (req, res) => {
  const result = await db.prepare("DELETE FROM messages WHERE id = ?").run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Mensagem não encontrada." });
  res.json({ ok: true });
}));
app.get("/api/admin/:collection", requireAdmin, asyncHandler(async (req, res) => {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ error: "Seção não encontrada." });
  res.json(await rows(collection.table));
}));
app.post("/api/admin/:collection", sameOrigin, requireAdmin, asyncHandler(async (req, res) => {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ error: "Seção não encontrada." });
  try {
    const data = collection.parse(req.body);
    const placeholders = collection.fields.map(() => "?").join(", ");
    const result = await db.prepare(`INSERT INTO ${collection.table} (${collection.fields.join(", ")}) VALUES (${placeholders})`).run(...collection.fields.map((field) => data[field]));
    res.status(201).json(await db.prepare(`SELECT * FROM ${collection.table} WHERE id = ?`).get(result.lastInsertRowid));
  } catch (error) { res.status(400).json({ error: error.message }); }
}));
app.put("/api/admin/:collection/:id", sameOrigin, requireAdmin, asyncHandler(async (req, res) => {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ error: "Seção não encontrada." });
  try {
    const data = collection.parse(req.body);
    const previous = req.params.collection === "projects" ? (await db.prepare("SELECT image FROM projects WHERE id = ?").get(Number(req.params.id)))?.image : "";
    const assignments = collection.fields.map((field) => `${field} = ?`).join(", ");
    const result = await db.prepare(`UPDATE ${collection.table} SET ${assignments} WHERE id = ?`).run(...collection.fields.map((field) => data[field]), Number(req.params.id));
    if (!result.changes) return res.status(404).json({ error: "Item não encontrado." });
    const updated = await db.prepare(`SELECT * FROM ${collection.table} WHERE id = ?`).get(Number(req.params.id));
    try { if (previous !== updated.image) await removeUnusedUpload(previous); }
    catch (error) { throw error; }
    res.json(updated);
  } catch (error) { res.status(400).json({ error: error.message }); }
}));
app.delete("/api/admin/:collection/:id", sameOrigin, requireAdmin, asyncHandler(async (req, res) => {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ error: "Seção não encontrada." });
  const previous = req.params.collection === "projects" ? (await db.prepare("SELECT image FROM projects WHERE id = ?").get(Number(req.params.id)))?.image : "";
  const result = await db.prepare(`DELETE FROM ${collection.table} WHERE id = ?`).run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Item não encontrado." });
  await removeUnusedUpload(previous);
  res.json({ ok: true });
}));
if (!isVercel) {
  app.use(express.static(path.join(projectRoot, "dist")));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) return next();
    res.sendFile(path.join(projectRoot, "dist", "index.html"), (error) => { if (error) next(error); });
  });
}
app.use((err, _req, res, _next) => {
  const status = err.status || (err instanceof multer.MulterError ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Erro interno do servidor." : err.message });
});

export default app;
