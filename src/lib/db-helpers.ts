import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

/**
 * Pagination helper
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function paginate<T>(
  model: any,
  where: any,
  params: PaginationParams & { include?: any; orderBy?: any; select?: any }
): Promise<PaginationResult<T>> {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(100, Math.max(1, params.limit || 10))
  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      ...(params.include && { include: params.include }),
      ...(params.orderBy && { orderBy: params.orderBy }),
      ...(params.select && { select: params.select }),
    }),
    model.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

/**
 * Soft delete helper (marks as archived instead of deleting)
 */
export async function softDelete(model: any, id: string, status: string = 'ARCHIVED') {
  return model.update({
    where: { id },
    data: { status },
  })
}

/**
 * Batch operations helper
 */
export async function batchUpdate<T>(
  model: any,
  ids: string[],
  data: Partial<T>
) {
  return model.updateMany({
    where: { id: { in: ids } },
    data,
  })
}

export async function batchDelete(model: any, ids: string[]) {
  return model.deleteMany({
    where: { id: { in: ids } },
  })
}

/**
 * Transaction helper for complex operations
 */
export async function executeTransaction<T>(
  fn: (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn)
}

/**
 * Search helper with full-text search simulation
 */
export function buildSearchWhere(searchTerm: string, fields: string[]) {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return {}
  }

  const sanitized = searchTerm.trim().replace(/[%_]/g, '\\$&')

  return {
    OR: fields.map(field => ({
      [field]: { contains: sanitized, mode: 'insensitive' as const },
    })),
  }
}

/**
 * Date range filter helper
 */
export interface DateRangeFilter {
  from?: Date | string
  to?: Date | string
}

export function buildDateRangeWhere(field: string, range: DateRangeFilter) {
  const where: any = {}

  if (range.from || range.to) {
    where[field] = {}
    if (range.from) {
      where[field].gte = new Date(range.from)
    }
    if (range.to) {
      where[field].lte = new Date(range.to)
    }
  }

  return where
}

/**
 * Sanitize user input for database queries
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/script tags
    .substring(0, 1000) // Limit length
}

/**
 * Generate unique slug
 */
export async function generateUniqueSlug(
  model: any,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await model.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++

    // Prevent infinite loops
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`
      break
    }
  }

  return slug
}

/**
 * Cache helper for frequently accessed data
 */
const cache = new Map<string, { data: any; expiry: number }>()

export function getCached<T>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null

  if (Date.now() > item.expiry) {
    cache.delete(key)
    return null
  }

  return item.data as T
}

export function setCached<T>(key: string, data: T, ttlSeconds: number = 300) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  })
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = identifier
  const window = rateLimitMap.get(key)

  if (!window || now > window.resetAt) {
    const resetAt = now + windowSeconds * 1000
    rateLimitMap.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (window.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: window.resetAt }
  }

  window.count++
  return { allowed: true, remaining: maxRequests - window.count, resetAt: window.resetAt }
}
