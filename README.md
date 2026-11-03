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

- `WorkCard` and `CardWheel` in `dist/app.js` handle the playing cards. The wheel has a fixed 300px radius and 40° spacing. Entry 1 starts in the center, then 2 left, 3 right, 4 farther left, and 5 farther right. Rotation stops at the physical left and right ends with a damped spring bounce. `dist/wheel-motion.js` controls the passive animations: at most 12px of sideways drift when cards are clipped, a slow ±0.8° rotation, and a 2.8% fan wave every 24 seconds. The visible cards are ordered left to right; each grows, then shrinks while the next card grows. Only two neighboring cards overlap in the handoff. The order stays fixed for a pass so gentle wheel movement cannot reshuffle the wave. Hovering, dragging, keyboard focus, and open dialogs pause the motion. The wheel reserves paint space above it so selected cards can grow fully.
- `ProjectBox` in `dist/project-box.js` builds the real Three.js geometry. Use `theme: 'robot'`, `'horror'`, `'cat'`, or `'drawensic'`, or extend `build()` with new props. Every box has a rear-hinged lid. Hover scaling happens inside the 3D scene. Soft contact shadows avoid self-shadowing artifacts on thin cardboard.
- `SkillCapsule` and `SkillField` in `dist/skills.js` build the invisible skills grid. Define `{label: 'Skill name', mass: 1}` entries in `skills`; `mass` is optional. Capsules retain release momentum, bounce off each other and the invisible container, and drift freely for three seconds after the latest release. Then all capsules begin returning to their grid anchors together. Starting another drag cancels the pending reset; its release starts a fresh three-second delay. Keyboard arrows use the same delay. Blocked return paths steer around neighboring capsules.
- `SKILL_COLLISION_BOUNCE` in `dist/capsule-physics.js` controls capsule-to-capsule rebound velocity. It is `0.4` (40% of the original rebound); use `1` for the original strength. It applies during drifting and resetting, independently of wall bounces.
- `SpaceBackground` in `dist/space-background.js` draws three star planes and two separately seeded, cached nebula planes at 30fps. Each plane has its own drift speed and depth; smooth scrolling and pointer movement shift nearer planes more than distant ones. Stars still twinkle. The effect pauses in hidden tabs, becomes static with reduced motion, and uses scrolling on touch devices. Adjust `STAR_LAYERS` and `NEBULA_LAYERS` to tune the depth. No external animation assets are needed.
- Project `media` accepts `image` (`src`, `alt`), `video` (`src`, optional `poster`), `youtube` (`id`), `youtube-playlist` (`id`), and `illustration` entries. Put local media in `dist/assets/`.
- Company card fronts use local SVG/PNG assets where available and text wordmarks otherwise. The PCB entry is a project, so its chip symbol is illustrative.

Dialogs open immediately, close with the close button, Escape, or an outside click, and return focus to the triggering item. Work cards reverse their opening flight when closed: they flip back, shrink, and return to their current position and angle on the wheel. The wheel copy stays hidden during the flight and is restored on arrival. Keyboard arrows, Home, End, the navigation buttons, and horizontal touch/pointer drags operate the wheel. Vertical touch scrolling is preserved. Reduced-motion preferences are respected. A usable project fallback is shown if WebGL is unavailable.

## Deploy

The GitHub Actions workflow publishes `dist/` to GitHub Pages on every push to `main`. In repository **Settings → Pages**, set **Source** to **GitHub Actions**. The expected public address is https://crimtexfox.github.io/.

When updating a cached stylesheet or module, bump its `v` query in the corresponding HTML or JavaScript import so returning browsers load the new asset.

The `.openai/hosting.json` file also records the private Sites preview identity. It contains no credentials.

## Assets and content

Professional content comes from Shawn Fishkov’s supplied resume. External links include the original Steam store page and gameplay playlist. Game screenshots are from the Steam listing; Drawensic’s description and homepage screenshot come from the connected project and https://drawensic.com. The robotic-arm diagram is an illustration, not a project photograph. No private phone number, full resume PDF, street address, or citizenship information is included.

Three.js 0.187.0 is vendored locally under the MIT license (`dist/assets/THREE-LICENSE.txt`). STIX Two Math is included under the SIL Open Font License (`dist/assets/STIX-LICENSE.txt`). The OpenAI mark comes from Simple Icons 13.21.0; the inCall.ai mark comes from its official site. Company marks belong to their respective owners.
