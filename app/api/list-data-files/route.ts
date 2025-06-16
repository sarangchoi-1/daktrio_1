import fs from 'fs';
import path from 'path';

export async function GET() {
  const dirPath = path.join(process.cwd(), 'data', '구별');
  let files: string[] = [];
  let error: string | null = null;
  try {
    files = fs.readdirSync(dirPath);
  } catch (e: any) {
    error = e.message;
  }
  return new Response(
    JSON.stringify({ files, error }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
