'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X, User, LogOut, Settings, Home, BookOpen, Search } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import SearchBar from './SearchBar'

export default function Navbar() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Animal Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-primary-600 transition">
              Home
            </Link>
            <Link href="/blog" className="text-sm font-medium hover:text-primary-600 transition">
              Blog
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary-600 transition">
              Categories
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary-600 transition">
              About
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {session ? (
              <div className="flex items-center space-x-3">
                {['AUTHOR', 'EDITOR', 'ADMIN'].includes(session.user?.role || '') && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium hover:text-primary-600 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {/* Mobile Search */}
            <div className="mb-4">
              <SearchBar />
            </div>
            
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-sm font-medium hover:text-primary-600 transition">
                Home
              </Link>
              <Link href="/blog" className="text-sm font-medium hover:text-primary-600 transition">
                Blog
              </Link>
              <Link href="/categories" className="text-sm font-medium hover:text-primary-600 transition">
                Categories
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary-600 transition">
                About
              </Link>
              
              {session ? (
                <>
                  {['AUTHOR', 'EDITOR', 'ADMIN'].includes(session.user?.role || '') && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-sm font-medium text-left hover:text-primary-600 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
