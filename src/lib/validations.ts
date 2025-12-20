import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED']),
  featured: z.boolean().default(false),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  tagIds: z.array(z.string()).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.union([z.string(), z.array(z.string())]).optional().nullable().transform(val => {
    if (Array.isArray(val)) return val.join(', ')
    return val || ''
  }),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  color: z.string().optional(),
})

export const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
})

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment is required'),
  postId: z.string(),
  parentId: z.string().optional(),
  anonymousName: z.string().optional(),
})

export const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().optional(),
  siteUrl: z.string().url('Invalid URL'),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  allowComments: z.boolean(),
  moderateComments: z.boolean(),
  postsPerPage: z.number().min(1).max(100),
  googleAnalytics: z.string().optional(),
  facebookPixel: z.string().optional(),
  socialTwitter: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialLinkedin: z.string().optional(),
  socialGithub: z.string().optional(),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  twitter: z.string().optional(),
  github: z.string().optional(),
  image: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PostInput = z.infer<typeof postSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type TagInput = z.infer<typeof tagSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
