'use client'

import { useState } from 'react'
import { Sparkles, Wand2, CheckCircle, TrendingUp, FileText, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface AIContentAssistantProps {
  content: string
  onSuggestion?: (suggestion: string) => void
}

export default function AIContentAssistant({ content, onSuggestion }: AIContentAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const analyzeSEO = () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    setTimeout(() => {
      setSuggestions([
        'Add more subheadings (H2, H3) to improve readability',
        'Include statistics and data to support your claims',
        'Optimize meta description to 150-160 characters',
        'Add internal links to related content',
        'Include more relevant keywords naturally'
      ])
      setIsAnalyzing(false)
      toast.success('AI analysis complete!')
    }, 1500)
  }

  const improveReadability = () => {
    toast.success('Readability improvements suggested!')
  }

  const generateOutline = () => {
    toast.success('Content outline generated!')
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="font-bold text-lg">AI Content Assistant</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <button
          onClick={analyzeSEO}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 rounded-lg hover:shadow-md transition text-sm font-medium"
        >
          <TrendingUp className="h-4 w-4 text-purple-600" />
          {isAnalyzing ? 'Analyzing...' : 'SEO Analysis'}
        </button>
        <button
          onClick={improveReadability}
          className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 rounded-lg hover:shadow-md transition text-sm font-medium"
        >
          <FileText className="h-4 w-4 text-blue-600" />
          Readability
        </button>
        <button
          onClick={generateOutline}
          className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 rounded-lg hover:shadow-md transition text-sm font-medium"
        >
          <Zap className="h-4 w-4 text-orange-600" />
          Generate Outline
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            AI Suggestions:
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-white dark:bg-gray-900 rounded-lg text-sm"
            >
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
