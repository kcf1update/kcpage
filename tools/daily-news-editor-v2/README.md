# KC Daily News Editor v2 — offline safety stage

This is the first isolated stage of the replacement Daily News Editor.

From the project folder run `npm run start --prefix tools/daily-news-editor-v2`, then open
`http://127.0.0.1:4179/`. Leave the terminal open while using the editor. The local
server serves only the editor files and images already in the project under `public/img`.
It also checks the current news and archive files in the project at import, preparation,
and download. If either changes while the editor is open, import the latest files again
before preparing replacements. Download a draft backup first to preserve your writing.
If the imported news file contains stories from two dates, the editor can display and edit
them but will not prepare replacement files. Finish the daily archive and start from a
consistent set of 10 stories so the previous day's missing stories are not lost.
Opening `index.html` directly from disk may block JavaScript modules in some browsers.

- It is not imported by the public website.
- It has no GitHub or Netlify publishing connection.
- It contains no AI features.
- Text fields use the browser's normal spell-check.
- Drafts stay in the current browser.
- Deeply nested `/img/...` paths are previewed from the website's `public` folder.
- Up to 10 recovery snapshots are kept before imports and file preparation.
- A separate JSON draft backup can be downloaded at any time.
- It prepares `newsSlots.js` and `newsArchive.js` for review without rewriting older archive groups.

Publishing will only be added after this offline stage has been tested and approved.
