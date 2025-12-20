"use client"

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Calendar, User, Clock, Edit, Trash2, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

interface Task {
  id: string
  title: string
  description?: string
  topic?: string
  deadline: string
  status: string
  assignedTo: { name: string; email: string; id: string }
  post?: { id: string; title: string; slug: string }
}

interface UserOption {
  id: string
  name: string
  email: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    topic: '',
    deadline: '',
    assignedToId: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadTasks()
    loadUsers()
  }, [])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get('/api/admin/tasks')
      setTasks(data.tasks)
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data } = await axios.get('/api/users')
      setUsers(data.users)
    } catch (error) {
      // ignore
    }
  }

  const handleCreate = async () => {
    if (!form.title || !form.deadline || !form.assignedToId) {
      toast.error('Title, deadline, and assignee are required')
      return
    }
    setIsSubmitting(true)
    try {
      await axios.post('/api/admin/tasks', form)
      toast.success('Task assigned')
      setShowForm(false)
      setForm({ title: '', description: '', topic: '', deadline: '', assignedToId: '' })
      loadTasks()
    } catch (error) {
      toast.error('Failed to assign task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Task Assignment</h1>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-5 w-5" /> Assign Task
        </button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-primary-600 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Assign New Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Topic</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.topic}
                onChange={e => setForm({ ...form, topic: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Deadline</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Assign To</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.assignedToId}
                onChange={e => setForm({ ...form, assignedToId: e.target.value })}
              >
                <option value="">Select user</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              onClick={handleCreate}
              disabled={isSubmitting}
            >
              Assign
            </button>
            <button
              className="px-4 py-2 border rounded hover:bg-gray-100"
              onClick={() => setShowForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tasks assigned</div>
        ) : tasks.map(task => (
          <div key={task.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-primary-600" />
                <span className="font-semibold">{task.assignedTo.name}</span>
                <span className="text-xs text-gray-500 ml-2">({task.assignedTo.email})</span>
              </div>
              <div className="font-bold text-lg mb-1">{task.title}</div>
              {task.topic && <div className="text-sm text-gray-600 mb-1">Topic: {task.topic}</div>}
              {task.description && <div className="text-sm text-gray-500 mb-1">{task.description}</div>}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" /> {new Date(task.deadline).toLocaleString()}
                <span className="ml-4">Status: <span className="font-semibold">{task.status}</span></span>
              </div>
              {task.post && (
                <div className="mt-2 text-sm">
                  Linked Post: <a href={`/admin/posts/${task.post.slug}`} className="text-primary-600 underline">{task.post.title}</a>
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <button
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition flex items-center gap-1"
                title="Send Reminder"
                onClick={async () => {
                  try {
                    await axios.post(`/api/admin/tasks/${task.id}/remind`)
                    toast.success('Reminder sent!')
                  } catch {
                    toast.error('Failed to send reminder')
                  }
                }}
              >
                <Bell className="h-5 w-5" />
                <span className="hidden md:inline">Send Reminder</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
