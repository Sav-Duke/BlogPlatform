import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { settingsSchema } from '@/lib/validations'

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst()

    if (!settings) {
      // Return default settings
      return NextResponse.json({
        siteName: 'Animal Hub',
        siteDescription: 'A modern blog platform',
        siteUrl: process.env.SITE_URL || 'http://localhost:3000',
        allowComments: true,
        moderateComments: true,
        postsPerPage: 10,
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const json = await req.json()
    const body = settingsSchema.parse(json)

    const settings = await prisma.settings.upsert({
      where: { id: '1' },
      update: body,
      create: { id: '1', ...body },
    })

    return NextResponse.json(settings)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
