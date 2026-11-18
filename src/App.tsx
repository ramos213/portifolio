import { useEffect, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Mail,
  Menu,
  X,
  Download,
  ExternalLink,
  Code2,
  Database,
  TerminalSquare,
  Layers3,
  GraduationCap,
  MapPin,
  Check,
  CalendarDays,
} from 'lucide-react'
import { projects, siteConfig, type Project } from './config'
import './App.css'

const navItems = [
  ['Início', 'inicio'],
  ['Sobre mim', 'sobre'],
  ['Tecnologias', 'tecnologias'],
  ['Projetos', 'projetos'],
  ['Formação', 'formacao'],
  ['Contato', 'contato'],
]

const technologyGroups = [
  {
    title: 'Frontend',
    items: ['JavaScript', 'React.js', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS'],
  },
  {
    title: 'Backend',
    items: ['Node.js', 'APIs REST', 'Prisma'],
  },
  {
    title: 'Banco de dados',
    items: ['SQL', 'PostgreSQL', 'MongoDB'],
  },
  {
    title: 'Ferramentas',
    items: ['Git', 'GitHub', 'Docker', 'VS Code'],
  },
]

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  )
}

function ProjectPreview({ project }: { project: Project }) {
  return (
    <div className="project-preview" style={{ '--project-accent': project.accent } as React.CSSProperties}>
      <div className="preview-browser">
        <div className="browser-bar">
          <div className="browser-dots"><span /><span /><span /></div>
          <div className="browser-address">{project.name.toLowerCase().replaceAll(' ', '-')}</div>
        </div>
        <img className="project-image" src={project.image} alt={`Prévia do projeto ${project.name}`} />
      </div>
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [formStatus, setFormStatus] = useState('')

  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedProject])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const subject = String(form.get('subject') ?? '').trim()
    const message = String(form.get('message') ?? '').trim()

    if (!name || !email || !subject || !message) {
      setFormStatus('Preencha todos os campos antes de enviar.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormStatus('Informe um endereço de e-mail válido.')
      return
    }
    if (!siteConfig.email) {
      setFormStatus('O envio por e-mail ainda não foi configurado.')
      return
    }
    const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Nome: ${name}\nE-mail: ${email}\n\n${message}`)}`
    window.location.href = mailto
  }

  return (
    <>
      <header className="navbar">
        <a className="logo" href="#inicio" aria-label="Ir para o início">
          <img src="/portifolio.jpg" alt="" />
        </a>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Navegação principal">
          {navItems.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
        </nav>
        <div className="nav-actions">
          <a className="icon-button" href={siteConfig.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <Code2 size={18} />
          </a>
          {siteConfig.resumeUrl ? (
            <a className="button button-small" href={siteConfig.resumeUrl} download>
              <Download size={16} /> Currículo
            </a>
          ) : (
            <a className="button button-small" href="#contato">
              <Download size={16} /> Currículo
            </a>
          )}
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-glow" />
          <motion.div className="hero-content" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="status-pill"><span /> Disponível para estágio e posição júnior</div>
            <p className="hero-kicker">Olá, eu sou <strong>Samuel Ramos.</strong></p>
            <h1>Transformando ideias em <span>soluções digitais.</span></h1>
            <p className="hero-description">
              Sou estudante de Análise e Desenvolvimento de Sistemas e desenvolvedor Full Stack em formação.
              Tenho interesse em desenvolvimento web, criação de APIs e bancos de dados.
            </p>
            <div className="hero-tags">
              <span>ADS Student</span><span>Full Stack in Training</span><span><MapPin size={13} /> Brasil</span>
            </div>
            <div className="hero-buttons">
              <a className="button" href="#projetos">Conheça meus projetos <ArrowRight size={17} /></a>
              <a className="button button-ghost" href="#contato">Entre em contato</a>
            </div>
            <a className="github-link" href={siteConfig.github} target="_blank" rel="noreferrer">
              <Code2 size={18} /> github.com/ramos213
            </a>
          </motion.div>

          <motion.div className="code-visual" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}>
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="profile-photo-card">
              <img src="/portifolio.jpg" alt="Foto de Samuel Ramos" />
            </div>
            <div className="float-card float-react"><Layers3 size={20} /><div><b>React</b><small>Interface moderna</small></div></div>
            <div className="float-card float-api"><TerminalSquare size={20} /><div><b>API</b><small>Dados em tempo real</small></div></div>
          </motion.div>
        </section>

        <section className="section" id="sobre">
          <SectionTitle eyebrow="01 / SOBRE" title="Um pouco sobre mim" />
          <div className="about-grid">
            <div className="about-copy">
              <p>Meu nome é <strong>Samuel Ramos</strong> e sou estudante de Análise e Desenvolvimento de Sistemas.</p>
              <p>Estou construindo minha trajetória na área de tecnologia, com foco no desenvolvimento Full Stack.</p>
              <p>Tenho interesse em criar aplicações web, desenvolver soluções para problemas reais e compreender como funciona toda a estrutura de um sistema, desde a interface até o banco de dados.</p>
              <p>Atualmente estou aprimorando meus conhecimentos em JavaScript, React.js, Node.js e outras tecnologias do ecossistema de desenvolvimento.</p>
            </div>
            <div className="about-cards">
              {[
                ['01', 'Aprendizado contínuo', 'Busco constantemente aprimorar meus conhecimentos e aprender novas tecnologias.'],
                ['02', 'Desenvolvimento prático', 'Transformo ideias em projetos para desenvolver minhas habilidades técnicas.'],
                ['03', 'Evolução profissional', 'Meu objetivo é crescer profissionalmente como desenvolvedor Full Stack.'],
              ].map(([number, title, text]) => (
                <article className="about-card" key={number}>
                  <span>{number}</span><div><h3>{title}</h3><p>{text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="tecnologias">
          <SectionTitle eyebrow="02 / STACK" title="Tecnologias e ferramentas" />
          <div className="technology-grid">
            {technologyGroups.map((group) => (
              <article className="technology-card" key={group.title}>
                <div className="tech-card-heading">
                  {group.title === 'Frontend' ? <Code2 /> : group.title === 'Backend' ? <TerminalSquare /> : group.title === 'Banco de dados' ? <Database /> : <Layers3 />}
                  <h3>{group.title}</h3>
                </div>
                <div className="tech-list">
                  {group.items.map((item) => (
                    <div className="tech-item" key={item}><span>{item.slice(0, 2).toUpperCase()}</span><b>{item}</b></div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section projects-section" id="projetos">
          <SectionTitle eyebrow="03 / PROJETOS" title="Projetos em desenvolvimento" />
          <div className="projects-list">
            {projects.map((project, index) => (
              <motion.article className="project-card" key={project.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}>
                <ProjectPreview project={project} />
                <div className="project-info">
                  <span className="project-number">PROJETO {String(index + 1).padStart(2, '0')}</span>
                  <span className="project-category">{project.category}</span>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <div className="tag-list">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>
                  <button className="button button-ghost" onClick={() => setSelectedProject(project)}>
                    Ver detalhes <ArrowRight size={16} />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="section" id="formacao">
          <SectionTitle eyebrow="04 / TRAJETÓRIA" title="Formação acadêmica" />
          <div className="timeline">
            <div className="timeline-line"><span /></div>
            <article className="timeline-card">
              <div className="timeline-icon"><GraduationCap /></div>
              <span className="timeline-status">Em andamento</span>
              <h3>Análise e Desenvolvimento de Sistemas</h3>
              <p>Desenvolvendo conhecimentos em programação, lógica, desenvolvimento de software, banco de dados e tecnologia.</p>
              <div className="timeline-meta"><span><CalendarDays size={15} /> Graduação em andamento</span><span>2º semestre</span></div>
            </article>
          </div>
        </section>

        <section className="objective">
          <div className="objective-content">
            <SectionTitle eyebrow="PRÓXIMO CAPÍTULO" title="Em busca da minha primeira oportunidade na área de tecnologia." />
            <p>Estou buscando uma oportunidade de estágio ou posição júnior na área de Tecnologia da Informação, onde possa aplicar meus conhecimentos, aprender com profissionais experientes e contribuir com o desenvolvimento de soluções reais.</p>
            <div className="objective-tags">
              <span><Check size={15} /> Proatividade</span>
              <span><Check size={15} /> Aprendizado contínuo</span>
              <span><Check size={15} /> Full Stack</span>
            </div>
            <a className="button" href="#contato">Vamos conversar? <ArrowRight size={17} /></a>
          </div>
        </section>

        <section className="github-section">
          <div className="github-card">
            <div className="github-icon"><Code2 /></div>
            <div><span>GITHUB</span><h3>@ramos213</h3><p>Repositórios públicos e projetos em desenvolvimento.</p></div>
            <a className="button button-ghost" href={siteConfig.github} target="_blank" rel="noreferrer">Visitar GitHub <ExternalLink size={15} /></a>
          </div>
        </section>

        <section className="section contact-section" id="contato">
          <SectionTitle eyebrow="05 / CONTATO" title="Vamos construir algo juntos?" />
          <div className="contact-grid">
            <div className="contact-copy">
              <p>Estou aberto a oportunidades, conexões profissionais e novos desafios na área de tecnologia.</p>
              <div className="contact-links">
                <a href={siteConfig.github} target="_blank" rel="noreferrer"><Code2 /> <div><span>GitHub</span><b>@ramos213</b></div></a>
                <a href={siteConfig.linkedin} target="_blank" rel="noreferrer"><ExternalLink /> <div><span>LinkedIn</span><b>/in/ramos21</b></div></a>
                {siteConfig.email && <a href={`mailto:${siteConfig.email}`}><Mail /> <div><span>E-mail</span><b>{siteConfig.email}</b></div></a>}
              </div>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Nome<input name="name" type="text" placeholder="Seu nome" /></label>
                <label>E-mail<input name="email" type="email" placeholder="seuemail@exemplo.com" /></label>
              </div>
              <label>Assunto<input name="subject" type="text" placeholder="Oportunidade de estágio" /></label>
              <label>Mensagem<textarea name="message" rows={5} placeholder="Conte um pouco sobre a oportunidade..." /></label>
              {formStatus && <p className="form-status" role="status">{formStatus}</p>}
              <button className="button" type="submit">Enviar mensagem <ArrowRight size={16} /></button>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <a className="logo" href="#inicio" aria-label="Ir para o início">
          <img src="/portifolio.jpg" alt="" />
        </a>
        <p>Samuel Ramos.<br /><span>Desenvolvido com dedicação e muito código.</span></p>
        <div className="footer-links">
          <a href={siteConfig.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={siteConfig.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="#inicio">Início</a>
          <a href="#projetos">Projetos</a>
          <a href="#contato">Contato</a>
        </div>
        <span className="copyright">© {new Date().getFullYear()} Samuel Ramos</span>
      </footer>

      <AnimatePresence>
        {selectedProject && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setSelectedProject(null)}>
            <motion.div className="project-modal" initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} onMouseDown={(event) => event.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedProject(null)} aria-label="Fechar detalhes"><X /></button>
              <ProjectPreview project={selectedProject} />
              <div className="modal-content">
                <span className="project-category">{selectedProject.category}</span>
                <h2>{selectedProject.name}</h2>
                <p>{selectedProject.description}</p>
                <h3>Principais funcionalidades</h3>
                <div className="feature-grid">
                  {selectedProject.features.map((feature) => <span key={feature}><Check size={14} /> {feature}</span>)}
                </div>
                <div className="tag-list">{selectedProject.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>
                <div className="modal-status"><span /> Projeto em desenvolvimento</div>
                <div className="modal-actions">
                  {selectedProject.demoUrl ? <a className="button" href={selectedProject.demoUrl} target="_blank" rel="noreferrer">Ver demonstração</a> : <span className="button button-disabled">Demonstração em breve</span>}
                  {selectedProject.repositoryUrl ? <a className="button button-ghost" href={selectedProject.repositoryUrl} target="_blank" rel="noreferrer">Ver código</a> : <span className="button button-disabled">Repositório em breve</span>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App
