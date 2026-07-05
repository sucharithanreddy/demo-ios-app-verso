import { NextResponse } from 'next/server';
import { prisma } from './prisma';

/**
 * Check if database is connected
 */
export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    await prisma.$connect();
    // Simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error: any) {
    console.error('Database connection error:', error);
    return { 
      connected: false, 
      error: error.message || 'Unknown database error' 
    };
  }
}

/**
 * Standard API error response for database issues
 */
export function databaseErrorResponse() {
  return NextResponse.json({ 
    error: 'Database not connected', 
    message: 'Please ensure DATABASE_URL is set in your environment variables.',
    hint: 'If running locally, create a .env file with DATABASE_URL. If deployed, check your hosting provider\'s environment variables.'
  }, { status: 503 });
}

/**
 * Standard API error response for unauthorized access
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/**
 * Standard API error response for forbidden access
 */
export function forbiddenResponse(message: string = 'Access denied') {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Standard API error response for not found
 */
export function notFoundResponse(message: string = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Standard API error response for server errors
 */
export function serverErrorResponse(error: any, context: string = 'Operation') {
  console.error(`Error in ${context}:`, error);
  return NextResponse.json({ 
    error: `${context} failed`,
    details: process.env.NODE_ENV === 'development' ? String(error) : undefined
  }, { status: 500 });
}
