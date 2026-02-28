import { findById, updateData, deleteData } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const crewMember = await findById('crew', id);
  if (!crewMember) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(crewMember);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const updated = await updateData('crew', id, body);
  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await deleteData('crew', id);
  return Response.json({ success: true });
}
