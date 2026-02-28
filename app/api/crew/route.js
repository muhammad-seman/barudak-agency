import { readData, writeData, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const crew = readData('crew');
  return Response.json(crew);
}

export async function POST(request) {
  const body = await request.json();
  const crew = readData('crew');
  const newMember = {
    id: generateId('cr'),
    name: body.name,
    noWA: body.noWA,
    role: body.role,
    activeCategories: body.activeCategories || [],
    status: body.status || 'active',
  };
  crew.push(newMember);
  writeData('crew', crew);
  return Response.json(newMember, { status: 201 });
}
