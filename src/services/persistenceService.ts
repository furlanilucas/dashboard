interface PersistenceConfig {
  useAPI: boolean
  enableOfflineSync: boolean
  autoBackup: boolean
  backupInterval: number // em minutos
}

interface SyncQueue {
  id: string
  operation: 'create' | 'update' | 'delete'
  entity: 'project' | 'client' | 'checklist' | 'demand'
  data: any
  timestamp: number
  retries: number
}

interface BackupData {
  timestamp: string
  projects: any[]
  clients: any[]
  checklists: { [key: string]: any[] }
  version: string
}

class PersistenceService {
  private config: PersistenceConfig = {
    useAPI: false, // Começar com localStorage, migrar gradualmente
    enableOfflineSync: true,
    autoBackup: true,
    backupInterval: 30 // 30 minutos
  }

  private syncQueue: SyncQueue[] = []
  private isOnline = navigator.onLine
  private backupTimer?: NodeJS.Timeout

  constructor() {
    this.initializeService()
    this.setupEventListeners()
    this.loadSyncQueue()
    if (this.config.autoBackup) {
      this.startAutoBackup()
    }
  }

  private initializeService() {
    // Verificar se API está disponível
    this.detectAPIAvailability()
    
    // Processar queue de sincronização se online
    if (this.isOnline) {
      this.processSyncQueue()
    }
  }

