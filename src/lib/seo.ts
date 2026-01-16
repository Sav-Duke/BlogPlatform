import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  noindex?: boolean
}

const defaultConfig = {
  siteName: 'BlogPlatform',
  siteUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  defaultImage: '/og-image.png',
  defaultDescription: 'A powerful blog platform for content creators',
  twitterHandle: '@yourblog',
}

/**
 * Generate comprehensive SEO metadata
 */
export function generateSEO(config: SEOConfig): Metadata {
  const {
    title,
    description = defaultConfig.defaultDescription,
    keywords = [],
    image = defaultConfig.defaultImage,
    url,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    noindex = false,
  } = config

  const fullTitle = title ? `${title} | ${defaultConfig.siteName}` : defaultConfig.siteName
  const fullUrl = url ? `${defaultConfig.siteUrl}${url}` : defaultConfig.siteUrl
  const fullImage = image.startsWith('http') ? image : `${defaultConfig.siteUrl}${image}`

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    creator: author,
    publisher: defaultConfig.siteName,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: defaultConfig.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type === 'article' ? 'article' : 'website',
      ...(type === 'article' && publishedTime && {
        publishedTime,
        modifiedTime: modifiedTime || publishedTime,
        section,
        tags,
        authors: author ? [author] : undefined,
      }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: defaultConfig.twitterHandle,
      creator: defaultConfig.twitterHandle,
      title: fullTitle,
      description,
      images: [fullImage],
    },

    // Additional meta tags
    alternates: {
      canonical: fullUrl,
    },
  }

  return metadata
}

/**
 * Generate JSON-LD structured data for blog posts
 */
export function generateArticleSchema(config: {
  title: string
  description: string
  url: string
  image: string
  publishedTime: string
  modifiedTime?: string
  author: {
    name: string
    url?: string
  }
  keywords?: string[]
}) {
  const baseUrl = defaultConfig.siteUrl

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: config.title,
    description: config.description,
    image: config.image.startsWith('http') ? config.image : `${baseUrl}${config.image}`,
    url: `${baseUrl}${config.url}`,
    datePublished: config.publishedTime,
    dateModified: config.modifiedTime || config.publishedTime,
    author: {
      '@type': 'Person',
      name: config.author.name,
      ...(config.author.url && { url: config.author.url }),
    },
    publisher: {
      '@type': 'Organization',
      name: defaultConfig.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}${defaultConfig.defaultImage}`,
      },
    },
    ...(config.keywords && config.keywords.length > 0 && {
      keywords: config.keywords.join(', '),
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}${config.url}`,
    },
  }
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteSchema() {
  const baseUrl = defaultConfig.siteUrl

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultConfig.siteName,
    description: defaultConfig.defaultDescription,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationSchema(config?: {
  name?: string
  logo?: string
  sameAs?: string[]
}) {
  const baseUrl = defaultConfig.siteUrl

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config?.name || defaultConfig.siteName,
    url: baseUrl,
    logo: config?.logo ? `${baseUrl}${config.logo}` : `${baseUrl}${defaultConfig.defaultImage}`,
    ...(config?.sameAs && config.sameAs.length > 0 && {
      sameAs: config.sameAs,
    }),
  }
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  const baseUrl = defaultConfig.siteUrl

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

/**
 * Calculate SEO score based on content analysis
 */
export function calculateSEOScore(config: {
  title: string
  description?: string
  content: string
  keywords?: string[]
  images?: number
}): {
  score: number
  issues: string[]
  suggestions: string[]
} {
  let score = 100
  const issues: string[] = []
  const suggestions: string[] = []

  // Title checks
  if (!config.title) {
    score -= 20
    issues.push('Missing title')
  } else if (config.title.length < 30) {
    score -= 5
    suggestions.push('Title is too short (recommended: 30-60 characters)')
  } else if (config.title.length > 60) {
    score -= 5
    suggestions.push('Title is too long (recommended: 30-60 characters)')
  }

  // Description checks
  if (!config.description) {
    score -= 15
    issues.push('Missing meta description')
  } else if (config.description.length < 120) {
    score -= 5
    suggestions.push('Description is too short (recommended: 120-160 characters)')
  } else if (config.description.length > 160) {
    score -= 5
    suggestions.push('Description is too long (recommended: 120-160 characters)')
  }

  // Content length checks
  const wordCount = config.content.split(/\s+/).length
  if (wordCount < 300) {
    score -= 10
    suggestions.push('Content is too short (recommended: at least 300 words)')
  }

  // Keyword checks
  if (!config.keywords || config.keywords.length === 0) {
    score -= 10
    suggestions.push('No keywords defined')
  }

  // Image checks
  if (!config.images || config.images === 0) {
    score -= 5
    suggestions.push('No images found in content')
  }

  // Heading checks (basic - would need actual HTML parsing for full analysis)
  const hasH1 = config.content.includes('<h1') || config.content.includes('# ')
  if (!hasH1) {
    score -= 10
    issues.push('Missing H1 heading')
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    suggestions,
  }
}

/**
 * Extract keywords from content
 */
export function extractKeywords(content: string, limit: number = 10): string[] {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, ' ')
  
  // Convert to lowercase and split into words
  const words = text.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3) // Only words longer than 3 characters

  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have',
    'will', 'your', 'about', 'there', 'their', 'would', 'could',
    'what', 'when', 'where', 'which', 'while', 'these', 'those',
  ])

  // Count word frequency
  const frequency: Record<string, number> = {}
  words.forEach(word => {
    if (!stopWords.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1
    }
  })

  // Sort by frequency and return top N
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word)
}
