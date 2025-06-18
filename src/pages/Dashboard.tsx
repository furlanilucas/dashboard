import { FolderOpen, Users, CheckCircle, Clock, Github, Star, GitFork, Calendar } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useGitHub } from '../hooks/useGitHub'

export default function Dashboard() {
  const { projects, loading } = useProjects()
  const { stats: githubStats, loading: githubLoading } = useGitHub()

  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const inProgressProjects = projects.filter(p => p.status === 'development' || p.status === 'testing').length
  const planningProjects = projects.filter(p => p.status === 'planning').length

  const stats = [
    {
      name: 'Repositórios Total',
      value: totalProjects.toString(),
      icon: Github,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Em Desenvolvimento',
      value: inProgressProjects.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Concluídos',
      value: completedProjects.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Planejamento',
      value: planningProjects.toString(),
      icon: FolderOpen,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
  ]

  if (loading || githubLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Github className="h-8 w-8 text-gray-700" />
          Dashboard GitHub
        </h1>
        <p className="text-gray-600 mt-2">
          Visão geral dos seus repositórios • {totalProjects} repositórios encontrados
        </p>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Estatísticas do GitHub */}
      {githubStats && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Estatísticas do GitHub
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{githubStats.totalStars}</div>
              <div className="text-sm text-gray-500">Total de Stars</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{githubStats.totalForks}</div>
              <div className="text-sm text-gray-500">Total de Forks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{githubStats.recentActivity?.activeRepos || 0}</div>
              <div className="text-sm text-gray-500">Repos Ativos</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de repositórios recentes */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Repositórios Atualizados Recentemente
        </h3>
        
        {projects.length > 0 ? (
          <div className="space-y-3">
            {projects.slice(0, 8).map((project) => (
              <div key={project.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <Github className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-900">{project.name}</span>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    project.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'development'
                      ? 'bg-blue-100 text-blue-800'
                      : project.status === 'planning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'completed' ? 'Concluído' :
                     project.status === 'development' ? 'Desenvolvimento' :
                     project.status === 'planning' ? 'Planejamento' :
                     project.status === 'testing' ? 'Teste' : 'Pausado'}
                  </span>
                  <div className="text-sm text-gray-500">
                    {project.progress}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Github className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum repositório encontrado</h4>
            <p className="text-gray-600 mb-4">Verifique se o token do GitHub está configurado corretamente</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Configure o token VITE_GITHUB_TOKEN no arquivo .env para acessar seus repositórios
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 