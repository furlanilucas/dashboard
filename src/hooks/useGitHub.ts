import { useState, useEffect, useCallback } from 'react'
import { githubService, GitHubRepository, GitHubUser, GitHubStats } from '../services/githubAPI'

interface UseGitHubReturn {
  user: GitHubUser | null
  repos: GitHubRepository[]
  stats: GitHubStats | null
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

export const useGitHub = (username: string = 'furlanilucas'): UseGitHubReturn => {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [repos, setRepos] = useState<GitHubRepository[]>([])
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGitHubData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [userData, reposData, statsData] = await Promise.all([
        githubService.getUser(username),
        githubService.getUserRepos(username, { per_page: 50 }),
        githubService.getUserStats(username)
      ])

      setUser(userData)
      setRepos(reposData)
      setStats(statsData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('Erro ao buscar dados do GitHub:', err)
      setError(`Erro ao carregar dados do GitHub: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = useCallback(async () => {
    await fetchGitHubData()
  }, [username])

  useEffect(() => {
    if (username) {
      fetchGitHubData()
    }
  }, [username])

  return {
    user,
    repos,
    stats,
    loading,
    error,
    refreshData
  }
}

// Hook específico para buscar um repositório
export const useGitHubRepo = (owner: string, repoName: string) => {
  const [repo, setRepo] = useState<GitHubRepository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRepo = async () => {
    try {
      setLoading(true)
      setError(null)
      const repoData = await githubService.getRepo(owner, repoName)
      setRepo(repoData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('Erro ao buscar repositório:', err)
      setError(`Erro ao carregar repositório: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (owner && repoName) {
      fetchRepo()
    }
  }, [owner, repoName])

  const refreshRepo = useCallback(async () => {
    await fetchRepo()
  }, [owner, repoName])

  return { repo, loading, error, refreshRepo }
}
