import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Code2, Copy, ExternalLink,
  Github, GraduationCap, Languages, Mail, Menu, Moon, Plus, Send, Sun, Trash2, X, Pencil,
  BriefcaseBusiness, Award, Sparkles, ImagePlus, LogOut, LayoutDashboard, FolderKanban, Wrench,
  BookOpen, MessageSquare, UserRound, LoaderCircle, LockKeyhole, Star,
} from "lucide-react";

const copy = {
  pt: {
    nav: ["Sobre", "Habilidades", "Projetos", "Trajetória", "Contato"], role: ["Desenvolvedor em formação.", "Full Stack em aprendizado.", "Entusiasta de tecnologia e IA."], openMenu: "Abrir menu", closeMenu: "Fechar menu",
    eyebrow: "DISPONÍVEL PARA OPORTUNIDADES", intro: "Construindo o futuro, uma linha de código por vez.", heroDescription: "Estudante de ADS apaixonado por tecnologia, desenvolvimento de software e por transformar boas ideias em soluções reais.",
    projectsCta: "Conheça meus projetos", contactCta: "Entre em contato", scroll: "Role para explorar", aboutKicker: "UM POUCO SOBRE MIM", aboutTitle: "Tecnologia com propósito e curiosidade.", aboutLead: "Em constante evolução. Sempre construindo.", skillKicker: "MEU KIT DE FERRAMENTAS", skillTitle: "Aprendendo. Praticando. Evoluindo.", skillText: "Conhecimentos em desenvolvimento, atualizados conforme cada nova etapa da jornada.", projectKicker: "TRABALHOS SELECIONADOS", projectTitle: "Ideias que ganham vida.", projectText: "Projetos reais, estudos e experimentos — cada um, um passo adiante.", noProjects: "Os próximos projetos começam com uma ideia.", noProjectsText: "Estou preparando novidades por aqui. Volte em breve para acompanhar minha evolução.", all: "Todos", journeyKicker: "CAMINHO EM CONSTRUÇÃO", journeyTitle: "Minha trajetória.", noJourney: "Novos capítulos em breve.", contactKicker: "VAMOS CONVERSAR", contactTitle: "Uma boa conversa começa aqui.", contactText: "Tem uma oportunidade, uma ideia ou simplesmente quer trocar experiências? Minha caixa de entrada está aberta.", name: "Seu nome", email: "Seu e-mail", message: "Sua mensagem", send: "Enviar mensagem", sending: "Enviando…", sent: "Mensagem enviada. Obrigado!", sendError: "Não foi possível enviar. Tente novamente.", copyEmail: "Copiar e-mail", copied: "E-mail copiado", footer: "Feito com intenção e bastante café.", admin: "Administração", loginTitle: "Painel de controle", loginText: "Entre para gerenciar seu portfólio.", login: "Entrar", password: "Senha", logout: "Sair", dashboard: "Painel", save: "Salvar alterações", saved: "Alterações salvas.", cancel: "Cancelar", edit: "Editar", delete: "Excluir", add: "Adicionar", confirmDelete: "Tem certeza de que deseja excluir este item?", projectsAdmin: "Projetos", skillsAdmin: "Habilidades", journeyAdmin: "Trajetória", profileAdmin: "Perfil", messagesAdmin: "Mensagens", emptyAdmin: "Nenhum item cadastrado ainda.", newProject: "Novo projeto", newSkill: "Nova habilidade", newJourney: "Novo item", projectName: "Nome do projeto", descriptionPt: "Descrição (português)", descriptionEn: "Descrição (inglês)", categoryPt: "Categoria (português)", categoryEn: "Categoria (inglês)", technologies: "Tecnologias (separadas por vírgula)", githubUrl: "Link do GitHub", demoUrl: "Link da demonstração", imageUrl: "Imagem do projeto", featured: "Destacar projeto", skillName: "Tecnologia / conhecimento", category: "Categoria", level: "Nível atual", icon: "Ícone Simple Icons (slug, opcional)", titlePt: "Título (português)", titleEn: "Título (inglês)", organization: "Instituição / organização", period: "Período", type: "Tipo", education: "Formação acadêmica", course: "Curso complementar", certification: "Certificação", experience: "Experiência", profileName: "Nome", title: "Título profissional", about: "Sobre mim", photo: "Foto de perfil", choosePhoto: "Escolher foto", removePhoto: "Remover foto", photoHint: "JPG, PNG, WebP ou AVIF — até 8 MB. Ajuste o enquadramento antes de salvar.", photoPosition: "Enquadramento", emailContact: "E-mail profissional", github: "GitHub", linkedin: "LinkedIn", whatsapp: "WhatsApp (com código do país)", contactAdmin: "Informações de contato", openSite: "Ver portfólio", loadError: "Erro ao carregar dados.", required: "Preencha os campos obrigatórios.", loginError: "Não foi possível entrar.", savedError: "Não foi possível salvar.", image: "Imagem", present: "Em aprendizado", beginner: "Iniciante", intermediate: "Intermediário", advanced: "Avançado", themeLight: "Ativar tema claro", themeDark: "Ativar tema escuro", selectLanguage: "Idioma",
  },
  en: {
    nav: ["About", "Skills", "Projects", "Journey", "Contact"], role: ["Developer in training.", "Full Stack learner.", "Technology & AI enthusiast."], openMenu: "Open menu", closeMenu: "Close menu",
    eyebrow: "OPEN TO OPPORTUNITIES", intro: "Building the future, one line of code at a time.", heroDescription: "Systems Analysis student passionate about technology, software development, and turning good ideas into real solutions.",
    projectsCta: "Explore my projects", contactCta: "Get in touch", scroll: "Scroll to explore", aboutKicker: "A LITTLE ABOUT ME", aboutTitle: "Technology with purpose and curiosity.", aboutLead: "Always learning. Always building.", skillKicker: "MY TOOLKIT", skillTitle: "Learning. Practicing. Growing.", skillText: "Development skills, evolving with every new step in the journey.", projectKicker: "SELECTED WORK", projectTitle: "Ideas brought to life.", projectText: "Real projects, studies, and experiments — each one a step forward.", noProjects: "The next project starts with an idea.", noProjectsText: "I am getting new things ready. Check back soon to follow my progress.", all: "All", journeyKicker: "A JOURNEY IN PROGRESS", journeyTitle: "My journey.", noJourney: "More chapters coming soon.", contactKicker: "LET'S TALK", contactTitle: "A good conversation starts here.", contactText: "Have an opportunity, an idea, or just want to share experiences? My inbox is open.", name: "Your name", email: "Your email", message: "Your message", send: "Send message", sending: "Sending…", sent: "Message sent. Thank you!", sendError: "Could not send your message. Please try again.", copyEmail: "Copy email", copied: "Email copied", footer: "Made with intention and plenty of coffee.", admin: "Admin", loginTitle: "Admin dashboard", loginText: "Sign in to manage your portfolio.", login: "Sign in", password: "Password", logout: "Sign out", dashboard: "Dashboard", save: "Save changes", saved: "Changes saved.", cancel: "Cancel", edit: "Edit", delete: "Delete", add: "Add", confirmDelete: "Are you sure you want to delete this item?", projectsAdmin: "Projects", skillsAdmin: "Skills", journeyAdmin: "Journey", profileAdmin: "Profile", messagesAdmin: "Messages", emptyAdmin: "No items have been added yet.", newProject: "New project", newSkill: "New skill", newJourney: "New item", projectName: "Project name", descriptionPt: "Description (Portuguese)", descriptionEn: "Description (English)", categoryPt: "Category (Portuguese)", categoryEn: "Category (English)", technologies: "Technologies (comma separated)", githubUrl: "GitHub link", demoUrl: "Live demo link", imageUrl: "Project image", featured: "Featured project", skillName: "Technology / skill", category: "Category", level: "Current level", icon: "Simple Icons slug (optional)", titlePt: "Title (Portuguese)", titleEn: "Title (English)", organization: "Institution / organization", period: "Period", type: "Type", education: "Education", course: "Course", certification: "Certification", experience: "Experience", profileName: "Name", title: "Professional title", about: "About me", photo: "Profile photo", choosePhoto: "Choose photo", removePhoto: "Remove photo", photoHint: "JPG, PNG, WebP, or AVIF — up to 8 MB. Adjust the crop before saving.", photoPosition: "Crop position", emailContact: "Professional email", github: "GitHub", linkedin: "LinkedIn", whatsapp: "WhatsApp (with country code)", contactAdmin: "Contact information", openSite: "View portfolio", loadError: "Could not load data.", required: "Please fill in the required fields.", loginError: "Could not sign in.", savedError: "Could not save your changes.", image: "Image", present: "Learning", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", themeLight: "Switch to light theme", themeDark: "Switch to dark theme", selectLanguage: "Language",
  },
};

