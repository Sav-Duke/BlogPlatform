'use client'

import { useState } from 'react'
import { Code, Copy, CheckCircle, Globe, FileText, Star, Calendar, Users, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SchemaGeneratorPage() {
  const [schemaType, setSchemaType] = useState('article')
  const [formData, setFormData] = useState<any>({
    headline: '',
    description: '',
    author: '',
    datePublished: '',
    dateModified: '',
    imageUrl: '',
    publisher: 'Your Blog Name',
    rating: '5',
  })

  const generateSchema = () => {
    let schema: any = {
      '@context': 'https://schema.org',
    }

    switch (schemaType) {
      case 'article':
        schema = {
          ...schema,
          '@type': 'Article',
          headline: formData.headline,
          description: formData.description,
          author: {
            '@type': 'Person',
            name: formData.author,
          },
          datePublished: formData.datePublished,
          dateModified: formData.dateModified || formData.datePublished,
          image: formData.imageUrl,
          publisher: {
            '@type': 'Organization',
            name: formData.publisher,
            logo: {
              '@type': 'ImageObject',
              url: 'https://yoursite.com/logo.png',
            },
          },
        }
        break

      case 'product':
        schema = {
          ...schema,
          '@type': 'Product',
          name: formData.headline,
          description: formData.description,
          image: formData.imageUrl,
          offers: {
            '@type': 'Offer',
            price: formData.price || '0',
            priceCurrency: 'USD',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: formData.rating,
            reviewCount: '1',
          },
        }
        break

      case 'breadcrumb':
        schema = {
          ...schema,
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://yoursite.com/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: formData.headline,
              item: 'https://yoursite.com/page',
            },
          ],
        }
        break

      case 'faq':
        schema = {
          ...schema,
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Question 1?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Answer 1',
              },
            },
          ],
        }
        break
    }

    return JSON.stringify(schema, null, 2)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSchema())
    toast.success('Schema copied to clipboard!')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schema Markup Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate structured data for better search engine understanding
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Configuration */}
        <div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Schema Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSchemaType('article')}
                className={`p-4 rounded-lg border-2 transition ${
                  schemaType === 'article'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <FileText className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Article</div>
              </button>
              <button
                onClick={() => setSchemaType('product')}
                className={`p-4 rounded-lg border-2 transition ${
                  schemaType === 'product'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <Star className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Product</div>
              </button>
              <button
                onClick={() => setSchemaType('breadcrumb')}
                className={`p-4 rounded-lg border-2 transition ${
                  schemaType === 'breadcrumb'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <Globe className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Breadcrumb</div>
              </button>
              <button
                onClick={() => setSchemaType('faq')}
                className={`p-4 rounded-lg border-2 transition ${
                  schemaType === 'faq'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <Users className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">FAQ</div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4">Configure</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {schemaType === 'product' ? 'Product Name' : 'Headline'}
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  placeholder="Enter headline..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  rows={3}
                  placeholder="Enter description..."
                />
              </div>

              {schemaType === 'article' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Author Name</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date Published</label>
                      <input
                        type="date"
                        value={formData.datePublished}
                        onChange={(e) => setFormData({ ...formData, datePublished: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date Modified</label>
                      <input
                        type="date"
                        value={formData.dateModified}
                        onChange={(e) => setFormData({ ...formData, dateModified: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                </>
              )}

              {schemaType === 'product' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (USD)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      placeholder="29.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Generated Code */}
        <div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Generated Schema</h3>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono">
                <code>{generateSchema()}</code>
              </pre>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium mb-1">How to use</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Add this schema markup to your page's HTML within a <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">&lt;script type="application/ld+json"&gt;</code> tag in the <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">&lt;head&gt;</code> section.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <Star className="h-8 w-8 mb-3" />
          <h3 className="font-bold mb-2">Rich Results</h3>
          <p className="text-sm text-blue-100">
            Appear in Google's rich results with enhanced visuals and information
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <TrendingUp className="h-8 w-8 mb-3" />
          <h3 className="font-bold mb-2">Higher CTR</h3>
          <p className="text-sm text-green-100">
            Structured data can increase click-through rates by up to 30%
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <Globe className="h-8 w-8 mb-3" />
          <h3 className="font-bold mb-2">Better Understanding</h3>
          <p className="text-sm text-purple-100">
            Help search engines understand your content more accurately
          </p>
        </div>
      </div>
    </div>
  )
}
