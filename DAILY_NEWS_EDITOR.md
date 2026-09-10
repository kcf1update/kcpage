# KC Daily News Editor

The private editor is available at `/kc-daily-news-editor` and is not linked from public navigation.

## Netlify setup

1. Enable Netlify Identity and change registration to **Invite only**.
2. Invite Kevin's chosen editor email address.
3. Set `NEWS_EDITOR_ALLOWED_EMAILS` to that address (or a comma-separated list).
4. Keep the existing `GITHUB_TOKEN`, `GITHUB_OWNER` and `GITHUB_REPO` settings. `NEWS_EDITOR_BRANCH` is optional and defaults to `main`.

The editor supports invitation links, normal sign-in, sign-out and password recovery. An Identity account still cannot publish unless its email is on the allowlist.

## Workflow

1. Edit one story at a time. An unfinished draft is saved in this browser.
2. Complete all fields for all 10 stories.
3. Select **Review and publish all 10** and confirm the date.
4. The editor stops if the repository changed since it was loaded, preventing newer work from being overwritten.
5. When the date changes, the existing stories are added to `newsArchive.js` and the new stories are written to `newsSlots.js` in one Git commit.
6. Netlify performs the normal website deployment.

The existing manual `newsSlots.js` workflow remains available as a fallback.
