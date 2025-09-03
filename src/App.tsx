import React from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import CoreStatus from './components/CoreStatus'
import SystemOverview from './components/SystemOverview'
import ArchitectureView from './components/ArchitectureView'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-eva-dark via-gray-900 to-black">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <CoreStatus />
          <SystemOverview />
          <ArchitectureView />
        </motion.div>
      </main>
    </div>
  )
}

export default App