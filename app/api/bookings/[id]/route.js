import { findById, updateData, deleteData, readData } from '@/lib/db';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Enrich a booking with full client and crew objects (keyed by crewAssignments)
async function enrichBooking(booking) {
  const assignments = booking.crewAssignments || [];
  const clients = await readData('clients');
  const crew = await readData('crew');

  return {
    ...booking,
    client: clients.find((c) => c.id === booking.clientId) || null,
    crew: assignments.map((a) => {
      const member = crew.find((c) => c.id === a.crewId);
      return member ? { ...member, jobRole: a.jobRole } : null;
    }).filter(Boolean),
  };
}

export async function GET(request, { params }) {
  const { id } = await params;
  const booking = await findById('bookings', id);
  if (!booking) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json(await enrichBooking(booking));
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  if (body.tanggal) {
    const date = new Date(body.tanggal);
    body.hari = DAYS[date.getDay()];
  }

  // Normalize crewAssignments if provided
  if (body.crewAssignments) {
    body.crewAssignments = body.crewAssignments.map((a) => ({
      crewId: a.crewId,
      jobRole: a.jobRole || '',
    }));
  }

  // Normalize pricing and recompute total
  if (body.pricing !== undefined) {
    body.pricing = body.pricing.map((p) => ({
      label: p.label || 'Biaya',
      amount: Number(p.amount) || 0,
    }));
    body.harga = body.pricing.reduce((s, p) => s + p.amount, 0);
  }

  // Handle payment fields from form shape
  if (body.paymentStatus !== undefined) {
    body.payment = {
      status: body.paymentStatus,
      nominalDibayar: Number(body.nominalDibayar) || 0,
    };
    delete body.paymentStatus;
    delete body.nominalDibayar;
  }

  const updated = await updateData('bookings', id, body);
  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await deleteData('bookings', id);
  return Response.json({ success: true });
}
