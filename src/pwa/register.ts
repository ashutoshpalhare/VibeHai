/**
 * Registers the VibeHai service worker for offline shell caching + PWA install.
 * Every failure is swallowed — the app is a pure SPA and works fine without it
 * (e.g. when served from a sandbox, an iframe, or the file system).
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol === "file:") return;

  const swUrl = new URL("sw.js", document.baseURI).href;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(swUrl, { scope: "./" })
      .then((reg) => {
        // look for updates on every load
        reg.addEventListener("updatefound", () => {
          const next = reg.installing;
          next?.addEventListener("statechange", () => {
            if (next.state === "installed" && navigator.serviceWorker.controller) {
              next.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {
        /* PWA unavailable — ignore */
      });

    let refreshed = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshed) return;
      refreshed = true;
      location.reload();
    });
  });
}
