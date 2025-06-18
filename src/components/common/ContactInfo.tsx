import { Mail, Phone, MapPin, Building } from 'lucide-react'

interface ContactInfoProps {
  email: string
  phone?: string
  company?: string
  address?: string
  showIcons?: boolean
  layout?: 'vertical' | 'horizontal'
  className?: string
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  email,
  phone,
  company,
  address,
  showIcons = true,
  layout = 'vertical',
  className = ''
}) => {
  const contactItems = [
    { icon: Mail, value: email, label: 'Email' },
    { icon: Phone, value: phone, label: 'Telefone' },
    { icon: Building, value: company, label: 'Empresa' },
    { icon: MapPin, value: address, label: 'Endereço' }
  ].filter(item => item.value)

  if (contactItems.length === 0) {
    return null
  }

  const containerClasses = layout === 'horizontal' 
    ? 'flex flex-wrap gap-4' 
    : 'space-y-2'

  return (
    <div className={`${containerClasses} ${className}`}>
      {contactItems.map((item, index) => {
        const Icon = item.icon
        return (
          <div key={index} className="flex items-center gap-2">
            {showIcons && <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 truncate" title={item.value}>
                {item.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ContactInfo 