import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic' // Skip pre-rendering at build time

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  try {
    // Get all published posts
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED', publishedAt: { not: null } },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 5000, // Limit for performance
    })

    // Get all categories with posts
    const categories = await prisma.category.findMany({
      where: {
        posts: {
          some: {
            status: 'PUBLISHED',
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    // Get all tags with posts
    const tags = await prisma.tag.findMany({
      where: {
        posts: {
          some: {
            status: 'PUBLISHED',
          },
        },
      },
      select: {
        slug: true,
        createdAt: true,
      },
    })

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ]

    // Post pages
    const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Tag pages
    const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
      url: `${baseUrl}/tag/${tag.slug}`,
      lastModified: tag.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...postPages, ...categoryPages, ...tagPages]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    // Return at least the static pages
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
