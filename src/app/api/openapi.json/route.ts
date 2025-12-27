import { NextResponse } from 'next/server';
import { generateOpenAPIDocument } from '@/lib/api-schemas';

export async function GET() {
  try {
    const document = generateOpenAPIDocument();
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error generating OpenAPI document:', error);
    return NextResponse.json(
      { error: 'Failed to generate OpenAPI document' },
      { status: 500 }
    );
  }
}
