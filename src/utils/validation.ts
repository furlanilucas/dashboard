/**
 * Utilitários de validação centralizados
 */

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Valida formato de email
 * @param email Email a ser validado
 * @returns true se válido
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Valida formato de telefone
 * @param phone Telefone a ser validado
 * @returns true se válido
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  
  const phoneRegex = /^[\d\s\-\(\)\+]+$/
  return phoneRegex.test(phone.trim())
}

/**
 * Valida se string não está vazia
 * @param value Valor a ser validado
 * @returns true se não vazio
 */
export function isRequired(value: string): boolean {
  return Boolean(value && value.trim().length > 0)
}

/**
 * Valida tamanho mínimo de string
 * @param value Valor a ser validado
 * @param minLength Tamanho mínimo
 * @returns true se atende ao mínimo
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return Boolean(value && value.trim().length >= minLength)
}

/**
 * Valida dados de cliente
 * @param data Dados do cliente
 * @returns Resultado da validação
 */
export function validateClientData(data: {
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  // Nome obrigatório
  if (!isRequired(data.name)) {
    errors.name = 'Nome é obrigatório'
  } else if (!hasMinLength(data.name, 2)) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres'
  }

  // Email obrigatório e válido
  if (!isRequired(data.email)) {
    errors.email = 'Email é obrigatório'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email deve ter um formato válido'
  }

  // Telefone opcional, mas se preenchido deve ser válido
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Telefone deve conter apenas números, espaços e caracteres especiais'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Valida dados de projeto
 * @param data Dados do projeto
 * @returns Resultado da validação
 */
export function validateProjectData(data: {
  name: string
  description?: string
  clientId?: number
  githubRepo?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  // Nome obrigatório
  if (!isRequired(data.name)) {
    errors.name = 'Nome do projeto é obrigatório'
  } else if (!hasMinLength(data.name, 3)) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres'
  }

  // URL do GitHub opcional, mas se preenchida deve ser válida
  if (data.githubRepo && !isValidGitHubUrl(data.githubRepo)) {
    errors.githubRepo = 'URL do GitHub deve ser válida (ex: https://github.com/user/repo)'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Valida URL do GitHub
 * @param url URL a ser validada
 * @returns true se é uma URL válida do GitHub
 */
export function isValidGitHubUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/
  return githubRegex.test(url.trim())
} 