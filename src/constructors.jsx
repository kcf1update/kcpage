import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/** tiny helpers */
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);

/** image -> dataURL helper for uploads */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ConstructorsPage() {
  const [teams, setTeams] = useState(load("kc_teams", [
    { id: uid(), name: "McLaren",   principal: "Andrea Stella", carImg: "" },
    { id: uid(), name: "Ferrari",   principal: "Frédéric Vasseur", carImg: "" },
    { id: uid(), name: "Red Bull",  principal: "Christian Horner", carImg: "" },
  ]));

  useEffect(() => save("kc_teams", teams), [teams]);

  async function handleImage(i, file) {
    const dataUrl = await fileToDataUrl(file);
    setTeams(prev => prev.map((t, idx) => idx === i ? { ...t, carImg: dataUrl } : t));
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200">
      {/* simple header */}
      <header className="bg-white text-black border-b-2 border-red-600">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">Constructors — 2025</h1>
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="px-3 py-1 rounded-md border border-neutral-300 hover:bg-neutral-100">Home</Link>
            <Link to="/drivers" className="px-3 py-1 rounded-md border border-neutral-300 hover:bg-neutral-100">Drivers</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4 flex gap-2">
          <button
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-3 rounded-md"
            onClick={() => setTeams(prev => [...prev, { id: uid(), name: "New Team", principal: "", carImg: "" }])}
          >
            Add Team
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teams.map((t, i) => (
            <div key={t.id} className="rounded-xl border border-yellow-500/30 bg-neutral-950/70 p-3 shadow-[0_0_35px_-10px_rgba(250,204,21,0.35)]">
              {t.carImg ? (
                <img src={t.carImg} alt={`${t.name} car`} className="w-full h-40 object-cover rounded-lg mb-3" />
              ) : (
                <div className="w-full h-40 rounded-lg border border-neutral-700 mb-3 flex items-center justify-center text-neutral-400 text-sm">
                  Upload car image
                </div>
              )}

              <label className="block text-xs text-neutral-400">Team name</label>
              <input
                className="w-full bg-transparent border-b border-neutral-600 text-sm mb-2 focus:outline-none"
                value={t.name}
                onChange={(e) => setTeams(prev => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
              />

              <label className="block text-xs text-neutral-400">Team principal</label>
              <input
                className="w-full bg-transparent border-b border-neutral-600 text-sm mb-3 focus:outline-none"
                value={t.principal}
                onChange={(e) => setTeams(prev => prev.map((x, idx) => idx === i ? { ...x, principal: e.target.value } : x))}
              />

              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={(e) => handleImage(i, e.target.files?.[0])} className="text-xs" />
                <button
                  className="text-xs text-neutral-400 hover:text-neutral-200 underline"
                  onClick={() => setTeams(prev => prev.map((x, idx) => idx === i ? { ...x, carImg: "" } : x))}
                >
                  Remove image
                </button>
                <button
                  className="ml-auto text-xs text-red-400 hover:text-red-300 underline"
                  onClick={() => setTeams(prev => prev.filter((_, idx) => idx !== i))}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-neutral-100 text-neutral-700 border-t border-neutral-200 text-center py-3 text-sm">
        Local test build — © 2025 KC
      </footer>
    </div>
  );
}
