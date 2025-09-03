import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Smartphone, 
  Server, 
  Lock, 
  ChevronRight,
  Code,
  Database,
  Shield,
  Zap,
  MessageSquare,
  Mic,
  Bell,
  Settings
} from 'lucide-react'

interface ArchitectureLayer {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  technologies: string[]
  components: string[]
  status: 'active' | 'developing' | 'planned'
}

const ArchitectureView: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)

  const architectureLayers: ArchitectureLayer[] = [
    {
      id: 'intelligence',
      title: 'Intelligence Core (OFO-001)',
      description: 'Multi-language brain with C++, Rust, and Python components',
      icon: Brain,
      color: 'eva-primary',
      technologies: ['C++', 'Rust', 'Python', 'PyTorch', 'scikit-learn'],
      components: [
        'Reinforcement Learning Engine',
        'Policy Engine', 
        'Knowledge Fusion Engine',
        'Lease Manager',
        'Emergency Kill Switch'
      ],
      status: 'developing'
    },
    {
      id: 'interface',
      title: 'Interface Layer (EVA App)',
      description: 'Cross-platform C#/.NET MAUI application for user interaction',
      icon: Smartphone,
      color: 'eva-secondary',
      technologies: ['C#', '.NET MAUI', 'XAML', 'gRPC'],
      components: [
        'Voice Interface',
        'Chat Interface', 
        'Device Control',
        'Notifications',
        'UI Dashboard'
      ],
      status: 'planned'
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure Layer',
      description: 'Secure communication and data management systems',
      icon: Server,
      color: 'eva-accent',
      technologies: ['PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'gRPC'],
      components: [
        'Data Storage',
        'Caching Layer',
        'Communication Hub',
        'Container Orchestration',
        'Load Balancing'
      ],
      status: 'developing'
    },
    {
      id: 'security',
      title: 'Security Layer',
      description: 'Multi-layered security with encryption and safety controls',
      icon: Lock,
      color: 'eva-success',
      technologies: ['mTLS', 'Ed25519', 'Vault', 'Prometheus'],
      components: [
        'Encryption Management',
        'Key Distribution',
        'Secret Storage',
        'Threat Detection',
        'Audit Logging'
      ],
      status: 'active'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-eva-success bg-eva-success/20'
      case 'developing': return 'text-eva-warning bg-eva-warning/20'
      case 'planned': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getLayerIcon = (layerId: string) => {
    switch (layerId) {
      case 'intelligence': return <Code className="w-4 h-4" />
      case 'interface': return <MessageSquare className="w-4 h-4" />
      case 'infrastructure': return <Database className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  return (
    <section className="eva-card">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-6 h-6 text-eva-primary" />
        <h2 className="text-xl font-semibold text-white">EVA Architecture Overview</h2>
      </div>
      
      <div className="space-y-4">
        {architectureLayers.map((layer, index) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="border border-gray-700 rounded-lg overflow-hidden"
          >
            <motion.button
              onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
              className="w-full p-4 bg-gray-800/30 hover:bg-gray-800/50 transition-colors flex items-center justify-between"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg bg-${layer.color}/20`}>
                  <layer.icon className={`w-6 h-6 text-${layer.color}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white flex items-center space-x-2">
                    <span>{layer.title}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(layer.status)}`}>
                      {layer.status.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-400">{layer.description}</p>
                </div>
              </div>
              
              <motion.div
                animate={{ rotate: selectedLayer === layer.id ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {selectedLayer === layer.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800/20 border-t border-gray-700"
                >
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
                        <Code className="w-4 h-4" />
                        <span>Technologies</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {layer.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
                        {getLayerIcon(layer.id)}
                        <span>Core Components</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {layer.components.map((component, componentIndex) => (
                          <motion.div
                            key={component}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: componentIndex * 0.05 }}
                            className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-eva-primary rounded-full" />
                            <span className="text-sm text-gray-300">{component}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8 p-4 bg-gradient-to-r from-eva-primary/10 to-eva-secondary/10 rounded-lg border border-eva-primary/20"
      >
        <div className="flex items-center space-x-3 mb-3">
          <Zap className="w-5 h-5 text-eva-primary" />
          <h3 className="font-semibold text-white">EVA's Evolution Cycle</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {['Perception', 'Memory', 'Learning', 'Experimentation', 'Output'].map((phase, index) => (
            <motion.div
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
              className="p-3 bg-gray-800/40 rounded-lg"
            >
              <div className="w-8 h-8 bg-eva-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-eva-primary">{index + 1}</span>
              </div>
              <span className="text-xs text-gray-300 font-medium">{phase}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export default ArchitectureView