  private setupEventListeners() {
    // Monitorar status da conexão
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('🌐 Conexão restaurada - iniciando sincronização')
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📴 Modo offline ativado')
    })

    // Backup antes de fechar a página
    window.addEventListener('beforeunload', () => {
      this.createBackup('manual')
    })
  }

  private async detectAPIAvailability() {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000
      } as any)
      
      if (response.ok) {
        this.config.useAPI = true
        console.log('✅ API backend disponível')
        await this.migrateFromLocalStorage()
      }
    } catch (error) {
      console.log('⚠️ API não disponível, usando localStorage')
      this.config.useAPI = false
    }
  }

  // CRUD OPERATIONS
  async create<T>(entity: string, data: T): Promise<T> {
    const timestamp = Date.now()
    const id = this.generateId()
    const item = { ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }

    try {
      if (this.config.useAPI && this.isOnline) {
        // Tentar salvar na API
        const response = await this.apiCreate(entity, item)
        this.saveToLocalStorage(entity, response)
        return response
      }
    } catch (error) {
      console.warn('Falha na API, salvando localmente:', error)
    }

    // Fallback para localStorage
    this.saveToLocalStorage(entity, item)
    
    // Adicionar à queue de sincronização
    if (this.config.enableOfflineSync) {
      this.addToSyncQueue({
        id: this.generateSyncId(),
        operation: 'create',
        entity: entity as any,
        data: item,
        timestamp,
        retries: 0
      })
    }

    return item as T
  }

  async read<T>(entity: string, id?: string): Promise<T[]> {
    try {
      if (this.config.useAPI && this.isOnline) {
        const apiData = await this.apiRead<T>(entity, id)
        // Mesclar com dados locais para casos de conflito
        const localData = this.getFromLocalStorage<T>(entity)
        return this.mergeData(apiData, localData)
      }
    } catch (error) {
      console.warn('Falha na API, lendo do localStorage:', error)
    }

    return this.getFromLocalStorage<T>(entity)
  }

  async update<T>(entity: string, id: string, data: Partial<T>): Promise<T> {
    const timestamp = Date.now()
    const updatedItem = { ...data, id, updatedAt: new Date().toISOString() }

    try {
      if (this.config.useAPI && this.isOnline) {
        const response = await this.apiUpdate(entity, id, updatedItem)
        this.updateInLocalStorage(entity, id, response)
        return response
      }
    } catch (error) {
      console.warn('Falha na API, atualizando localmente:', error)
    }

    // Fallback para localStorage
    this.updateInLocalStorage(entity, id, updatedItem)
    
    // Adicionar à queue de sincronização
    if (this.config.enableOfflineSync) {
      this.addToSyncQueue({
        id: this.generateSyncId(),
        operation: 'update',
        entity: entity as any,
        data: { id, ...updatedItem },
        timestamp,
        retries: 0
      })
    }

    return updatedItem as T
  }

  async delete(entity: string, id: string): Promise<void> {
    const timestamp = Date.now()

    try {
      if (this.config.useAPI && this.isOnline) {
        await this.apiDelete(entity, id)
        this.removeFromLocalStorage(entity, id)
        return
      }
    } catch (error) {
      console.warn('Falha na API, removendo localmente:', error)
    }

    // Fallback para localStorage
    this.removeFromLocalStorage(entity, id)
    
    // Adicionar à queue de sincronização
    if (this.config.enableOfflineSync) {
      this.addToSyncQueue({
        id: this.generateSyncId(),
        operation: 'delete',
        entity: entity as any,
        data: { id },
        timestamp,
        retries: 0
      })
    }
  }

  // LOCAL STORAGE OPERATIONS
  private saveToLocalStorage<T>(entity: string, item: T) {
    try {
      const key = `dashboard_${entity}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const updated = [...existing, item]
      localStorage.setItem(key, JSON.stringify(updated))
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error)
    }
  }

  private getFromLocalStorage<T>(entity: string): T[] {
    try {
      const key = `dashboard_${entity}`
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error)
      return []
    }
  }

  private updateInLocalStorage<T>(entity: string, id: string, data: Partial<T>) {
    try {
      const key = `dashboard_${entity}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const updated = existing.map((item: any) => 
        item.id === id ? { ...item, ...data } : item
      )
      localStorage.setItem(key, JSON.stringify(updated))
    } catch (error) {
      console.error('Erro ao atualizar no localStorage:', error)
    }
  }

  private removeFromLocalStorage(entity: string, id: string) {
    try {
      const key = `dashboard_${entity}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const updated = existing.filter((item: any) => item.id !== id)
      localStorage.setItem(key, JSON.stringify(updated))
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error)
    }
  }

  // API OPERATIONS
  private async apiCreate<T>(entity: string, data: T): Promise<T> {
    const response = await fetch(`/api/${entity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return await response.json()
  }

  private async apiRead<T>(entity: string, id?: string): Promise<T[]> {
    const url = id ? `/api/${entity}/${id}` : `/api/${entity}`
    const response = await fetch(url)
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    const data = await response.json()
    return Array.isArray(data) ? data : [data]
  }

  private async apiUpdate<T>(entity: string, id: string, data: Partial<T>): Promise<T> {
    const response = await fetch(`/api/${entity}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return await response.json()
  }

  private async apiDelete(entity: string, id: string): Promise<void> {
    const response = await fetch(`/api/${entity}/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
  }

  // SYNC QUEUE MANAGEMENT
  private addToSyncQueue(item: SyncQueue) {
    this.syncQueue.push(item)
    this.saveSyncQueue()
  }

  private async processSyncQueue() {
    if (!this.isOnline || !this.config.useAPI) return

    console.log(`🔄 Processando ${this.syncQueue.length} itens da queue de sincronização`)

    for (const item of [...this.syncQueue]) {
      try {
        await this.syncItem(item)
        this.removeSyncItem(item.id)
      } catch (error) {
        console.error('Erro ao sincronizar item:', error)
        item.retries++
        
        // Remover da queue após 3 tentativas
        if (item.retries >= 3) {
          console.error('Item removido da queue após 3 tentativas:', item)
          this.removeSyncItem(item.id)
        }
      }
    }

    this.saveSyncQueue()
  }

  private async syncItem(item: SyncQueue) {
    const { operation, entity, data } = item

    switch (operation) {
      case 'create':
        await this.apiCreate(entity, data)
        break
      case 'update':
        await this.apiUpdate(entity, data.id, data)
        break
      case 'delete':
        await this.apiDelete(entity, data.id)
        break
    }
  }

  private removeSyncItem(id: string) {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id)
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem('dashboard_sync_queue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Erro ao salvar queue de sincronização:', error)
    }
  }

  private loadSyncQueue() {
    try {
      const saved = localStorage.getItem('dashboard_sync_queue')
      this.syncQueue = saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Erro ao carregar queue de sincronização:', error)
      this.syncQueue = []
    }
  }

  // BACKUP SYSTEM
  private startAutoBackup() {
    this.backupTimer = setInterval(() => {
      this.createBackup('auto')
    }, this.config.backupInterval * 60 * 1000)
  }

  async createBackup(type: 'auto' | 'manual' = 'manual'): Promise<string> {
    try {
      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        projects: this.getFromLocalStorage('projects'),
        clients: this.getFromLocalStorage('clients'),
        checklists: this.getAllChecklists(),
        version: '1.0.0'
      }

      const backupKey = `dashboard_backup_${type}_${Date.now()}`
      localStorage.setItem(backupKey, JSON.stringify(backupData))

      // Manter apenas os 5 backups mais recentes
      this.cleanOldBackups(type)

      console.log(`📦 Backup ${type} criado: ${backupKey}`)
      return backupKey
    } catch (error) {
      console.error('Erro ao criar backup:', error)
      throw error
    }
  }

  async restoreBackup(backupKey: string): Promise<void> {
    try {
      const backupData = localStorage.getItem(backupKey)
      if (!backupData) throw new Error('Backup não encontrado')

      const data: BackupData = JSON.parse(backupData)
      
      // Restaurar dados
      localStorage.setItem('dashboard_projects', JSON.stringify(data.projects))
      localStorage.setItem('dashboard_clients', JSON.stringify(data.clients))
      
      // Restaurar checklists
      Object.entries(data.checklists).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value))
      })

      console.log('✅ Backup restaurado com sucesso')
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
      throw error
    }
  }

  getAvailableBackups(): { key: string, date: string, type: string }[] {
    const backups: { key: string, date: string, type: string }[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('dashboard_backup_')) {
        const type = key.includes('_auto_') ? 'auto' : 'manual'
        const timestamp = key.split('_').pop()
        const date = timestamp ? new Date(parseInt(timestamp)).toLocaleString('pt-BR') : 'Desconhecido'
        
        backups.push({ key, date, type })
      }
    }

    return backups.sort((a, b) => b.key.localeCompare(a.key))
  }

  private cleanOldBackups(type: 'auto' | 'manual') {
    const backups = this.getAvailableBackups()
      .filter(b => b.type === type)
      .sort((a, b) => b.key.localeCompare(a.key))

    // Manter apenas os 5 mais recentes
    backups.slice(5).forEach(backup => {
      localStorage.removeItem(backup.key)
    })
  }

  private getAllChecklists(): { [key: string]: any[] } {
    const checklists: { [key: string]: any[] } = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('checklist-')) {
        try {
          checklists[key] = JSON.parse(localStorage.getItem(key) || '[]')
        } catch (error) {
          console.error(`Erro ao ler checklist ${key}:`, error)
        }
      }
    }

    return checklists
  }

  // MIGRATION
  private async migrateFromLocalStorage() {
    console.log('🚀 Iniciando migração do localStorage para API...')
    
    try {
      // Migrar projetos
      const projects = this.getFromLocalStorage('projects')
      for (const project of projects) {
        await this.apiCreate('projects', project)
      }

      // Migrar clientes
      const clients = this.getFromLocalStorage('clients')
      for (const client of clients) {
        await this.apiCreate('clients', client)
      }

      console.log('✅ Migração concluída com sucesso')
    } catch (error) {
      console.error('❌ Erro na migração:', error)
      // Continuar usando localStorage em caso de erro
      this.config.useAPI = false
    }
  }

  // UTILITY METHODS
  private generateId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private mergeData<T>(apiData: T[], localData: T[]): T[] {
    // Implementar lógica de merge inteligente
    // Por enquanto, priorizar dados da API
    return [...apiData, ...localData.filter((local: any) => 
      !apiData.find((api: any) => api.id === local.id)
    )]
  }

  // PUBLIC STATUS METHODS
  getStatus() {
    return {
      isOnline: this.isOnline,
      useAPI: this.config.useAPI,
      syncQueueSize: this.syncQueue.length,
      backupsCount: this.getAvailableBackups().length
    }
  }

  // CLEANUP
  destroy() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer)
    }
    
    window.removeEventListener('online', () => {})
    window.removeEventListener('offline', () => {})
    window.removeEventListener('beforeunload', () => {})
  }
}

// Singleton instance
export const persistenceService = new PersistenceService()
export default persistenceService 