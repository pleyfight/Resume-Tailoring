# Resume Tailoring Application

An AI-powered resume tailoring system that helps users create targeted, ATS-friendly resumes optimized for specific job descriptions.

## 🚀 Features

- **Manual Data Entry** - Structured forms for profile, work experience, education, and skills
- **Document Upload** - Upload existing resumes (PDF, DOC, DOCX, TXT)
- **AI Resume Generation** - Google Gemini AI tailors your resume to match job descriptions
- **Achievement-Focused** - Prioritizes quantifiable achievements over generic duties
- **ATS-Friendly** - Optimizes content for Applicant Tracking Systems
- **Secure & Private** - Row-level security with Supabase

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **AI:** Google Gemini 1.5 Flash
- **Authentication:** Supabase Auth

## 📋 Prerequisites

- Node.js 20+
- Supabase account
- Google Gemini API key

## ⚙️ Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd Resume-Tailoring
npm install
```

### 2. Environment Configuration

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

📖 See [ENV_SETUP.md](ENV_SETUP.md) for detailed configuration instructions.

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and execute the migration from [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)

This creates:
- `profiles` table
- `work_experiences` table
- `educations` table
- `skills` table
- `uploaded_documents` table
- Row-level security policies
- Indexes and triggers

### 4. Storage Setup

1. In Supabase Dashboard, go to **Storage**
2. Create a new bucket named `resumes`
3. Set it as **public** (or configure custom RLS policies)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📡 API Endpoints

### POST `/api/ingest/manual`
Bulk insert user profile, work experience, education, and skills.

### POST `/api/ingest/document`
Upload resume documents to Supabase Storage.

### POST `/api/generate`
Generate AI-tailored resume based on job description.

📖 See [BACKEND_API_DOCS.md](BACKEND_API_DOCS.md) for complete API documentation with request/response examples.

## 📁 Project Structure

```
Resume-Tailoring/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ingest/
│   │   │   │   ├── manual/route.ts      # Manual data ingestion
│   │   │   │   └── document/route.ts    # Document upload
│   │   │   └── generate/route.ts        # AI resume generation
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── supabase.ts                   # Supabase client config
│       └── types.ts                      # TypeScript definitions
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql        # Database schema
├── .env.example                          # Environment template
├── ENV_SETUP.md                          # Environment setup guide
├── BACKEND_API_DOCS.md                   # API documentation
└── README.md
```

## 🔐 Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Service role key used only in server-side API routes
- Authentication required for all endpoints

## 🎯 Usage Flow

1. **User Authentication** - Sign up/login via Supabase Auth
2. **Data Input** - Enter profile manually OR upload existing resume
3. **Job Description** - Paste target job posting
4. **AI Generation** - System analyzes and tailors resume
5. **Review & Export** - Review AI-generated resume with match score

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🚧 Future Enhancements

- [ ] OCR/Text extraction from uploaded documents
- [ ] Multiple resume templates
- [ ] PDF/DOCX export
- [ ] Cover letter generation
- [ ] Resume version history
- [ ] Skills gap analysis
- [ ] Interview preparation tips

## 📚 Documentation

- [Backend API Documentation](BACKEND_API_DOCS.md)
- [Environment Setup Guide](ENV_SETUP.md)
- [Database Schema](supabase/migrations/001_initial_schema.sql)

## 📄 License

MIT License

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using Next.js, Supabase, and Google Gemini AI
