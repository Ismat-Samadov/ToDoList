// components/TaskList.tsx
'use client'

import { useEffect, useState } from 'react'
import { Trash2, CheckCircle, Circle } from 'lucide-react'

interface Task {
  id: string
  title: string
  completed: boolean
  description?: string
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const response = await fetch('/api/tasks')
    const data = await response.json()
    setTasks(data)
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !task.completed }),
    })
    fetchTasks()
  }

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    })
    fetchTasks()
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleTask(task.id)}
              className={`text-2xl ${task.completed ? 'text-green-500' : 'text-gray-400'}`}
            >
              {task.completed ? <CheckCircle /> : <Circle />}
            </button>
            <div>
              <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-500">{task.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => deleteTask(task.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </li>
      ))}
    </ul>
  )
}

// components/AddTask.tsx
'use client'

import { useState } from 'react'

export default function AddTask() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    })

    setTitle('')
    setDescription('')
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description (optional)"
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Add Task
      </button>
    </form>
  )
}