'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ButtonProps } from '@/components/ui/button'
import { forwardRef } from 'react'

export const AnimatedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.015}}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button ref={ref} {...props}>
          {children}
        </Button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

