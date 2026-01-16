# BlogPlatform API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

All protected endpoints require authentication via NextAuth session.

### Headers
```
Content-Type: application/json
```

## Rate Limiting

- **Default**: 100 requests per minute per user/IP
- **Response Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Error Responses

All API endpoints follow this error format:

```json
{
  "error": "Error message",
  "details": {} // Optional, for validation errors
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Internal Server Error

---

## Posts API

### Get All Posts
```http
GET /api/posts
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `status` (string): Filter by status (`DRAFT`, `PENDING`, `PUBLISHED`, `ARCHIVED`)
- `category` (string): Filter by category slug
- `tag` (string): Filter by tag slug
- `authorId` (string): Filter by author ID
- `featured` (boolean): Filter featured posts
- `search` (string): Search in title, excerpt, content

**Response:**
```json
{
  "posts": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Get Single Post
```http
GET /api/posts/[slug]
```

**Response:**
```json
{
  "id": "...",
  "title": "Post Title",
  "slug": "post-title",
  "content": "...",
  "author": {...},
  "categories": [...],
  "tags": [...],
  "comments": [...]
}
```

### Create Post
```http
POST /api/posts
```

**Auth Required**: AUTHOR, EDITOR, or ADMIN

**Body:**
```json
{
  "title": "Post Title",
  "slug": "post-title",
  "excerpt": "Brief description",
  "content": "Full content...",
  "coverImage": "/uploads/image.jpg",
  "status": "DRAFT",
  "featured": false,
  "categoryIds": ["cat1", "cat2"],
  "tagIds": ["tag1", "tag2"],
  "seoTitle": "SEO Title",
  "seoDescription": "SEO Description",
  "seoKeywords": ["keyword1", "keyword2"]
}
```

### Update Post
```http
PUT /api/posts/[slug]
```

**Auth Required**: Post author, EDITOR, or ADMIN

### Delete Post
```http
DELETE /api/posts/[slug]
```

**Auth Required**: Post author, EDITOR, or ADMIN

### Change Post Status
```http
PATCH /api/posts/[slug]/status
```

**Auth Required**: EDITOR or ADMIN

**Body:**
```json
{
  "status": "PUBLISHED"
}
```

### Toggle Featured
```http
POST /api/posts/[slug]/feature
```

**Auth Required**: EDITOR or ADMIN

---

## Categories API

### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
[
  {
    "id": "...",
    "name": "Category Name",
    "slug": "category-name",
    "description": "...",
    "color": "#ff0000",
    "_count": {
      "posts": 10
    }
  }
]
```

### Create Category
```http
POST /api/categories
```

**Auth Required**: EDITOR or ADMIN

**Body:**
```json
{
  "name": "Category Name",
  "slug": "category-name",
  "description": "Optional description",
  "color": "#ff0000"
}
```

### Update Category
```http
PUT /api/categories/[id]
```

**Auth Required**: EDITOR or ADMIN

### Delete Category
```http
DELETE /api/categories/[id]
```

**Auth Required**: EDITOR or ADMIN

**Note**: Cannot delete categories with posts. Reassign posts first.

---

## Tags API

### Get All Tags
```http
GET /api/tags
```

### Create Tag
```http
POST /api/tags
```

**Auth Required**: AUTHOR, EDITOR, or ADMIN

**Body:**
```json
{
  "name": "Tag Name",
  "slug": "tag-name"
}
```

### Update Tag
```http
PUT /api/tags/[id]
```

**Auth Required**: EDITOR or ADMIN

### Delete Tag
```http
DELETE /api/tags/[id]
```

**Auth Required**: EDITOR or ADMIN

---

## Comments API

### Get Post Comments
```http
GET /api/posts/[slug]/comments
```

**Response:**
```json
[
  {
    "id": "...",
    "content": "Comment text",
    "author": {...},
    "replies": [...],
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Create Comment
```http
POST /api/comments
```

**Body:**
```json
{
  "postId": "post-id",
  "content": "Comment text",
  "parentId": "parent-id", // Optional, for replies
  "name": "Anonymous Name" // Required for non-authenticated users
}
```

### Approve/Reject Comment
```http
PATCH /api/comments/[id]
```

**Auth Required**: EDITOR or ADMIN

**Body:**
```json
{
  "approved": true
}
```

### Delete Comment
```http
DELETE /api/comments/[id]
```

**Auth Required**: Comment author, EDITOR, or ADMIN

### Bulk Moderate Comments
```http
POST /api/comments/bulk
```

**Auth Required**: EDITOR or ADMIN

**Body:**
```json
{
  "commentIds": ["id1", "id2"],
  "action": "approve" // or "reject"
}
```

---

## Tasks API

### Get All Tasks
```http
GET /api/admin/tasks
```

**Auth Required**: ADMIN or EDITOR (view all) / Any authenticated user (view own)

**Query Parameters:**
- `status`: Filter by status (`OPEN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
- `priority`: Filter by priority (`LOW`, `NORMAL`, `HIGH`, `URGENT`)

