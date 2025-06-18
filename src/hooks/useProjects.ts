import { useState, useEffect } from 'react'
import { projectsAPI } from '../services/api'
import { Project } from '../types'
import { githubService, GitHubRepository } from '../services/githubAPI'

// Função para mapear repositório do GitHub para Project
const mapGitHubRepoToProject = (repo: GitHubRepository): Project => {
  // Determinar status baseado na atividade recente
  const lastUpdate = new Date(repo.updated_at)
  const now = new Date()
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
  
  let status: Project['status']
  
  if (daysSinceUpdate <= 7) {
    status = 'development'
  } else if (daysSinceUpdate <= 30 && repo.open_issues_count > 0) {
    status = 'testing'
  } else if (daysSinceUpdate <= 90) {
    status = 'development'
  } else if (daysSinceUpdate > 180) {
    status = 'completed'
  } else {
    status = 'planning'
  }

  // Calcular progresso baseado em atividade
  let progress = 20 // Base mínima
  
  if (daysSinceUpdate <= 7) progress += 50
  else if (daysSinceUpdate <= 30) progress += 30
  else if (daysSinceUpdate <= 90) progress += 20
  
  progress += Math.min(repo.stargazers_count * 5, 30)
  progress = Math.min(progress, 100)

  return {
    id: repo.id,
    name: repo.name,
    description: repo.description || 'Repositório do GitHub',
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
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Buscar TODOS os repositórios do GitHub
      const username = 'furlanilucas'
      console.log('Buscando TODOS os repositórios do GitHub para:', username)
      
      const repositories = await githubService.getUserRepos(username, {
        sort: 'updated',
        direction: 'desc',
        per_page: 100
      })
      
      console.log('Total de repositórios encontrados no GitHub:', repositories.length)
      console.log('Repositórios:', repositories.map(r => ({ 
        name: r.name, 
        size: r.size, 
        stars: r.stargazers_count,
        language: r.language,
        updated: r.updated_at
      })))

      // Buscar TODOS os repositórios (sem filtros restritivos)
      const allRepos = repositories.filter(repo => 
        // Incluir praticamente todos, excluindo apenas .github
        !repo.name.includes('.github')
      )
      
      console.log('Repositórios incluídos:', allRepos.length)
      console.log('Repositórios incluídos:', allRepos.map(r => r.name))

      // Mapear TODOS os repositórios para projetos
      const githubProjects = allRepos.map(mapGitHubRepoToProject)
      console.log('Projetos do GitHub mapeados:', githubProjects.length)
      
      // Ordenar por data de atualização
      const sortedProjects = githubProjects
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      
      console.log('Total de projetos final:', sortedProjects.length)
      setProjects(sortedProjects)
      
    } catch (err) {
      console.error('Erro detalhado ao carregar projetos:', err)
      setError('Erro ao carregar projetos: ' + (err instanceof Error ? err.message : String(err)))
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    throw new Error('Criação de projetos locais foi desabilitada. Use GitHub para criar repositórios.')
  }

  const updateProject = async (id: number, projectData: Partial<Project>) => {
    try {
      setLoading(true)
      
      const project = projects.find(p => p.id === id)
      if (!project) {
        throw new Error('Projeto não encontrado')
      }
      
      // Apenas permitir edição de alguns campos específicos para projetos do GitHub
      const allowedFields = ['status', 'progress', 'client', 'clientId', 'endDate']
      const filteredData = Object.keys(projectData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          (obj as any)[key] = (projectData as any)[key]
          return obj
        }, {} as Partial<Project>)
      
      const updatedProject = {
        ...project,
        ...filteredData,
        updatedAt: new Date().toISOString()
      }
      
      setProjects(prev => 
        prev.map(p => p.id === id ? updatedProject : p)
      )
      
      return updatedProject
    } catch (err) {
      setError('Erro ao atualizar projeto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id: number) => {
    throw new Error('Não é possível excluir projetos do GitHub através do dashboard')
  }

  const getProjectById = (id: number) => {
    return projects.find(project => project.id === id)
  }

  const getProjectsByStatus = (status: Project['status']) => {
    return projects.filter(project => project.status === status)
  }

  const getProjectsByClient = (clientId: number) => {
    return projects.filter(project => project.clientId === clientId)
  }

  // Estatísticas
  const getStats = () => {
    const totalProjects = projects.length
    const githubProjects = projects.length // Todos são do GitHub agora
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const activeProjects = projects.filter(p => 
      p.status === 'development' || p.status === 'testing'
    ).length
    
    return {
      total: totalProjects,
      local: 0, // Não há mais projetos locais
      github: githubProjects,
      completed: completedProjects,
      active: activeProjects,
      completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
    }
  }

  useEffect(() => {
    // Limpar projetos locais antigos do localStorage
    localStorage.removeItem('dashboard_projects')
    
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsByStatus,
    getProjectsByClient,
    getStats,
  }
}

export function useProject(id: number) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Buscar projeto específico via API do GitHub
      try {
        const response = await projectsAPI.getById(id)
        setProject(response.data)
      } catch (apiErr) {
        setProject(null)
      }
      
    } catch (err) {
      setError('Erro ao carregar projeto')
      console.error('Error fetching project:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [id])

  return {
    project,
    loading,
    error,
    fetchProject,
  }
} 