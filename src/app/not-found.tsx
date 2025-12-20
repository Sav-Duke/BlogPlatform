import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileQuestion, Home, Search } from 'lucide-react'

export const metadata = {
  title: '404 - Page Not Found | Animal Hub',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-6">
            <FileQuestion className="h-12 w-12 text-primary-600 dark:text-primary-400" />
          </div>
          
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Link>
            
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-600 dark:hover:border-primary-600 transition"
            >
              <Search className="h-5 w-5" />
              Browse Blog
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
