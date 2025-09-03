import React from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Cpu, 
  Database, 
  Shield, 
  Zap,
  Wifi,
  Battery,
  Users,
  Brain
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const systemStatus = {
    online: true,
    connectedUnits: 3,
    batteryLevel: 87,
    cpuUsage: 45,
    memoryUsage: 67,
    networkStatus: 'stable'
  }

  const coreModules = [
    { name: 'Lease Manager', status: 'active', language: 'Rust', load: 23 },
    { name: 'Policy Engine', status: 'active', language: 'C++', load: 45 },
    { name: 'Knowledge Fusion', status: 'learning', language: 'Python', load: 78 },
    { name: 'RL Engine', status: 'evolving', language: 'C++', load: 92 },
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
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="eva-card"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-5 h-5 text-eva-primary" />
          <h3 className="font-semibold text-white">System Status</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">EVA Status</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus.online ? 'bg-eva-success animate-pulse' : 'bg-gray-500'}`} />
              <span className={`text-sm font-medium ${systemStatus.online ? 'text-eva-success' : 'text-gray-500'}`}>
                {systemStatus.online ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Connected Units</span>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-eva-secondary" />
              <span className="text-sm text-white">{systemStatus.connectedUnits}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Battery Level</span>
            <div className="flex items-center space-x-2">
              <Battery className="w-4 h-4 text-eva-success" />
              <span className="text-sm text-white">{systemStatus.batteryLevel}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Core Modules */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="eva-card"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-5 h-5 text-eva-primary" />
          <h3 className="font-semibold text-white">Core Modules</h3>
        </div>
        
        <div className="space-y-3">
          {coreModules.map((module, index) => (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{module.name}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  {module.language}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${getStatusColor(module.status)}`}>
                  {module.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">{module.load}%</span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-1">
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
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="eva-card"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Cpu className="w-5 h-5 text-eva-primary" />
          <h3 className="font-semibold text-white">Performance</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">CPU Usage</span>
              <span className="text-white">{systemStatus.cpuUsage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-eva-accent h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${systemStatus.cpuUsage}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Memory Usage</span>
              <span className="text-white">{systemStatus.memoryUsage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-eva-secondary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${systemStatus.memoryUsage}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Network Status */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="eva-card"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Wifi className="w-5 h-5 text-eva-primary" />
          <h3 className="font-semibold text-white">Network</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Connection</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-eva-success rounded-full animate-pulse" />
            <span className="text-sm text-eva-success font-medium">
              {systemStatus.networkStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard