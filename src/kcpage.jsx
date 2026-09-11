// src/KCpage.jsx
import React from "react";
import { Link } from "react-router-dom";
import SiteHeader from "./components/SiteHeader";
import CountdownBar from "./components/CountdownBar";


// ✅ Stage A content sources (edit file + redeploy)
import { newsSlots } from "./content/newsSlots";



// =======================================================change for the kcpage
// Race weekend homepage promo
// Turn this on/off here for each Grand Prix weekend
// =======================================================
const raceWeekendPromo = {
 enabled: true,
  label: "RACE WEEKEND IS UNDERWAY",
  title: "SPANISH GRAND PRIX",
  body: "The action has begun at Madrid’s brand-new Madring circuit. Visit the Race Centre for the full schedule, latest weather, session results and weekend updates.",
  buttonText: "Explore the Race Centre →",
  buttonLink: "/racecenter",
  backgroundImage: "/img/news/raceposter/spainposter.jpg",
};
// ===================================================
// Full image announcement card
// Shows the entire image without cropping
// ===================================================
const announcementCard = {
  enabled: false,
  image: "/img/news/kcai/vacation2.jpg",
  imageAlt: "KC's Worldwide F1 Update summer vacation announcement",
  link: "",
};
function AnnouncementCard({ image, imageAlt, link = "" }) {
  const imageContent = (
    <img
      src={image}
      alt={imageAlt}
      className="block w-full h-auto"
    />
  );

  return (
    <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-cyan-400/40 bg-black shadow-[0_0_25px_rgba(56,189,248,0.35)]">
      {link ? (
        <a href={link} className="block">
          {imageContent}
        </a>
      ) : (
        imageContent
      )}
    </section>
  );
}
// Simple glassy card helper for the lower sections
function GlassyCard({
  title,
  titleUrl,
  subtitle,
  highlight = "none",
  children,
  className = "",
}) {
  const highlightRing = {
    blue: "shadow-[0_0_25px_rgba(56,189,248,0.7)] border-cyan-400/40",
    red: "shadow-[0_0_25px_rgba(248,113,13,0.7)] border-red-400/40",
    yellow: "shadow-[0_0_25px_rgba(250,204,21,0.8)] border-yellow-400/40",
    none: "shadow-[0_0_20px_rgba(0,0,0,0.7)] border-white/10",
  };

  return (
    <section
      className={
        "relative rounded-3xl border bg-black/45 backdrop-blur-2xl text-slate-100 " +
        "px-5 py-4 sm:px-7 sm:py-6 transition-transform duration-200 hover:-translate-y-0.5 " +
        highlightRing[highlight] +
        " " +
        className
      }
    >
      {(title || subtitle) && (
        <header className="mb-3">
          {title ? (
            titleUrl ? (
              <a
  href={titleUrl}
  target="_blank"
  rel="noreferrer"
  className="block"
  onClick={() => trackArticleClick(title, titleUrl, "card_title")}
>
              <h2
  className={`text-xl sm:text-2xl font-bold tracking-tight transition
    ${highlight === "blue" ? "text-cyan-300" : "text-white hover:text-cyan-300"}
  `}
>
  {renderBilingualText(title, true)}
</h2>
              </a>
            ) : (
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h2>
            )
          ) : null}

          {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-300/80">{subtitle}</p>}
        </header>
      )}
         {children}

      {titleUrl ? (
        <div className="mt-4">
          <Link
            to="/comments"
            className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 hover:text-white"
          >
            💬 Comment
          </Link>
        </div>
      ) : null}
    </section>
  );
}



// Allow only safe http(s) URLs for outbound links
function safeUrl(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
    return "";
  } catch {
    return "";
  }
}
function trackArticleClick(title, url, location = "unknown") {
  if (!window.gtag) return;

  window.gtag("event", "article_click", {
    article_title: title || "",
    article_url: url || "",
    article_location: location,
    transport_type: "beacon",
  });
}
// Only allow local image paths that start with "/"
function safeLocalImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return "";
  if (!imagePath.startsWith("/")) return "";
  return imagePath;
}
function renderBilingualText(text, foreignFirst = true) {
  if (!text || typeof text !== "string" || !text.includes("|")) {
    return text;
  }

  const [firstPart, ...rest] = text.split("|");
  const secondPart = rest.join("|");

  if (foreignFirst) {
    return (
      <>
        <span className="text-sky-300">{firstPart.trim()}</span>
        <span className="text-cyan-300"> | </span>
        <span className="text-white">{secondPart.trim()}</span>
      </>
    );
  }

  return (
    <>
      <span className="text-white">{firstPart.trim()}</span>
      <span className="text-cyan-300"> | </span>
      <span className="text-sky-300">{secondPart.trim()}</span>
    </>
  );
}
function RaceWeekendPromo() {
  if (!raceWeekendPromo.enabled) return null;

  return (
    <section
  className="relative mt-1 overflow-hidden rounded-3xl border border-cyan-400/35 bg-black/70 px-4 py-4 text-center shadow-[0_0_24px_rgba(34,211,238,0.35)] backdrop-blur-2xl sm:px-6 sm:py-5"
  style={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${safeLocalImagePath(raceWeekendPromo.backgroundImage)})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  <div className="relative z-10"></div>
      <div className="mx-auto max-w-3xl">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300 sm:text-xs">
          {raceWeekendPromo.label}
        </div>

        <h1 className="mt-2 text-xl font-extrabold leading-tight text-white sm:text-2xl md:text-3xl">
          {raceWeekendPromo.title}
        </h1>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-yellow-100 font-semibold sm:text-base">
          {raceWeekendPromo.body}
        </p>

        <div className="mt-4 flex justify-center">
          <Link
            to={raceWeekendPromo.buttonLink}
            className="inline-flex items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-400/15 px-5 py-2.5 text-sm font-bold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.35)] transition hover:bg-cyan-400/25 hover:text-white sm:px-6"
          >
            {raceWeekendPromo.buttonText}
          </Link>
        </div>
      </div>
      
    </section>
  );
}
export default function KCpage() {
 
  // ✅ Stage A: Featured content is file-driven (not localStorage)
  // Option A change: show a Top Story above the fold, without duplicating it below.
  // We pull 4 items to keep the two-left + one-under-video structure intact after removing Top Story.
  const featuredNewsAll = Array.isArray(newsSlots) ? newsSlots.slice(0, 4) : [];

  const topStory = featuredNewsAll.length ? featuredNewsAll[0] : null;

  // Left column gets the next two items (after top story)
  const featuredNews = featuredNewsAll.length ? featuredNewsAll.slice(1, 3) : [];

  // Under video gets the last one (4th item)
  const featuredNewsUnderVideo =
    featuredNewsAll.length >= 4
      ? featuredNewsAll[3]
      : featuredNewsAll.length
        ? featuredNewsAll[featuredNewsAll.length - 1]
        : null;
// Articles 5–10 appear farther down the main page
const additionalNews = Array.isArray(newsSlots)
  ? newsSlots.slice(4, 10)
  : [];
 

  return (
    <div className="relative min-h-screen text-white">
      {/* Background image behind the whole page */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/header-car.png')" }}
      />
      <div className="absolute inset-0 -z-10 bg-black/70" />

      {/* Page content wrapper */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 px-4 pt-3 pb-8 sm:pt-4 sm:pb-10">
<SiteHeader />
<CountdownBar />
{announcementCard.enabled && (
  <div className="mb-6">
    <AnnouncementCard
      image={announcementCard.image}
      imageAlt={announcementCard.imageAlt}
      link={announcementCard.link}
    />
  </div>
)}
<RaceWeekendPromo />

{/* ✅ TOP STORY (stays exactly the same, now comes after the update bar) */}
        {topStory
          ? (() => {
              const item = topStory;
              const href = safeUrl(item?.url);
              const imgPath = safeLocalImagePath(item?.imagePath);
              const showImage = !!imgPath;
              const quickShift = (item?.kcsQuickShift || "").trim();

              const photoCredit = (item?.photoCredit || item?.imageSource || "").trim();
              const photoCreditUrl = (item?.photoCreditUrl || "").trim();
              const altText = (item?.imageAlt || item?.title || "News image").trim();

              return (
                <section className="mt-1">
                <div className="mt-2 mb-2 text-center">
  <span className="text-sm font-semibold text-cyan-300">
    Worldwide F1 news Updated Daily and summarized for quick reading
  </span>

  <div className="mt-1 text-xs font-medium text-gray-300 opacity-85">
    🌍 Viewed by F1 fans in 95 countries
  </div>
</div>
                  <GlassyCard
                    highlight="blue"
                    title={item?.title || "Top Story"}
                    titleUrl={href || undefined}
                    subtitle={item?.sourceLabel || "Source"}
                    className=""
                  >
                    <div className="space-y-3">
                      {showImage ? (
                        href ? (
                          <a
  href={href}
  target="_blank"
  rel="noreferrer"
  className="block"
  title="Open article"
  onClick={(e) => {
  e.preventDefault();

  if (window.gtag) {
    window.gtag("event", "article_click", {
      article_title: item?.title || "",
      article_url: href || "",
      article_location: "top_story_image",
      event_callback: () => {
        window.open(href, "_blank");
      },
      event_timeout: 1000,
    });
  } else {
    window.open(href, "_blank");
  }
}}
>
                            <div className="aspect-[16/9] lg:aspect-[18/9] w-full bg-black/40 overflow-hidden rounded-2xl">
  <img
    src={imgPath}
    alt={altText}
   className="h-full w-full object-contain"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
</div>
                          </a>
                        ) : (
                          <img
                            src={imgPath}
                            alt={altText}
                            className="w-full h-44 sm:h-48 md:h-52 lg:h-64 object-contain bg-black/30 rounded-2xl"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )
                      ) : null}
      

                

                      {/* Photo credit */}
                      {photoCredit ? (
                        <div className="text-[11px] text-white/55">
                          Photo:{" "}
                          {photoCreditUrl ? (
                            <a
                              href={safeUrl(photoCreditUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-cyan-200"
                            >
                              {photoCredit}
                            </a>
                          ) : (
                            <span>{photoCredit}</span>
                          )}
                        </div>
                      ) : null}

                      {item?.summary ? (
                        <div className="text-sm text-slate-100/90">
  {renderBilingualText(item.summary, true)}
</div>
                      ) : (
                        <div className="text-sm text-slate-300">
                          Add a summary in <span className="font-mono">newsSlots.js</span>
                        </div>
                      )}

                      {quickShift ? (
                        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                            KC’s Quick Shift
                          </div>
                          <p className="mt-1 text-sm text-white/90 leading-relaxed">
  {renderBilingualText(quickShift, false)}
</p>
                        </div>
                      ) : null}

                      <div className="flex items-center pt-1">
  {item?.dateLabel ? (
    <span className="ml-auto text-xs text-white/45">{item.dateLabel}</span>
  ) : null}
</div>
                    </div>
                  </GlassyCard>
                </section>
              );
            })()
          : null}

         {/* ✅ NAV UNDER TOP CARD */} 
        <div className="w-full">
  
</div>

        {/* ✅ UPDATED DAILY BAR UNDER NAV */}
        <div className="relative rounded-2xl border border-white/10 bg-black/50 backdrop-blur px-4 py-3 text-center">
  <p className="text-xs sm:text-sm text-slate-200 leading-wide flex items-center justify-center gap-2">
  
</p>

 
 
</div>

        {/* CONTENT GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          

        {/* DESKTOP LEFT NEWS COLUMN */}
          <div className="hidden lg:block space-y-5 sm:space-y-6">
          

           {/* Fourth featured news article */}
           {featuredNewsUnderVideo
              ? (() => {
                  const item = featuredNewsUnderVideo;
                  const href = safeUrl(item?.url);
                  const imgPath = safeLocalImagePath(item?.imagePath);
                  const showImage = !!imgPath;
                  const quickShift = (item?.kcsQuickShift || "").trim();

                  const photoCredit = (item?.photoCredit || item?.imageSource || "").trim();
                  const photoCreditUrl = (item?.photoCreditUrl || "").trim();
                  const altText = (item?.imageAlt || item?.title || "News image").trim();

                  return (
                    <GlassyCard
                      key={item?.slotId || "featured-under-video"}
                      highlight="none"
                      title={item?.title || "News"}
                      titleUrl={href || undefined}
                      subtitle={item?.sourceLabel || "Source"}
                    >
                      <div className="space-y-3">
                        {showImage ? (
                          href ? (
                            <a
  href={href}
  target="_blank"
  rel="noreferrer"
  className="block"
  title="Open article"
  onClick={() => trackArticleClick(item?.title, href, "under_video_image_mobile")}
>
                              <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden rounded-2xl">
  <img
    src={imgPath}
    alt={altText}
    className="h-full w-full object-contain"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
</div>
                            </a>
                          ) : (
                            <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden rounded-2xl">
  <img
    src={imgPath}
    alt={altText}
    className="h-full w-full object-contain"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
</div>
                          )
                        ) : null}

                        {/* Photo credit */}
                        {photoCredit ? (
                          <div className="text-[11px] text-white/55">
                            Photo:{" "}
                            {photoCreditUrl ? (
                              <a
                                href={safeUrl(photoCreditUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline hover:text-cyan-200"
                              >
                                {photoCredit}
                              </a>
                            ) : (
                              <span>{photoCredit}</span>
                            )}
                          </div>
                        ) : null}

                        {item?.summary ? (
                          <div className="text-sm text-slate-100/90">
  {renderBilingualText(item.summary, true)}
</div>
                        ) : (
                          <div className="text-sm text-slate-300">
                            Add a summary in <span className="font-mono">newsSlots.js</span>
                          </div>
                        )}

                        {quickShift ? (
                          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                              KC’s Quick Shift
                            </div>
                            <p className="mt-1 text-sm text-white/90 leading-relaxed">
  {renderBilingualText(quickShift, false)}
</p>
                          </div>
                        ) : null}

                        <div className="flex items-center gap-3 pt-1">
                          
                             

                          

                          {item?.dateLabel ? (
                            <span className="ml-auto text-xs text-white/45">{item.dateLabel}</span>
                          ) : null}
                        </div>
                      </div>
                    </GlassyCard>
                  );
                })()
              : null}

            
            
          </div>

          {/* ✅ NEWS COLUMN (desktop right, mobile after YouTube) */}
          <div className="space-y-5 sm:space-y-6">
            {featuredNews.map((item, idx) => {
              const href = safeUrl(item?.url);
              const imgPath = safeLocalImagePath(item?.imagePath);
              const showImage = !!imgPath;

              // ✅ NEW: KC’s Quick Shift (blue) — only shows if text exists
              const quickShift = (item?.kcsQuickShift || "").trim();

              const photoCredit = (item?.photoCredit || item?.imageSource || "").trim();
              const photoCreditUrl = (item?.photoCreditUrl || "").trim();
              const altText = (item?.imageAlt || item?.title || "News image").trim();

              return (
                <GlassyCard

                  key={item?.slotId || `featured-${idx}`}
                  highlight="none"
                  title={item?.title || `News ${idx + 1}`}
                  titleUrl={href || undefined}
                  subtitle={item?.sourceLabel || "Source"}
                >
                  <div className="space-y-3">
                    {showImage ? (
                      href ? (
  <a
  href={href}
  target="_blank"
  rel="noreferrer"
  className="block"
  title="Open article"
  onClick={() => trackArticleClick(item?.title, href, "featured_news_image")}
>
  <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden rounded-2xl">
    <img
      src={imgPath}
      alt={altText}
      className="h-full w-full object-contain"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  </div>
</a>
                      ) : (
                        <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden rounded-2xl">
  <img
    src={imgPath}
    alt={altText}
    className="h-full w-full object-contain"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
</div>
                      )
                    ) : null}

                    {/* Photo credit */}
                    {photoCredit ? (
                      <div className="text-[11px] text-white/55">
                        Photo:{" "}
                        {photoCreditUrl ? (
                          <a
                            href={safeUrl(photoCreditUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-cyan-200"
                          >
                            {photoCredit}
                          </a>
                        ) : (
                          <span>{photoCredit}</span>
                        )}
                      </div>
                    ) : null}

                    {item?.summary ? (
                      <div className="text-sm text-slate-100/90">
  {renderBilingualText(item.summary, true)}
</div>
                    ) : (
                      <div className="text-sm text-slate-300">
                        Add a summary in <span className="font-mono">newsSlots.js</span>
                      </div>
                    )}

                    {/* ✅ NEW: KC’s Quick Shift block (blue theme, white text) */}
                    {quickShift ? (
                      <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                          KC’s Quick Shift
                        </div>
                        <p className="mt-1 text-sm text-white/90 leading-relaxed">
  {renderBilingualText(quickShift, false)}
</p>
                      </div>
                    ) : null}

                    {/* ACTIONS ROW (Read + Comment + optional date) */}
                    <div className="flex items-center pt-1">
  {item?.dateLabel ? (
    <span className="ml-auto text-xs text-white/45">{item.dateLabel}</span>
  ) : null}
</div>
                  </div>
                </GlassyCard>
              );
            })}

            {/* ✅ MOBILE: put the “under video” featured news AFTER the two news cards */}
            <div className="lg:hidden">
              {featuredNewsUnderVideo
                ? (() => {
                    const item = featuredNewsUnderVideo;
                    const href = safeUrl(item?.url);
                    const imgPath = safeLocalImagePath(item?.imagePath);
                    const showImage = !!imgPath;
                    const quickShift = (item?.kcsQuickShift || "").trim();

                    const photoCredit = (item?.photoCredit || item?.imageSource || "").trim();
                    const photoCreditUrl = (item?.photoCreditUrl || "").trim();
                    const altText = (item?.imageAlt || item?.title || "News image").trim();

                    return (
                      <GlassyCard
                        key={item?.slotId || "featured-under-video-mobile"}
                        highlight="none"
                        title={item?.title || "News"}
                        titleUrl={href || undefined}
                        subtitle={item?.sourceLabel || "Source"}
                      >
                        <div className="space-y-3">
                          {showImage ? (
                            href ? (
  <a
  href={href}
  target="_blank"
  rel="noreferrer"
  className="block"
  title="Open article"
  onClick={() => trackArticleClick(item?.title, href, "under_video_image_desktop")}
>
  <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden rounded-2xl">
    <img
      src={imgPath}
      alt={altText}
      className="h-full w-full object-contain"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  </div>
</a>
                            ) : (
                             <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden rounded-2xl">
  <img
    src={imgPath}
    alt={altText}
    className="h-full w-full object-contain"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
</div>
                            )
                          ) : null}

                          {/* Photo credit */}
                          {photoCredit ? (
                            <div className="text-[11px] text-white/55">
                              Photo:{" "}
                              {photoCreditUrl ? (
                                <a
                                  href={safeUrl(photoCreditUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline hover:text-cyan-200"
                                >
                                  {photoCredit}
                                </a>
                              ) : (
                                <span>{photoCredit}</span>
                              )}
                            </div>
                          ) : null}

                          {item?.summary ? (
                            <div className="text-sm text-slate-100/90">
  {renderBilingualText(item.summary, true)}
</div>
                          ) : (
                            <div className="text-sm text-slate-300">
                              Add a summary in <span className="font-mono">newsSlots.js</span>
                            </div>
                          )}

                          {quickShift ? (
                            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                                KC’s Quick Shift
                              </div>
                              <p className="mt-1 text-sm text-white/90 leading-relaxed">
  {renderBilingualText(quickShift, false)}
</p>
                            </div>
                          ) : null}

                          <div className="flex items-center gap-3 pt-1">
                            {href ? (
                              <a
  href={href}
  target="_blank"
  rel="noreferrer"
  className="inline-flex text-sm text-cyan-200 hover:text-cyan-100"
  onClick={() => trackArticleClick(item?.title, href, "read_full_article")}
>
  Read full article →
</a>
                            ) : null}

                            

                            {item?.dateLabel ? (
                              <span className="ml-auto text-xs text-white/45">{item.dateLabel}</span>
                            ) : null}
                          </div>
                        </div>
                      </GlassyCard>
                    );
                  })()
                : null}

             
            </div>
          </div>
        </section>
{/* ADDITIONAL NEWS — SLOTS 5 TO 10 */}
{additionalNews.length > 0 ? (
  <section className="mt-2">
    <div className="mb-4 text-center">
      <h2 className="text-xl font-bold text-cyan-300 sm:text-2xl">
        More Formula 1 News
      </h2>

      <p className="mt-1 text-sm text-slate-300">
        More of today’s F1 stories, summarized for a quick read
      </p>
    </div>

    <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
      {additionalNews.map((item, idx) => {
        const href = safeUrl(item?.url);
        const imgPath = safeLocalImagePath(item?.imagePath);
        const quickShift = (item?.kcsQuickShift || "").trim();
        const photoCredit = (
          item?.photoCredit ||
          item?.imageSource ||
          ""
        ).trim();
        const photoCreditUrl = (item?.photoCreditUrl || "").trim();
        const altText = (
          item?.imageAlt ||
          item?.title ||
          "F1 news image"
        ).trim();

        return (
          <GlassyCard
            key={item?.slotId || `additional-news-${idx}`}
            highlight="none"
            title={item?.title || `News ${idx + 5}`}
            titleUrl={href || undefined}
            subtitle={item?.sourceLabel || "Source"}
          >
            <div className="space-y-3">
              {imgPath ? (
                href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                    title="Open article"
                    onClick={() =>
                      trackArticleClick(
                        item?.title,
                        href,
                        "additional_news_image"
                      )
                    }
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black/40">
                      <img
                        src={imgPath}
                        alt={altText}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </a>
                ) : (
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black/40">
                    <img
                      src={imgPath}
                      alt={altText}
                      className="h-full w-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )
              ) : null}

              {photoCredit ? (
                <div className="text-[11px] text-white/55">
                  Photo:{" "}
                  {photoCreditUrl ? (
                    <a
                      href={safeUrl(photoCreditUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-cyan-200"
                    >
                      {photoCredit}
                    </a>
                  ) : (
                    <span>{photoCredit}</span>
                  )}
                </div>
              ) : null}

              {item?.summary ? (
                <div className="text-sm leading-relaxed text-slate-100/90">
                  {renderBilingualText(item.summary, true)}
                </div>
              ) : null}

              {quickShift ? (
                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                    KC’s Quick Shift
                  </div>

                  <p className="mt-1 text-sm leading-relaxed text-white/90">
                    {renderBilingualText(quickShift, false)}
                  </p>
                </div>
              ) : null}

              {item?.dateLabel ? (
                <div className="flex items-center pt-1">
                  <span className="ml-auto text-xs text-white/45">
                    {item.dateLabel}
                  </span>
                </div>
              ) : null}
            </div>
          </GlassyCard>
        );
      })}
    </div>
  </section>
) : null}

{/* BOTTOM AD / PARTNER SLOT */}
{/* BOTTOM AD / PARTNER SLOT */}
<GlassyCard
  highlight="yellow"
  title="Partner With KC’s F1 Update"
  subtitle="Curated F1 headlines + KC QuickShift takes + YouTube content"
  className="mt-6 sm:mt-8"
>
  <div className="text-center">
    <p className="text-sm sm:text-base text-yellow-100/90">
      Reach dedicated Formula 1 fans across the website and KC’s video content.
    </p>
    <p className="mt-3 text-sm sm:text-base font-semibold text-white">
      Contact: kcf1update@gmail.com
    </p>
  </div>
</GlassyCard>

</div>
</div>
  );
}