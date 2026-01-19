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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          date_of_birth: string | null
          phone: string | null
          email: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          summary_bio: string | null
          languages: Json | null
          certifications: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          date_of_birth?: string | null
          phone?: string | null
          email?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          summary_bio?: string | null
          languages?: Json | null
          certifications?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          date_of_birth?: string | null
          phone?: string | null
          email?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          summary_bio?: string | null
          languages?: Json | null
          certifications?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      work_experiences: {
        Row: {
          id: string
          user_id: string
          company: string
          job_title: string
          location: string | null
          start_date: string
          end_date: string | null
          is_current: boolean
          duties: string | null
          achievements: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          job_title: string
          location?: string | null
          start_date: string
          end_date?: string | null
          is_current?: boolean
          duties?: string | null
          achievements?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          job_title?: string
          location?: string | null
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          duties?: string | null
          achievements?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      educations: {
        Row: {
          id: string
          user_id: string
          institution: string
          degree: string
          field_of_study: string | null
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          institution: string
          degree: string
          field_of_study?: string | null
          start_date: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          institution?: string
          degree?: string
          field_of_study?: string | null
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          user_id: string
          name: string
          category: 'Hard' | 'Soft' | 'Tool'
          proficiency: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: 'Hard' | 'Soft' | 'Tool'
          proficiency: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: 'Hard' | 'Soft' | 'Tool'
          proficiency?: number
          created_at?: string
          updated_at?: string
        }
      }
      uploaded_documents: {
        Row: {
          id: string
          user_id: string
          file_url: string
          parsed_text: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_url: string
          parsed_text?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_url?: string
          parsed_text?: string | null
          uploaded_at?: string
        }
      }
    }
  }
}

// Additional type definitions for application use
export interface Language {
  language: string;
  level: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface ManualIngestPayload {
  profile: {
    full_name?: string;
    date_of_birth?: string;
    phone?: string;
    email?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    summary_bio?: string;
    languages?: Language[];
    certifications?: Certification[];
  };
  work_experiences?: Array<{
    company: string;
    job_title: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current?: boolean;
    duties?: string;
    achievements?: string;
  }>;
  educations?: Array<{
    institution: string;
    degree: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
  }>;
  skills?: Array<{
    name: string;
    category: 'Hard' | 'Soft' | 'Tool';
    proficiency: number;
  }>;
}
