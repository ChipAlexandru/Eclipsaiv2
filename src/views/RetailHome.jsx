"use client";

// RetailHome — the retail-focused homepage, a faithful reproduction of the
// self-contained prototype (eclipsai-retail-website-copy-current-2026-06-22.html).
// Shared by both "/" and "/retail" so there is a single source of truth.
//
// The prototype is inline CSS + markup + a small vanilla-JS script. Rather than
// re-transcribe ~3,700 lines into JSX (which would risk silent copy drift), the
// three parts are carried verbatim in retail/retailContent.js (generated from
// the prototype) and reconstituted here:
//   - RETAIL_CSS  -> injected <style> (scoped to this route by virtue of only
//                    mounting on the retail pages)
//   - RETAIL_BODY -> the scene markup (server-rendered, so copy is crawlable)
//   - RETAIL_JS   -> the prototype's scene observer / typewriter / surface-tab /
//                    video-playback-rate behavior, run once after mount
import { useEffect, useRef } from "react";
import { RETAIL_CSS, RETAIL_BODY, RETAIL_JS } from "./retail/retailContent.js";

// The retail prototype is stored as a generated artifact. Normalize its
// user-facing copy at the rendering boundary so the public site stays in US English.
const RETAIL_BODY_EN_US = RETAIL_BODY.replaceAll("labour", "labor");
const RETAIL_JS_EN_US = RETAIL_JS.replaceAll("labour", "labor");

export function RetailHome() {
  const didInit = useRef(false);

  useEffect(() => {
    // Guard against React Strict Mode's double-invoke in dev so the prototype's
    // observers and typewriter only initialize once per mount.
    if (didInit.current) return;
    didInit.current = true;

    // Scripts inside dangerouslySetInnerHTML never execute, so run the
    // prototype's inline script verbatim by appending a real <script> node.
    // The script is wrapped in an IIFE so its top-level `const`s stay
    // function-scoped — re-running it (e.g. after a client-side navigation back
    // to this route) can't throw "identifier already declared". Any previous
    // copy is removed first so the script node never accumulates.
    document.getElementById("retail-inline-script")?.remove();
    const script = document.createElement("script");
    script.id = "retail-inline-script";
    script.textContent = "(function(){\n" + RETAIL_JS_EN_US + "\n})();";
    document.body.appendChild(script);

    // Production adaptation for mobile: native muted autoplay is frequently
    // deferred or blocked on phones (iOS Low Power Mode, data-saver modes, or
    // browsers that only autoplay once the video is on-screen). Because the
    // clip plays a single pass and then pauses, a viewer who reaches it late
    // would see a paused last frame. Instead, drive playback from scroll: start
    // it with a muted, playsinline programmatic play() — which mobile permits
    // without a tap — the first time it enters the viewport. Single pass: it is
    // not restarted on re-entry, preserving the prototype's play-once feel.
    const videos = [...document.querySelectorAll("video[data-playback-rate]")];
    videos.forEach((v) => {
      // On-view becomes the single trigger; neutralize the native autoplay so
      // it doesn't run an early, unseen pass before the viewer scrolls down.
      v.removeAttribute("autoplay");
      try {
        v.pause();
        v.currentTime = 0;
      } catch {}
    });
    const seen = new WeakSet();
    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          const v = entry.target;
          try {
            v.currentTime = 0;
          } catch {}
          const p = v.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        });
      },
      { threshold: 0.35 }
    );
    videos.forEach((v) => playObserver.observe(v));
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RETAIL_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: RETAIL_BODY_EN_US }} />
    </>
  );
}
