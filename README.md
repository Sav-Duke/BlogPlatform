# Animal Hub - Advanced Blog Platform 🚀

A complete, production-ready blog platform built with Next.js 14, featuring a powerful admin panel, real-time comments, comprehensive SEO optimization, and beautiful UI/UX. Perfect for content creators, businesses, and developers.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748)
![Database](https://img.shields.io/badge/Database-SQLite/PostgreSQL-316192)

## ✨ Complete Feature Set

### 🎯 Content Management
- 📝 **Rich Text Editor** - TipTap editor with formatting, images, YouTube embeds, links
- 🎨 **Categories & Tags** - Organize content with flexible taxonomy
- 📸 **Media Library** - Upload and manage images with drag-and-drop
- 💬 **Comment System** - Real-time comments with moderation and nested replies
- 📊 **Draft System** - Save drafts, schedule, and publish posts
- 🔍 **Advanced Search** - Full-text search with instant results
- 📑 **Bulk Operations** - Manage multiple posts at once

### 🎨 User Experience
- 🌓 **Dark Mode** - Beautiful dark theme with smooth transitions
- ⚡ **Fast Performance** - Server-side rendering and optimized images
- 📱 **Mobile Responsive** - Perfect on all devices
- 🔝 **Scroll to Top** - Smooth scroll-to-top button
- 📊 **Reading Progress** - Visual progress bar on articles
- 🔔 **Toast Notifications** - Real-time feedback
- 🎯 **Loading States** - Skeleton screens and spinners

### 👥 Admin Dashboard
- 📈 **Analytics Dashboard** - Stats, views, popular content
- 👥 **User Management** - Role-based access (Admin, Editor, Author, User)
- ⚙️ **Settings Panel** - Configure site settings and metadata
- 🎯 **Content Moderation** - Approve/reject comments
- 📱 **Responsive Admin** - Manage content from any device
- 🔍 **Activity Logs** - Track all admin actions

### 🔒 Security & SEO
- 🔐 **Secure Authentication** - NextAuth with credentials, Google, GitHub
- 🛡️ **Input Validation** - Zod schema validation
- 🔒 **SQL Protection** - Prisma ORM prevents injection
- 📈 **SEO Optimized** - Meta tags, sitemaps, structured data
- 🌐 **Social Sharing** - OpenGraph and Twitter cards
- 📍 **Breadcrumbs** - Proper navigation structure

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Editor**: [TipTap](https://tiptap.dev/)
- **State Management**: [TanStack Query](https://tanstack.com/query)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd BlogPlatform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for dev)

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Seed the database with sample data**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

After seeding the database:

- **Admin Account**
  - Email: `admin@blog.com`
  - Password: `admin123`

- **Author Account**
  - Email: `author@blog.com`
  - Password: `author123`

## 📁 Project Structure

```
BlogPlatform/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── public/
│   └── uploads/           # Uploaded media files
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── admin/         # Admin panel pages
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── blog/          # Blog pages
│   │   └── category/      # Category pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and configurations
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   ├── utils.ts       # Utility functions
│   │   └── validations.ts # Zod schemas
│   └── types/             # TypeScript types
├── .env.example           # Environment variables template
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🎯 Key Features Explained

### Admin Dashboard

Access the admin panel at `/admin` after logging in with an author, editor, or admin account.

**Dashboard Features:**
- View total posts, views, comments, and users
- See recent posts and popular content
- Quick actions for creating new content

### Post Management

- Create, edit, and delete posts
- Rich text editor with formatting options
- Upload cover images and media
- Add categories and tags
- Set SEO metadata
- Draft/Publish/Archive status

### User Roles

1. **Admin** - Full access to everything
2. **Editor** - Can manage all content and moderate comments
3. **Author** - Can create and manage own posts
4. **User** - Can comment on posts (when logged in)

### SEO Features

- Custom meta titles and descriptions
- Auto-generated slugs
- Sitemap generation
- RSS feed
- Open Graph tags
- Optimized images

## 🔧 Configuration

### Database

Configure your PostgreSQL database in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/blog_platform?schema=public"
```

### Authentication Providers

Add OAuth providers in `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Upload Settings

Configure file uploads:

```env
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=10485760
```

## 📝 API Routes

### Posts
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `GET /api/posts/[slug]` - Get post
- `PUT /api/posts/[slug]` - Update post
- `DELETE /api/posts/[slug]` - Delete post

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

### Tags
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag

### Comments
- `POST /api/comments` - Create comment
- `PUT /api/comments` - Approve comment
- `DELETE /api/comments` - Delete comment

### Media
- `POST /api/upload` - Upload file
- `GET /api/upload` - List media

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t superior-blog .
docker run -p 3000:3000 superior-blog
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting platform
- Prisma for the excellent ORM
- All open-source contributors

## 📧 Support

For support, email contact@superiorblog.com or open an issue on GitHub.

---

**Built with ❤️ using Next.js 14, TypeScript, and modern web technologies**
