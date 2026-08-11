#!/usr/bin/env node
/**
 * Dev-only CORS proxy for Expo web (localhost:8081 → PlayNex Lambda).
 *
 *   npm run proxy
 *   npm run web
 *
 * Native iOS/Android do not need this — CORS is a browser restriction only.
 */
const http = require('http');
const https = require('https');
const { URL } = require('url');

const TARGET = (
  process.env.PLAYNEX_API_ORIGIN ||
  'https://kg7kg65ok2hvfox6l4gtniqhsi0ckmox.lambda-url.ap-south-1.on.aws'
).replace(/\/$/, '');
const PORT = Number(process.env.API_PROXY_PORT || 8787);
const targetUrl = new URL(TARGET);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Accept, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function copyRequestHeaders(req) {
  const headers = { ...req.headers, host: targetUrl.host };
  delete headers['origin'];
  delete headers['referer'];
  // Node will set the correct length when piping.
  delete headers['content-length'];
  return headers;
}

const server = http.createServer((req, res) => {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const path = req.url || '/';
  const upstream = `${TARGET}${path}`;

  const proxyReq = https.request(
    upstream,
    {
      method: req.method,
      headers: copyRequestHeaders(req),
    },
    (proxyRes) => {
      const outHeaders = { ...proxyRes.headers, ...CORS_HEADERS };
      res.writeHead(proxyRes.statusCode || 502, outHeaders);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (err) => {
    console.error('[api-proxy] upstream error:', err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json', ...CORS_HEADERS });
    }
    res.end(JSON.stringify({ success: false, message: 'Proxy upstream failed', error: err.message }));
  });

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`[api-proxy] http://localhost:${PORT}  →  ${TARGET}`);
  console.log('[api-proxy] Keep this running while using Expo web.');
});
