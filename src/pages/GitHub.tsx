import { useState } from 'react'
import { useGitHub } from '../hooks/useGitHub'
import { GitHubRepository } from '../services/githubAPI'
import { 
  Star, 
  GitFork, 
  Calendar, 
  Code, 
  ExternalLink, 
  Loader2,
  RefreshCw,
  User,
  MapPin,
  Building,
  Link as LinkIcon
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const GitHub = () => {
  const { user, repos, stats, loading, error, refreshData } = useGitHub()
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setRefreshing(false)
  }

  const filteredRepos = selectedLanguage 
    ? repos.filter(repo => repo.language === selectedLanguage)
    : repos

  const getLanguageColor = (language: string | null) => {
    const colors: { [key: string]: string } = {
      JavaScript: 'bg-yellow-500',
      TypeScript: 'bg-blue-500',
      Python: 'bg-green-500',
      Java: 'bg-red-500',
      React: 'bg-cyan-500',
      HTML: 'bg-orange-500',
      CSS: 'bg-purple-500',
      PHP: 'bg-indigo-500',
      C: 'bg-gray-600',
      'C++': 'bg-pink-500',
      Go: 'bg-cyan-600',
      Rust: 'bg-orange-600'
    }
    return colors[language || ''] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do GitHub...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            <p className="font-medium">Erro ao carregar dados</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GitHub Dashboard</h1>
          <p className="text-gray-600">Estatísticas e repositórios do GitHub</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Perfil do Usuário */}
      {user && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-start gap-6">
            <img
              src={user.avatar_url}
              alt={user.name || user.login}
              className="w-24 h-24 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name || user.login}
                </h2>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
              <p className="text-gray-600 mb-4">@{user.login}</p>
              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {user.company}
                  </div>
                )}
                {user.blog && (
                  <a
                    href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Repositórios</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalRepos}</p>
              </div>
              <Code className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Stars</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStars}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Forks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalForks}</p>
              </div>
              <GitFork className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Repos Ativos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.recentActivity.activeRepos}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Linguagens */}
      {stats && Object.keys(stats.languages).length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Linguagens de Programação</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedLanguage('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedLanguage === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {Object.entries(stats.languages)
              .sort(([,a], [,b]) => b - a)
              .map(([language, count]) => (
                <button
                  key={language}
                  onClick={() => setSelectedLanguage(language)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-2 ${
                    selectedLanguage === language 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${getLanguageColor(language)}`} />
                  {language} ({count})
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Repositórios */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Repositórios ({filteredRepos.length})
            {selectedLanguage && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                - Filtrado por {selectedLanguage}
              </span>
            )}
          </h3>
        </div>
        <div className="divide-y">
          {filteredRepos.map((repo: GitHubRepository) => (
            <div key={repo.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 truncate"
                    >
                      {repo.name}
                    </a>
                    {repo.language && (
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <div className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                        {repo.language}
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-gray-700 mb-3">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {repo.stargazers_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {repo.forks_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Atualizado {formatDistanceToNow(new Date(repo.updated_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                  </div>
                </div>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GitHub 