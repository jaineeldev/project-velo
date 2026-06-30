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
      "CRM, team accounts, public API. Not weekly updates, not roadmap teases.",
  },
  {
    icon: Sparkles,
    title: "No marketing",
    detail:
      'No "7 ways to grow your freelance business." No calendar invites. No drip sequences.',
  },
  {
    icon: Code2,
    title: "Opt out anytime",
    detail:
      "One link at the bottom of every email removes you cleanly. Your address is deleted on request.",
  },
];

const whatsComing: string[] = [
  "CRM upgrade for clients: notes, tags, lead stages, communications log",
  "Team workspaces and roles (owner, admin, member, viewer)",
  "Custom sending domain so proposals stop landing in spam",
  "Recurring invoices and retainers for ongoing engagements",
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
    <section className="bg-[#0A0A0A] px-6 pb-16 pt-32 text-center sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#555]">
          Waitlist
        </p>
        <h1
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
          className="mx-auto max-w-5xl text-balance font-display font-black leading-[0.92] tracking-[-0.045em] text-white"
        >
          Join the <span className="text-[#4F7EF7]">waitlist.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#A0A0A0]">
          Velo is still in private build. The sign-up flow opens with the
          public beta. In the meantime, leave your email and I&apos;ll let you
          know when there&apos;s something real to try.
        </p>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
            Who it&apos;s for
          </p>
          <h2
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            className="mb-6 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
          >
            Built for Australian{" "}
            <span className="text-[#4F7EF7]">freelance devs.</span>
          </h2>
          <p className="mb-12 text-lg leading-relaxed text-[#A0A0A0]">
            Velo is scoped tight on purpose. If you&apos;re outside this group
            today, the early product probably won&apos;t fit you.
          </p>
        </div>
        <ul className="rounded-xl border border-[#2A2A2A] bg-[#111]">
          {audienceBullets.map((bullet, i) => (
            <li
              key={bullet}
              className={`px-6 py-5 text-base font-medium text-white ${
                i > 0 ? "border-t border-[#2A2A2A]" : ""
              }`}
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
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
            What you&apos;ll get
          </p>
          <h2
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            className="mb-12 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
          >
            One email when it&apos;s{" "}
            <span className="text-[#4F7EF7]">worth it.</span>
          </h2>
        </div>
        <div className="grid gap-6 text-left sm:grid-cols-3">
          {emailExpectations.map(({ icon: Icon, title, detail }) => (
            <div
              key={title}
              className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6 transition-all duration-300 hover:border-[#444] hover:bg-[#151515] motion-safe:hover:-translate-y-1"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-[#4F7EF7]">
                <Icon aria-hidden className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="mt-5 text-base font-bold text-white">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#A0A0A0]">
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
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
            What you&apos;d hear about first
          </p>
          <h2
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            className="mb-6 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
          >
            What&apos;s coming{" "}
            <span className="text-[#4F7EF7]">next.</span>
          </h2>
          <p className="mb-12 text-lg leading-relaxed text-[#A0A0A0]">
            The shortlist on the build queue. Order can shift, but anything
            here lands first.
          </p>
        </div>
        <ol>
          {whatsComing.map((item, i) => (
            <li
              key={item}
              className="flex items-start gap-6 border-t border-[#2A2A2A] py-6"
            >
              <span className="font-mono text-sm font-bold tabular-nums text-[#555]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-base font-medium text-white sm:text-lg">
                {item}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FormBlock() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <Waitlist />
      </div>
    </section>
  );
}
