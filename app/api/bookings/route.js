import { readData, writeData, generateId } from '@/lib/db';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Enrich a booking with full client and crew objects (keyed by crewAssignments)
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const month = searchParams.get('month'); // "2026-01"
  const clientId = searchParams.get('clientId');

  let bookings = readData('bookings');
  if (category) bookings = bookings.filter((b) => b.category === category);
  if (month) bookings = bookings.filter((b) => b.tanggal.startsWith(month));
  if (clientId) bookings = bookings.filter((b) => b.clientId === clientId);

  const clients = readData('clients');
  const crew = readData('crew');

  return Response.json(bookings.map((b) => enrichBooking(b, clients, crew)));
}

export async function POST(request) {
  const body = await request.json();
  const bookings = readData('bookings');

  const date = new Date(body.tanggal);
  const hari = DAYS[date.getDay()];

  // crewAssignments: [{ crewId, jobRole }]
  const crewAssignments = (body.crewAssignments || []).map((a) => ({
    crewId: a.crewId,
    jobRole: a.jobRole || '',
  }));

  // pricing: [{ label: "Harga Jasa", amount: 5000000 }, { label: "Transport", amount: 300000 }, ...]
  const pricing = (body.pricing || []).map((p) => ({
    label: p.label || 'Biaya',
    amount: Number(p.amount) || 0,
  }));
  // harga total = sum of all pricing items
  const harga = pricing.reduce((s, p) => s + p.amount, 0);

  const newBooking = {
    id: generateId('bk'),
    clientId: body.clientId,
    category: body.category,
    tanggal: body.tanggal,
    hari,
    lokasi: body.lokasi,
    package: body.package,
    pricing,
    harga,
    payment: {
      status: body.paymentStatus || 'unpaid',
      nominalDibayar: Number(body.nominalDibayar) || 0,
    },
    crewAssignments,
    catatan: body.catatan || '',
    createdAt: new Date().toISOString().split('T')[0],
  };

  bookings.push(newBooking);
  writeData('bookings', bookings);
  return Response.json(newBooking, { status: 201 });
}
