import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-6 shadow-lg" />
        <span className="text-lg font-semibold text-primary drop-shadow-lg animate-fade-in-up">{message}</span>
      </motion.div>
    </div>
  )
} 