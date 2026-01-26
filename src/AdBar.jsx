// src/AdBar.jsx
import React from "react";

/**
 * Reusable ad banner.
 * horizontal (default) or vertical (right rail)
 */
export default function AdBar({ vertical = false }) {
  return (
    <div
      className={
        vertical
          ? `
            w-full max-w-[280px]
            rounded-3xl
            border border-yellow-400/70
            bg-black/40
            backdrop-blur
            px-6 py-6
            flex items-center justify-center
            shadow-[0_0_25px_rgba(255,200,0,0.35)]
          `
          : `
            mt-6
            w-full
            rounded-3xl
            border border-yellow-400/70
            bg-black/40
            backdrop-blur
            px-6 py-6
            flex items-center justify-center
            shadow-[0_0_25px_rgba(255,200,0,0.35)]
          `
      }
    >
      <div className="text-center">
        <p className="text-red-500 font-semibold uppercase tracking-[0.35em] text-sm">
          PLACE YOUR AD HERE
        </p>

        <p className="mt-2 text-xs sm:text-sm text-gray-300 tracking-wide">
          If interested, please contact
          <br />
          <span className="font-medium text-white">
            kcf1update@gmail.com
          </span>
        </p>
      </div>
    </div>
  );
}
