const WA_URL = "https://wa.me/message/JBAEE53GPYDYF1";

export function WhatsAppFloatingButton() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Boni Security on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-2xl shadow-green-500/40 transition-all duration-300 hover:scale-110 hover:shadow-green-500/60"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />

      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="relative h-8 w-8 fill-white"
        aria-hidden="true"
      >
        <path d="M16 .5C7.439.5.5 7.439.5 16c0 2.703.693 5.247 1.914 7.459L.5 31.5l8.264-1.873A15.449 15.449 0 0 0 16 31.5C24.561 31.5 31.5 24.561 31.5 16S24.561.5 16 .5zm0 28.25a13.198 13.198 0 0 1-6.707-1.826l-.481-.286-4.907 1.113 1.148-4.783-.316-.499A13.198 13.198 0 0 1 2.75 16C2.75 8.682 8.682 2.75 16 2.75S29.25 8.682 29.25 16 23.318 28.75 16 28.75zm7.23-9.873c-.396-.198-2.344-1.157-2.708-1.288-.363-.132-.628-.198-.892.198-.264.396-1.024 1.288-1.255 1.552-.23.264-.462.297-.858.099-.396-.198-1.672-.616-3.185-1.965-1.177-1.05-1.972-2.347-2.203-2.743-.23-.396-.024-.611.174-.808.178-.177.396-.462.594-.693.198-.231.264-.396.396-.66.132-.264.066-.495-.033-.693-.099-.198-.892-2.15-1.222-2.944-.321-.774-.648-.669-.892-.681l-.76-.013c-.264 0-.693.099-1.057.495-.363.396-1.387 1.355-1.387 3.306 0 1.951 1.42 3.836 1.617 4.1.198.264 2.794 4.267 6.768 5.983.946.408 1.684.651 2.259.834.949.302 1.813.259 2.495.157.761-.113 2.344-.958 2.675-1.884.33-.924.33-1.717.231-1.884-.099-.165-.363-.264-.759-.462z" />
      </svg>

      {/* Tooltip */}
      <span className="absolute right-16 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
        Chat with us on WhatsApp
      </span>
    </a>
  );
}

/** Inline WhatsApp CTA button — use inside sections */
export function WhatsAppInlineButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-[#20c05c] hover:shadow-green-500/50 hover:-translate-y-0.5 active:scale-95 ${className}`}
    >
      {/* WhatsApp icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-5 w-5 fill-white"
        aria-hidden="true"
      >
        <path d="M16 .5C7.439.5.5 7.439.5 16c0 2.703.693 5.247 1.914 7.459L.5 31.5l8.264-1.873A15.449 15.449 0 0 0 16 31.5C24.561 31.5 31.5 24.561 31.5 16S24.561.5 16 .5zm0 28.25a13.198 13.198 0 0 1-6.707-1.826l-.481-.286-4.907 1.113 1.148-4.783-.316-.499A13.198 13.198 0 0 1 2.75 16C2.75 8.682 8.682 2.75 16 2.75S29.25 8.682 29.25 16 23.318 28.75 16 28.75zm7.23-9.873c-.396-.198-2.344-1.157-2.708-1.288-.363-.132-.628-.198-.892.198-.264.396-1.024 1.288-1.255 1.552-.23.264-.462.297-.858.099-.396-.198-1.672-.616-3.185-1.965-1.177-1.05-1.972-2.347-2.203-2.743-.23-.396-.024-.611.174-.808.178-.177.396-.462.594-.693.198-.231.264-.396.396-.66.132-.264.066-.495-.033-.693-.099-.198-.892-2.15-1.222-2.944-.321-.774-.648-.669-.892-.681l-.76-.013c-.264 0-.693.099-1.057.495-.363.396-1.387 1.355-1.387 3.306 0 1.951 1.42 3.836 1.617 4.1.198.264 2.794 4.267 6.768 5.983.946.408 1.684.651 2.259.834.949.302 1.813.259 2.495.157.761-.113 2.344-.958 2.675-1.884.33-.924.33-1.717.231-1.884-.099-.165-.363-.264-.759-.462z" />
      </svg>
      Message us on WhatsApp
    </a>
  );
}