### Get Single Task
```http
GET /api/admin/tasks/[id]
```

### Create Task
```http
POST /api/admin/tasks
```

**Auth Required**: ADMIN or EDITOR

**Body:**
```json
{
  "title": "Task Title",
  "description": "Description",
  "topic": "Topic",
  "deadline": "2024-12-31T23:59:59Z",
  "assignedToId": "user-id",
  "priority": "NORMAL",
  "recurring": false
}
```

### Update Task
```http
PUT /api/admin/tasks/[id]
```

**Auth Required**: ADMIN/EDITOR (full update) / Assignee (status and progress only)

### Delete Task
```http
DELETE /api/admin/tasks/[id]
```

**Auth Required**: ADMIN or EDITOR

### Task Comments
```http
GET /api/admin/tasks/[id]/comments
POST /api/admin/tasks/[id]/comments
```

**Body for POST:**
```json
{
  "content": "Comment text",
  "parentId": "parent-id" // Optional
}
```

---

## Users API

### Get All Users
```http
GET /api/users
```

**Auth Required**: ADMIN

### Change User Role
```http
PATCH /api/users/[id]
```

**Auth Required**: ADMIN

**Body:**
```json
{
  "role": "EDITOR" // USER, AUTHOR, EDITOR, or ADMIN
}
```

### Delete User
```http
DELETE /api/users/[id]
```

**Auth Required**: ADMIN

### Change Password
```http
POST /api/users/change-password
```

**Auth Required**: Any authenticated user

**Body:**
```json
{
  "currentPassword": "current",
  "newPassword": "new-password"
}
```

---

## Media API

### Upload File
```http
POST /api/upload
```

**Auth Required**: Any authenticated user

**Body**: multipart/form-data
- `file`: File to upload (max 10MB, images only)

**Response:**
```json
{
  "id": "...",
  "filename": "...",
  "url": "/uploads/filename.jpg",
  "mimeType": "image/jpeg",
  "size": 12345
}
```

### Get All Media
```http
GET /api/upload
```

**Auth Required**: Any authenticated user

---

## Analytics API

### Get Analytics
```http
GET /api/admin/analytics
```

**Auth Required**: ADMIN or EDITOR

**Query Parameters:**
- `range`: `7days`, `30days`, `90days`, or `year`

**Response:**
```json
{
  "totalViews": 10000,
  "viewsGrowth": 15.5,
  "publishedPosts": [...],
  "topContent": [...],
  "trafficSources": [...],
  "viewsTrend": [...]
}
```

---

## Settings API

### Get Settings
```http
GET /api/settings
```

### Update Settings
```http
PUT /api/settings
```

**Auth Required**: ADMIN

**Body:**
```json
{
  "siteName": "Site Name",
  "siteDescription": "Description",
  "siteUrl": "https://yourdomain.com",
  "allowComments": true,
  "moderateComments": true,
  "postsPerPage": 10
}
```

---

## Export/Import API

### Export Data
```http
GET /api/admin/export?type=all
```

**Auth Required**: ADMIN

**Query Parameters:**
- `type`: `posts`, `all`

### Import Data
```http
POST /api/admin/import
```

**Auth Required**: ADMIN

**Body**: multipart/form-data
- `file`: JSON file to import

---

## SEO API

### Analyze SEO
```http
POST /api/admin/seo/analyze
```

**Auth Required**: AUTHOR, EDITOR, or ADMIN

**Body:**
```json
{
  "title": "Post Title",
  "description": "Description",
  "content": "Full content...",
  "keywords": ["keyword1"]
}
```

**Response:**
```json
{
  "score": 85,
  "issues": ["Missing H1 heading"],
  "suggestions": ["Add more keywords"]
}
```

---

## Webhook Examples

### Post Published Webhook
When a post is published, you can integrate with external services:

```javascript
// Example webhook handler
async function onPostPublished(post) {
  await fetch('https://your-webhook-url.com/post-published', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: post.id,
      title: post.title,
      url: `https://yourdomain.com/blog/${post.slug}`,
      publishedAt: post.publishedAt
    })
  })
}
```

---

## SDK Example (JavaScript)

```javascript
class BlogPlatformClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  async getPosts(params = {}) {
    const query = new URLSearchParams(params)
    const response = await fetch(`${this.baseUrl}/api/posts?${query}`)
    return response.json()
  }

  async createPost(data) {
    const response = await fetch(`${this.baseUrl}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

// Usage
const client = new BlogPlatformClient('http://localhost:3000')
const posts = await client.getPosts({ page: 1, limit: 10 })
```

---

## Rate Limits by Role

| Role | Requests/Minute |
|------|----------------|
| Anonymous | 30 |
| USER | 60 |
| AUTHOR | 100 |
| EDITOR | 200 |
| ADMIN | Unlimited |

---

## Support

For API support:
- Documentation: https://yourdomain.com/docs/api
- GitHub Issues: https://github.com/yourusername/blogplatform/issues
- Email: api@yourdomain.com
