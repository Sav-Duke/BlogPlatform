import { BlogTheme } from './ThemeSelector'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  excerpt?: string
  content: string
  coverImage?: string
  author: { name: string; image?: string }
  publishedAt: Date
  categories: { name: string; slug: string }[]
  tags: { name: string; slug: string }[]
  viewCount: number
  readTime?: number
}

interface ThemedPostProps {
  post: Post
  theme: BlogTheme
}

// Minimalist Theme (World-Class, Enhanced Interactions)
const MinimalistPost = ({ post }: { post: Post }) => (
  <article className="max-w-3xl mx-auto px-6 py-24 bg-white/90 dark:bg-gray-950/95 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-500 animate-fade-in group">
    <header className="mb-16 text-center">
      <h1 className="text-7xl font-extrabold mb-8 leading-tight tracking-tight text-gray-900 dark:text-white font-sans drop-shadow-xl animate-slide-up">
        <span className="inline-block align-top text-5xl text-primary-500 font-serif mr-2 animate-bounce">“</span>{post.title}
      </h1>
      <div className="flex items-center justify-center gap-4 text-gray-500 dark:text-gray-400 text-lg">
        <time className="hover:underline transition-colors duration-200">{formatDate(post.publishedAt)}</time>
        <span>•</span>
        <span>{post.readTime || 5} min read</span>
        <span>•</span>
        <span className="text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-2">
          {post.author.image && (
            <Image src={post.author.image} alt={post.author.name} width={32} height={32} className="rounded-full border border-gray-300 dark:border-gray-700 shadow" />
          )}
          {post.author.name}
        </span>
      </div>
    </header>
    <div 
      className="prose prose-2xl dark:prose-invert max-w-none mx-auto text-gray-800 dark:text-gray-200 leading-relaxed animate-fade-in"
      dangerouslySetInnerHTML={{ __html: post.content }}
    />
    <div className="mt-12 flex flex-wrap gap-2 justify-center">
      {post.tags.map(tag => (
        <Link 
          key={tag.slug}
          href={`/tag/${tag.slug}`}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors duration-200 shadow-sm focus:ring-2 focus:ring-primary-300"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  </article>
)

// Magazine Theme (World-Class, Enhanced Interactions)
const MagazinePost = ({ post }: { post: Post }) => (
  <article className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-red-900/30 min-h-screen animate-fade-in">
    {post.coverImage && (
      <div className="relative h-[60vh] mb-10 rounded-b-4xl overflow-hidden shadow-2xl border-b-8 border-red-200 dark:border-red-900/40 group">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-2 mb-4">
              {post.categories.slice(0, 2).map(cat => (
                <span key={cat.slug} className="px-4 py-2 bg-red-600/90 text-base font-bold uppercase rounded-full shadow-lg tracking-widest hover:scale-105 transition-transform">
                  {cat.name}
                </span>
              ))}
            </div>
            <h1 className="text-7xl font-extrabold mb-4 drop-shadow-2xl tracking-tight font-serif animate-slide-up">
              {post.title}
            </h1>
            <div className="flex items-center gap-4">
              {post.author.image && (
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  width={56}
                  height={56}
                  className="rounded-full border-4 border-white shadow-xl"
                />
              )}
              <div>
                <div className="font-semibold text-xl">{post.author.name}</div>
                <div className="text-base opacity-80">{formatDate(post.publishedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 animate-fade-in">
          <div 
            className="prose prose-2xl dark:prose-invert max-w-none font-serif text-gray-900 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
        <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-10">
            <div className="bg-white/90 dark:bg-gray-800/90 p-10 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
              <h3 className="font-bold mb-4 text-xl">About the Author</h3>
              {post.author.image && (
                <Image src={post.author.image} alt={post.author.name} width={48} height={48} className="rounded-full border-2 border-red-400 dark:border-red-800 shadow mb-2" />
              )}
              <p className="text-lg font-medium">{post.author.name}</p>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 p-10 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
              <h3 className="font-bold mb-4 text-xl">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Link 
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="text-sm px-4 py-2 bg-orange-100 dark:bg-orange-900/40 rounded-full font-semibold hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors duration-200 shadow focus:ring-2 focus:ring-orange-300"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </article>
)

// Photography Theme (World-Class, Enhanced Interactions)
const PhotographyPost = ({ post }: { post: Post }) => (
  <article className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white min-h-screen animate-fade-in">
    {post.coverImage && (
      <div className="relative h-[70vh] mb-14 rounded-b-4xl overflow-hidden shadow-2xl border-8 border-white/10 group">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover w-full h-full scale-105 group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white/90 bg-gradient-to-t from-black/60 to-transparent animate-slide-up">
          <h1 className="text-7xl font-extrabold mb-2 tracking-tight font-sans drop-shadow-2xl">
            {post.title}
          </h1>
          <div className="flex items-center gap-6 text-gray-200 text-lg">
            <span className="font-semibold flex items-center gap-2">
              {post.author.image && (
                <Image src={post.author.image} alt={post.author.name} width={36} height={36} className="rounded-full border border-white/30 shadow" />
              )}
              {post.author.name}
            </span>
            <span>•</span>
            <time>{formatDate(post.publishedAt)}</time>
          </div>
        </div>
      </div>
    )}
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div 
        className="prose prose-2xl prose-invert max-w-none mx-auto text-gray-100 leading-relaxed animate-fade-in"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="mt-14 flex flex-wrap gap-2 justify-center">
        {post.tags.map(tag => (
          <Link 
            key={tag.slug}
            href={`/tag/${tag.slug}`}
            className="px-4 py-2 bg-gray-800/80 border border-gray-700 rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors duration-200 shadow focus:ring-2 focus:ring-gray-400"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  </article>
)

// Dark Tech Theme (World-Class, Enhanced Interactions)
const DarkTechPost = ({ post }: { post: Post }) => (
  <article className="bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 text-gray-100 min-h-screen animate-fade-in">
    <div className="max-w-4xl mx-auto px-6 py-24">
      <header className="mb-16 text-center">
        <div className="flex gap-3 mb-8 justify-center">
          {post.categories.slice(0, 2).map(cat => (
            <span 
              key={cat.slug} 
              className="px-5 py-2 bg-blue-700/90 text-base font-mono uppercase rounded-full shadow-lg tracking-widest hover:scale-105 transition-transform"
            >
              {cat.name}
            </span>
          ))}
        </div>
        <h1 className="text-7xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight font-mono drop-shadow-2xl animate-slide-up">
          {post.title}
        </h1>
        <div className="flex items-center justify-center gap-8 font-mono text-lg text-blue-300">
          <span className="flex items-center gap-2">
            {post.author.image && (
              <Image src={post.author.image} alt={post.author.name} width={36} height={36} className="rounded-full border border-blue-400/40 shadow" />
            )}
            {post.author.name}
          </span>
          <span>|</span>
          <time>{formatDate(post.publishedAt)}</time>
          <span>|</span>
          <span>{post.viewCount} views</span>
        </div>
      </header>
      {post.coverImage && (
        <div className="relative h-96 mb-14 rounded-3xl overflow-hidden border-4 border-blue-800/40 shadow-2xl group">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      )}
      <div 
        className="prose prose-2xl prose-invert max-w-none mx-auto [&>pre]:bg-gray-900 [&>pre]:border [&>pre]:border-blue-900 animate-fade-in"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="mt-14 flex flex-wrap gap-2 justify-center">
        {post.tags.map(tag => (
          <Link 
            key={tag.slug}
            href={`/tag/${tag.slug}`}
            className="px-4 py-2 bg-blue-900/80 border border-blue-700 rounded-full text-sm font-semibold hover:bg-blue-800 transition-colors duration-200 shadow focus:ring-2 focus:ring-blue-400"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  </article>
)

// Elegant Theme (World-Class, Enhanced Interactions)
const ElegantPost = ({ post }: { post: Post }) => (
  <article className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-gray-900 dark:to-amber-900/20 min-h-screen animate-fade-in">
    <div className="max-w-3xl mx-auto px-6 py-28">
      <header className="mb-24 text-center">
        <div className="flex justify-center gap-4 mb-10">
          {post.categories.slice(0, 2).map(cat => (
            <span 
              key={cat.slug} 
              className="text-base tracking-widest uppercase text-amber-700 dark:text-amber-300 font-serif bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              {cat.name}
            </span>
          ))}
        </div>
        <h1 className="text-8xl font-serif font-extrabold mb-12 text-gray-900 dark:text-white drop-shadow-2xl animate-slide-up">
          <span className="text-amber-400 font-serif text-6xl align-top mr-2">“</span>{post.title}
        </h1>
        <div className="flex items-center justify-center gap-8 text-gray-600 dark:text-gray-300 text-xl">
          <span className="font-serif italic font-medium flex items-center gap-2">
            {post.author.image && (
              <Image src={post.author.image} alt={post.author.name} width={36} height={36} className="rounded-full border border-amber-400/40 shadow" />
            )}
            {post.author.name}
          </span>
          <span className="text-amber-600">◆</span>
          <time className="font-serif">{formatDate(post.publishedAt)}</time>
        </div>
      </header>
      {post.coverImage && (
        <div className="relative aspect-[16/10] mb-24 rounded-4xl shadow-2xl overflow-hidden border-4 border-amber-200 dark:border-amber-900/40 group">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      )}
      <div 
        className="prose prose-2xl prose-amber dark:prose-invert max-w-none font-serif [&>p]:leading-relaxed [&>p]:text-justify text-gray-900 dark:text-amber-100 animate-fade-in"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="mt-16 flex flex-wrap gap-3 justify-center">
        {post.tags.map(tag => (
          <Link 
            key={tag.slug}
            href={`/tag/${tag.slug}`}
            className="px-5 py-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-base font-semibold text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors duration-200 shadow focus:ring-2 focus:ring-amber-400"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  </article>
)

// Creative Theme (World-Class, Enhanced Interactions)
const CreativePost = ({ post }: { post: Post }) => (
  <article className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 min-h-screen animate-fade-in">
    <div className="max-w-4xl mx-auto px-6 py-24">
      <header className="mb-20 relative">
        <div className="absolute -top-12 -left-12 w-56 h-56 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-3xl opacity-30 animate-float" />
        <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full blur-3xl opacity-30 animate-float-reverse" />
        <div className="relative z-10">
          <div className="flex gap-4 mb-10 justify-center">
            {post.categories.slice(0, 3).map(cat => (
              <span 
                key={cat.slug} 
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
              >
                {cat.name}
              </span>
            ))}
          </div>
          <h1 className="text-8xl font-extrabold mb-10 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-2xl tracking-tight animate-slide-up">
            {post.title}
          </h1>
          <div className="flex items-center gap-8 justify-center">
            {post.author.image && (
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={72}
                height={72}
                className="rounded-full border-4 border-white shadow-2xl"
              />
            )}
            <div>
              <div className="font-bold text-2xl text-gray-800 dark:text-gray-200">{post.author.name}</div>
              <time className="text-gray-600 dark:text-gray-400 text-lg">{formatDate(post.publishedAt)}</time>
            </div>
          </div>
        </div>
      </header>
      {post.coverImage && (
        <div className="relative aspect-video mb-16 rounded-4xl overflow-hidden shadow-2xl border-4 border-pink-200 dark:border-purple-900/40 group">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      )}
      <div 
        className="prose prose-2xl dark:prose-invert max-w-none [&>h2]:text-5xl [&>h2]:font-bold [&>h2]:bg-gradient-to-r [&>h2]:from-pink-600 [&>h2]:to-purple-600 [&>h2]:bg-clip-text [&>h2]:text-transparent text-gray-900 dark:text-gray-100 animate-fade-in"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="mt-16 flex flex-wrap gap-4 justify-center">
        {post.tags.map(tag => (
          <Link 
            key={tag.slug}
            href={`/tag/${tag.slug}`}
            className="px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full text-lg font-semibold hover:shadow-2xl transition-colors duration-200 focus:ring-2 focus:ring-pink-400"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  </article>
)

export default function ThemedPost({ post, theme }: ThemedPostProps) {
  const themeComponents = {
    minimalist: MinimalistPost,
    magazine: MagazinePost,
    photography: PhotographyPost,
    'dark-tech': DarkTechPost,
    elegant: ElegantPost,
    creative: CreativePost
  }

  const ThemeComponent = themeComponents[theme] || MinimalistPost

  return <ThemeComponent post={post} />
}
