import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Newsletter from '@/components/Newsletter'
import ScrollToTop from '@/components/ScrollToTop'
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react'

export const revalidate = 60 // Revalidate every 60 seconds

async function getFeaturedPosts() {
  return await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      featured: true,
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      categories: true,
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  })
}

async function getRecentPosts() {
  return await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      categories: true,
      tags: true,
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  })
}

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
    take: 8,
  })
}

export default async function Home() {
  const [featuredPosts, recentPosts, categories] = await Promise.all([
    getFeaturedPosts(),
    getRecentPosts(),
    getCategories(),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-6">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium">Welcome to Animal Hub</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Your Complete Animal Care Resource
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Expert insights on animal health, livestock production, pet care, and veterinary medicine. Everything you need for animal wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog"
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium inline-flex items-center justify-center gap-2"
              >
                Explore Articles
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-600 dark:hover:border-primary-600 transition font-medium"
              >
                Start Writing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-6 w-6 text-primary-600" />
              <h2 className="text-3xl font-bold">Featured Stories</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-700 group"
                >
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary-600 transition">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category._count.posts} {category._count.posts === 1 ? 'post' : 'posts'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Latest Articles</h2>
            <Link
              href="/blog"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-2"
            >
              View All
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Newsletter />
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  )
}
