import { useState, useEffect } from 'react'
import { Star, GitFork, Eye, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { githubService, GitHubRepository } from '../../services/githubAPI'

interface GitHubRepoInfoProps {
  repoUrl: string
  compact?: boolean
}

const GitHubRepoInfo = ({ repoUrl, compact = false }: GitHubRepoInfoProps) => {
  const [repo, setRepo] = useState<GitHubRepository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRepoInfo = async () => {
      try {
        // Extrair owner e repo do URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!match) {
          setError('URL inválida do GitHub')
          setLoading(false)
          return
        }

        const [, owner, repoName] = match
        setLoading(true)
        setError(null)
        
        const repoData = await githubService.getRepo(owner, repoName)
        setRepo(repoData)
      } catch (err) {
        console.error('Erro ao buscar repositório:', err)
        setError('Erro ao carregar dados do repositório')
      } finally {
        setLoading(false)
      }
    }

    if (repoUrl) {
      fetchRepoInfo()
    }
  }, [repoUrl])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando repositório...
      </div>
    )
  }

  if (error || !repo) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        {error || 'Repositório não encontrado'}
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {repo.stargazers_count}
        </div>
        <div className="flex items-center gap-1">
          <GitFork className="h-3 w-3" />
          {repo.forks_count}
        </div>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          GitHub
        </a>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium text-gray-900">{repo.name}</span>
          {repo.language && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {repo.language}
            </span>
          )}
        </div>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      
      {repo.description && (
        <p className="text-gray-600 text-sm">{repo.description}</p>
      )}
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          <span>{repo.stargazers_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitFork className="h-4 w-4" />
          <span>{repo.forks_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{repo.watchers_count}</span>
        </div>
      </div>
    </div>
  )
}

export default GitHubRepoInfo 