/**
 * Classes CSS reutilizáveis para padronização visual
 */

// Cards comuns
export const cardClasses = {
  base: 'bg-white rounded-lg shadow',
  hover: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200',
  elevated: 'bg-white rounded-lg shadow-xl',
  bordered: 'bg-white rounded-lg border border-gray-200'
}

// Botões comuns
export const buttonClasses = {
  primary: 'inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  success: 'inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'inline-flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
}

// Ícones comuns
export const iconClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8'
}

// Cores de ícones
export const iconColors = {
  default: 'text-gray-400',
  primary: 'text-blue-600',
  success: 'text-green-600',
  danger: 'text-red-600',
  warning: 'text-yellow-600',
  muted: 'text-gray-500'
}

// Estados de loading
export const loadingClasses = {
  spinner: 'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
  container: 'flex items-center justify-center',
  text: 'text-gray-600'
}

// Grids responsivos
export const gridClasses = {
  auto: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  two: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  three: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  four: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
}

// Inputs comuns
export const inputClasses = {
  base: 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  error: 'block w-full px-3 py-2 border border-red-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
  disabled: 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-gray-50 text-gray-500 cursor-not-allowed'
}

// Text utilities
export const textClasses = {
  heading: {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-bold text-gray-900',
    h3: 'text-xl font-semibold text-gray-900',
    h4: 'text-lg font-semibold text-gray-900'
  },
  body: {
    lg: 'text-lg text-gray-700',
    base: 'text-base text-gray-700',
    sm: 'text-sm text-gray-600',
    xs: 'text-xs text-gray-500'
  },
  muted: 'text-gray-500',
  error: 'text-red-600',
  success: 'text-green-600',
  warning: 'text-yellow-600'
}

// Utility functions
export function combineClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getCardClass(variant: keyof typeof cardClasses = 'base', padding: boolean = true): string {
  const baseClass = cardClasses[variant]
  return padding ? `${baseClass} p-6` : baseClass
}

export function getButtonClass(variant: keyof typeof buttonClasses = 'primary', size: 'sm' | 'md' | 'lg' = 'md'): string {
  const baseClass = buttonClasses[variant]
  const sizeClasses = {
    sm: baseClass.replace('px-4 py-2', 'px-3 py-1.5 text-sm'),
    md: baseClass,
    lg: baseClass.replace('px-4 py-2', 'px-6 py-3 text-lg')
  }
  return sizeClasses[size]
} 