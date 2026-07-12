export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tutorials: {
        Row: {
          id: string
          title: string
          category: string
          difficulty: string
          duration: string
          cover_image: string | null
          summary: string
          steps: Json
          tools: string[]
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          difficulty?: string
          duration?: string
          cover_image?: string | null
          summary?: string
          steps?: Json
          tools?: string[]
          view_count?: number
        }
        Update: {
          id?: string
          title?: string
          category?: string
          difficulty?: string
          duration?: string
          cover_image?: string | null
          summary?: string
          steps?: Json
          tools?: string[]
          view_count?: number
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          images: string[]
          tags: string[]
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          images?: string[]
          tags?: string[]
          likes_count?: number
        }
        Update: {
          title?: string
          content?: string
          images?: string[]
          tags?: string[]
          likes_count?: number
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
        }
        Update: {}
      }
      post_collections: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
        }
        Update: {}
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
        }
        Update: {
          content?: string
        }
      }
      profiles: {
        Row: {
          id: string
          nickname: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          nickname: string
          avatar_url?: string | null
        }
        Update: {
          nickname?: string
          avatar_url?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
