import React from 'react'
import { Building, Edit3, Trash2, FolderOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Client } from '../../types/Client'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Avatar from '../common/Avatar'
import ContactInfo from '../common/ContactInfo'

interface ClientCardProps {
  client: Client
  onEdit?: (client: Client) => void
  onDelete?: (client: Client) => void
  onViewProjects?: (client: Client) => void
  projectsCount?: number
}

export default function ClientCard({ 
  client, 
  onEdit, 
  onDelete, 
  onViewProjects,
  projectsCount = 0 
}: ClientCardProps) {
  const navigate = useNavigate()
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(client)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(client)
  }

  const handleViewProjects = (e: React.MouseEvent) => {
    e.stopPropagation()
    onViewProjects?.(client)
  }

  // Removido - usando utilitário centralizado

  const handleCardClick = () => {
    navigate(`/clientes/${client.id}`)
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        {/* Header com Avatar e Ações */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={client.name}
              src={client.avatar}
              size="md"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {client.name}
              </h3>
              {client.company && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {client.company}
                </p>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onViewProjects && (
              <button
                onClick={handleViewProjects}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Ver projetos do cliente"
              >
                <FolderOpen className="h-4 w-4" />
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Editar cliente"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir cliente"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Informações de Contato */}
        <ContactInfo
          email={client.email}
          phone={client.phone}
          address={client.address}
          layout="vertical"
          className="mb-4"
        />

        {/* Estatísticas */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FolderOpen className="h-4 w-4" />
            <span>
              {projectsCount} projeto{projectsCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="text-xs text-gray-400">
            Cadastrado {formatDistanceToNow(new Date(client.createdAt), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>
        </div>
      </div>

      {/* Indicador de Status */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            projectsCount > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              projectsCount > 0 ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            {projectsCount > 0 ? 'Ativo' : 'Sem projetos'}
          </div>
          
          {client.updatedAt !== client.createdAt && (
            <span className="text-xs text-gray-400">
              Atualizado {formatDistanceToNow(new Date(client.updatedAt), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 