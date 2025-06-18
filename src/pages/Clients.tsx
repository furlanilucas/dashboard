import { useState, useMemo } from 'react'
import { Users, Plus, Search } from 'lucide-react'
import { useClients } from '../hooks/useClients'
import ClientCard from '../components/client/ClientCard'
import ClientModal from '../components/client/ClientModal'
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal'
import { Client, ClientFormData } from '../types/Client'

export default function Clients() {
  const { 
    clients, 
    loading, 
    createClient, 
    updateClient, 
    deleteClient
  } = useClients()

  const [searchTerm, setSearchTerm] = useState('')
  const [showClientModal, setShowClientModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const filteredClients = useMemo(() => {
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [clients, searchTerm])

  const handleCreateClient = () => {
    setEditingClient(null)
    setShowClientModal(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setShowClientModal(true)
  }

  const handleDeleteClient = (client: Client) => {
    setDeletingClient(client)
    setShowDeleteModal(true)
  }

  const handleSaveClient = async (data: ClientFormData) => {
    try {
      setActionLoading(true)
      
      if (editingClient) {
        await updateClient(editingClient.id, data)
      } else {
        await createClient(data)
      }
      
      setShowClientModal(false)
      setEditingClient(null)
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingClient) return

    try {
      setActionLoading(true)
      await deleteClient(deletingClient.id)
      setShowDeleteModal(false)
      setDeletingClient(null)
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Clientes
          </h1>
          <p className="text-gray-600">Gerencie seus clientes</p>
        </div>
        <button
          onClick={handleCreateClient}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum cliente encontrado
          </div>
        )}
      </div>

      {/* Modais */}
      {showClientModal && (
        <ClientModal
          client={editingClient}
          isOpen={showClientModal}
          onClose={() => setShowClientModal(false)}
          onSave={handleSaveClient}
          loading={actionLoading}
        />
      )}

      {showDeleteModal && deletingClient && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          loading={actionLoading}
          title="Excluir Cliente"
          message={`Tem certeza que deseja excluir o cliente "${deletingClient.name}"?`}
        />
      )}
    </div>
  )
}
