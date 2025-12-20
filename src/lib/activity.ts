import { prisma } from './prisma'
import { NextRequest } from 'next/server'

interface LogActivityParams {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PUBLISH' | 'UNPUBLISH'
  entity: 'POST' | 'CATEGORY' | 'TAG' | 'COMMENT' | 'USER' | 'SETTING' | 'MEDIA'
  entityId?: string
  description: string
  userId: string
  metadata?: Record<string, any>
  request?: NextRequest
}

export async function logActivity({
  action,
  entity,
  entityId,
  description,
  userId,
  metadata,
  request,
}: LogActivityParams) {
  try {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request?.headers.get('user-agent') || 'unknown'

    await prisma.activityLog.create({
      data: {
        action,
        entity,
        entityId,
        description,
        userId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

export async function createRevision(
  postId: string,
  postData: any,
  userId: string
) {
  try {
    await prisma.postRevision.create({
      data: {
        postId,
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt || null,
        coverImage: postData.coverImage || null,
        status: postData.status,
        featured: postData.featured || false,
        seoTitle: postData.seoTitle || null,
        seoDescription: postData.seoDescription || null,
        seoKeywords: postData.seoKeywords || null,
        focusKeyword: postData.focusKeyword || null,
        createdById: userId,
      },
    })
  } catch (error) {
    console.error('Failed to create revision:', error)
  }
}
