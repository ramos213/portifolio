export const siteConfig = {
  name: 'Samuel Ramos',
  role: 'Full Stack Developer in Training',
  subtitle: 'Estudante de Análise e Desenvolvimento de Sistemas',
  email: '',
  github: 'https://github.com/ramos213',
  linkedin: 'https://www.linkedin.com/in/ramos21/',
  whatsapp: '',
  resumeUrl: '',
}

export type Project = {
  name: string
  category: string
  description: string
  image: string
  features: string[]
  technologies: string[]
  demoUrl: string
  repositoryUrl: string
  accent: string
  label: string
}

export const projects: Project[] = [
  {
    name: 'Deluxe Barber',
    category: 'Sistema comercial / Barbearia',
    image: '/deluxe.png',
    description:
      'Plataforma completa para barbearias, desenvolvida para facilitar o gerenciamento de serviços e agendamentos.',
    features: [
      'Agendamento online',
      'Seleção de serviços e barbeiros',
      'Consulta de horários disponíveis',
      'Integração com WhatsApp',
      'Avaliações de clientes',
      'Painel administrativo',
    ],
    technologies: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    demoUrl: '',
    repositoryUrl: '',
    accent: '#8b5cf6',
    label: 'BARBER',
  },
  {
    name: 'Pets Petshop',
    category: 'E-commerce / Sistema comercial',
    image: '/pet.png',
    description:
      'Uma plataforma para pet shops, reunindo serviços de banho e tosa, agendamentos e uma loja virtual.',
    features: [
      'Agendamento de serviços',
      'Cadastro de animais',
      'Loja virtual',
      'Carrinho de compras',
      'Controle de estoque',
      'Painel administrativo',
    ],
    technologies: ['React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
    demoUrl: '',
    repositoryUrl: '',
    accent: '#10b981',
    label: 'PETS',
  },
  {
    name: 'Dentist',
    category: 'Sistema de gestão / Saúde',
    image: '/dent.png',
    description:
      'Sistema de gerenciamento odontológico para organizar pacientes, consultas e procedimentos de clínicas.',
    features: [
      'Agendamento de consultas',
      'Calendário profissional',
      'Cadastro de pacientes',
      'Histórico de consultas',
      'Relatórios financeiros básicos',
      'Painel administrativo',
    ],
    technologies: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    demoUrl: '',
    repositoryUrl: '',
    accent: '#38bdf8',
    label: 'DENT',
  },
]
