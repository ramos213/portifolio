import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import sharp from "sharp";
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
await mkdir(dataDir, { recursive: true });
await mkdir(uploadDir, { recursive: true });

const databaseFile = path.join(dataDir, "portfolio.db");
const require = createRequire(import.meta.url);
const SQL = await initSqlJs({ locateFile: (file) => path.join(path.dirname(require.resolve("sql.js")), file) });
const sqlite = existsSync(databaseFile) ? new SQL.Database(new Uint8Array(readFileSync(databaseFile))) : new SQL.Database();
let transactionOpen = false;
const persistDatabase = () => writeFileSync(databaseFile, Buffer.from(sqlite.export()));
const db = {
  pragma(statement) { sqlite.run(`PRAGMA ${statement}`); },
  exec(statement) { sqlite.run(statement); if (!transactionOpen) persistDatabase(); },
  prepare(statement) {
    const query = (params = []) => {
      const prepared = sqlite.prepare(statement);
      prepared.bind(params);
      return prepared;
    };
    return {
      get(...params) {
        const prepared = query(params);
        try { return prepared.step() ? prepared.getAsObject() : undefined; } finally { prepared.free(); }
      },
      all(...params) {
        const prepared = query(params);
        try {
          const result = [];
          while (prepared.step()) result.push(prepared.getAsObject());
          return result;
        } finally { prepared.free(); }
      },
      run(...params) {
        sqlite.run(statement, params);
        const result = { changes: sqlite.getRowsModified(), lastInsertRowid: sqlite.exec("SELECT last_insert_rowid() AS id")[0]?.values[0]?.[0] };
        if (!transactionOpen) persistDatabase();
        return result;
      },
    };
  },
  transaction(callback) {
    return (...args) => {
      sqlite.run("BEGIN");
      transactionOpen = true;
      try {
        const result = callback(...args);
        sqlite.run("COMMIT");
        transactionOpen = false;
        persistDatabase();
        return result;
      } catch (error) {
        sqlite.run("ROLLBACK");
        transactionOpen = false;
        throw error;
      }
    };
  },
};
db.exec(`
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
`);

