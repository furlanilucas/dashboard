import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building, Calendar, BarChart3, Edit3, Trash2, Plus, ExternalLink } from 'lucide-react'
import { useClients } from '../hooks/useClients'
import { useProjects } from '../hooks/useProjects'
import { Client } from '../types/Client'
import { Project } from '../types/Project'
import ClientModal from '../components/client/ClientModal'
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal'
import ProjectCard from '../components/project/ProjectCard'
import Avatar from '../components/common/Avatar'
import ContactInfo from '../components/common/ContactInfo'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getClientById, updateClient, deleteClient } = useClients()
  const { getProjectsByClient } = useProjects()
  
  const [client, setClient] = useState<Client | null>(null)
  const [clientProjects, setClientProjects] = useState<Project[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      const clientData = getClientById(Number(id))
      if (clientData) {
        setClient(clientData)
        const projects = getProjectsByClient(Number(id))
        setClientProjects(projects)
      } else {
        // Cliente não encontrado, redirecionar
        navigate('/clientes', { replace: true })
      }
    }
  }, [id, getClientById, getProjectsByClient, navigate])

  const handleEditClient = async (data: any) => {
    if (!client) return

    try {
      setLoading(true)
      const updatedClient = await updateClient(client.id, data)
      setClient(updatedClient)
      setShowEditModal(false)
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClient = async () => {
    if (!client) return

    try {
      setLoading(true)
      await deleteClient(client.id)
      navigate('/clientes')
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProjectStats = () => {
    const total = clientProjects.length
    const completed = clientProjects.filter(p => p.status === 'completed').length
    const active = clientProjects.filter(p => p.status === 'development' || p.status === 'testing').length
    const planning = clientProjects.filter(p => p.status === 'planning').length
    const paused = clientProjects.filter(p => p.status === 'paused').length

    return { total, completed, active, planning, paused }
  }

  const getLatestProject = () => {
    if (clientProjects.length === 0) return null
    return clientProjects.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0]
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do cliente...</p>
        </div>
      </div>
    )
  }

  const stats = getProjectStats()
  const latestProject = getLatestProject()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clientes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Detalhes do Cliente</h1>
          <p className="text-gray-600">Informações completas e histórico de projetos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      </div>

      {/* Informações do Cliente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Principal do Cliente */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                                  <Avatar
                    name={client.name}
                    src={client.avatar}
                    size="xl"
                  />
              </div>

              {/* Informações */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
                  {client.company && (
                    <p className="text-lg text-gray-600 flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4" />
                      {client.company}
                    </p>
                  )}
                </div>

                <ContactInfo
                  email={client.email}
                  phone={client.phone}
                  company={client.company}
                  address={client.address}
                  layout="vertical"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />

                <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Cliente desde {formatDistanceToNow(new Date(client.createdAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  {client.updatedAt !== client.createdAt && (
                    <div>
                      Atualizado {formatDistanceToNow(new Date(client.updatedAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas de Projetos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Projetos</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Concluídos</span>
                <span className="font-semibold text-green-600">{stats.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Em Andamento</span>
                <span className="font-semibold text-blue-600">{stats.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Planejamento</span>
                <span className="font-semibold text-yellow-600">{stats.planning}</span>
              </div>
              {stats.paused > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pausados</span>
                  <span className="font-semibold text-gray-600">{stats.paused}</span>
                </div>
              )}
            </div>
            
            {stats.total > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">Taxa de Conclusão</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {Math.round((stats.completed / stats.total) * 100)}% concluído
                </div>
              </div>
            )}
          </div>

          {/* Último Projeto */}
          {latestProject && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Último Projeto</h3>
              <div>
                <h4 className="font-medium text-gray-900">{latestProject.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{latestProject.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    latestProject.status === 'completed' ? 'bg-green-100 text-green-800' :
                    latestProject.status === 'development' ? 'bg-blue-100 text-blue-800' :
                    latestProject.status === 'testing' ? 'bg-purple-100 text-purple-800' :
                    latestProject.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {latestProject.status === 'completed' ? 'Concluído' :
                     latestProject.status === 'development' ? 'Desenvolvimento' :
                     latestProject.status === 'testing' ? 'Teste' :
                     latestProject.status === 'planning' ? 'Planejamento' : 'Pausado'}
                  </span>
                  <button
                    onClick={() => navigate(`/projetos/${latestProject.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Histórico de Projetos */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Histórico de Projetos ({stats.total})
            </h3>
            <button
              onClick={() => navigate('/projetos/novo', { state: { clientId: client.id } })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Novo Projeto
            </button>
          </div>
        </div>

        <div className="p-6">
          {clientProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate(`/projetos/${project.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h4>
              <p className="text-gray-600 mb-4">Este cliente ainda não possui projetos vinculados.</p>
              <button
                onClick={() => navigate('/projetos/novo', { state: { clientId: client.id } })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Criar Primeiro Projeto
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <ClientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditClient}
        client={client}
        loading={loading}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteClient}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${client.name}"?`}
        loading={loading}
      />
    </div>
  )
} 