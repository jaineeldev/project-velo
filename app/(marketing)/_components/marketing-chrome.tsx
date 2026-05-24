"use client";

import { useState } from "react";
import { GeoNotice } from "./geo-notice";
import { Preloader } from "./preloader";
import { ScrollProgressBar } from "./scroll-progress";

// Bundles every client-only ambient effect that the marketing layout needs.
// Lives in the layout so the same persistent UI rides across page navigation
// without re-mounting.
export function MarketingChrome() {
  const [appReady, setAppReady] = useState(false);

  return (
    <>
      <Preloader onReady={() => setAppReady(true)} />
      <GeoNotice ready={appReady} />
      <ScrollProgressBar />
    </>
  );
}
