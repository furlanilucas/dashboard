import { useState, useEffect } from 'react'

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  completedAt?: string
  projectId: string | number
}

export interface UseChecklistReturn {
  checklist: ChecklistItem[]
  loading: boolean
  addTask: (title: string, description?: string, priority?: 'low' | 'medium' | 'high') => void
  toggleTask: (taskId: string) => void
  updateTask: (taskId: string, updates: Partial<ChecklistItem>) => void
  deleteTask: (taskId: string) => void
  getCompletedCount: () => number
  getTotalCount: () => number
  getProgressPercentage: () => number
}

// Simulação de dados para cada projeto baseado no tipo de projeto
const generateMockChecklist = (projectId: string | number, _projectName: string, projectStatus: string, projectProgress: number): ChecklistItem[] => {
  const baseChecklist: Omit<ChecklistItem, 'id' | 'projectId' | 'createdAt'>[] = [
    {
      title: 'Configurar ambiente de desenvolvimento',
      description: 'Instalar dependências, configurar variáveis de ambiente e ferramentas de desenvolvimento',
      completed: true,
      priority: 'high',
      completedAt: '2024-01-16T00:00:00Z'
    },
    {
      title: 'Definir arquitetura do projeto',
      description: 'Definir estrutura de pastas, padrões de código e tecnologias a serem utilizadas',
      completed: true,
      priority: 'high',
      completedAt: '2024-01-18T00:00:00Z'
    },
    {
      title: 'Implementar funcionalidades principais',
      description: 'Desenvolver as principais funcionalidades do sistema',
      completed: projectProgress > 30,
      priority: 'high',
      completedAt: projectProgress > 30 ? '2024-02-01T00:00:00Z' : undefined
    },
    {
      title: 'Criar interface de usuário',
      description: 'Design responsivo e experiência do usuário',
      completed: projectProgress > 50,
      priority: 'medium',
      completedAt: projectProgress > 50 ? '2024-02-15T00:00:00Z' : undefined
    },
    {
      title: 'Implementar testes unitários',
      description: 'Cobertura de pelo menos 80% do código com testes automatizados',
      completed: projectProgress > 70,
      priority: 'medium',
      completedAt: projectProgress > 70 ? '2024-02-25T00:00:00Z' : undefined
    },
    {
      title: 'Documentação técnica',
      description: 'README, documentação da API e guias de instalação',
      completed: projectProgress > 80,
      priority: 'medium',
      completedAt: projectProgress > 80 ? '2024-03-01T00:00:00Z' : undefined
    },
    {
      title: 'Testes de integração',
      description: 'Testes end-to-end e validação de fluxos completos',
      completed: projectProgress > 85,
      priority: 'high',
      completedAt: projectProgress > 85 ? '2024-03-05T00:00:00Z' : undefined
    },
    {
      title: 'Deploy em produção',
      description: 'Configurar CI/CD e realizar deploy para ambiente de produção',
      completed: projectStatus === 'completed',
      priority: 'high',
      completedAt: projectStatus === 'completed' ? '2024-03-10T00:00:00Z' : undefined
    }
  ]

  return baseChecklist.map((item, index) => ({
    ...item,
    id: `${projectId}-${index + 1}`,
    projectId,
    createdAt: new Date(Date.now() - (7 - index) * 24 * 60 * 60 * 1000).toISOString()
  }))
}

export const useChecklist = (projectId: string | number, projectName?: string, projectStatus?: string, projectProgress?: number): UseChecklistReturn => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  // Simular carregamento de dados do checklist
  useEffect(() => {
    const loadChecklist = () => {
      setLoading(true)
      
      // Verificar se já existe no localStorage
      const storageKey = `checklist-${projectId}`
      const savedChecklist = localStorage.getItem(storageKey)
      
      if (savedChecklist) {
        setChecklist(JSON.parse(savedChecklist))
      } else {
        // Gerar checklist mock baseado no projeto
        const mockData = generateMockChecklist(
          projectId, 
          projectName || 'Projeto', 
          projectStatus || 'development', 
          projectProgress || 0
        )
        setChecklist(mockData)
        localStorage.setItem(storageKey, JSON.stringify(mockData))
      }
      
      setLoading(false)
    }

    if (projectId) {
      loadChecklist()
    }
  }, [projectId, projectName, projectStatus, projectProgress])

  // Salvar no localStorage sempre que o checklist mudar
  useEffect(() => {
    if (checklist.length > 0) {
      const storageKey = `checklist-${projectId}`
      localStorage.setItem(storageKey, JSON.stringify(checklist))
    }
  }, [checklist, projectId])

  const addTask = (title: string, description?: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const newTask: ChecklistItem = {
      id: `${projectId}-${Date.now()}`,
      title,
      description,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
      projectId
    }

    setChecklist(prev => [...prev, newTask])
  }

  const toggleTask = (taskId: string) => {
    setChecklist(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : undefined
          }
        : task
    ))
  }

  const updateTask = (taskId: string, updates: Partial<ChecklistItem>) => {
    setChecklist(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates }
        : task
    ))
  }

  const deleteTask = (taskId: string) => {
    setChecklist(prev => prev.filter(task => task.id !== taskId))
  }

  const getCompletedCount = () => {
    return checklist.filter(task => task.completed).length
  }

  const getTotalCount = () => {
    return checklist.length
  }

  const getProgressPercentage = () => {
    const total = getTotalCount()
    if (total === 0) return 0
    return Math.round((getCompletedCount() / total) * 100)
  }

  return {
    checklist,
    loading,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    getCompletedCount,
    getTotalCount,
    getProgressPercentage
  }
} 