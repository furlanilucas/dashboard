import { useState, useMemo } from 'react'

export interface PaginationOptions {
  initialPage?: number
  pageSize?: number
  enableUrlSync?: boolean
}

export interface PaginationResult<T> {
  // Dados paginados
  currentPageData: T[]
  
  // Estado da paginação
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  
  // Navegação
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  
  // Estado
  hasNextPage: boolean
  hasPreviousPage: boolean
  isFirstPage: boolean
  isLastPage: boolean
  
  // Configuração
  setPageSize: (size: number) => void
  
  // Utilitários
  getPageNumbers: () => number[]
  getVisiblePageNumbers: (maxVisible?: number) => (number | '...')[]
}

export function usePagination<T>(
  data: T[],
  options: PaginationOptions = {}
): PaginationResult<T> {
  const {
    initialPage = 1,
    pageSize: initialPageSize = 10,
    enableUrlSync = false
  } = options

  const [currentPage, setCurrentPage] = useState(() => {
    if (enableUrlSync) {
      const urlParams = new URLSearchParams(window.location.search)
      const page = parseInt(urlParams.get('page') || '1', 10)
      return page > 0 ? page : initialPage
    }
    return initialPage
  })

  const [pageSize, setPageSize] = useState(() => {
    if (enableUrlSync) {
      const urlParams = new URLSearchParams(window.location.search)
      const size = parseInt(urlParams.get('pageSize') || initialPageSize.toString(), 10)
      return size > 0 ? size : initialPageSize
    }
    return initialPageSize
  })

  // Sincronizar com URL se habilitado
  const updateUrl = (page: number, size: number) => {
    if (!enableUrlSync) return

    const url = new URL(window.location.href)
    url.searchParams.set('page', page.toString())
    url.searchParams.set('pageSize', size.toString())
    window.history.replaceState({}, '', url.toString())
  }

  // Calcular dados paginados
  const paginationData = useMemo(() => {
    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / pageSize)
    
    // Ajustar página atual se estiver fora do range
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1))
    
    const startIndex = (validCurrentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const currentPageData = data.slice(startIndex, endIndex)

    return {
      currentPageData,
      totalItems,
      totalPages,
      validCurrentPage,
      startIndex,
      endIndex
    }
  }, [data, currentPage, pageSize])

  // Funções de navegação
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationData.totalPages || 1))
    setCurrentPage(validPage)
    updateUrl(validPage, pageSize)
  }

  const nextPage = () => {
    if (currentPage < paginationData.totalPages) {
      goToPage(currentPage + 1)
    }
  }

  const previousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToFirstPage = () => goToPage(1)
  
  const goToLastPage = () => goToPage(paginationData.totalPages)

  const handleSetPageSize = (size: number) => {
    setPageSize(size)
    // Recalcular página atual baseada na nova página
    const newCurrentPage = Math.ceil((paginationData.startIndex + 1) / size)
    goToPage(newCurrentPage)
    updateUrl(newCurrentPage, size)
  }

  // Estado de navegação
  const hasNextPage = currentPage < paginationData.totalPages
  const hasPreviousPage = currentPage > 1
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === paginationData.totalPages

  // Utilitários para números de página
  const getPageNumbers = (): number[] => {
    return Array.from({ length: paginationData.totalPages }, (_, i) => i + 1)
  }

  const getVisiblePageNumbers = (maxVisible = 7): (number | '...')[] => {
    const totalPages = paginationData.totalPages
    const current = currentPage

    if (totalPages <= maxVisible) {
      return getPageNumbers()
    }

    const delta = Math.floor(maxVisible / 2)
    const range: (number | '...')[] = []

    // Sempre mostrar primeira página
    if (current - delta > 1) {
      range.push(1)
      if (current - delta > 2) {
        range.push('...')
      }
    }

    // Páginas ao redor da atual
    const start = Math.max(1, current - delta)
    const end = Math.min(totalPages, current + delta)

    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    // Sempre mostrar última página
    if (current + delta < totalPages) {
      if (current + delta < totalPages - 1) {
        range.push('...')
      }
      range.push(totalPages)
    }

    return range
  }

  return {
    // Dados
    currentPageData: paginationData.currentPageData,
    
    // Estado
    currentPage: paginationData.validCurrentPage,
    totalPages: paginationData.totalPages,
    totalItems: paginationData.totalItems,
    pageSize,
    
    // Navegação
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    
    // Estado de navegação
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
    
    // Configuração
    setPageSize: handleSetPageSize,
    
    // Utilitários
    getPageNumbers,
    getVisiblePageNumbers
  }
}

// Hook para paginação virtual (para listes muito grandes)
export function useVirtualPagination<T>(
  data: T[],
  itemHeight: number,
  containerHeight: number,
  options: PaginationOptions = {}
) {
  const itemsPerPage = Math.floor(containerHeight / itemHeight)
  const pagination = usePagination(data, { ...options, pageSize: itemsPerPage })
  
  const [scrollTop, setScrollTop] = useState(0)
  
  // Calcular quais itens são visíveis
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + itemsPerPage + 1, // +1 para buffer
      data.length - 1
    )
    
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, itemsPerPage, data.length])

  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [data, visibleRange])

  return {
    ...pagination,
    // Dados virtualizados
    visibleItems,
    visibleRange,
    scrollTop,
    setScrollTop,
    itemHeight,
    totalHeight: data.length * itemHeight
  }
} 