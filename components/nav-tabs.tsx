'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Image as ImageIcon, Box, Boxes } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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
      name: 'Images',
      href: '/gallery',
      icon: ImageIcon,
      active: pathname === '/gallery',
    },
    {
      name: '3D Models',
      href: '/models-3d',
      icon: Boxes,
      active: pathname === '/models-3d',
    },
    {
      name: 'Sandbox',
      href: '/sandbox',
      icon: Box,
      active: pathname === '/sandbox',
    },
  ]

  return (
    <nav className="flex gap-1 bg-gray-800 p-1 rounded-lg relative">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors z-10',
              tab.active
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-100'
            )}
          >
            {tab.active && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-[#083d77] rounded-md shadow-lg"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            <motion.div
              className="relative z-10 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={tab.active ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Icon className="h-4 w-4" />
              </motion.div>
              <span>{tab.name}</span>
            </motion.div>
          </Link>
        )
      })}
    </nav>
  )
}

