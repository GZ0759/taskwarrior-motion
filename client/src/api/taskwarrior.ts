import axios from 'axios'
import type { Task, CreateTaskRequest, UpdateTaskRequest, MessageResponse } from '@/types/task'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const taskApi = {
  async getTasks(params?: { filter?: string; sort?: string; search?: string }): Promise<Task[]> {
    const { data } = await api.get<Task[]>('/tasks', { params })
    return data
  },

  async getTask(uuid: string): Promise<Task> {
    const { data } = await api.get<Task>(`/tasks/${uuid}`)
    return data
  },

  async createTask(task: CreateTaskRequest): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>('/tasks', task)
    return data
  },

  async updateTask(uuid: string, task: UpdateTaskRequest): Promise<MessageResponse> {
    const { data } = await api.put<MessageResponse>(`/tasks/${uuid}`, task)
    return data
  },

  async deleteTask(uuid: string): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`/tasks/${uuid}`)
    return data
  },

  async doneTask(uuid: string): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(`/tasks/${uuid}/done`)
    return data
  },

  async uncompleteTask(uuid: string): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(`/tasks/${uuid}/uncomplete`)
    return data
  },

  async startTask(uuid: string): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(`/tasks/${uuid}/start`)
    return data
  },

  async stopTask(uuid: string): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(`/tasks/${uuid}/stop`)
    return data
  },

  async undo(): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>('/undo')
    return data
  },
}
