import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import ProjectDetails from './pages/ProjectDetails'
import GitHub from './pages/GitHub'
import Clients from './pages/Clients'
import ClientDetails from './pages/ClientDetails'
import ProjectList from './features/projects/ProjectList'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar - Responsiva */}
        <div className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projetos" element={<ProjectList />} />
              <Route path="/projetos/:id" element={<ProjectDetails />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/clientes/:id" element={<ClientDetails />} />
              <Route path="/github" element={<GitHub />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
