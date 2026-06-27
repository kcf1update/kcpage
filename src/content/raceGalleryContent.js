// src/content/raceGalleryContent.js

// KC Race Centre Gallery
// Images are displayed for viewing only.
// Do not use download links.
// Keep images inside: public/img/race-gallery/

export const raceGalleryContent = {
  enabled: true,

  title: "Race Weekend Gallery",

  notice:
    "XPB Images are displayed for editorial viewing only. Images may not be copied, downloaded, saved, reproduced, redistributed, or reused without permission from XPB Images.",

  galleries: [
    {
      id: "friday",
      label: "Thursday/Friday Gallery",
      description: "Practice day photos from the race weekend.",
      images: [
        {
          src: "/img/news/xpb/Mercedes/xpb-kimiaustria.jpg",
          alt: "Friday race weekend gallery image 1",
          credit: "XPB Images",
        },
        {
          src: "/img/news/xpb/Audi/xpb-gabbyaustria.jpg",
          alt: "Friday race weekend gallery image 2",
          credit: "XPB Images",
        },
         {
          src: "/img/news/xpb/Mercedes/xpb-kimiaustria2.jpg",
          alt: "Friday race weekend gallery image 3",
          credit: "XPB Images",
        },
      ],
    },

    {
      id: "saturday",
      label: "Saturday Gallery",
      description: "Qualifying day photos from the race weekend.",
      images: [
        {
          src: "/img/news/xpb/Races/xpb-austria2.jpg",
          alt: "Saturday race weekend gallery image 1",
          credit: "XPB Images",
        },
        {
          src: "img/news/xpb/Audi/xpb-audiaustria.jpg",
          alt: "Saturday race weekend gallery image 2",
          credit: "XPB Images",
        },
        {
          src: "/img/news/xpb/Mercedes/xpb-georgeaustria.jpg",
          alt: "Saturday race weekend gallery image 3",
          credit: "XPB Images",
        },
        {
          src: "",
          alt: "Saturday race weekend gallery image 4",
          credit: "XPB Images",
        },
      ],
    },

    {
      id: "sunday",
      label: "Race Day Gallery",
      description: "Race day photos from the Grand Prix.",
      images: [
        {
          src: "",
          alt: "Race day gallery image 1",
          credit: "XPB Images",
        },
        {
          src: "",
          alt: "Race day gallery image 2",
          credit: "XPB Images",
        },
        {
          src: "",
          alt: "Race day gallery image 3",
          credit: "XPB Images",
        },
        {
          src: "",
          alt: "Race day gallery image 4",
          credit: "XPB Images",
        },
         {
          src: "",
          alt: "Race day gallery image 5",
          credit: "XPB Images",
        },
        {
          src: "",
          alt: "Race day gallery image 6",
          credit: "XPB Images",
        },
      ],
          },
  ],
};