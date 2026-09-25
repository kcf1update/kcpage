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
          src: "/img/news/xpb/Mercedes/George/xpb-georgebaku1.jpg",
          alt: "Friday race weekend gallery image 1",
          credit: "XPB Images",
        },
        {
          src: "/img/news/xpb/RedBull/max/xpb-maxbaku.jpg",
          alt: "Friday race weekend gallery image 2",
          credit: "XPB Images",
        },
         {
          src: "/img/news/xpb/Mercedes/George/xpb-georgebaku3.jpg",
          alt: "Friday race weekend gallery image 3",
          credit: "XPB Images",     
           },
        {
          src: "/img/news/xpb/Aston/xpb-astonbaku.jpg",
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
          src: "/img/news/xpb/RedBull/max/xpb-maxbaku2.jpg",
          alt: "Saturday race weekend gallery image 1",
          credit: "XPB Images",
        },
        {
          src: "/img/news/xpb/xpb-safteybaku.jpg",
          alt: "Saturday race weekend gallery image 2",
          credit: "XPB Images",
        },
        {
          src: "",
          alt: "Saturday race weekend gallery image 3",
          credit: "XPB Images",
        },
         {
          src: "",
          alt: "Race day gallery image 1",
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
          alt: "Race day gallery image 5",
          credit: "XPB Images",
        },
        {
          src: "",
          alt: "Race day gallery image 6",
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