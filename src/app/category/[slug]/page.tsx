import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PostCard from '@/components/PostCard'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  })

  return {
    title: category ? `${category.name} | Superior Blog` : 'Category Not Found',
    description: category?.description || '',
  }
}

async function getCategory(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
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
      },
      _count: {
        select: { posts: true },
      },
    },
  })
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          {/* Category Header */}
          <div className="text-center mb-12">
            <div
              className="inline-block px-6 py-2 rounded-full mb-4"
              style={{
                backgroundColor: category.color ? `${category.color}20` : '#3b82f620',
                color: category.color || '#3b82f6',
              }}
            >
              <span className="font-bold text-lg">{category.name}</span>
            </div>
            {category.description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              {category._count.posts} {category._count.posts === 1 ? 'post' : 'posts'}
            </p>
          </div>

          {/* Posts */}
          {category.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No posts in this category yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
