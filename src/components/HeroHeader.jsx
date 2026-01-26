import React from "react";
import "./HeroHeader.css";

export default function HeroHeader() {
  return (
    <div className="heroWrap" aria-label="KC's Worldwide F1 Update hero">
      <img
        className="heroImg"
        src="/img/hero-worldwide.png"
        alt="KC's Worldwide F1 Update"
      />
    </div>
  );
}

