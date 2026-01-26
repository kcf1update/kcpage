import React from "react";

export default function SiteTitleBar({ showTitle = true }) {
  return (
    <div className="w-full flex justify-center mb-3">
      {showTitle && (
        <h1 className="text-white text-3xl font-bold">
          KC's Worldwide F1 Update
        </h1>
      )}
    </div>
  );
}
