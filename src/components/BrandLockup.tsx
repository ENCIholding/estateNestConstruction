import { Link } from "react-router-dom";

type BrandLockupProps = {
  to?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
  wordmarkClassName?: string;
  subtitleClassName?: string;
  logoAlt?: string;
};

function BrandMark({ compact = false, logoAlt }: { compact?: boolean; logoAlt: string }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.22)] ring-1 ring-white/30 ${
        compact ? "h-12 w-12 p-1.5" : "h-14 w-14 p-1.5"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-hero opacity-15" />
      <div className="relative flex h-full w-full items-center justify-center rounded-[1rem] bg-white">
        <img
          src="/brand/enci-buildos-logo.jpeg"
          alt={logoAlt}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}

function BrandCopy({
  subtitle,
  compact = false,
  wordmarkClassName = "",
  subtitleClassName = "",
}: Pick<
  BrandLockupProps,
  "subtitle" | "compact" | "wordmarkClassName" | "subtitleClassName"
>) {
  return (
    <div className="min-w-0">
      <div
        className={`font-black uppercase leading-[0.95] tracking-[0.1em] ${
          compact ? "text-[0.86rem]" : "text-[1.28rem]"
        } ${wordmarkClassName}`}
      >
        <span className="block whitespace-nowrap gradient-text">Estate Nest Capital</span>
      </div>
      {subtitle ? (
        <p
          className={`mt-1 text-xs font-medium tracking-[0.18em] uppercase ${
            compact ? "text-[10px]" : "text-[11px]"
          } ${subtitleClassName}`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default function BrandLockup({
  to,
  subtitle,
  compact = false,
  className = "",
  wordmarkClassName = "",
  subtitleClassName = "",
  logoAlt,
}: BrandLockupProps) {
  const resolvedLogoAlt =
    logoAlt ?? (to === "/" ? "Estate Nest Capital Inc. home" : "Estate Nest Capital Inc. logo");

  const content = (
    <div
      className={`flex items-center gap-3 ${className}`.trim()}
      aria-label="Estate Nest Capital"
    >
      <BrandMark compact={compact} logoAlt={resolvedLogoAlt} />
      <BrandCopy
        subtitle={subtitle}
        compact={compact}
        wordmarkClassName={wordmarkClassName}
        subtitleClassName={subtitleClassName}
      />
    </div>
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} className="block">
      {content}
    </Link>
  );
}
