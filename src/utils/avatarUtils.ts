/**
 * Utilitários para manipulação de avatars e iniciais
 */

export interface AvatarConfig {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'rounded'
  fallbackBg?: string
  fallbackText?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-lg', 
  lg: 'h-16 w-16 text-xl',
  xl: 'h-20 w-20 text-2xl'
}

const shapeClasses = {
  circle: 'rounded-full',
  rounded: 'rounded-lg'
}

/**
 * Gera iniciais a partir de um nome completo
 * @param name Nome completo
 * @param maxInitials Número máximo de iniciais (padrão: 2)
 * @returns String com as iniciais em maiúsculo
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  if (!name || typeof name !== 'string') return ''
  
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxInitials)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
}

/**
 * Gera classes CSS para avatar baseado na configuração
 * @param config Configuração do avatar
 * @returns String com classes CSS
 */
export function getAvatarClasses(config: AvatarConfig = {}): string {
  const {
    size = 'md',
    shape = 'circle',
    fallbackBg = 'bg-blue-100',
    fallbackText = 'text-blue-600'
  } = config

  return `${sizeClasses[size]} ${shapeClasses[shape]} ${fallbackBg} ${fallbackText} flex items-center justify-center font-semibold`
}

/**
 * Gera props completas para avatar
 * @param name Nome da pessoa
 * @param avatarUrl URL do avatar (opcional)
 * @param config Configuração do avatar
 * @returns Objeto com props para renderização
 */
export function getAvatarProps(
  name: string,
  avatarUrl?: string | null,
  config: AvatarConfig = {}
) {
  const initials = getInitials(name)
  const classes = getAvatarClasses(config)
  
  return {
    initials,
    classes,
    hasImage: Boolean(avatarUrl),
    imageUrl: avatarUrl,
    alt: name
  }
} 