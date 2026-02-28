import { readData } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');

  let bookings = readData('bookings');
  if (month) bookings = bookings.filter((b) => b.tanggal.startsWith(month));

  const clients = readData('clients');
  const crew = readData('crew');

  // Enrich with crew (including per-job role)
  const enriched = bookings.map((b) => {
    const assignments = b.crewAssignments || [];
    return {
      ...b,
      client: clients.find((c) => c.id === b.clientId) || null,
      crew: assignments.map((a) => {
        const member = crew.find((c) => c.id === a.crewId);
        return member ? { ...member, jobRole: a.jobRole } : null;
      }).filter(Boolean),
    };
  });

  // Group by tanggal + clientId
  const grouped = {};
  for (const booking of enriched) {
    const key = `${booking.tanggal}__${booking.clientId}`;
    if (!grouped[key]) {
      grouped[key] = {
        tanggal: booking.tanggal,
        hari: booking.hari,
        clientId: booking.clientId,
        client: booking.client,
        bookings: [],
      };
    }
    grouped[key].bookings.push(booking);
  }

  const result = Object.values(grouped).sort((a, b) =>
    a.tanggal.localeCompare(b.tanggal)
  );

  return Response.json(result);
}
