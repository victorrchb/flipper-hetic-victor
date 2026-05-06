/**
 * Rapier — collisions via EventQueue centralise.
 *
 * Cannon expose un listener par body (`body.addEventListener("collide")`).
 * Rapier pousse les collisions dans un `EventQueue` qu'on draine apres step.
 *
 * On enregistre la bille comme cible et on draine une fois par frame
 * juste apres `world.step()`. Pour rester compatible avec le contrat
 * du port, on attache un drain au step via un wrapper.
 */
import { bodyHandlesByRapierHandle } from "./bodyHandle.js";
import { BUMPER_REPULSE_FORCE } from "../../../domain/constants.js";

export function attachCollisionListener(ballBody, handler) {
  const world = ballBody.world;
  const ballRapierHandle = ballBody.rb.handle;

  // Wrapper du step qui draine l'EventQueue apres chaque step.
  const previousStep = world.step;
  world.step = (...args) => {
    previousStep(...args);

    const eventQueue = world.__eventQueue;
    eventQueue.drainCollisionEvents((h1, h2, started) => {
      if (!started) return;

      let otherHandle = null;
      if (h1 === ballRapierHandle) otherHandle = h2;
      else if (h2 === ballRapierHandle) otherHandle = h1;
      else return;

      // h1/h2 sont des collider handles ; on remonte au rigid body parent.
      const collider = world.getCollider(otherHandle);
      if (!collider) return;
      const otherRb = collider.parent();
      if (!otherRb) return;
      const otherBody = bodyHandlesByRapierHandle.get(otherRb.handle);
      if (!otherBody) return;

      const type = otherBody.userData?.type;
      handler.handleCollision(type, performance.now());

      if (type === "bumper") {
        // Repousse simple : direction bumper -> bille.
        const ballPos = ballBody.rb.translation();
        const bumperPos = otherRb.translation();
        const dx = ballPos.x - bumperPos.x;
        const dz = ballPos.z - bumperPos.z;
        const len = Math.hypot(dx, dz) || 1;
        ballBody.rb.applyImpulse(
          { x: (dx / len) * BUMPER_REPULSE_FORCE, y: 0, z: (dz / len) * BUMPER_REPULSE_FORCE },
          true,
        );
      }
    });
  };
}
