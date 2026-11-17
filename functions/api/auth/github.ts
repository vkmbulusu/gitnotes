// Cloudflare Pages Function: /api/auth/github
interface Env {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}

const DEFAULT_CLIENT_ID = 'Ov23li90Rm7aT2Cp1c0g';
const DEFAULT_CLIENT_SECRET = '21655810ced7720c4fb37b9e17fc0111ddb0d2d1';

async function exchangeCodeForToken(code: string, clientId: string, clientSecret: string) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  return response.json() as Promise<any>;
}

// Handle GET /api/auth/github?code=... (Redirect flow)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const clientId = context.env.GITHUB_CLIENT_ID || DEFAULT_CLIENT_ID;
  const clientSecret = context.env.GITHUB_CLIENT_SECRET || DEFAULT_CLIENT_SECRET;

  if (error || !code) {
    const errorMsg = error || 'Missing authorization code from GitHub';
    return Response.redirect(`${url.origin}/?auth_error=${encodeURIComponent(errorMsg)}`, 302);
  }

  try {
    const data = await exchangeCodeForToken(code, clientId, clientSecret);

    if (data.access_token) {
      return Response.redirect(`${url.origin}/?gh_token=${data.access_token}`, 302);
    } else {
      const err = data.error_description || data.error || 'Failed to exchange token';
      return Response.redirect(`${url.origin}/?auth_error=${encodeURIComponent(err)}`, 302);
    }
  } catch (err: any) {
    return Response.redirect(`${url.origin}/?auth_error=${encodeURIComponent(err.message)}`, 302);
  }
};

// Handle POST /api/auth/github (JSON code exchange flow)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const clientId = context.env.GITHUB_CLIENT_ID || DEFAULT_CLIENT_ID;
  const clientSecret = context.env.GITHUB_CLIENT_SECRET || DEFAULT_CLIENT_SECRET;

  try {
    const body: any = await context.request.json();
    const code = body?.code;

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await exchangeCodeForToken(code, clientId, clientSecret);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

// Handle OPTIONS CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
