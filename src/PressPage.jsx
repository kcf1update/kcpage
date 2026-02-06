// src/PressPage.jsx
import { Link } from "react-router-dom";

export default function PressPage() {
  return (
    <div className="relative min-h-screen bg-black/80 py-12 px-4">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-gray-900 shadow-lg">
        <Link
          to="/"
          className="inline-block mb-4 rounded-full border border-red-600 bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 hover:border-red-700 transition"
        >
          ← Back to Home
        </Link>

        <h1 className="mb-6 text-3xl font-bold">Press & Media Information</h1>

        <section className="space-y-5 text-sm leading-relaxed">
          <p>
            <strong>KC’s Worldwide F1 Update</strong> is an independent Formula 1
            editorial website providing curated news summaries, original
            commentary, and regular updates focused on the global Formula 1
            championship.
          </p>

          <p>
            KC’s Worldwide F1 Update is not affiliated with, endorsed by, or
            connected to Formula One Management (FOM), the FIA, or any Formula 1
            teams or drivers.
          </p>

          <h2 className="pt-4 text-xl font-semibold">Editorial Focus</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Formula 1 news and developments</li>
            <li>Team and driver updates</li>
            <li>Technical and regulatory discussion</li>
            <li>Race weekend previews and reactions</li>
            <li>Original short-form commentary (“KC Quick Shift”)</li>
          </ul>

          <h2 className="pt-4 text-xl font-semibold">Platforms</h2>
          <p>
            In addition to the website, KC’s Worldwide F1 Update publishes
            supporting content on YouTube and Instagram to direct audiences to
            full written coverage on the website.
          </p>

          <h2 className="pt-4 text-xl font-semibold">Image & Media Usage Policy</h2>
          <p>
            Images are intended for editorial context only, with appropriate
            credit where required. Images are not sold, redistributed, or made
            available for download.
          </p>
          <p>
            KC’s Worldwide F1 Update does not use images to imply endorsement,
            partnership, or affiliation. Requests from rights holders for
            correction, attribution, or removal are handled promptly and
            respectfully.
          </p>

          <h2 className="pt-4 text-xl font-semibold">Contact</h2>
          <p>
            <strong>Editor / Publisher:</strong> Kevin Chisholm
            <br />
            <strong>Email:</strong> kcf1update@gmail.com
            <br />
            <strong>Website:</strong> https://kcupdate.ca
          </p>

          <p className="pt-4 text-xs text-gray-600">
            All trademarks, logos, team names, and driver names are the property
            of their respective owners and are used for identification and
            editorial purposes only.
          </p>
        </section>
      </div>
    </div>
  );
}
