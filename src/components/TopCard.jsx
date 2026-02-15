// src/components/TopCard.jsx
import React from "react";

/**
 * TopCard: consistent header card used on every page.
 * - Same padding, radius, border, background, shadow
 * - Same title/subtitle typography defaults
 * - Page supplies content through <TopCard.Header .../> or custom children
 */
export default function TopCard({ children, className = "" }) {
  return (
    <section
      className={[
        "rounded-3xl border border-black/10 bg-white",
        "shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
        "px-5 py-4 sm:px-6 sm:py-5",
        className,
      ].join(" ")}
      data-topcard
    >
      {children}
    </section>
  );
}

/**
 * Standard header layout: left title/subtitle + right actions.
 * Use this on EVERY page to keep TopCards identical.
 *
 * Optional brand image:
 * - logoSrc="/img/kcs-f1-car.png"
 *
 * Optional clickable title:
 * - titleUrl="https://example.com/story"
 */
TopCard.Header = function TopCardHeader({
  title,
  subtitle,
  right,
  className = "",
  logoSrc,
  logoAlt = "KC F1",
  logoClassName = "h-10 w-auto",
  titleUrl, // ✅ optional: if provided, title becomes clickable
  titleTarget = "_blank", // ✅ default open in new tab for external links
}) {
  const TitleContent = (
    <h1
      className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight break-words"
      data-topcard-title
    >
      {title}
    </h1>
  );

  return (
    <div
      className={[
        // Mobile: stack; Desktop: row with space-between
        "flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
        className,
      ].join(" ")}
      data-topcard-header
    >
      {/* LEFT: logo + text */}
      <div
        className="flex flex-col sm:flex-row items-start gap-3 min-w-0"
        data-topcard-left
      >
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={logoAlt}
            className={logoClassName}
            loading="lazy"
          />
        ) : null}

        {/* min-w-0 is the key to prevent long titles (e.g., “Championship”) from overflowing */}
        <div className="min-w-0">
          {titleUrl ? (
            <a
              href={titleUrl}
              target={titleTarget}
              rel={titleTarget === "_blank" ? "noopener noreferrer" : undefined}
              className="inline-block hover:opacity-90"
              data-topcard-title-link
            >
              {TitleContent}
            </a>
          ) : (
            TitleContent
          )}

          {subtitle ? (
            <p
              className="mt-1 text-sm text-blue-600 break-words"
              data-topcard-subtitle
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {/* RIGHT: actions (Back to home button, etc.) */}
      {right ? (
        <div className="shrink-0" data-topcard-right>
          {right}
        </div>
      ) : null}
    </div>
  );
};
