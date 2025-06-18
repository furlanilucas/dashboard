# 📊 Dashboard de Projetos

Um dashboard moderno e responsivo para gerenciamento de projetos com integração completa ao GitHub. Desenvolvido por **Lucas Furlani**, esta aplicação oferece uma interface intuitiva para acompanhar o progresso de projetos, gerenciar clientes e monitorar estatísticas do GitHub.

![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.2.0-purple?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Funcionalidades Principais

### 🏠 Dashboard
- **Visão Geral Completa**: Estatísticas em tempo real dos projetos
- **Métricas do GitHub**: Total de stars, forks e repositórios ativos
- **Status dos Projetos**: Acompanhamento de projetos em desenvolvimento, concluídos e em planejamento
- **Repositórios Recentes**: Lista dos repositórios atualizados recentemente

### 📁 Gerenciamento de Projetos
- **Lista de Projetos**: Visualização completa de todos os projetos
- **Detalhes do Projeto**: Informações detalhadas com progresso, status e descrição
- **Filtros e Busca**: Localização rápida de projetos específicos
- **Status Tracking**: Controle de estados (Planejamento, Desenvolvimento, Teste, Concluído)

### 👥 Gestão de Clientes
- **Cadastro de Clientes**: Gerenciamento completo de informações de clientes
- **Perfil Detalhado**: Histórico de projetos por cliente
- **Relacionamento Cliente-Projeto**: Vinculação entre clientes e seus projetos

### 🔗 Integração GitHub
- **API do GitHub**: Sincronização automática com repositórios
- **Estatísticas Avançadas**: Métricas detalhadas dos repositórios
- **Monitoramento de Atividade**: Acompanhamento de commits e atualizações

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18.2.0** - Biblioteca JavaScript para interfaces de usuário
- **TypeScript 5.2.2** - Superset do JavaScript com tipagem estática
- **Vite 5.2.0** - Build tool moderna e rápida
- **React Router DOM 6.30.1** - Roteamento para aplicações React

### Estilização
- **Tailwind CSS 3.4.3** - Framework CSS utility-first
- **Lucide React 0.368.0** - Biblioteca de ícones modernas
- **PostCSS 8.4.38** - Ferramenta para transformar CSS

### Integração e APIs
- **Axios 1.10.0** - Cliente HTTP para requisições
- **GitHub API** - Integração com dados do GitHub

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Componentes de layout (Header, Sidebar)
│   ├── common/         # Componentes comuns reutilizáveis
│   ├── client/         # Componentes específicos de clientes
│   ├── project/        # Componentes específicos de projetos
│   └── modals/         # Componentes de modais
├── pages/              # Páginas principais da aplicação
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Clients.tsx     # Página de clientes
│   ├── ClientDetails.tsx # Detalhes do cliente
│   ├── ProjectDetails.tsx # Detalhes do projeto
│   └── GitHub.tsx      # Página de integração GitHub
├── features/           # Funcionalidades específicas
│   ├── projects/       # Funcionalidades de projetos
│   │   └── ProjectList.tsx # Lista de projetos
│   └── github/         # Funcionalidades do GitHub (em desenvolvimento)
├── hooks/              # Hooks personalizados
│   ├── useProjects.ts  # Hook para gerenciar projetos
│   ├── useClients.ts   # Hook para gerenciar clientes
│   ├── useGitHub.ts    # Hook para integração GitHub
│   ├── useEnhancedProjects.ts # Hook com funcionalidades avançadas
│   ├── usePagination.ts # Hook para paginação
│   └── useChecklist.ts # Hook para checklists
├── services/           # Serviços de API
│   ├── api.ts          # Configuração base da API
│   ├── githubAPI.ts    # Serviços do GitHub
│   └── persistenceService.ts # Persistência de dados
├── types/              # Definições de tipos TypeScript
│   ├── Project.ts      # Tipos relacionados a projetos
│   ├── Client.ts       # Tipos relacionados a clientes
│   └── index.ts        # Exportações dos tipos
├── utils/              # Utilitários e helpers
│   ├── styles.ts       # Utilitários de estilização
│   ├── validation.ts   # Funções de validação
│   ├── avatarUtils.ts  # Utilitários para avatares
│   └── formatDate.ts   # Formatação de datas
├── constants/          # Constantes da aplicação
│   ├── projectStatus.ts # Estados dos projetos
│   └── index.ts        # Exportações das constantes
├── routes/             # Configuração de rotas (em desenvolvimento)
├── App.tsx             # Componente principal da aplicação
├── main.tsx            # Ponto de entrada da aplicação
└── index.css           # Estilos globais
```

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn
- Token do GitHub (opcional, para integração completa)

### 1. Clone o repositório
```bash
git clone [url-do-repositorio]
cd dashboard-frontend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_GITHUB_TOKEN=seu_token_github_aqui
VITE_API_BASE_URL=http://localhost:3000/api
```

**Para obter um token do GitHub:**
1. Acesse GitHub → Settings → Developer settings → Personal access tokens
2. Gere um novo token com permissões de leitura de repositórios
3. Copie o token para o arquivo `.env`

### 4. Execute o projeto
```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🌐 Rotas da Aplicação

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard principal com estatísticas |
| `/projetos` | Lista de todos os projetos |
| `/projetos/:id` | Detalhes de um projeto específico |
| `/clientes` | Gerenciamento de clientes |
| `/clientes/:id` | Perfil detalhado do cliente |
| `/github` | Integração e estatísticas do GitHub |

## 🎨 Interface do Usuário

### Design System
- **Cores**: Paleta moderna com tons de azul, verde e cinza
- **Tipografia**: Fontes system com hierarquia clara
- **Iconografia**: Ícones Lucide para consistência visual
- **Responsividade**: Adaptação completa para desktop, tablet e mobile

### Componentes
- **Cards de Estatísticas**: Métricas visuais com ícones e cores
- **Tabelas Interativas**: Listagem com filtros e ordenação
- **Formulários**: Validação e feedback visual
- **Loading States**: Indicadores de carregamento

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Produção
npm run build        # Gera build otimizado
npm run preview      # Preview do build

# Linting
npm run lint         # Verifica qualidade do código
```

## 📈 Funcionalidades Avançadas

### Persistência de Dados
- **Local Storage**: Armazenamento local de configurações
- **Session Storage**: Dados temporários da sessão
- **API Integration**: Sincronização com APIs externas

### Performance
- **Code Splitting**: Carregamento otimizado de componentes
- **Lazy Loading**: Carregamento sob demanda
- **Caching**: Cache inteligente de requisições

### Acessibilidade
- **ARIA Labels**: Suporte a leitores de tela
- **Navegação por Teclado**: Navegação completa via teclado
- **Contraste**: Cores com contraste adequado

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Lucas Furlani**
- GitHub: [@lucasfurlani](https://github.com/lucasfurlani)
- Email: [seu-email@exemplo.com]

---

<div align="center">
  <p>Feito com ❤️ por Lucas Furlani</p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
</div>
