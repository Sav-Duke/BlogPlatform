import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['AUTHOR', 'EDITOR', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { url } = await req.json()

    // Extract slug from URL or use as slug
    const slug = url.replace(/^https?:\/\/[^\/]+\//, '').replace(/^blog\//, '')

    // Fetch post
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        categories: true,
        tags: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Analyze SEO factors
    const titleLength = post.seoTitle?.length || post.title.length
    const metaDescriptionLength = post.seoDescription?.length || post.excerpt?.length || 0
    const wordCount = post.content.split(/\s+/).length
    const hasH1 = post.content.includes('<h1') || post.content.includes('# ')
    
    // Count images and alt tags
    const imageMatches = post.content.match(/<img[^>]+>/g) || []
    const totalImages = imageMatches.length
    const imagesWithAlt = imageMatches.filter(img => img.includes('alt=')).length

    // Count links
    const internalLinks = (post.content.match(/href="[^"]*"/g) || [])
      .filter(link => !link.includes('http')).length

    // Calculate keyword density (simplified)
    const keywords = post.seoKeywords?.split(',') || []
    const firstKeyword = keywords[0]?.trim().toLowerCase() || ''
    const keywordCount = firstKeyword 
      ? (post.content.toLowerCase().match(new RegExp(firstKeyword, 'g')) || []).length 
      : 0
    const keywordDensity = wordCount > 0 ? ((keywordCount / wordCount) * 100).toFixed(2) : 0

    // SEO Checks
    const checks = {
      titleLength: titleLength >= 50 && titleLength <= 60,
      metaDescription: metaDescriptionLength >= 150 && metaDescriptionLength <= 160,
      h1Tag: hasH1,
      wordCount: wordCount >= 300,
      keywordDensity: Number(keywordDensity) >= 1 && Number(keywordDensity) <= 3,
      internalLinks: internalLinks >= 2,
      imageAlt: totalImages === 0 || imagesWithAlt === totalImages,
      featuredImage: !!post.coverImage,
      mobileFriendly: true, // Assume true for Next.js app
      pageSpeed: true, // Mock - integrate with real performance API
      schemaMarkup: true, // Mock - check if schema exists
    }

    // Generate recommendations
    const recommendations = []
    if (!checks.titleLength) {
      recommendations.push(`Optimize title length. Current: ${titleLength} characters. Aim for 50-60.`)
    }
    if (!checks.metaDescription) {
      recommendations.push(`Optimize meta description. Current: ${metaDescriptionLength} characters. Aim for 150-160.`)
    }
    if (!checks.h1Tag) {
      recommendations.push('Add an H1 heading to your content.')
    }
    if (!checks.wordCount) {
      recommendations.push(`Increase content length. Current: ${wordCount} words. Aim for at least 300.`)
    }
    if (!checks.keywordDensity) {
      recommendations.push(`Adjust keyword density. Current: ${keywordDensity}%. Aim for 1-3%.`)
    }
    if (!checks.internalLinks) {
      recommendations.push(`Add more internal links. Current: ${internalLinks}. Aim for at least 2.`)
    }
    if (!checks.imageAlt) {
      recommendations.push(`Add alt tags to all images. ${imagesWithAlt}/${totalImages} images have alt tags.`)
    }
    if (!checks.featuredImage) {
      recommendations.push('Set a featured image for better social sharing.')
    }
    if (!checks.schemaMarkup) {
      recommendations.push('Add schema markup for better search engine understanding.')
    }

    return NextResponse.json({
      checks,
      titleLength,
      metaDescriptionLength,
      wordCount,
      keywordDensity,
      internalLinks,
      totalImages,
      imagesWithAlt,
      loadTime: Math.floor(Math.random() * 1000) + 200, // Mock
      recommendations: recommendations.length > 0 ? recommendations : ['Great! Your SEO is optimized.'],
    })
  } catch (error) {
    console.error('SEO analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze SEO' },
      { status: 500 }
    )
  }
}
