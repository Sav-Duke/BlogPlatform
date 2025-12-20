import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, MapPin, Phone } from 'lucide-react'

export const metadata = {
  title: 'About | Animal Hub',
  description: 'Learn more about our blog platform',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Learn more about Animal Hub
              </p>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 md:p-12 mb-12">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2>Our Mission</h2>
                <p>
                  Animal Hub is your comprehensive resource for animal health, livestock production, pet care, and veterinary insights. We provide expert advice for farmers, pet owners, and animal enthusiasts. 
                  Our mission is to provide writers, bloggers, and content creators with a powerful yet intuitive platform 
                  to share their stories with the world.
                </p>

                <h2>What Makes Us Different</h2>
                <p>
                  Unlike traditional blogging platforms, we offer:
                </p>
                <ul>
                  <li><strong>Modern Technology</strong>: Built with Next.js 14, React, and TypeScript for blazing-fast performance</li>
                  <li><strong>Beautiful Design</strong>: Clean, responsive interface that works perfectly on all devices</li>
                  <li><strong>Powerful Admin Panel</strong>: Comprehensive dashboard for managing content, users, and settings</li>
                  <li><strong>SEO Optimized</strong>: Built-in SEO features to help your content rank higher</li>
                  <li><strong>Rich Media Support</strong>: Easy upload and management of images and media files</li>
                  <li><strong>Dark Mode</strong>: Beautiful dark theme for comfortable reading at any time</li>
                </ul>

                <h2>Features</h2>
                <ul>
                  <li>Advanced post editor with rich text formatting</li>
                  <li>Categories and tags for organized content</li>
                  <li>Comment system with moderation</li>
                  <li>User management with role-based access control</li>
                  <li>Analytics and statistics dashboard</li>
                  <li>Responsive design for mobile, tablet, and desktop</li>
                  <li>Fast page loads and optimized images</li>
                  <li>RSS feed and sitemap generation</li>
                </ul>

                <h2>Technology Stack</h2>
                <p>
                  We use cutting-edge technologies to ensure the best performance and developer experience:
                </p>
                <ul>
                  <li><strong>Next.js 14</strong>: React framework with App Router and Server Components</li>
                  <li><strong>TypeScript</strong>: Type-safe code for better reliability</li>
                  <li><strong>Prisma</strong>: Modern database ORM</li>
                  <li><strong>NextAuth.js</strong>: Secure authentication system</li>
                  <li><strong>Tailwind CSS</strong>: Utility-first CSS framework</li>
                  <li><strong>PostgreSQL</strong>: Robust relational database</li>
                </ul>

                <h2>Get Started</h2>
                <p>
                  Ready to start your blogging journey? Sign up for an account and begin creating amazing content today. 
                  Whether you're a seasoned writer or just starting out, our platform provides everything you need to succeed.
                </p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      contact@superiorblog.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      San Francisco, CA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
