export async function POST(request) {
  const body = await request.json();
  const { username, password } = body;

  const validUsername = process.env.AUTH_USERNAME;
  const validPassword = process.env.AUTH_PASSWORD;
  const token = process.env.AUTH_TOKEN;

  if (username !== validUsername || password !== validPassword) {
    return Response.json({ error: 'Username atau password salah.' }, { status: 401 });
  }

  const response = Response.json({ success: true });
  const isProd = process.env.NODE_ENV === 'production';
  response.headers.set(
    'Set-Cookie',
    `ba_session=${token}; Path=/; HttpOnly; SameSite=Lax; ${isProd ? 'Secure;' : ''} Max-Age=${60 * 60 * 24 * 30}`
  );
  return response;
}