const setting = (key, fallback) => {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row ? JSON.parse(row.value) : fallback;
};
const saveSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
const saveJson = (key, value) => saveSetting.run(key, JSON.stringify(value));
const removeUnusedUpload = async (image) => {
  if (!image?.startsWith("/uploads/")) return;
  const profile = setting("profile", defaultProfile);
  if (profile.photo === image || db.prepare("SELECT COUNT(*) AS count FROM projects WHERE image = ?").get(image)?.count) return;
  try { await unlink(path.join(uploadDir, path.basename(image))); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
};

const defaultProfile = {
  name: "Samuel Ramos",
  title_pt: "Desenvolvedor em formação | Estudante de Análise e Desenvolvimento de Sistemas",
  title_en: "Developer in training | Systems Analysis and Development student",
  about_pt: "Sou estudante de Análise e Desenvolvimento de Sistemas, construindo minha trajetória em tecnologia com curiosidade, consistência e vontade de aprender. Tenho interesse em desenvolvimento de software, inteligência artificial e arquitetura de sistemas. Busco uma oportunidade de estágio em TI para contribuir, aprender com projetos reais e evoluir junto com uma equipe.",
  about_en: "I am a Systems Analysis and Development student, building my career in technology with curiosity, consistency, and a desire to learn. I am interested in software development, artificial intelligence, and systems architecture. I am looking for an IT internship where I can contribute, learn from real-world projects, and grow with a team.",
  email: "", github: "", linkedin: "", whatsapp: "", photo: "", photoPosition: "50% 50%",
};
if (!setting("profile", null)) saveJson("profile", defaultProfile);

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
if (db.prepare("SELECT COUNT(*) AS count FROM skills").get().count === 0) {
  const insert = db.prepare("INSERT INTO skills (name, category, description_pt, description_en, level, icon) VALUES (?, ?, ?, ?, ?, ?)");
  db.transaction(() => initialSkills.forEach((skill) => insert.run(...skill)))();
}

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use("/uploads", express.static(uploadDir, { fallthrough: false, maxAge: "1d" }));
const isProduction = process.env.NODE_ENV === "production";
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

function requireAdmin(req, res, next) {
  const token = getCookie(req.headers.cookie, cookieName);
  if (!token) return res.status(401).json({ error: "Autenticação necessária." });
  const session = db.prepare("SELECT expires_at FROM sessions WHERE token_hash = ?").get(hashToken(token));
  if (!session || session.expires_at < Date.now()) {
    if (session) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
    clearCookie(res);
    return res.status(401).json({ error: "Sessão expirada. Entre novamente." });
  }
  next();
}
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
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false });
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

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/portfolio", (_req, res) => res.json({
  profile: setting("profile", defaultProfile), projects: rows("projects"), skills: rows("skills"), timeline: rows("timeline"),
}));
app.post("/api/contact", sameOrigin, rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), (req, res) => {
  try {
    const name = validateText(req.body.name, 100, "Nome");
    const email = validateText(req.body.email, 254, "E-mail");
    const message = validateText(req.body.message, 3000, "Mensagem");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Informe um e-mail válido." });
    db.prepare("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)").run(name, email, message);
    res.status(201).json({ ok: true });
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post("/api/admin/login", sameOrigin, loginLimiter, (req, res) => {
  if (!passwordHash || !adminEmail) return res.status(503).json({ error: "Configure as credenciais do administrador no servidor." });
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const supplied = typeof req.body.password === "string" ? req.body.password : "";
  const candidate = scryptSync(supplied, passwordSalt, 64);
  if (email !== adminEmail || !timingSafeEqual(candidate, passwordHash)) return res.status(401).json({ error: "E-mail ou senha incorretos." });
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  db.prepare("INSERT INTO sessions (token_hash, expires_at) VALUES (?, ?)").run(hashToken(token), expiresAt);
  res.cookie(cookieName, token, { httpOnly: true, secure: isProduction, sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 * 1000 });
  res.json({ ok: true });
});
app.get("/api/admin/me", requireAdmin, (_req, res) => res.json({ ok: true }));
app.post("/api/admin/logout", sameOrigin, requireAdmin, (req, res) => {
  const token = getCookie(req.headers.cookie, cookieName);
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  clearCookie(res);
  res.json({ ok: true });
});
app.put("/api/admin/profile", sameOrigin, requireAdmin, (req, res) => {
  try {
    const current = setting("profile", defaultProfile);
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
    saveJson("profile", next);
    res.json(next);
  } catch (error) { res.status(400).json({ error: error.message }); }
});
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.mimetype)) {
    const error = new Error("Envie uma imagem JPG, PNG, WebP ou AVIF.");
    error.status = 400;
    return cb(error);
  }
  cb(null, true);
} });
const optimizeUpload = async (buffer, filename, width, height, quality) => {
  try { await sharp(buffer).rotate().resize(width, height, { fit: "inside", withoutEnlargement: true }).webp({ quality }).toFile(path.join(uploadDir, filename)); }
  catch (error) {
    if (/corrupt|read error|Input buffer|unsupported image|Vips|png|jpeg|webp|avif/i.test(error.message)) {
      error.status = 400;
      error.message = "A imagem não pôde ser lida. Escolha um arquivo válido.";
    }
    throw error;
  }
};
app.post("/api/admin/photo", sameOrigin, requireAdmin, imageUpload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Selecione uma imagem." });
    const filename = `${randomBytes(18).toString("hex")}.webp`;
    await optimizeUpload(req.file.buffer, filename, 1200, 1200, 82);
    const profile = setting("profile", defaultProfile);
    const previousPhoto = profile.photo;
    profile.photo = `/uploads/${filename}`;
    profile.photoPosition = typeof req.body.position === "string" ? req.body.position : "50% 50%";
    saveJson("profile", profile);
    await removeUnusedUpload(previousPhoto);
    res.json(profile);
  } catch (error) { next(error); }
});
app.post("/api/admin/project-image", sameOrigin, requireAdmin, imageUpload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Selecione uma imagem." });
    const filename = `${randomBytes(18).toString("hex")}.webp`;
    await optimizeUpload(req.file.buffer, filename, 1400, 1000, 80);
    res.json({ image: `/uploads/${filename}` });
  } catch (error) { next(error); }
});
app.delete("/api/admin/photo", sameOrigin, requireAdmin, async (_req, res, next) => {
  try {
    const profile = setting("profile", defaultProfile);
    const previousPhoto = profile.photo;
    profile.photo = "";
    saveJson("profile", profile);
    await removeUnusedUpload(previousPhoto);
    res.json(profile);
  } catch (error) { next(error); }
});
app.put("/api/admin/photo-position", sameOrigin, requireAdmin, (req, res) => {
  const position = typeof req.body.position === "string" && /^(100|[1-9]?\d)%\s+(100|[1-9]?\d)%$/.test(req.body.position) ? req.body.position : null;
  if (!position) return res.status(400).json({ error: "Enquadramento inválido." });
  const profile = setting("profile", defaultProfile);
  profile.photoPosition = position;
  saveJson("profile", profile);
  res.json(profile);
});
app.get("/api/admin/messages", requireAdmin, (_req, res) => res.json(db.prepare("SELECT id, name, email, message, created_at FROM messages ORDER BY id DESC LIMIT 100").all()));
app.delete("/api/admin/messages/:id", sameOrigin, requireAdmin, (req, res) => {
  const result = db.prepare("DELETE FROM messages WHERE id = ?").run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Mensagem não encontrada." });
  res.json({ ok: true });
});
app.get("/api/admin/:collection", requireAdmin, (req, res) => {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ error: "Seção não encontrada." });
  res.json(rows(collection.table));
});
app.post("/api/admin/:collection", sameOrigin, requireAdmin, (req, res) => {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ error: "Seção não encontrada." });
  try {
    const data = collection.parse(req.body);
    const placeholders = collection.fields.map(() => "?").join(", ");
    const result = db.prepare(`INSERT INTO ${collection.table} (${collection.fields.join(", ")}) VALUES (${placeholders})`).run(...collection.fields.map((field) => data[field]));
    res.status(201).json(db.prepare(`SELECT * FROM ${collection.table} WHERE id = ?`).get(result.lastInsertRowid));
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.put("/api/admin/:collection/:id", sameOrigin, requireAdmin, async (req, res, next) => {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ error: "Seção não encontrada." });
  try {
    const data = collection.parse(req.body);
    const previous = req.params.collection === "projects" ? db.prepare("SELECT image FROM projects WHERE id = ?").get(Number(req.params.id))?.image : "";
    const assignments = collection.fields.map((field) => `${field} = ?`).join(", ");
    const result = db.prepare(`UPDATE ${collection.table} SET ${assignments} WHERE id = ?`).run(...collection.fields.map((field) => data[field]), Number(req.params.id));
    if (!result.changes) return res.status(404).json({ error: "Item não encontrado." });
    const updated = db.prepare(`SELECT * FROM ${collection.table} WHERE id = ?`).get(Number(req.params.id));
    try { if (previous !== updated.image) await removeUnusedUpload(previous); }
    catch (error) { return next(error); }
    res.json(updated);
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.delete("/api/admin/:collection/:id", sameOrigin, requireAdmin, async (req, res, next) => {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ error: "Seção não encontrada." });
  const previous = req.params.collection === "projects" ? db.prepare("SELECT image FROM projects WHERE id = ?").get(Number(req.params.id))?.image : "";
  const result = db.prepare(`DELETE FROM ${collection.table} WHERE id = ?`).run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Item não encontrado." });
  try { await removeUnusedUpload(previous); res.json({ ok: true }); } catch (error) { next(error); }
});

if (isProduction) {
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
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Portfolio API running on http://localhost:${port}`));
