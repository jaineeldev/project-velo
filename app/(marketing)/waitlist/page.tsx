import type { Metadata } from "next";
import { Code2, MailCheck, Sparkles, type LucideIcon } from "lucide-react";
import { StructuredData } from "../_components/structured-data";
import { Waitlist } from "../_components/waitlist";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Velo is in private build. Join the waitlist and I'll send one email when something material ships. Built for Australian freelance developers and dev agencies.",
};

const audienceBullets: string[] = [
  "Solo devs and small agencies (1 to 5 people)",
  "Based in Australia, billing in AUD with GST",
  "Tired of running client work out of spreadsheets",
];

type EmailExpectation = {
  icon: LucideIcon;
  title: string;
  detail: string;
};

const emailExpectations: EmailExpectation[] = [
  {
    icon: MailCheck,
    title: "One email when something material ships",
    detail:
      "Stripe payments, CRM, team accounts. Not weekly updates, not roadmap teases.",
  },
  {
    icon: Sparkles,
    title: "No marketing",
    detail:
      "No \"7 ways to grow your freelance business.\" No calendar invites. No drip sequences.",
  },
  {
    icon: Code2,
    title: "Opt out anytime",
    detail:
      "One link at the bottom of every email removes you cleanly. Your address is deleted on request.",
  },
];

const whatsComing: string[] = [
  "Stripe card payments on invoices",
  "CRM upgrade for clients: notes, tags, lead stages, communications log",
  "Team workspaces and roles (owner, admin, member, viewer)",
  "Custom sending domain so proposals stop landing in spam",
];

export default function WaitlistPage() {
  return (
    <>
      <StructuredData />
      <Hero />
      <AudienceSection />
      <EmailExpectations />
      <WhatsComingNext />
      <FormBlock />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f]">
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24 text-center sm:px-10 sm:pb-28 sm:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Waitlist
        </p>
        <h1 className="mx-auto mt-8 max-w-5xl text-balance text-6xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl md:text-8xl">
          Join the <span className="text-primary">waitlist.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          Velo is still in private build. The sign-up flow opens with the
          public beta. In the meantime, leave your email and I&apos;ll let
          you know when there&apos;s something real to try.
        </p>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Who it&apos;s for
          </p>
          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
            Built for Australian{" "}
            <span className="text-primary">freelance devs.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            Velo is scoped tight on purpose. If you&apos;re outside this group
            today, the early product probably won&apos;t fit you.
          </p>
        </div>
        <ul className="mx-auto mt-12 max-w-2xl divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {audienceBullets.map((bullet) => (
            <li
              key={bullet}
              className="py-5 text-base text-white/80 sm:text-lg"
            >
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function EmailExpectations() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            What you&apos;ll get
          </p>
          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
            One email when it&apos;s{" "}
            <span className="text-primary">worth it.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-4 text-left sm:grid-cols-3 sm:gap-5">
          {emailExpectations.map(({ icon: Icon, title, detail }) => (
            <div
              key={title}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Icon aria-hidden className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="mt-4 text-base font-bold text-white">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsComingNext() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            What you&apos;d hear about first
          </p>
          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
            What&apos;s coming{" "}
            <span className="text-primary">next.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            The shortlist on the build queue. Order can shift, but anything
            here lands first.
          </p>
        </div>
        <ol className="mx-auto mt-14 max-w-2xl">
          {whatsComing.map((item, i) => {
            const isLast = i === whatsComing.length - 1;
            return (
              <li
                key={item}
                className="relative flex items-start gap-5 pb-8 last:pb-0"
              >
                {!isLast && (
                  <span
                    aria-hidden
                    className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-white/[0.12] to-white/[0.04]"
                  />
                )}
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-[#0d0d0f] font-mono text-[11px] font-semibold tabular-nums text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 pt-[5px] text-base font-medium text-white sm:text-lg">
                  {item}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function FormBlock() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto max-w-3xl px-6 py-32 sm:px-10 sm:py-40">
        <Waitlist />
      </div>
    </section>
  );
}
