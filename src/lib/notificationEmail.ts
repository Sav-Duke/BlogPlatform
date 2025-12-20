import nodemailer from 'nodemailer';

export interface NotificationEmailOptions {
  to: string;
  subject: string;
  authorName: string;
  authorAvatar?: string;
  postTitle: string;
  postSummary?: string;
  status: 'APPROVED' | 'REJECTED';
  feedbackUrl?: string;
  socialLinks?: { twitter?: string; github?: string; website?: string };
  supportEmail?: string;
  branding?: {
    logoUrl?: string;
    brandName?: string;
    brandColor?: string;
    tagline?: string;
    headerHtml?: string;
    footerHtml?: string;
  };
  customSubject?: string;
  customHeaderHtml?: string;
  customFooterHtml?: string;
  customBlocksHtml?: string;
}

export async function sendNotificationEmail(options: NotificationEmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const statusText = options.status === 'APPROVED' ? 'approved' : 'rejected';
  const subject = options.subject || `Your post has been ${statusText}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px #eee;">
        <div style="padding: 24px; text-align: center; ${options.branding?.brandColor ? `background:${options.branding.brandColor};` : ''}">
          ${options.branding?.logoUrl ? `<img src='${options.branding.logoUrl}' alt='${options.branding.brandName || ''}' style='height:48px;margin-bottom:16px;'/>` : ''}
          <h2 style="margin-bottom: 8px;">${options.branding?.brandName || 'Blog Platform'}</h2>
          ${options.branding?.tagline ? `<div style='color:#555;margin-bottom:8px;'>${options.branding.tagline}</div>` : ''}
          ${options.customHeaderHtml || options.branding?.headerHtml || ''}
          <h3 style="color: #333;">Post ${statusText}</h3>
        </div>
        <div style="padding: 24px; border-top: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            ${options.authorAvatar ? `<img src='${options.authorAvatar}' alt='${options.authorName}' style='width:48px;height:48px;border-radius:50%;'/>` : ''}
            <div>
              <strong>${options.authorName}</strong>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <strong>Post:</strong> ${options.postTitle}<br/>
            ${options.postSummary ? `<div style='margin-top:8px;color:#555;'>${options.postSummary}</div>` : ''}
          </div>
          <div style="margin-bottom: 16px;">
            <span style="color: ${options.status === 'APPROVED' ? '#27ae60' : '#c0392b'}; font-weight: bold;">${statusText.toUpperCase()}</span>
          </div>
          ${options.feedbackUrl ? `<a href='${options.feedbackUrl}' style='display:inline-block;padding:10px 20px;background:#007bff;color:#fff;border-radius:6px;text-decoration:none;'>Feedback / Support</a>` : ''}
          ${options.customBlocksHtml || ''}
        </div>
        <div style="padding: 24px; border-top: 1px solid #eee; text-align: center; font-size: 14px; color: #888;">
          ${options.socialLinks?.twitter ? `<a href='${options.socialLinks.twitter}' style='margin:0 8px;color:#1da1f2;'>Twitter</a>` : ''}
          ${options.socialLinks?.github ? `<a href='${options.socialLinks.github}' style='margin:0 8px;color:#333;'>GitHub</a>` : ''}
          ${options.socialLinks?.website ? `<a href='${options.socialLinks.website}' style='margin:0 8px;color:#007bff;'>Website</a>` : ''}
          <br/>
          ${options.supportEmail ? `<div style='margin-top:8px;'>Contact support: <a href='mailto:${options.supportEmail}'>${options.supportEmail}</a></div>` : ''}
          ${options.customFooterHtml || options.branding?.footerHtml || ''}
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@blogplatform.com',
    to: options.to,
    subject,
    html,
  });
}
