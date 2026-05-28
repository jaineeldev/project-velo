import { Check } from "lucide-react";

const before = [
  "Email threads for proposal feedback",
  "Google Docs for scope of work",
  "Spreadsheets for project tracking",
  "Manual invoice creation",
  "“Any updates?” client messages",
];

const after = [
  "Proposal builder with GST and line items",
  "Client approval with legal timestamp",
  "Milestone and time tracking",
  "Automatic deposit and final invoices",
  "Client portal with live project status",
];

export function ReplaceWithVelo() {
  return (
    <section className="relative bg-[#0d0d0f]">
      <div className="mx-auto max-w-7xl px-6 py-32 sm:px-10 sm:py-40">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Replace this with Velo
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-extrabold leading-[1] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl">
            One tool instead of{" "}
            <span className="text-primary">five.</span>
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-12 sm:mt-20 sm:grid-cols-2 sm:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">
              Before Velo
            </p>
            <ul className="mt-6 space-y-3">
              {before.map((item) => (
                <li
                  key={item}
                  className="flex items-baseline gap-3 text-sm text-white/35 line-through decoration-white/20 decoration-1 sm:text-base"
                >
                  <span aria-hidden className="text-white/25">
                    ·
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              With Velo
            </p>
            <ul className="mt-6 space-y-3">
              {after.map((item) => (
                <li
                  key={item}
                  className="flex items-baseline gap-3 text-sm text-white sm:text-base"
                >
                  <Check
                    aria-hidden
                    className="h-4 w-4 shrink-0 translate-y-0.5 text-primary"
                    strokeWidth={2.5}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
