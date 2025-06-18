import { ProjectStatus } from '../types'

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; color: string }> = {
  planning: {
    label: 'Planejamento',
    color: 'bg-yellow-100 text-yellow-800'
  },
  development: {
    label: 'Desenvolvimento', 
    color: 'bg-blue-100 text-blue-800'
  },
  testing: {
    label: 'Teste',
    color: 'bg-purple-100 text-purple-800'
  },
  completed: {
    label: 'Concluído',
    color: 'bg-green-100 text-green-800'
  },
  paused: {
    label: 'Pausado',
    color: 'bg-gray-100 text-gray-800'
  }
}

export const PROJECT_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'planning', label: 'Planejamento' },
  { value: 'development', label: 'Desenvolvimento' },
  { value: 'testing', label: 'Teste' },
  { value: 'completed', label: 'Concluído' },
  { value: 'paused', label: 'Pausado' }
] as const 