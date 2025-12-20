import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, publishedAt } = await req.json()

    const post = await prisma.post.update({
      where: { slug: params.slug },
      data: { 
        status,
        publishedAt: status === 'PUBLISHED' && !publishedAt ? new Date() : publishedAt
      },
      include: { author: true },
    })

    // Send email notification to author if status changed to PUBLISHED or ARCHIVED
    if (post.author?.email && (status === 'PUBLISHED' || status === 'ARCHIVED')) {
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.NOTIFY_EMAIL,
          pass: process.env.NOTIFY_EMAIL_PASS,
        },
      })
      let subject = ''
      let text = ''
      let html = ''
      const brandColor = '#2563eb';
      const accentColor = status === 'PUBLISHED' ? '#22c55e' : '#ef4444';
      const logoUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/public/logo.png`;
      // Configurable support email and social URLs via environment variables
      const supportEmail = process.env.NOTIFY_SUPPORT_EMAIL || 'support@blogplatform.com';
      const socialLinks = [
        { name: 'Twitter', url: process.env.NOTIFY_TWITTER_URL || 'https://twitter.com/blogplatform', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg' },
        { name: 'Facebook', url: process.env.NOTIFY_FACEBOOK_URL || 'https://facebook.com/blogplatform', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg' },
        { name: 'Instagram', url: process.env.NOTIFY_INSTAGRAM_URL || 'https://instagram.com/blogplatform', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg' },
      ];
      // Easily add more features by extending socialLinks or adding new sections below
      const socialHtml = socialLinks.map(link => `
        <a href='${link.url}' style='margin:0 8px;text-decoration:none;' target='_blank'>
          <img src='${link.icon}' alt='${link.name}' style='height:24px;width:24px;vertical-align:middle;filter:grayscale(0.2);' />
        </a>
      `).join('');

      // Additional features: author avatar, post summary, feedback/support button
      const authorAvatar = post.author?.image || `${process.env.NEXT_PUBLIC_SITE_URL}/public/default-avatar.png`;
      const postSummary = post.summary || '';
      const feedbackUrl = process.env.NOTIFY_FEEDBACK_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/support`;
      if (status === 'PUBLISHED') {
        subject = 'Your post has been approved!';
        text = `Congratulations, your post "${post.title}" has been approved and published.`;
        html = `
          <div style='font-family:sans-serif;background:#f6f8fa;padding:0;margin:0;'>
            <div style='max-width:520px;margin:32px auto;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);overflow:hidden;'>
              <div style='background:${brandColor};padding:24px 0;text-align:center;'>
                <img src='${logoUrl}' alt='BlogPlatform Logo' style='height:48px;margin-bottom:12px;' />
                <h1 style='color:#fff;font-size:2rem;margin:0;'>BlogPlatform</h1>
              </div>
              <div style='padding:32px;'>
                <div style='display:flex;align-items:center;gap:16px;margin-bottom:24px;'>
                  <img src='${authorAvatar}' alt='Author Avatar' style='height:48px;width:48px;border-radius:50%;border:2px solid ${brandColor};' />
                  <div>
                    <div style='font-weight:600;'>${post.author?.name || 'Author'}</div>
                    <div style='font-size:0.95rem;color:#888;'>${post.author?.email || ''}</div>
                  </div>
                </div>
                <h2 style='color:${accentColor};margin-top:0;'>Your post has been approved!</h2>
                <p style='font-size:1.1rem;'>Congratulations, your post <strong>${post.title}</strong> has been approved and published.</p>
                ${postSummary ? `<div style='margin:18px 0;padding:12px;background:#f3f4f6;border-radius:8px;color:#444;'><strong>Summary:</strong> ${postSummary}</div>` : ''}
                <a href='${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}' style='display:inline-block;margin:24px 0;padding:12px 24px;background:${brandColor};color:#fff;border-radius:6px;text-decoration:none;font-weight:600;'>View Post</a>
                <p style='margin-top:32px;color:#555;'>Thank you for contributing to BlogPlatform!</p>
                <a href='${feedbackUrl}' style='display:inline-block;margin-top:18px;padding:10px 20px;background:#e0e7ff;color:${brandColor};border-radius:6px;text-decoration:none;font-weight:500;'>Send Feedback / Contact Support</a>
              </div>
              <div style='background:#f3f4f6;padding:16px;text-align:center;color:#888;font-size:0.95rem;'>
                <div style='margin-bottom:8px;'>
                  <span>Connect with us:</span>
                  <div style='margin-top:8px;'>${socialHtml}</div>
                </div>
                <div style='margin-bottom:8px;'>
                  <span>Need help? <a href='mailto:${supportEmail}' style='color:${brandColor};text-decoration:underline;'>Contact Support</a></span>
                </div>
                &copy; ${new Date().getFullYear()} BlogPlatform. All rights reserved.
              </div>
            </div>
          </div>
        `;
      } else {
        subject = 'Your post was rejected';
        text = `Sorry, your post "${post.title}" was rejected and archived.`;
        html = `
          <div style='font-family:sans-serif;background:#f6f8fa;padding:0;margin:0;'>
            <div style='max-width:520px;margin:32px auto;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);overflow:hidden;'>
              <div style='background:${brandColor};padding:24px 0;text-align:center;'>
                <img src='${logoUrl}' alt='BlogPlatform Logo' style='height:48px;margin-bottom:12px;' />
                <h1 style='color:#fff;font-size:2rem;margin:0;'>BlogPlatform</h1>
              </div>
              <div style='padding:32px;'>
                <div style='display:flex;align-items:center;gap:16px;margin-bottom:24px;'>
                  <img src='${authorAvatar}' alt='Author Avatar' style='height:48px;width:48px;border-radius:50%;border:2px solid ${brandColor};' />
                  <div>
                    <div style='font-weight:600;'>${post.author?.name || 'Author'}</div>
                    <div style='font-size:0.95rem;color:#888;'>${post.author?.email || ''}</div>
                  </div>
                </div>
                <h2 style='color:${accentColor};margin-top:0;'>Your post was rejected</h2>
                <p style='font-size:1.1rem;'>We're sorry, but your post <strong>${post.title}</strong> was rejected and archived by an admin.</p>
                ${postSummary ? `<div style='margin:18px 0;padding:12px;background:#f3f4f6;border-radius:8px;color:#444;'><strong>Summary:</strong> ${postSummary}</div>` : ''}
                <a href='${feedbackUrl}' style='display:inline-block;margin-top:18px;padding:10px 20px;background:#e0e7ff;color:${brandColor};border-radius:6px;text-decoration:none;font-weight:500;'>Send Feedback / Contact Support</a>
              </div>
              <div style='background:#f3f4f6;padding:16px;text-align:center;color:#888;font-size:0.95rem;'>
                <div style='margin-bottom:8px;'>
                  <span>Connect with us:</span>
                  <div style='margin-top:8px;'>${socialHtml}</div>
                </div>
                <div style='margin-bottom:8px;'>
                  <span>Need help? <a href='mailto:${supportEmail}' style='color:${brandColor};text-decoration:underline;'>Contact Support</a></span>
                </div>
                &copy; ${new Date().getFullYear()} BlogPlatform. All rights reserved.
              </div>
            </div>
          </div>
        `;
      }
      await transporter.sendMail({
        from: process.env.NOTIFY_EMAIL,
        to: post.author.email,
        subject,
        text,
        html,
      })
    }

    return NextResponse.json(post)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}
