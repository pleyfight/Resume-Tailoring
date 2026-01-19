-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    date_of_birth DATE,
    phone TEXT,
    email TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    summary_bio TEXT,
    languages JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Work Experiences Table
CREATE TABLE work_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    job_title TEXT NOT NULL,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    duties TEXT,
    achievements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Educations Table
CREATE TABLE educations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Skills Table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('Hard', 'Soft', 'Tool')),
    proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Uploaded Documents Table
CREATE TABLE uploaded_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    parsed_text TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_work_experiences_user_id ON work_experiences(user_id);
CREATE INDEX idx_educations_user_id ON educations(user_id);
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_uploaded_documents_user_id ON uploaded_documents(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for Work Experiences
CREATE POLICY "Users can view own work experiences"
    ON work_experiences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work experiences"
    ON work_experiences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work experiences"
    ON work_experiences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own work experiences"
    ON work_experiences FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for Educations
CREATE POLICY "Users can view own educations"
    ON educations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own educations"
    ON educations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own educations"
    ON educations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own educations"
    ON educations FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for Skills
CREATE POLICY "Users can view own skills"
    ON skills FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
    ON skills FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
    ON skills FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
    ON skills FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for Uploaded Documents
CREATE POLICY "Users can view own documents"
    ON uploaded_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
    ON uploaded_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
    ON uploaded_documents FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_experiences_updated_at BEFORE UPDATE ON work_experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educations_updated_at BEFORE UPDATE ON educations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
