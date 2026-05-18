"use client";

import { useEffect } from "react";

// Last-resort boundary. Renders when an error escapes the root layout
// itself, so we must provide our own <html> and <body>. Styles are kept
// inline — globals.css is normally still applied here, but this page must
// render legibly even if the failure prevented stylesheet loading.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#ffffff",
          color: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#737373",
              margin: 0,
            }}
          >
            Something went wrong
          </p>
          <h1
            style={{
              marginTop: "0.5rem",
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#0a0a0a",
            }}
          >
            We hit a critical error
          </h1>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.875rem",
              color: "#525252",
            }}
          >
            Something failed before the page could load. Please try again in a
            moment.
          </p>

          {error.digest && (
            <p
              style={{
                marginTop: "0.75rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "#737373",
              }}
            >
              Reference: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              cursor: "pointer",
              borderRadius: "0.375rem",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              padding: "0.5rem 0.875rem",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
