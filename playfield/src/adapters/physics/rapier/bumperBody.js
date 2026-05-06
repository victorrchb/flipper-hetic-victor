/**
 * Rapier — Bodies des bumpers.
 */
import {
  BUMPER_RADIUS,
  BUMPER_HEIGHT,
  BUMPER_POSITIONS,
} from "../../../domain/constants.js";
import { getRapier } from "./init.js";
import { createBodyHandle } from "./bodyHandle.js";

const BALL_BUMPER_FRICTION = 0.1;
const BALL_BUMPER_RESTITUTION = 0.8;

export function createBumperBodies(world) {
  const RAPIER = getRapier();
  const bodies = [];

  for (const pos of BUMPER_POSITIONS) {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed()
      .setTranslation(pos.x, BUMPER_HEIGHT / 2, pos.z);
    const rb = world.createRigidBody(bodyDesc);

    // Rapier `cylinder(half_height, radius)` autour de Y par defaut.
    const colliderDesc = RAPIER.ColliderDesc.cylinder(BUMPER_HEIGHT / 2, BUMPER_RADIUS)
      .setFriction(BALL_BUMPER_FRICTION)
      .setRestitution(BALL_BUMPER_RESTITUTION)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    world.createCollider(colliderDesc, rb);

    bodies.push(createBodyHandle(rb, world, { userData: { type: "bumper" } }));
  }

  return bodies;
}
