import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAuthedSupabase } from '@/lib/auth';

interface GenerateRequest {
  jobDescription: string;
  useDocuments?: boolean;
  // Demo mode: pass user data directly for generation
  demoData?: {
    profile?: any;
    work_experiences?: any[];
    educations?: any[];
    skills?: any[];
  };
}

// Demo resume response when Gemini is not configured
function getDemoResumeResponse(jobDescription: string) {
  return {
    summary: "Experienced professional with a proven track record of delivering results. Skilled in problem-solving, communication, and team collaboration. Seeking to leverage expertise in a challenging new role.",
    workExperiences: [
      {
        company: "Your Company",
        jobTitle: "Your Role",
        location: "City, State",
        startDate: "2020-01",
        endDate: "Present",
        highlights: [
          "Led initiatives that improved team productivity by 25%",
          "Collaborated with cross-functional teams to deliver projects on time",
          "Implemented best practices that reduced errors by 40%"
        ]
      }
    ],
    skills: {
      technical: ["JavaScript", "TypeScript", "React", "Node.js"],
      tools: ["Git", "VS Code", "Jira", "Figma"],
      soft: ["Leadership", "Communication", "Problem Solving"]
    },
    education: [
      {
        institution: "University",
        degree: "Bachelor's Degree",
        field: "Computer Science",
        graduationDate: "2019-05"
      }
    ],
    matchScore: 75,
    keyStrengths: ["Technical Skills", "Problem Solving", "Team Player"],
    recommendations: [
      "Add more quantifiable achievements to strengthen your resume",
      "Include specific technologies mentioned in the job description",
      "Configure Supabase and Gemini API for personalized AI tailoring"
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, useDocuments = false, demoData }: GenerateRequest = await request.json();

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    // Check if Gemini API is configured
    const geminiKey = process.env.GEMINI_API_KEY;
    const isGeminiConfigured = geminiKey && !geminiKey.includes('placeholder');

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    const auth = isSupabaseConfigured ? await getAuthedSupabase(request) : null;
    if (isSupabaseConfigured && (!auth || auth.error || !auth.user || !auth.supabase)) {
      return NextResponse.json(
        { error: 'Unauthorized', details: auth?.error || 'Missing or invalid token' },
        { status: 401 }
      );
    }

    // If Gemini is not configured, return demo response
    if (!isGeminiConfigured) {
      console.log('Demo mode: Gemini API not configured');
      return NextResponse.json({
        success: true,
        demo: true,
        tailoredResume: getDemoResumeResponse(jobDescription),
        generatedAt: new Date().toISOString(),
        message: 'Demo mode: Configure GEMINI_API_KEY in .env.local for real AI generation'
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiKey);
    
    let userContext = '';

    // If demo data is provided (from frontend state), use it directly
    if (demoData && (demoData.profile || (demoData.work_experiences && demoData.work_experiences.length > 0))) {
      userContext = buildUserContextFromManualData(
        demoData.profile,
        demoData.work_experiences || [],
        demoData.educations || [],
        demoData.skills || []
      );
    } else if (isSupabaseConfigured) {
      const supabase = auth!.supabase!;
      const userId = auth!.user!.id;

      if (useDocuments) {
        const { data: documents, error: docsError } = await supabase
          .from('uploaded_documents')
          .select('parsed_text')
          .eq('user_id', userId)
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

        const documentContext = documents
          .filter((doc: any) => doc.parsed_text)
          .map((doc: any) => doc.parsed_text)
          .join('\n\n---\n\n');

        if (documentContext) {
          userContext = documentContext;
        } else {
          // Fallback to manual entries if extraction isn't available yet
          const manualContext = await buildUserContextFromSupabase(supabase, userId);
          if (!manualContext) {
            return NextResponse.json(
              { error: 'No parsed text available from uploaded documents. Upload a TXT resume or use manual entry.' },
              { status: 400 }
            );
          }
          userContext = manualContext;
        }
      } else {
        const manualContext = await buildUserContextFromSupabase(supabase, userId);
        if (!manualContext) {
          return NextResponse.json(
            { error: 'No user data found. Please add your information first.' },
            { status: 404 }
          );
        }

        userContext = manualContext;
      }
    } else {
      // No Supabase and no demo data - use a generic context
      userContext = 'User has not provided background information yet.';
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
      "endDate": "YYYY-MM or Present",
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
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

    // Best-effort persistence (non-fatal if migrations aren't applied yet)
    let savedResumeId: string | null = null;
    if (isSupabaseConfigured && auth?.supabase && auth?.user) {
      try {
        const { data: saved, error: saveError } = await auth.supabase
          .from('generated_resumes')
          .insert({
            user_id: auth.user.id,
            target_job_description: jobDescription,
            tailored_json: tailoredResume as any,
          } as any)
          .select('id')
          .single();

        if (!saveError && saved) savedResumeId = (saved as any).id;
      } catch (error) {
        console.warn('Failed to save generated resume (non-fatal):', error);
      }
    }

    return NextResponse.json({
      success: true,
      tailoredResume,
      savedResumeId,
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
  if (workExperiences && workExperiences.length > 0) {
    context += '**WORK EXPERIENCE:**\n';
    workExperiences.forEach(exp => {
      const title = exp.job_title || exp.role || 'Position';
      const company = exp.company || 'Company';
      context += `\n${title} at ${company}\n`;
      if (exp.location) context += `Location: ${exp.location}\n`;
      context += `Duration: ${exp.start_date || exp.startDate} to ${exp.end_date || exp.endDate || 'Present'}\n`;
      if (exp.duties) context += `Duties: ${exp.duties}\n`;
      if (exp.achievements) context += `**ACHIEVEMENTS: ${exp.achievements}**\n`;
    });
    context += '\n';
  }

  // Education Section
  if (educations && educations.length > 0) {
    context += '**EDUCATION:**\n';
    educations.forEach(edu => {
      const degree = edu.degree || 'Degree';
      const field = edu.field_of_study || edu.field || 'N/A';
      const institution = edu.institution || edu.school || 'Institution';
      context += `\n${degree} in ${field}\n`;
      context += `${institution}\n`;
      context += `${edu.start_date || edu.startDate} to ${edu.end_date || edu.endDate || 'Present'}\n`;
    });
    context += '\n';
  }

  // Skills Section
  if (skills && skills.length > 0) {
    context += '**SKILLS:**\n';
    const hardSkills = skills.filter(s => s.category === 'Hard' || s.category === 'Technical');
    const softSkills = skills.filter(s => s.category === 'Soft');
    const tools = skills.filter(s => s.category === 'Tool');

    if (hardSkills.length > 0) {
      context += `Technical Skills: ${hardSkills.map(s => s.name).join(', ')}\n`;
    }
    if (tools.length > 0) {
      context += `Tools: ${tools.map(s => s.name).join(', ')}\n`;
    }
    if (softSkills.length > 0) {
      context += `Soft Skills: ${softSkills.map(s => s.name).join(', ')}\n`;
    }
  }

  return context || 'No background information provided.';
}

async function buildUserContextFromSupabase(supabase: any, userId: string): Promise<string | null> {
  const [profileResult, workResult, eduResult, skillsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('work_experiences').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
    supabase.from('educations').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
    supabase.from('skills').select('*').eq('user_id', userId),
  ]);

  const profile = profileResult.data;
  const workExperiences = workResult.data || [];
  const educations = eduResult.data || [];
  const skills = skillsResult.data || [];

  if (!profile && workExperiences.length === 0 && educations.length === 0) return null;
  return buildUserContextFromManualData(profile, workExperiences, educations, skills);
}
