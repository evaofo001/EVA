import React from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import ChatInterface from './components/ChatInterface'
import Dashboard from './components/Dashboard'
import VoiceButton from './components/VoiceButton'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-eva-dark via-gray-900 to-black flex flex-col">
      <Header />
      
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <ChatInterface />
          </div>
          
          {/* Dashboard Section */}
          <div className="w-80 border-l border-gray-800">
            <Dashboard />
          </div>
        </div>
      </main>
      
      {/* Voice Button Footer */}
      <VoiceButton />
    </div>
  )
}

export default App