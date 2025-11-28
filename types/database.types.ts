// Type for placed models in sandbox sessions
export interface PlacedModel {
  id: string
  modelId: string
  glbUrl: string
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

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
          obj_url: string | null
          stl_url: string | null
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
      sandbox_sessions: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          models: PlacedModel[]
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          models: PlacedModel[]
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          models?: PlacedModel[]
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type GeneratedImage = Database['public']['Tables']['images']['Row']
export type Model3D = Database['public']['Tables']['models_3d']['Row']
export type SandboxSession = Database['public']['Tables']['sandbox_sessions']['Row']

