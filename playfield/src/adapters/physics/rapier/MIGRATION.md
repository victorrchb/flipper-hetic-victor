# Migration Cannon-es -> Rapier

Statut : **adapter scaffolde, swappable derriere le port `physics/index.js`**.

Cannon-es reste le backend par defaut tant que le ressenti gameplay
Rapier n'a pas ete valide en conditions reelles.

## Ce qui est fait

- Port `physics/ports/PhysicsPort.js` documentant le contrat partage.
- Barrel `physics/index.js` swappable.
- Adapter Cannon-es maintenu via `physics/cannon/index.js` (re-exporte les fichiers historiques).
- Adapter Rapier complet (primitives MVP) :
  - `init.js` : init WASM async.
  - `world.js` : world incline, `createStaticBoxBody`, sync meshes.
  - `ballBody.js` : sphere bille, reset/launch/clamp.
  - `flipperBody.js` : flippers kinematic velocity-based.
  - `bumperBody.js` : cylindres + restitution 0.8.
  - `slingshotBody.js` : delegation aux helpers static box.
  - `collisionListener.js` : drain `EventQueue` apres chaque step.
  - `bodyHandle.js` : wrapper Cannon-like (Proxy `.position`, `.velocity`, etc.).

## Ce qui reste a faire

1. Installer la dependance dans `playfield/package.json` :
   ```
   npm i -w playfield @dimforge/rapier3d-compat
   ```
2. Adapter `playfield/src/main.js` pour rendre l'init async :
   ```js
   import { initRapier } from "./adapters/physics/rapier/init.js";
   await initRapier();
   // ... reste de la composition root
   ```
3. Activer le backend Rapier dans le barrel :
   ```js
   // playfield/src/adapters/physics/index.js
   // export * from "./cannon/index.js";
   export * from "./rapier/index.js";
   ```
4. Tuner les coefficients (friction, restitution, gravite, force impulsion plunger
   et bumpers) pour retrouver le ressenti MVP.
5. Verifier le scenario MVP complet : start -> launch -> score -> ball_lost ->
   game_over -> restart.
6. Mettre a jour les tests `playfield/src/__tests__/ball.test.js` (mock cannon-es)
   pour mocker le wrapper Rapier (ou ajouter un test `ball.rapier.test.js` parallele).
7. Une fois Rapier valide, supprimer la dependance `cannon-es` et le dossier
   `cannon/`.

## Points d'attention

- **Async init** : Vite supporte le top-level await avec `target: esnext`.
  Verifier `vite.config.js` au moment de la bascule.
- **Body proxies** : `body.position.y = X` fonctionne grace au Proxy, mais c'est
  plus couteux qu'un set Vec3 Cannon. A profiler en cas de soucis perf.
- **Substeps** : Rapier ne supporte pas le `maxSubSteps` Cannon. La constante
  `MAX_SUB_STEPS` est conservee pour le port mais ignoree.
- **ContactMaterial** : Rapier combine friction/restitution via `combineRule`
  (Average par defaut). Les coefficients par paire ball<->bumper, ball<->flipper
  ont ete portes mais peuvent diverger sur les materiaux mixtes.
