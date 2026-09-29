# Aurelia Tower — Procedural Luxury Skyscraper

A complete Next.js + TypeScript + React Three Fiber scene that procedurally constructs an original Gulf-inspired luxury skyscraper instead of importing a single monolithic model.

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Architecture

- `TowerCore` — concealed structural/service core and interior columns
- `FloorSlabs` — 106 individually profiled floor plates
- `GlassFacade` — thousands of instanced curtain-wall panels with deterministic office / hotel / residential night-light clustering
- `CurtainWallGrid` — instanced mullions and horizontal floor divisions
- `MechanicalFloors` — non-repetitive mechanical transition bands and louvers
- `StructuralFins` — champagne-metal vertical blades with integrated warm lighting
- `BalconyBand` — sky terraces at major setback transitions
- `Crown` — three nested glazed crown shells plus mechanical screening
- `Spire` — segmented, tapering architectural spire
- `PodiumLobby` — 6-level luxury podium, entrance glazing, canopy, columns, reception, chandelier and lobby hints
- `SiteEnvironment` — plaza, reflecting pools, palms, roads, bollards, people, vehicles and restrained skyline silhouettes

## Performance choices

Curtain-wall glass and mullions use `THREE.InstancedMesh`, keeping draw-call counts low even though the facade contains thousands of visible elements. Window illumination is deterministic rather than `Math.random()`, so the rendered pattern is stable between renders and clusters by building program.

The scene also uses capped DPR, `AdaptiveDpr`, restrained real lights, emissive architectural strips, and simple procedural context geometry.

## Art direction

The tower is intentionally original. It uses a broad monumental lower mass, five tapering / shifting tower zones, multiple setbacks, modest cumulative twist, terraces, mechanical transitions, a highly articulated crown, and a segmented spire. Materials stay in the luxury-financial-district range: blue-black glass, champagne metal, pale stone and warm-white lighting rather than neon/cyberpunk color.
