import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSupabase } from '@/lib/supabase';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface GenerateRequest {
  jobDescription: string;
  useDocuments?: boolean; // If true, use uploaded documents; otherwise use manual entries
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { jobDescription, useDocuments = false }: GenerateRequest = await request.json();

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    // Fetch User Context
    let userContext = '';

    if (useDocuments) {
      // Fetch from uploaded documents
      const { data: documents, error: docsError } = await supabase
        .from('uploaded_documents')
        .select('parsed_text')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (docsError) {
        return NextResponse.json(
          { error: 'Failed to fetch user documents', details: docsError.message },
          { status: 500 }
        );
      }

      if (!documents || documents.length === 0) {
        return NextResponse.json(
          { error: 'No uploaded documents found. Please upload a resume first.' },
          { status: 404 }
        );
      }

      userContext = documents
        .filter((doc: any) => doc.parsed_text)
        .map((doc: any) => doc.parsed_text)
        .join('\n\n---\n\n');

      if (!userContext) {
        return NextResponse.json(
          { error: 'No parsed text available from uploaded documents. Text extraction may not be implemented yet.' },
          { status: 400 }
        );
      }

    } else {
      // Fetch from manual entries
      const [profileResult, workResult, eduResult, skillsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('work_experiences').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('educations').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('skills').select('*').eq('user_id', user.id)
      ]);

      const profile = profileResult.data;
      const workExperiences = workResult.data || [];
      const educations = eduResult.data || [];
      const skills = skillsResult.data || [];

      if (!profile && workExperiences.length === 0 && educations.length === 0) {
        return NextResponse.json(
          { error: 'No user data found. Please add your information first.' },
          { status: 404 }
        );
      }

      // Build structured context
      userContext = buildUserContextFromManualData(profile, workExperiences, educations, skills);
    }

    // Construct AI Prompt
    const prompt = `You are an expert resume writer and career coach. Your task is to tailor a resume to match a specific job description while highlighting the candidate's most relevant achievements.

**User's Background:**
${userContext}

**Target Job Description:**
${jobDescription}

**Instructions:**
1. Analyze the job description to identify key skills, qualifications, and requirements
2. Map the user's experience and skills to the job requirements
3. Prioritize ACHIEVEMENTS with quantifiable results over generic duties
4. Highlight relevant technical skills and tools mentioned in the job description
5. Adapt the professional summary to align with the role
6. Reorder and emphasize experience/skills that best match the position

**Output Format (JSON):**
Return a properly formatted JSON object with this exact structure:
{
  "summary": "A compelling 2-3 sentence professional summary tailored to this role",
  "workExperiences": [
    {
      "company": "Company Name",
      "jobTitle": "Job Title",
      "location": "City, State",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM" or "Present",
      "highlights": [
        "Achievement-focused bullet point with quantifiable results",
        "Another achievement highlighting relevant skills from job description"
      ]
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "tools": ["Tool 1", "Tool 2"],
    "soft": ["Soft Skill 1", "Soft Skill 2"]
  },
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "graduationDate": "YYYY-MM"
    }
  ],
  "matchScore": 85,
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Focus on making the resume ATS-friendly while showcasing the candidate's unique value proposition for this specific role.`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse AI response
    let tailoredResume;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      
      tailoredResume = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response',
          rawResponse: text
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tailoredResume,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generate resume error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function buildUserContextFromManualData(
  profile: any,
  workExperiences: any[],
  educations: any[],
  skills: any[]
): string {
  let context = '';

  // Profile Section
  if (profile) {
    context += '**PROFILE:**\n';
    if (profile.full_name) context += `Name: ${profile.full_name}\n`;
    if (profile.email) context += `Email: ${profile.email}\n`;
    if (profile.phone) context += `Phone: ${profile.phone}\n`;
    if (profile.linkedin_url) context += `LinkedIn: ${profile.linkedin_url}\n`;
    if (profile.portfolio_url) context += `Portfolio: ${profile.portfolio_url}\n`;
    if (profile.summary_bio) context += `\nSummary: ${profile.summary_bio}\n`;
    
    if (profile.languages && Array.isArray(profile.languages)) {
      context += `\nLanguages: ${profile.languages.map((l: any) => `${l.language} (${l.level})`).join(', ')}\n`;
    }
    
    if (profile.certifications && Array.isArray(profile.certifications)) {
      context += `\nCertifications:\n`;
      profile.certifications.forEach((cert: any) => {
        context += `- ${cert.name} by ${cert.issuer} (${cert.year})\n`;
      });
    }
    context += '\n';
  }

  // Work Experience Section
  if (workExperiences.length > 0) {
    context += '**WORK EXPERIENCE:**\n';
    workExperiences.forEach(exp => {
      context += `\n${exp.job_title} at ${exp.company}\n`;
      if (exp.location) context += `Location: ${exp.location}\n`;
      context += `Duration: ${exp.start_date} to ${exp.end_date || 'Present'}\n`;
      if (exp.duties) context += `Duties: ${exp.duties}\n`;
      if (exp.achievements) context += `**ACHIEVEMENTS: ${exp.achievements}**\n`;
    });
    context += '\n';
  }

  // Education Section
  if (educations.length > 0) {
    context += '**EDUCATION:**\n';
    educations.forEach(edu => {
      context += `\n${edu.degree} in ${edu.field_of_study || 'N/A'}\n`;
      context += `${edu.institution}\n`;
      context += `${edu.start_date} to ${edu.end_date || 'Present'}\n`;
    });
    context += '\n';
  }

  // Skills Section
  if (skills.length > 0) {
    context += '**SKILLS:**\n';
    const hardSkills = skills.filter(s => s.category === 'Hard');
    const softSkills = skills.filter(s => s.category === 'Soft');
    const tools = skills.filter(s => s.category === 'Tool');

    if (hardSkills.length > 0) {
      context += `Hard Skills: ${hardSkills.map(s => `${s.name} (${s.proficiency}%)`).join(', ')}\n`;
    }
    if (tools.length > 0) {
      context += `Tools: ${tools.map(s => `${s.name} (${s.proficiency}%)`).join(', ')}\n`;
    }
    if (softSkills.length > 0) {
      context += `Soft Skills: ${softSkills.map(s => `${s.name} (${s.proficiency}%)`).join(', ')}\n`;
    }
  }

  return context;
}
