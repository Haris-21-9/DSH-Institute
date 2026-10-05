import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleAtlasApiRequest } from "./lib/atlasApiServer";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

let activeProxiedDomainServer = "";

const processCssContent = (cssText: string, baseUrl: string, localOrigin: string = "") => {
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

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    const localOrigin = url.origin;

    // ─── MONGODB ATLAS API ENDPOINTS ───
    if (url.pathname.startsWith("/api/atlas/")) {
      const atlasResponse = await handleAtlasApiRequest(request);
      if (atlasResponse) return atlasResponse;
    }

    // ─── ASSET PROXY ENDPOINT (Bypasses CORS for Fonts, Stylesheets & Media) ───
    if (url.pathname === "/api/asset-proxy") {
      const assetUrl = url.searchParams.get("url");
      if (!assetUrl) {
        return new Response("Missing asset URL", { status: 400 });
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
        if (!response.ok) {
          return new Response("", {
            status: 200,
            headers: {
              "Content-Type": "image/png",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
        const contentType = response.headers.get("content-type") || "application/octet-stream";

        if (contentType.includes("text/css") || target.toLowerCase().includes(".css")) {
          const text = await response.text();
          const processedCss = processCssContent(text, target, localOrigin);
          return new Response(processedCss, {
            status: 200,
            headers: {
              "Content-Type": "text/css; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, OPTIONS",
              "Access-Control-Allow-Headers": "*",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }

        const buffer = await response.arrayBuffer();
        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Cache-Control": "public, max-age=86400",
          },
        });
      } catch (err) {
        // Silently return empty response for failed asset loads to avoid console spam
        return new Response("", { status: 200, headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }

    // ─── LIVE WEBSITE HTML PROXY (Bypasses 403 & X-Frame-Options) ───
    if (url.pathname === "/api/proxy") {
      const targetUrl = url.searchParams.get("url");
      if (!targetUrl) {
        return new Response("Missing target URL", { status: 400 });
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
        activeProxiedDomainServer = new URL(finalUrl).origin;
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
        const resolveUrl = (rel: string) => {
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

        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return new Response(
          `<!DOCTYPE html><html><body style="background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h2>${targetUrl}</h2></body></html>`,
          {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }
        );
      }
    }

    // ─── FALLBACK PROXY FOR UNHANDLED PREVIEW ASSETS & NEXT.JS / CLIENT FETCHES ───
    const refererHeader = request.headers.get("referer") || request.headers.get("referrer") || "";
    const isFromProxyIframe = refererHeader.includes("/api/proxy");

    let refererTarget = "";
    if (isFromProxyIframe) {
      try {
        const refUrl = new URL(refererHeader);
        const pUrl = refUrl.searchParams.get("url");
        if (pUrl) refererTarget = new URL(pUrl).origin;
      } catch {}
    }

    const fallbackDomain = refererTarget || activeProxiedDomainServer;

    const isLocalAppRoute =
      !isFromProxyIframe &&
      (url.pathname.startsWith("/api/atlas") ||
        url.pathname.startsWith("/src/") ||
        url.pathname.startsWith("/@") ||
        url.pathname.startsWith("/node_modules/") ||
        url.pathname === "/" ||
        url.pathname === "/index.html" ||
        url.pathname === "/admin" ||
        url.pathname.startsWith("/admin/") ||
        url.pathname === "/login" ||
        url.pathname === "/team" ||
        url.pathname === "/projects" ||
        url.pathname === "/dashboard" ||
        url.pathname === "/about" ||
        url.pathname === "/services" ||
        url.pathname === "/contact" ||
        url.pathname === "/blog");

    if (!isLocalAppRoute && fallbackDomain) {
      try {
        const targetAssetUrl = new URL(url.pathname + url.search, fallbackDomain).href;
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
          if (contentType.includes("text/css") || url.pathname.endsWith(".css")) {
            const text = await response.text();
            const processed = processCssContent(text, targetAssetUrl, localOrigin);
            return new Response(processed, {
              status: 200,
              headers: {
                "Content-Type": "text/css; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=86400",
              },
            });
          }
          const buffer = await response.arrayBuffer();
          return new Response(buffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=86400",
            },
          });
        } else {
          return new Response("", {
            status: 200,
            headers: {
              "Content-Type": "text/plain",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      } catch {
        if (isFromProxyIframe) {
          return new Response("", {
            status: 200,
            headers: {
              "Content-Type": "text/plain",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
