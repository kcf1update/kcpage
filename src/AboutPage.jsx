import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-black/80 py-12 px-4">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-gray-900 shadow-lg">
        <Link
  to="/"
  className="inline-block mb-4 rounded-full border border-red-600 bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 hover:border-red-700 transition"
>
  ← Back to Home
</Link>

        <h1 className="mb-6 text-3xl font-bold">
          About KC’s Worldwide F1 Update
        </h1>

        <section className="space-y-5 text-sm leading-relaxed">
          <p>
            KC’s Worldwide F1 Update is an independent Formula 1 fan and news
            site dedicated to race coverage, technical discussion, analysis, and
            commentary from around the world.
          </p>

          <p>
            This site is not affiliated with, endorsed by, or connected to
            Formula 1, Formula One Management (FOM), the FIA, or any Formula 1
            teams or drivers.
          </p>

          <p>
            All trademarks, logos, team names, driver names, and race names are
            the property of their respective owners and are used for
            informational and editorial purposes only.
          </p>

          <p>
            Images and media are original works, AI-generated, embedded from
            official platforms, or used under fair dealing for news,
            commentary, and criticism.
          </p>
<p>
  News articles featured on this site include short, original summaries
  written in my own words. Each summary clearly credits the source and
  provides a direct link to the original article so readers can view the
  full content on the publisher’s website.
</p>

<p>
  KC’s Worldwide F1 Update does not copy, repost, or reproduce full news
  articles or paywalled content.
</p>
<p>
  Video content displayed on this site is embedded from third-party
  platforms such as YouTube. KC’s Worldwide F1 Update does not host,
  upload, or claim ownership of any video content. All videos remain the
  property of their respective creators and rights holders and are shown
  for commentary, news, and editorial purposes.
</p>

          <p>
            For copyright concerns or general inquiries, please contact:
            <br />
            <span className="font-semibold">kcf1update@gmail.com</span>
          </p>
        </section>
      </div>
    </div>
  );
}
