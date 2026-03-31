import React from "react";
import "./PageHero.css";

export default function PageHero({ img, alt = "Page hero", contained = false }) {
 return (
  <section
    className={contained ? "page-hero page-hero--contained" : "page-hero"}
    style={{ backgroundImage: `url(/img/${img})` }}
    aria-label={alt}
  >
    <img
      src="/flags/ca.png"
      alt="Canada flag"
      className="hero-flag"
    />
  </section>
);
}
