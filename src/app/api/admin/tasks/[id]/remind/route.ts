import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
const nodemailer = require('nodemailer')

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { assignedTo: true },
    })
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    if (!task.assignedTo?.email) return NextResponse.json({ error: 'No email for assignee' }, { status: 400 })

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NOTIFY_EMAIL,
        pass: process.env.NOTIFY_EMAIL_PASS,
      },
    })
    const subject = `Reminder: Task "${task.title}" is due soon!`
    const html = `<div style='font-family:sans-serif;padding:24px;background:#f6f8fa;border-radius:8px;'>
      <h2 style='color:#2563eb;'>Task Reminder</h2>
      <p>Hi ${task.assignedTo.name || ''},</p>
      <p>This is a reminder that your assigned task <strong>${task.title}</strong>${task.topic ? ` (Topic: ${task.topic})` : ''} is due on <strong>${new Date(task.deadline).toLocaleString()}</strong>.</p>
      <p style='margin-top:24px;'>Please ensure your draft is ready and linked for auto-posting.</p>
      <p style='margin-top:32px;color:#888;font-size:0.95rem;'>BlogPlatform Scheduler</p>
    </div>`
    await transporter.sendMail({
      from: process.env.NOTIFY_EMAIL,
      to: task.assignedTo.email,
      subject,
      html,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 })
  }
}
