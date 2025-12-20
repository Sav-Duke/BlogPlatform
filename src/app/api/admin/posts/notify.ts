import { sendNotificationEmail, NotificationEmailOptions } from '@/lib/notificationEmail';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postId, status, feedbackUrl } = req.body;
  if (!postId || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true },
  });
  if (!post || !post.author) {
    return res.status(404).json({ error: 'Post or author not found' });
  }

  const options: NotificationEmailOptions = {
    to: post.author.email,
    subject: `Your post "${post.title}" has been ${status === 'APPROVED' ? 'approved' : 'rejected'}`,
    authorName: post.author.name || 'Author',
    authorAvatar: post.author.image || undefined,
    postTitle: post.title,
    postSummary: post.excerpt || '',
    status,
    feedbackUrl,
    socialLinks: {
      twitter: process.env.SOCIAL_TWITTER,
      github: process.env.SOCIAL_GITHUB,
      website: process.env.SOCIAL_WEBSITE,
    },
    supportEmail: process.env.SUPPORT_EMAIL,
    branding: {
      logoUrl: process.env.BRAND_LOGO_URL,
      brandName: process.env.BRAND_NAME,
    },
  };

  await sendNotificationEmail(options);
  return res.status(200).json({ message: 'Notification sent' });
}
