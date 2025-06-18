import { Calendar, User, Eye, CheckCircle2, Edit3, Trash2, Github, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import GitHubRepoInfo from './GitHubRepoInfo'
import { useChecklist } from '../../hooks/useChecklist'
import { Project } from '../../types'

interface ProjectCardProps {
  project: Project
  onClick?: () => void
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
  showGitHubLink?: boolean
}

export default function ProjectCard({ 
  project, 
  onClick, 
  onEdit, 
  onDelete, 
  showGitHubLink = false 
}: ProjectCardProps) {
  const navigate = useNavigate()
  
  // Hook para obter informações do checklist
  const { getCompletedCount, getTotalCount, loading: checklistLoading } = useChecklist(
    project.id,
    project.name,
    project.status,
    project.progress
  )

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(`/projetos/${project.id}`)
    }
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/projetos/${project.id}`)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(project)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(project)
    }
  }

  const handleGitHubClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (project.githubRepo) {
      window.open(project.githubRepo, '_blank')
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer relative group"
      onClick={handleClick}
    >
      {/* Header do Card */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {project.name}
            </h3>
            {project.isGitHubProject && (
              <div title="Repositório do GitHub">
                <Github className="h-4 w-4 text-gray-500" />
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">
            {project.description}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <StatusBadge status={project.status} />
          
          {/* Botões de Ação */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleViewDetails}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver detalhes"
            >
              <Eye className="h-4 w-4" />
            </button>
            
            {showGitHubLink && project.githubRepo && (
              <button
                onClick={handleGitHubClick}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                title="Abrir no GitHub"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title={project.isGitHubProject ? "Editar configurações" : "Editar projeto"}
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            
            {onDelete && !project.isGitHubProject && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir projeto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Informações do Cliente */}
      <div className="flex items-center mb-3">
        <User className="h-4 w-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">{project.client}</span>
      </div>

      {/* Datas */}
      <div className="flex items-center mb-4">
        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">
          {new Date(project.startDate).toLocaleDateString('pt-BR')}
          {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('pt-BR')}`}
        </span>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-sm text-gray-500">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Progresso das Tarefas */}
      {!checklistLoading && getTotalCount() > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            {getCompletedCount()} de {getTotalCount()} tarefas concluídas
          </span>
        </div>
      )}

      {/* GitHub Repository */}
      {project.githubRepo && !showGitHubLink && (
        <div onClick={(e) => e.stopPropagation()}>
          <GitHubRepoInfo repoUrl={project.githubRepo} compact />
        </div>
      )}

      {/* Indicador de Tipo de Projeto */}
      {project.isGitHubProject && (
        <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          GitHub
        </div>
      )}
    </div>
  )
} 