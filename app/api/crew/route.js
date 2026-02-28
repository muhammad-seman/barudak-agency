import { readData, insertData, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const crew = await readData('crew');
  return Response.json(crew);
}

export async function POST(request) {
  const body = await request.json();
  const newMember = {
    id: generateId('cr'),
    name: body.name,
    noWA: body.noWA,
    role: body.role,
    activeCategories: body.activeCategories || [],
    status: body.status || 'active',
  };
  await insertData('crew', newMember);
  return Response.json(newMember, { status: 201 });
}
