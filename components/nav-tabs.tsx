'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NavTabs() {
  const pathname = usePathname()

  const tabs = [
    {
      name: 'Generate',
      href: '/',
      icon: Sparkles,
      active: pathname === '/',
    },
    {
      name: 'Gallery',
      href: '/gallery',
      icon: ImageIcon,
      active: pathname === '/gallery',
    },
  ]

  return (
    <nav className="flex gap-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              tab.active
                ? 'bg-white dark:bg-[#083d77] text-[#083d77] dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}

