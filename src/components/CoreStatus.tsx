import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Cpu, Database, Shield, Zap } from 'lucide-react'

const CoreStatus: React.FC = () => {
  const coreModules = [
    { name: 'Lease Manager', status: 'active', language: 'Rust', icon: Shield, load: 23 },
    { name: 'Policy Engine', status: 'active', language: 'C++', icon: Cpu, load: 45 },
    { name: 'Knowledge Fusion', status: 'learning', language: 'Python', icon: Database, load: 78 },
    { name: 'RL Engine', status: 'evolving', language: 'C++', icon: Zap, load: 92 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-eva-success'
      case 'learning': return 'text-eva-warning'
      case 'evolving': return 'text-eva-accent'
      default: return 'text-gray-400'
    }
  }

  return (
    <section className="eva-card">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="w-6 h-6 text-eva-primary" />
        <h2 className="text-xl font-semibold text-white">Core Status</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {coreModules.map((module, index) => (
          <motion.div
            key={module.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <module.icon className="w-5 h-5 text-eva-primary" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {module.language}
              </span>
            </div>
            
            <h3 className="font-medium text-white mb-2">{module.name}</h3>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${getStatusColor(module.status)}`}>
                {module.status.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">{module.load}%</span>
            </div>
            
            <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
              <motion.div
                className="bg-eva-primary h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${module.load}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default CoreStatus