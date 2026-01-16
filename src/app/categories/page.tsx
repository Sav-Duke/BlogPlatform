import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import Link from 'next/link'
import { FolderOpen } from 'lucide-react'

export const dynamic = 'force-dynamic' // Don't pre-render at build time

export const metadata = {
  title: 'Categories | Superior Blog',
  description: 'Browse all blog categories',
}

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: { status: 'PUBLISHED' },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
              <FolderOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Categories</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Explore articles by topic
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group bg-white dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-800 hover:border-primary-600 dark:hover:border-primary-600 hover:shadow-lg transition"
              >
                <div
                  className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                  style={{
                    backgroundColor: category.color ? `${category.color}20` : '#3b82f620',
                  }}
                >
                  <FolderOpen
                    className="h-6 w-6"
                    style={{ color: category.color || '#3b82f6' }}
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {category._count.posts} {category._count.posts === 1 ? 'post' : 'posts'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <ScrollToTop />
    </div>
  )
}
