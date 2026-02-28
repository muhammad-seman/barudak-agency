import { readData, writeData } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const crew = readData('crew');
  const member = crew.find((c) => c.id === id);
  if (!member) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(member);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const crew = readData('crew');
  const idx = crew.findIndex((c) => c.id === id);
  if (idx === -1) return Response.json({ error: 'Not found' }, { status: 404 });
  crew[idx] = { ...crew[idx], ...body };
  writeData('crew', crew);
  return Response.json(crew[idx]);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const crew = readData('crew');
  const filtered = crew.filter((c) => c.id !== id);
  if (filtered.length === crew.length)
    return Response.json({ error: 'Not found' }, { status: 404 });
  writeData('crew', filtered);
  return Response.json({ success: true });
}
