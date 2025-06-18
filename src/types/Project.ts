export interface Project {
  id: number
  name: string
  description: string
  status: 'planning' | 'development' | 'testing' | 'completed' | 'paused'
  client: string
  clientId: number
  startDate: string
  endDate?: string
  progress: number
  githubRepo?: string
  createdAt: string
  updatedAt: string
  isGitHubProject?: boolean
}

export type ProjectStatus = Project['status']

export interface ProjectStats {
  total: number
  local: number
  github: number
  completed: number
  active: number
  completionRate: number
}

export interface ProjectFormData {
  name: string
  description: string
  status: ProjectStatus
  client: string
  startDate: string
  endDate: string
  progress: number
  githubRepo: string
} 