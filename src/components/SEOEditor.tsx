'use client'

import { useState, useEffect } from 'react'
import { Search, Target, TrendingUp, AlertCircle, CheckCircle, Globe } from 'lucide-react'

interface SEOEditorProps {
  title: string
  excerpt: string
  content: string
  slug: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  focusKeyword: string
  onSeoChange: (field: string, value: string) => void
}

export default function SEOEditor({
  title,
  excerpt,
  content,
  slug,
  seoTitle,
  seoDescription,
  seoKeywords,
  focusKeyword,
  onSeoChange,
}: SEOEditorProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'preview' | 'analysis'>('settings')
  const [analysis, setAnalysis] = useState({
    titleLength: 0,
    descriptionLength: 0,
    slugQuality: 0,
    keywordInTitle: false,
    keywordInDescription: false,
    keywordInContent: false,
    keywordInSlug: false,
    contentLength: 0,
    readability: 0,
    score: 0,
  })

  useEffect(() => {
    analyzeContent()
  }, [title, excerpt, content, slug, seoTitle, seoDescription, focusKeyword])

  const analyzeContent = () => {
    const effectiveTitle = seoTitle || title
    const effectiveDescription = seoDescription || excerpt
    const plainContent = content.replace(/<[^>]*>/g, '').toLowerCase()
    const keyword = focusKeyword.toLowerCase()
    
    const titleLength = effectiveTitle.length
    const descriptionLength = effectiveDescription.length
    const contentWords = plainContent.split(/\s+/).length
    
    const keywordInTitle = keyword ? effectiveTitle.toLowerCase().includes(keyword) : false
    const keywordInDescription = keyword ? effectiveDescription.toLowerCase().includes(keyword) : false
    const keywordInContent = keyword ? plainContent.includes(keyword) : false
    const keywordInSlug = keyword ? slug.toLowerCase().includes(keyword.replace(/\s+/g, '-')) : false
    
    // Calculate slug quality (shorter, with hyphens is better)
    const slugQuality = slug.length > 0 && slug.length < 60 && slug.includes('-') ? 100 : 50
    
    // Basic readability score (based on sentence length)
    const sentences = plainContent.split(/[.!?]+/).length
    const avgWordsPerSentence = contentWords / Math.max(sentences, 1)
    const readability = avgWordsPerSentence < 20 ? 100 : Math.max(0, 100 - (avgWordsPerSentence - 20) * 5)
    
    // Calculate overall SEO score
    let score = 0
    if (titleLength >= 30 && titleLength <= 60) score += 15
    else if (titleLength > 0) score += 5
    
    if (descriptionLength >= 120 && descriptionLength <= 160) score += 15
    else if (descriptionLength > 0) score += 5
    
    if (contentWords >= 300) score += 15
    else if (contentWords >= 100) score += 5
    
    if (slugQuality === 100) score += 10
    
    if (keywordInTitle) score += 15
    if (keywordInDescription) score += 10
    if (keywordInContent) score += 10
    if (keywordInSlug) score += 10
    
    setAnalysis({
      titleLength,
      descriptionLength,
      slugQuality,
      keywordInTitle,
      keywordInDescription,
      keywordInContent,
      keywordInSlug,
      contentLength: contentWords,
      readability: Math.round(readability),
      score: Math.min(100, score),
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20'
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  const renderPreview = () => {
    const effectiveTitle = seoTitle || title || 'Your Post Title'
    const effectiveDescription = seoDescription || excerpt || 'Your post description will appear here...'
    const url = `https://yourdomain.com/blog/${slug || 'post-slug'}`
    
    return (
      <div className="space-y-6">
        {/* Google Search Preview */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Google Search Preview
          </h4>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{url}</div>
            <h3 className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
              {effectiveTitle}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {effectiveDescription.substring(0, 160)}
              {effectiveDescription.length > 160 ? '...' : ''}
            </p>
          </div>
        </div>

        {/* Facebook Preview */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Facebook/LinkedIn Preview
          </h4>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">Cover Image</span>
            </div>
            <div className="p-3">
              <div className="text-xs text-gray-500 uppercase mb-1">yourdomain.com</div>
              <h4 className="font-semibold mb-1">{effectiveTitle}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {effectiveDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Twitter Preview */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Twitter/X Preview
          </h4>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">Cover Image</span>
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-sm mb-1">{effectiveTitle}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                {effectiveDescription}
              </p>
              <div className="text-xs text-gray-500">yourdomain.com</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAnalysis = () => {
    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <div className={`p-4 rounded-lg ${getScoreBg(analysis.score)}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">SEO Score</h4>
            <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                analysis.score >= 80
                  ? 'bg-green-600'
                  : analysis.score >= 50
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>
        </div>

        {/* Title Analysis */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Title Optimization
          </h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              {analysis.titleLength >= 30 && analysis.titleLength <= 60 ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm">
                  Title length: <strong>{analysis.titleLength}</strong> characters
                </p>
                <p className="text-xs text-gray-500">Recommended: 30-60 characters</p>
              </div>
            </div>
            {focusKeyword && (
              <div className="flex items-start gap-2">
                {analysis.keywordInTitle ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm">
                  Focus keyword {analysis.keywordInTitle ? 'found' : 'not found'} in title
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Description Analysis */}
        <div>
          <h4 className="font-medium mb-3">Meta Description</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              {analysis.descriptionLength >= 120 && analysis.descriptionLength <= 160 ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm">
                  Description length: <strong>{analysis.descriptionLength}</strong> characters
                </p>
                <p className="text-xs text-gray-500">Recommended: 120-160 characters</p>
              </div>
            </div>
            {focusKeyword && (
              <div className="flex items-start gap-2">
                {analysis.keywordInDescription ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm">
                  Focus keyword {analysis.keywordInDescription ? 'found' : 'not found'} in description
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content Analysis */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Content Analysis
          </h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              {analysis.contentLength >= 300 ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm">
                  Content length: <strong>{analysis.contentLength}</strong> words
                </p>
                <p className="text-xs text-gray-500">Recommended: 300+ words for better SEO</p>
              </div>
            </div>
            {focusKeyword && (
              <>
                <div className="flex items-start gap-2">
                  {analysis.keywordInContent ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">
                    Focus keyword {analysis.keywordInContent ? 'found' : 'not found'} in content
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  {analysis.keywordInSlug ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">
                    Focus keyword {analysis.keywordInSlug ? 'found' : 'not found'} in URL slug
                  </p>
                </div>
              </>
            )}
            <div className="flex items-start gap-2">
              {analysis.readability >= 70 ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm">
                  Readability score: <strong>{analysis.readability}/100</strong>
                </p>
                <p className="text-xs text-gray-500">Keep sentences concise for better readability</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-3 font-medium transition ${
            activeTab === 'settings'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          SEO Settings
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 px-4 py-3 font-medium transition ${
            activeTab === 'preview'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 px-4 py-3 font-medium transition ${
            activeTab === 'analysis'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Analysis
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Focus Keyword</label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => onSeoChange('focusKeyword', e.target.value)}
                placeholder="main keyword to optimize for"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">The main keyword you want to rank for</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                SEO Title
                <span className="ml-2 text-xs text-gray-500">
                  ({analysis.titleLength} characters)
                </span>
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => onSeoChange('seoTitle', e.target.value)}
                placeholder={title || "SEO optimized title..."}
                maxLength={70}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 30-60 characters. Leave empty to use post title.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                SEO Description
                <span className="ml-2 text-xs text-gray-500">
                  ({analysis.descriptionLength} characters)
                </span>
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => onSeoChange('seoDescription', e.target.value)}
                placeholder={excerpt || "Meta description for search engines..."}
                rows={3}
                maxLength={170}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 120-160 characters. Leave empty to use excerpt.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SEO Keywords</label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => onSeoChange('seoKeywords', e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated keywords (5-10 recommended)</p>
            </div>
          </div>
        )}

        {activeTab === 'preview' && renderPreview()}
        {activeTab === 'analysis' && renderAnalysis()}
      </div>
    </div>
  )
}
