'use client'

import { useEightBit } from './eight-bit-provider'
import { motion } from 'framer-motion'

export function EightBitToggle() {
  const { isEightBit, toggleEightBit } = useEightBit()

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <button
        onClick={toggleEightBit}
        className={`font-mono text-xs px-3 h-8 border-2 transition-colors ${
          isEightBit 
            ? 'bg-cyan-600 border-cyan-400 text-white' 
            : 'bg-transparent border-cyan-600 text-cyan-500'
        } hover:bg-cyan-500 hover:text-white hover:border-cyan-300`}
        style={{ 
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          borderRadius: 0,
        }}
        title={isEightBit ? 'Disable 8-bit mode' : 'Enable 8-bit mode'}
      >
        {isEightBit ? '[ ON ]' : '[ OFF ]'} 8-BIT
      </button>
    </motion.div>
  )
}

