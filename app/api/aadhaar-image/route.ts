import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET signed URL for Aadhaar image
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Create a signed URL that expires in 1 hour (3600 seconds)
    const { data, error } = await supabase.storage
      .from('aadhaar-cards')
      .createSignedUrl(path, 3600);

    if (error) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json(
        { error: 'Failed to generate image URL', details: error.message },
        { status: 500 }
      );
    }

    if (!data || !data.signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { signedUrl: data.signedUrl },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate image URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
