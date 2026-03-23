import Link from 'next/link'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; href?: string; onClick?: () => void }
}

export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4 text-gray-400 dark:text-gray-600">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm mb-6">{description}</p>}
      {action && (
        action.href ? (
          <Link href={action.href} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
