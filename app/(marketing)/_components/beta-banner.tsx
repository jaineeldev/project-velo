export function BetaBanner() {
  return (
    <div className="border-b border-[#2A2A2A] bg-[#111]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2 text-xs text-[#A0A0A0]">
        <span
          aria-hidden
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4F7EF7]"
        />
        <span className="text-center">
          <span className="font-semibold text-white">
            Velo is in early beta
          </span>
          <span>. Expect rough edges. </span>
          <a
            href="mailto:jaineelk.dev@gmail.com"
            className="font-medium text-[#4F7EF7] underline-offset-2 hover:underline"
          >
            Tell me what breaks
          </a>
        </span>
      </div>
    </div>
  );
}
