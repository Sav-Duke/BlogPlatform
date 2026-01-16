import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { checkRateLimit } from './db-helpers'

/**
 * Rate limiting middleware for API routes
 */
export async function withRateLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: {
    maxRequests?: number
    windowSeconds?: number
    bypassAuth?: boolean
  }
) {
  const { maxRequests = 100, windowSeconds = 60, bypassAuth = false } = config || {}

  // Get identifier (IP or user ID)
  const session = await getServerSession(authOptions)
  const identifier = session?.user?.id || request.ip || 'anonymous'

  // Check rate limit
  const rateLimitResult = checkRateLimit(identifier, maxRequests, windowSeconds)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        resetAt: new Date(rateLimitResult.resetAt).toISOString()
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
        }
      }
    )
  }

  // Execute handler
  const response = await handler(request)

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetAt.toString())

  return response
}

/**
 * Authentication middleware
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, session: any) => Promise<NextResponse>,
  requiredRoles?: string[]
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (requiredRoles && !requiredRoles.includes(session.user.role || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return handler(request, session)
}

/**
 * Error handling wrapper
 */
export async function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler()
  } catch (error: any) {
    console.error('API Error:', error)

    // Handle Prisma errors
    if (error.code) {
      switch (error.code) {
        case 'P2002':
          return NextResponse.json(
            { error: 'A record with this value already exists' },
            { status: 409 }
          )
        case 'P2025':
          return NextResponse.json(
            { error: 'Record not found' },
            { status: 404 }
          )
        case 'P2003':
          return NextResponse.json(
            { error: 'Foreign key constraint failed' },
            { status: 400 }
          )
        default:
          return NextResponse.json(
            { error: 'Database error occurred' },
            { status: 500 }
          )
      }
    }

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    // Generic error
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: 500 }
    )
  }
}

/**
 * Request logging middleware
 */
export async function withLogging(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const start = Date.now()
  const session = await getServerSession(authOptions)

  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`, {
    user: session?.user?.email || 'anonymous',
    ip: request.ip,
  })

  const response = await handler(request)
  const duration = Date.now() - start

  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url} - ${response.status} (${duration}ms)`)

  return response
}

/**
 * Combine multiple middleware
 */
export function withMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>,
  middleware: ((req: NextRequest, next: any) => Promise<NextResponse>)[]
) {
  return async (request: NextRequest) => {
    let finalHandler = handler

    for (const mw of middleware.reverse()) {
      const currentHandler = finalHandler
      finalHandler = (req: NextRequest) => mw(req, currentHandler)
    }

    return finalHandler(request)
  }
}
