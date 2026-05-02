/**
 * Supabase 数据库类型定义
 * 用于解决 TypeScript 类型推断问题
 */

// 数据库类型
export interface Database {
  public: {
    Tables: {
      news: {
        Row: {
          id: string
          website_id: string | null
          title: string
          category: string | null
          excerpt: string | null
          content: string
          image: string | null
          date: string | null
          tags: string[] | null
          is_published: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          website_id?: string | null
          title: string
          category?: string | null
          excerpt?: string | null
          content: string
          image?: string | null
          date?: string | null
          tags?: string[] | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          website_id?: string | null
          title?: string
          category?: string | null
          excerpt?: string | null
          content?: string
          image?: string | null
          date?: string | null
          tags?: string[] | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
      }
      pages: {
        Row: {
          id: string
          website_id: string | null
          name: string
          path: string | null
          description: string | null
          nav_sort_order: number | null
          is_nav_visible: boolean | null
          is_footer_visible: boolean | null
          seo: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          website_id?: string | null
          name: string
          path?: string | null
          description?: string | null
          nav_sort_order?: number | null
          is_nav_visible?: boolean | null
          is_footer_visible?: boolean | null
          seo?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          website_id?: string | null
          name?: string
          path?: string | null
          description?: string | null
          nav_sort_order?: number | null
          is_nav_visible?: boolean | null
          is_footer_visible?: boolean | null
          seo?: Json | null
          created_at?: string
          updated_at?: string | null
        }
      }
      blocks: {
        Row: {
          id: string
          page_id: string
          type: string | null
          title: string | null
          sort_order: number | null
          config: Json | null
          is_published: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          page_id: string
          type?: string | null
          title?: string | null
          sort_order?: number | null
          config?: Json | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          page_id?: string
          type?: string | null
          title?: string | null
          sort_order?: number | null
          config?: Json | null
          is_published?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          email: string | null
          company: string | null
          message: string | null
          is_processed: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          phone?: string | null
          email?: string | null
          company?: string | null
          message?: string | null
          is_processed?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          phone?: string | null
          email?: string | null
          company?: string | null
          message?: string | null
          is_processed?: boolean | null
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          site_name: string | null
          company_name: string | null
          slogan: string | null
          description: string | null
          site_logo: string | null
          site_favicon: string | null
          icp: string | null
          contact: Json | null
          nav_config: Json | null
          footer_config: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          site_name?: string | null
          company_name?: string | null
          slogan?: string | null
          description?: string | null
          site_logo?: string | null
          site_favicon?: string | null
          icp?: string | null
          contact?: Json | null
          nav_config?: Json | null
          footer_config?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          site_name?: string | null
          company_name?: string | null
          slogan?: string | null
          description?: string | null
          site_logo?: string | null
          site_favicon?: string | null
          icp?: string | null
          contact?: Json | null
          nav_config?: Json | null
          footer_config?: Json | null
          created_at?: string
          updated_at?: string | null
        }
      }
      admin_profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          role: string | null
          is_active: boolean | null
          last_login_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          role?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          role?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      websites: {
        Row: {
          id: string
          name: string | null
          url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          url?: string | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// JSON 类型别名
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
