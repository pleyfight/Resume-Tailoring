import { NextRequest, NextResponse } from 'next/server';
import { getAuthedSupabase } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    // Demo mode: If Supabase is not configured, simulate successful upload
    if (!isConfigured) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Demo mode: File upload simulated. Configure Supabase for real uploads.',
        data: {
          id: `demo-${Date.now()}`,
          file_url: `demo://uploads/${file.name}`,
          uploaded_at: new Date().toISOString(),
          has_parsed_text: file.type === 'text/plain',
        },
      });
    }

    const auth = await getAuthedSupabase(request);
    if (auth.error || !auth.user || !auth.supabase) {
      return NextResponse.json({ error: 'Unauthorized', details: auth.error }, { status: 401 });
    }

    const supabase = auth.supabase;
    const user = auth.user;

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.apple.pages'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOC, DOCX, TXT, PAGES' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${user.id}/${timestamp}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // TODO: In production, implement text extraction here
    // For now, we'll just save the reference
    let parsedText: string | null = null;
    
    // Future implementation placeholder:
    // if (file.type === 'application/pdf') {
    //   parsedText = await extractPdfText(buffer);
    // } else if (file.type === 'text/plain') {
    //   parsedText = buffer.toString('utf-8');
    // }

    if (file.type === 'text/plain') {
      parsedText = buffer.toString('utf-8');
    }

    // Save document reference to database
    const { data: documentData, error: documentError } = await supabase
      .from('uploaded_documents')
      .insert({
        user_id: user.id,
        file_url: publicUrl,
        parsed_text: parsedText
      } as any)
      .select()
      .single();

    if (documentError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('resumes').remove([fileName]);
      
      return NextResponse.json(
        { error: 'Failed to save document reference', details: documentError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: (documentData as any).id,
        file_url: (documentData as any).file_url,
        uploaded_at: (documentData as any).uploaded_at,
        has_parsed_text: !!(documentData as any).parsed_text
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve uploaded documents
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (!isConfigured) {
      return NextResponse.json({ success: true, demo: true, documents: [] });
    }

    const auth = await getAuthedSupabase(request);
    if (auth.error || !auth.user || !auth.supabase) {
      return NextResponse.json({ error: 'Unauthorized', details: auth.error }, { status: 401 });
    }

    const supabase = auth.supabase;
    const user = auth.user;

    // Fetch user's documents
    const { data: documents, error: fetchError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: documents || []
    });

  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
