import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router";
import { scrollToHash } from "../lib/smooth";
import { RiseText } from "./motion";

/* ── Logo: selfsqr işaretinin yumuşak renkli çizimi ───────────────────── */
export function Logo({ className = "", mono = false }: { className?: string; mono?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" className="size-8 flex-none" aria-hidden="true">
        <rect x="2" y="2" width="60" height="60" rx="17" fill={mono ? "currentColor" : "#2a3047"} />
        <rect x="5.5" y="5.5" width="53" height="53" rx="14" fill="none" stroke="#9fb0f0" strokeWidth="2.5" opacity={mono ? 0.6 : 1} />
        <g fill="#f6f2ec">
          <rect x="14" y="14" width="10" height="10" rx="3" />
          <rect x="40" y="14" width="10" height="10" rx="3" />
          <rect x="14" y="40" width="10" height="10" rx="3" />
          <rect x="40" y="40" width="10" height="10" rx="3" />
        </g>
        <circle cx="32" cy="32" r="8.6" fill="none" stroke="#9fb0f0" strokeWidth="3.4" />
        <circle cx="32" cy="32" r="3.3" fill="#f6f2ec" />
      </svg>
      <span className="font-display text-[1.05rem] font-semibold tracking-[-0.02em]">
        SELF'S <span className="font-bold text-accent">QR</span>
      </span>
    </span>
  );
}

/* ── İkonlar (çizgi, 1.6 kalınlık) ─────────────────────────────────────── */
const paths: Record<string, ReactNode> = {
  wa: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2.2a9.7 9.7 0 0 0-8.3 14.8L2.4 21.7l4.8-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.2-.2Z"
    />
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  arrowUR: <path d="M7 17 17 7M9 7h8v8" />,
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1.5" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1.5" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1.5" />
      <path d="M14.5 14.5h2v2h-2zM18.5 18.5h2v2h-2zM14.5 18.5h2M18.5 14.5h2" />
    </>
  ),
  menu: <path d="M6 4.5h12a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5ZM8 9h8M8 12.5h8M8 16h5" />,
  bag: <path d="M5.5 8h13l-1 12h-11l-1-12ZM9 8V6.5a3 3 0 0 1 6 0V8" />,
  bell: <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15L6 16.5ZM10 20.5h4" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5S9.5 6.1 12 3.5Z" />
    </>
  ),
  chart: <path d="M4.5 19.5h15M7 16v-4M11 16V8M15 16v-6M19 16V5" />,
  tag: <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0l-8.4-8.2ZM8 8h.01" />,
  layers: <path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8 12 3.5ZM3.5 12l8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" />,
  upload: <path d="M12 15.5V4m0 0L7.5 8.5M12 4l4.5 4.5M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />,
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.6-1-2.6 0-.9.7-1.7 1.7-1.7h2.2a3.8 3.8 0 0 0 3.8-3.8c0-4-3.8-7.2-8.5-7.2Z" />
      <circle cx="7.8" cy="11" r="1" />
      <circle cx="10.5" cy="7.5" r="1" />
      <circle cx="15" cy="7.8" r="1" />
    </>
  ),
  leaf: <path d="M5 19c0-8 5-13.5 14.5-14.5C19 14 13.5 19 5 19Zm0 0 7-7" />,
  wifi: <path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.7a7.6 7.6 0 0 1 11 0M9.5 15.8a3.4 3.4 0 0 1 5 0M12 19h.01" />,
  star: <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6L12 4Z" />,
  plug: <path d="M9 3.5V8m6-4.5V8M6.5 8h11v3a5.5 5.5 0 0 1-11 0V8ZM12 16.5v4" />,
  mail: <path d="M4.5 6h15v12h-15zM4.5 6.5l7.5 6 7.5-6" />,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.2a10 10 0 0 0 6.3 6.3l1.2-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />,
  pin: <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  search: <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5l4 4" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calendar: <path d="M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4" />,
  insta: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M16.8 7.2h.01" />
    </>
  ),
  sparkle: <path d="M12 3.5c.6 4.3 2.4 6.6 7 7.5-4.6.9-6.4 3.2-7 7.5-.6-4.3-2.4-6.6-7-7.5 4.6-.9 6.4-3.2 7-7.5Z" />,
};

export function Icon({ name, className = "size-5" }: { name: keyof typeof paths | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/* ── Akıllı bağlantı: dış adres, sayfa içi çapa ya da yönlendirme ──────── */
export function SmartLink({ href, children, className = "", onClick, ...rest }: { href: string; children: ReactNode; className?: string; onClick?: () => void; "aria-label"?: string; style?: CSSProperties }) {
  if (/^(https?:|mailto:|tel:)/.test(href)) {
    const ext = href.startsWith("http");
    return (
      <a href={href} className={className} onClick={onClick} {...(ext ? { target: "_blank", rel: "noopener" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        className={className}
        onClick={(e) => {
          if (scrollToHash(href)) e.preventDefault();
          onClick?.();
        }}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}

export function Btn({
  href,
  children,
  variant = "primary",
  size,
  icon,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "soft" | "wa";
  size?: "sm";
  icon?: "wa" | "arrow" | "arrowUR";
  className?: string;
}) {
  const v = variant === "soft" ? "btn-soft" : variant === "wa" ? "btn-soft" : "";
  return (
    <SmartLink href={href} className={`btn ${v} ${size === "sm" ? "btn-sm" : ""} ${className}`}>
      {icon === "wa" && <Icon name="wa" className="size-[1.1rem]" />}
      <span>{children}</span>
      {icon && icon !== "wa" && <Icon name={icon} className="arrow size-[1.05rem]" />}
    </SmartLink>
  );
}

/* ── Bölüm başlığı: etiket + maskeli başlık + açıklama ─────────────────── */
export function SectionHead({
  eyebrow,
  title,
  lead,
  className = "",
  align = "left",
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  const c = align === "center" ? "mx-auto text-center items-center" : "";
  return (
    <div className={`flex flex-col ${c} ${className}`}>
      {eyebrow && <p className="label eyebrow">{eyebrow}</p>}
      <RiseText as={as} text={title} className={`t-2 mt-5 max-w-[18ch] ${align === "center" ? "mx-auto" : ""}`} />
      {lead && <p className={`t-lead mt-6 max-w-xl text-mute ${align === "center" ? "mx-auto" : ""}`}>{lead}</p>}
    </div>
  );
}
