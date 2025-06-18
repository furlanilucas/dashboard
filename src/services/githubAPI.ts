import axios from 'axios'

// Configuração específica para GitHub API
const githubAPI = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 10000,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
  },
})

// Adicionar token se disponível
const token = import.meta.env.VITE_GITHUB_TOKEN
if (token) {
  console.log('Token do GitHub configurado:', token.substring(0, 8) + '...')
  githubAPI.defaults.headers.Authorization = `token ${token}`
} else {
  console.warn('Token do GitHub não configurado - usando rate limit público')
}

// Interceptor para log de requisições
githubAPI.interceptors.request.use(
  config => {
    console.log('Fazendo requisição GitHub:', config.method?.toUpperCase(), config.url)
    return config
  },
  error => {
    console.error('Erro na requisição GitHub:', error)
    return Promise.reject(error)
  }
)

// Interceptor para log de respostas
githubAPI.interceptors.response.use(
  response => {
    console.log('Resposta GitHub:', response.status, response.config.url, 'Rate limit restante:', response.headers['x-ratelimit-remaining'])
    return response
  },
  error => {
    console.error('Erro na resposta GitHub:', error.response?.status, error.response?.data)
    if (error.response?.status === 403) {
      console.error('Rate limit excedido ou token inválido')
    }
    return Promise.reject(error)
  }
)

// Tipos para GitHub API
export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  clone_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  topics: string[]
  visibility: 'public' | 'private'
}

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export interface GitHubStats {
  totalRepos: number
  totalStars: number
  totalForks: number
  languages: { [key: string]: number }
  mostStarredRepo: GitHubRepository | null
  recentActivity: {
    lastCommit: string
    activeRepos: number
  }
}

// Serviços da API do GitHub
export const githubService = {
  // Buscar informações do usuário
  getUser: async (username: string): Promise<GitHubUser> => {
    const response = await githubAPI.get(`/users/${username}`)
    return response.data
  },

  // Buscar repositórios do usuário
  getUserRepos: async (username: string, options?: {
    type?: 'all' | 'public' | 'private'
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
  }): Promise<GitHubRepository[]> => {
    const params = {
      type: options?.type || 'public',
      sort: options?.sort || 'updated',
      direction: options?.direction || 'desc',
      per_page: options?.per_page || 100,
    }
    
    const response = await githubAPI.get(`/users/${username}/repos`, { params })
    return response.data
  },

  // Buscar repositório específico
  getRepo: async (owner: string, repo: string): Promise<GitHubRepository> => {
    const response = await githubAPI.get(`/repos/${owner}/${repo}`)
    return response.data
  },

  // Buscar linguagens de um repositório
  getRepoLanguages: async (owner: string, repo: string): Promise<{ [key: string]: number }> => {
    const response = await githubAPI.get(`/repos/${owner}/${repo}/languages`)
    return response.data
  },

  // Buscar commits recentes
  getRepoCommits: async (owner: string, repo: string, limit = 10) => {
    const params = { per_page: limit }
    const response = await githubAPI.get(`/repos/${owner}/${repo}/commits`, { params })
    return response.data
  },

  // Gerar estatísticas do usuário
  getUserStats: async (username: string): Promise<GitHubStats> => {
    try {
      const repos = await githubService.getUserRepos(username, { per_page: 100 })
      
      const stats: GitHubStats = {
        totalRepos: repos.length,
        totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
        totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
        languages: {},
        mostStarredRepo: repos.reduce((prev, current) => 
          (prev.stargazers_count > current.stargazers_count) ? prev : current, repos[0]
        ),
        recentActivity: {
          lastCommit: repos[0]?.pushed_at || '',
          activeRepos: repos.filter(repo => {
            const lastUpdate = new Date(repo.updated_at)
            const threeMonthsAgo = new Date()
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
            return lastUpdate > threeMonthsAgo
          }).length
        }
      }

      // Contar linguagens
      repos.forEach(repo => {
        if (repo.language) {
          stats.languages[repo.language] = (stats.languages[repo.language] || 0) + 1
        }
      })

      return stats
    } catch (error) {
      console.error('Error fetching GitHub stats:', error)
      throw error
    }
  },

  // Buscar repositórios por linguagem
  getReposByLanguage: async (username: string, language: string): Promise<GitHubRepository[]> => {
    const repos = await githubService.getUserRepos(username)
    return repos.filter(repo => 
      repo.language?.toLowerCase() === language.toLowerCase()
    )
  },

  // Buscar trending repositories
  getTrendingRepos: async (language?: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    const date = new Date()
    if (timeframe === 'daily') date.setDate(date.getDate() - 1)
    if (timeframe === 'weekly') date.setDate(date.getDate() - 7)
    if (timeframe === 'monthly') date.setMonth(date.getMonth() - 1)
    
    const query = `created:>${date.toISOString().split('T')[0]}${language ? ` language:${language}` : ''}`
    const params = { q: query, sort: 'stars', order: 'desc', per_page: 100 }
    
    const response = await githubAPI.get('/search/repositories', { params })
    return response.data.items
  }
}

export default githubService 