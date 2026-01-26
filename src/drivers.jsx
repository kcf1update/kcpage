// src/drivers.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Drivers() {
  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200">
      <header className="bg-white text-black border-b-2 border-red-600">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">Drivers — 2025</h1>
          <nav className="text-sm flex gap-3">
            <Link className="underline hover:text-red-600" to="/">Home</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-neutral-900/70 border border-neutral-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-3">Top 3 — placeholder</h2>
          <ul className="list-disc pl-6 text-sm text-neutral-300">
            <li>Driver 1 (edit later)</li>
            <li>Driver 2 (edit later)</li>
            <li>Driver 3 (edit later)</li>
          </ul>
        </section>

      <section className="bg-neutral-900/70 border border-neutral-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-3">All 2025 Drivers — placeholder</h2>
          <p className="text-sm text-neutral-400">
            We’ll add cards/photos after we lock stability.
          </p>
        </section>
      </main>

      <footer className="bg-neutral-100 text-neutral-700 border-t border-neutral-200 text-center py-3 text-sm">
        © 2025 KC — Local test
      </footer>
    </div>
  );
}
