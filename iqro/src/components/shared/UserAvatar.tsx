import React from 'react'

interface UserAvatarProps {
  avatarUrl?: string | null
  fullName?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function UserAvatar({ avatarUrl, fullName, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm', 
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  }
  
  const safeName = fullName || 'Foydalanuvchi'
  const initials = safeName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  
  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={safeName}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0 shadow-sm border border-gray-100 dark:border-gray-800`}
        onError={(e) => {
          // Fallback to initials on error
          e.currentTarget.style.display = 'none'
          if (e.currentTarget.nextElementSibling) {
            e.currentTarget.nextElementSibling.removeAttribute('style')
          }
        }}
      />
    )
  }
  
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-indigo-100 dark:bg-indigo-900/50 
                     flex items-center justify-center font-bold flex-shrink-0
                     text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm`}>
      {initials}
    </div>
  )
}
