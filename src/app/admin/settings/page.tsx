'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // General
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    siteLanguage: 'en',
    timezone: 'UTC',
    dateFormat: 'MMMM D, YYYY',
    timeFormat: '12h',
    
    // Writing
    defaultAuthor: '',
    postsPerPage: 10,
    excerptLength: 150,
    autoSave: true,
    autoSaveInterval: 60,
    
    // Comments
    commentsEnabled: true,
    commentApproval: true,
    commentModeration: false,
    allowAnonymousComments: false,
    maxCommentLength: 1000,
    
    // Media
    maxUploadSize: 10,
    allowedImageTypes: 'jpg,png,gif,webp',
    imageQuality: 80,
    generateThumbnails: true,
    
    // SEO
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    sitemapEnabled: true,
    robotsTxtEnabled: true,
    
    // Social
    ogImage: '',
    twitterCard: 'summary_large_image',
    facebookAppId: '',
    
    // Security
    allowRegistration: false,
    requireEmailVerification: true,
    passwordMinLength: 8,
    enableTwoFactor: false,
    sessionTimeout: 30,
    
    // Performance
    cacheEnabled: true,
    cacheDuration: 3600,
    compressionEnabled: true,
    
    // Email
    emailFrom: '',
    emailNotifications: true,
    notifyOnComment: true,
    notifyOnNewUser: false,
    
    // Backup
    autoBackupEnabled: false,
    backupFrequency: 'weekly',
    backupRetention: 30,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings')
      setSettings(prev => ({
        ...prev,
        siteName: data.siteName || '',
        siteDescription: data.siteDescription || '',
        siteUrl: data.siteUrl || '',
        postsPerPage: data.postsPerPage || 10,
        commentsEnabled: data.allowComments ?? true,
        commentApproval: data.moderateComments ?? true,
        allowRegistration: false,
      }))
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await axios.put('/api/settings', settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const tabs = [
    { id: 'general', label: 'General', desc: 'Site identity and branding' },
    { id: 'localization', label: 'Localization', desc: 'Language, region, and time settings' },
    { id: 'writing', label: 'Writing', desc: 'Writing and reading preferences' },
    { id: 'media', label: 'Media', desc: 'Media handling and storage rules' },
    { id: 'seo', label: 'SEO', desc: 'SEO and social sharing settings' },
    { id: 'security', label: 'Security', desc: 'Security and protection controls' },
    { id: 'performance', label: 'Performance', desc: 'Performance and caching options' },
    { id: 'email', label: 'Email', desc: 'Notification and email settings' },
    { id: 'backup', label: 'Backup', desc: 'Backup, restore, and maintenance tools' },
    { id: 'account', label: 'Account', desc: 'Change your password' },
  ]
  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      await axios.post('/api/users/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };
        {/* Account Tab: Change Password */}
        {activeTab === 'account' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your blog's global settings
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Site Identity</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Site Description</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Site URL</label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Localization Tab */}
        {activeTab === 'localization' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Language & Region</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Language</label>
                  <select
                    value={settings.siteLanguage}
                    onChange={(e) => setSettings({ ...settings, siteLanguage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date Format</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  >
                    <option value="MMMM D, YYYY">January 1, 2024</option>
                    <option value="DD/MM/YYYY">01/01/2024</option>
                    <option value="MM/DD/YYYY">01/01/2024</option>
                    <option value="YYYY-MM-DD">2024-01-01</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time Format</label>
                  <select
                    value={settings.timeFormat}
                    onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  >
                    <option value="12h">12-hour (3:30 PM)</option>
                    <option value="24h">24-hour (15:30)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Writing Tab */}
        {activeTab === 'writing' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Content Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Posts Per Page</label>
                  <input
                    type="number"
                    value={settings.postsPerPage}
                    onChange={(e) => setSettings({ ...settings, postsPerPage: parseInt(e.target.value) || 10 })}
                    min="1"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt Length (words)</label>
                  <input
                    type="number"
                    value={settings.excerptLength}
                    onChange={(e) => setSettings({ ...settings, excerptLength: parseInt(e.target.value) || 150 })}
                    min="50"
                    max="500"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Enable auto-save</span>
                </label>
                <div>
                  <label className="block text-sm font-medium mb-2">Auto-save Interval (seconds)</label>
                  <input
                    type="number"
                    value={settings.autoSaveInterval}
                    onChange={(e) => setSettings({ ...settings, autoSaveInterval: parseInt(e.target.value) || 60 })}
                    min="30"
                    max="300"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Comments</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.commentsEnabled}
                    onChange={(e) => setSettings({ ...settings, commentsEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Enable comments on posts</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.commentApproval}
                    onChange={(e) => setSettings({ ...settings, commentApproval: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Comments require approval</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.commentModeration}
                    onChange={(e) => setSettings({ ...settings, commentModeration: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Enable comment moderation queue</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.allowAnonymousComments}
                    onChange={(e) => setSettings({ ...settings, allowAnonymousComments: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Allow anonymous comments</span>
                </label>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Comment Length</label>
                  <input
                    type="number"
                    value={settings.maxCommentLength}
                    onChange={(e) => setSettings({ ...settings, maxCommentLength: parseInt(e.target.value) || 1000 })}
                    min="100"
                    max="5000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Media Upload Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Upload Size (MB)</label>
                  <input
                    type="number"
                    value={settings.maxUploadSize}
                    onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) || 10 })}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Allowed Image Types</label>
                  <input
                    type="text"
                    value={settings.allowedImageTypes}
                    onChange={(e) => setSettings({ ...settings, allowedImageTypes: e.target.value })}
                    placeholder="jpg,png,gif,webp"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                  <p className="text-sm text-gray-500 mt-1">Comma-separated file extensions</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image Quality (%)</label>
                  <input
                    type="number"
                    value={settings.imageQuality}
                    onChange={(e) => setSettings({ ...settings, imageQuality: parseInt(e.target.value) || 80 })}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.generateThumbnails}
                    onChange={(e) => setSettings({ ...settings, generateThumbnails: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Auto-generate thumbnails</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Default SEO Title</label>
                  <input
                    type="text"
                    value={settings.seoTitle}
                    onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default SEO Description</label>
                  <textarea
                    value={settings.seoDescription}
                    onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default Keywords</label>
                  <input
                    type="text"
                    value={settings.seoKeywords}
                    onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.sitemapEnabled}
                    onChange={(e) => setSettings({ ...settings, sitemapEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Enable sitemap.xml generation</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.robotsTxtEnabled}
                    onChange={(e) => setSettings({ ...settings, robotsTxtEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Enable robots.txt</span>
                </label>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Social Media</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Open Graph Image URL</label>
                  <input
                    type="url"
                    value={settings.ogImage}
                    onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
                    placeholder="https://example.com/og-image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter Card Type</label>
                  <select
                    value={settings.twitterCard}
                    onChange={(e) => setSettings({ ...settings, twitterCard: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Facebook App ID</label>
                  <input
                    type="text"
                    value={settings.facebookAppId}
                    onChange={(e) => setSettings({ ...settings, facebookAppId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">User Security</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Allow user registration</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Require email verification</span>
                </label>
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Password Length</label>
                  <input
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) || 8 })}
                    min="6"
                    max="32"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.enableTwoFactor}
                    onChange={(e) => setSettings({ ...settings, enableTwoFactor: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Enable two-factor authentication</span>
                </label>
                <div>
                  <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
                    min="5"
                    max="1440"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Caching & Optimization</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.cacheEnabled}
                    onChange={(e) => setSettings({ ...settings, cacheEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Enable caching</span>
                </label>
                <div>
                  <label className="block text-sm font-medium mb-2">Cache Duration (seconds)</label>
                  <input
                    type="number"
                    value={settings.cacheDuration}
                    onChange={(e) => setSettings({ ...settings, cacheDuration: parseInt(e.target.value) || 3600 })}
                    min="60"
                    max="86400"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.compressionEnabled}
                    onChange={(e) => setSettings({ ...settings, compressionEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Enable gzip compression</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">From Email Address</label>
                  <input
                    type="email"
                    value={settings.emailFrom}
                    onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                    placeholder="noreply@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Enable email notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnComment}
                    onChange={(e) => setSettings({ ...settings, notifyOnComment: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Notify on new comments</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnNewUser}
                    onChange={(e) => setSettings({ ...settings, notifyOnNewUser: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Notify on new user registrations</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Backup & Restore</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.autoBackupEnabled}
                    onChange={(e) => setSettings({ ...settings, autoBackupEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Enable automatic backups</span>
                </label>
                <div>
                  <label className="block text-sm font-medium mb-2">Backup Frequency</label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Backup Retention (days)</label>
                  <input
                    type="number"
                    value={settings.backupRetention}
                    onChange={(e) => setSettings({ ...settings, backupRetention: parseInt(e.target.value) || 30 })}
                    min="1"
                    max="365"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => toast.success('Backup created successfully')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Create Backup Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
