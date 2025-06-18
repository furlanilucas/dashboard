export function formatDate(date: string | Date, options?: {
  includeTime?: boolean
  relative?: boolean
  short?: boolean
}): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const { includeTime = false, relative = false, short = false } = options || {}

  if (relative) {
    return formatRelativeDate(dateObj)
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: short ? 'short' : 'long',
    day: 'numeric',
  }

  if (includeTime) {
    formatOptions.hour = '2-digit'
    formatOptions.minute = '2-digit'
  }

  return dateObj.toLocaleDateString('pt-BR', formatOptions)
}

export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Agora mesmo'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''} atrás`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''} atrás`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} m${diffInMonths > 1 ? 'eses' : 'ês'} atrás`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} ano${diffInYears > 1 ? 's' : ''} atrás`
}

export function formatDateRange(startDate: string | Date, endDate?: string | Date): string {
  const start = formatDate(startDate, { short: true })
  
  if (!endDate) {
    return `${start} - Em andamento`
  }
  
  const end = formatDate(endDate, { short: true })
  return `${start} - ${end}`
}

export function isOverdue(date: string | Date): boolean {
  const now = new Date()
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return targetDate < now
}

export function getDaysUntil(date: string | Date): number {
  const now = new Date()
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const diffInTime = targetDate.getTime() - now.getTime()
  return Math.ceil(diffInTime / (1000 * 3600 * 24))
} 