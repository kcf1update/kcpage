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
          src: "/img/news/xpb/RedBull/xpbmaxspain.jpg",
          alt: "Friday race weekend gallery image 1",
          credit: "XPB Images",
        },
        {
          src: "/img/news/xpb/ferrari/xpblewisspain.jpg",
          alt: "Friday race weekend gallery image 2",
          credit: "XPB Images",
        },
         {
          src: "/img/news/xpb/Mclaren/xpblandospain2.jpg",
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
          src: "/img/news/xpb/Races/xpbracespain.jpg",
          alt: "Saturday race weekend gallery image 1",
          credit: "XPB Images",
        },
        {
          src: "/img/news/xpb/Cadillac/xpbbottasspain.jpg",
          alt: "Saturday race weekend gallery image 2",
          credit: "XPB Images",
        },
        {
          src: "/img/news/xpb/Mercedes/xpbgeorgepolespain.jpg",
          alt: "Saturday race weekend gallery image 3",
          credit: "XPB Images",
        },
        {
          src: "/img/news/xpb/ferrari/xpbcharlescrashspain.jpg",
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
          src: "/img/news/xpb/.jpg",
          alt: "Race day gallery image 1",
          credit: "XPB Images",
        },
        {
          src: "/img/news/xpb/.jpg",
          alt: "Race day gallery image 2",
          credit: "XPB Images",
        },
        {
          src: "/img/news/xpb/.jpg",
          alt: "Race day gallery image 3",
          credit: "XPB Images",
        },
      ],
          },
  ],
};