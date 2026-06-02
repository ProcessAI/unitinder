export type UserRole = 'usuario' | 'empresa'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export interface Company {
  id: string
  name: string
  email: string
  role: UserRole
  logoUrl?: string
  description?: string
}

export interface Job {
  id: string
  title: string
  description: string
  companyId: string
  companyName: string
  location: string
  createdAt: string
}

export interface Match {
  id: string
  jobId: string
  userId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export interface AlertProps {
  type: 'success' | 'error'
  message: string
  onClose?: () => void
}
