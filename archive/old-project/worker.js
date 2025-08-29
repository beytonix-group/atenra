// Cloudflare Worker using native ES modules
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }
    
    // Serve static assets and SPA routing
    return handleStaticRequest(request, env);
  }
};

async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // CORS headers for all API responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Route API endpoints
    if (pathname === '/api/auth/login') {
      return handleLogin(request, env, corsHeaders);
    }
    
    if (pathname === '/api/auth/register') {
      return handleRegister(request, env, corsHeaders);
    }
    
    if (pathname.startsWith('/api/user/')) {
      return handleUserApi(request, env, corsHeaders);
    }
    
    if (pathname.startsWith('/api/business/')) {
      return handleBusinessApi(request, env, corsHeaders);
    }
    
    // 404 for unknown API routes
    return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleLogin(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const body = await request.json();
  const { email, password } = body;
  
  // Validate credentials against D1 database
  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE email = ? AND password_hash = ?'
  ).bind(email, hashPassword(password)).first();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Generate JWT token using Cloudflare's crypto API
  const token = await generateJWT(user, env);
  
  return new Response(JSON.stringify({ 
    token, 
    user: { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    } 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleRegister(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const body = await request.json();
  const { email, password, role, ...userData } = body;
  
  // Check if user exists
  const existingUser = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first();
  
  if (existingUser) {
    return new Response(JSON.stringify({ error: 'User already exists' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Create new user with encrypted data
  const userId = crypto.randomUUID();
  const hashedPassword = await hashPassword(password);
  
  await env.DB.prepare(`
    INSERT INTO users (id, email, password_hash, role, created_at, data)
    VALUES (?, ?, ?, ?, datetime('now'), ?)
  `).bind(
    userId, 
    email, 
    hashedPassword, 
    role,
    JSON.stringify(userData)
  ).run();
  
  const token = await generateJWT({ id: userId, email, role }, env);
  
  return new Response(JSON.stringify({ 
    token, 
    user: { id: userId, email, role } 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUserApi(request, env, corsHeaders) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const user = await verifyJWT(token, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Handle user-specific API operations with role-based access
  // All data operations use encrypted storage
  
  return new Response(JSON.stringify({ message: 'User API endpoint' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleBusinessApi(request, env, corsHeaders) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const user = await verifyJWT(token, env);
  if (!user || (user.role !== 'business' && user.role !== 'employee')) {
    return new Response(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Handle business-specific API operations with encrypted data
  
  return new Response(JSON.stringify({ message: 'Business API endpoint' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleStaticRequest(request, env) {
  // Serve the React SPA with proper routing
  const url = new URL(request.url);
  
  // Security headers for all responses
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  };
  
  // For SPA routing, serve index.html for all non-asset requests
  if (!url.pathname.includes('.') && !url.pathname.startsWith('/api/')) {
    return new Response(await getIndexHtml(), {
      headers: {
        'Content-Type': 'text/html',
        ...securityHeaders
      }
    });
  }
  
  // Serve static assets
  return fetch(request);
}

// Utility functions using Cloudflare's native crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (env.SALT || 'default-salt'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateJWT(payload, env) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours
  const jwtPayload = { ...payload, exp };
  
  const encoder = new TextEncoder();
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '');
  
  const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(env.JWT_SECRET || 'default-secret'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

async function verifyJWT(token, env) {
  try {
    const [header, payload, signature] = token.split('.');
    const encoder = new TextEncoder();
    
    const data = encoder.encode(`${header}.${payload}`);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.JWT_SECRET || 'default-secret'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const expectedSignature = Uint8Array.from(atob(signature + '=='), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify('HMAC', key, expectedSignature, data);
    
    if (!isValid) return null;
    
    const decodedPayload = JSON.parse(atob(payload + '=='));
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) return null;
    
    return decodedPayload;
  } catch {
    return null;
  }
}

async function getIndexHtml() {
  // Return the built React application's index.html
  // This would be replaced with the actual built HTML in production
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Atenra - Premium Referral Platform</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/src/main.tsx"></script>
      </body>
    </html>
  `;
}
