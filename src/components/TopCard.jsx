import React from "react";

/**
 * TopCard: consistent header card used on every page.
 */
export default function TopCard({ children, className = "" }) {
  return (
    <section
      className={[
        "rounded-3xl border border-black/10 bg-white",
        "shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
        "px-5 py-3 sm:px-6 sm:py-4",
        className,
      ].join(" ")}
      data-topcard
    >
      {children}
    </section>
  );
}

TopCard.Header = function TopCardHeader({
  title,
  subtitle,
  right,
  className = "",
  logoSrc,
  logoAlt = "KC F1",

  /**
   * Bigger desktop scaling for the car
   * mobile unchanged
   */
  logoClassName =
    "h-14 sm:h-16 md:h-18 lg:h-[110px] xl:h-[125px] w-auto",

  titleClassName =
    "text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.05] break-words",

  subtitleClassName =
    "mt-1 text-sm sm:text-base text-blue-600 break-words",

  titleUrl,
  titleTarget = "_blank",
}) {
  const TitleContent = (
    <h1 className={titleClassName} data-topcard-title>
      {title}
    </h1>
  );

  return (
    <div
      className={[
        "w-full max-w-6xl mx-auto",
        "flex flex-col gap-3",
        "md:flex-row md:items-center md:gap-12 lg:gap-16 md:justify-between",
        className,
      ].join(" ")}
      data-topcard-header
    >
      {/* LEFT: car */}
      <div
        className={[
          "shrink-0",
          "md:pl-2",
          "flex justify-center md:justify-start",

          /**
           * Wider lane so the car can stretch on laptop
           */
          "md:w-[360px] lg:w-[480px] xl:w-[560px]",
        ].join(" ")}
        data-topcard-left
      >
        {logoSrc && (
          <img
            src={logoSrc}
            alt={logoAlt}
            className={logoClassName}
            loading="lazy"
          />
        )}
      </div>

      {/* TITLE BLOCK */}
      <div
        className={[
          "min-w-0 flex-1",
          "text-center md:text-left",
        ].join(" ")}
        data-topcard-center
      >
        {titleUrl ? (
          <a
            href={titleUrl}
            target={titleTarget}
            rel={titleTarget === "_blank" ? "noopener noreferrer" : undefined}
            className="inline-block hover:opacity-90"
          >
            {TitleContent}
          </a>
        ) : (
          TitleContent
        )}

        {subtitle && (
          <p className={subtitleClassName} data-topcard-subtitle>
            {subtitle}
          </p>
        )}
      </div>

      {/* OPTIONAL RIGHT CONTENT */}
      {right && (
        <div
          className="shrink-0 flex justify-center md:justify-end"
          data-topcard-right
        >
          {right}
        </div>
      )}
    </div>
  );
};