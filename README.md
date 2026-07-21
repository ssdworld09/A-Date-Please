# For AK — a little keepsake site

A small, three-page romantic site you can host for free on GitHub Pages and send as a link.

## The files

| File | What it is |
|------|-----------|
| `index.html` | Page 1 — *For You* (about her) |
| `me.html` | Page 2 — *About Me* (about you) |
| `date.html` | Page 3 — *A Question* (the date ask, with a "yes" moment) |
| `style.css` | Shared styling for all three pages |

Everything is plain HTML/CSS with a tiny bit of JavaScript — no build step, no dependencies.

## Put it on GitHub Pages (about 5 minutes)

1. Create a new repository on GitHub (e.g. `for-ak`). Keep it **Public** — Pages needs that on free accounts.
2. Upload all four files (`index.html`, `me.html`, `date.html`, `style.css`) to the root of the repo. (Click **Add file → Upload files**.)
3. Go to the repo's **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Pick branch **main** and folder **/ (root)**, then **Save**.
6. Wait a minute or two. Your link will appear at the top of the Pages settings, like:
   `https://<your-username>.github.io/for-ak/`
7. Open it to check, then send that link to her. It opens on `index.html` automatically.

> Tip: if you'd rather the repo not be discoverable, name it something neutral. The URL is only shareable, not listed anywhere public by default — but anyone with the link can view it.

## Editing the words

- Replace **AK** with her name wherever you like it to appear (it's in `index.html` and `date.html`).
- All the copy is right there in the HTML between the tags — just change the text, keep the tags.
- Add or remove points in the "things I've noticed" and "what you can count on" lists by copying a `<li>...</li>` line.

## Editing the look

Open `style.css` — the colors are all at the top under `:root`:

```
--rose:  #b85c6e;   /* main accent */
--sage:  #7e9075;   /* green */
--bg:    #fbeff0;   /* background blush */
```

Change those hex values to reshape the whole palette at once.

## Notes

- The drifting petals and the "yes" flower burst automatically turn off for anyone who has reduced-motion enabled.
- Fonts (Fraunces + Mulish) load from Google Fonts, so the pages need an internet connection to look their best — which is fine for a shared link.
