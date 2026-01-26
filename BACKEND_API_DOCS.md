# Resume Tailoring Backend - API Documentation

## Overview
This backend implements a complete Resume Tailoring system using:
- **Database:** Supabase (PostgreSQL)
- **API:** Next.js App Router (Next.js 16)
- **AI:** Google Gemini 1.5 Flash

---

## 🗄️ Database Schema

### Tables Created
1. **profiles** - User profile information
2. **work_experiences** - Employment history
3. **educations** - Educational background
4. **skills** - Technical and soft skills
5. **uploaded_documents** - Resume file uploads

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic timestamp tracking with triggers

---

## 📡 API Endpoints

### 1. POST `/api/ingest/manual`
**Purpose:** Bulk insert/upsert user data from manual entry forms

**Request Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "profile": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "summary_bio": "Experienced software engineer...",
    "languages": [
      { "language": "English", "level": "Native" },
      { "language": "Spanish", "level": "Intermediate" }
    ],
    "certifications": [
      { "name": "AWS Certified", "issuer": "Amazon", "year": "2023" }
    ]
  },
  "work_experiences": [
    {
      "company": "Tech Corp",
      "job_title": "Senior Developer",
      "location": "San Francisco, CA",
      "start_date": "2020-01-15",
      "end_date": "2023-12-31",
      "is_current": false,
      "duties": "Led development team...",
      "achievements": "Increased performance by 40%, reduced costs by $200K"
    }
  ],
  "educations": [
    {
      "institution": "MIT",
      "degree": "Bachelor of Science",
      "field_of_study": "Computer Science",
      "start_date": "2015-09-01",
      "end_date": "2019-06-01"
    }
  ],
  "skills": [
    {
      "name": "JavaScript",
      "category": "Hard",
      "proficiency": 95
    },
    {
      "name": "Leadership",
      "category": "Soft",
      "proficiency": 85
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data ingested successfully",
  "results": {
    "profile": { /* profile data */ },
    "work_experiences": [ /* array of work experiences */ ],
    "educations": [ /* array of educations */ ],
    "skills": [ /* array of skills */ ]
  }
}
```

---

### 2. POST `/api/ingest/document`
**Purpose:** Upload resume documents (PDF, DOC, DOCX, TXT)

**Request Headers:**
```
Authorization: Bearer <user_token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
file: <File object>
```

**Validation:**
- Max file size: 10MB
- Allowed types: PDF, DOC, DOCX, TXT

**Success Response (200):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "uuid",
    "file_url": "https://...",
    "uploaded_at": "2026-01-14T10:30:00Z",
    "has_parsed_text": false
  }
}
```

**GET `/api/ingest/document`** - Retrieve all uploaded documents
```json
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "file_url": "https://...",
      "uploaded_at": "2026-01-14T10:30:00Z"
    }
  ]
}
```

---

### 3. POST `/api/generate`
**Purpose:** Generate AI-tailored resume based on job description

**Request Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobDescription": "We are looking for a Senior Full-Stack Developer with expertise in React, Node.js, and AWS...",
  "useDocuments": false
}
```

**Parameters:**
- `jobDescription` (string, required) - The target job posting
- `useDocuments` (boolean, optional) - If `true`, uses uploaded documents; if `false` (default), uses manual entries

**Success Response (200):**
```json
{
  "success": true,
  "generatedAt": "2026-01-14T10:35:00Z",
  "tailoredResume": {
    "summary": "Results-driven Full-Stack Developer with 5+ years...",
    "workExperiences": [
      {
        "company": "Tech Corp",
        "jobTitle": "Senior Developer",
        "location": "San Francisco, CA",
        "startDate": "2020-01",
        "endDate": "2023-12",
        "highlights": [
          "Built scalable React applications serving 1M+ users",
          "Reduced AWS infrastructure costs by 35% through optimization"
        ]
      }
    ],
    "skills": {
      "technical": ["React", "Node.js", "TypeScript"],
      "tools": ["AWS", "Docker", "Git"],
      "soft": ["Leadership", "Communication"]
    },
    "education": [
      {
        "institution": "MIT",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "graduationDate": "2019-06"
      }
    ],
    "matchScore": 87,
    "keyStrengths": [
      "Strong React and Node.js experience",
      "Proven AWS expertise",
      "Track record of performance optimization"
    ],
    "recommendations": [
      "Highlight specific AWS services used in projects",
      "Add metrics for team leadership experience"
    ]
  }
}
```

---

## 🔐 Authentication

All endpoints require authentication via Bearer token:

```javascript
const response = await fetch('/api/ingest/manual', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

Get user token from Supabase:
```javascript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

---

## 🚀 Setup Instructions

### 1. Database Setup
Run the migration in Supabase SQL Editor:
```bash
# File: supabase/migrations/001_initial_schema.sql
```

### 2. Storage Setup
Create a storage bucket in Supabase:
- Bucket name: `resumes`
- Public access: Enabled (or configure RLS)

### 3. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key
```

### 4. Install Dependencies
```bash
npm install @supabase/supabase-js @google/generative-ai
```

---

## 📊 Data Flow

### Manual Entry Flow
1. Frontend form → POST `/api/ingest/manual`
2. Validate authentication
3. Transaction-style inserts to all tables
4. Return success with inserted data

### Document Upload Flow
1. File upload → POST `/api/ingest/document`
2. Validate file type/size
3. Upload to Supabase Storage (`resumes` bucket)
4. Save reference in `uploaded_documents` table
5. (Future) Trigger OCR/text extraction

### Resume Generation Flow
1. Job description → POST `/api/generate`
2. Fetch user context (documents OR manual entries)
3. Build AI prompt with user data + job description
4. Call Gemini 1.5 Flash
5. Parse JSON response
6. Return tailored resume structure

---

## 🎯 AI Prompt Strategy

The `/api/generate` endpoint uses a sophisticated prompt that:
- Prioritizes **achievements** over duties
- Maps user skills to job requirements
- Generates ATS-friendly content
- Provides match score and recommendations
- Outputs structured JSON for easy rendering

---

## 🔧 Future Enhancements

1. **OCR Integration** - Extract text from uploaded PDFs/images
2. **Vector Search** - Semantic matching of skills to job descriptions
3. **Resume Templates** - Multiple export formats (PDF, DOCX)
4. **Version History** - Track different resume versions
5. **Cover Letter Generation** - AI-powered cover letters

---

## 📝 Example Client Usage

```typescript
// Manual data ingestion
const ingestManualData = async (data: ManualIngestPayload) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch('/api/ingest/manual', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
};

// Document upload
const uploadDocument = async (file: File) => {
  const { data: { session } } = await supabase.auth.getSession();
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/ingest/document', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`
    },
    body: formData
  });
  
  return response.json();
};

// Generate tailored resume
const generateResume = async (jobDescription: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      jobDescription,
      useDocuments: false 
    })
  });
  
  return response.json();
};
```

---

## 🐛 Error Handling

All endpoints return consistent error formats:

```json
{
  "error": "Error description",
  "details": "Specific error details"
}
```

Common HTTP status codes:
- `200` - Success
- `207` - Partial success (multi-status)
- `400` - Bad request (validation error)
- `401` - Unauthorized
- `404` - Resource not found
- `500` - Internal server error
