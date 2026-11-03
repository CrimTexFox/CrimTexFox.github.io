# Shawn Fishkov

A minimal space-themed portfolio with a draggable playing-card experience wheel and real 3D project boxes. Black, white, mango orange, and STIX Two Math. No favicon.

## Run locally

Requires Node.js 20 or newer. No install or build step is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173. Run `npm test` and `npm run check` to validate changes.

## Edit content

Edit `dist/data.js`. Add another object to `experiences` to create a work card, or `projects` to create a project box. Existing entries show the supported fields.

- `WorkCard` and `CardWheel` in `dist/app.js` handle the playing cards. The wheel has a fixed 300px radius and 40° spacing. Entries start at the top, continue clockwise, and can advance past a full revolution without stacking cards. Rotation stops at the first and last entries with a damped spring bounce.
- `ProjectBox` in `dist/project-box.js` builds the real Three.js geometry. Use `theme: 'robot'`, `'horror'`, or `'cat'`, or extend `build()` with new props. Every box has a rear-hinged lid.
- Project `media` accepts `image` (`src`, `alt`), `video` (`src`, optional `poster`), `youtube-playlist` (`id`), and `illustration` entries. Put local media in `dist/assets/`.
- Company card fronts use local SVG/PNG assets where available and text wordmarks otherwise. The PCB entry is a project, so its chip symbol is illustrative.

Dialogs open immediately, close with the close button, Escape, or an outside click, and return focus to the triggering item. Keyboard arrows, Home, End, the navigation buttons, and horizontal touch/pointer drags operate the wheel. Vertical touch scrolling is preserved. Reduced-motion preferences are respected. A usable project fallback is shown if WebGL is unavailable.

## Deploy

The GitHub Actions workflow publishes `dist/` to GitHub Pages on every push to `main`. In repository **Settings → Pages**, set **Source** to **GitHub Actions**. The expected public address is https://crimtexfox.github.io/.

The `.openai/hosting.json` file also records the private Sites preview identity. It contains no credentials.

## Assets and content

Professional content comes from Shawn Fishkov’s supplied resume. External links include the original Steam store page and gameplay playlist. Game screenshots are from the Steam listing. The robotic-arm diagram is an illustration, not a project photograph. No private phone number, full resume PDF, street address, or citizenship information is included.

Three.js 0.187.0 is vendored locally under the MIT license (`dist/assets/THREE-LICENSE.txt`). STIX Two Math is included under the SIL Open Font License (`dist/assets/STIX-LICENSE.txt`). The OpenAI mark comes from Simple Icons 13.21.0; the inCall.ai mark comes from its official site. Company marks belong to their respective owners.
