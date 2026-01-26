import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-black/60 px-6 py-6 text-xs text-gray-400 backdrop-blur">
      <div className="mx-auto max-w-6xl space-y-2 text-center">
        <p className="mt-2 text-[11px] leading-relaxed text-slate-300/80">
  Video content displayed on this site is embedded from third-party platforms
  such as YouTube. KC’s Worldwide F1 Update does not host, upload, or claim
  ownership of any video content. All videos remain the property of their
  respective creators and rights holders and are presented for commentary,
  news, and editorial purposes.
</p>

        <p>
          All trademarks, logos, team names, driver names, and race names are the
          property of their respective owners and are used for informational and
          editorial purposes only.
        </p>

        <p>
          Images and media are original works, AI-generated, embedded from
          official platforms, or used under fair dealing for news, commentary,
          and criticism. Rights holders may contact us for prompt removal of any
          content.
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-300/80">
          Video content displayed on this site is embedded directly from YouTube.
          KC’s Worldwide F1 Update does not host, upload, or claim ownership of any
          video content. All videos remain the property of their respective creators
          and rights holders.
        </p>

        {/* THIS is where the link goes */}
        <p className="pt-2">
          <Link to="/about" className="text-gray-400 hover:text-white underline">
            About & Legal
          </Link>
        </p>
        <p className="pt-2 text-gray-500">
          © {new Date().getFullYear()} KC’s Worldwide F1 Update
        </p>
      </div>
    </footer>
  );
}
