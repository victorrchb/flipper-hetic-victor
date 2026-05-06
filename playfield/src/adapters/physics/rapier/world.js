/**
 * Rapier — Monde + bodies statiques + sync mesh/body.
 *
 * Equivalents Cannon-es :
 *   - createPhysicsWorld()       -> RAPIER.World avec gravite inclinee
 *   - createStaticBoxBody()      -> RigidBodyDesc.fixed() + ColliderDesc.cuboid()
 *   - syncMeshesWithBodies()     -> idem (lit handle.position / handle.quaternion)
 *
 * Cf. ports/PhysicsPort.js pour le contrat.
 */
import { getRapier } from "./init.js";
import { createBodyHandle } from "./bodyHandle.js";

const TILT_DEG = 16;
const GRAVITY = 9.82;

export const FIXED_TIME_STEP = 1 / 120;
export const MAX_SUB_STEPS = 10; // Rapier n'a pas de substeps natifs ; on garde la constante pour le port

/**
 * Materiaux : Rapier n'a pas de "Material" objet partage. Friction/restitution
 * sont definies par Collider. On garde des marqueurs symboliques pour respecter
 * l'API Cannon, et chaque factory de body applique les bons coefficients.
 */
export const MATERIALS = {
  ball: { name: "ball", friction: 0.3, restitution: 0.35 },
  static: { name: "static", friction: 0.3, restitution: 0.35 },
  table: { name: "table", friction: 0.3, restitution: 0.2 },
  flipper: { name: "flipper", friction: 0.3, restitution: 0.8 },
  bumper: { name: "bumper", friction: 0.1, restitution: 0.8 },
};

export function createPhysicsWorld() {
  const RAPIER = getRapier();
  const tilt = (TILT_DEG * Math.PI) / 180;
  const gravity = {
    x: 0,
    y: -GRAVITY * Math.cos(tilt),
    z: GRAVITY * Math.sin(tilt),
  };
  const world = new RAPIER.World(gravity);
  world.timestep = FIXED_TIME_STEP;

  // EventQueue pour les collisions (utilise par collisionListener.js).
  world.__eventQueue = new RAPIER.EventQueue(true);

  // Wrapper de step compatible avec l'API Cannon (world.step(dt, delta, maxSubSteps))
  const rawStep = world.step.bind(world);
  world.step = (_fixedTimeStep, _delta, _maxSubSteps) => {
    rawStep(world.__eventQueue);
  };

  return world;
}

export function createStaticBoxBody(world, { width, height, depth, position, material, type = "wall", rotationY = 0 }) {
  const RAPIER = getRapier();
  const mat = MATERIALS[material] || MATERIALS.static;

  const bodyDesc = RAPIER.RigidBodyDesc.fixed()
    .setTranslation(position.x, position.y, position.z);

  if (rotationY !== 0) {
    const half = rotationY / 2;
    bodyDesc.setRotation({ x: 0, y: Math.sin(half), z: 0, w: Math.cos(half) });
  }

  const rb = world.createRigidBody(bodyDesc);

  const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
    .setFriction(mat.friction)
    .setRestitution(mat.restitution)
    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

  const collider = world.createCollider(colliderDesc, rb);

  return createBodyHandle(rb, world, {
    userData: { type },
    colliders: [collider],
  });
}

export function syncMeshesWithBodies(pairs) {
  for (const { mesh, body } of pairs) {
    const t = body.rb.translation();
    const q = body.rb.rotation();
    mesh.position.set(t.x, t.y, t.z);
    mesh.quaternion.set(q.x, q.y, q.z, q.w);
  }
}
