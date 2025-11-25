export interface Database {
  public: {
    Tables: {
      images: {
        Row: {
          id: string
          user_id: string
          prompt: string
          image_url: string
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          image_url: string
          storage_path: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          image_url?: string
          storage_path?: string
          created_at?: string
        }
      }
      models_3d: {
        Row: {
          id: string
          user_id: string
          image_id: string
          meshy_task_id: string
          status: string
          model_url: string | null
          thumbnail_url: string | null
          glb_url: string | null
          fbx_url: string | null
          usdz_url: string | null
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          meshy_task_id: string
          status?: string
          model_url?: string | null
          thumbnail_url?: string | null
          glb_url?: string | null
          fbx_url?: string | null
          usdz_url?: string | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          meshy_task_id?: string
          status?: string
          model_url?: string | null
          thumbnail_url?: string | null
          glb_url?: string | null
          fbx_url?: string | null
          usdz_url?: string | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
    }
  }
}

export type GeneratedImage = Database['public']['Tables']['images']['Row']
export type Model3D = Database['public']['Tables']['models_3d']['Row']

