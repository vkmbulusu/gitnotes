interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  GITHUB_CLIENT_SECRET?: string;
}

const GITHUB_CLIENT_ID = 'Ov23li90Rm7aT2Cp1c0g';

async function exchangeCodeForToken(code: string, clientSecret: string) {
  if (!clientSecret) {
    throw new Error('GitHub sign-in is not configured on this deployment.');
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: clientSecret,
      code,
    }),
  });

  const data = await response.json() as any;
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || 'GitHub code exchange failed.');
  }
  return data;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

async function handleAuth(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (error || !code) {
      const reason = error || 'Missing authorization code from GitHub';
      return Response.redirect(`${url.origin}/?auth_error=${encodeURIComponent(reason)}`, 302);
    }

    // The app validates OAuth state and exchanges this short-lived code with
    // the Worker. The GitHub access token never appears in the browser URL.
    const state = url.searchParams.get('state') || '';
    return Response.redirect(
      `${url.origin}/?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
      302
    );
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json() as { code?: string };
      if (!body.code) return jsonResponse({ error: 'Missing code' }, 400);

      const data = await exchangeCodeForToken(body.code, env.GITHUB_CLIENT_SECRET || '');
      if (!data.access_token) {
        return jsonResponse({ error: 'GitHub did not return an access token.' }, 502);
      }
      return jsonResponse(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'GitHub sign-in failed.';
      const status = message.includes('not configured') ? 503 : 502;
      return jsonResponse({ error: message }, status);
    }
  }

  return new Response('Method not allowed', {
    status: 405,
    headers: { Allow: 'GET, POST' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/auth/callback' || pathname === '/api/auth/github') {
      return handleAuth(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
