import { prisma } from '../src/lib/prisma';
import nodemailer from 'nodemailer';

async function main() {
  const now = new Date();
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  const tasks = await prisma.task.findMany({
    where: {
      deadline: {
        gte: now,
        lte: soon,
      },
      status: 'OPEN',
    },
    include: { assignedTo: true },
  });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NOTIFY_EMAIL,
      pass: process.env.NOTIFY_EMAIL_PASS,
    },
  });
  for (const task of tasks) {
    if (!task.assignedTo?.email) continue;
    const subject = `Reminder: Task "${task.title}" is due soon!`;
    const html = `<div style='font-family:sans-serif;padding:24px;background:#f6f8fa;border-radius:8px;'>
      <h2 style='color:#2563eb;'>Task Reminder</h2>
      <p>Hi ${task.assignedTo.name || ''},</p>
      <p>This is a reminder that your assigned task <strong>${task.title}</strong>${task.topic ? ` (Topic: ${task.topic})` : ''} is due on <strong>${new Date(task.deadline).toLocaleString()}</strong>.</p>
      <p style='margin-top:24px;'>Please ensure your draft is ready and linked for auto-posting.</p>
      <p style='margin-top:32px;color:#888;font-size:0.95rem;'>BlogPlatform Scheduler</p>
    </div>`;
    await transporter.sendMail({
      from: process.env.NOTIFY_EMAIL,
      to: task.assignedTo.email,
      subject,
      html,
    });
    console.log(`Reminder sent to ${task.assignedTo.email} for task ${task.title}`);
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
