# Vercel deployment

Connect a new private GitHub repository named `rung-club`. Keep unrelated repositories intact. Upload the project contents at repository root (package.json and vercel.json at root, not wrapped inside another directory).

Vercel import: Root Directory `.`; Vite; install `npm ci`; build `npm run build`; Output Directory `dist`. Free hosting is sufficient for this development preview; do not enable paid features or billing. The supplied vercel.json fixes these commands. An unconfigured hosted build supports Practice and tutorial. Online actions explain that setup is pending rather than telling hosted users to run a local server.

Vercel serves the frontend only. Cloudflare hosts the authoritative WebSocket room server. The current code uses same-origin sessions and requests. A production integration needs `/api/*` and `/socket` routing to the Cloudflare service with compatible origin/cookie handling. Do not assume Vercel HTTP rewrites support long-lived WebSockets. Use a verified direct WebSocket ticket flow or a same-origin Cloudflare front door before enabling online matches.

Firebase public client settings belong in Vercel environment variables. Never upload admin/service credentials. No real ads are configured.
