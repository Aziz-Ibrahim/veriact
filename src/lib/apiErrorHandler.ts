import { NextRequest, NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Usage in routes:
export async function POST(request: NextRequest) {
  try {
    // ... your logic
  } catch (error) {
    return handleApiError(error);
  }
}