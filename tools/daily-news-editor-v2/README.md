# KC Daily News Editor v2 — offline safety stage

This is the first isolated stage of the replacement Daily News Editor.

From the project folder run `npm run start --prefix tools/daily-news-editor-v2`, then open
`http://127.0.0.1:4179/`. Leave the terminal open while using the editor. The local
server serves only the editor files and images already in the project under `public/img`.
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
