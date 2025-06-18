import axios, { AxiosResponse, AxiosError } from 'axios'

// Configuração base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requisições (adicionar token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para respostas (tratar erros)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Importar tipos centralizados
import type { Project, Client } from '../types'
export type { Project, Client }

export interface Demand {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  projectId: number
  assignedTo?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface GitHubStats {
  repo: string
  stars: number
  forks: number
  issues: number
  commits: number
  contributors: number
  lastCommit: string
}

// Serviços de API
export const projectsAPI = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: number) => api.get<Project>(`/projects/${id}`),
  create: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Project>('/projects', data),
  update: (id: number, data: Partial<Project>) => 
    api.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
}

export const clientsAPI = {
  getAll: () => api.get<Client[]>('/clients'),
  getById: (id: number) => api.get<Client>(`/clients/${id}`),
  create: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Client>('/clients', data),
  update: (id: number, data: Partial<Client>) => 
    api.put<Client>(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
}

export const demandsAPI = {
  getAll: () => api.get<Demand[]>('/demands'),
  getByProject: (projectId: number) => api.get<Demand[]>(`/demands/project/${projectId}`),
  getById: (id: number) => api.get<Demand>(`/demands/${id}`),
  create: (data: Omit<Demand, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Demand>('/demands', data),
  update: (id: number, data: Partial<Demand>) => 
    api.put<Demand>(`/demands/${id}`, data),
  delete: (id: number) => api.delete(`/demands/${id}`),
}

export const githubAPI = {
  getRepoStats: (repo: string) => api.get<GitHubStats>(`/github/stats/${repo}`),
}

export const authAPI = {
  login: (email: string, password: string) => 
    api.post<{ token: string; user: any }>('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string }) => 
    api.post<{ token: string; user: any }>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

export default api 