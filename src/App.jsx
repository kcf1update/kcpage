// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainPage from "./kcpage";
import PointsPage from "./PointsPage";
import NextRacePage from "./NextRacePage";
import F1NewsPage from "./F1NewsPage";
import YouTubeNewsPage from "./YouTubeNewsPage";
import CommentsPage from "./CommentsPage";
import SiteFooter from "./components/SiteFooter";
import AboutPage from "./AboutPage";
import PressPage from "./PressPage";
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/points" element={<PointsPage />} />
            <Route path="/next-race" element={<NextRacePage />} />
            <Route path="/news" element={<F1NewsPage />} />
            <Route path="/youtube" element={<YouTubeNewsPage />} />
            <Route path="/comments" element={<CommentsPage />} />
            <Route path="/about" element={<AboutPage />} /> {/* ✅ ADD THIS */}
            <Route path="*" element={<MainPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/press" element={<PressPage />} />

          </Routes>
        </div>

        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}

