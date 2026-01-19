import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import type { ManualIngestPayload } from '@/lib/types';

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

    const payload: ManualIngestPayload = await request.json();
    const userId = user.id;

    // Start transaction-like operations
    const errors: string[] = [];
    const results = {
      profile: null as any,
      work_experiences: [] as any[],
      educations: [] as any[],
      skills: [] as any[]
    };

    // 1. Upsert Profile
    if (payload.profile) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...payload.profile,
          languages: payload.profile.languages || [],
          certifications: payload.profile.certifications || []
        } as any)
        .select()
        .single();

      if (profileError) {
        errors.push(`Profile error: ${profileError.message}`);
      } else {
        results.profile = profileData;
      }
    }

    // 2. Insert Work Experiences
    if (payload.work_experiences && payload.work_experiences.length > 0) {
      const workExperiencesWithUserId = payload.work_experiences.map(exp => ({
        ...exp,
        user_id: userId
      }));

      const { data: workData, error: workError } = await supabase
        .from('work_experiences')
        .insert(workExperiencesWithUserId as any)
        .select();

      if (workError) {
        errors.push(`Work experiences error: ${workError.message}`);
      } else {
        results.work_experiences = workData || [];
      }
    }

    // 3. Insert Educations
    if (payload.educations && payload.educations.length > 0) {
      const educationsWithUserId = payload.educations.map(edu => ({
        ...edu,
        user_id: userId
      }));

      const { data: eduData, error: eduError } = await supabase
        .from('educations')
        .insert(educationsWithUserId as any)
        .select();

      if (eduError) {
        errors.push(`Educations error: ${eduError.message}`);
      } else {
        results.educations = eduData || [];
      }
    }

    // 4. Insert Skills
    if (payload.skills && payload.skills.length > 0) {
      const skillsWithUserId = payload.skills.map(skill => ({
        ...skill,
        user_id: userId
      }));

      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .insert(skillsWithUserId as any)
        .select();

      if (skillsError) {
        errors.push(`Skills error: ${skillsError.message}`);
      } else {
        results.skills = skillsData || [];
      }
    }

    // Check if there were any errors
    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Partial failure during data ingestion',
          details: errors,
          results
        },
        { status: 207 } // Multi-Status
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data ingested successfully',
      results
    });

  } catch (error) {
    console.error('Manual ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
