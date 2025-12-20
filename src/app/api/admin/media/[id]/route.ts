import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { alt, caption } = await request.json()

    const media = await prisma.media.update({
      where: { id: params.id },
      data: { alt, caption },
    })

    await logActivity({
      action: 'UPDATE',
      entity: 'MEDIA',
      entityId: params.id,
      description: `Updated media: ${media.originalName}`,
      userId: session.user.id,
      request,
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Failed to update media:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const media = await prisma.media.findUnique({
      where: { id: params.id },
    })

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    await prisma.media.delete({
      where: { id: params.id },
    })

    await logActivity({
      action: 'DELETE',
      entity: 'MEDIA',
      entityId: params.id,
      description: `Deleted media: ${media.originalName}`,
      userId: session.user.id,
      request,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}
