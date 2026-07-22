// src/PhotoGalleryPage.jsx

import React, { useEffect } from "react";

import AdBar from "./AdBar.jsx";
import SiteHeader from "./components/SiteHeader";
import { photoGalleryContent } from "./content/photoGalleryContent";

function safeLocalImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return "";
  if (!imagePath.startsWith("/")) return "";
  return imagePath;
}

export default function PhotoGalleryPage() {
  useEffect(() => {
    document.title =
      "Season Photo Gallery | KC's Worldwide F1 Update";
  }, []);

  if (!photoGalleryContent.enabled) {
    return null;
  }

  const races = Array.isArray(photoGalleryContent.races)
    ? photoGalleryContent.races
    : [];

  const handleProtectedImage = (event) => {
    event.preventDefault();
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/img/header-car.png')",
        }}
      />

      <div className="absolute inset-0 -z-10 bg-black/80" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-8 pt-2">
        <SiteHeader />

        <header className="rounded-3xl border border-sky-400/25 bg-black/45 px-4 py-5 text-center shadow-[0_0_22px_rgba(14,165,233,0.16)] backdrop-blur sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            KC’s Worldwide F1 Update
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
            {photoGalleryContent.title || "Season Photo Gallery"}
          </h1>

          <p className="mx-auto mt-3 max-w-4xl rounded-2xl border border-amber-300/20 bg-black/45 px-4 py-3 text-xs leading-relaxed text-amber-100/90 sm:text-sm">
            {photoGalleryContent.notice}
          </p>
        </header>

        <main className="space-y-6">
          {races.map((race) => {
            const images = Array.isArray(race.images)
              ? race.images.filter((image) =>
                  safeLocalImagePath(image?.src)
                )
              : [];

            return (
              <section
                key={race.id}
                className="rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur sm:p-5"
              >
                <div className="mb-4 border-b border-white/10 pb-3">
                  <h2 className="text-xl font-bold text-sky-200 sm:text-2xl">
                    {race.raceName}
                  </h2>

                  {race.dates ? (
                    <p className="mt-1 text-sm text-slate-300">
                      {race.dates}
                    </p>
                  ) : null}

                  <p className="mt-2 text-xs text-slate-300/80">
                    {images.length}{" "}
                    {images.length === 1 ? "photo" : "photos"}
                  </p>
                </div>

                {images.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {images.map((image, index) => (
                      <figure
                        key={`${race.id}-${index}`}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-black/55"
                        onContextMenu={handleProtectedImage}
                      >
                        <img
                          src={safeLocalImagePath(image.src)}
                          alt={
                            image.alt ||
                            `${race.raceName} gallery image ${index + 1}`
                          }
                          loading="lazy"
                          draggable="false"
                          onContextMenu={handleProtectedImage}
                          onDragStart={handleProtectedImage}
                          className="h-auto w-full select-none object-cover"
                          style={{
                            WebkitUserDrag: "none",
                            userSelect: "none",
                          }}
                        />

                        <figcaption className="border-t border-white/10 px-3 py-2 text-[10px] text-slate-300/80">
                          Image credit:{" "}
                          {image.credit || "XPB Images"} — viewing only
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-6 text-center text-sm text-slate-300">
                    Photos will be added to this race gallery.
                  </div>
                )}
              </section>
            );
          })}
        </main>

        <AdBar />
      </div>
    </div>
  );
}