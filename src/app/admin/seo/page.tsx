'use client'

import { useState } from 'react'
import { Search, CheckCircle, AlertTriangle, XCircle, TrendingUp, FileText, Link as LinkIcon, Code, Globe, Zap, BarChart3 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SEOToolsPage() {
  const [url, setUrl] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('analyzer')

  const analyzeSEO = async () => {
    if (!url) {
      toast.error('Please enter a URL or post slug')
      return
    }

    setIsAnalyzing(true)
    try {
      const { data } = await axios.post('/api/admin/seo/analyze', { url })
      setAnalysis(data)
    } catch (error) {
      toast.error('Failed to analyze SEO')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSEOScore = () => {
    if (!analysis) return 0
    const { checks } = analysis
    const passed = Object.values(checks).filter(v => v === true).length
    return Math.round((passed / Object.keys(checks).length) * 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const CheckItem = ({ label, passed, message }: any) => (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
      {passed ? (
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <div className="font-medium mb-1">{label}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{message}</div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Tools</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze and optimize your content for search engines
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link 
          href="/admin/seo/schema"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white hover:shadow-lg transition-all cursor-pointer group"
        >
          <Code className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold mb-2">Schema Generator</h3>
          <p className="text-sm text-blue-100">Generate structured data markup</p>
        </Link>

        <div 
          onClick={() => setActiveTab('analyzer')}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white hover:shadow-lg transition-all cursor-pointer group"
        >
          <Search className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold mb-2">SEO Analyzer</h3>
          <p className="text-sm text-green-100">Analyze page optimization</p>
        </div>

        <div 
          onClick={() => setActiveTab('tools')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white hover:shadow-lg transition-all cursor-pointer group"
        >
          <Zap className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold mb-2">Quick Tools</h3>
          <p className="text-sm text-purple-100">Sitemap, links, keywords</p>
        </div>

        <div 
          onClick={() => setActiveTab('preview')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white hover:shadow-lg transition-all cursor-pointer group"
        >
          <Globe className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold mb-2">Social Preview</h3>
          <p className="text-sm text-orange-100">See how posts look shared</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'analyzer'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Search className="h-5 w-5" />
              SEO Analyzer
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'tools'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Tools
            </div>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'preview'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Globe className="h-5 w-5" />
              Social Preview
            </div>
          </button>
        </div>
      </div>

      {/* Analyzer Tab */}
      {activeTab === 'analyzer' && (
        <div>
          {/* SEO Analyzer */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">SEO Analyzer</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter URL or post slug..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
              <button
                onClick={analyzeSEO}
                disabled={isAnalyzing}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {analysis && (
            <>
              {/* SEO Score */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 mb-8 text-center">
                <div className={`text-6xl font-bold mb-4 ${getScoreColor(getSEOScore())}`}>
                  {getSEOScore()}
                </div>
                <div className="text-xl font-semibold mb-2">SEO Score</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {getSEOScore() >= 80 ? 'Excellent! Your SEO is on point.' :
                   getSEOScore() >= 60 ? 'Good, but there\'s room for improvement.' :
                   'Needs work. Follow the recommendations below.'}
                </p>
              </div>

              {/* SEO Checks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-bold mb-4">Title & Meta</h3>
                  <div className="space-y-3">
                    <CheckItem
                      label="Title Tag Length"
                      passed={analysis.checks.titleLength}
                      message={`${analysis.titleLength} characters (50-60 recommended)`}
                    />
                    <CheckItem
                      label="Meta Description"
                      passed={analysis.checks.metaDescription}
                      message={`${analysis.metaDescriptionLength} characters (150-160 recommended)`}
                    />
                    <CheckItem
                      label="H1 Tag Present"
                      passed={analysis.checks.h1Tag}
                      message={analysis.checks.h1Tag ? 'H1 tag found' : 'Missing H1 tag'}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-bold mb-4">Content Quality</h3>
                  <div className="space-y-3">
                    <CheckItem
                      label="Word Count"
                      passed={analysis.checks.wordCount}
                      message={`${analysis.wordCount} words (300+ recommended)`}
                    />
                    <CheckItem
                      label="Keyword Density"
                      passed={analysis.checks.keywordDensity}
                      message={`${analysis.keywordDensity}% (1-3% recommended)`}
                    />
                    <CheckItem
                      label="Internal Links"
                      passed={analysis.checks.internalLinks}
                      message={`${analysis.internalLinks} internal links found`}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-bold mb-4">Images & Media</h3>
                  <div className="space-y-3">
                    <CheckItem
                      label="Image Alt Tags"
                      passed={analysis.checks.imageAlt}
                      message={`${analysis.imagesWithAlt}/${analysis.totalImages} images have alt tags`}
                    />
                    <CheckItem
                      label="Featured Image"
                      passed={analysis.checks.featuredImage}
                      message={analysis.checks.featuredImage ? 'Featured image set' : 'No featured image'}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-bold mb-4">Technical SEO</h3>
                  <div className="space-y-3">
                    <CheckItem
                      label="Mobile Friendly"
                      passed={analysis.checks.mobileFriendly}
                      message="Page is responsive"
                    />
                    <CheckItem
                      label="Page Speed"
                      passed={analysis.checks.pageSpeed}
                      message={`Load time: ${analysis.loadTime}ms`}
                    />
                    <CheckItem
                      label="Schema Markup"
                      passed={analysis.checks.schemaMarkup}
                      message={analysis.checks.schemaMarkup ? 'Schema markup detected' : 'No schema markup found'}
                    />
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick Tools Tab */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
            <FileText className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Sitemap Generator</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Generate and update your XML sitemap for search engines
            </p>
            <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              Generate Sitemap
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Last generated: Never
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
            <LinkIcon className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Broken Link Checker</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Find and fix broken internal and external links
            </p>
            <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              Check Links
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Last checked: Never
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
            <Search className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Keyword Research</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Find the best keywords for your content strategy
            </p>
            <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              Research Keywords
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Analyze keyword opportunities
            </p>
          </div>

          <Link href="/admin/seo/schema" className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
            <Code className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Schema Generator</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Generate structured data markup (JSON-LD)
            </p>
            <div className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-center">
              Open Generator
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Article, Product, FAQ, Breadcrumb
            </p>
          </Link>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
            <Globe className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Robots.txt Editor</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Control how search engines crawl your site
            </p>
            <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              Edit Robots.txt
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Manage crawler access
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
            <BarChart3 className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">SEO Monitoring</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Track your SEO performance over time
            </p>
            <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              View Reports
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Rankings, traffic, indexing
            </p>
          </div>
        </div>
      )}

      {/* Social Preview Tab */}
      {activeTab === 'preview' && (
        <div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Preview Your Content</h2>
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Enter URL or post slug to preview..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
              <button
                onClick={analyzeSEO}
                disabled={isAnalyzing}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isAnalyzing ? 'Loading...' : 'Preview'}
              </button>
            </div>
          </div>

          {analysis && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-bold mb-4">Social Media Preview</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Google Preview */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">Google Search</h4>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4">
                    <div className="text-sm text-blue-600 mb-1">{url.includes('http') ? url : 'https://yoursite.com/' + url}</div>
                    <div className="text-lg text-blue-800 dark:text-blue-400 font-medium mb-1 hover:underline cursor-pointer">
                      {analysis.checks.titleLength ? url : 'Your Page Title - Make it compelling!'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {analysis.metaDescriptionLength > 0 ? 'Your meta description appears here. Make it engaging to increase click-through rates...' : 'No meta description provided'}
                    </div>
                  </div>
                </div>

                {/* Facebook Preview */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">Facebook/LinkedIn</h4>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-200 dark:bg-gray-700 h-40 flex items-center justify-center text-gray-500">
                      {analysis.checks.featuredImage ? '📷 Featured Image' : 'No Image'}
                    </div>
                    <div className="p-3">
                      <div className="text-xs text-gray-500 mb-1 uppercase">yoursite.com</div>
                      <div className="font-semibold mb-1 line-clamp-1">
                        {analysis.titleLength > 0 ? 'Your Post Title' : 'Add a title'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {analysis.metaDescriptionLength > 0 ? 'Your post description...' : 'Add a description'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Twitter Preview */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">Twitter/X</h4>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-200 dark:bg-gray-700 h-48 flex items-center justify-center text-gray-500">
                      {analysis.checks.featuredImage ? '📷 Featured Image' : 'No Image'}
                    </div>
                    <div className="p-3 border-t border-gray-300 dark:border-gray-700">
                      <div className="font-semibold mb-1 line-clamp-1">
                        {analysis.titleLength > 0 ? 'Your Post Title' : 'Add a title'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {analysis.metaDescriptionLength > 0 ? 'Your description...' : 'Add a description'}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">🔗 yoursite.com</div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Preview */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">WhatsApp/iMessage</h4>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="bg-gray-200 dark:bg-gray-700 w-20 h-20 rounded flex-shrink-0 flex items-center justify-center text-gray-500 text-xs">
                        {analysis.checks.featuredImage ? '📷' : 'No Image'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold mb-1 line-clamp-2 text-sm">
                          {analysis.titleLength > 0 ? 'Your Post Title Goes Here' : 'Add a title'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {analysis.metaDescriptionLength > 0 ? 'Description...' : 'Add description'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">yoursite.com</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
