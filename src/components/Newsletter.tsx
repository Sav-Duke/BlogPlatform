'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true)
      toast.success('Successfully subscribed to newsletter!')
      setEmail('')
      setIsLoading(false)
      
      // Reset after 5 seconds
      setTimeout(() => setIsSubscribed(false), 5000)
    }, 1000)
  }

  if (isSubscribed) {
    return (
      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-8 text-center">
        <CheckCircle className="h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Welcome aboard!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          You'll receive our latest articles and updates.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Subscribe to Newsletter</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get the latest articles delivered to your inbox
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span className="hidden sm:inline">Subscribing...</span>
            </>
          ) : (
            <>
              <Mail className="h-5 w-5" />
              <span className="hidden sm:inline">Subscribe</span>
            </>
          )}
        </button>
      </form>
      
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  )
}
