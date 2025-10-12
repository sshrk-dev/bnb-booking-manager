import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession, validateCredentials } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createSession(username);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json(
      { success: true, message: 'Logged in successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
