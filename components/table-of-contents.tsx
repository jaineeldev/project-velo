"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn, focusRing } from "@/lib/utils";

export type TocSection = { id: string; title: string };

export function TableOfContents({ sections }: { sections: TocSection[] }) {
  const prefersReduced = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const ratiosRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const ratios = ratiosRef.current;
    sections.forEach((s) => ratios.set(s.id, 0));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.intersectionRatio);
        });
        let bestId = "";
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestRatio > 0) setActiveId(bestId);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    const elements: HTMLElement[] = [];
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    });
    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
    setActiveId(id);
  };

  return (
    <>
      <MobileJumpTo
        sections={sections}
        activeId={activeId}
        onSelect={scrollToSection}
      />
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <nav
          aria-label="On this page"
          className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2"
        >
          <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
            On this page
          </p>
          <ul className="space-y-2">
            {sections.map((s) => {
              const isActive = s.id === activeId;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(s.id);
                    }}
                    className={cn(
                      "block rounded-sm py-0.5 pl-3 text-sm leading-snug transition-colors",
                      isActive
                        ? "border-l-2 border-primary font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                      focusRing,
                    )}
                  >
                    {s.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

function MobileJumpTo({
  sections,
  activeId,
  onSelect,
}: {
  sections: TocSection[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="not-prose mb-8 lg:hidden">
      <label
        htmlFor="toc-jump"
        className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground"
      >
        Jump to section
      </label>
      <select
        id="toc-jump"
        value={activeId}
        onChange={(e) => onSelect(e.target.value)}
        className={cn(
          "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
          focusRing,
        )}
      >
        {sections.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
    </div>
  );
}
