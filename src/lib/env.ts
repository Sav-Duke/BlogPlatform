// Environment variable validation
// This file ensures all required environment variables are present

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const

const optionalEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_ID',
  'GITHUB_SECRET',
  'NOTIFY_EMAIL',
  'NOTIFY_EMAIL_PASS',
] as const

export function validateEnv() {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  // Check optional variables (warnings only)
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please create a .env file with these variables.`
    )
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(
      `⚠️  Optional environment variables not set:\n${warnings.map(v => `  - ${v}`).join('\n')}\n` +
      `Some features may be disabled.`
    )
  }

  // Validate NEXTAUTH_SECRET length
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn('⚠️  NEXTAUTH_SECRET should be at least 32 characters long')
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL) {
    if (!process.env.DATABASE_URL.startsWith('file:') && 
        !process.env.DATABASE_URL.startsWith('postgresql://') &&
        !process.env.DATABASE_URL.startsWith('mysql://')) {
      console.warn('⚠️  DATABASE_URL format may be invalid')
    }
  }

  return {
    isValid: true,
    warnings: warnings.length,
    hasGoogleAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    hasGitHubAuth: !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
    hasEmailNotifications: !!(process.env.NOTIFY_EMAIL && process.env.NOTIFY_EMAIL_PASS),
  }
}

// Run validation on import (server-side only)
if (typeof window === 'undefined') {
  try {
    const result = validateEnv()
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Environment validation passed')
      if (result.hasGoogleAuth) console.log('  • Google OAuth enabled')
      if (result.hasGitHubAuth) console.log('  • GitHub OAuth enabled')
      if (result.hasEmailNotifications) console.log('  • Email notifications enabled')
    }
  } catch (error) {
    console.error('❌ Environment validation failed:')
    console.error(error)
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}
