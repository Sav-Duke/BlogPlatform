'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Upload, Search, Trash2, Image as ImageIcon, File, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface Media {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt: string | null
  caption: string | null
  createdAt: Date
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    try {
      const { data } = await axios.get('/api/admin/media')
      setMedia(data.media)
    } catch (error) {
      toast.error('Failed to load media')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      toast.success(`${files.length} file(s) uploaded successfully`)
      loadMedia()
    } catch (error) {
      toast.error('Failed to upload files')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media file?')) return

    try {
      await axios.delete(`/api/admin/media/${id}`)
      toast.success('Media deleted successfully')
      setMedia(media.filter((m) => m.id !== id))
      if (selectedMedia?.id === id) setSelectedMedia(null)
    } catch (error) {
      toast.error('Failed to delete media')
    }
  }

  const handleUpdateMetadata = async () => {
    if (!selectedMedia) return

    try {
      await axios.patch(`/api/admin/media/${selectedMedia.id}`, {
        alt: selectedMedia.alt,
        caption: selectedMedia.caption,
      })
      toast.success('Media updated successfully')
      loadMedia()
    } catch (error) {
      toast.error('Failed to update media')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const filteredMedia = media.filter((m) =>
    m.originalName.toLowerCase().includes(search.toLowerCase()) ||
    m.alt?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Media Library</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your images and files
          </p>
        </div>
        <label className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition cursor-pointer flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {isUploading ? 'Uploading...' : 'Upload Files'}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Grid */}
        <div className="lg:col-span-2">
          {filteredMedia.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No media files found</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition cursor-pointer">
                <Upload className="h-4 w-4" />
                Upload Your First File
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className={`group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                    selectedMedia?.id === item.id
                      ? 'border-primary-600 ring-2 ring-primary-600'
                      : 'border-gray-200 dark:border-gray-800 hover:border-primary-400'
                  }`}
                >
                  {item.mimeType.startsWith('image/') ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <File className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedMedia ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">File Details</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selectedMedia.mimeType.startsWith('image/') ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.alt || selectedMedia.originalName}
                  className="w-full rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                  <File className="h-16 w-16 text-gray-400" />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">File Name</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                    {selectedMedia.originalName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">File Type</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedMedia.mimeType}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">File Size</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFileSize(selectedMedia.size)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Uploaded</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(selectedMedia.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL</label>
                  <input
                    type="text"
                    value={selectedMedia.url}
                    readOnly
                    onClick={(e) => {
                      e.currentTarget.select()
                      navigator.clipboard.writeText(selectedMedia.url)
                      toast.success('URL copied to clipboard')
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Alt Text</label>
                  <input
                    type="text"
                    value={selectedMedia.alt || ''}
                    onChange={(e) =>
                      setSelectedMedia({ ...selectedMedia, alt: e.target.value })
                    }
                    placeholder="Describe the image..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Caption</label>
                  <textarea
                    value={selectedMedia.caption || ''}
                    onChange={(e) =>
                      setSelectedMedia({ ...selectedMedia, caption: e.target.value })
                    }
                    placeholder="Add a caption..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-900"
                  />
                </div>

                <button
                  onClick={handleUpdateMetadata}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Update Metadata
                </button>

                <button
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete File
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a file to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
