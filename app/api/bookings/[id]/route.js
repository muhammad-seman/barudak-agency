import { readData, writeData } from '@/lib/db';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function enrichBooking(booking, clients, crew) {
  const assignments = booking.crewAssignments || [];
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
  const bookings = readData('bookings');
  const booking = bookings.find((b) => b.id === id);
  if (!booking) return Response.json({ error: 'Not found' }, { status: 404 });

  const clients = readData('clients');
  const crew = readData('crew');
  return Response.json(enrichBooking(booking, clients, crew));
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const bookings = readData('bookings');
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return Response.json({ error: 'Not found' }, { status: 404 });

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

  bookings[idx] = { ...bookings[idx], ...body };
  writeData('bookings', bookings);
  return Response.json(bookings[idx]);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const bookings = readData('bookings');
  const filtered = bookings.filter((b) => b.id !== id);
  if (filtered.length === bookings.length)
    return Response.json({ error: 'Not found' }, { status: 404 });
  writeData('bookings', filtered);
  return Response.json({ success: true });
}
