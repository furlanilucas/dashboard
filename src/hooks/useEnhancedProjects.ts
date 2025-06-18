import { useState, useEffect, useCallback } from 'react'
import { Project, ProjectStats } from '../types'
import { persistenceService } from '../services/persistenceService'
import { githubService } from '../services/githubAPI'

interface UseEnhancedProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  
  // CRUD Operations
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>
  updateProject: (id: string, data: Partial<Project>) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
  
  // Getters
  getProjectById: (id: string) => Project | undefined
  getProjectsByStatus: (status: Project['status']) => Project[]
  getProjectsByClient: (clientId: number) => Project[]
  getStats: () => ProjectStats
  
  // Sync & Backup
  syncStatus: {
    isOnline: boolean
    useAPI: boolean
    syncQueueSize: number
    backupsCount: number
  }
  createBackup: () => Promise<string>
  availableBackups: { key: string, date: string, type: string }[]
  restoreBackup: (backupKey: string) => Promise<void>
  
  // Refresh
  refreshProjects: () => Promise<void>
}

export function useEnhancedProjects(): UseEnhancedProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState(persistenceService.getStatus())
  const [availableBackups, setAvailableBackups] = useState(persistenceService.getAvailableBackups())

  // Atualizar status de sincronização periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(persistenceService.getStatus())
      setAvailableBackups(persistenceService.getAvailableBackups())
    }, 5000) // Atualizar a cada 5 segundos

    return () => clearInterval(interval)
  }, [])

  // Mapear repositório GitHub para Project
  const mapGitHubRepoToProject = useCallback((repo: any): Project => {
    const lastUpdate = new Date(repo.updated_at)
    const now = new Date()
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))

    let status: Project['status']
    if (daysSinceUpdate <= 7) status = 'development'
    else if (daysSinceUpdate <= 30 && repo.open_issues_count > 0) status = 'testing'
    else if (daysSinceUpdate > 180) status = 'completed'
    else status = 'development'

    let progress = 20
    progress += Math.min(repo.stargazers_count * 5, 30)
    if (daysSinceUpdate <= 7) progress += 30
    else if (daysSinceUpdate <= 30) progress += 20
    if (repo.size > 1000) progress += 20
    else if (repo.size > 100) progress += 10
    progress = Math.min(progress, 100)

    return {
      id: repo.id,
      name: repo.name,
      description: repo.description || 'Projeto GitHub importado',
      status,
      client: 'Lucas Furlani',
      clientId: 1,
      startDate: repo.created_at,
      endDate: status === 'completed' ? repo.updated_at : undefined,
      progress,
      githubRepo: repo.html_url,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      isGitHubProject: true
    }
  }, [])

  // Carregar projetos (locais + GitHub)
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar projetos locais via persistence service
      const localProjects = await persistenceService.read<Project>('projects')
      
      // Tentar carregar projetos do GitHub
      let githubProjects: Project[] = []
      try {
        const username = 'furlanilucas'
        const repositories = await githubService.getUserRepos(username, {
          sort: 'updated',
          direction: 'desc',
          per_page: 20
        })

        const projectRepos = repositories.filter(repo => 
          !repo.name.includes('config') &&
          !repo.name.includes('dotfiles') &&
          !repo.name.includes('.github') &&
          !repo.name.toLowerCase().includes('template') &&
          repo.size > 10 &&
          (repo.stargazers_count > 0 || repo.forks_count > 0 || repo.size > 100) &&
          (repo.description || repo.size > 500)
        )

        githubProjects = projectRepos.map(mapGitHubRepoToProject)
      } catch (githubError) {
        console.warn('Erro ao carregar projetos do GitHub:', githubError)
      }

      const allProjects = [...localProjects, ...githubProjects]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

      setProjects(allProjects)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar projetos'
      setError(errorMessage)
      console.error('Erro ao carregar projetos:', err)
    } finally {
      setLoading(false)
    }
  }, [mapGitHubRepoToProject])

  // Inicializar projetos
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // CRUD Operations
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    try {
      setLoading(true)
      
      const newProject = await persistenceService.create<Project>('projects', {
        ...projectData,
        isGitHubProject: false
      })
      
      setProjects(prev => {
        const updated = [...prev, newProject]
        return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      })
      
      return newProject
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar projeto'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProject = useCallback(async (id: string, projectData: Partial<Project>): Promise<Project> => {
    try {
      setLoading(true)
      
      const project = projects.find(p => p.id.toString() === id)
      if (!project) {
        throw new Error('Projeto não encontrado')
      }

      let updatedData = projectData
      
      // Se for projeto GitHub, limitar campos editáveis
      if (project.isGitHubProject) {
        const allowedFields = ['status', 'progress', 'client', 'clientId', 'endDate']
        updatedData = Object.keys(projectData)
          .filter(key => allowedFields.includes(key))
          .reduce((obj, key) => {
            (obj as any)[key] = (projectData as any)[key]
            return obj
          }, {} as Partial<Project>)
      }

      const updatedProject = await persistenceService.update<Project>('projects', id, updatedData)
      
      setProjects(prev => 
        prev.map(p => p.id.toString() === id ? { ...p, ...updatedProject } : p)
      )
      
      return updatedProject
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar projeto'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [projects])

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true)
      
      const project = projects.find(p => p.id.toString() === id)
      if (!project) {
        throw new Error('Projeto não encontrado')
      }

      if (project.isGitHubProject) {
        throw new Error('Não é possível excluir projetos do GitHub')
      }

      await persistenceService.delete('projects', id)
      
      setProjects(prev => prev.filter(p => p.id.toString() !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir projeto'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [projects])

  // Getters
  const getProjectById = useCallback((id: string) => {
    return projects.find(project => project.id.toString() === id)
  }, [projects])

  const getProjectsByStatus = useCallback((status: Project['status']) => {
    return projects.filter(project => project.status === status)
  }, [projects])

  const getProjectsByClient = useCallback((clientId: number) => {
    return projects.filter(project => project.clientId === clientId)
  }, [projects])

  const getStats = useCallback((): ProjectStats => {
    const totalProjects = projects.length
    const localProjects = projects.filter(p => !p.isGitHubProject).length
    const githubProjects = projects.filter(p => p.isGitHubProject).length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const activeProjects = projects.filter(p => 
      p.status === 'development' || p.status === 'testing'
    ).length
    
    return {
      total: totalProjects,
      local: localProjects,
      github: githubProjects,
      completed: completedProjects,
      active: activeProjects,
      completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
    }
  }, [projects])

  // Backup Operations
  const createBackup = useCallback(async (): Promise<string> => {
    try {
      const backupKey = await persistenceService.createBackup('manual')
      setAvailableBackups(persistenceService.getAvailableBackups())
      return backupKey
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar backup'
      setError(errorMessage)
      throw err
    }
  }, [])

  const restoreBackup = useCallback(async (backupKey: string): Promise<void> => {
    try {
      setLoading(true)
      await persistenceService.restoreBackup(backupKey)
      await loadProjects() // Recarregar projetos após restauração
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao restaurar backup'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadProjects])

  return {
    projects,
    loading,
    error,
    
    // CRUD
    createProject,
    updateProject,
    deleteProject,
    
    // Getters
    getProjectById,
    getProjectsByStatus,
    getProjectsByClient,
    getStats,
    
    // Sync & Backup
    syncStatus,
    createBackup,
    availableBackups,
    restoreBackup,
    
    // Refresh
    refreshProjects: loadProjects
  }
} 