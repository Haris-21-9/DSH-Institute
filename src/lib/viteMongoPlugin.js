import dns from "node:dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}
import { MongoClient } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://haris2192001_db_user:1of06JZdrwXOtgif@cluster0.9xogsl5.mongodb.net/Colabify?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "Colabify";

let mongoClient = null;
let mongoDb = null;
let connectPromise = null;
let lastConnectFailure = 0;
const FAILURE_COOLDOWN_MS = 20000; // 20 sec cooldown if DB is offline/unreachable

// In-memory persistent stores in dev server when MongoDB Atlas is connecting or unreachable
let memoryProjects = [];
let memoryTeam = [];
let memoryBlogs = [];
let memoryReviews = [];

async function getDb() {
  if (mongoDb && mongoClient) return mongoDb;

  // If connection failed recently, return null instantly (0ms) so requests never hang
  if (Date.now() - lastConnectFailure < FAILURE_COOLDOWN_MS) {
    return null;
  }

  if (!connectPromise) {
    try {
      mongoClient = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 1000,
        connectTimeoutMS: 1000,
      });
      connectPromise = mongoClient
        .connect()
        .then(() => {
          mongoDb = mongoClient.db(DB_NAME);
          return mongoDb;
        })
        .catch((err) => {
          mongoClient = null;
          mongoDb = null;
          connectPromise = null;
          lastConnectFailure = Date.now();
          return null;
        });
    } catch {
      mongoClient = null;
      mongoDb = null;
      connectPromise = null;
      lastConnectFailure = Date.now();
      return null;
    }
  }

  return connectPromise;
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(data));
}

let activeProxiedDomain = "";

