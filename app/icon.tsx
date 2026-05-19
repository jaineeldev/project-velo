import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon — the wordmark dot at favicon scale. Filled primary disc with a
// soft halo, on the same #f8f8f8 surface the marketing page uses, so the
// browser tab visually matches the site chrome.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f8f8",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: "#2563eb",
            boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.18)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
