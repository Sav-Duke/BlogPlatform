import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Bulk approve/reject comments
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['EDITOR', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { commentIds, action } = await req.json()

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return NextResponse.json({ error: 'Comment IDs are required' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject"' }, { status: 400 })
    }

    if (action === 'approve') {
      await prisma.comment.updateMany({
        where: { id: { in: commentIds } },
        data: { approved: true },
      })

      return NextResponse.json({ 
        message: `${commentIds.length} comment(s) approved successfully`,
        count: commentIds.length
      })
    } else {
      // Reject = delete comments
      const result = await prisma.comment.deleteMany({
        where: { id: { in: commentIds } },
      })

      return NextResponse.json({ 
        message: `${result.count} comment(s) deleted successfully`,
        count: result.count
      })
    }
  } catch (error: any) {
    console.error('Bulk comment moderation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to moderate comments' },
      { status: 500 }
    )
  }
}
