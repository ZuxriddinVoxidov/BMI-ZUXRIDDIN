-- Performance indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_attendance_club_date ON public.attendance(club_id, date);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_status ON public.enrollments(student_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_point_transactions_student ON public.point_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON public.ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_parent_requests_status ON public.parent_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_clubs_school ON public.clubs(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles(user_id);
