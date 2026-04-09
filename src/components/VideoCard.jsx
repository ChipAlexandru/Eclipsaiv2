import { Play } from "lucide-react";
import { C } from "../theme.js";

// Dark autoplay video card — Home page, third editorial slot.
// Brief says: "Third card is a real <video autoPlay muted loop playsInline>
// element. No captions overlay. Vermillion play circle is fine as a poster fallback."
// Behavior: if `src` is provided, render a real <video>; otherwise render the
// vermillion play-circle placeholder preserved from definitive.jsx.
export function VideoCard({ title, src, poster }) {
  return (
    <div style={{
      borderRadius: 12,
      overflow: "hidden",
      background: "#1a0d12",
      border: `1px solid ${C.border}`,
      minHeight: 220,
      position: "relative",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        flex: 1,
        background: src ? "#0f0609" : `linear-gradient(135deg, #2a1520 0%, #1a0d12 60%, #0f0609 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        {src ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={poster}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src={src} />
          </video>
        ) : (
          <div style={{
            width: 54, height: 54, borderRadius: "50%",
            background: "rgba(208,74,40,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(208,74,40,0.35)",
          }}>
            <Play size={22} color="#fff" style={{ marginLeft: 3 }} />
          </div>
        )}
      </div>
      <div style={{
        padding: "10px 14px",
        display: "flex", alignItems: "center",
        background: "rgba(255,255,255,0.04)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>
          {title}
        </span>
      </div>
    </div>
  );
}
