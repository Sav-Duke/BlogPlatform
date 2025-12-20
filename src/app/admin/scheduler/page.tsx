
'use client'
import TaskLinker from './TaskLinker'
interface Task {
  id: string
  title: string
  deadline: string
  assignedTo: { id: string; name: string }
}

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Calendar, Clock, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScheduledPost {
  id: string
  title: string
  slug: string
  scheduledFor: Date
  status: string
  author: {
    name: string | null
  }
}

export default function SchedulerPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [showLinker, setShowLinker] = useState<{ task: Task } | null>(null)
    useEffect(() => {
      loadTasks()
    }, [])

    const loadTasks = async () => {
      try {
        const { data } = await axios.get('/api/admin/tasks')
        setTasks(data.tasks)
      } catch {
        // ignore
      }
    }
    const handleLinked = () => {
      setShowLinker(null)
      loadScheduledPosts()
      loadTasks()
    }
    // Render tasks with option to link drafts
    const renderTasks = () => (
      <div className="my-8">
        <h2 className="text-xl font-bold mb-4">Unlinked Tasks (Assign Drafts to Auto-Post)</h2>
        <div className="space-y-4">
          {tasks.filter(t => !t.post).map(task => (
            <div key={task.id} className="p-4 border rounded bg-white dark:bg-gray-900 flex items-center justify-between">
              <div>
                <div className="font-semibold">{task.title}</div>
                <div className="text-sm text-gray-500">Deadline: {new Date(task.deadline).toLocaleString()} | Assigned to: {task.assignedTo.name}</div>
              </div>
              <button className="px-3 py-1 bg-primary-600 text-white rounded" onClick={() => setShowLinker({ task })}>Link Draft</button>
            </div>
          ))}
          {tasks.filter(t => !t.post).length === 0 && <div className="text-gray-500">All tasks have drafts linked.</div>}
        </div>
        {showLinker && <div className="mt-4"><TaskLinker task={showLinker.task} onLinked={handleLinked} /></div>}
      </div>
    )
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [view, setView] = useState<'list' | 'calendar'>('calendar')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadScheduledPosts()
  }, [])

  const loadScheduledPosts = async () => {
    try {
      const { data } = await axios.get('/api/admin/scheduler')
      setScheduledPosts(data.posts)
    } catch (error) {
      toast.error('Failed to load scheduled posts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchedule = async (postId: string, scheduledFor: Date) => {
    try {
      await axios.post('/api/admin/scheduler', { postId, scheduledFor })
      toast.success('Post scheduled successfully')
      loadScheduledPosts()
    } catch (error) {
      toast.error('Failed to schedule post')
    }
  }

  const handleUnschedule = async (postId: string) => {
    try {
      await axios.delete(`/api/admin/scheduler/${postId}`)
      toast.success('Schedule removed')
      loadScheduledPosts()
    } catch (error) {
      toast.error('Failed to remove schedule')
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledFor)
      return postDate.toDateString() === date.toDateString()
    })
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedDate)
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200 dark:border-gray-800" />)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const posts = getPostsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      
      days.push(
        <div
          key={day}
          className={`p-2 border border-gray-200 dark:border-gray-800 min-h-[100px] ${
            isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''
          }`}
        >
          <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary-600' : ''}`}>
            {day}
          </div>
          <div className="space-y-1">
            {posts.map(post => (
              <div
                key={post.id}
                className="text-xs p-2 bg-primary-100 dark:bg-primary-900/30 rounded cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-900/50 transition"
                title={post.title}
              >
                <div className="font-medium truncate">{post.title}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {new Date(post.scheduledFor).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    return days
  }

  const changeMonth = (increment: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + increment, 1))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Scheduler</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan and schedule your content publishing
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg ${
              view === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg ${
              view === 'calendar'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {renderTasks()}
      {view === 'calendar' ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              ← Prev
            </button>
            <h2 className="text-xl font-bold">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-bold border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          {/* List View */}
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {scheduledPosts.map(post => (
              <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.scheduledFor).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(post.scheduledFor).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>by {post.author.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUnschedule(post.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Remove schedule"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {scheduledPosts.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled posts</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-6 w-6 text-blue-600" />
            <span className="text-2xl font-bold">{scheduledPosts.length}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Posts</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-2xl font-bold">
              {scheduledPosts.filter(p => new Date(p.scheduledFor) < new Date()).length}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Published This Week</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <span className="text-2xl font-bold">
              {scheduledPosts.filter(p => {
                const diff = new Date(p.scheduledFor).getTime() - new Date().getTime()
                return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
              }).length}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming This Week</p>
        </div>
      </div>
    </div>
  )
}
