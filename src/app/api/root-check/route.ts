export const runtime = 'edge';

export async function GET() {
  return new Response('Root check OK', { status: 200 });
}