export interface Skill {
  logo: string;
  name: string;
  level: 'Avanzado' | 'Intermedio' | 'Básico' | 'Experto';
  percent: number;
  color?: string;
}

export interface StackItem {
  name: string;
  type: string;
  status: string;
  detail: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  namespace: string;
  statusLabel: string;
  mediaPlaceholder: string;
  image?: string;
  title: string;
  description: string;
  chips: string[];
  links: ProjectLink[];
  category?: 'DevOps & Cloud' | 'Sistemas Distribuidos' | 'Ciberseguridad & Rust' | 'Redes & Low-Level' | 'Full-Stack & Apps';
}
