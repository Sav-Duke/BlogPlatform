// EXAMPLE: How to display a blog post with the selected theme

import { prisma } from '@/lib/prisma'
import ThemedPost from '@/components/ThemedPost'
import { notFound } from 'next/navigation'
import { BlogTheme } from '@/components/ThemeSelector'

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      },
      categories: {
        select: {
          name: true,
          slug: true
        }
      },
      tags: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  })

  if (!post || post.status !== 'PUBLISHED') {
    notFound()
  }

  // Increment view count
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } }
  })

  return (
    <ThemedPost
      post={{
        id: Number(post.id),
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        coverImage: post.coverImage || '',
        author: {
          name: post.author?.name || '',
          image: post.author?.image || undefined,
        },
        publishedAt: post.publishedAt!,
        categories: post.categories,
        tags: post.tags,
        viewCount: post.viewCount,
        readTime: post.readTime
      }}
      theme={((post.theme || 'minimalist') as BlogTheme)}
    />
  )
}

/*
 * HOW IT WORKS:
 * 
 * 1. Fetches post from database with all relationships
 * 2. Checks if post exists and is published
 * 3. Increments view count
 * 4. Passes post data to ThemedPost component
 * 5. ThemedPost automatically renders in the selected theme
 * 
 * THEMES AVAILABLE:
 * - minimalist: Clean, typography-focused
 * - magazine: News-style with sidebar
 * - photography: Full-screen image-heavy
 * - dark-tech: Dark mode, code-friendly
 * - elegant: Serif fonts, sophisticated
 * - creative: Bold colors, artistic
 * 
 * Each post can have a different theme!
 * The reader sees the post exactly how you designed it.
 */
