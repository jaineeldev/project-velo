import Link from "next/link";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "For clients", href: "/clients" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "About", href: "/about" },
];

const accountLinks = [{ label: "Join the waitlist", href: "/waitlist" }];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const contactLinks = [
  { label: "jaineelk.dev@gmail.com", href: "mailto:jaineelk.dev@gmail.com" },
  { label: "GitHub", href: "https://github.com/jaineeldev/project-velo" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="font-display text-2xl font-black tracking-tight text-white">
              Velo
            </span>
            <p className="mt-1 font-mono text-xs text-[#555]">
              Run the project, not the paperwork.
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-10 md:max-w-2xl md:grid-cols-4">
            <FooterCol heading="Product" links={productLinks} />
            <FooterCol heading="Account" links={accountLinks} />
            <FooterCol heading="Legal" links={legalLinks} />
            <FooterCol heading="Contact" links={contactLinks} external />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#2A2A2A] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-[#555]">
            © 2026 Velo · Built in Brisbane, Australia
          </p>
          <p className="flex items-center gap-2 font-mono text-xs text-[#555]">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-[#22C55E]"
            />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  heading,
  links,
  external,
}: {
  heading: string;
  links: { label: string; href: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <p className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-[#555]">
        {heading}
      </p>
      <ul className="space-y-3">
        {links.map((link) => {
          const isExternal =
            external ||
            link.href.startsWith("http") ||
            link.href.startsWith("mailto:");
          return (
            <li key={link.href}>
              {isExternal ? (
                <a
                  href={link.href}
                  target={
                    link.href.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="text-sm text-[#A0A0A0] transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="text-sm text-[#A0A0A0] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
