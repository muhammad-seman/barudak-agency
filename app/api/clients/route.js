import { readData, writeData, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clients = readData('clients');
  return Response.json(clients);
}

export async function POST(request) {
  const body = await request.json();
  const clients = readData('clients');
  const newClient = {
    id: generateId('cl'),
    namaPasangan: body.namaPasangan,
    noWA: body.noWA,
    alamat: body.alamat,
    createdAt: new Date().toISOString().split('T')[0],
  };
  clients.push(newClient);
  writeData('clients', clients);
  return Response.json(newClient, { status: 201 });
}
