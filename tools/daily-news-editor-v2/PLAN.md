# Daily News Editor v2 plan

## Non-negotiable requirements

- No built-in AI.
- Use normal browser spell-check.
- Do not change the public website's appearance, navigation, routes, ads, F1 Spotlights, Race Centre, or gallery.
- Keep the existing VS Code workflow available at all times.
- Never overwrite repository work made after the editor loaded.
- Keep article links http/https only and image paths local, beginning with `/`.
- Support exactly 10 stories, with bilingual guidance for slots 2, 4, and 8.
- Preserve summaries and KC QuickShifts when archiving the previous day.

## Staged delivery

### Stage 1 — offline safety build

- Import the current `newsSlots.js` and `newsArchive.js` from Kevin's computer.
- Edit all 10 stories with browser spell-check and card previews.
- Save unfinished work only in the browser.
- Validate fields, links, local image paths, dates, and bilingual separators.
- Prepare replacement files for review without changing GitHub or Netlify.
- Preserve every older archive byte-for-byte; only prepend one new group when required.

### Stage 2 — private shared drafts

- Add private sign-in only after authentication is tested separately.
- Store drafts away from `main` so drafting cannot start a website deployment.
- Record the exact `main` commit used when the draft was loaded.
- Allow the approved assistant workflow to read the same draft data without placing AI inside the editor.

### Stage 3 — exact website preview

- Create a temporary non-production branch from the latest `main`.
- Apply the prepared news and archive files in one commit.
- Run content tests and the full production build.
- Show the exact public cards and archive output for review.
- Stop if `main` changes during review.

### Stage 4 — controlled publishing

- Require a clear final confirmation from Kevin.
- Recheck that the latest `main` commit still matches the reviewed version.
- Update the two news files together in one recoverable commit.
- Confirm the website build succeeds before reporting success.
- Keep the previous commit available as the recovery point.

## Acceptance checks before live publishing is connected

1. Same-day corrections never create duplicate archive groups.
2. A new date adds the previous day exactly once.
3. Older archive text is not reformatted or rewritten.
4. Invalid links, remote images, missing fields, and incomplete bilingual slots are blocked.
5. A newer Race Centre, gallery, design, ad, Spotlight, route, or news change causes publishing to stop safely.
6. Closing and reopening the editor restores an unfinished draft.
7. The public site builds exactly as it did before the editor work.
8. The manual VS Code workflow still works with no editor running.
