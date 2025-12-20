'use client'

import { useState } from 'react'
import axios from 'axios'
import { Download, Upload, Database, FileJson, FileText, Package, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExportImportPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleExport = async (type: string) => {
    setIsExporting(true)
    try {
      const { data } = await axios.get(`/api/admin/export?type=${type}`, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `export-${type}-${Date.now()}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Export completed successfully')
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file')
      return
    }

    setIsImporting(true)
    const formData = new FormData()
    formData.append('file', importFile)

    try {
      const { data } = await axios.post('/api/admin/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(`Import completed: ${data.imported} items imported`)
      setImportFile(null)
    } catch (error) {
      toast.error('Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const handleBackup = async () => {
    try {
      const { data } = await axios.post('/api/admin/backup')
      toast.success('Backup created successfully')
    } catch (error) {
      toast.error('Backup failed')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Export & Import</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Export your data or import from other platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Export Data</h2>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-start gap-4 mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Export All Posts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Export all posts including content, metadata, and categories
                  </p>
                  <button
                    onClick={() => handleExport('posts')}
                    disabled={isExporting}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Posts
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-start gap-4 mb-4">
                <FileJson className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Export All Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Complete export including posts, users, comments, and settings
                  </p>
                  <button
                    onClick={() => handleExport('all')}
                    disabled={isExporting}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export All Data
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-start gap-4 mb-4">
                <Database className="h-8 w-8 text-purple-600" />
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Create Backup</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Create a full backup of your database
                  </p>
                  <button
                    onClick={handleBackup}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Create Backup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Import Data</h2>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-4">
            <div className="flex items-start gap-4">
              <Upload className="h-8 w-8 text-orange-600" />
              <div className="flex-1">
                <h3 className="font-bold mb-1">Import from JSON</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Import posts from a JSON file
                </p>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center mb-4">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="cursor-pointer"
                  >
                    <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    {importFile ? (
                      <div className="text-sm">
                        <CheckCircle className="h-5 w-5 inline text-green-600 mr-2" />
                        {importFile.name}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium mb-1">Click to upload</p>
                        <p className="text-xs text-gray-500">JSON files only</p>
                      </>
                    )}
                  </label>
                </div>

                <button
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isImporting ? 'Importing...' : 'Import Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Import from WordPress */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-bold mb-3">Import from WordPress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Import your content from WordPress XML export
            </p>
            <div className="space-y-3">
              <div className="text-sm">
                <strong>Step 1:</strong> Export your WordPress site (Tools → Export)
              </div>
              <div className="text-sm">
                <strong>Step 2:</strong> Upload the XML file using the form above
              </div>
              <div className="text-sm">
                <strong>Step 3:</strong> Our system will automatically convert and import your content
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-bold mb-4">Recent Exports</h3>
        <div className="space-y-3">
          {[
            { name: 'export-posts-1234567890.json', date: '2 hours ago', size: '2.4 MB' },
            { name: 'backup-full-1234567880.json', date: '1 day ago', size: '15.2 MB' },
            { name: 'export-all-1234567870.json', date: '3 days ago', size: '18.7 MB' },
          ].map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <FileJson className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-sm">{file.name}</div>
                  <div className="text-xs text-gray-500">{file.date} • {file.size}</div>
                </div>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
