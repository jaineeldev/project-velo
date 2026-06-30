import { MapPin, Receipt, Shield, Zap, type LucideIcon } from "lucide-react";

const items: { icon: LucideIcon; label: string }[] = [
  { icon: Shield, label: "Secure client accounts" },
  { icon: Zap, label: "Automated workflow" },
  { icon: Receipt, label: "GST ready invoicing" },
  { icon: MapPin, label: "Hosted in Australia" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-[#2A2A2A] bg-[#111] py-5">
      <div className="mx-auto max-w-7xl px-6">
        <ul className="grid grid-cols-2 md:grid-cols-4">
          {items.map(({ icon: Icon, label }, i) => (
            <li
              key={label}
              className={`flex items-center justify-center gap-2.5 px-4 py-2 ${
                i > 0 ? "md:border-l md:border-[#2A2A2A]" : ""
              } ${i % 2 === 1 ? "border-l border-[#2A2A2A]" : ""}`}
            >
              <Icon
                aria-hidden
                className="h-4 w-4 shrink-0 text-[#4F7EF7]"
                strokeWidth={2}
              />
              <span className="text-sm font-medium text-[#A0A0A0]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
