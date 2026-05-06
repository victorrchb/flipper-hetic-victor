/**
 * Port — contrat du moteur physique.
 *
 * Toute implementation (Cannon-es, Rapier, autre) doit exposer cette API
 * via un module `<engine>/index.js` re-exporte par le barrel
 * `adapters/physics/index.js`.
 *
 * Les bodies retournes par les factories doivent exposer au minimum :
 *   - `position`     : { x, y, z }                (lecture/ecriture pour main.js)
 *   - `quaternion`   : { x, y, z, w }             (lecture pour syncMeshesWithBodies)
 *   - `velocity`     : { x, y, z }                (lecture pour clamp ballBody)
 *   - `userData`     : { type: string, ... }      (utilise par collisions)
 *
 * Les wrappers Rapier doivent simuler cette forme via getters.
 *
 * ----------------------------------------------------------------------
 *
 * Module `world.js`
 *   FIXED_TIME_STEP : number   (ex: 1/120)
 *   MAX_SUB_STEPS   : number   (ex: 10)
 *   MATERIALS       : { ball, static, table, flipper, bumper } (engine-specific opaque)
 *
 *   createPhysicsWorld() -> world
 *     Cree le monde avec gravite inclinee (TILT_DEG ~16°).
 *     Le world doit exposer `step(dt, delta?, maxSubSteps?)` et `addBody(body)`.
 *
 *   createStaticBoxBody(world, { width, height, depth, position, material?, type?, rotationY? }) -> body
 *     Cree un corps statique boite, l'ajoute au monde, retourne le body.
 *
 *   syncMeshesWithBodies(pairs)
 *     Pour chaque { mesh, body }, copie body.position/quaternion vers le mesh Three.js.
 *
 * ----------------------------------------------------------------------
 *
 * Module `ballBody.js`
 *   BALL_RADIUS : number
 *
 *   createBallBody(world)            -> body  (avec ContactMaterial ball<->static)
 *   resetBallBody(body)              : remet la bille au spawn et la fige
 *   launchBallBody(body)             : applique l'impulsion, retourne true si lance
 *   clampBallBody(body)              : verrouille Y et plafonne la vitesse
 *
 * ----------------------------------------------------------------------
 *
 * Module `flipperBody.js`
 *   createFlipperBodies(world)       -> { left, right } (chaque cote = { body, restAngle, ... })
 *   setFlipperActive(flippers, side, active)
 *   updateFlippers(flippers)         : preStep (avant world.step)
 *   postStepFlippers(flippers)       : postStep (apres world.step)
 *
 * ----------------------------------------------------------------------
 *
 * Module `bumperBody.js`
 *   createBumperBodies(world) -> Body[]
 *
 * ----------------------------------------------------------------------
 *
 * Module `slingshotBody.js`
 *   createSlingshotBodies(world) -> Body[]
 *
 * ----------------------------------------------------------------------
 *
 * Module `collisionListener.js`
 *   attachCollisionListener(ballBody, handler)
 *     Branche un listener "collide" sur la bille. Pour chaque collision :
 *       - extrait `event.body.userData.type`
 *       - appelle `handler.handleCollision(type, performance.now())`
 *       - applique l'impulsion specifique aux bumpers
 */

export const PHYSICS_PORT_VERSION = 1;
