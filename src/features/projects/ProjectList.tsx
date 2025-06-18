import { useState } from 'react'
import { Search, Github, ExternalLink, Calendar, Zap, Star, GitFork } from 'lucide-react'
import { useProjects } from '../../hooks/useProjects'
import { Project } from '../../types'

interface ProjectListProps {
  showTitle?: boolean
  showActions?: boolean
  showSearch?: boolean
  limit?: number
}

export default function ProjectList({ 
  showTitle = true, 
  showActions = true, 
  showSearch = true,
  limit 
}: ProjectListProps) {
  const { projects, loading, error } = useProjects()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-red-100 p-2 rounded-lg">
            <Github className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-red-800 font-medium">Erro ao carregar repositórios</h3>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Github className="h-6 w-6" />
              Repositórios GitHub
            </h2>
            <p className="text-gray-600 mt-1">
              {displayProjects.length} de {projects.length} repositórios
            </p>
          </div>
        </div>
      )}

      {showSearch && (
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar repositórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {displayProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              showGitHubLink={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Github className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum repositório encontrado' : 'Nenhum repositório disponível'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? `Não encontramos repositórios que correspondam a "${searchTerm}"`
              : 'Configure o token do GitHub para acessar seus repositórios'
            }
          </p>
          
          {!searchTerm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-blue-900 mb-1">Como configurar o GitHub</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    1. Crie um token pessoal no GitHub<br />
                    2. Adicione o token no arquivo .env como VITE_GITHUB_TOKEN<br />
                    3. Reinicie o servidor de desenvolvimento
                  </p>
                  <a
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Criar token no GitHub
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente simplificado para ProjectCard
function ProjectCard({ project, showGitHubLink }: { project: Project; showGitHubLink?: boolean }) {
  const handleClick = () => {
    if (project.githubRepo) {
      window.open(project.githubRepo, '_blank')
    }
  }

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 cursor-pointer group"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <Github className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {project.description || 'Sem descrição'}
            </p>
          </div>
          
          {showGitHubLink && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-gray-100 p-2 rounded-lg">
                <ExternalLink className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 text-sm rounded-full font-medium ${
            project.status === 'completed' 
              ? 'bg-green-100 text-green-800'
              : project.status === 'development'
              ? 'bg-blue-100 text-blue-800'
              : project.status === 'planning'
              ? 'bg-yellow-100 text-yellow-800'
              : project.status === 'testing'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {project.status === 'completed' ? 'Concluído' :
             project.status === 'development' ? 'Ativo' :
             project.status === 'planning' ? 'Planejamento' :
             project.status === 'testing' ? 'Teste' : 'Pausado'}
          </span>
          
          <div className="text-sm text-gray-500">
            {project.progress}%
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.startDate).toLocaleDateString('pt-BR')}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span className="text-xs">0</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              <span className="text-xs">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 