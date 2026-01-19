# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- Supabase URL and keys (from [Supabase Dashboard](https://supabase.com/dashboard))
- Gemini API key (from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Step 3: Setup Supabase Database

**Option A: Supabase Dashboard (Recommended)**
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor
3. Copy all content from `supabase/migrations/001_initial_schema.sql`
4. Paste and run

**Option B: Supabase CLI**
```bash
supabase db push
```

### Step 4: Create Storage Bucket
1. In Supabase Dashboard → Storage
2. Create bucket named: `resumes`
3. Set as public ✓

### Step 5: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📝 Test the API

### Test Manual Ingestion
```bash
curl -X POST http://localhost:3000/api/ingest/manual \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "full_name": "John Doe",
      "email": "john@example.com",
      "summary_bio": "Experienced developer"
    },
    "work_experiences": [{
      "company": "Tech Corp",
      "job_title": "Senior Developer",
      "start_date": "2020-01-01",
      "achievements": "Increased performance by 40%"
    }]
  }'
```

### Test Document Upload
```bash
curl -X POST http://localhost:3000/api/ingest/document \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -F "file=@/path/to/resume.pdf"
```

### Test Resume Generation
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Looking for a senior developer with React and Node.js experience",
    "useDocuments": false
  }'
```

---

## 🔑 Getting Your User Token

```javascript
// In browser console or your frontend code
const { data: { session } } = await supabase.auth.getSession();
console.log(session?.access_token);
```

---

## ✅ Verify Setup

- [ ] Dependencies installed (`node_modules` exists)
- [ ] `.env.local` file created with all 4 variables
- [ ] Database tables created (check Supabase Table Editor)
- [ ] Storage bucket `resumes` created
- [ ] Dev server running on port 3000
- [ ] API endpoints accessible

---

## 🐛 Common Issues

**Problem:** "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- **Solution:** Ensure `.env.local` exists and has all required variables

**Problem:** "relation 'profiles' does not exist"
- **Solution:** Run the SQL migration in Supabase SQL Editor

**Problem:** "bucket 'resumes' not found"
- **Solution:** Create the storage bucket in Supabase Dashboard

**Problem:** 401 Unauthorized
- **Solution:** Include valid Bearer token in Authorization header

---

## 📚 Next Steps

1. Build authentication UI (signup/login)
2. Create forms for manual data entry
3. Build resume upload component
4. Design resume preview/export interface
5. Add job description input form

See [BACKEND_API_DOCS.md](BACKEND_API_DOCS.md) for detailed API usage examples.
