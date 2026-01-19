# Resume Tailoring - Environment Variables

## Required Environment Variables

### Supabase Configuration
1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Found in: Supabase Dashboard > Settings > API
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Found in: Supabase Dashboard > Settings > API
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Your Supabase service role key (server-side only)
   - Found in: Supabase Dashboard > Settings > API
   - ⚠️ **NEVER** expose this key in client-side code
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Google Gemini API
4. **GEMINI_API_KEY**
   - Your Google Gemini API key
   - Get it from: [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Example: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

## Setup Instructions

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all the required values in `.env.local`

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Supabase Storage Setup

You need to create a storage bucket for resume uploads:

1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `resumes`
3. Set the bucket as **public** (or configure RLS policies as needed)
4. Configure CORS if needed for direct uploads

## Database Migration

Run the SQL migration to create all necessary tables:

1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Execute the SQL script

Alternatively, if using Supabase CLI:
```bash
supabase db push
```

## Security Notes

- Never commit `.env.local` to version control
- The `.env.example` file should only contain variable names, not actual values
- Keep your service role key secure and only use it in server-side code
- Regularly rotate your API keys for security
