import { readData, writeData } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const clients = readData('clients');
  const client = clients.find((c) => c.id === id);
  if (!client) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(client);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const clients = readData('clients');
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return Response.json({ error: 'Not found' }, { status: 404 });
  clients[idx] = { ...clients[idx], ...body };
  writeData('clients', clients);
  return Response.json(clients[idx]);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const clients = readData('clients');
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === clients.length)
    return Response.json({ error: 'Not found' }, { status: 404 });
  writeData('clients', filtered);
  return Response.json({ success: true });
}
