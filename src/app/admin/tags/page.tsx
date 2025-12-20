'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import slugify from 'slugify'

interface TagType {
  id: string
  name: string
  slug: string
  _count?: {
    posts: number
  }
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const { data } = await axios.get('/api/tags')
      setTags(data)
    } catch (error) {
      toast.error('Failed to load tags')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Tag name is required')
      return
    }

    try {
      if (editingTag) {
        await axios.put(`/api/tags/${editingTag.id}`, formData)
        toast.success('Tag updated')
      } else {
        await axios.post('/api/tags', formData)
        toast.success('Tag created')
      }
      setShowModal(false)
      resetForm()
      loadTags()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save tag')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tag? It will be removed from all posts.')) return

    try {
      await axios.delete(`/api/tags/${id}`)
      toast.success('Tag deleted')
      loadTags()
    } catch (error) {
      toast.error('Failed to delete tag')
    }
  }

  const openEditModal = (tag: TagType) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      slug: tag.slug,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingTag(null)
    setFormData({ name: '', slug: '' })
  }

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tags</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Label and organize your content with tags
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="h-5 w-5" />
          New Tag
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      {/* Tags Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Slug</th>
                <th className="text-left p-4 font-semibold">Posts</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.map((tag) => (
                <tr
                  key={tag.id}
                  className="border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary-600" />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    /{tag.slug}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {tag._count?.posts || 0}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(tag)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingTag ? 'Edit Tag' : 'New Tag'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData({
                      ...formData,
                      name,
                      slug: slugify(name, { lower: true, strict: true })
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  {editingTag ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
