import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Shield, MessageSquare, Settings } from 'lucide-react'

interface HeaderProps {
  currentView: 'chat' | 'training'
  onViewChange: (view: 'chat' | 'training') => void
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {

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
          
          {/* Navigation */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={() => onViewChange('chat')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'chat'
                  ? 'bg-eva-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>
            
            <button
              onClick={() => onViewChange('training')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'training'
                  ? 'bg-eva-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Training</span>
            </button>
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