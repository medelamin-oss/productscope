export type UserRole = 'free' | 'subscribed' | 'canceled'
export type AnalysisStatus = 'processing' | 'completed' | 'failed'
export type ContentLanguage = 'en' | 'ar'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  trial_used: boolean
  paddle_subscription_id: string | null
  subscription_plan: 'monthly' | 'yearly' | null
  subscription_end: string | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  product_url: string | null
  product_image_url: string | null
  product_name: string | null
  language: ContentLanguage
  created_at: string
}

export interface AnalysisResult {
  id: string
  project_id: string
  status: AnalysisStatus
  error_message: string | null
  product_description: string | null
  ad_headlines: string[] | null
  marketing_hooks: string[] | null
  strengths: string[] | null
  weaknesses: string[] | null  // stores marketing angles from AI
  target_audience: string | null
  main_objection: string | null
  objection_response: string | null
  created_at: string
  completed_at: string | null
}
