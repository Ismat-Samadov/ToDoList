// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logUserActivity } from '@/lib/logging'; // Import logging function

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Sanitize the user data
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    // Log the signup activity
    await logUserActivity({
      userId: sanitizedUser.id,
      action: 'SIGNUP',
      metadata: {
        email: sanitizedUser.email,
        name: sanitizedUser.name,
      },
      ipAddress: '127.0.0.1', // Replace with actual logic if available
      userAgent: 'User-Agent Unavailable', // Replace with req.headers['user-agent'] if available
    });

    return NextResponse.json(
      { message: 'User created successfully', user: sanitizedUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}
