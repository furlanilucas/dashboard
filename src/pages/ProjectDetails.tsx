import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Plus,
  Edit3,
  Trash2,
  Clock,
  Download,
  GitBranch,
  Copy,
  Terminal
} from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useGitHubRepo } from '../hooks/useGitHub'
import { useChecklist } from '../hooks/useChecklist'
import StatusBadge from '../components/project/StatusBadge'
import GitHubRepoInfo from '../components/project/GitHubRepoInfo'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, loading } = useProjects()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [showAddTask, setShowAddTask] = useState(false)
  const [copiedCommand, setCopiedCommand] = useState('')

  const project = projects.find(p => p.id.toString() === id)
  
  // Hook para gerenciar checklist
  const {
    checklist,
    loading: checklistLoading,
    addTask,
    toggleTask,
    deleteTask,
    getCompletedCount,
    getTotalCount,
    getProgressPercentage
  } = useChecklist(
    project?.id || '',
    project?.name,
    project?.status,
    project?.progress
  )
  
  // Extrair informações do repositório GitHub se disponível
  const githubInfo = project?.githubRepo ? 
    project.githubRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/) : null
  useGitHubRepo(
    githubInfo?.[1] || '', 
    githubInfo?.[2] || ''
  )

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    addTask(newTaskTitle, newTaskDescription || undefined, newTaskPriority)
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskPriority('medium')
    setShowAddTask(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleCopyCommand = async (command: string, type: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopiedCommand(type)
      setTimeout(() => setCopiedCommand(''), 2000)
    } catch (err) {
      console.error('Erro ao copiar comando:', err)
    }
  }

  const handleDownloadZip = () => {
    if (project?.githubRepo) {
      const zipUrl = `${project.githubRepo}/archive/refs/heads/main.zip`
      window.open(zipUrl, '_blank')
    }
  }

  const getCloneCommands = () => {
    if (!project?.githubRepo) return null
    
    return {
      https: `git clone ${project.githubRepo}.git`,
      ssh: `git clone git@github.com:${githubInfo?.[1]}/${githubInfo?.[2]}.git`
    }
  }

  if (loading || checklistLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do projeto...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Projeto não encontrado</h2>
          <p className="text-gray-600 mb-4">O projeto solicitado não existe ou foi removido.</p>
          <button
            onClick={() => navigate('/projetos')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar aos Projetos
          </button>
        </div>
      </div>
    )
  }

  const cloneCommands = getCloneCommands()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} />
          {project.githubRepo && (
            <>
              <button
                onClick={handleDownloadZip}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Baixar ZIP
              </button>
              <a
                href={project.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                GitHub
              </a>
            </>
          )}
        </div>
      </div>

      {/* Informações Principais */}
      <div className="bg-white rounded-lg border p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.name}</h1>
          <p className="text-lg text-gray-600 leading-relaxed">{project.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium text-gray-900">{project.client}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Data de Início</p>
              <p className="font-medium text-gray-900">
                {new Date(project.startDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Última Atualização</p>
              <p className="font-medium text-gray-900">
                {formatDistanceToNow(new Date(project.updatedAt), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Progresso Geral */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Progresso Geral</h3>
            <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Download e Clone do Código */}
      {project.githubRepo && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Baixar ou Clonar Projeto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Download ZIP */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Download Direto</h4>
              <p className="text-sm text-gray-600">
                Baixe o código em formato ZIP sem necessidade do Git
              </p>
              <button
                onClick={handleDownloadZip}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Baixar ZIP
              </button>
            </div>

            {/* Clone Commands */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Clonar Repositório</h4>
              <p className="text-sm text-gray-600">
                Clone o repositório para trabalhar localmente
              </p>
              
              {cloneCommands && (
                <div className="space-y-2">
                  <div className="relative">
                    <div className="flex items-center justify-between bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono">
                      <span className="truncate pr-2">{cloneCommands.https}</span>
                      <button
                        onClick={() => handleCopyCommand(cloneCommands.https, 'https')}
                        className="flex-shrink-0 p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Copiar comando"
                      >
                        {copiedCommand === 'https' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono">
                      <span className="truncate pr-2">{cloneCommands.ssh}</span>
                      <button
                        onClick={() => handleCopyCommand(cloneCommands.ssh, 'ssh')}
                        className="flex-shrink-0 p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Copiar comando"
                      >
                        {copiedCommand === 'ssh' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instruções */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Como usar
            </h5>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>ZIP:</strong> Baixe e extraia o arquivo em qualquer pasta</p>
              <p><strong>Clone:</strong> Execute o comando no terminal na pasta desejada</p>
              <p><strong>SSH:</strong> Requer configuração de chave SSH no GitHub</p>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Repository Info */}
      {project.githubRepo && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Repositório</h3>
          <GitHubRepoInfo repoUrl={project.githubRepo} />
        </div>
      )}

      {/* Checklist/Tarefas */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lista de Tarefas</h3>
              <p className="text-sm text-gray-600">
                {getCompletedCount()} de {getTotalCount()} tarefas concluídas ({getProgressPercentage()}%)
              </p>
            </div>
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </button>
          </div>

          {/* Barra de Progresso das Tarefas */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Lista de Tarefas */}
        <div className="divide-y">
          {checklist.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-1"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        task.completed 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.completed 
                            ? 'text-gray-400' 
                            : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          getPriorityColor(task.priority)
                        }`}>
                          {task.priority === 'high' ? 'Alta' : 
                           task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Criada {formatDistanceToNow(new Date(task.createdAt), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                        {task.completedAt && (
                          <span className="text-xs text-green-600">
                            Concluída {formatDistanceToNow(new Date(task.completedAt), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulário para Nova Tarefa */}
        {showAddTask && (
          <div className="p-6 border-t bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o título da tarefa..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva a tarefa em detalhes..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Tarefa
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetails 