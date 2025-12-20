import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const content = await file.text()
    const data = JSON.parse(content)

    let imported = 0

    // Import posts
    if (data.posts && Array.isArray(data.posts)) {
      for (const post of data.posts) {
        try {
          await prisma.post.create({
            data: {
              title: post.title,
              slug: post.slug + '-imported-' + Date.now(),
              content: post.content,
              excerpt: post.excerpt,
              coverImage: post.coverImage,
              status: 'DRAFT', // Import as draft for review
              authorId: session.user.id,
            },
          })
          imported++
        } catch (error) {
          console.error('Failed to import post:', error)
        }
      }
    }

    return NextResponse.json({ imported, message: 'Import completed' })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    )
  }
}