const levels = { "Em aprendizado": "Learning", Iniciante: "Beginner", Intermediário: "Intermediate", Avançado: "Advanced" };
const categories = ["Front-end", "Back-end", "Banco de dados", "Ferramentas", "Outros"];
const categoryNames = { "Banco de dados": "Database", Ferramentas: "Tools", Outros: "Other" };
const skillNames = { "Inteligência Artificial": "Artificial Intelligence", "Lógica de programação": "Programming Logic", "Análise de sistemas": "Systems Analysis" };
const categoryLabel = (category, language) => language === "en" ? categoryNames[category] || category : category;
const skillLabel = (name, language) => language === "en" ? skillNames[name] || name : name;
const formatMessageDate = (value, language) => {
  const timestamp = value instanceof Date ? value.toISOString() : String(value);
  const normalized = /(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp) ? timestamp : `${timestamp}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString(language === "pt" ? "pt-BR" : "en-US");
};
const api = async (url, options = {}) => {
  const response = await fetch(url, { credentials: "same-origin", ...options, headers: { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
};
const emptyProject = { name: "", description_pt: "", description_en: "", category_pt: "", category_en: "", technologies: [], github: "", demo: "", image: "", featured: false };
const emptySkill = { name: "", category: "Front-end", description_pt: "", description_en: "", level: "Em aprendizado", icon: "" };
const emptyTimeline = { type: "education", title_pt: "", title_en: "", organization: "", description_pt: "", description_en: "", period: "" };

function usePreferences() {
  const [language, setLanguage] = useState(() => localStorage.getItem("portfolio-language") || "pt");
  const [theme, setTheme] = useState(() => localStorage.getItem("portfolio-theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
  useEffect(() => { localStorage.setItem("portfolio-language", language); document.documentElement.lang = language === "pt" ? "pt-BR" : "en"; }, [language]);
  useEffect(() => { localStorage.setItem("portfolio-theme", theme); document.documentElement.dataset.theme = theme; }, [theme]);
  return { language, setLanguage, theme, setTheme };
}

function Appearance({ language, setLanguage, theme, setTheme, t }) {
  return <div className="appearance">
    <button className="icon-button language-button" aria-label={t.selectLanguage} onClick={() => setLanguage(language === "pt" ? "en" : "pt")}><Languages size={16} /><span>{language === "pt" ? "PT-BR" : "EN"}</span></button>
    <button className="icon-button" aria-label={theme === "dark" ? t.themeLight : t.themeDark} title={theme === "dark" ? t.themeLight : t.themeDark} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
  </div>;
}

function Header({ t, profile, appearance, isAdmin = false }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <a className="brand" href={isAdmin ? "/" : "#home"} aria-label="Samuel Ramos"><span className="brand-mark">S<span>.</span></span><span>{profile?.name || "Samuel Ramos"}</span></a>
    {isAdmin ? <div className="header-admin"><a className="quiet-link" href="/">{t.openSite}<ArrowUpRight size={14} /></a><Appearance {...appearance} t={t} /></div> : <>
      <button className="icon-button mobile-menu" aria-label={open ? t.closeMenu : t.openMenu} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      <nav className={`main-nav ${open ? "nav-open" : ""}`}>{t.nav.map((label, index) => <a href={`#${["about", "skills", "projects", "journey", "contact"][index]}`} key={label} onClick={() => setOpen(false)}>{label}</a>)}<a className="nav-admin" href="/admin">{t.admin}<ArrowUpRight size={13} /></a></nav>
      <Appearance {...appearance} t={t} />
    </>}
  </header>;
}

