/** String safety and shared layout. Every user-supplied string passes through esc(). */

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only https URLs ever reach an href or src - anything else renders as plain text. */
export function safeUrl(value: unknown): string | null {
  const s = String(value ?? "");
  return /^https:\/\/[^\s"'<>]+$/i.test(s) ? s : null;
}

const BASE_CSS = `
*{box-sizing:border-box;margin:0}
body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:40rem;margin:0 auto;padding:3.5rem 1.25rem 4rem}
a{color:var(--accent)}
img{max-width:100%}
.card{background:var(--surface);border:1px solid var(--ring);border-radius:1.25rem;padding:2rem;
box-shadow:0 10px 30px rgb(0 0 0 / .06)}
.avatar{width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid var(--ring)}
h1{font-size:1.9rem;line-height:1.2;margin-top:1rem}
.tagline{color:var(--muted);font-size:1.1rem;margin-top:.35rem}
.links{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.4rem;list-style:none;padding:0}
.links a{display:inline-block;padding:.5rem 1rem;border:1px solid var(--ring);border-radius:999px;
text-decoration:none;color:var(--text);background:var(--bg)}
.links a:hover{border-color:var(--accent);color:var(--accent)}
.cta{display:inline-block;margin-top:1.6rem;padding:.8rem 1.6rem;background:var(--accent);
color:var(--accent-text);border-radius:.75rem;text-decoration:none;font-weight:600}
.cta:hover{filter:brightness(1.05)}
section{margin-top:1.8rem}
h2{font-size:1.15rem;margin-bottom:.3rem}
section p{color:var(--muted)}
.features{list-style:none;padding:0;margin-top:1rem;display:grid;gap:.5rem}
.features li{padding-left:1.6rem;position:relative;color:var(--muted)}
.features li::before{content:"\\2726";position:absolute;left:0;color:var(--accent)}
.meta{margin-top:1.2rem;font-size:.9rem;color:var(--muted)}
footer{margin-top:3rem;text-align:center;font-size:.85rem;color:var(--muted)}
footer a{color:var(--muted)}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
@media (max-width:34rem){.wrap{padding-top:2rem}h1{font-size:1.5rem}}
`;

export interface LayoutOptions {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  themeCss: string;
  body: string;
}

export function layout(o: LayoutOptions): string {
  const image = o.image ? `<meta property="og:image" content="${esc(o.image)}"><meta name="twitter:card" content="summary_large_image">` : '<meta property="og:image" content="https://got-a.page/assets/social-card.png"><meta name="twitter:card" content="summary_large_image">';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 512 512%22 role=%22img%22 aria-label=%22got-a.page logo%22> <defs> <linearGradient id=%22bg%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22> <stop offset=%220%22 stop-color=%22%23ff922b%22/> <stop offset=%221%22 stop-color=%22%23e8590c%22/> </linearGradient> </defs> <rect width=%22512%22 height=%22512%22 rx=%22112%22 fill=%22url%28%23bg%29%22/> <%21-- page with folded corner --> <g> <path d=%22M164 128 h118 l66 66 v166 a24 24 0 0 1 -24 24 H164 a24 24 0 0 1 -24 -24 V152 a24 24 0 0 1 24 -24 z%22 fill=%22%23fffaf3%22/> <path d=%22M282 128 l66 66 h-52 a14 14 0 0 1 -14 -14 v-52 z%22 fill=%22%23ffd8b5%22/> <rect x=%22176%22 y=%22228%22 width=%22124%22 height=%2218%22 rx=%229%22 fill=%22%23e8590c%22/> <rect x=%22176%22 y=%22266%22 width=%22160%22 height=%2214%22 rx=%227%22 fill=%22%23f3dcc8%22/> <rect x=%22176%22 y=%22296%22 width=%22160%22 height=%2214%22 rx=%227%22 fill=%22%23f3dcc8%22/> <rect x=%22176%22 y=%22326%22 width=%22100%22 height=%2214%22 rx=%227%22 fill=%22%23f3dcc8%22/> </g> </svg> ">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${esc(o.url)}">
<meta name="twitter:title" content="${esc(o.title)}">
<meta name="twitter:description" content="${esc(o.description)}">
${image}
<style>${o.themeCss}${BASE_CSS}</style>
</head>
<body>
<main class="wrap">${o.body}</main>
</body>
</html>`;
}

export const FOOTER = `<footer>Made with <a href="https://got-a.page">got-a.page</a> - everyone's got a page.</footer>`;
