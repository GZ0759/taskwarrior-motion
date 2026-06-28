export interface Task {
  uuid: string
  description: string
  status: 'pending' | 'completed' | 'deleted' | 'started' | 'on-hold' | 'recurring' | 'waiting'
  project?: string
  tags?: string[]
  priority?: 'H' | 'M' | 'L'
  due?: string
  wait?: string
  scheduled?: string
  recur?: string
  depends?: string[]
  entry: string
  modified: string
  end?: string
  start?: string
  urgency: number
  id: number
}

export interface CreateTaskRequest {
  description: string
  project?: string
  tags?: string[]
  priority?: 'H' | 'M' | 'L'
  due?: string
  wait?: string
  scheduled?: string
  recur?: string
  until?: string
  depends?: string[]
}

export interface UpdateTaskRequest {
  description?: string
  project?: string
  tags?: string[]
  priority?: 'H' | 'M' | 'L'
  due?: string
  wait?: string
  scheduled?: string
  recur?: string
  until?: string
  depends?: string[]
}

export interface MessageResponse {
  message: string
}
