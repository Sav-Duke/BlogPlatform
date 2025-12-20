# 👑 Admin & User Management Guide

## Your Admin Account

**Your personal admin account has been created:**

- **Email:** duke01savage@gmail.com
- **Password:** 12345678
- **Role:** ADMIN (Full Access)

You can change your password anytime after logging in.

## Changing Your Password

1. Sign in at: http://localhost:3000/auth/signin
2. Go to your profile settings
3. Or use the admin panel to update your account

## Managing Users (Admin Panel)

### Access User Management
Navigate to: **http://localhost:3000/admin/users**

### Available Actions

#### 1. View All Users
- See all registered users
- Filter by role (Admin, Editor, Author, User)
- Search by name or email
- View user statistics (posts, comments)

#### 2. Change User Roles
**Available Roles:**
- **ADMIN** - Full access to everything
- **EDITOR** - Manage all posts and moderate comments
- **AUTHOR** - Create and manage own posts
- **USER** - Read and comment only

**How to Change:**
1. Go to `/admin/users`
2. Find the user
3. Click on their current role
4. Select new role from dropdown
5. Confirm the change

#### 3. Delete Users
**Important:** Deleting a user will also delete:
- All their posts
- All their comments
- All related data

**How to Delete:**
1. Go to `/admin/users`
2. Find the user
3. Click the delete/trash icon
4. Confirm deletion

#### 4. Add New Admin/Author
**Option 1: Through Registration**
1. User registers at `/auth/register`
2. You change their role in `/admin/users`

**Option 2: Direct Database (Advanced)**
```bash
npm run create:admin
```
Then modify the script for different users.

## User Roles Explained

### 👑 ADMIN (You!)
- Full access to everything
- Manage all users
- Delete any content
- Change site settings
- View all statistics
- Approve/reject comments
- Manage categories & tags

### ✏️ EDITOR
- Manage all posts (not just their own)
- Moderate all comments
- Manage categories & tags
- Cannot manage users
- Cannot access settings

### 📝 AUTHOR
- Create and edit own posts
- Reply to comments on own posts
- Upload media
- Cannot manage other users' content
- Cannot moderate comments globally

### 👤 USER
- Read articles
- Leave comments
- Subscribe to newsletter
- No admin panel access

## Admin Panel Features

### Dashboard (http://localhost:3000/admin)
- View statistics
- Recent posts
- Pending comments
- User activity

### Posts Management (http://localhost:3000/admin/posts)
- Create new posts
- Edit any post
- Delete posts
- Bulk operations
- Publish/unpublish

### Comments (http://localhost:3000/admin/comments)
- Approve pending comments
- Delete spam
- View all comments
- Filter by status

### Categories (http://localhost:3000/admin/categories)
- Create categories
- Edit names & colors
- Delete categories
- Assign to posts

### Tags (http://localhost:3000/admin/tags)
- Create tags
- Edit tag names
- Delete tags
- Organize content

### Users (http://localhost:3000/admin/users)
- View all users
- Change roles
- Delete users
- Monitor activity

### Media (http://localhost:3000/admin/media)
- Upload images
- View all media
- Delete files
- Organize assets

## Best Practices

### Security
1. **Change default password** immediately
2. **Use strong passwords** for all admin accounts
3. **Limit admin accounts** - only trusted people
4. **Regular audits** - review user list monthly
5. **Monitor activity** - check activity logs

### User Management
1. **Start users as AUTHOR** - promote to EDITOR only when needed
2. **Be careful with ADMIN** - limit to 2-3 trusted people
3. **Remove inactive users** - clean up regularly
4. **Review posts** - monitor new author content

### Content Moderation
1. **Approve comments** before they go live
2. **Review new authors'** first few posts
3. **Set guidelines** for content
4. **Regular cleanup** - remove old/irrelevant content

## Quick Tasks

### Make Someone an Admin
1. Go to `/admin/users`
2. Find their account
3. Click their role badge
4. Select "ADMIN"
5. Confirm

### Remove Admin Rights
1. Go to `/admin/users`
2. Find the user
3. Click "ADMIN" badge
4. Select "AUTHOR" or "EDITOR"
5. Confirm

### Add a New Author
1. Have them register at `/auth/register`
2. Go to `/admin/users`
3. Find their account (role: USER)
4. Click "USER"
5. Select "AUTHOR"
6. They can now create posts!

### Delete Spam Accounts
1. Go to `/admin/users`
2. Filter or search for suspicious accounts
3. Click delete icon
4. Confirm deletion

## Troubleshooting

### Can't Access Admin Panel?
- Make sure your role is ADMIN, EDITOR, or AUTHOR
- Sign out and sign back in
- Clear browser cache

### Can't Change User Roles?
- Only ADMINS can change roles
- Make sure you're signed in as duke01savage@gmail.com

### User Deleted by Accident?
- Users cannot be restored once deleted
- All their content is permanently removed
- Be careful with delete button!

## Your Developer Credentials

**Footer Credit Added:**
"Developed by Duke Sav" now appears at the bottom of every page!

**Your Admin Account:**
- Email: duke01savage@gmail.com
- Password: 12345678 (changeable)
- Access: Full control

---

**You're all set!** Log in and explore your admin powers! 👑
