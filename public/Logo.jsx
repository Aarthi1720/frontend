// Simple inline SVG logo (uses your colors). Swap text if you want a name.
export default function Logo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0%" stopColor="#1DBF73"/>
            <stop offset="100%" stopColor="#0077FF"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="48" height="48" rx="12" fill="url(#g)"/>
        <path d="M12 29c4-7 8-10 12-10s8 3 12 10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <circle cx="24" cy="19" r="3" fill="#fff"/>
      </svg>
      <span className="text-[18px] font-semibold tracking-tight text-[#222222]">
        CasaStay
      </span>
    </div>
  );
}
