import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Smartphone, Server, Lock } from 'lucide-react'

const SystemOverview: React.FC = () => {
  const systemLayers = [
    {
      title: 'Intelligence Core (OFO-001)',
      description: 'Multi-language brain with C++, Rust, and Python components',
      icon: Brain,
      color: 'eva-primary',
      features: ['Reinforcement Learning', 'Policy Engine', 'Knowledge Fusion', 'Emergency Kill Switch']
    },
    {
      title: 'Interface Layer (EVA App)',
      description: 'Cross-platform C#/.NET MAUI application for user interaction',
      icon: Smartphone,
      color: 'eva-secondary',
      features: ['Voice Interface', 'Chat Interface', 'Device Control', 'Notifications']
    },
    {
      title: 'Infrastructure',
      description: 'Secure communication and data management systems',
      icon: Server,
      color: 'eva-accent',
      features: ['gRPC Communication', 'PostgreSQL Storage', 'Redis Caching', 'Docker Deployment']
    },
    {
      title: 'Security Layer',
      description: 'Multi-layered security with encryption and safety controls',
      icon: Lock,
      color: 'eva-success',
      features: ['mTLS Encryption', 'Ed25519 Keys', 'Vault Secrets', 'Ethical Policies']
    }
  ]

  return (
    <section className="eva-card">
      <div className="flex items-center space-x-3 mb-6">
        <Server className="w-6 h-6 text-eva-primary" />
        <h2 className="text-xl font-semibold text-white">System Architecture</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systemLayers.map((layer, index) => (
          <motion.div
            key={layer.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800/30 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg bg-${layer.color}/20`}>
                <layer.icon className={`w-6 h-6 text-${layer.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white">{layer.title}</h3>
                <p className="text-sm text-gray-400">{layer.description}</p>
              </div>
            </div>
            
            <ul className="space-y-2">
              {layer.features.map((feature, featureIndex) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (index * 0.1) + (featureIndex * 0.05) }}
                  className="flex items-center space-x-2 text-sm text-gray-300"
                >
                  <div className="w-1.5 h-1.5 bg-eva-primary rounded-full" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default SystemOverview