import { readData, insertData, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clients = await readData('clients');
  return Response.json(clients);
}

export async function POST(request) {
  const body = await request.json();
  const newClient = {
    id: generateId('cl'),
    namaPasangan: body.namaPasangan,
    noWA: body.noWA,
    alamat: body.alamat,
    createdAt: new Date().toISOString().split('T')[0],
  };
  await insertData('clients', newClient);
  return Response.json(newClient, { status: 201 });
}
