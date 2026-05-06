/**
 * Cannon-es — barrel d'agregation du backend Cannon.
 *
 * Re-exporte les modules Cannon historiques situes dans `adapters/physics/*.js`
 * pour respecter le contrat defini dans `ports/PhysicsPort.js`.
 */
export {
  FIXED_TIME_STEP,
  MAX_SUB_STEPS,
  MATERIALS,
  createPhysicsWorld,
  createStaticBoxBody,
  syncMeshesWithBodies,
} from "../world.js";

export {
  BALL_RADIUS,
  createBallBody,
  resetBallBody,
  launchBallBody,
  clampBallBody,
} from "../ballBody.js";

export {
  createFlipperBodies,
  setFlipperActive,
  updateFlippers,
  postStepFlippers,
} from "../flipperBody.js";

export { createBumperBodies } from "../bumperBody.js";
export { createSlingshotBodies } from "../slingshotBody.js";
export { attachCollisionListener } from "../collisionListener.js";
