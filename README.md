# A little space

A static, scroll-driven personal homepage for **ThatGuyIAmThatGuyNoBodyElseIsThatGuy6767**. HTML, CSS, JavaScript, and locally bundled Three.js. No build step and no placeholder links.

## Preview

From this directory, run:

```sh
python3 -m http.server 8000
```

Then visit **http://localhost:8000**. Use an HTTP server rather than opening `index.html` directly; JavaScript modules require it.

## The experience

- Scroll through orbit, drift, chaos, and identity. The copper sculpture twists, particles scatter, and large, slightly scattered letters unfold vertically at the right edge to spell the full name.
- Move your pointer for subtle parallax; tap the sculpture or “Disturb the universe” for a burst.
- Choose Orbit, Drift, or Chaos to override the current scene until you scroll again.
- Hold “Hold to warp” or the Space key to stretch the universe. Release to return.
- Toggle the atmosphere, pause motion, or enable optional synthesized ambient sound. Sound is off by default.
- Translucent glass surfaces frame the navigation and controls, with highlights that follow the pointer. Floating 3D glass lenses refract the copper sculpture.
- Reduced-motion preferences pause continuous effects. The page has a CSS fallback when WebGL is unavailable.

The existing GitHub Pages workflow serves the repository as-is. Three.js 0.180.0 is vendored in `assets/` under its included MIT license. Fonts use Google Fonts with system fallbacks; the site and 3D scene work without that font service.
