import { Home, FolderOpen, Users, Github, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
  onClose?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Projetos', href: '/projetos', icon: FolderOpen },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'GitHub', href: '/github', icon: Github },
]

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <div className="flex flex-col w-64 h-full bg-gray-900">
      <div className="h-16 px-6 bg-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GP</span>
          </div>
          <span className="ml-3 text-white font-medium">Projetos</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-2 hover:bg-gray-700 rounded-lg"
        >
          <X className="h-5 w-5 text-gray-300" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 