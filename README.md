# Kaal Darpan — museum development stage

This extends your original React home page with a bright modern Three.js gallery inspired by your reference image, three selectable monument miniatures, a teleport transition, orbit/zoom exploration, architecture hotspots, short timelines, two-question activities and local learning progress.

![Gallery preview](Gallery_Preview.png)

## Open it

Extract the ZIP and open the extracted project folder containing package.json in VS Code. In its terminal run:

    npm install
    npm run dev

Open http://localhost:5175 for the animated cover page, then use **Enter the Museum Gallery** to open the museum (`museum.html`, which mounts the React app from `src/main.jsx`). Keep the terminal running. If port 5175 is already occupied by your old project, stop the old server with Ctrl+C first.

The downloaded ZIP intentionally excludes node_modules. npm install recreates it correctly for your computer.

## Gallery design

The gallery uses white rectangular display tables, a tiled stone-style floor, full-height windows, a dark slatted ceiling with perimeter lighting, wall-mounted heritage illustrations, benches and small object exhibits. Taj Mahal is on the central foreground table, Qutub Minar is further along the centre aisle, and Red Fort is on the left display table. The gallery is modeled in 3D; the reference photo is not used as a flat background.

Drag to look around within the room and scroll/pinch to move closer. Select a miniature, its display table, or the accessible monument card to enter that monument.

## Try it

Begin Exploration → select Taj Mahal, Qutub Minar or Red Fort → drag to rotate and scroll/pinch to zoom → select a numbered marker or a feature in the right panel → History → Challenge → answer both questions and check answers → return to Museum → My Journey.

The exhibit cards and feature buttons provide keyboard access to the same content as 3D clicking. Reset View restores the camera. R also resets it when the canvas is focused.

## Scope

Models are simplified procedural learning placeholders, not measured reconstructions. This stage supports looking around the museum and orbiting monuments; walking through interiors, production Blender/GLB models, QR scanning, accounts, Firebase and AR/prism display are not implemented. Progress is stored in localStorage for the same browser and origin; it does not sync between devices. If storage is blocked the app remains usable for the session.

## Files

- index.html, css/styles.css, js/app.js: animated cover page (vanilla HTML/CSS/JS). The museum URL is the `href` of the `[data-museum-link]` button in index.html.
- museum.html: Vite entry page for the museum; js/museum-entry.js lets `museum.html#gallery` open straight into the gallery hall
- src/App.jsx: entrance, navigation, transition, learning panels, quiz, progress
- src/Scene.jsx: renderer, controls, picking, projected markers, cleanup
- src/models.js: procedural monument and museum builders
- src/data.js: monument content, hotspots, quiz and source URLs
- src/App.css and src/index.css: styling

## References

Historical content was checked against UNESCO monument descriptions. Simplified model observations are explicitly marked. Content should be reviewed alongside measured assets before a full educational release.

- Taj Mahal: https://whc.unesco.org/en/list/252/
- Qutb Minar and its Monuments: https://whc.unesco.org/en/list/233/
- Red Fort Complex: https://whc.unesco.org/en/list/231/

## Build

    npm run build
    npm run lint

Node.js: use a version supported by the project's Vite dependency. No API keys or database setup are needed for this development stage.
