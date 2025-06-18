

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  src?: string
  className?: string
  onClick?: () => void
}

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  size = 'md', 
  src, 
  className = '',
  onClick 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const generateColorFromName = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ]
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      } ${src ? '' : generateColorFromName(name)} ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}

export default Avatar 