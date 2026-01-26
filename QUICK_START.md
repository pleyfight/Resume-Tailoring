# ResumeAI - Quick Reference Card

## 🚀 Getting Started in 5 Minutes

### 1. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GEMINI_API_KEY=your_gemini_key_here
```

### 2. Database Setup
Run these SQL files in Supabase SQL Editor (in order):
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_storage_setup.sql`
3. `supabase/migrations/003_generated_resumes.sql`

Create a test user:
- Start the app and sign up at `/signup`
- After login, open `/dashboard`

### 3. Storage Setup
In Supabase Dashboard → Storage:
- Create bucket: `resumes`
- Set to **Public**

### 4. Run the App
```bash
npm install
npm run dev
```

Open: http://localhost:3000/dashboard

---

## 📋 Key URLs

| Resource | URL |
|----------|-----|
| Dashboard | http://localhost:3000/dashboard |
| Upload API | POST /api/ingest/document |
| Manual API | POST /api/ingest/manual |
| Generate API | POST /api/generate |

---

## 🎨 Component Reference

### IngestionForm
**Location**: `/components/IngestionForm.tsx`

**Props**:
- `onContextTypeChange: (useDocuments: boolean) => void`
- `useDocuments: boolean`

**Features**:
- Two tabs: Upload / Manual Entry
- Drag-and-drop file upload
- Accordion forms for structured input
- Highlighted achievements field

### JobTargetInput
**Location**: `/components/JobTargetInput.tsx`

**Props**:
- `value: string`
- `onChange: (value: string) => void`
- `onGenerate: () => void`
- `isGenerating: boolean`

### ResumeViewer
**Location**: `/components/ResumeViewer.tsx`

**Props**:
- `resume: any` (AI-generated resume object)

**Features**:
- A4-styled preview
- Match score badge
- Categorized sections
- Download functionality

---

## 🔌 API Quick Reference

### Upload Resume
```bash
curl -X POST http://localhost:3000/api/ingest/document \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -F "file=@resume.pdf"
```

### Save Manual Data
```bash
curl -X POST http://localhost:3000/api/ingest/manual \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "work_experiences": [{
      "company": "TechCorp",
      "job_title": "Software Engineer",
      "start_date": "2020-01-01",
      "duties": "Developed web apps",
      "achievements": "Increased performance by 40%"
    }]
  }'
```

### Generate Resume
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Looking for Senior Developer...",
    "useDocuments": false
  }'
```

---

## 🎯 Database Schema Quick View

```
profiles
├── id, full_name, email, phone, date_of_birth
├── linkedin_url, portfolio_url, summary_bio
├── languages (JSONB), certifications (JSONB)

work_experiences
├── id, user_id, company, job_title, location
├── start_date, end_date, is_current
├── duties, achievements ⭐

educations
├── id, user_id, institution, degree
├── field_of_study, start_date, end_date

skills
├── id, user_id, name
├── category (Hard/Soft/Tool), proficiency

uploaded_documents
├── id, user_id, file_url, parsed_text

generated_resumes
├── id, user_id, target_job_description
├── tailored_json (complete output)
```

---

## 🎨 Design Tokens

### Colors
```css
Background:   #F7F5F3  /* Warm Grey */
Foreground:   #2D2D2D  /* Charcoal */
Accent:       #6B6B6B  /* Medium Grey */
Border:       #D1D1D1, #E5E5E5
Success:      green-50/100
Warning:      amber-50/300
```

### Typography
```css
--font-serif: Instrument Serif  /* Headings */
--font-sans:  Inter            /* Body */
```

### Spacing
- Cards: `p-6` (24px)
- Sections: `space-y-6` (24px vertical)
- Grid gap: `gap-6` (24px)

---

## 🧪 Testing Checklist

- [ ] Dashboard loads at /dashboard
- [ ] Upload tab accepts PDF/DOCX
- [ ] Manual tab saves data
- [ ] Job description input works
- [ ] Generate button triggers AI
- [ ] Resume preview displays
- [ ] Download works
- [ ] Match score appears
- [ ] Recommendations shown

---

## 🚨 Common Issues & Fixes

### "Missing env variable"
→ Check `.env.local` exists and has all 4 variables

### "Supabase connection failed"
→ Verify project URL and keys in Supabase dashboard

### "Gemini API error"
→ Check API key is valid at https://makersuite.google.com/app/apikey

### "Upload fails"
→ Ensure `resumes` bucket exists in Supabase Storage

### "TypeScript errors"
→ Run `npm run build` to see detailed errors

---

## 📚 Documentation Files

- **COMPLETE_IMPLEMENTATION.md** - Full implementation details
- **APPLICATION_SETUP.md** - Comprehensive setup guide
- **BACKEND_API_DOCS.md** - API documentation
- **TESTING_GUIDE.md** - Testing procedures
- **.env.example** - Environment template

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
# Run migrations in Supabase SQL Editor

# Testing
curl -X POST http://localhost:3000/api/generate \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobDescription":"test"}'
```

---

## 🎯 Next Production Steps

1. [ ] Implement PDF/DOCX text extraction
2. [ ] Improve PDF output formatting
3. [ ] Add rate limiting / quotas
4. [ ] Add error logging/monitoring
5. [ ] Add resume history UI (uses `generated_resumes`)
6. [ ] Deploy to Vercel

---

## 💡 Pro Tips

1. **Achievements Matter**: Always fill the highlighted achievements field - it's what AI prioritizes
2. **Be Specific**: Include numbers and metrics in achievements
3. **Job Description**: Paste the complete job posting for best results
4. **Manual vs Upload**: Manual entry gives better results (more structured data)
5. **Iterate**: Regenerate with different job descriptions to see variations

---

**Built with Next.js 16 + Supabase + Google Gemini AI**

For detailed documentation, see `COMPLETE_IMPLEMENTATION.md`
