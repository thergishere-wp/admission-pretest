export type Role = 'admin' | 'teacher' | 'admission'

export interface Profile {
  id: string
  email: string
  role: Role
  full_name: string
  created_at: string
}

export interface ExamLink {
  id: string
  label: string
  url: string
  updated_at: string
  updated_by: string | null
}

export interface Session {
  id: string
  title: string
  date: string
  time: string
  duration_minutes: number
  exam_link_id: string
  status: 'open' | 'closed'
  created_by: string
  created_at: string
  exam_links?: ExamLink
}

export interface Registration {
  id: string
  session_id: string
  full_name: string
  email: string
  phone: string
  gender: string
  country: string
  admission_number: string
  upload_token: string
  upload_status: 'pending' | 'uploaded' | 'closed'
  registered_at: string
  sessions?: Session
}

export interface Upload {
  id: string
  registration_id: string
  file_url: string
  uploaded_at: string
  verified_by: string | null
  verified_at: string | null
  status: 'pending' | 'verified'
  registrations?: Registration & { sessions?: Session }
}
