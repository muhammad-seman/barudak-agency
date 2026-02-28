import { findById, updateData, deleteData } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const client = await findById('clients', id);
  if (!client) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(client);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const updated = await updateData('clients', id, body);
  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await deleteData('clients', id);
  return Response.json({ success: true });
}
