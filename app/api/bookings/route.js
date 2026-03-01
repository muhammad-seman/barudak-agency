import { readData, insertData, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
  const categoryParam = searchParams.get('category');
  const monthParam = searchParams.get('month');
  const clientId = searchParams.get('clientId');

  let bookings = await readData('bookings');
  
  if (categoryParam && categoryParam !== 'all') {
    const targetCats = categoryParam.split(',');
    bookings = bookings.filter((b) => b.categories?.some(c => targetCats.includes(c)));
  }

  if (monthParam && monthParam !== '-') {
    const [y, m] = monthParam.split('-');
    if (y && m) bookings = bookings.filter((b) => b.tanggal.startsWith(`${y}-${m}`));
    else if (y) bookings = bookings.filter((b) => b.tanggal.startsWith(y));
    else if (m) bookings = bookings.filter((b) => b.tanggal.split('-')[1] === m);
  }

  if (clientId && clientId !== 'all') bookings = bookings.filter((b) => b.clientId === clientId);

  const clients = await readData('clients');
  const crew = await readData('crew');

  return Response.json(bookings.map((b) => enrichBooking(b, clients, crew)));
}

export async function POST(request) {
  const body = await request.json();

  const date = new Date(body.tanggal);
  const hari = DAYS[date.getDay()];

  const crewAssignments = (body.crewAssignments || []).map((a) => ({
    crewId: a.crewId,
    jobRole: a.jobRole || '',
  }));

  const pricing = (body.pricing || []).map((p) => ({
    label: p.label || 'Biaya',
    desc: p.desc || '',
    amount: Number(p.amount) || 0,
  }));
  const harga = pricing.reduce((s, p) => s + p.amount, 0);

  const newBooking = {
    id: generateId('bk'),
    clientId: body.clientId,
    categories: body.categories || [],
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

  await insertData('bookings', newBooking);
  return Response.json(newBooking, { status: 201 });
}
