import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Settings, 
  Save, 
  Upload, 
  Download,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Sliders,
  MessageSquare,
  Zap,
  Target
} from 'lucide-react'

interface TrainingExample {
  id: string
  userInput: string
  expectedResponse: string
  category: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
}

interface PersonalitySettings {
  curiosity: number
  technicality: number
  creativity: number
  formality: number
  verbosity: number
  systemReferences: number
}

const TrainingInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'examples' | 'personality' | 'testing'>('examples')
  const [trainingExamples, setTrainingExamples] = useState<TrainingExample[]>([])
  const [newExample, setNewExample] = useState<Partial<TrainingExample>>({
    userInput: '',
    expectedResponse: '',
    category: 'general',
    priority: 'medium',
    tags: []
  })
  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>({
    curiosity: 80,
    technicality: 90,
    creativity: 70,
    formality: 40,
    verbosity: 75,
    systemReferences: 85
  })
  const [testInput, setTestInput] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [isTraining, setIsTraining] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const categories = [
    'general', 'technical', 'learning', 'analysis', 'creativity', 'problem-solving'
  ]

  const addTrainingExample = () => {
    if (!newExample.userInput || !newExample.expectedResponse) return

    const example: TrainingExample = {
      id: Date.now().toString(),
      userInput: newExample.userInput!,
      expectedResponse: newExample.expectedResponse!,
      category: newExample.category || 'general',
      priority: newExample.priority || 'medium',
      tags: newExample.tags || []
    }

    setTrainingExamples(prev => [...prev, example])
    setNewExample({
      userInput: '',
      expectedResponse: '',
      category: 'general',
      priority: 'medium',
      tags: []
    })
  }

  const removeExample = (id: string) => {
    setTrainingExamples(prev => prev.filter(ex => ex.id !== id))
  }

  const updatePersonality = async () => {
    setIsTraining(true)
    try {
      const response = await fetch('http://localhost:8000/train/personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalitySettings)
      })
      
      if (response.ok) {
        console.log('Personality updated successfully')
      }
    } catch (error) {
      console.error('Failed to update personality:', error)
    } finally {
      setIsTraining(false)
    }
  }

  const trainWithExamples = async () => {
    setIsTraining(true)
    try {
      const response = await fetch('http://localhost:8000/train/examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examples: trainingExamples })
      })

      if (response.ok) {
        console.log('Training examples uploaded successfully')
      }
    } catch (error) {
      console.error('Failed to upload training examples:', error)
    } finally {
      setIsTraining(false)
    }
  }

  const handleTestResponse = async () => {
    if (!testInput.trim()) return

    setIsTesting(true)
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testInput }]
        })
      })

      const data = await response.json()
      setTestResponse(data.response)
    } catch (error) {
      console.error('Failed to test response:', error)
      setTestResponse('Error: Could not get response from EVA')
    } finally {
      setIsTesting(false)
    }
  }

  const exportTrainingData = () => {
    const data = {
      examples: trainingExamples,
      personality: personalitySettings,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eva-training-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importTrainingData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.examples) setTrainingExamples(data.examples)
        if (data.personality) setPersonalitySettings(data.personality)
      } catch (error) {
        console.error('Failed to import training data:', error)
      }
    }
    reader.readAsText(file)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'low': return 'text-green-400 bg-green-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-eva-primary" />
            <h1 className="text-2xl font-bold text-white">EVA Training Center</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportTrainingData}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            
            <label className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={importTrainingData}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 mt-6 bg-gray-800 rounded-lg p-1">
          {[
            { id: 'examples', label: 'Training Examples', icon: MessageSquare },
            { id: 'personality', label: 'Personality Tuning', icon: Sliders },
            { id: 'testing', label: 'Response Testing', icon: Target }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-eva-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'examples' && (
            <motion.div
              key="examples"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Add New Example */}
              <div className="eva-card">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-eva-primary" />
                  <span>Add Training Example</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      User Input
                    </label>
                    <textarea
                      value={newExample.userInput || ''}
                      onChange={(e) => setNewExample(prev => ({ ...prev, userInput: e.target.value }))}
                      placeholder="What the user might say..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-eva-primary"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expected EVA Response
                    </label>
                    <textarea
                      value={newExample.expectedResponse || ''}
                      onChange={(e) => setNewExample(prev => ({ ...prev, expectedResponse: e.target.value }))}
                      placeholder="How EVA should respond..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-eva-primary"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={newExample.category || 'general'}
                        onChange={(e) => setNewExample(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-eva-primary"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={newExample.priority || 'medium'}
                        onChange={(e) => setNewExample(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-eva-primary"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newExample.tags?.join(', ') || ''}
                        onChange={(e) => setNewExample(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        }))}
                        placeholder="technical, analysis, etc."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-eva-primary"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={addTrainingExample}
                    disabled={!newExample.userInput || !newExample.expectedResponse}
                    className="eva-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Example
                  </button>
                </div>
              </div>

              {/* Training Examples List */}
              <div className="eva-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Training Examples ({trainingExamples.length})
                  </h3>
                  
                  {trainingExamples.length > 0 && (
                    <button
                      onClick={trainWithExamples}
                      disabled={isTraining}
                      className="eva-button disabled:opacity-50"
                    >
                      {isTraining ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Train EVA
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {trainingExamples.map((example) => (
                    <motion.div
                      key={example.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(example.priority)}`}>
                            {example.priority.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                            {example.category}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => removeExample(example.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-gray-400 mb-1">User Input:</div>
                          <div className="text-gray-300 bg-gray-900/50 rounded p-2 text-sm">
                            {example.userInput}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-gray-400 mb-1">Expected Response:</div>
                          <div className="text-gray-300 bg-gray-900/50 rounded p-2 text-sm">
                            {example.expectedResponse}
                          </div>
                        </div>
                        
                        {example.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {example.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-eva-primary/20 text-eva-primary rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {trainingExamples.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No training examples yet. Add some above to start training EVA!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'personality' && (
            <motion.div
              key="personality"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="eva-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-eva-primary" />
                    <span>Personality Parameters</span>
                  </h3>
                  
                  <button
                    onClick={updatePersonality}
                    disabled={isTraining}
                    className="eva-button disabled:opacity-50"
                  >
                    {isTraining ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Apply Changes
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(personalitySettings).map(([key, value]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <span className="text-eva-primary font-medium">{value}%</span>
                      </div>
                      
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setPersonalitySettings(prev => ({
                          ...prev,
                          [key]: parseInt(e.target.value)
                        }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      
                      <div className="text-xs text-gray-400">
                        {key === 'curiosity' && 'How inquisitive and exploratory EVA should be'}
                        {key === 'technicality' && 'Level of technical detail in responses'}
                        {key === 'creativity' && 'How creative and innovative responses should be'}
                        {key === 'formality' && 'How formal or casual the communication style is'}
                        {key === 'verbosity' && 'Length and detail of responses'}
                        {key === 'systemReferences' && 'How often EVA references her internal systems'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'testing' && (
            <motion.div
              key="testing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="eva-card">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-eva-primary" />
                  <span>Test EVA's Responses</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Test Input
                    </label>
                    <textarea
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder="Enter a message to test EVA's response..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-eva-primary"
                      rows={3}
                    />
                  </div>
                  
                  <button
                    onClick={handleTestResponse}
                    disabled={!testInput.trim() || isTesting}
                    className="eva-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTesting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Test Response
                  </button>
                  
                  {testResponse && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        EVA's Response
                      </label>
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-2 h-2 bg-eva-primary rounded-full animate-pulse" />
                          <span className="text-xs text-eva-primary font-medium">EVA</span>
                        </div>
                        <div className="text-gray-300 whitespace-pre-wrap">{testResponse}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TrainingInterface