# Tank Care Guide

The care guide for the aquariums, paludariums and begonias, for Jon and Matt.
Plain HTML, CSS and JavaScript. No build step, nothing to install.

## 1. Preview locally

Open `index.html` in a browser. That's it.

Or run a simple local server from this folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## 2. Edit wording

Change `content.js` only. Every word on the site, and who owns each task, lives there.

- Wrap bold text in `**double asterisks**`.
- Owners are `"jon"` or `"matt"`. Changing a view's `owner` updates its owner pill, the crew chips and the schedule.
- Quick list step ranges are `[first, last]`, for example `[5, 9]` shows "Steps 5–9".

Save the file and reload the page.

## 3. Publish on GitHub Pages

1. Push this folder to a public GitHub repo.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Pick `main` and `/ (root)`, then **Save**.

After a minute the site appears at `https://<username>.github.io/<repo>/`.

## Files

```
index.html    page shell
styles.css    design tokens, layout, components, motion
app.js        routing, rendering, checklists, stage states, motion control
content.js    all copy and owner assignments
favicon.svg   icon
```

Nothing is saved: checklists live in memory and clear on reload. The only external request is Google Fonts.
