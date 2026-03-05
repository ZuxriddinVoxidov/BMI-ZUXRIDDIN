export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'director'
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected'
export type AttendanceStatus = 'present' | 'absent' | 'excused'

export interface School {
  id: string
  name: string
  district: string
}

export interface Profile {
  id: string
  user_id: string
  full_name: string
  role: UserRole
  school_id: string
  phone?: string
  parent_phone?: string
  school?: School
}

export interface Club {
  id: string
  school_id: string
  name: string
  teacher_id: string
  schedule: string
  description: string
  max_students: number
  category: string
  image_url?: string
  teacher?: Profile
  reviews?: Review[]
}

export interface Enrollment {
  id: string
  student_id: string
  club_id: string
  status: EnrollmentStatus
  created_at: string
  student?: Profile
  club?: Club
}

export interface Attendance {
  id: string
  club_id: string
  student_id: string
  date: string
  status: AttendanceStatus
  note?: string
  student?: Profile
}

export interface StudentWork {
  id: string
  student_id: string
  club_id: string
  title: string
  file_url: string
  created_at: string
}

export interface Review {
  id: string
  student_id: string
  club_id: string
  rating: number
  comment: string
  created_at: string
  student?: Profile
}

export interface Notification {
  id: string
  user_id: string
  message: string
  is_read: boolean
  created_at: string
}
