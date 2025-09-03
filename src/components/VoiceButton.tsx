import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'

const VoiceButton: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false)
      setIsRecording(false)
    } else {
      setIsListening(true)
      setIsRecording(true)
      
      // Simulate recording duration
      setTimeout(() => {
        setIsRecording(false)
        setTimeout(() => {
          setIsListening(false)
        }, 500)
      }, 3000)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-eva-primary rounded-full animate-pulse" />
              <span className="text-sm text-eva-primary font-medium">
                {isRecording ? 'Listening...' : 'Processing...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleVoiceToggle}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening 
            ? 'bg-eva-accent shadow-lg shadow-eva-accent/50' 
            : 'bg-eva-primary hover:bg-eva-secondary shadow-lg shadow-eva-primary/30'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isRecording ? { 
          boxShadow: [
            '0 0 0 0 rgba(255, 107, 53, 0.7)',
            '0 0 0 20px rgba(255, 107, 53, 0)',
          ]
        } : {}}
        transition={isRecording ? {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut"
        } : { duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <MicOff className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Mic className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

export default VoiceButton