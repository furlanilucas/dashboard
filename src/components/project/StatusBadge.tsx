import { ProjectStatus } from '../../types'

interface StatusBadgeProps {
  status: ProjectStatus
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
}

const statusConfig = {
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

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeConfig[size]}`}
    >
      {config.label}
    </span>
  )
} 