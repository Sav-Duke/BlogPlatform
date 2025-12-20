'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader, TrendingUp, X } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  type: 'post'
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [trending, setTrending] = useState<any[]>([])
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const delaySearch = setTimeout(async () => {
      setIsLoading(true)
      try {
        const { data } = await axios.get(`/api/posts?search=${query}&limit=5`)
        setResults(
          data.posts.map((post: any) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            type: 'post',
          }))
        )
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [query])

  useEffect(() => {
    // Load trending posts
    const loadTrending = async () => {
      try {
        const { data } = await axios.get('/api/posts?featured=true&limit=3')
        setTrending(data.posts)
      } catch (error) {
        console.error('Failed to load trending:', error)
      }
    }
    loadTrending()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/blog?search=${encodeURIComponent(query)}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          {query ? (
            <>
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader className="h-6 w-6 animate-spin mx-auto text-primary-600" />
                </div>
              ) : results.length > 0 ? (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                    Search Results
                  </div>
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/blog/${result.slug}`}
                      onClick={() => {
                        setIsOpen(false)
                        setQuery('')
                      }}
                      className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                      <div className="font-medium mb-1">{result.title}</div>
                      {result.excerpt && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {result.excerpt}
                        </div>
                      )}
                    </Link>
                  ))}
                  <Link
                    href={`/blog?search=${encodeURIComponent(query)}`}
                    onClick={() => {
                      setIsOpen(false)
                      setQuery('')
                    }}
                    className="block p-3 text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-center font-medium"
                  >
                    View all results for "{query}"
                  </Link>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No results found for "{query}"
                </div>
              )}
            </>
          ) : (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending Posts
              </div>
              {trending.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <div className="font-medium">{post.title}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
