# rylandgross.com

The static source for [rylandgross.com](http://rylandgross.com/)

The unlisted quizbowl study room lives at `/qbreview/` (`qbreview/index.html`).
It is marked `noindex` and has no links in the public navigation; the URL is
still publicly accessible and is not password protected.

QB Review uses the public [QB Reader API](https://www.qbreader.org/tools/api-docs/)
for tournament tossups and includes 252 original recognition cards covering
80 authors, 23 literary traditions, and 6 mathematics topics. General literature,
American, British, European, World, Classical, and Other Literature use QB
Reader’s subcategories. National-literature filters narrow questions using
authors in the local catalog; they are not an exhaustive national bibliography.

Progress and author notes are saved in this browser’s local storage. The Progress
tab can export a JSON backup and import it on another device. Imports can replace
or merge records. There is no account or automatic cross-device sync. A miss is
due again in ten minutes; consecutive successful recalls schedule reviews after
1 day, 3 days, and increasingly longer intervals. Random practice includes future
reviews. The daily activity log retains the most recent 3,000 attempts; lifetime
review totals remain in the per-card records.

Run the study engine checks with `node --test qbreview/core.test.mjs`. For local
preview, run `python3 -m http.server 8765` and open
`http://localhost:8765/qbreview/`. No build step or production dependencies are
required. The existing GitHub Pages publication workflow serves this directory
at `https://rylandgross.com/qbreview/` after publication.
