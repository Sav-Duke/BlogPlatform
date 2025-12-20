import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CommentSection from '@/components/CommentSection'
import ReadingProgress from '@/components/ReadingProgress'
import ScrollToTop from '@/components/ScrollToTop'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, Eye, Tag, User } from 'lucide-react'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      coverImage: true,
      publishedAt: true,
      updatedAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!post) return {}

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt
  const url = `https://yourdomain.com/blog/${params.slug}`
  const imageUrl = post.coverImage || 'https://yourdomain.com/og-default.jpg'

  return {
    title,
    description,
    keywords: post.seoKeywords,
    authors: [{ name: post.author.name || 'Animal Hub' }],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Animal Hub',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name || 'Animal Hub'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@animalhub',
      site: '@animalhub',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  }
}

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          website: true,
          twitter: true,
        },
      },
      categories: true,
      tags: true,
      comments: {
        where: { approved: true, parentId: null },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!post || post.status !== 'PUBLISHED') {
    return null
  }

  // Increment view count
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  })

  return post
}

async function getRelatedPosts(postId: string, categoryIds: string[]) {
  return await prisma.post.findMany({
    where: {
      id: { not: postId },
      status: 'PUBLISHED',
      categories: {
        some: {
          id: { in: categoryIds },
        },
      },
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      categories: true,
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(
    post.id,
    post.categories.map((c) => c.id)
  )

  // Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.coverImage || '',
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name || 'Animal Hub',
      url: post.author.website || '',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Animal Hub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yourdomain.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://yourdomain.com/blog/${params.slug}`,
    },
    keywords: post.seoKeywords || '',
    articleSection: post.categories.map((c) => c.name).join(', '),
    wordCount: post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Reading Progress Bar */}
      <ReadingProgress />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Navbar />

      <article className="flex-1">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-[400px] md:h-[500px]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="text-sm font-semibold px-4 py-1.5 rounded-full"
                  style={{
                    backgroundColor: category.color ? `${category.color}20` : '#3b82f620',
                    color: category.color || '#3b82f6',
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b">
              <div className="flex items-center gap-3">
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || 'Author'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {post.author.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {post.author.bio?.slice(0, 50)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt!)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount} views</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap mb-12 pb-12 border-b">
                <Tag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Author Bio */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 mb-12">
              <div className="flex items-start gap-4">
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || 'Author'}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                    {post.author.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold mb-2">About {post.author.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{post.author.bio}</p>
                  {post.author.website && (
                    <a
                      href={post.author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <CommentSection postId={post.id} initialComments={post.comments} />
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
                  >
                    {relatedPost.coverImage && (
                      <div className="relative h-48">
                        <Image
                          src={relatedPost.coverImage}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
      </article>

      <Footer />
    </div>
  )
}
