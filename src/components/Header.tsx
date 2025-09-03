import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Shield } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-800 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <Brain className="w-8 h-8 text-eva-primary" />
              <motion.div
                className="absolute inset-0 w-8 h-8 text-eva-secondary"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-8 h-8" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">EVA-OFO-001</h1>
              <p className="text-sm text-gray-400">The Core Intelligence System</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 text-eva-success">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">SECURE</span>
            </div>
            <div className="w-3 h-3 bg-eva-success rounded-full animate-pulse-eva"></div>
          </motion.div>
        </div>
      </div>
    </header>
  )
}

export default Header