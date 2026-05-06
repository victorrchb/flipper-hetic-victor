/**
 * Rapier — barrel d'agregation.
 *
 * Conforme au contrat `ports/PhysicsPort.js`.
 *
 * Avant d'utiliser ce backend, main.js doit appeler :
 *
 *     import { initRapier } from "./adapters/physics/rapier/init.js";
 *     await initRapier();
 *
 * (idealement avant tout `createPhysicsWorld()`).
 */

export { initRapier, getRapier } from "./init.js";

export {
  FIXED_TIME_STEP,
  MAX_SUB_STEPS,
  MATERIALS,
  createPhysicsWorld,
  createStaticBoxBody,
  syncMeshesWithBodies,
} from "./world.js";

export {
  createBallBody,
  resetBallBody,
  launchBallBody,
  clampBallBody,
} from "./ballBody.js";

export {
  createFlipperBodies,
  setFlipperActive,
  updateFlippers,
  postStepFlippers,
} from "./flipperBody.js";

export { createBumperBodies } from "./bumperBody.js";
export { createSlingshotBodies } from "./slingshotBody.js";
export { attachCollisionListener } from "./collisionListener.js";