function Reveal({ children, className = "", delay = 0 }) {
  return <div className={`reveal ${className}`} style={{ "--reveal-delay": `${delay}ms` }}>{children}</div>;
}

function SkillIcon({ slug, name }) {
  const [failed, setFailed] = useState(false);
  const simpleIconSlugs = { code: null, system: null };
  if (!slug || simpleIconSlugs[slug] === null || failed) return <span className="skill-fallback"><Code2 size={19} /></span>;
  return <img className="skill-logo" src={`https://cdn.simpleicons.org/${encodeURIComponent(slug)}`} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

function Portfolio() {
  const appearance = usePreferences();
  const t = copy[appearance.language];
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [typedText, setTypedText] = useState("");
  const [filter, setFilter] = useState("all");
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [contactStatus, setContactStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const load = useCallback(async () => {
    try { setData(await api("/api/portfolio")); } catch (error) { setLoadError(error.message); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let timer;
    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) { setTypedText(t.role[0]); return undefined; }
    const tick = () => {
      const phrase = t.role[phraseIndex];
      if (!deleting) {
        characterIndex += 1;
        setTypedText(phrase.slice(0, characterIndex));
        if (characterIndex === phrase.length) {
          deleting = true;
          timer = setTimeout(tick, 1500);
          return;
        }
      } else {
        characterIndex -= 1;
        setTypedText(phrase.slice(0, characterIndex));
        if (characterIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % t.role.length;
          timer = setTimeout(tick, 300);
          return;
        }
      }
      timer = setTimeout(tick, deleting ? 24 : 48);
    };
    tick();
    return () => clearTimeout(timer);
  }, [t.role]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.1 });
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data]);
  const profile = data?.profile || { name: "Samuel Ramos", photo: "" };
  const displayedProjects = useMemo(() => (data?.projects || []).filter((project) => filter === "all" || project.category_pt === filter || JSON.parse(project.technologies || "[]").includes(filter)), [data, filter]);
  const projectFilters = useMemo(() => ["all", ...new Set((data?.projects || []).flatMap((project) => [project.category_pt, ...JSON.parse(project.technologies || "[]")]).filter(Boolean))], [data]);
  const showToast = (message) => { setToast(message); setTimeout(() => setToast(""), 2400); };
  const sendMessage = async (event) => {
    event.preventDefault(); setSending(true); setContactStatus("");
    try { await api("/api/contact", { method: "POST", body: JSON.stringify(contact) }); setContact({ name: "", email: "", message: "" }); setContactStatus(t.sent); }
    catch { setContactStatus(t.sendError); } finally { setSending(false); }
  };
  const copyEmail = async () => {
    if (!profile.email) return;
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { showToast(profile.email); }
  };
  return <div className="public-site">
    <Header t={t} profile={profile} appearance={appearance} />
    <main>
      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="availability"><span className="status-dot" />{t.eyebrow}</div>
          <div className="hero-title-line"><span className="hero-greeting">{t.intro}</span></div>
          <h1>{profile.name}<span className="red-dot">.</span></h1>
          <p className="hero-subtitle">{profile[`title_${appearance.language}`] || profile.title_pt}</p>
          <div className="type-line"><span className="type-prompt">~/</span><span className="typed-text">{typedText}</span><span className="cursor">_</span></div>
          <p className="hero-description">{t.heroDescription}</p>
          <div className="hero-actions"><a className="button button-primary" href="#projects">{t.projectsCta}<ArrowRight size={16} /></a><a className="button button-secondary" href="#contact">{t.contactCta}<ArrowUpRight size={15} /></a></div>
          <div className="hero-socials">
            {profile.github && <a aria-label="GitHub" href={profile.github} target="_blank" rel="noreferrer"><Github size={19} /></a>}
            {profile.linkedin && <a aria-label="LinkedIn" href={profile.linkedin} target="_blank" rel="noreferrer"><span className="linkedin-icon">in</span></a>}
            <span className="hero-social-label">SAMUEL RAMOS <span>·</span> ADS</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="profile-frame">
            {profile.photo ? <img src={profile.photo} alt={profile.name} style={{ objectPosition: profile.photoPosition || "50% 50%" }} /> : <div className="profile-placeholder"><span>SR</span><i>+</i></div>}
            <span className="frame-corner corner-tl" /><span className="frame-corner corner-br" />
          </div>
          <div className="floating-chip chip-code"><Code2 size={16} /><span>const future = "bright";</span></div>
          <div className="floating-chip chip-status"><span className="status-dot" /><span>{appearance.language === "pt" ? "sempre evoluindo" : "always evolving"}</span></div>
          <div className="hero-index">01 <span>—</span> 05</div>
        </div>
        <a className="scroll-cue" href="#about"><span>{t.scroll}</span><ArrowDown size={15} /></a>
      </section>

      <section className="section-wrap section-block about-section" id="about">
        <Reveal><div className="section-kicker"><span>01</span> {t.aboutKicker}</div><div className="about-grid"><h2>{t.aboutTitle}<span className="accent-stroke" /></h2><div className="about-body"><p className="about-lead">{t.aboutLead}</p><p>{profile[`about_${appearance.language}`] || profile.about_pt}</p><div className="about-meta"><span><GraduationCap size={17} />{appearance.language === "pt" ? "Análise e Desenvolvimento de Sistemas" : "Systems Analysis and Development"}</span><span><Sparkles size={16} />{appearance.language === "pt" ? "Em busca de estágio em TI" : "Looking for an IT internship"}</span></div></div></div></Reveal>
      </section>

      <section className="skills-band section-block" id="skills"><div className="section-wrap"><Reveal><div className="section-kicker"><span>02</span> {t.skillKicker}</div><div className="section-heading"><h2>{t.skillTitle}</h2><p>{t.skillText}</p></div></Reveal>
        <div className="skills-grid">{(data?.skills || []).map((skill, index) => <Reveal className="skill-card" delay={index % 5 * 70} key={skill.id}><div className="skill-card-top"><SkillIcon slug={skill.icon} name={skill.name} /><span className="skill-level">{appearance.language === "en" ? (levels[skill.level] || skill.level) : skill.level}</span></div><h3>{skillLabel(skill.name, appearance.language)}</h3><p>{skill[`description_${appearance.language}`] || skill.description_pt}</p><div className="skill-meter"><span style={{ width: ({ "Em aprendizado": "28%", Learning: "28%", Iniciante: "40%", Beginner: "40%", Intermediário: "64%", Intermediate: "64%", Avançado: "84%", Advanced: "84%" })[skill.level] || "28%" }} /></div></Reveal>)}</div>
      </div></section>

      <section className="section-wrap section-block projects-section" id="projects"><Reveal><div className="section-kicker"><span>03</span> {t.projectKicker}</div><div className="section-heading project-heading"><div><h2>{t.projectTitle}</h2><p>{t.projectText}</p></div>{data?.projects?.length > 0 && <span className="project-count">{String(data.projects.length).padStart(2, "0")} <span>{appearance.language === "pt" ? "PROJETOS" : "PROJECTS"}</span></span>}</div></Reveal>
        {projectFilters.length > 1 && <div className="filter-row" aria-label={t.all}>{projectFilters.map((item) => <button key={item} className={`filter-chip ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>{item === "all" ? t.all : categoryLabel(item, appearance.language)}</button>)}</div>}
        {displayedProjects.length ? <div className="projects-grid">{displayedProjects.map((project, index) => {
          let tags = []; try { tags = JSON.parse(project.technologies || "[]"); } catch { tags = []; }
          const desc = project[`description_${appearance.language}`] || project.description_pt;
          return <Reveal className="project-card" delay={index % 3 * 100} key={project.id}>
            <div className="project-image">{project.image ? <img src={project.image} alt="" loading="lazy" /> : <div className="project-image-placeholder"><span>SR<span>.</span></span><Code2 size={32} /></div>}{project.featured ? <span className="featured-label"><Star size={12} /> {appearance.language === "pt" ? "DESTAQUE" : "FEATURED"}</span> : null}<span className="project-number">{String(index + 1).padStart(2, "0")}</span></div>
            <div className="project-content"><div className="project-category">{project[`category_${appearance.language}`] || categoryLabel(project.category_pt, appearance.language)}</div><h3>{project.name}</h3><p>{desc}</p><div className="project-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="project-links">{project.github && <a href={project.github} target="_blank" rel="noreferrer"><Github size={15} /> GitHub <ArrowUpRight size={13} /></a>}{project.demo && <a href={project.demo} target="_blank" rel="noreferrer"><ExternalLink size={15} /> {appearance.language === "pt" ? "Ver projeto" : "Live demo"} <ArrowUpRight size={13} /></a>}</div></div>
          </Reveal>;
        })}</div> : <div className="empty-projects"><div className="empty-icon"><FolderKanban size={22} /></div><h3>{t.noProjects}</h3><p>{data?.projects?.length ? t.all : t.noProjectsText}</p></div>}
      </section>

      <section className="journey-band section-block" id="journey"><div className="section-wrap"><Reveal><div className="section-kicker"><span>04</span> {t.journeyKicker}</div><div className="section-heading"><h2>{t.journeyTitle}</h2></div></Reveal>
        {data?.timeline?.length ? <div className="timeline">{[...data.timeline].reverse().map((item, index) => <Reveal className="timeline-item" key={item.id} delay={index * 70}><div className="timeline-marker">{item.type === "education" ? <GraduationCap size={17} /> : item.type === "experience" ? <BriefcaseBusiness size={16} /> : item.type === "certification" ? <Award size={16} /> : <BookOpen size={16} />}</div><div className="timeline-info"><span className="timeline-type">{t[item.type] || item.type}</span><h3>{item[`title_${appearance.language}`] || item.title_pt}</h3><p>{item.organization}{item.period ? ` · ${item.period}` : ""}</p><p className="timeline-description">{item[`description_${appearance.language}`] || item.description_pt}</p></div></Reveal>)}</div> : <div className="empty-journey"><GraduationCap size={21} /><span>{t.noJourney}</span></div>}
      </div></section>

      <section className="section-wrap section-block contact-section" id="contact"><Reveal><div className="section-kicker"><span>05</span> {t.contactKicker}</div><div className="contact-grid"><div className="contact-intro"><h2>{t.contactTitle}<span className="red-dot">.</span></h2><p>{t.contactText}</p><div className="contact-links">{profile.email && <button className="contact-link" onClick={copyEmail}><span className="contact-link-icon"><Mail size={18} /></span><span><small>{t.emailContact}</small>{profile.email}</span>{copied ? <Check size={16} className="copy-icon" /> : <Copy size={15} className="copy-icon" />}</button>}{profile.linkedin && <a className="contact-link" href={profile.linkedin} target="_blank" rel="noreferrer"><span className="contact-link-icon"><span className="linkedin-icon">in</span></span><span><small>LinkedIn</small>{appearance.language === "pt" ? "Vamos nos conectar" : "Let's connect"}</span><ArrowUpRight size={16} className="copy-icon" /></a>}{profile.github && <a className="contact-link" href={profile.github} target="_blank" rel="noreferrer"><span className="contact-link-icon"><Github size={18} /></span><span><small>GitHub</small>{appearance.language === "pt" ? "Veja meus códigos" : "Explore my code"}</span><ArrowUpRight size={16} className="copy-icon" /></a>}{profile.whatsapp && <a className="contact-link" href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><span className="contact-link-icon"><MessageSquare size={18} /></span><span><small>WhatsApp</small>{appearance.language === "pt" ? "Enviar mensagem" : "Send a message"}</span><ArrowUpRight size={16} className="copy-icon" /></a>}</div></div>
        <form className="contact-form" onSubmit={sendMessage}><div className="form-field"><label htmlFor="contact-name">{t.name}</label><input id="contact-name" required maxLength={100} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></div><div className="form-field"><label htmlFor="contact-email">{t.email}</label><input id="contact-email" type="email" required maxLength={254} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div><div className="form-field"><label htmlFor="contact-message">{t.message}</label><textarea id="contact-message" required maxLength={3000} rows="4" value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} /></div><button className="button button-primary submit-button" disabled={sending}>{sending ? t.sending : t.send}{sending ? <LoaderCircle size={16} className="spin" /> : <Send size={15} />}</button>{contactStatus && <p className={`form-status ${contactStatus === t.sent ? "success" : "error"}`} role="status">{contactStatus}</p>}</form></div></Reveal></section>
    </main>
    <footer className="site-footer"><div className="section-wrap footer-inner"><a className="brand footer-brand" href="#home"><span className="brand-mark">S<span>.</span></span><span>{profile.name}</span></a><span>{t.footer}</span><span>© {new Date().getFullYear()} {profile.name} · {appearance.language === "pt" ? "Desenvolvedor em formação" : "Developer in training"}</span><a className="footer-admin-link" href="/admin">{t.admin}</a></div></footer>
    {loadError && <div className="site-error" role="status">{t.loadError} <button onClick={load}>{appearance.language === "pt" ? "Tentar novamente" : "Retry"}</button></div>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}

function Admin() {
  const appearance = usePreferences();
  const t = copy[appearance.language];
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [section, setSection] = useState("profile");
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const [preview, setPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [mobileSidebar, setMobileSidebar] = useState(false);
  useEffect(() => { api("/api/admin/me").then(() => setAuthenticated(true)).catch(() => {}).finally(() => setChecking(false)); }, []);
  const refresh = useCallback(async () => {
    const next = await api("/api/portfolio"); setData(next);
    setPosition({ x: parseInt(next.profile.photoPosition?.split("%")[0], 10) || 50, y: parseInt(next.profile.photoPosition?.split("%")[1], 10) || 50 });
  }, []);
  useEffect(() => { if (authenticated) refresh().catch((error) => setStatus(error.message)); }, [authenticated, refresh]);
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);
  const showStatus = (message) => { setStatus(message); setTimeout(() => setStatus(""), 3000); };
  const signIn = async (event) => {
    event.preventDefault(); setBusy(true); setLoginError("");
    try { await api("/api/admin/login", { method: "POST", body: JSON.stringify(login) }); setAuthenticated(true); }
    catch (error) { setLoginError(error.message || t.loginError); } finally { setBusy(false); }
  };
  const signOut = async () => { try { await api("/api/admin/logout", { method: "POST", body: "{}" }); } finally { setAuthenticated(false); setData(null); } };
  const saveProfile = async (event) => {
    event.preventDefault(); setBusy(true);
    try { const profile = await api("/api/admin/profile", { method: "PUT", body: JSON.stringify(form) }); setData((old) => ({ ...old, profile })); setEditing(null); showStatus(t.saved); }
    catch (error) { showStatus(error.message || t.savedError); } finally { setBusy(false); }
  };
  const openNew = (kind) => {
    setEditing("new"); setForm(kind === "projects" ? { ...emptyProject } : kind === "skills" ? { ...emptySkill } : { ...emptyTimeline }); setPreview("");
  };
  const openEdit = (item) => { setEditing(item.id); setForm({ ...item, technologies: JSON.parse(item.technologies || "[]") }); setPreview(item.image || ""); };
  const saveItem = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      const payload = section === "projects" ? { ...form, image: await uploadImage(false) || form.image, technologies: typeof form.technologies === "string" ? form.technologies.split(",").map((item) => item.trim()).filter(Boolean) : form.technologies } : form;
      const saved = await api(`/api/admin/${section}${editing === "new" ? "" : `/${editing}`}`, { method: editing === "new" ? "POST" : "PUT", body: JSON.stringify(payload) });
      setData((old) => ({ ...old, [section]: editing === "new" ? [...old[section], saved] : old[section].map((item) => item.id === saved.id ? saved : item) }));
      setEditing(null); setPreview(""); showStatus(t.saved);
    } catch (error) { showStatus(error.message || t.savedError); } finally { setBusy(false); }
  };
  const deleteItem = async (collection, id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try { await api(`/api/admin/${collection}/${id}`, { method: "DELETE" }); setData((old) => ({ ...old, [collection]: old[collection].filter((item) => item.id !== id) })); showStatus(t.saved); }
    catch (error) { showStatus(error.message); }
  };
  const selectImage = (event, forProfile = false) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 4 * 1024 * 1024) { showStatus(t.photoHint); event.target.value = ""; return; }
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file)); setPhotoFile(file);
    if (!forProfile) setForm((old) => ({ ...old, image: "" }));
  };
  const uploadImage = async (forProfile) => {
    if (!photoFile) return null;
    const body = new FormData(); body.append("photo", photoFile); body.append("position", `${position.x}% ${position.y}%`);
    const endpoint = forProfile ? "/api/admin/photo" : "/api/admin/project-image";
    const result = await api(endpoint, { method: "POST", body });
    setPhotoFile(null);
    if (forProfile) setData((old) => ({ ...old, profile: result }));
    return forProfile ? result.photo : result.image;
  };
  const savePhoto = async () => {
    setBusy(true);
    try {
      if (photoFile) await uploadImage(true);
      else if (data.profile.photo) {
        const profile = await api("/api/admin/photo-position", { method: "PUT", body: JSON.stringify({ position: `${position.x}% ${position.y}%` }) });
        setData((old) => ({ ...old, profile }));
      }
      setPreview(""); showStatus(t.saved);
    } catch (error) { showStatus(error.message || t.savedError); } finally { setBusy(false); }
  };
  const removePhoto = async () => {
    if (!window.confirm(t.confirmDelete)) return;
    try { const profile = await api("/api/admin/photo", { method: "DELETE" }); setData((old) => ({ ...old, profile })); setPreview(""); setPhotoFile(null); showStatus(t.saved); }
    catch (error) { showStatus(error.message); }
  };
  const openMessages = async () => { setSection("messages"); try { setMessages(await api("/api/admin/messages")); } catch (error) { showStatus(error.message); } };
  const navItems = [
    { id: "profile", label: t.profileAdmin, icon: UserRound }, { id: "projects", label: t.projectsAdmin, icon: FolderKanban },
    { id: "skills", label: t.skillsAdmin, icon: Wrench }, { id: "timeline", label: t.journeyAdmin, icon: GraduationCap },
    { id: "messages", label: t.messagesAdmin, icon: MessageSquare },
  ];
  const title = section === "profile" ? t.profileAdmin : section === "projects" ? t.projectsAdmin : section === "skills" ? t.skillsAdmin : section === "timeline" ? t.journeyAdmin : t.messagesAdmin;
  if (checking) return <div className="admin-loading"><LoaderCircle className="spin" /></div>;
  if (!authenticated) return <div className="admin-login-page"><Header t={t} profile={{ name: "Samuel Ramos" }} appearance={appearance} isAdmin /><div className="login-card"><a className="back-link" href="/"><ArrowLeft size={15} /> {t.openSite}</a><div className="login-symbol"><LockKeyhole size={21} /></div><div className="section-kicker"><span>ADMIN</span> SAMUEL RAMOS</div><h1>{t.loginTitle}<span className="red-dot">.</span></h1><p>{t.loginText}</p><form onSubmit={signIn}><div className="form-field"><label htmlFor="admin-email">{t.email}</label><input id="admin-email" type="email" required autoComplete="username" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></div><div className="form-field"><label htmlFor="admin-password">{t.password}</label><input id="admin-password" type="password" required autoComplete="current-password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /></div><button className="button button-primary submit-button" disabled={busy}>{busy ? <LoaderCircle size={16} className="spin" /> : t.login}<ArrowRight size={16} /></button>{loginError && <p className="form-status error" role="alert">{loginError}</p>}</form></div><p className="login-note"><LockKeyhole size={13} /> {appearance.language === "pt" ? "Acesso protegido por autenticação no servidor." : "Access protected by server-side authentication."}</p></div>;
  if (!data) return <div className="admin-loading"><LoaderCircle className="spin" /></div>;
  const collection = section === "projects" ? data.projects : section === "skills" ? data.skills : data.timeline;
  const translateType = (type) => t[type] || type;
  return <div className="admin-layout">
    <aside className={`admin-sidebar ${mobileSidebar ? "sidebar-open" : ""}`}><a className="brand admin-brand" href="/"><span className="brand-mark">S<span>.</span></span><span>{data.profile.name}</span></a><div className="sidebar-caption">{t.dashboard}</div><nav>{navItems.map(({ id, label, icon: Icon }) => <button className={section === id ? "active" : ""} key={id} onClick={() => { id === "messages" ? openMessages() : setSection(id); setEditing(null); setMobileSidebar(false); }}><Icon size={17} />{label}{id === "messages" && messages.length > 0 && <span className="sidebar-count">{messages.length}</span>}</button>)}</nav><div className="sidebar-bottom"><a href="/"><ArrowLeft size={15} />{t.openSite}</a><button onClick={signOut}><LogOut size={15} />{t.logout}</button></div></aside>
    <main className="admin-main"><header className="admin-topbar"><button className="icon-button admin-mobile-toggle" aria-label="Menu" onClick={() => setMobileSidebar(!mobileSidebar)}><Menu size={20} /></button><div className="admin-breadcrumb"><LayoutDashboard size={16} /><span>{t.dashboard}</span><ChevronDown size={13} /><strong>{title}</strong></div><Appearance {...appearance} t={t} /></header>
      <div className="admin-content"><div className="admin-page-heading"><div><div className="section-kicker"><span>STUDIO</span> SAMUEL RAMOS</div><h1>{title}<span className="red-dot">.</span></h1></div>{["projects", "skills", "timeline"].includes(section) && <button className="button button-primary admin-add" onClick={() => openNew(section)}><Plus size={16} />{t.add}</button>}</div>
        {status && <div className="admin-notice" role="status"><Check size={15} />{status}<button onClick={() => setStatus("")} aria-label="Close"><X size={15} /></button></div>}
        {section === "profile" && <div className="admin-profile-grid"><form className="admin-panel profile-form" onSubmit={saveProfile}><div className="panel-title"><div className="panel-icon"><UserRound size={17} /></div><div><h2>{t.profileAdmin}</h2><p>{appearance.language === "pt" ? "Informações exibidas no portfólio público." : "Information shown on your public portfolio."}</p></div></div><div className="admin-form-grid"><div className="form-field"><label>{t.profileName}</label><input required maxLength={120} value={form.name ?? data.profile.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="form-field"><label>{t.emailContact}</label><input type="email" maxLength={254} value={form.email ?? data.profile.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div><div className="form-field full-field"><label>{t.title} — PT-BR</label><input value={form.title_pt ?? data.profile.title_pt} onChange={(e) => setForm({ ...form, title_pt: e.target.value })} /></div><div className="form-field full-field"><label>{t.title} — EN</label><input value={form.title_en ?? data.profile.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div><div className="form-field full-field"><label>{t.about} — PT-BR</label><textarea rows="4" value={form.about_pt ?? data.profile.about_pt} onChange={(e) => setForm({ ...form, about_pt: e.target.value })} /></div><div className="form-field full-field"><label>{t.about} — EN</label><textarea rows="4" value={form.about_en ?? data.profile.about_en} onChange={(e) => setForm({ ...form, about_en: e.target.value })} /></div><div className="form-field"><label>GitHub URL</label><input type="url" placeholder="https://github.com/..." value={form.github ?? data.profile.github} onChange={(e) => setForm({ ...form, github: e.target.value })} /></div><div className="form-field"><label>LinkedIn URL</label><input type="url" placeholder="https://linkedin.com/in/..." value={form.linkedin ?? data.profile.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /></div><div className="form-field full-field"><label>{t.whatsapp}</label><input placeholder="+55 11 99999-9999" value={form.whatsapp ?? data.profile.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div></div><button className="button button-primary" disabled={busy}>{t.save}<Check size={15} /></button></form>
          <div className="admin-panel photo-panel"><div className="panel-title"><div className="panel-icon"><ImagePlus size={17} /></div><div><h2>{t.photo}</h2><p>{appearance.language === "pt" ? "Sua imagem, sempre atualizável." : "Your image, always updatable."}</p></div></div><div className="photo-preview-wrap">{preview || data.profile.photo ? <img src={preview || data.profile.photo} alt={t.photo} style={{ objectPosition: `${position.x}% ${position.y}%` }} /> : <div className="profile-placeholder"><span>SR</span></div>}</div><p className="photo-hint">{t.photoHint.replace("8 MB", "4 MB").replace("8 MB", "4 MB")}</p><label className="button button-secondary upload-button"><ImagePlus size={15} />{t.choosePhoto}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => selectImage(e, true)} hidden /></label>{(preview || data.profile.photo) && <div className="crop-controls"><label>{t.photoPosition} X <input type="range" min="0" max="100" value={position.x} onChange={(e) => setPosition({ ...position, x: Number(e.target.value) })} /></label><label>Y <input type="range" min="0" max="100" value={position.y} onChange={(e) => setPosition({ ...position, y: Number(e.target.value) })} /></label></div>}<div className="photo-actions">{(preview || data.profile.photo) && <button className="text-danger" onClick={removePhoto}><Trash2 size={14} />{t.removePhoto}</button>}<button className="button button-primary" disabled={busy || (!photoFile && !data.profile.photo)} onClick={savePhoto}>{t.save}<Check size={14} /></button></div></div>
          <div className="admin-panel contact-admin-panel"><div className="panel-title"><div className="panel-icon"><MessageSquare size={17} /></div><div><h2>{t.contactAdmin}</h2><p>{appearance.language === "pt" ? "Informações de contato público." : "Public contact details."}</p></div></div><p>{data.profile.email || "—"}</p><a href={data.profile.github || "#"}>{data.profile.github || "GitHub —"}</a><a href={data.profile.linkedin || "#"}>{data.profile.linkedin || "LinkedIn —"}</a></div>
        </div>}
        {["projects", "skills", "timeline"].includes(section) && <>{editing !== null && <form className="admin-panel item-editor" onSubmit={saveItem}><div className="panel-title"><div className="panel-icon">{section === "projects" ? <FolderKanban size={17} /> : section === "skills" ? <Wrench size={17} /> : <GraduationCap size={17} />}</div><div><h2>{editing === "new" ? section === "projects" ? t.newProject : section === "skills" ? t.newSkill : t.newJourney : t.edit}</h2><p>{appearance.language === "pt" ? "Os campos em português são usados como alternativa quando não há tradução." : "Portuguese content is used as a fallback when a translation is missing."}</p></div><button type="button" className="icon-button close-editor" aria-label={t.cancel} onClick={() => setEditing(null)}><X size={17} /></button></div>
          <div className="admin-form-grid">
            {section === "projects" && <><div className="form-field"><label>{t.projectName} *</label><input required maxLength={120} value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="form-field"><label>{t.categoryPt}</label><input value={form.category_pt || ""} onChange={(e) => setForm({ ...form, category_pt: e.target.value })} /></div><div className="form-field full-field"><label>{t.descriptionPt}</label><textarea rows="3" value={form.description_pt || ""} onChange={(e) => setForm({ ...form, description_pt: e.target.value })} /></div><div className="form-field full-field"><label>{t.descriptionEn}</label><textarea rows="3" value={form.description_en || ""} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></div><div className="form-field"><label>{t.categoryEn}</label><input value={form.category_en || ""} onChange={(e) => setForm({ ...form, category_en: e.target.value })} /></div><div className="form-field"><label>{t.technologies}</label><input value={Array.isArray(form.technologies) ? form.technologies.join(", ") : form.technologies || ""} onChange={(e) => setForm({ ...form, technologies: e.target.value })} /></div><div className="form-field"><label>{t.githubUrl}</label><input type="url" value={form.github || ""} onChange={(e) => setForm({ ...form, github: e.target.value })} /></div><div className="form-field"><label>{t.demoUrl}</label><input type="url" value={form.demo || ""} onChange={(e) => setForm({ ...form, demo: e.target.value })} /></div><div className="form-field full-field"><label>{t.imageUrl}</label><input type="url" placeholder="https://..." value={preview.startsWith("blob:") ? "" : form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} /><label className="button button-secondary upload-button"><ImagePlus size={14} />{t.choosePhoto}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => selectImage(e)} /></label>{(preview || form.image) && <img className="project-upload-preview" src={preview || form.image} alt="" />}</div><label className="checkbox-field"><input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /><span>{t.featured}</span></label></>}
            {section === "skills" && <><div className="form-field"><label>{t.skillName} *</label><input required maxLength={80} value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="form-field"><label>{t.category}</label><select value={form.category || "Front-end"} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((category) => <option key={category} value={category}>{categoryLabel(category, appearance.language)}</option>)}</select></div><div className="form-field"><label>{t.level}</label><select value={form.level || "Em aprendizado"} onChange={(e) => setForm({ ...form, level: e.target.value })}>{["Em aprendizado", "Iniciante", "Intermediário", "Avançado"].map((level) => <option key={level} value={level}>{appearance.language === "en" ? levels[level] : level}</option>)}</select></div><div className="form-field"><label>{t.icon}</label><input placeholder="react" value={form.icon || ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div><div className="form-field full-field"><label>{t.descriptionPt}</label><textarea rows="2" value={form.description_pt || ""} onChange={(e) => setForm({ ...form, description_pt: e.target.value })} /></div><div className="form-field full-field"><label>{t.descriptionEn}</label><textarea rows="2" value={form.description_en || ""} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></div></>}
            {section === "timeline" && <><div className="form-field"><label>{t.type}</label><select value={form.type || "education"} onChange={(e) => setForm({ ...form, type: e.target.value })}>{["education", "course", "certification", "experience"].map((type) => <option key={type} value={type}>{translateType(type)}</option>)}</select></div><div className="form-field"><label>{t.period}</label><input maxLength={100} value={form.period || ""} onChange={(e) => setForm({ ...form, period: e.target.value })} /></div><div className="form-field"><label>{t.titlePt} *</label><input required maxLength={160} value={form.title_pt || ""} onChange={(e) => setForm({ ...form, title_pt: e.target.value })} /></div><div className="form-field"><label>{t.titleEn}</label><input maxLength={160} value={form.title_en || ""} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div><div className="form-field full-field"><label>{t.organization}</label><input maxLength={160} value={form.organization || ""} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></div><div className="form-field full-field"><label>{t.descriptionPt}</label><textarea rows="3" value={form.description_pt || ""} onChange={(e) => setForm({ ...form, description_pt: e.target.value })} /></div><div className="form-field full-field"><label>{t.descriptionEn}</label><textarea rows="3" value={form.description_en || ""} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></div></>}
          </div><div className="editor-actions"><button type="button" className="button button-secondary" onClick={() => { setEditing(null); setPreview(""); }}>{t.cancel}</button><button className="button button-primary" disabled={busy}>{busy ? <LoaderCircle size={15} className="spin" /> : <Check size={15} />}{t.save}</button></div></form>}
          <div className="admin-list">{collection?.length ? collection.map((item) => <div className="admin-list-row" key={item.id}><div className="list-item-icon">{section === "projects" && item.image ? <img src={item.image} alt="" /> : section === "projects" ? <FolderKanban size={18} /> : section === "skills" ? <SkillIcon slug={item.icon} name={item.name} /> : <GraduationCap size={18} />}</div><div className="list-item-main"><strong>{section === "timeline" ? item.title_pt : skillLabel(item.name, appearance.language)}</strong><span>{section === "projects" ? `${item.category_pt || "—"} · ${JSON.parse(item.technologies || "[]").join(", ")}` : section === "skills" ? `${categoryLabel(item.category, appearance.language)} · ${appearance.language === "en" ? levels[item.level] || item.level : item.level}` : `${translateType(item.type)} · ${item.organization || "—"}`}</span></div><div className="row-actions"><button className="icon-button" aria-label={t.edit} title={t.edit} onClick={() => openEdit(item)}><Pencil size={15} /></button><button className="icon-button danger-icon" aria-label={t.delete} title={t.delete} onClick={() => deleteItem(section, item.id)}><Trash2 size={15} /></button></div></div>) : <div className="admin-empty">{t.emptyAdmin}</div>}</div>
        </>}
        {section === "messages" && <div className="admin-list">{messages.length ? messages.map((message) => <div className="message-card" key={message.id}><div className="message-top"><strong>{message.name}</strong><span>{formatMessageDate(message.created_at, appearance.language)}</span><button className="icon-button danger-icon" aria-label={t.delete} onClick={async () => { if (window.confirm(t.confirmDelete)) { await api(`/api/admin/messages/${message.id}`, { method: "DELETE" }); setMessages((old) => old.filter((item) => item.id !== message.id)); } }}><Trash2 size={15} /></button></div><a href={`mailto:${message.email}`}>{message.email}</a><p>{message.message}</p></div>) : <div className="admin-empty">{t.emptyAdmin}</div>}</div>}
      </div>
    </main>
    {mobileSidebar && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setMobileSidebar(false)} />}
    {status && <div className="toast admin-toast" role="status">{status}</div>}
  </div>;
}

export default function App() {
  const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin";
  return isAdmin ? <Admin /> : <Portfolio />;
}
