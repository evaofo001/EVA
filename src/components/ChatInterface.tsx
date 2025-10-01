import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Paperclip, 
  Image, 
  Video, 
  Music, 
  File,
  X,
  Play,
  Pause,
  Volume2
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'eva'
  content: string
  timestamp: Date
  attachments?: Attachment[]
}

interface Attachment {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'file'
  url: string
  size: number
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() && selectedFiles.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      attachments: selectedFiles.map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: getFileType(file),
        url: URL.createObjectURL(file),
        size: file.size
      }))
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setSelectedFiles([])
    setIsTyping(true)

    try {
      const responseContent = await generateEVAResponse(userMessage)
      const evaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'eva',
        content: responseContent,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, evaResponse])
    } catch (error) {
      console.error('Error getting EVA response:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const generateEVAResponse = async (userMessage: Message): Promise<string> => {
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage.content }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response
      }
    } catch (error) {
      console.error('Failed to get response from EVA:', error)
    }

    return "I'm still initializing my core systems. Please train me through the Training Center first."
  }

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'file' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    return 'file'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const files = Array.from(event.dataTransfer.files)
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'audio': return <Music className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  const renderAttachment = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="w-full h-auto object-cover"
            />
          </div>
        )
      case 'video':
        return (
          <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
            <video 
              src={attachment.url} 
              controls
              className="w-full h-auto"
            >
              Your browser does not support video playback.
            </video>
          </div>
        )
      case 'audio':
        return (
          <div className="mt-2 bg-gray-700 rounded-lg p-3 max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <Music className="w-4 h-4 text-eva-accent" />
              <span className="text-sm text-gray-300">{attachment.name}</span>
            </div>
            <audio 
              src={attachment.url} 
              controls
              className="w-full"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        )
      default:
        return (
          <div className="mt-2 bg-gray-700 rounded-lg p-3 max-w-xs">
            <div className="flex items-center space-x-2">
              <File className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-300">{attachment.name}</div>
                <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Drag overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-eva-primary/20 border-2 border-dashed border-eva-primary z-50 flex items-center justify-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Paperclip className="w-12 h-12 text-eva-primary mx-auto mb-2" />
              <p className="text-eva-primary font-medium">Drop files here to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                message.type === 'user' 
                  ? 'bg-eva-primary text-white' 
                  : 'bg-gray-800 text-gray-100'
              } rounded-2xl px-4 py-3 shadow-lg`}>
                {message.type === 'eva' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-eva-primary rounded-full animate-pulse" />
                    <span className="text-xs text-eva-primary font-medium">EVA</span>
                  </div>
                )}
                
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {message.attachments && message.attachments.map((attachment) => (
                  <div key={attachment.id}>
                    {renderAttachment(attachment)}
                  </div>
                ))}
                
                <div className="mt-2 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800 rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-eva-primary rounded-full animate-pulse" />
                  <span className="text-xs text-eva-primary font-medium">EVA</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-800 p-4 bg-gray-900/50"
          >
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2"
                >
                  {getFileIcon(getFileType(file))}
                  <div className="text-xs">
                    <div className="text-gray-300 max-w-20 truncate">{file.name}</div>
                    <div className="text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4 bg-gray-900/30">
        <div className="flex items-end space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-eva-primary transition-colors rounded-lg hover:bg-gray-800"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Message EVA..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-eva-primary resize-none max-h-32"
              rows={1}
            />
          </div>
          
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && selectedFiles.length === 0}
            className="p-2 bg-eva-primary hover:bg-eva-secondary disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

export default ChatInterface