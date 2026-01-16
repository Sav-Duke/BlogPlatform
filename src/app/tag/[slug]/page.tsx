import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PostCard from '@/components/PostCard'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tag = await prisma.tag.findUnique({
    where: { slug: params.slug },
  })

  return {
    title: tag ? `${tag.name} | AnimalHub Blog` : 'Tag Not Found',
    description: tag ? `Posts tagged with ${tag.name}` : '',
  }
}

async function getTag(slug: string) {
  return prisma.tag.findUnique({
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

export default async function TagPage({ params }: { params: { slug: string } }) {
  const tag = await getTag(params.slug)

  if (!tag) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-block px-6 py-2 rounded-full mb-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200">
              <span className="font-bold text-lg">#{tag.name}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              {tag._count.posts} {tag._count.posts === 1 ? 'post' : 'posts'}
            </p>
          </div>

          {tag.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tag.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No posts for this tag yet.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
