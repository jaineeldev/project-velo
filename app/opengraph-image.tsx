import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Velo: Ship code, not spreadsheets.";
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
          backgroundColor: "#f8f8f8",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "9999px",
              backgroundColor: "#2563eb",
              boxShadow: "0 0 0 8px rgba(37, 99, 235, 0.18)",
            }}
          />
          <div
            style={{
              fontSize: "32px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#111111",
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
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#111111",
            }}
          >
            <div style={{ display: "flex" }}>Ship code,</div>
            <div style={{ display: "flex" }}>not spreadsheets.</div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "30px",
              lineHeight: 1.4,
              color: "#666666",
              maxWidth: "920px",
            }}
          >
            Proposals, projects, and invoices, built for AU freelance devs.
          </div>
        </div>

        {/* Accent rule */}
        <div
          style={{
            display: "flex",
            width: "160px",
            height: "8px",
            borderRadius: "4px",
            backgroundColor: "#2563eb",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
