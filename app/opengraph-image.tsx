import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Velo: One place. Every project. Start to paid.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Programmatic OG image generated at build/request time. Satori (the renderer
// behind `next/og`) only supports a subset of flexbox — every container needs
// `display: flex` and there is no `inline-block`. Fonts default to the runtime
// fallback; load Inter via `fetch` here later if the kerning starts to matter.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0A0A0A",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "9999px",
              backgroundColor: "#4F7EF7",
              boxShadow: "0 0 0 8px rgba(79, 126, 247, 0.18)",
            }}
          />
          <div
            style={{
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#f0f0f0",
            }}
          >
            Velo
          </div>
        </div>

        {/* Headline + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "96px",
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
              color: "#f0f0f0",
            }}
          >
            <div style={{ display: "flex" }}>One place.</div>
            <div style={{ display: "flex" }}>Every project.</div>
            <div style={{ display: "flex", gap: "24px" }}>
              <span>Start to</span>
              <span style={{ color: "#4F7EF7" }}>paid.</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              lineHeight: 1.4,
              color: "#A0A0A0",
              maxWidth: "920px",
            }}
          >
            Proposals, projects, and invoicing for AU freelance devs.
          </div>
        </div>

        {/* Accent rule */}
        <div
          style={{
            display: "flex",
            width: "160px",
            height: "8px",
            borderRadius: "4px",
            backgroundColor: "#4F7EF7",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
