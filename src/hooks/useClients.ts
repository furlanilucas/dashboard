import { useState, useEffect, useCallback } from 'react'
import { Client, ClientFormData } from '../types/Client'
import { persistenceService } from '../services/persistenceService'

export interface ClientStats {
  total: number
  withProjects: number
  withoutProjects: number
  companies: number
  averageProjectsPerClient: number
}

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  
  // CRUD Operations
  createClient: (data: ClientFormData) => Promise<Client>
  updateClient: (id: number, data: Partial<ClientFormData>) => Promise<Client>
  deleteClient: (id: number) => Promise<void>
  
  // Getters
  getClientById: (id: number) => Client | undefined
  getClientsByCompany: (company: string) => Client[]
  getClientsWithProjects: () => Client[]
  getClientsWithoutProjects: () => Client[]
  getStats: () => ClientStats
  getProjectCountForClient: (clientId: number) => number
  
  // Refresh
  refreshClients: () => Promise<void>
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [clientsData, projectsData] = await Promise.all([
        persistenceService.read<Client>('clients'),
        persistenceService.read('projects')
      ])
      
      setClients(clientsData)
      setProjects(projectsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes'
      setError(errorMessage)
      console.error('Erro ao carregar clientes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createClient = useCallback(async (data: ClientFormData): Promise<Client> => {
    try {
      setLoading(true)
      setError(null)

      // Validar dados obrigatórios
      if (!data.name.trim()) {
        throw new Error('Nome é obrigatório')
      }
      if (!data.email.trim()) {
        throw new Error('Email é obrigatório')
      }

      // Verificar se email já existe
      const existingClient = clients.find(c => c.email.toLowerCase() === data.email.toLowerCase())
      if (existingClient) {
        throw new Error('Email já cadastrado para outro cliente')
      }

      const newClient = await persistenceService.create<Client>('clients', {
        ...data,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || '',
        company: data.company?.trim() || '',
        address: data.address?.trim() || '',
      })

      setClients(prev => [...prev, newClient])
      return newClient
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cliente'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [clients])

  const updateClient = useCallback(async (id: number, data: Partial<ClientFormData>): Promise<Client> => {
    try {
      setLoading(true)
      setError(null)

      const existingClient = clients.find(c => c.id === id)
      if (!existingClient) {
        throw new Error('Cliente não encontrado')
      }

      // Validar email único se foi alterado
      if (data.email && data.email !== existingClient.email) {
        const emailExists = clients.find(c => c.id !== id && c.email.toLowerCase() === data.email.toLowerCase())
        if (emailExists) {
          throw new Error('Email já cadastrado para outro cliente')
        }
      }

      const updateData = {
        ...data,
        name: data.name?.trim(),
        email: data.email?.trim().toLowerCase(),
        phone: data.phone?.trim(),
        company: data.company?.trim(),
        address: data.address?.trim(),
      }

      const updatedClient = await persistenceService.update<Client>('clients', id.toString(), updateData)
      
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c))
      return updatedClient
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [clients])

  const deleteClient = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const client = clients.find(c => c.id === id)
      if (!client) {
        throw new Error('Cliente não encontrado')
      }

      // Verificar se o cliente tem projetos vinculados
      const hasProjects = projects.some((project: any) => project.clientId === id)
      
      if (hasProjects) {
        throw new Error('Não é possível excluir cliente com projetos vinculados')
      }

      await persistenceService.delete('clients', id.toString())
      
      setClients(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir cliente'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [clients, projects])

  // Getters
  const getClientById = useCallback((id: number) => {
    return clients.find(client => client.id === id)
  }, [clients])

  const getClientsByCompany = useCallback((company: string) => {
    return clients.filter(client => 
      client.company?.toLowerCase().includes(company.toLowerCase())
    )
  }, [clients])

  const getProjectCountForClient = useCallback((clientId: number) => {
    return projects.filter((project: any) => project.clientId === clientId).length
  }, [projects])

  const getClientsWithProjects = useCallback(() => {
    return clients.filter(client => {
      const projectCount = getProjectCountForClient(client.id)
      return projectCount > 0
    })
  }, [clients, getProjectCountForClient])

  const getClientsWithoutProjects = useCallback(() => {
    return clients.filter(client => {
      const projectCount = getProjectCountForClient(client.id)
      return projectCount === 0
    })
  }, [clients, getProjectCountForClient])

  const getStats = useCallback((): ClientStats => {
    const total = clients.length
    const companies = new Set(clients.map(c => c.company).filter(Boolean)).size
    
    const withProjects = getClientsWithProjects().length
    const withoutProjects = getClientsWithoutProjects().length
    
    const totalProjects = projects.length
    const averageProjectsPerClient = total > 0 ? Math.round((totalProjects / total) * 100) / 100 : 0

    return {
      total,
      withProjects,
      withoutProjects,
      companies,
      averageProjectsPerClient
    }
  }, [clients, projects, getClientsWithProjects, getClientsWithoutProjects])

  // Carregar clientes na inicialização
  useEffect(() => {
    loadClients()
  }, [loadClients])

  return {
    clients,
    loading,
    error,
    
    // CRUD
    createClient,
    updateClient,
    deleteClient,
    
    // Getters
    getClientById,
    getClientsByCompany,
    getClientsWithProjects,
    getClientsWithoutProjects,
    getStats,
    getProjectCountForClient,
    
    // Refresh
    refreshClients: loadClients
  }
} 