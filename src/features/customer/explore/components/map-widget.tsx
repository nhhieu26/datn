import { SmallPinIcon } from "./icons";

export function MapWidget() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-3 relative group">
      <div className="relative h-44 rounded-xl overflow-hidden bg-emerald-50">
        <svg
          aria-hidden="true"
          className="w-full h-full object-cover"
          fill="none"
          viewBox="0 0 300 180"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect fill="#BAE6FD" height="180" opacity="0.6" width="300" />
          <path
            d="M20 90C40 60 70 45 130 50C190 55 240 70 260 95C270 110 245 140 210 145C170 150 140 140 110 150C75 160 30 140 20 90Z"
            fill="#D1FAE5"
            stroke="#A7F3D0"
            strokeWidth="2"
          />
          <path
            d="M250 120C265 110 280 125 270 135C260 140 245 130 250 120Z"
            fill="#D1FAE5"
            stroke="#A7F3D0"
          />
          <path
            d="M80 85L130 95L170 125L210 115"
            stroke="#FDE68A"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path d="M130 95L120 135" stroke="#FDE68A" strokeWidth="2" />
          <text
            fill="#475569"
            fontSize="14"
            fontWeight="700"
            letterSpacing="1"
            x="135"
            y="75"
          >
            Bali
          </text>
          <circle cx="150" cy="95" fill="#FF5A36" r="4" />
          <text fill="#1E293B" fontSize="10" fontWeight="600" x="157" y="99">
            Ubud
          </text>
          <circle cx="120" cy="125" fill="#FF5A36" r="4" />
          <text fill="#1E293B" fontSize="10" fontWeight="600" x="127" y="129">
            Canggu
          </text>
          <circle cx="150" cy="135" fill="#64748B" r="4" />
          <text fill="#475569" fontSize="9" fontWeight="500" x="157" y="139">
            Denpasar
          </text>
        </svg>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-full shadow-md hover:bg-slate-50 transition border border-slate-200/80">
            <SmallPinIcon className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>Xem trên bản đồ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