export function viteMongoPlugin() {
  return {
    name: "vite-plugin-mongodb-atlas",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        const pathname = urlObj.pathname;

        // Handle CORS preflight
        if (req.method === "OPTIONS") {
          return sendJson(res, 204, {});
        }

        // Helper to process and rewrite CSS url() references to use asset-proxy
        const processCssContent = (cssText, baseUrl, localOrigin = "") => {
          return cssText.replace(/url\((['"]?)([^'"()]+)\1\)/gi, (match, q, val) => {
            if (!val || val.startsWith("data:") || val.startsWith("blob:") || val.startsWith("#") || val.includes("/api/asset-proxy")) {
              return match;
            }
            try {
              const resolvedUrl = new URL(val, baseUrl).href;
              const proxyPrefix = localOrigin ? `${localOrigin}/api/asset-proxy?url=` : "/api/asset-proxy?url=";
              return `url("${proxyPrefix}${encodeURIComponent(resolvedUrl)}")`;
            } catch {
              return match;
            }
          });
        };

        const localOrigin = `http://${req.headers.host || "localhost"}`;

        // ─── ASSET PROXY ENDPOINT (Bypasses CORS for Fonts, Stylesheets & Media) ───
        if (pathname === "/api/asset-proxy") {
          const assetUrl = urlObj.searchParams.get("url");
          if (!assetUrl) {
            res.statusCode = 400;
            return res.end("Missing asset URL");
          }
          try {
            let target = assetUrl.trim();
            if (!/^https?:\/\//i.test(target)) {
              target = "https://" + target;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(target, {
              signal: controller.signal,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                Accept: "*/*",
              },
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "image/png");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader("Cache-Control", "public, max-age=86400");
              return res.end("");
            }
            const contentType = response.headers.get("content-type") || "application/octet-stream";
            
            if (contentType.includes("text/css") || target.toLowerCase().includes(".css")) {
              const text = await response.text();
              const processedCss = processCssContent(text, target, localOrigin);
              const buffer = Buffer.from(processedCss);

              res.statusCode = 200;
              res.setHeader("Content-Type", "text/css; charset=utf-8");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
              res.setHeader("Access-Control-Allow-Headers", "*");
              res.setHeader("Cache-Control", "public, max-age=86400");
              return res.end(buffer);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            res.statusCode = 200;
            res.setHeader("Content-Type", contentType);
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "*");
            res.setHeader("Cache-Control", "public, max-age=86400");
            return res.end(buffer);
          } catch (err) {
            // Silently return empty response for failed asset loads to avoid console spam
            res.statusCode = 200;
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res.end("");
          }
        }

        // ─── LIVE WEBSITE HTML PROXY (Bypasses 403 & X-Frame-Options) ───
        if (pathname === "/api/proxy") {
          const targetUrl = urlObj.searchParams.get("url");
          if (!targetUrl) {
            res.statusCode = 400;
            return res.end("Missing target URL");
          }
          try {
            let normalized = targetUrl.trim();
            if (!/^https?:\/\//i.test(normalized)) {
              normalized = "https://" + normalized;
            }
            // Auto-correct any legacy domain references
            normalized = normalized.replace("://digitalskillshouse.com", "://digitalskillshouse.pk");
            normalized = normalized.replace("://kambostrong.com", "://www.kambostrong.nz");

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            const response = await fetch(normalized, {
              signal: controller.signal,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache",
              },
              redirect: "follow",
            });
            clearTimeout(timeoutId);

            const finalUrl = response.url || normalized;
            activeProxiedDomain = new URL(finalUrl).origin;
            let html = await response.text();

            // 1. Convert lazy loaded images to immediate src
            html = html.replace(/\sdata-src=(["'])([^"']+)\1/gi, ' src="$2"');
            html = html.replace(/\sdata-lazy-src=(["'])([^"']+)\1/gi, ' src="$2"');
            html = html.replace(/\sdata-original=(["'])([^"']+)\1/gi, ' src="$2"');
            html = html.replace(/\sdata-srcset=(["'])([^"']+)\1/gi, ' srcset="$2"');
            html = html.replace(/\sloading=["']lazy["']/gi, ' loading="eager"');

            // 2. Strip only aggressive ads, nested iframes & preload link tags (eliminates Chrome "was preloaded using link preload but not used" warnings)
            html = html.replace(/<script\b[^>]*src=["'][^"']*(?:adsbygoogle|googletagservices)[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, "");
            html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
            html = html.replace(/<iframe[^>]*>/gi, "");
            html = html.replace(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*>/gi, "");
            html = html.replace(/<link\b[\s\S]*?\b(?:preload|modulepreload|prefetch)\b[\s\S]*?>/gi, "");

            // Helper to resolve relative asset paths against finalUrl
            const resolveUrl = (rel) => {
              if (!rel || rel.startsWith("http://") || rel.startsWith("https://") || rel.startsWith("data:") || rel.startsWith("blob:") || rel.startsWith("#") || rel.startsWith("mailto:") || rel.startsWith("tel:") || rel.startsWith("javascript:")) {
                return rel;
              }
              try {
                return new URL(rel, finalUrl).href;
              } catch {
                return rel;
              }
            };

            // 3. Resolve relative src/href/action/poster attributes & proxy stylesheets & font files for CORS using localOrigin
            html = html.replace(/\s(src|href|action|poster)=(["'])([^"']+)\2/gi, (match, attr, q, val) => {
              const resolved = resolveUrl(val);
              if (/\.(?:woff2?|otf|ttf|eot|css)(?:\?.*)?$/i.test(resolved) || (attr === "href" && match.includes('rel="stylesheet"'))) {
                return ` ${attr}=${q}${localOrigin}/api/asset-proxy?url=${encodeURIComponent(resolved)}${q}`;
              }
              return ` ${attr}=${q}${resolved}${q}`;
            });

            // 4. Resolve url(...) in inline styles & proxy CSS fonts using localOrigin
            html = html.replace(/url\((['"]?)([^'"()]+)\1\)/gi, (match, q, val) => {
              const resolved = resolveUrl(val);
              if (!resolved || resolved.startsWith("data:") || resolved.startsWith("blob:") || resolved.startsWith("#")) return match;
              return `url("${localOrigin}/api/asset-proxy?url=${encodeURIComponent(resolved)}")`;
            });

            // 5. Inject safety isolation script & network interceptor & full-page styles
            const targetOrigin = new URL(finalUrl).origin;
            const baseTag = `<base href="${finalUrl}">
            <script>
              try {
                window.alert = function(){};
                window.confirm = function(){ return false; };
                window.prompt = function(){ return null; };
                window.open = function(){ return null; };
                console.warn = function(){};
                console.error = function(){};
                console.info = function(){};

                // Neutralize unload listeners to prevent Permissions policy violations
                try {
                  const origAddEventListener = Window.prototype.addEventListener;
                  Window.prototype.addEventListener = function(type, listener, options) {
                    if (type === 'unload' || type === 'beforeunload') return;
                    return origAddEventListener.call(this, type, listener, options);
                  };
                  const origDocAddEventListener = Document.prototype.addEventListener;
                  Document.prototype.addEventListener = function(type, listener, options) {
                    if (type === 'unload' || type === 'beforeunload') return;
                    return origDocAddEventListener.call(this, type, listener, options);
                  };
                  window.onunload = null;
                  window.onbeforeunload = null;
                } catch(e) {}

                // Suppress WebSocket connection errors
                try {
                  const origWebSocket = window.WebSocket;
                  window.WebSocket = function(url, protocols) {
                    // Block all WebSocket connections from proxied content
                    console.warn('[Proxy] WebSocket connection blocked:', url);
                    throw new Error('WebSocket connections are blocked in proxy preview');
                  };
                  window.WebSocket.prototype = origWebSocket.prototype;
                } catch(e) {}

                // Suppress unhandled errors from external tracking scripts inside preview
                window.addEventListener('error', function(e) {
                  if (e) { e.preventDefault(); e.stopPropagation(); }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  if (e) { e.preventDefault(); e.stopPropagation(); }
                }, true);

                // Intercept dynamic fetch calls in preview JS using absolute local origin
                (function() {
                  var targetBase = "${finalUrl}";
                  var targetOrig = "${targetOrigin}";
                  var localOrig = window.location.origin;
                  var origFetch = window.fetch;
                  window.fetch = function(input, init) {
                    try {
                      var u = typeof input === 'string' ? input : (input && input.url ? input.url : '');
                      if (u && !u.startsWith('/api/') && !u.startsWith(localOrig + '/api/') && !u.startsWith('data:') && !u.startsWith('blob:')) {
                        var resolved = new URL(u, targetBase).href;
                        if (resolved.startsWith(targetOrig)) {
                          var proxied = localOrig + '/api/asset-proxy?url=' + encodeURIComponent(resolved);
                          if (typeof input === 'string') input = proxied;
                          else if (input && input.url) input = new Request(proxied, input);
                        }
                      }
                    } catch(err) {}
                    return origFetch.call(this, input, init);
                  };

                  var origOpen = XMLHttpRequest.prototype.open;
                  XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
                    try {
                      if (typeof url === 'string' && !url.startsWith('/api/') && !url.startsWith(localOrig + '/api/') && !url.startsWith('data:') && !url.startsWith('blob:')) {
                        var resolved = new URL(url, targetBase).href;
                        if (resolved.startsWith(targetOrig)) {
                          url = localOrig + '/api/asset-proxy?url=' + encodeURIComponent(resolved);
                        }
                      }
                    } catch(err) {}
                    return origOpen.call(this, method, url, async, user, pass);
                  };
                })();
              } catch(e) {}
            </script>
            <style>
              @font-face {
                font-family: 'nunito-latin';
                src: local('Segoe UI'), local('Arial'), local('sans-serif');
              }
              @font-face {
                font-family: 'nya';
                src: local('Segoe UI'), local('Arial'), local('sans-serif');
              }
              html, body {
                width: 100% !important;
                min-width: 1280px !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow-x: hidden !important;
                background-color: #ffffff !important;
                pointer-events: none !important;
                user-select: none !important;
              }
              /* Ensure all sections and elements are visible */
              [data-aos], .wow, .animate-on-scroll, .fade-in, .reveal, .animated {
                opacity: 1 !important;
                visibility: visible !important;
                transform: none !important;
                animation: none !important;
                transition: none !important;
              }
              img, svg, video {
                opacity: 1 !important;
                visibility: visible !important;
              }
              /* Only hide obstructive cookie consent modals */
              #onetrust-consent-sdk, .cc-window, .cookie-notice-container, .gdpr-cookie-consent, #cookie-law-info-bar, .cookie-banner-popup, .cookie-banner {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            </style>`;

            if (/<head[^>]*>/i.test(html)) {
              html = html.replace(/<head[^>]*>/i, `$&${baseTag}`);
            } else {
              html = `${baseTag}${html}`;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "*");
            res.removeHeader("X-Frame-Options");
            res.removeHeader("Content-Security-Policy");
            return res.end(html);
          } catch (err) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.end(`<!DOCTYPE html><html><body style="background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h2>${targetUrl}</h2></body></html>`);
          }
        }

        // ─── FALLBACK PROXY FOR UNHANDLED PREVIEW ASSETS & NEXT.JS / CLIENT FETCHES ───
        const refererHeader = req.headers.referer || req.headers.referrer || "";
        const isFromProxyIframe = refererHeader.includes("/api/proxy");

        let refererTarget = "";
        if (isFromProxyIframe) {
          try {
            const refUrl = new URL(refererHeader);
            const pUrl = refUrl.searchParams.get("url");
            if (pUrl) refererTarget = new URL(pUrl).origin;
          } catch {}
        }

        // Only intercept assets originating from inside a live preview proxy iframe
        if (isFromProxyIframe && refererTarget) {
          try {
            const targetAssetUrl = new URL(req.url, refererTarget).href;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const response = await fetch(targetAssetUrl, {
              signal: controller.signal,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                Accept: "*/*",
              },
            });
            clearTimeout(timeoutId);

            if (response.ok) {
              const contentType = response.headers.get("content-type") || "application/octet-stream";
              if (contentType.includes("text/css") || pathname.endsWith(".css")) {
                const text = await response.text();
                const processed = processCssContent(text, targetAssetUrl, localOrigin);
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/css; charset=utf-8");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Cache-Control", "public, max-age=86400");
                return res.end(Buffer.from(processed));
              }
              const arrayBuffer = await response.arrayBuffer();
              res.statusCode = 200;
              res.setHeader("Content-Type", contentType);
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader("Cache-Control", "public, max-age=86400");
              return res.end(Buffer.from(arrayBuffer));
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "text/plain");
              res.setHeader("Access-Control-Allow-Origin", "*");
              return res.end("");
            }
          } catch {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res.end("");
          }
        }

        // ─── PROJECTS API ───
        if (pathname === "/api/atlas/projects") {
          try {
            const db = await getDb();
            if (db) {
              const col = db.collection("projects");
              if (req.method === "GET") {
                const docs = await col.find({}).sort({ id: -1 }).toArray();
                const cleanDocs = docs.map(({ _id, ...rest }) => rest);
                memoryProjects = cleanDocs;
                return sendJson(res, 200, { success: true, projects: cleanDocs });
              }

              if (req.method === "POST") {
                const body = await parseBody(req);
                if (body && body.id) {
                  const clean = { ...body };
                  delete clean._id;
                  await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
                  memoryProjects = [clean, ...memoryProjects.filter((p) => String(p.id) !== String(clean.id))];
                  return sendJson(res, 200, { success: true, project: clean });
                }
              }

              if (req.method === "DELETE") {
                const body = await parseBody(req);
                const id = body.id || urlObj.searchParams.get("id");
                if (id) {
                  const numId = Number(id);
                  await col.deleteOne({ $or: [{ id: id }, { id: numId }, { id: String(id) }] });
                  memoryProjects = memoryProjects.filter((p) => String(p.id) !== String(id));
                  return sendJson(res, 200, { success: true, id });
                }
              }
            }
          } catch (err) {
            console.warn("[MongoDB Atlas Projects fallback]:", err.message || err);
          }

          // Memory fallback (always returns 200 OK)
          if (req.method === "GET") {
            return sendJson(res, 200, { success: true, projects: memoryProjects });
          }
          if (req.method === "POST") {
            const body = await parseBody(req);
            if (body && body.id) {
              memoryProjects = [body, ...memoryProjects.filter((p) => String(p.id) !== String(body.id))];
              return sendJson(res, 200, { success: true, project: body });
            }
          }
          if (req.method === "DELETE") {
            const body = await parseBody(req);
            const id = body.id || urlObj.searchParams.get("id");
            if (id) {
              memoryProjects = memoryProjects.filter((p) => String(p.id) !== String(id));
              return sendJson(res, 200, { success: true, id });
            }
          }
          return sendJson(res, 200, { success: true, projects: memoryProjects });
        }

        // ─── TEAM MEMBERS API ───
        if (pathname === "/api/atlas/team") {
          try {
            const db = await getDb();
            if (db) {
              const col = db.collection("team_members");
              if (req.method === "GET") {
                const docs = await col.find({}).sort({ id: -1 }).toArray();
                const cleanDocs = docs.map(({ _id, ...rest }) => rest);

                memoryTeam = cleanDocs;
                return sendJson(res, 200, { success: true, team: cleanDocs });
              }

              if (req.method === "POST") {
                const body = await parseBody(req);
                if (body && body.id) {
                  const clean = { ...body };
                  delete clean._id;
                  await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
                  memoryTeam = [clean, ...memoryTeam.filter((m) => String(m.id) !== String(clean.id))];
                  return sendJson(res, 200, { success: true, member: clean });
                }
              }

              if (req.method === "DELETE") {
                const body = await parseBody(req);
                const id = body.id || urlObj.searchParams.get("id");
                if (id) {
                  const numId = Number(id);
                  await col.deleteOne({ $or: [{ id: id }, { id: numId }, { id: String(id) }] });
                  memoryTeam = memoryTeam.filter((m) => String(m.id) !== String(id));
                  return sendJson(res, 200, { success: true, id });
                }
              }
            }
          } catch (err) {
            console.warn("[MongoDB Atlas Team fallback]:", err.message || err);
          }

          // Memory fallback (always returns 200 OK)
          if (req.method === "GET") {
            return sendJson(res, 200, { success: true, team: memoryTeam });
          }
          if (req.method === "POST") {
            const body = await parseBody(req);
            if (body && body.id) {
              memoryTeam = [body, ...memoryTeam.filter((m) => String(m.id) !== String(body.id))];
              return sendJson(res, 200, { success: true, member: body });
            }
          }
          if (req.method === "DELETE") {
            const body = await parseBody(req);
            const id = body.id || urlObj.searchParams.get("id");
            if (id) {
              memoryTeam = memoryTeam.filter((m) => String(m.id) !== String(id));
              return sendJson(res, 200, { success: true, id });
            }
          }
          return sendJson(res, 200, { success: true, team: memoryTeam });
        }

        // ─── BLOGS API ───
        if (pathname === "/api/atlas/blogs") {
          try {
            const db = await getDb();
            if (db) {
              const col = db.collection("blogs");
              if (req.method === "GET") {
                const docs = await col.find({}).sort({ id: -1 }).toArray();
                const cleanDocs = docs.map(({ _id, ...rest }) => rest);
                memoryBlogs = cleanDocs;
                return sendJson(res, 200, { success: true, blogs: cleanDocs });
              }

              if (req.method === "POST") {
                const body = await parseBody(req);
                if (body && body.id) {
                  const clean = { ...body };
                  delete clean._id;
                  await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
                  memoryBlogs = [clean, ...memoryBlogs.filter((b) => String(b.id) !== String(clean.id))];
                  return sendJson(res, 200, { success: true, blog: clean });
                }
              }

              if (req.method === "DELETE") {
                const body = await parseBody(req);
                const id = body.id || urlObj.searchParams.get("id");
                if (id) {
                  const numId = Number(id);
                  await col.deleteOne({ $or: [{ id: id }, { id: numId }, { id: String(id) }] });
                  memoryBlogs = memoryBlogs.filter((b) => String(b.id) !== String(id));
                  return sendJson(res, 200, { success: true, id });
                }
              }
            }
          } catch (err) {
            console.warn("[MongoDB Atlas Blogs fallback]:", err.message || err);
          }

          // Memory fallback (always returns 200 OK)
          if (req.method === "GET") {
            return sendJson(res, 200, { success: true, blogs: memoryBlogs });
          }
          if (req.method === "POST") {
            const body = await parseBody(req);
            if (body && body.id) {
              memoryBlogs = [body, ...memoryBlogs.filter((b) => String(b.id) !== String(body.id))];
              return sendJson(res, 200, { success: true, blog: body });
            }
          }
          if (req.method === "DELETE") {
            const body = await parseBody(req);
            const id = body.id || urlObj.searchParams.get("id");
            if (id) {
              memoryBlogs = memoryBlogs.filter((b) => String(b.id) !== String(id));
              return sendJson(res, 200, { success: true, id });
            }
          }
          return sendJson(res, 200, { success: true, blogs: memoryBlogs });
        }

        // ─── USERS API ───
        if (pathname === "/api/atlas/users") {
          try {
            const db = await getDb();
            if (db) {
              const col = db.collection("users");
              if (req.method === "GET") {
                const docs = await col.find({}).toArray();
                const cleanDocs = docs.map(({ _id, ...rest }) => rest);
                return sendJson(res, 200, { success: true, users: cleanDocs });
              }

              if (req.method === "POST") {
                const body = await parseBody(req);
                if (body && (body.email || body.id)) {
                  const clean = { ...body };
                  delete clean._id;
                  const query = clean.email ? { email: clean.email } : { id: clean.id };
                  await col.updateOne(query, { $set: clean }, { upsert: true });
                  return sendJson(res, 200, { success: true, user: clean });
                }
              }
            }
          } catch (err) {
            console.warn("[MongoDB Atlas Users fallback]:", err.message || err);
          }
          return sendJson(res, 200, { success: true, users: [] });
        }

        // ─── SETTINGS API (Hero Stars, Ratings, and Badge Settings) ───
        if (pathname === "/api/atlas/settings") {
          try {
            const db = await getDb();
            if (db) {
              const col = db.collection("settings");
              if (req.method === "GET") {
                const key = urlObj.searchParams.get("key") || "hero_trust";
                const doc = await col.findOne({ key });
                if (doc) {
                  const { _id, ...rest } = doc;
                  return sendJson(res, 200, { success: true, settings: rest });
                }
              }
              if (req.method === "POST") {
                const body = await parseBody(req);
                if (body && body.key) {
                  const clean = { ...body };
                  delete clean._id;
                  await col.updateOne({ key: clean.key }, { $set: clean }, { upsert: true });
                  return sendJson(res, 200, { success: true, settings: clean });
                }
              }
            }
          } catch (err) {
            console.warn("[MongoDB Atlas Settings fallback]:", err.message || err);
          }
          if (req.method === "POST") {
            const body = await parseBody(req);
            return sendJson(res, 200, { success: true, settings: body });
          }
          return sendJson(res, 200, { success: true, settings: null });
        }

        // ─── REVIEWS API (Student & Client Testimonials) ───
        if (pathname === "/api/atlas/reviews") {
          try {
            const db = await getDb();
            if (db) {
              const col = db.collection("reviews");
              if (req.method === "GET") {
                const docs = await col.find({}).sort({ id: -1 }).toArray();
                const cleanDocs = docs.map(({ _id, ...rest }) => rest);
                memoryReviews = cleanDocs;
                return sendJson(res, 200, { success: true, reviews: cleanDocs });
              }

              if (req.method === "POST") {
                const body = await parseBody(req);
                if (body && body.id) {
                  const clean = { ...body };
                  delete clean._id;
                  await col.updateOne({ id: clean.id }, { $set: clean }, { upsert: true });
                  memoryReviews = [clean, ...memoryReviews.filter((r) => String(r.id) !== String(clean.id))];
                  return sendJson(res, 200, { success: true, review: clean });
                }
              }

              if (req.method === "DELETE") {
                const body = await parseBody(req);
                const id = body.id || urlObj.searchParams.get("id");
                if (id) {
                  await col.deleteOne({ $or: [{ id: id }, { id: String(id) }] });
                  memoryReviews = memoryReviews.filter((r) => String(r.id) !== String(id));
                  return sendJson(res, 200, { success: true, id });
                }
              }
            }
          } catch (err) {
            console.warn("[MongoDB Atlas Reviews fallback]:", err.message || err);
          }

          // Memory fallback
          if (req.method === "GET") {
            return sendJson(res, 200, { success: true, reviews: memoryReviews });
          }
          if (req.method === "POST") {
            const body = await parseBody(req);
            if (body && body.id) {
              memoryReviews = [body, ...memoryReviews.filter((r) => String(r.id) !== String(body.id))];
              return sendJson(res, 200, { success: true, review: body });
            }
          }
          if (req.method === "DELETE") {
            const body = await parseBody(req);
            const id = body.id || urlObj.searchParams.get("id");
            if (id) {
              memoryReviews = memoryReviews.filter((r) => String(r.id) !== String(id));
              return sendJson(res, 200, { success: true, id });
            }
          }
          return sendJson(res, 200, { success: true, reviews: memoryReviews });
        }

        next();
      });
    },
  };
}
