// src/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import MainPage from "./kcpage";
import PointsPage from "./PointsPage";
import NextRacePage from "./NextRacePage";
import F1NewsPage from "./F1NewsPage";
import YouTubeNewsPage from "./YouTubeNewsPage";
import CommentsPage from "./CommentsPage";
import SiteFooter from "./components/SiteFooter";
import AboutPage from "./AboutPage";
import PressPage from "./PressPage";
import PreviousResultsPage from "./PreviousResultsPage";
import PhotoGalleryPage from "./PhotoGalleryPage";
import DailyNewsEditorPage from "./DailyNewsEditorPage";

const pageMetadata = {
  "/": {
    title: "Formula 1 News, Results & Race Centre | KC's F1 Update",
    description:
      "Worldwide Formula 1 news, quick summaries, KC commentary, standings, race results and complete race weekend coverage.",
  },
  "/news": {
    title: "Latest Formula 1 News & Quick Summaries | KC's F1 Update",
    description:
      "Catch up on the latest Formula 1 news with accurate quick-read summaries, international sources and original commentary from KC.",
  },
  "/racecenter": {
    title: "F1 Race Centre: Schedule, Results & Recaps | KC's F1 Update",
    description:
      "Follow the current Formula 1 weekend with session times, results, detailed recaps, weather information and race weekend photos.",
  },
  "/photo-gallery": {
    title: "Formula 1 Race Weekend Photo Gallery | KC's F1 Update",
    description:
      "Explore Formula 1 race weekend photo galleries featuring practice, qualifying and Grand Prix action from throughout the season.",
  },
  "/previous-results": {
    title: "Previous Formula 1 Results & Recaps | KC's F1 Update",
    description:
      "Review previous Formula 1 race weekend results, session summaries, qualifying results and Grand Prix recaps.",
  },
  "/points": {
    title: "2026 Formula 1 Standings | KC's F1 Update",
    description:
      "View the latest 2026 Formula 1 Drivers' Championship and Constructors' Championship standings.",
  },
  "/youtube": {
    title: "Formula 1 Video News & Updates | KC's F1 Update",
    description:
      "Watch Formula 1 news updates, race weekend coverage and quick video summaries from KC's Worldwide F1 Update.",
  },
  "/comments": {
    title: "Formula 1 Fan Comments & Discussion | KC's F1 Update",
    description:
      "Join the Formula 1 conversation and share your thoughts about the latest drivers, teams, races and championship stories.",
  },
  "/about": {
    title: "About KC's Worldwide Formula 1 Update",
    description:
      "Learn about Kevin and KC's Worldwide F1 Update, an independent destination for quick Formula 1 news and race weekend coverage.",
  },
  "/press": {
    title: "Press & Media | KC's Worldwide F1 Update",
    description:
      "Press, media and partnership information for KC's Worldwide F1 Update.",
  },
  "/kc-daily-news-editor": {
    title: "Private Daily News Editor | KC's F1 Update",
    description: "Private news publishing workspace.",
    robots: "noindex, nofollow, noarchive",
    canonical: false,
  },
};

function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const metadata = pageMetadata[pathname] || pageMetadata["/"];

    document.title = metadata.title;

    let descriptionTag = document.querySelector('meta[name="description"]');

    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.setAttribute("name", "description");
      document.head.appendChild(descriptionTag);
    }

    descriptionTag.setAttribute("content", metadata.description);

    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement("meta");
      robotsTag.setAttribute("name", "robots");
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute("content", metadata.robots || "index, follow");

    let canonicalTag = document.querySelector('link[rel="canonical"]');

    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalTag);
    }

    const canonicalPath = pathname === "/" ? "/" : pathname;

    if (metadata.canonical === false) {
      canonicalTag.removeAttribute("href");
    } else {
      canonicalTag.setAttribute("href", `https://kcf1update.ca${canonicalPath}`);
    }
  }, [location.pathname]);

  return null;
}


function IdentityCallbackRedirect() {
  const location = useLocation();

  useEffect(() => {
    const identityCallback =
      /^#(?:confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/.test(
        window.location.hash
      );

    if (
      identityCallback &&
      location.pathname !== "/kc-daily-news-editor"
    ) {
      window.location.replace(
        `/kc-daily-news-editor${window.location.hash}`
      );
    }
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SeoManager />
      <IdentityCallbackRedirect />

      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/news" element={<F1NewsPage />} />
            <Route path="/racecenter" element={<NextRacePage />} />
            <Route
              path="/next-race"
              element={<Navigate to="/racecenter" replace />}
            />
            <Route
              path="/photo-gallery"
              element={<PhotoGalleryPage />}
            />
            <Route
              path="/previous-results"
              element={<PreviousResultsPage />}
            />
            <Route path="/points" element={<PointsPage />} />
            <Route path="/youtube" element={<YouTubeNewsPage />} />
            <Route path="/comments" element={<CommentsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/press" element={<PressPage />} />
            <Route path="/kc-daily-news-editor" element={<DailyNewsEditorPage />} />
            <Route path="*" element={<MainPage />} />
          </Routes>
        </div>

        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}
