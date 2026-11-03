# Shawn Fishkov

A minimal space-themed portfolio with a draggable playing-card experience wheel and real 3D project boxes. Black, white, mango orange, and STIX Two Math. No favicon.

## Run locally

Requires Node.js 20 or newer. No install or build step is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173. Run `npm test` and `npm run check` to validate changes.

## Edit content

Edit `dist/data.js`. Add an object to `experiences` for a work card, `projects` for a project box, or `skills` for a draggable skill capsule. Existing entries show the supported fields.

- `WorkCard` and `CardWheel` in `dist/app.js` handle the playing cards. The wheel has a fixed 300px radius and 40° spacing. Entry 1 starts in the center, then 2 left, 3 right, 4 farther left, and 5 farther right. Rotation stops at the physical left and right ends with a damped spring bounce. Gentle idle motion hints at dragging without centering the end cards; hovering, dragging, focus, and open dialogs pause it.
- `ProjectBox` in `dist/project-box.js` builds the real Three.js geometry. Use `theme: 'robot'`, `'horror'`, `'cat'`, or `'drawensic'`, or extend `build()` with new props. Every box has a rear-hinged lid. Hover scaling happens inside the 3D scene. Soft contact shadows avoid self-shadowing artifacts on thin cardboard.
- `SkillCapsule` and `SkillField` in `dist/skills.js` build the invisible skills grid. Define `{label: 'Skill name', mass: 1}` entries in `skills`; `mass` is optional. Capsules have rounded collision shapes, pointer dragging, keyboard movement, and springs that return them to their anchors. Blocked return paths steer around neighboring capsules.
- `SpaceBackground` in `dist/space-background.js` draws drifting stars, occasional twinkles, and a cached procedural nebula at 30fps. It pauses in hidden tabs and respects reduced motion. No external animation assets are needed.
- Project `media` accepts `image` (`src`, `alt`), `video` (`src`, optional `poster`), `youtube-playlist` (`id`), and `illustration` entries. Put local media in `dist/assets/`.
- Company card fronts use local SVG/PNG assets where available and text wordmarks otherwise. The PCB entry is a project, so its chip symbol is illustrative.

Dialogs open immediately, close with the close button, Escape, or an outside click, and return focus to the triggering item. Keyboard arrows, Home, End, the navigation buttons, and horizontal touch/pointer drags operate the wheel. Vertical touch scrolling is preserved. Reduced-motion preferences are respected. A usable project fallback is shown if WebGL is unavailable.

## Deploy

The GitHub Actions workflow publishes `dist/` to GitHub Pages on every push to `main`. In repository **Settings → Pages**, set **Source** to **GitHub Actions**. The expected public address is https://crimtexfox.github.io/.

The `.openai/hosting.json` file also records the private Sites preview identity. It contains no credentials.

## Assets and content

Professional content comes from Shawn Fishkov’s supplied resume. External links include the original Steam store page and gameplay playlist. Game screenshots are from the Steam listing; Drawensic’s description and homepage screenshot come from the connected project and https://drawensic.com. The robotic-arm diagram is an illustration, not a project photograph. No private phone number, full resume PDF, street address, or citizenship information is included.

Three.js 0.187.0 is vendored locally under the MIT license (`dist/assets/THREE-LICENSE.txt`). STIX Two Math is included under the SIL Open Font License (`dist/assets/STIX-LICENSE.txt`). The OpenAI mark comes from Simple Icons 13.21.0; the inCall.ai mark comes from its official site. Company marks belong to their respective owners.
