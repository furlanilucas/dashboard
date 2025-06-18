export interface Client {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface ClientFormData {
  name: string
  email: string
  phone: string
  company: string
  address: string
}

export interface ClientWithProjects extends Client {
  projectsCount: number
  activeProjects: number
  completedProjects: number
  lastProjectDate?: string
} 